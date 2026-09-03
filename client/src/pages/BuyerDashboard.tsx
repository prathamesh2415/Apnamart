import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, api } from "../api";
import { EmptyState } from "../components/EmptyState";
import { usePageTitle } from "../hooks";
import { formatDate } from "../lib/format";
import { useSession } from "../session";

type Lead = {
  id: string;
  message: string;
  createdAt: string;
  channel?: string;
  product: { title: string } | null;
  seller: { companyName: string; user: { name: string; phone: string | null; email: string } };
};

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  city: string;
  whatsapp: string;
  gstin: string;
};

export function BuyerDashboard() {
  usePageTitle("My profile | ApnaMart");
  const { refresh } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    city: "",
    whatsapp: "",
    gstin: "",
  });
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ profile: ProfileForm }>("/api/buyer/profile"),
      api.get<{ leads: Lead[] }>("/api/buyer/leads"),
    ])
      .then(([profileData, leadData]) => {
        setProfile(profileData.profile);
        setLeads(leadData.leads);
      })
      .catch(() => setError("Could not load buyer workspace"))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setOk("");
    try {
      const data = await api.patch<{ profile: ProfileForm }>("/api/buyer/profile", {
        name: profile.name,
        phone: profile.phone || undefined,
        companyName: profile.companyName,
        city: profile.city,
        whatsapp: profile.whatsapp,
        gstin: profile.gstin,
      });
      setProfile(data.profile);
      setOk("Profile saved. Dealers will see these details on emailed requirements.");
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    }
  }

  return (
    <div className="wrap page-pad stack">
      <div className="dash-head">
        <div>
          <h1>Buyer workspace</h1>
          <p className="muted">Keep your details current so dealers can reply by email or WhatsApp.</p>
        </div>
        <Link className="btn-accent" to="/post-requirement">
          Post requirement
        </Link>
      </div>
      {error ? <p className="banner error">{error}</p> : null}
      {ok ? <p className="banner ok">{ok}</p> : null}
      {loading ? <div className="skeleton" style={{ height: 180 }} /> : null}

      <form className="card form" onSubmit={saveProfile}>
        <h2>Your profile</h2>
        <label htmlFor="b-name">Full name</label>
        <input id="b-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
        <label htmlFor="b-email">Email</label>
        <input id="b-email" value={profile.email} disabled />
        <label htmlFor="b-company">Company</label>
        <input
          id="b-company"
          value={profile.companyName}
          onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
        />
        <label htmlFor="b-city">City</label>
        <input id="b-city" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
        <label htmlFor="b-phone">Phone</label>
        <input id="b-phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        <label htmlFor="b-wa">WhatsApp</label>
        <input
          id="b-wa"
          placeholder="+91 98765 00000"
          value={profile.whatsapp}
          onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
        />
        <label htmlFor="b-gst">GSTIN (optional)</label>
        <input id="b-gst" value={profile.gstin} onChange={(e) => setProfile({ ...profile, gstin: e.target.value })} />
        <button className="primary" type="submit">
          Save profile
        </button>
      </form>

      <h2>My inquiries</h2>
      {!loading && leads.length === 0 ? (
        <EmptyState
          title="No inquiries yet"
          body="Search the catalog or post a requirement to contact a supplier."
          actionLabel="Browse products"
          actionTo="/search"
        />
      ) : null}
      {leads.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Contact</th>
                <th>Product</th>
                <th>Channel</th>
                <th>Message</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.seller.companyName}</td>
                  <td>
                    {lead.seller.user.name}
                    <br />
                    {lead.seller.user.phone}
                    <br />
                    {lead.seller.user.email}
                  </td>
                  <td>{lead.product?.title ?? "—"}</td>
                  <td>{lead.channel ?? "FORM"}</td>
                  <td>{lead.message}</td>
                  <td>{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
