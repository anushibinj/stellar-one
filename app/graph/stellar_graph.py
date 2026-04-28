import logging
import uuid
from typing import List, Dict, Any, TypedDict, Optional
from langgraph.graph import StateGraph, END
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.llm_service import llm_service
from app.services.embedding_service import embedding_service
from app.services.similarity_service import similarity_service
from app.config import settings

logger = logging.getLogger(__name__)

class GraphState(TypedDict):
    template_id: uuid.UUID
    system_prompt: str
    candidate_content: Optional[str]
    candidate_embedding: Optional[List[float]]
    similar_items: List[Dict[str, Any]]
    attempts: int
    max_retries: int
    threshold: float
    accepted: bool
    db_session: AsyncSession

async def generate_candidate(state: GraphState):
    logger.info(f"Attempt {state['attempts'] + 1}: Generating candidate")
    user_prompt = "Generate a new item based on the system prompt."
    
    if state['similar_items']:
        similar_contents = "\n".join([f"- {item['content']}" for item in state['similar_items']])
        user_prompt = f"""The following outputs are too similar:

{similar_contents}

Generate something completely different:
* Different structure
* Different wording
* Different punchline or idea"""

    content = await llm_service.generate_text(state['system_prompt'], user_prompt)
    return {"candidate_content": content, "attempts": state['attempts'] + 1}

async def embed_candidate(state: GraphState):
    logger.info("Embedding candidate")
    embedding = await embedding_service.embed_text(state['candidate_content'])
    return {"candidate_embedding": embedding}

async def similarity_search(state: GraphState):
    logger.info("Performing similarity search")
    similar_items = await similarity_service.find_similar_items(
        state['db_session'],
        state['template_id'],
        state['candidate_embedding']
    )
    return {"similar_items": similar_items}

def decision_node(state: GraphState):
    logger.info("Deciding whether to accept or retry")
    
    # If no similar items, or all similarity scores > threshold (meaning distance is large enough)
    # Cosine distance: 0 is identical, 2 is opposite. 
    # requirement: similarity < threshold -> retry. 
    # Usually similarity is 1 - distance. 
    # The requirement says: "If similarity < threshold -> retry". 
    # Using cosine distance <->, distance < threshold means they are TOO CLOSE.
    # So if distance > threshold, they are different enough.
    
    if not state['similar_items']:
        logger.info("No similar items found. Accepting.")
        return "accept"
    
    # Check if any item is too close
    is_too_similar = any(item['score'] < state['threshold'] for item in state['similar_items'])
    
    if not is_too_similar:
        logger.info("Candidate is unique enough. Accepting.")
        return "accept"
    
    if state['attempts'] >= state['max_retries']:
        logger.warning("Max retries reached. Accepting anyway to prevent infinite loop.")
        return "accept"
    
    logger.info("Candidate too similar. Retrying.")
    return "retry"

def create_stellar_graph():
    workflow = StateGraph(GraphState)

    workflow.add_node("generate", generate_candidate)
    workflow.add_node("embed", embed_candidate)
    workflow.add_node("similarity", similarity_search)

    workflow.set_entry_point("generate")
    
    workflow.add_edge("generate", "embed")
    workflow.add_edge("embed", "similarity")
    
    workflow.add_conditional_edges(
        "similarity",
        decision_node,
        {
            "accept": END,
            "retry": "generate"
        }
    )

    return workflow.compile()

stellar_graph = create_stellar_graph()
