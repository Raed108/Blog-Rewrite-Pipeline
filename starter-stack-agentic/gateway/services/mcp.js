import axios from "axios";
import crypto from "node:crypto";

const MCP_URL = process.env.MCP_URL || "http://mcp:3002";

let sessionId = null;

async function initialize() {

    if (sessionId) {
        return sessionId;
    }

    const response = await axios.post(
        `${MCP_URL}/mcp`,
        {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2025-03-26",
                capabilities: {},
                clientInfo: {
                    name: "gateway",
                    version: "1.0.0"
                }
            }
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream"
            }
        }
    );

    sessionId = response.headers["mcp-session-id"];

    if (!sessionId) {
        throw new Error("MCP server did not return a session id.");
    }

    return sessionId;
}

export async function listTools() {

    const id = await initialize();

    const response = await axios.post(
        `${MCP_URL}/mcp`,
        {
            jsonrpc: "2.0",
            id: crypto.randomUUID(),
            method: "tools/list",
            params: {}
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream",
                "mcp-session-id": id
            }
        }
    );

    const raw = response.data;

    const json = JSON.parse(
        raw.replace("event: message", "")
        .replace("data:", "")
        .trim()
    );

    return json.result.tools;
}


export async function callMcpTool(name, arguments_ = {}) {

    const id = await initialize();

    const response = await axios.post(
        `${MCP_URL}/mcp`,
        {
            jsonrpc: "2.0",
            id: crypto.randomUUID(),
            method: "tools/call",
            params: {
                name,
                arguments: arguments_
            }
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream",
                "mcp-session-id": id
            }
        }
    );

    const raw = response.data;

    const json = JSON.parse(
        raw
            .replace("event: message", "")
            .replace("data:", "")
            .trim()
    );

    return json.result;
}