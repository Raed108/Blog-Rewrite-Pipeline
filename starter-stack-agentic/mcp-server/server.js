import express from "express";

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport }
from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import crypto from "node:crypto";

import { health } from "./tools/health.js";
import { runPipeline } from "./tools/runPipeline.js";
import { listArticles } from "./tools/listArticles.js";
import { listRuns } from "./tools/listRuns.js";
import { getArticle } from "./tools/getArticle.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3002;

/*
|--------------------------------------------------------------------------
| Create MCP Server
|--------------------------------------------------------------------------
*/

function createServer() {
    const server = new McpServer({
        name: "blog-rewrite-pipeline",
        version: "1.0.0",
    });

    /*
    |--------------------------------------------------------------------------
    | Register tools
    |--------------------------------------------------------------------------
    */

    server.registerTool("health",
        {
            description: "Check worker health",
            inputSchema: z.object({})
        },
        async () => {
            return await health();
        }
    );

    server.registerTool("run_pipeline",
        {
            description: "Run the complete blog pipeline.",
            inputSchema: z.object({})
        },
        async () => {
            return await runPipeline();
        }
    );

    server.registerTool("list_articles",
        {
            description: "List all processed articles.",
            inputSchema: z.object({})
        },
        async () => {
            return await listArticles();
        }
    );

    server.registerTool("get_article",
        {
            description: "Get article by SEO slug.",
            inputSchema: z.object({
                slug: z.string()
            })
        },
        async ({ slug }) => {
            return await getArticle(slug);
        }
    );

    server.registerTool("list_runs",
        {
            description: "List pipeline execution history.",
            inputSchema: z.object({})
        },
        async () => {
            return await listRuns();
        }
    );

    return server;
}
/*
|--------------------------------------------------------------------------
| Streamable HTTP endpoint
|--------------------------------------------------------------------------
*/

const transports = new Map();

app.post("/mcp", async (req, res) => {

    const sessionId = req.headers["mcp-session-id"];

    let transport;

    if (sessionId && transports.has(sessionId)) {
        transport = transports.get(sessionId);
    }
    else if (!sessionId && isInitializeRequest(req.body)) {

        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => crypto.randomUUID(),
            onsessioninitialized: (id) => {
                transports.set(id, transport);
            }
        });

        const server = createServer();
        await server.connect(transport);

        transport.onclose = () => {
            transports.delete(transport.sessionId);
        };
    }
    else {

        return res.status(400).json({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Bad Request: No valid session"
            },
            id: null
        });

    }

    await transport.handleRequest(req, res, req.body);
});

app.delete("/mcp", async (req, res) => {

    const sessionId = req.headers["mcp-session-id"];

    const transport = transports.get(sessionId);

    if (transport) {
        await transport.close();
        transports.delete(sessionId);
    }

    res.status(204).end();
});

// app.post("/invoke/run_pipeline", async (req, res) => {
//     return await runPipeline();
// })

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get("/health", (_, res) => {
    res.json({
        status: "ok",
    });
});

app.listen(PORT, () => {
    console.log(`MCP Server listening on ${PORT}`);
});