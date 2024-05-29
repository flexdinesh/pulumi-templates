import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "/note page" },
    { name: "description", content: "note landing" },
  ];
};

export default function Page() {
  return (
    <div className="pulse-bg m-2 p-2 outline-2 outline-dashed outline-blue-500">
      <p>/note page.</p>
    </div>
  );
}
