import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError, api } from "../api";
import { EmptyState } from "../components/EmptyState";
import { SellerCard } from "../components/SellerCard";
import { usePageTitle } from "../hooks";
import type { SellerSummary } from "../types";

export function SuppliersPage() {
  usePageTitle("Find suppliers | ApnaMart");
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sellers, setSellers] = useState<SellerSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const page = Number(params.get("page") ?? "1");
  const query = params.get("q") ?? "";

  useEffect(() => {
    setLoading(true);
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    search.set("page", String(page));
    api
      .get<{ sellers: SellerSummary[]; total: number }>(`/api/sellers?${search}`)
      .then((data) => {
        setSellers(data.sellers);
        setTotal(data.total);
        setError("");
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load suppliers"))
      .finally(() => setLoading(false));
  }, [query, page]);

  function onSearch(event: React.FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    next.set("page", "1");
    setParams(next);
  }

  return (
    <div className="wrap page-pad">
      <h1>Find suppliers</h1>
      <p className="muted">Approved companies on ApnaMart. Contact them directly after you send an inquiry.</p>
      <form className="search-bar page" onSubmit={onSearch} style={{ margin: "20px 0 24px", maxWidth: 640 }}>
        <input
          aria-label="Search suppliers"
          placeholder="Company, city, or product area"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="primary" type="submit">
          Search
        </button>
      </form>
      {error ? <p className="banner error">{error}</p> : null}
      {loading ? <div className="skeleton" style={{ height: 180 }} /> : null}
      {!loading && sellers.length === 0 ? (
        <EmptyState
          title="No suppliers match"
          body="Try another city or company name."
          actionLabel="Browse products"
          actionTo="/search"
        />
      ) : null}
      <div className="seller-grid">
        {sellers.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
      {total > 12 ? (
        <p className="row" style={{ marginTop: 20 }}>
          <button
            className="ghost"
            type="button"
            disabled={page <= 1}
            onClick={() => setParams({ q: query, page: String(page - 1) })}
          >
            Previous
          </button>
          <span className="muted">
            Page {page} · {total} suppliers
          </span>
          <button
            className="ghost"
            type="button"
            disabled={page * 12 >= total}
            onClick={() => setParams({ q: query, page: String(page + 1) })}
          >
            Next
          </button>
        </p>
      ) : null}
    </div>
  );
}
