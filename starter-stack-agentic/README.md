# Starter stack — Blog Rewrite Pipeline

This is the stack we ship with the take-home. It's yours to build on: it gives
you the one-command Docker setup, the orchestrator, a store, the local sample
blog, a status endpoint skeleton, and a bundled local language model — so you
spend your time on the pipeline, not on plumbing.

Read the full task in the brief you were sent. This README is just how to run
and extend the stack.

## One command

```bash
cp .env.example .env      # defaults work offline as-is; no keys needed
docker compose up
```

That brings up the whole stack. Give it a minute on the first run while images
build and the store comes up healthy.

Once it's up:

- **n8n (orchestrator):** http://127.0.0.1:5678
- **Status endpoint:** http://127.0.0.1:8088 (try `GET /health`)

Everything else — the store, the sample blog, your MCP server, the bundled
language model — runs on the internal network and isn't published to your
machine.

## What's in the box

| Piece | Service | What it is |
|---|---|---|
| Orchestrator | `n8n` | n8n, with a trigger-only workflow already imported. Extend it into your pipeline. |
| Store | `store` | MongoDB 7. Swap it for another store you prefer — just note it in `REVIEW.md`. |
| Sample blog | `seed-blog` | Serves the sample posts at `http://seed-blog/` on the internal network. Read only. |
| Status endpoint | `gateway` | A small read-only service (see below). Skeleton — you fill it in. |
| Language model | `mock-llm` | A bundled local, OpenAI-compatible model so the stack runs offline (see below). |
| MCP server | `mcp` | A placeholder. Replace it with your own MCP server. |

## What you build

On top of this stack, build the pipeline described in the brief: read the
sample posts, produce for each one an English rewrite, an Arabic translation,
and SEO metadata, and store the result. Then expose your own **MCP server**
(Streamable HTTP transport, on `http://mcp:3002` inside the network) with tools
over the pipeline and its store, and ship an `mcp-config.json` so a client can
attach to it.

Concretely, the folders you'll touch:

- **`workflow/`** — the n8n workflow. `blog-pipeline.trigger.json` is a
  trigger-only starting point; build your pipeline out from there. (Or drive
  the pipeline from a small worker/script instead, and say why in `REVIEW.md`.)
- **`mcp-server/`** — replace the placeholder with your MCP server. Keep the
  service name `mcp` and port `3002`.
- **`gateway/`** — fill in the stubbed routes (see below).

The sample posts in `../seed-fixture-agentic/` are **read only** — process
them, don't edit them.

## Triggering a run

Two ways, your choice:

- **From n8n:** open http://127.0.0.1:5678, open the workflow, run it.
- **From the status endpoint:** wire `POST /run` to kick off your orchestrator
  so a run can be triggered without opening the UI. (It's stubbed for you.)

## Where output lands

Your pipeline stores finished articles in the **store** (`MONGO_URL`, default
`mongodb://store:27017/blog`). The status endpoint is how that gets seen from
outside the stack — wire it to your store and MCP server:

- `GET /health` — is the stack up. (Already works; leave it working.)
- `GET /articles` — the finished articles in the store.
- `GET /runs` — the status of each pipeline run.
- `POST /run` — trigger a pipeline run.
- `GET /mcp/tools` — the tools your MCP server exposes.

The skeleton is in `gateway/server.js` with a `TODO` on each route. You may
replace the service entirely as long as the same paths answer on port `8088`.

## The language model + credentials

The stack points at a **bundled local model** (`mock-llm`) by default, so
`docker compose up` works offline with no credentials and gives the same output
every time. Your pipeline should talk to it over the OpenAI chat-completions
shape (`POST {LLM_BASE_URL}/chat/completions`).

**We supply a language-model endpoint and key at grading time via an env
file.** Read `LLM_BASE_URL`, `LLM_MODEL`, and `LLM_API_KEY` from the
environment (they're in `.env.example`) and **do not hardcode credentials**
anywhere — not in your pipeline code and not in the workflow JSON. Point your
pipeline at those env vars and it works against either the bundled model or the
one supplied at grading time.

## Importing the n8n workflow (if it doesn't auto-load)

The trigger workflow in `workflow/` is mounted read-only into n8n and imported
on first boot. If you don't see it, import it by hand: in the n8n UI, open the
workflows menu → **Import from File** → pick
`workflow/blog-pipeline.trigger.json`. From there, add your nodes and save.

## Deploying to a live host

For submission you deploy this stack to a live host and share the URL (see the brief). The graded
run uses the **bundled `mock-llm`** by default, so the stack stays offline and deterministic with
no API key. When you deploy, make sure the **gateway (`:8088`) and your MCP server (`:3002`) are
publicly reachable** — locally they are bound to `127.0.0.1`, so you will need to expose them on
your host (bind `0.0.0.0` / publish the ports / put them behind your host's proxy). Everything else
(store, seed-blog, mock-llm) can stay internal to the compose network.

## Handy commands

```bash
docker compose up            # start everything (foreground)
docker compose up -d         # start in the background
docker compose logs -f n8n   # follow a service's logs
docker compose down          # stop
docker compose down -v       # stop and wipe the store + n8n data (fresh start)
```
