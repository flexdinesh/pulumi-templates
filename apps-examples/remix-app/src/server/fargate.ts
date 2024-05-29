import { serve } from "@hono/node-server";
import { server, registerRoutes, registerRemixMiddleware } from "./hono";
// import { serveStatic } from "@hono/node-server/serve-static";

/*
  Servers need to be running on port 80 in containers.
  Either that or we need to bind the port to 80 properly.
*/
const PORT = 80;

registerRoutes(server);

// static file middleware to serve assets
// server.use("*", serveStatic({ root: "./public/" }));

registerRemixMiddleware(server);

serve({ port: PORT, ...server });
