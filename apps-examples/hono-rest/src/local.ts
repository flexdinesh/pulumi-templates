import { serve } from "@hono/node-server";
import { server, registerRoutes } from "./hono";

registerRoutes(server);

serve(server, (info) => {
  console.log(`Local server started at: http://localhost:${info.port}`);
});
