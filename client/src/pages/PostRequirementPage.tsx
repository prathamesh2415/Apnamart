import { useMemo, useState } from "react";
import { ApiError, api } from "../api";
import { EmptyState } from "../components/EmptyState";
import { InquiryPanel } from "../components/InquiryPanel";
import { ProductCard } from "../components/ProductCard";
import { ProductSkeleton } from "../components/Skeleton";
import { usePageTitle } from "../hooks";
import type { ProductSummary } from "../types";

export function PostRequirementPage() {
  usePageTitle("Post your requirement | ApnaMart");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [city, setCity] = useState("");
  const [details, setDetails] = useState("");
  const [matches, setMatches] = useState<ProductSummary[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const composed = useMemo(() => {
    const lines = [`Requirement: ${product.trim()}`];
    if (quantity.trim()) lines.push(`Quantity: ${quantity.trim()}`);
    if (city.trim()) lines.push(`City: ${city.trim()}`);
    if (details.trim()) lines.push("", details.trim());
    return lines.join("\n");
  }, [product, quantity, city, details]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.get<{ products: ProductSummary[] }>(
        `/api/products?q=${encodeURIComponent(product.trim())}&page=1`,
      );
      setMatches(data.products);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not find matching suppliers");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap page-pad">
      <h1>Post your requirement</h1>
      <p className="muted">
        Tell us what you need. We match live catalog listings — then you send Get Best Price to those suppliers.
      </p>
      <div className="req-layout" style={{ marginTop: 24 }}>
        <form className="card form" onSubmit={onSubmit}>
          <label htmlFor="req-product">Product / service</label>
          <input
            id="req-product"
            required
            placeholder="e.g. industrial bearings"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
          <label htmlFor="req-qty">Quantity</label>
          <input id="req-qty" placeholder="e.g. 500 pcs" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <label htmlFor="req-city">Your city</label>
          <input id="req-city" placeholder="e.g. Pune" value={city} onChange={(e) => setCity(e.target.value)} />
          <label htmlFor="req-details">Specifications</label>
          <textarea
            id="req-details"
            placeholder="Grade, size, delivery timeline…"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          {error ? <p className="banner error">{error}</p> : null}
          <button className="accent" type="submit" disabled={loading}>
            {loading ? "Matching suppliers…" : "Find matching suppliers"}
          </button>
        </form>
        <div>
          {loading ? <ProductSkeleton count={4} /> : null}
          {matches && matches.length === 0 ? (
            <EmptyState
              title="No catalog match yet"
              body="Try a broader product name, or browse all categories."
              actionLabel="Browse products"
              actionTo="/search"
            />
          ) : null}
          {matches && matches.length > 0 ? (
            <div className="stack">
              <h2>Matching suppliers</h2>
              {matches.map((item) => (
                <div className="stack" key={item.id}>
                  <ProductCard product={item} />
                  <InquiryPanel
                    sellerId={item.seller.id}
                    sellerName={item.seller.companyName}
                    productId={item.id}
                    productTitle={item.title}
                    defaultMessage={composed}
                    contact={{
                      email: item.seller.email ?? null,
                      emailInquiriesEnabled: item.seller.emailInquiriesEnabled ?? true,
                      whatsapp: item.seller.whatsapp ?? null,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : null}
          {matches === null && !loading ? (
            <EmptyState
              title="Describe what you need"
              body="We’ll search approved listings and let you inquire with quantity and city included."
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
