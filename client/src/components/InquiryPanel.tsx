import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ApiError, api } from "../api";
import { loginPath, registerPath } from "../lib/navigation";
import { mailtoUrl, whatsappUrl } from "../lib/format";
import { useSession } from "../session";
import { IconMail, IconWhatsApp } from "./Icons";

export type DealerContact = {
  email: string | null;
  emailInquiriesEnabled: boolean;
  whatsapp: string | null;
};

type BuyerProfile = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  city: string;
  whatsapp: string;
};

type Props = {
  sellerId: string;
  sellerName: string;
  productId?: string;
  productTitle?: string;
  defaultMessage?: string;
  contact?: DealerContact;
};

export function InquiryPanel({
  sellerId,
  sellerName,
  productId,
  productTitle,
  defaultMessage,
  contact,
}: Props) {
  const { user } = useSession();
  const location = useLocation();
  const next = `${location.pathname}${location.search}`;
  const [message, setMessage] = useState(
    defaultMessage ?? "We would like a discussion on supply, MOQ, and lead time.",
  );

  useEffect(() => {
    if (defaultMessage) setMessage(defaultMessage);
  }, [defaultMessage]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);

  useEffect(() => {
    if (user?.role !== "BUYER") return;
    api
      .get<{ profile: BuyerProfile }>("/api/buyer/profile")
      .then((data) => setBuyer(data.profile))
      .catch(() => setBuyer(null));
  }, [user]);

  const composed = [
    message.trim(),
    "",
    buyer?.companyName ? `Company: ${buyer.companyName}` : null,
    buyer?.city ? `City: ${buyer.city}` : null,
    buyer?.phone ? `Phone: ${buyer.phone}` : null,
    buyer?.whatsapp ? `WhatsApp: ${buyer.whatsapp}` : null,
    user?.email ? `Email: ${user.email}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  async function send(channel: "FORM" | "EMAIL" | "WHATSAPP") {
    setError("");
    setOk("");
    setLoading(true);
    try {
      await api.post("/api/leads", { sellerId, productId, message: composed, channel });
      if (channel === "EMAIL") {
        setOk(`Requirement emailed to ${sellerName}'s registered dealer inbox.`);
      } else if (channel === "WHATSAPP") {
        setOk("Requirement logged. Opening WhatsApp…");
      } else {
        setOk("Requirement submitted. The dealer will reply by email or WhatsApp.");
      }
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not send requirement");
    } finally {
      setLoading(false);
    }
  }

  function onForm(event: React.FormEvent) {
    event.preventDefault();
    void send("FORM");
  }

  async function emailDealer() {
    if (user?.role === "BUYER") {
      await send("EMAIL");
      return;
    }
    if (contact?.email) {
      window.location.href = mailtoUrl(
        contact.email,
        `Requirement: ${productTitle ?? sellerName}`,
        composed,
      );
    }
  }

  async function openWhatsApp() {
    if (!contact?.whatsapp) return;
    if (user?.role === "BUYER") {
      await send("WHATSAPP");
    }
    window.open(whatsappUrl(contact.whatsapp, composed), "_blank", "noopener,noreferrer");
  }

  return (
    <section className="card inquiry-card">
      <h2>Contact this dealer</h2>
      <p className="muted">
        Email their registered inbox, chat on WhatsApp Business, or file requirement details on ApnaMart.
      </p>
      <div className="contact-actions">
        {contact?.emailInquiriesEnabled !== false && (contact?.email || user?.role === "BUYER") ? (
          <button className="ghost" type="button" onClick={() => void emailDealer()} disabled={loading}>
            <IconMail size={16} /> Email requirement
          </button>
        ) : null}
        {contact?.whatsapp ? (
          <button className="btn-whatsapp" type="button" onClick={() => void openWhatsApp()} disabled={loading}>
            <IconWhatsApp size={16} /> WhatsApp
          </button>
        ) : null}
      </div>
      {user?.role === "BUYER" ? (
        <form className="form" onSubmit={onForm}>
          {error ? <p className="banner error">{error}</p> : null}
          {ok ? <p className="banner ok">{ok}</p> : null}
          <label htmlFor={`inq-${sellerId}`}>Requirement details</label>
          <textarea
            id={`inq-${sellerId}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
          />
          <p className="muted">
            Your profile name, company, city, and WhatsApp are attached automatically.{" "}
            <Link to="/dashboard/buyer">Edit profile</Link>
          </p>
          <button className="accent" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Submit requirement"}
          </button>
        </form>
      ) : user ? (
        <p className="banner warn">Sign in with a buyer account to file a requirement.</p>
      ) : (
        <p className="muted">
          <Link to={loginPath(next)}>Sign in</Link> as a buyer to email the dealer from ApnaMart, or{" "}
          <Link to={registerPath(next)}>create a free account</Link>.
        </p>
      )}
    </section>
  );
}
