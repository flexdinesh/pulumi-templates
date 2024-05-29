import type { HeadersFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "/cache/swr page" }];
};

const cacheControlHeaders = {
  goal: "cache on cdn for 10s. swr 120s after s-maxage expires.",
  "Cache-Control": "public, max-age=0, s-maxage=10, stale-while-revalidate=120",
};

export const headers: HeadersFunction = () => {
  /*
    max-age=0: don't cache on the browser
    s-maxage=10: CDN cache is fresh 10s
    stale-while-revalidate=120: after CDN cache becomes stale, 
      if the next request is within 120s, stale cache is served
      and the CDN refreshes the cache from the origin in the background.
  */
  return {
    ...cacheControlHeaders,
  };
};

export async function loader() {
  const time = new Intl.DateTimeFormat("en", {
    timeStyle: "full",
    timeZone: "Australia/Sydney",
  }).format(new Date());

  return json(
    {
      time,
    },
    {
      headers: {
        ...cacheControlHeaders,
      },
    }
  );
}

export default function Page() {
  const { time } = useLoaderData<typeof loader>();
  return (
    <div className="pulse-bg m-2 p-2 outline-2 outline-dashed outline-blue-500">
      <p>/cache/swr page.</p>
      <p>{time}</p>
      <p>
        This page is served with{" "}
        <code>{`"Cache-Control":  "public, max-age=0, s-maxage=10, stale-while-revalidate=120"`}</code>{" "}
        header. This page will not be cached on the browser. It will only be
        cached in the CDN for 10s. Every request within 10s will be served from
        the CDN cache. After 10s, the cache will be marked as STALE for the next
        120s. If the next request comes in within 120s, the CDN will serve the
        request from the cache and refresh the cache in the background by making
        a request to the origin. But if the next request comes in after 120s, it
        will be served from the origin and then cached again for 10s.
      </p>
    </div>
  );
}
