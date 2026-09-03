import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, api } from "../api";
import { InquiryPanel } from "../components/InquiryPanel";
import { cityFromAddress } from "../lib/format";
import { usePageTitle } from "../hooks";
import { IconMail, IconMapPin, IconPhone } from "../components/Icons";

type Product = {
  id: string;
  title: string;
  description: string;
  images: { url: string }[];
  category: { name: string };
  seller: {
    id: string;
    companyName: string;
    contactName: string;
    phone: string | null;
    email: string | null;
    emailInquiriesEnabled: boolean;
    whatsapp: string | null;
    address?: string;
  };
};

export function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  usePageTitle(product ? `${product.title} | ApnaMart` : "Product | ApnaMart");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<{ product: Product }>(`/api/products/${id}`)
      .then((data) => {
        setProduct(data.product);
        setActive(0);
        setError("");
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="wrap page-pad">
        <div className="skeleton" style={{ height: 360 }} />
      </div>
    );
  }
  if (!product) return <p className="wrap page-pad banner error">{error || "Product not found"}</p>;

  const image = product.images[active]?.url ?? product.images[0]?.url;
  const city = cityFromAddress(product.seller.address ?? "");

  return (
    <div className="wrap page-pad">
      <p className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/search">Products</Link> / {product.category.name}
      </p>
      <div className="product-layout">
        <div>
          <div className="gallery-main">
            {image ? (
              <img src={image} alt={product.title} referrerPolicy="no-referrer" />
            ) : (
              <div className="thumb-fallback" style={{ height: 380 }}>
                {product.category.name}
              </div>
            )}
          </div>
          {product.images.length > 1 ? (
            <div className="gallery-thumbs">
              {product.images.map((img, index) => (
                <button
                  key={img.url}
                  type="button"
                  className={index === active ? "active" : ""}
                  onClick={() => setActive(index)}
                >
                  <img src={img.url} alt="" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          ) : null}
          <article className="card" style={{ marginTop: 16 }}>
            <span className="chip cat">{product.category.name}</span>
            <h1 style={{ marginTop: 10 }}>{product.title}</h1>
            <p>{product.description}</p>
          </article>
        </div>
        <aside className="stack">
          <section className="card">
            <div className="seller-mini">
              <div>
                <span className="chip verified">Verified supplier</span>
                <h2 style={{ marginTop: 8 }}>
                  <Link to={`/sellers/${product.seller.id}`}>{product.seller.companyName}</Link>
                </h2>
                <p className="contact-line">
                  <IconMapPin size={16} /> {city}
                </p>
              </div>
            </div>
            <p className="contact-line">
              <IconPhone size={16} /> {product.seller.contactName} · {product.seller.phone ?? "Phone on request"}
            </p>
            <p className="contact-line">
              <IconMail size={16} /> {product.seller.email ?? "Email on request"}
            </p>
            <p>
              <Link to={`/sellers/${product.seller.id}`}>View company profile</Link>
            </p>
          </section>
          <InquiryPanel
            sellerId={product.seller.id}
            sellerName={product.seller.companyName}
            productId={product.id}
            productTitle={product.title}
            contact={{
              email: product.seller.email,
              emailInquiriesEnabled: product.seller.emailInquiriesEnabled,
              whatsapp: product.seller.whatsapp,
            }}
          />
        </aside>
      </div>
    </div>
  );
}
