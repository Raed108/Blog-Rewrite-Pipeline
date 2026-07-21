# PROMPTS.md

This document contains representative prompts and discussions used throughout the development of this project.

The goal is to document the actual engineering workflow used to build the solution rather than only presenting the final implementation.

---

# Phase 1 — Understanding the Assignment

## Understanding the requirements

> Read the assignment carefully and explain exactly what is required, including mandatory features, optional bonus points, expected architecture, deliverables, and grading criteria.

---

## Breaking the project into milestones

> Divide this assignment into logical development phases so the implementation can be completed incrementally.

This resulted in the following roadmap:

- Worker
- Pipeline
- Database
- MCP Server
- Gateway
- n8n
- Deployment
- Documentation

---

# Phase 2 — Designing the Architecture

## High-level system architecture

> Design a production-ready architecture using FastAPI, MongoDB, n8n, MCP, Docker Compose, and a Gateway.

Topics discussed:

- service boundaries
- separation of responsibilities
- communication between services
- scalability
- deployment strategy

---

## Choosing technologies

Several technology decisions were discussed.

Examples:

> Should MongoDB remain inside Docker or be moved to Atlas?

> Should the MCP server be implemented in Python or Node.js?

> Should orchestration live inside n8n or inside the Python worker?

Each decision included trade-off discussions before implementation.

---

# Phase 3 — Worker Service

## FastAPI application

> Implement the FastAPI application exposing:

- /health
- /posts
- /test-llm
- /test-db
- /run

---

## Blog scraper

> Build a scraper capable of discovering every blog post and extracting:

- title
- author
- publication date
- article body

Discussion topics included:

- HTML parsing
- URL discovery
- reusable scraping service

---

## LLM Integration

Several prompts focused on designing reusable LLM services.

Examples:

> Implement a client responsible for rewriting articles.

> Implement Arabic translation.

> Generate SEO metadata including:

- SEO title
- slug
- meta description
- tags

---

## Pipeline

> Design a reusable pipeline capable of processing one article independently.

Later expanded to:

> Create an orchestrator capable of processing all discovered articles while tracking execution status.

---

## Database

Discussions included:

- article schema
- SEO metadata schema
- pipeline run schema
- MongoDB indexes
- duplicate handling

---

# Phase 4 — MCP Server

This became one of the largest implementation phases.

---

## Technology discussion

> Should the MCP server remain in Node.js or be rewritten in Python?

After discussing maintainability and SDK maturity, Node.js was selected.

Reasons:

- official SDK maturity
- starter project compatibility
- Streamable HTTP examples
- easier future maintenance

---

## MCP Project Structure

Designed the following structure:

```
mcp-server/

server.js

tools/

services/

utils/
```

---

## Tool Design

Each MCP tool was implemented individually.

Examples:

> Implement health tool.

> Implement run_pipeline tool.

> Implement list_articles tool.

> Implement get_article tool.

> Implement list_runs tool.

---

## Input Validation

Discussion:

> Should raw JSON schemas be used or should Zod schemas be adopted?

Result:

Zod was selected for all tool input validation.

---

## Streamable HTTP

Several discussions focused on:

- session lifecycle
- initialization
- transport management
- client compatibility
- MCP specification

---

# Phase 5 — Gateway

Implemented required endpoints.

Discussion topics included:

- exposing MongoDB data
- triggering pipeline execution
- communicating with the MCP server
- exposing MCP tools

Endpoints implemented:

GET /health

GET /articles

GET /runs

POST /run

GET /mcp/tools

---

## MCP Client inside Gateway

Several prompts focused on:

- initializing MCP sessions
- tool invocation
- parsing Streamable HTTP responses
- session cleanup

Multiple debugging sessions were required before the final implementation worked correctly.

---

# Phase 6 — n8n

Initial discussion:

> Is n8n enough by itself or should business logic remain inside Python?

Decision:

Business logic remained inside the Worker.

n8n became the orchestration layer responsible for:

- manual execution
- scheduled execution
- workflow monitoring

---

## Workflow Improvement

The starter workflow was expanded.

Added:

- Manual Trigger
- Schedule Trigger
- Merge
- HTTP Request
- IF node
- logging
- Slack notifications

---

## Bonus Requirement

Discussion:

> Implement the optional bonus by allowing n8n to invoke an MCP tool instead of directly calling the Worker.

---

# Phase 7 — Docker

Several prompts focused on improving the Docker setup.

Examples:

> Review every Dockerfile.

> Improve build speed.

> Ensure reproducible builds.

> Verify environment variables.

---

# Phase 8 — Deployment

This phase contained the largest amount of debugging.

Topics included:

---

## Railway deployment strategy

Discussion:

> Which services should be public?

Final architecture:

Public:

- Gateway
- MCP Server

Private:

- Worker
- Seed Blog
- Mock LLM

Managed:

- MongoDB Atlas

---

## Private Networking

Discussions covered:

- internal DNS
- Railway service names
- networking
- environment variables

---

## Seed Blog

Several deployment issues were solved including:

- nginx configuration
- Dockerfile
- serving static files
- Railway build configuration

---

## Worker

Discussions included:

- Docker deployment
- FastAPI startup
- environment variables
- MongoDB connectivity
- internal networking

---

## MCP

Several debugging sessions covered:

- session initialization
- Accept headers
- Streamable HTTP
- tool registration
- public endpoint
- Railway deployment

---

## Gateway

Topics included:

- MCP communication
- Worker communication
- endpoint validation

---

# Phase 9 — Testing

A complete testing checklist was prepared.

Testing covered:

## Local Docker Compose

- service startup
- worker
- gateway
- MCP
- MongoDB

---

## Railway

Verified:

- /health
- /articles
- /runs
- /run
- /mcp/tools

---

## MCP

Verified using:

- MCP initialization
- tool discovery
- tool invocation

---

# Phase 10 — Documentation

Discussions focused on preparing:

REVIEW.md

PROMPTS.md

mcp-config.json

---

# General Development Assistance

Throughout development, AI assistance was used for:

- architecture reviews
- technology selection
- implementation planning
- debugging
- deployment
- testing
- documentation
- code review
- trade-off analysis

Every implementation produced through these discussions was reviewed, adapted, tested, and integrated into the final solution before being committed.