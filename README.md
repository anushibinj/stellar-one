# Stellar-One: Semantic Generation Engine

Stellar-One is a production-ready backend system designed to generate unique content using a template-based semantic engine. It ensures that every generated item is semantically distinct from previous entries within the same template by leveraging LLM embeddings and vector similarity searches.

## 🚀 Tech Stack

*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
*   **Orchestration:** [LangGraph](https://langchain-ai.github.io/langgraph/) for the retry-loop workflow.
*   **Database:** [PostgreSQL](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector).
*   **ORM:** [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Async).
*   **LLM & Embeddings:** [OpenAI](https://openai.com/) (GPT-4o & Text-Embedding-3).

## 🧠 Core Logic: Semantic Uniqueness

The system follows a strict LangGraph-driven workflow for every generation request:

1.  **Generate Candidate:** The LLM generates a response based on the template's system prompt.
2.  **Embed Candidate:** The response is converted into a 1536-dimension vector.
3.  **Similarity Search:** The system performs a cosine distance search (`<->`) in PostgreSQL to find the top 3 most similar items.
4.  **Decision Node:**
    *   If **Distance > Threshold (0.30)**: The item is accepted and stored.
    *   If **Distance < Threshold**: The item is rejected. The system retries by providing the LLM with the conflicting content and asking for something "completely different."
5.  **Safety Catch:** To prevent infinite loops, the system will accept the best candidate after **MAX_RETRIES (5)**.

## 📁 Project Structure

```text
/app
  /api          # FastAPI endpoints (Templates, Generation)
  /db           # Session management
  /graph        # LangGraph workflow definition
  /models       # SQLAlchemy pgvector models
  /schemas      # Pydantic validation schemas
  /services     # LLM, Embedding, and Similarity logic
/scripts        # Database initialization
main.py         # Application entry point
```

## 🛠️ Setup & Installation

### 1. Prerequisites
*   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
*   Python 3.11+
*   OpenAI API Key.

### 2. Start the Database
Use Docker Compose to start the PostgreSQL instance with pgvector:
```bash
docker compose up -d
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/stellar_one
OPENAI_API_KEY=sk-...
MAX_RETRIES=5
SIMILARITY_THRESHOLD=0.30
```

### 4. Install Dependencies
```bash
uv sync
```

### 5. Initialize Database
```bash
uv run scripts/init_db.py
```

### 6. Run the Application
```bash
uv run uvicorn main:app --reload
```

## 📡 API Endpoints

### Templates
*   `POST /templates`: Create a new generation template (e.g., "Dad Jokes").
*   `GET /templates`: List all available templates.

### Generation
*   `POST /templates/{id}/generate`: Trigger the semantic generation workflow.
    *   **Returns:** The generated content, number of attempts, and similarity scores of the nearest neighbors.

## 📝 Example Request
**POST /templates**
```json
{
  "name": "Sci-Fi Concepts",
  "system_prompt": "You are a creative sci-fi writer. Generate a unique futuristic technology concept."
}
```

**POST /templates/{uuid}/generate**
```json
{
  "content": "Quantum-entangled communication spores...",
  "attempts": 2,
  "similar_items": [
    {"content": "...", "score": 0.45}
  ]
}
```
