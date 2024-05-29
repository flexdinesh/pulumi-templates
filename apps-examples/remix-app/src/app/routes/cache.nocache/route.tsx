import type { HeadersFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "/cache/nocache page" }];
};

const cacheControlHeaders = {
  goal: "don't cache",
  "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
};

export const headers: HeadersFunction = () => {
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
      <p>/cache/nocache page.</p>
      <p>{time}</p>
      <p>
        This page is served with{" "}
        <code>{`"Cache-Control": "no-cache, no-store, max-age=0, must-revalidate"`}</code>{" "}
        header. This page will not be cached anywhere and will always be served
        from the origin server for every request.
      </p>
    </div>
  );
}
