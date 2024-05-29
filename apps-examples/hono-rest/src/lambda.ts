import { handle } from "hono/aws-lambda";
import { server, registerRoutes } from "./hono";

registerRoutes(server);

export const handler = handle(server);
