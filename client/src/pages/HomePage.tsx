import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, api } from "../api";
import { CategoryGrid } from "../components/CategoryGrid";
import { ProductCard } from "../components/ProductCard";
import { SearchBar } from "../components/SearchBar";
import { SellerCard } from "../components/SellerCard";
import { ProductSkeleton } from "../components/Skeleton";
import { TrustBar } from "../components/TrustBar";
import { usePageTitle } from "../hooks";
import { categoryPhoto } from "../lib/catalogVisuals";
import type { Category, ProductSummary, SellerSummary } from "../types";

type Stats = { products: number; sellers: number; buyers: number; categories: number };

export function HomePage() {
  usePageTitle("ApnaMart — India’s B2B Marketplace");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [sellers, setSellers] = useState<SellerSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ categories: Category[] }>("/api/categories"),
      api.get<{ products: ProductSummary[] }>("/api/products?page=1&pageSize=16"),
      api.get<{ sellers: SellerSummary[] }>("/api/sellers?page=1"),
      api.get<Stats>("/api/stats"),
    ])
      .then(([cat, prod, sup, live]) => {
        setCategories(cat.categories);
        setProducts(prod.products);
        setSellers(sup.sellers.slice(0, 6));
        setStats(live);
        setError("");
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load marketplace"))
      .finally(() => setLoading(false));
  }, []);

  const featured = products[0];
  const mosaic = products.slice(1, 4);

  return (
    <div>
      <section className="hero">
        <div className="hero-glow" aria-hidden />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">India’s B2B marketplace</p>
            <h1>
              Source from verified suppliers.
              <em> Close the deal directly.</em>
            </h1>
            <p className="hero-lead">
              Live product photos, company profiles, and Get Best Price on email or WhatsApp. No checkout. No listed
              prices.
            </p>
            <SearchBar variant="hero" categories={categories} />
            <div className="hero-chips">
              {categories.slice(0, 6).map((c) => (
                <Link key={c.id} to={`/search?categoryId=${c.id}`}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hero-stage">
            {featured ? (
              <Link to={`/products/${featured.id}`} className="hero-feature">
                <img
                  src={featured.images[0]?.url ?? categoryPhoto(featured.category.name)}
                  alt={featured.title}
                  referrerPolicy="no-referrer"
                />
                <div className="hero-feature-meta">
                  <span className="chip verified">Verified seller</span>
                  <strong>{featured.title}</strong>
                  <span>{featured.seller.companyName}</span>
                </div>
              </Link>
            ) : (
              <div className="hero-feature skeleton" />
            )}
            <div className="hero-stack">
              {mosaic.length
                ? mosaic.map((product) => (
                    <Link key={product.id} to={`/products/${product.id}`} className="hero-stack-card">
                      <img
                        src={product.images[0]?.url ?? categoryPhoto(product.category.name)}
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                      <span>{product.title}</span>
                    </Link>
                  ))
                : [0, 1, 2].map((slot) => <div className="hero-stack-card skeleton" key={slot} />)}
            </div>
          </div>
        </div>
      </section>
      <TrustBar stats={stats} />

      <section className="section">
        <div className="wrap">
          {error ? <p className="banner error">{error}</p> : null}
          <div className="section-head">
            <div>
              <p className="eyebrow">Catalog</p>
              <h2>Shop by industry</h2>
              <p className="muted">Twelve live categories with photos from real supplier listings.</p>
            </div>
            <Link className="text-link" to="/search">
              View all products →
            </Link>
          </div>
          {categories.length ? <CategoryGrid categories={categories} /> : <ProductSkeleton count={4} />}
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Ready to inquire</p>
              <h2>Featured products</h2>
              <p className="muted">Ask for MOQ, GST, and delivery. Price is shared off-platform.</p>
            </div>
            <Link className="text-link" to="/search">
              See full catalog →
            </Link>
          </div>
          {loading ? (
            <ProductSkeleton />
          ) : (
            <div className="grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Network</p>
              <h2>Verified suppliers</h2>
              <p className="muted">Company profiles across India — contact after you send a requirement.</p>
            </div>
            <Link className="text-link" to="/suppliers">
              Browse suppliers →
            </Link>
          </div>
          {loading ? (
            <ProductSkeleton count={3} />
          ) : (
            <div className="seller-grid">
              {sellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Simple flow</p>
              <h2>How ApnaMart works</h2>
              <p className="muted">Lead generation only. Payments stay between you and the supplier.</p>
            </div>
          </div>
          <div className="steps">
            <article className="step">
              <div className="step-num">01</div>
              <h3>Search what you need</h3>
              <p className="muted">Browse photos and categories, or post a requirement for matching suppliers.</p>
            </article>
            <article className="step">
              <div className="step-num">02</div>
              <h3>Send Get Best Price</h3>
              <p className="muted">Share quantity, city, and specs. The seller gets your inquiry by form, email, or WhatsApp.</p>
            </article>
            <article className="step">
              <div className="step-num">03</div>
              <h3>Deal directly</h3>
              <p className="muted">Call the supplier. Negotiate price, GST, and delivery off the platform.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-split">
          <div className="cta-card">
            <p className="eyebrow light">Buyers</p>
            <h2>Buying in bulk?</h2>
            <p>Post one requirement and compare responses from matching suppliers.</p>
            <Link className="btn-accent" to="/post-requirement">
              Post your requirement
            </Link>
          </div>
          <div className="cta-card">
            <p className="eyebrow light">Sellers</p>
            <h2>Are you a manufacturer?</h2>
            <p>List products with photos, receive buyer inquiries, and grow distribution across India.</p>
            <Link className="btn-ghost light" to="/register">
              Sell on ApnaMart
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
