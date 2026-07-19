# Placeholder image so the stack boots on a fresh checkout. Replace with your
# own MCP server (Streamable HTTP transport) on port 3002 — keep the service
# name `mcp` in docker-compose.yml.
FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 3002
CMD ["node", "server.js"]
