import type { HeadersFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "/cache/client page" }];
};

export const headers: HeadersFunction = () => {
  return {
    goal: "cache on client for 60s",
    "Cache-Control": "public, max-age=60, s-maxage=60, must-revalidate",
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
        "Cache-Control": "public, max-age=60, s-maxage=60, must-revalidate",
      },
    }
  );
}

export default function Page() {
  const { time } = useLoaderData<typeof loader>();
  return (
    <div className="pulse-bg m-2 p-2 outline-2 outline-dashed outline-blue-500">
      <p>/cache/client page.</p>
      <p>{time}</p>
      <p>
        This page is served with{" "}
        <code>{`"Cache-Control": "public, max-age=60, s-maxage=60, must-revalidate"`}</code>{" "}
        header. This page will be cached on the browser for 60s and in the CDN
        for 60s. When the same browser requests the page within 60s, the request
        will be served from the browser&apos;s cache. When another browser
        requests the page within 60s, it will be served from the CDN cache.
        After 60s, the next request will be served from orgin and then cached
        again for 60s in both the browser and the CDN.
      </p>
    </div>
  );
}
