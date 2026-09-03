import { useEffect, useState } from "react";
import { ApiError, api } from "../api";
import { EmptyState } from "../components/EmptyState";
import { usePageTitle } from "../hooks";
import { useSession } from "../session";

type Category = { id: string; name: string };
type Product = { id: string; title: string; status: string; category: { name: string } };
type Lead = {
  id: string;
  message: string;
  buyer: {
    name: string;
    email: string;
    phone: string | null;
    buyerProfile?: { companyName: string; city: string; whatsapp: string } | null;
  };
  product: { title: string } | null;
};
type ProfileForm = {
  companyName: string;
  description: string;
  address: string;
  website: string;
  phone: string;
  inquiryEmail: string;
  emailInquiriesEnabled: boolean;
  showEmailPublicly: boolean;
  whatsappBusiness: string;
  whatsappEnabled: boolean;
};

function statusChip(status: string) {
  if (status === "APPROVED") return "chip ok";
  if (status === "PENDING") return "chip warn";
  return "chip danger";
}

export function SellerDashboard() {
  usePageTitle("Seller desk | ApnaMart");
  const { sellerStatus, refresh } = useSession();
  const [assigned, setAssigned] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [profile, setProfile] = useState<ProfileForm>({
    companyName: "",
    description: "",
    address: "",
    website: "",
    phone: "",
    inquiryEmail: "",
    emailInquiriesEnabled: true,
    showEmailPublicly: true,
    whatsappBusiness: "",
    whatsappEnabled: false,
  });
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [profileData, productData, leadData] = await Promise.all([
        api.get<{
          profile: {
            companyName: string;
            description: string;
            address: string;
            website: string;
            inquiryEmail: string;
            emailInquiriesEnabled: boolean;
            showEmailPublicly: boolean;
            whatsappBusiness: string;
            whatsappEnabled: boolean;
            user: { phone: string | null; email: string };
            categories: { category: Category }[];
          };
        }>("/api/seller/profile"),
        api.get<{ products: Product[] }>("/api/seller/products"),
        api.get<{ leads: Lead[] }>("/api/seller/leads"),
      ]);
      setAssigned(profileData.profile.categories.map((c) => c.category));
      setProducts(productData.products);
      setLeads(leadData.leads);
      setProfile({
        companyName: profileData.profile.companyName,
        description: profileData.profile.description,
        address: profileData.profile.address,
        website: profileData.profile.website,
        phone: profileData.profile.user.phone ?? "",
        inquiryEmail: profileData.profile.inquiryEmail || profileData.profile.user.email,
        emailInquiriesEnabled: profileData.profile.emailInquiriesEnabled,
        showEmailPublicly: profileData.profile.showEmailPublicly,
        whatsappBusiness: profileData.profile.whatsappBusiness,
        whatsappEnabled: profileData.profile.whatsappEnabled,
      });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not load seller desk");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setOk("");
    try {
      await api.patch("/api/seller/profile", { ...profile, phone: profile.phone.trim() || undefined });
      setOk("Profile saved");
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    }
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setOk("");
    try {
      await api.post("/api/seller/products", data);
      form.reset();
      setOk("Product submitted for admin approval");
      await load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not create product");
    }
  }

  function setField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="wrap page-pad stack">
      <div className="dash-head">
        <div>
          <h1>Seller desk</h1>
          <p className="muted">Manage your company profile, listings, and inbound buyer leads.</p>
        </div>
        <span className={statusChip(sellerStatus ?? "")}>{sellerStatus ?? "unknown"}</span>
      </div>
      {sellerStatus !== "APPROVED" ? (
        <p className="banner warn">
          Admin must approve your account before products can be listed. Categories are assigned by the ApnaMart team.
        </p>
      ) : null}
      {error ? <p className="banner error">{error}</p> : null}
      {ok ? <p className="banner ok">{ok}</p> : null}
      {loading ? <div className="skeleton" style={{ height: 160 }} /> : null}

      <div className="stats-grid">
        <article className="card stat-card">
          <strong>{products.length}</strong>
          <span>Products</span>
        </article>
        <article className="card stat-card">
          <strong>{leads.length}</strong>
          <span>Buyer leads</span>
        </article>
        <article className="card stat-card">
          <strong>{assigned.length}</strong>
          <span>Categories</span>
        </article>
        <article className="card stat-card">
          <strong>{products.filter((p) => p.status === "APPROVED").length}</strong>
          <span>Live listings</span>
        </article>
      </div>

      <form className="card form" onSubmit={saveProfile}>
        <h2>Company profile</h2>
        <label htmlFor="companyName">Company</label>
        <input id="companyName" value={profile.companyName} onChange={(e) => setField("companyName", e.target.value)} required />
        <label htmlFor="description">About</label>
        <textarea id="description" value={profile.description} onChange={(e) => setField("description", e.target.value)} />
        <label htmlFor="address">Address / city</label>
        <input id="address" value={profile.address} onChange={(e) => setField("address", e.target.value)} />
        <label htmlFor="website">Website</label>
        <input id="website" value={profile.website} onChange={(e) => setField("website", e.target.value)} />
        <label htmlFor="phone">Phone</label>
        <input id="phone" value={profile.phone} onChange={(e) => setField("phone", e.target.value)} />
        <h3>How buyers can reach you</h3>
        <p className="muted">Opt in to receive requirement emails on your registered dealer inbox, and publish WhatsApp Business for direct chat.</p>
        <label htmlFor="inquiryEmail">Dealer inquiry email</label>
        <input
          id="inquiryEmail"
          type="email"
          value={profile.inquiryEmail}
          onChange={(e) => setField("inquiryEmail", e.target.value)}
        />
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={profile.emailInquiriesEnabled}
            onChange={(e) => setField("emailInquiriesEnabled", e.target.checked)}
          />
          Email me buyer requirements on this address
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={profile.showEmailPublicly}
            onChange={(e) => setField("showEmailPublicly", e.target.checked)}
          />
          Show this email on my public profile
        </label>
        <label htmlFor="whatsappBusiness">WhatsApp Business number</label>
        <input
          id="whatsappBusiness"
          placeholder="+91 98765 00000"
          value={profile.whatsappBusiness}
          onChange={(e) => setField("whatsappBusiness", e.target.value)}
        />
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={profile.whatsappEnabled}
            onChange={(e) => setField("whatsappEnabled", e.target.checked)}
          />
          Allow buyers to contact me on WhatsApp
        </label>
        <button className="primary" type="submit">
          Save profile
        </button>
      </form>

      <p className="muted">Assigned categories: {assigned.map((c) => c.name).join(", ") || "None yet"}</p>

      <form className="card form" onSubmit={createProduct}>
        <h2>New product</h2>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" required />
        <label htmlFor="description2">Description</label>
        <textarea id="description2" name="description" required />
        <label htmlFor="categoryId">Category</label>
        <select id="categoryId" name="categoryId" required>
          {assigned.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="images">Images (up to 6)</label>
        <input id="images" name="images" type="file" accept="image/*" multiple />
        <button className="accent" type="submit" disabled={sellerStatus !== "APPROVED" || assigned.length === 0}>
          Submit for approval
        </button>
      </form>

      <section className="card">
        <h2>Your products</h2>
        {products.length === 0 ? (
          <EmptyState title="No products yet" body="Submit a listing after your account is approved." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.category.name}</td>
                    <td>
                      <span className={statusChip(p.status)}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Leads</h2>
        {leads.length === 0 ? (
          <EmptyState title="No buyer leads yet" body="Leads appear here when a buyer sends Get Best Price." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Product</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      {lead.buyer.name}
                      <br />
                      {lead.buyer.email}
                      <br />
                      {lead.buyer.phone}
                      {lead.buyer.buyerProfile?.whatsapp ? (
                        <>
                          <br />
                          WA {lead.buyer.buyerProfile.whatsapp}
                        </>
                      ) : null}
                    </td>
                    <td>{lead.product?.title ?? "—"}</td>
                    <td>{lead.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
