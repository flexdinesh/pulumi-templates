import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "/note layout" },
    { name: "description", content: "note layout" },
  ];
};

export default function Layout() {
  return (
    <div className="pulse-bg m-2 p-2 outline-2 outline-dashed outline-pink-500">
      <p>/note layout.</p>
      <Outlet />
    </div>
  );
}
