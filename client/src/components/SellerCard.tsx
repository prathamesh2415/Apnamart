import { Link } from "react-router-dom";
import { categoryPhoto, companyInitials } from "../lib/catalogVisuals";
import { cityFromAddress } from "../lib/format";
import type { SellerSummary } from "../types";

export function SellerCard({ seller }: { seller: SellerSummary }) {
  const cover = seller.coverImage ?? categoryPhoto(seller.categories[0]?.name ?? "");
  const city = cityFromAddress(seller.address);
  return (
    <article className="card seller-card">
      <img
        className="seller-cover"
        src={cover}
        alt=""
        referrerPolicy="no-referrer"
        onError={(event) => {
          event.currentTarget.src = categoryPhoto(seller.categories[0]?.name ?? "");
        }}
      />
      <div className="seller-card-body">
        <div className="seller-ident">
          <span className="seller-avatar">{companyInitials(seller.companyName)}</span>
          <div>
            <h3>
              <Link to={`/sellers/${seller.id}`}>{seller.companyName}</Link>
            </h3>
            <p className="muted">
              {city} · {seller.productCount} live products
            </p>
          </div>
        </div>
        <p className="seller-blurb">{seller.description}</p>
        <div className="seller-meta">
          <span className="chip verified">Verified seller</span>
          {seller.categories.slice(0, 2).map((c) => (
            <span className="chip cat" key={c.id}>
              {c.name}
            </span>
          ))}
        </div>
        <Link className="btn-ghost" to={`/sellers/${seller.id}`}>
          View company profile
        </Link>
      </div>
    </article>
  );
}
