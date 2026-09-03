import { Link } from "react-router-dom";
import type { ProductSummary } from "../types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const image = product.images[0]?.url;
  return (
    <article className="card product-card">
      <Link to={`/products/${product.id}`}>
        {image ? (
          <img className="thumb" src={image} alt="" referrerPolicy="no-referrer" />
        ) : (
          <div className="thumb thumb-fallback">{product.category.name}</div>
        )}
      </Link>
      <div className="product-card-body">
        <span className="chip cat">{product.category.name}</span>
        <h3>
          <Link to={`/products/${product.id}`}>{product.title}</Link>
        </h3>
        <p className="muted">
          <Link to={`/sellers/${product.seller.id}`}>{product.seller.companyName}</Link>
        </p>
        <Link className="btn-accent" to={`/products/${product.id}`}>
          Get Best Price
        </Link>
      </div>
    </article>
  );
}
