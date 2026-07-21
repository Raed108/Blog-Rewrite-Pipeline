# Blog Rewrite Pipeline

A production-inspired content processing pipeline that transforms English real-estate blog posts into publish-ready bilingual articles.

The system automatically:

- Scrapes blog posts
- Rewrites the English content
- Translates the rewritten article into Arabic
- Generates SEO metadata
- Stores processed articles in MongoDB
- Exposes the pipeline through REST APIs and the Model Context Protocol (MCP)

The project was built as part of the Forsa Property Blog Rewrite Pipeline take-home assignment.

---

# Architecture

```
                        +--------------------+
                        |       n8n          |
                        | Manual / Schedule  |
                        +---------+----------+
                                  |
                                  |
                                  v
                        +--------------------+
                        |      Worker        |
                        |   FastAPI (Python) |
                        +---------+----------+
                                  |
            +---------------------+----------------------+
            |                     |                      |
            v                     v                      v
      Seed Blog             Mock LLM              MongoDB Atlas
   (Sample Articles)     Rewrite / SEO          Articles & Runs

                                  ^
                                  |
                    +-------------+-------------+
                    |                           |
            +-------+--------+         +--------+-------+
            |    Gateway     |         |   MCP Server   |
            |   REST API     |         | Streamable MCP |
            +----------------+         +----------------+
```

---

# Features

- Scrape blog posts from the provided seed blog
- Rewrite English content
- Arabic translation
- SEO title generation
- URL slug generation
- Meta description generation
- Automatic tags
- MongoDB persistence
- Pipeline run history
- REST API
- MCP Server (Streamable HTTP)
- Docker Compose support
- Railway deployment
- n8n orchestration
- Manual and scheduled execution

---

# Technology Stack

## Backend

- FastAPI
- Python 3.12
- Express.js
- Node.js

## AI

- Local OpenAI-compatible Mock LLM

## Database

- MongoDB Atlas

## Workflow

- n8n

## Protocol

- Model Context Protocol (MCP)
- Official `@modelcontextprotocol/sdk`

## Deployment

- Railway

---

# Project Structure

```
starter-stack-agentic/
│
├── gateway/              # Public REST API
├── worker/               # Pipeline implementation
├── mcp-server/           # MCP Server
├── mock-llm/             # Local OpenAI-compatible model
├── seed-blog/            # Sample blog source
├── workflow/             # n8n workflow
│
├── docker-compose.yml
├── README.md
├── REVIEW.md
├── PROMPTS.md
└── mcp-config.json
```

---

# Pipeline Flow

1. Discover blog posts from the Seed Blog
2. Extract title, author, published date and body
3. Rewrite the article in English
4. Translate into Arabic
5. Generate SEO metadata
6. Store the processed article
7. Record pipeline execution

---

# REST API

## Health

```
GET /health
```

Returns the application status.

---

## Trigger Pipeline

```
POST /run
```

Starts a complete processing run.

---

## List Articles

```
GET /articles
```

Returns all processed articles.

---

## List Runs

```
GET /runs
```

Returns the execution history.

---

## MCP Tools

```
GET /mcp/tools
```

Returns all tools exposed by the MCP server.

---

# MCP Tools

The MCP server exposes five tools.

| Tool | Description |
|-------|-------------|
| health | Worker health status |
| run_pipeline | Execute the full pipeline |
| list_articles | Retrieve processed articles |
| get_article | Retrieve a single article by slug |
| list_runs | Retrieve pipeline execution history |

---

# Running Locally

Clone the repository

```bash
git clone <repository>
cd starter-stack-agentic
```

Copy the environment file

```bash
cp .env.example .env
```

Start the stack

```bash
docker compose up --build
```

The services become available at:

| Service | URL |
|----------|-----|
| Gateway | http://localhost:8088 |
| n8n | http://localhost:5678 |
| MCP | http://localhost:3002/mcp |

---

# Environment Variables

| Variable | Description |
|----------|-------------|
| MONGO_URL | MongoDB connection string |
| LLM_BASE_URL | OpenAI-compatible endpoint |
| LLM_MODEL | LLM model name |
| LLM_API_KEY | API key |
| SEED_BLOG_URL | Seed blog URL |
| MCP_URL | MCP server URL |
| WORKER_URL | Worker service URL |

---

# Deployment

The application is deployed on Railway.

Deployment architecture:

- Public
  - Gateway
  - MCP Server

- Private
  - Worker
  - Mock LLM
  - Seed Blog

- Managed
  - MongoDB Atlas

Private Railway networking is used for service-to-service communication.

---

# End-to-End Verification

The following endpoints were verified after deployment.

- GET /health
- GET /articles
- GET /runs
- POST /run
- GET /mcp/tools

The MCP server was also verified using an MCP client.

---

# Bonus

The n8n workflow was extended beyond the starter template by adding:

- Manual Trigger
- Schedule Trigger
- HTTP Request node
- Conditional (IF) node
- Logging/Formatting nodes
- MCP integration support

---

# Additional Documentation

- **REVIEW.md** — Architecture decisions, trade-offs and future work.
- **PROMPTS.md** — Development prompt history.
- **mcp-config.json** — MCP client configuration.

---

# License

This project was developed as part of the Forsa Property Blog Rewrite Pipeline take-home assignment.