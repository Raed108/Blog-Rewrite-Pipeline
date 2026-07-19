// Placeholder MCP server — REPLACE THIS.
//
// Your task includes exposing an MCP server (your own code) with tools over
// the pipeline and its store, using Streamable HTTP transport, reachable at
// http://mcp:3002 on the compose network. This file only keeps the container
// alive so the rest of the starter stack boots on a fresh checkout.

import http from 'node:http';

const PORT = process.env.PORT || 3002;

http
  .createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'placeholder', note: 'replace with your MCP server' }));
  })
  .listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`placeholder mcp-server listening on :${PORT}`);
  });
