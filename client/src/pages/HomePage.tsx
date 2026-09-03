import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { CategoryGrid } from "../components/CategoryGrid";
import { ProductCard } from "../components/ProductCard";
import { SearchBar } from "../components/SearchBar";
import { ProductSkeleton } from "../components/Skeleton";
import { TrustBar } from "../components/TrustBar";
import { usePageTitle } from "../hooks";
import type { Category, ProductSummary } from "../types";

export function HomePage() {
  usePageTitle("ApnaMart — India’s B2B Marketplace");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ categories: Category[] }>("/api/categories").then((data) => setCategories(data.categories));
    api
      .get<{ products: ProductSummary[] }>("/api/products?page=1")
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="wrap">
          <h1>Find trusted suppliers. Get quotes. Deal directly.</h1>
          <p className="hero-lead">
            ApnaMart is a B2B marketplace for Indian manufacturers, traders, and bulk buyers. Search products, contact
            verified sellers, and close the deal off-platform.
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
      </section>
      <TrustBar />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Browse categories</h2>
              <p className="muted">Industrial supplies to agriculture — find the right supplier category.</p>
            </div>
            <Link to="/search">View all products</Link>
          </div>
          {categories.length ? <CategoryGrid categories={categories} /> : <ProductSkeleton count={4} />}
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Featured products</h2>
              <p className="muted">Approved listings from sellers across India. Ask for price — no checkout here.</p>
            </div>
            <Link to="/search">See catalog</Link>
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
              <h2>How ApnaMart works</h2>
              <p className="muted">A lead-generation marketplace. Payments stay between you and the supplier.</p>
            </div>
          </div>
          <div className="steps">
            <article className="step">
              <div className="step-num">1</div>
              <h3>Search what you need</h3>
              <p className="muted">Browse categories or post a requirement. We match you with relevant suppliers.</p>
            </article>
            <article className="step">
              <div className="step-num">2</div>
              <h3>Send Get Best Price</h3>
              <p className="muted">Share quantity, city, and specs. The seller receives your inquiry by email.</p>
            </article>
            <article className="step">
              <div className="step-num">3</div>
              <h3>Deal directly</h3>
              <p className="muted">Call or email the supplier. Negotiate price, GST, and delivery off the platform.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-split">
          <div className="cta-card">
            <h2>Buying in bulk?</h2>
            <p>Post one requirement and compare responses from matching suppliers.</p>
            <Link className="btn-accent" to="/post-requirement">
              Post your requirement
            </Link>
          </div>
          <div className="cta-card">
            <h2>Are you a manufacturer?</h2>
            <p>List products, receive buyer inquiries, and grow distribution across India.</p>
            <Link className="btn-ghost" to="/register">
              Sell on ApnaMart
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
