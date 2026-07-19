// Status / results endpoint — SKELETON.
//
// This is the small read-only service that lets a run be seen from outside
// the stack. /health already works. The other routes are stubs: wire them to
// your store and your MCP server. Keep the paths and the response shapes; fill
// in the bodies.
//
// It's fine to replace this service entirely (e.g. fold these routes into
// another service you already run) as long as the same paths answer on the
// published port.

import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8088;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://store:27017/blog';
const MCP_URL = process.env.MCP_URL || 'http://mcp:3002';

// GET /health — is the stack up. Returns 200 immediately; leave it working.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// GET /articles — the finished articles in the store, as JSON.
// TODO: read from your store (MONGO_URL) and return the articles your
// pipeline produced. One object per article; include the fields you store
// (e.g. the English rewrite, the Arabic translation, the SEO metadata, and a
// per-article status).
app.get('/articles', async (_req, res) => {
  // TODO: replace this stub with a real read from your store.
  res.status(501).json({ error: 'not implemented', hint: `read articles from ${MONGO_URL}` });
});

// GET /runs — the status of each pipeline run.
// TODO: return one entry per run. What you report per run is up to you — make
// it useful enough to see what happened on each run.
app.get('/runs', async (_req, res) => {
  // TODO: replace this stub with your run history.
  res.status(501).json({ error: 'not implemented', hint: 'report the status of each run' });
});

// POST /run — trigger a pipeline run.
// TODO: kick off your orchestrator (e.g. call the n8n webhook, or start your
// worker) so a run can be triggered without opening the n8n UI. Return
// something that identifies the run you started.
app.post('/run', async (_req, res) => {
  // TODO: trigger your pipeline here.
  res.status(501).json({ error: 'not implemented', hint: 'trigger a pipeline run' });
});

// GET /mcp/tools — the tools your MCP server exposes.
// TODO: introspect your MCP server (MCP_URL) and return its tool list — the
// names, descriptions, and input schemas — so the tools can be seen without
// attaching a client.
app.get('/mcp/tools', async (_req, res) => {
  // TODO: replace this stub with a real read from your MCP server.
  res.status(501).json({ error: 'not implemented', hint: `introspect the MCP server at ${MCP_URL}` });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`gateway listening on :${PORT}`);
});
