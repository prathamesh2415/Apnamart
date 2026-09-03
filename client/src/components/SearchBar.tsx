import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../types";
import { IconSearch } from "./Icons";

type Props = {
  initialQ?: string;
  categoryId?: string;
  categories?: Category[];
  variant?: "header" | "hero" | "page";
};

export function SearchBar({ initialQ = "", categoryId = "", categories = [], variant = "page" }: Props) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState(categoryId);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat) params.set("categoryId", cat);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <form className={`search-bar ${variant}`} onSubmit={submit} role="search">
      {categories.length > 0 && variant !== "header" ? (
        <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ) : null}
      <input
        aria-label="Search products"
        placeholder="What are you looking for?"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button className={variant === "hero" ? "accent" : "primary"} type="submit">
        <IconSearch size={18} />
        {variant === "header" ? <span className="sr-only">Search</span> : "Search"}
      </button>
    </form>
  );
}
