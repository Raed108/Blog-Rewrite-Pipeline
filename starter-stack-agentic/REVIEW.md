# REVIEW

## Architecture

The solution is composed of six services:

- Worker (FastAPI)
- Gateway (Express)
- MCP Server (Node.js)
- Mock LLM
- Seed Blog
- n8n

MongoDB Atlas is used as the persistent database.

The Worker contains the actual business logic of the pipeline:

1. Scrape seed blog
2. Rewrite article
3. Translate to Arabic
4. Generate SEO metadata
5. Store processed article
6. Record pipeline run

The Gateway exposes the public REST API required by the assignment.

The MCP Server exposes the pipeline through the Model Context Protocol using the official Streamable HTTP transport.

n8n serves as the orchestration layer and provides both manual and scheduled execution of the pipeline.

---

## Why the orchestration lives inside the Worker

Although the assignment ships with n8n, I chose to keep the business logic inside the Python Worker.

Reasons:

- Pipeline logic stays version-controlled as code.
- Better for unit test.
- Easier to reuse from REST endpoints and MCP tools.
- The same orchestration can be triggered by:
  - REST
  - MCP
  - n8n
  - future automation

n8n therefore acts as the external workflow orchestrator rather than containing the business logic itself.

---

## Why Node.js for the MCP Server

The starter project already included a Node.js MCP server.

I decided to extend it instead of rewriting it because:

- the official MCP SDK is most mature in TypeScript/JavaScript
- Streamable HTTP examples are primarily written for Node
- less deviation from the provided starter stack

---

## Deployment

The application was deployed on Railway.

Services:

- Gateway (public)
- MCP Server (public)
- Worker (private)
- Mock LLM (private)
- Seed Blog (private)

MongoDB Atlas is used instead of the local Mongo container for persistence.

Private Railway networking is used for inter-service communication.

---

## Trade-offs

### Business logic inside Worker

Pros

- reusable
- testable
- easier debugging

Cons

- n8n workflow becomes thinner

---

### MongoDB Atlas

Pros

- persistent
- production-ready

Cons

- differs from local Docker MongoDB

---

### MCP

The MCP server maintains a dedicated Streamable HTTP session for every client and exposes five production tools.

---

## Known limitations

- Authentication is not implemented.
- No retry mechanism for failed posts.

---

## Future improvements

Given additional time I would implement:

- concurrent article processing
- Redis queue (Celery / BullMQ)
- retries with exponential backoff
- authentication for MCP tools
- structured logging
- metrics (Prometheus)
- tracing (OpenTelemetry)
- duplicate detection
- incremental processing
- CI/CD pipeline