# Stellar-One: Semantic Generation Engine

Stellar-One is a production-ready backend system designed to generate unique content using a template-based semantic engine. It ensures that every generated item is semantically distinct from previous entries within the same template by leveraging LLM embeddings and vector similarity searches.

## 🚀 Tech Stack

*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
*   **Orchestration:** [LangGraph](https://langchain-ai.github.io/langgraph/) for the retry-loop workflow.
*   **Database:** [PostgreSQL](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector).
*   **ORM:** [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Async).
*   **Embeddings:** [Ollama](https://ollama.com/) (Local, `nomic-embed-text`).
*   **LLM:** [OpenAI](https://openai.com/) (GPT-4o).

## 🧠 Core Logic: Semantic Uniqueness

The system follows a strict LangGraph-driven workflow for every generation request:

1.  **Generate Candidate:** The LLM generates a response based on the template's system prompt.
2.  **Embed Candidate:** The response is converted into a 768-dimension vector using Ollama.
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
*   Python 3.12+
*   [Ollama](https://ollama.com/) installed locally.
*   OpenAI API Key (for LLM).

### 2. Configure Ollama
Pull the embedding model:
```bash
ollama pull nomic-embed-text
```
Ensure Ollama is running (typically on `http://localhost:11434`).

### 3. Start the Database
Use Docker Compose to start the PostgreSQL instance with pgvector:
```bash
docker compose up -d
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/stellar_one
OPENAI_API_KEY=sk-...
OLLAMA_BASE_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text
MAX_RETRIES=5
SIMILARITY_THRESHOLD=0.30
```

### 5. Install Dependencies
```bash
uv sync
```

### 6. Initialize Database
*Note: If you already had the database initialized with 1536-dimension vectors, you will need to reset the tables to use the new 768-dimension vectors.*

To initialize or reset the database:
```bash
uv run scripts/reset_db.py
```

### 7. Run the Application
```bash
uv run uvicorn main:app --reload
```

## 📡 API Endpoints

### Documentation
*   **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
*   **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
*   **OpenAPI Spec:** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### Templates
*   `POST /templates`: Create a new generation template.
*   `GET /templates`: List all available templates.
*   `PUT /templates/{id}`: Update an existing template's name or prompt.
*   `DELETE /templates/{id}`: Delete a template and its history.

### Items (History)
*   `GET /items`: List all generated items across all templates.
*   `GET /templates/{id}/items`: List all items for a specific template.

### Generation
*   `POST /templates/{id}/generate`: Trigger the semantic generation workflow.
    *   **Returns:** The generated content, number of attempts, and similarity scores of the nearest neighbors.
