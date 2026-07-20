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
import { MongoClient } from "mongodb";
import axios from "axios";
import { listTools, callMcpTool } from "./services/mcp.js";



const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8088;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://store:27017/blog';
const MCP_URL = process.env.MCP_URL || 'http://mcp:3002';
const WORKER_URL = process.env.WORKER_URL || "http://worker:8000";

const client = new MongoClient(MONGO_URL);
await client.connect();
const db = client.db();
const articles = db.collection("articles");
const runs = db.collection("runs");

// GET /health — is the stack up. Returns 200 immediately; leave it working.
app.get("/health", (_,res)=>{

    res.json({
        status:"ok",
        service:"gateway"
    });

});

// GET /articles — the finished articles in the store, as JSON.
// TODO: read from your store (MONGO_URL) and return the articles your
// pipeline produced. One object per article; include the fields you store
// (e.g. the English rewrite, the Arabic translation, the SEO metadata, and a
// per-article status).
app.get("/articles", async (_, res) => {

    const docs = await articles
        .find({})
        .project({_id:0})
        .toArray();

    res.json(docs);

});

// GET /runs — the status of each pipeline run.
// TODO: return one entry per run. What you report per run is up to you — make
// it useful enough to see what happened on each run.
app.get("/runs", async (_, res) => {

    const docs = await runs
        .find({})
        .project({_id:0})
        .toArray();

    res.json(docs);

});

// POST /run — trigger a pipeline run.
// TODO: kick off your orchestrator (e.g. call the n8n webhook, or start your
// worker) so a run can be triggered without opening the n8n UI. Return
// something that identifies the run you started.
app.post("/run", async (_, res) => {

    try {

        const response = await axios.post(
            `${WORKER_URL}/run`
        );

        res.json(response.data);

    } catch (err) {

        res.status(500).json({
            error:"Unable to start pipeline"
        });

    }

});

// GET /mcp/tools — the tools your MCP server exposes.
// TODO: introspect your MCP server (MCP_URL) and return its tool list — the
// names, descriptions, and input schemas — so the tools can be seen without
// attaching a client.
app.get("/mcp/tools", async (_, res) => {
    try {
        const tools = await listTools();
        res.json(tools);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Unable to fetch MCP tools"
        });
    }
});

app.get("/mcp/list_runs", async (_, res) => {
    const result = await callMcpTool("list_runs");
    res.json(result);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`gateway listening on :${PORT}`);
});
