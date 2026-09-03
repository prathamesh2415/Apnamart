import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError, api } from "../api";
import { EmptyState } from "../components/EmptyState";
import { ProductCard } from "../components/ProductCard";
import { SearchBar } from "../components/SearchBar";
import { ProductSkeleton } from "../components/Skeleton";
import { usePageTitle } from "../hooks";
import type { Category, ProductSummary } from "../types";

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const q = params.get("q") ?? "";
  const categoryId = params.get("categoryId") ?? "";
  const page = Number(params.get("page") ?? "1");
  const activeCategory = categories.find((c) => c.id === categoryId)?.name;

  usePageTitle(q ? `Search “${q}” | ApnaMart` : "Browse products | ApnaMart");

  useEffect(() => {
    api.get<{ categories: Category[] }>("/api/categories").then((data) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (categoryId) query.set("categoryId", categoryId);
    query.set("page", String(page));
    api
      .get<{ products: ProductSummary[]; total: number }>(`/api/products?${query}`)
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
        setError("");
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load products"))
      .finally(() => setLoading(false));
  }, [q, categoryId, page]);

  function setPage(next: number) {
    const copy = new URLSearchParams(params);
    copy.set("page", String(next));
    setParams(copy);
  }

  return (
    <div className="wrap page-pad">
      <p className="breadcrumb">Home / Products{activeCategory ? ` / ${activeCategory}` : ""}</p>
      <div className="section-head">
        <div>
          <h1>{q ? `Results for “${q}”` : activeCategory ?? "All products"}</h1>
          <p className="muted">{loading ? "Searching suppliers…" : `${total} approved listings`}</p>
        </div>
      </div>
      <SearchBar key={`${q}-${categoryId}`} initialQ={q} categoryId={categoryId} categories={categories} variant="page" />
      {error ? <p className="banner error">{error}</p> : null}
      {loading ? <ProductSkeleton /> : null}
      {!loading && products.length === 0 ? (
        <EmptyState
          title="No matching products"
          body="Try another keyword, or post a requirement and we will show relevant suppliers."
          actionLabel="Post requirement"
          actionTo="/post-requirement"
        />
      ) : null}
      {!loading ? (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
      {total > 12 ? (
        <p className="row" style={{ marginTop: 20 }}>
          <button className="ghost" type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="muted">
            Page {page} · {total} results
          </span>
          <button className="ghost" type="button" disabled={page * 12 >= total} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </p>
      ) : null}
    </div>
  );
}
