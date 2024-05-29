import { serve } from "@hono/node-server";
import { server, registerRoutes, registerRemixMiddleware } from "./hono";
import { serveStatic } from "@hono/node-server/serve-static";

registerRoutes(server);

// static file middleware to serve assets
server.use("*", serveStatic({ root: "./public/" }));

registerRemixMiddleware(server);

serve(server, (info) => {
  console.log(`Local server started at: http://localhost:${info.port}`);
});
