import { handle } from "hono/aws-lambda";
import { server, registerRoutes, registerRemixMiddleware } from "./hono";
// import { serveStatic } from "@hono/node-server/serve-static";


registerRoutes(server);

// static file middleware to serve assets
// Lambda image cwd is different. Check Dockerfile.
// server.use("*", serveStatic({ root: "./deployed-workspace/public/" }));

registerRemixMiddleware(server);

export const handler = handle(server);
