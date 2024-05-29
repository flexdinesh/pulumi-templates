import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "@remix-run/react";

import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: styles },
];

export default function RootLayout() {

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="p-2">
        <main className="pulse-bg m-2 p-2 outline-2 outline-dashed outline-green-500">
          <p>root layout.</p>
          <h3 className="pt-2 font-bold">Pages:</h3>
          <ul className="py-2">
            <li>
              <Link to="/">/</Link>
            </li>
            <li>
              <Link to="/note">/note</Link>
            </li>
            <li>
              <Link to="/note/abc">/note/abc</Link>
            </li>
          </ul>
          <h3 className="pt-2 font-bold">Caching examples:</h3>
          <ul className="py-2">
            <li>
              <Link to="/cache/nocache">/cache/nocache</Link>
            </li>
            <li>
              <Link to="/cache/client">/cache/client</Link>
            </li>
            <li>
              <Link to="/cache/cdn">/cache/cdn</Link>
            </li>
            <li>
              <Link to="/cache/swr">/cache/swr</Link>
            </li>
          </ul>
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
