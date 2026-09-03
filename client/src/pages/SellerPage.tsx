import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, api } from "../api";
import { EmptyState } from "../components/EmptyState";
import { IconMail, IconMapPin, IconPhone, IconWhatsApp } from "../components/Icons";
import { InquiryPanel } from "../components/InquiryPanel";
import { ProductCard } from "../components/ProductCard";
import { usePageTitle } from "../hooks";
import type { ProductSummary } from "../types";

type Seller = {
  id: string;
  companyName: string;
  description: string;
  address: string;
  website: string;
  contactName: string;
  phone: string | null;
  email: string | null;
  emailInquiriesEnabled: boolean;
  whatsapp: string | null;
  categories: { id: string; name: string }[];
  products: ProductSummary[];
};

export function SellerPage() {
  const { id } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [error, setError] = useState("");

  usePageTitle(seller ? `${seller.companyName} | ApnaMart` : "Supplier | ApnaMart");

  useEffect(() => {
    if (!id) return;
    api
      .get<{ seller: Seller }>(`/api/sellers/${id}`)
      .then((data) => {
        setSeller(data.seller);
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Not found"));
  }, [id]);

  if (error) return <p className="wrap page-pad banner error">{error}</p>;
  if (!seller) {
    return (
      <div className="wrap page-pad">
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className="wrap page-pad">
      <p className="breadcrumb">
        <Link to="/suppliers">Suppliers</Link> / {seller.companyName}
      </p>
      <section className="seller-hero">
        <div className="seller-meta">
          <span className="chip verified">Verified supplier</span>
          {seller.categories.map((c) => (
            <span className="chip cat" key={c.id}>
              {c.name}
            </span>
          ))}
        </div>
        <h1>{seller.companyName}</h1>
        <p>{seller.description}</p>
        <p className="muted">
          <IconMapPin size={16} /> {seller.address || "India"}
          {seller.website ? (
            <>
              {" · "}
              <a href={seller.website} target="_blank" rel="noreferrer">
                Website
              </a>
            </>
          ) : null}
        </p>
      </section>
      <div className="contact-strip">
        <div className="card">
          <strong>Contact</strong>
          <p className="muted">{seller.contactName}</p>
        </div>
        <div className="card">
          <strong>
            <IconPhone size={16} /> Phone
          </strong>
          <p className="muted">{seller.phone ?? "On request after inquiry"}</p>
        </div>
        <div className="card">
          <strong>
            <IconMail size={16} /> Email
          </strong>
          <p className="muted">{seller.email ?? "On request after inquiry"}</p>
        </div>
        <div className="card">
          <strong>
            <IconWhatsApp size={16} /> WhatsApp Business
          </strong>
          <p className="muted">{seller.whatsapp ?? "Not published"}</p>
        </div>
      </div>
      <InquiryPanel
        sellerId={seller.id}
        sellerName={seller.companyName}
        contact={{
          email: seller.email,
          emailInquiriesEnabled: seller.emailInquiriesEnabled,
          whatsapp: seller.whatsapp,
        }}
      />
      <h2>Products from this seller</h2>
      {seller.products.length === 0 ? (
        <EmptyState title="No live products" body="This supplier has no approved listings yet." actionLabel="Browse catalog" actionTo="/search" />
      ) : (
        <div className="grid">
          {seller.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}