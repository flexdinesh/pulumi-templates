import type { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `/note/:id page - id=${params.id}` },
    { name: "description", content: "note item desc" },
  ];
};

export default function Page() {
  const params = useParams();

  return (
    <div className="pulse-bg m-2 p-2 outline-2 outline-dashed outline-blue-500">
      <p>/note/:id page.</p>
      <p>id: {params.id}</p>
    </div>
  );
}
