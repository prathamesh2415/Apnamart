import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiError, api } from "../api";
import { usePageTitle } from "../hooks";

export function CmsPage() {
  const { slug } = useParams();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  usePageTitle(title ? `${title} | ApnaMart` : "ApnaMart");

  useEffect(() => {
    if (!slug) return;
    api
      .get<{ page: { title: string; body: string } }>(`/api/cms/${slug}`)
      .then((data) => {
        setTitle(data.page.title);
        setBody(data.page.body);
        setError("");
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Page not found"));
  }, [slug]);

  if (error) return <p className="wrap page-pad banner error">{error}</p>;
  return (
    <article className="wrap page-pad cms-page">
      <h1>{title || "…"}</h1>
      <p className="prose">{body}</p>
    </article>
  );
}
