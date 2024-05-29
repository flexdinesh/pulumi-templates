import * as build from "../../build/index.js";
import { Hono } from "hono";
import { remix } from "./remix-middleware.js";
import { logger } from "hono/logger";

/* type your env bindings here */
// eslint-disable-next-line @typescript-eslint/ban-types
type Bindings = {};
/* type your Hono variables (used with ctx.get/ctx.set) here */
// eslint-disable-next-line @typescript-eslint/ban-types
type Variables = {};
type ContextEnv = { Bindings: Bindings; Variables: Variables };

export const server = new Hono<ContextEnv>();
type ServerType = typeof server;

export const registerRoutes = (server: ServerType) => {
  server.use("*", logger());

  server.get("/health", (c) => c.json({ status: "ok" }));

  server.get("/test", async (c) => {
    const params = c.req.param();
    const query = c.req.query();
    const body = await c.req.parseBody();
    return c.json({ path: "/test", version: "v1", query, params, body });
  });
  return server;
};

export const registerRemixMiddleware = (server: ServerType) => {
  // Remix middleware to handle remix routes in Hono server
  server.use(
    "*",
    remix({
      // eslint-disable-next-line
      // @ts-ignore
      build,
      mode:
        process.env.NODE_ENV === "production" ? "production" : "development",
      // getLoadContext is optional, the default function is the same as here
      getLoadContext(ctx) {
        return ctx.env;
      },
    })
  );
  return server;
};
