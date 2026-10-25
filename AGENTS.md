# Architecture Notes

## Agent integrations (MCP)
- App-hosted MCP server is not supported for this project: the backend is a user-managed (BYO) Supabase instance, and Lovable cannot deploy the MCP edge function there. Do not install `@lovable.dev/mcp-js` or add MCP routes/plugins.
- Agent integration is browser-local WebMCP tools only (`use-webmcp-tool` hook) registered in page components that own visible controls; wrap every `execute` body with `runWebMCPTool` from `src/lib/webmcp-telemetry.ts`.

## Stack
- Plain Vite React SPA with `react-router-dom` (`src/router.tsx`), not TanStack Start; do not add TanStack Start routes or `src/routes/`.
- Core data flows through React contexts (`TaskContext`, `ClientContext`) backed by localStorage; Supabase is user-managed (connection in `src/integrations/supabase/client.ts`).
