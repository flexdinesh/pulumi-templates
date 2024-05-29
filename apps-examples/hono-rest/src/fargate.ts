import { serve } from "@hono/node-server";
import { server, registerRoutes } from "./hono";

/* 
  Servers need to be running on port 80 in containers.
  Either that or we need to bind the port to 80 properly.
*/
const PORT = 80;

registerRoutes(server);

serve({ port: PORT, ...server });
