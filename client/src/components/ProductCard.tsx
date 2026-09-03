import { Link } from "react-router-dom";
import { categoryPhoto } from "../lib/catalogVisuals";
import { cityFromAddress } from "../lib/format";
import type { ProductSummary } from "../types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const image = product.images[0]?.url ?? categoryPhoto(product.category.name);
  const city = cityFromAddress(product.seller.address ?? "");
  return (
    <article className="card product-card">
      <Link className="thumb-link" to={`/products/${product.id}`}>
        <img
          className="thumb"
          src={image}
          alt={product.title}
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.src = categoryPhoto(product.category.name);
          }}
        />
      </Link>
      <div className="product-card-body">
        <div className="product-card-meta">
          <span className="chip cat">{product.category.name}</span>
          <span className="chip verified">Verified</span>
        </div>
        <h3>
          <Link to={`/products/${product.id}`}>{product.title}</Link>
        </h3>
        <p className="muted seller-line">
          <Link to={`/sellers/${product.seller.id}`}>{product.seller.companyName}</Link>
          <span>· {city}</span>
        </p>
        <p className="ask-price">Price on request · GST invoice</p>
        <Link className="btn-accent" to={`/products/${product.id}`}>
          Get Best Price
        </Link>
      </div>
    </article>
  );
}
