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
Dockerfile      # Image for the Python app
docker-compose.yml  # App + database services
.env.example    # Sample environment configuration
main.py         # Application entry point
```

## 🛠️ Setup & Installation

### 1. Prerequisites
*   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
*   Python 3.12+ and [uv](https://docs.astral.sh/uv/) (only for running locally without Docker)
*   [Ollama](https://ollama.com/) installed locally.
*   OpenAI API Key (for LLM).

### 2. Configure Ollama
Pull the embedding model:
```bash
ollama pull nomic-embed-text
```
Ensure Ollama is running (typically on `http://localhost:11434`).

### 3. Environment Configuration
Copy the sample file and fill in your values (`.env` is git-ignored):
```bash
cp .env.example .env
```
At minimum set `OPENAI_API_KEY`. Every variable in `.env` is injected into the Python app, both when run locally and when run via Docker Compose.

### 4. Run with Docker Compose (app + database)
`docker-compose.yml` defines two services:
*   `db`: PostgreSQL with pgvector (port `5432`).
*   `app`: the FastAPI backend, built from the `Dockerfile` (port `8000`). It waits for `db` to be healthy and loads your root `.env` file (optional).

```bash
docker compose up -d --build
docker compose exec app python scripts/init_db.py   # first run only
```
The `db` service is configurable from `.env` via `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` and `POSTGRES_PORT` (host port); defaults are `postgres` / `postgres` / `stellar_one` / `5432`. Note that Postgres only applies user/password/db on first initialization of the volume; run `docker compose down -v` to re-create it after changing them.

Inside the container, `DATABASE_URL` from `.env` is ignored (it usually points at `localhost`). Instead it defaults to the `db` service built from the `POSTGRES_*` values; set `DOCKER_DATABASE_URL` in `.env` to override it. Also, `OLLAMA_BASE_URL` defaults to `http://host.docker.internal:11434` (your host's Ollama). To use a different Ollama address from Docker, set `DOCKER_OLLAMA_BASE_URL` in `.env`. Other values from `.env` (e.g. `OPENAI_API_KEY`, `MAX_RETRIES`) pass through unchanged.

The API is then available at [http://localhost:8000/docs](http://localhost:8000/docs). To publish it on a different host port, set `APP_PORT` in `.env` (default `8000`).

### 5. Alternative: Run Locally
Start only the database, then run the app on your machine:
```bash
docker compose up -d db
uv sync
uv run scripts/reset_db.py   # initialize or reset the database
uv run uvicorn main:app --reload
```
*Note: If you already had the database initialized with 1536-dimension vectors, you will need to reset the tables (`reset_db.py`) to use the new 768-dimension vectors.*

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
