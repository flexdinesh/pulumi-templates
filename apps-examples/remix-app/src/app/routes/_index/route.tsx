import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "/ page" }, { name: "description", content: "root page" }];
};

export default function Page() {
  return (
    <div className="pulse-bg m-2 p-2 outline-2 outline-dashed outline-pink-500">
      <p>root page.</p>
    </div>
  );
}
