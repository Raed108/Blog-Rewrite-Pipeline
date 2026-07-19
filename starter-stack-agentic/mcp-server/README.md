# mcp-server (your code goes here)

This folder is a placeholder. Replace it with your own MCP server.

- It must implement **Streamable HTTP** transport (per the current MCP spec)
  so a real MCP client can connect to it over the network.
- It listens on port **3002** inside the compose network (`http://mcp:3002`);
  the compose file already routes to it under the service name `mcp`.
- Expose tools over the pipeline and its store.
- Ship an `mcp-config.json` at the repo root with the connection config, so a
  client can attach.

The placeholder `server.js` + `Dockerfile` here just keep the container alive
so the rest of the stack boots on a fresh checkout. Delete them once your
server is in place (keep the service name `mcp` and port `3002`).
