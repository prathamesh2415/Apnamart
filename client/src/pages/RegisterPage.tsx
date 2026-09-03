import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, api, setToken, type User } from "../api";
import { usePageTitle } from "../hooks";
import { dashboardPath, loginPath, safeNext } from "../lib/navigation";
import { useSession } from "../session";

export function RegisterPage() {
  usePageTitle("Register | ApnaMart");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refresh } = useSession();
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = params.get("next");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ token: string; user: User }>("/api/auth/register", {
        role,
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
        phone: form.get("phone") || undefined,
        companyName: role === "SELLER" ? form.get("companyName") : undefined,
      });
      setToken(data.token);
      await refresh();
      navigate(safeNext(next, dashboardPath(data.user.role)));
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <aside className="auth-panel">
        <h1>{role === "SELLER" ? "Grow with buyer inquiries" : "Source from verified suppliers"}</h1>
        <p>
          {role === "SELLER"
            ? "List your company, publish products after admin approval, and receive qualified leads."
            : "Search the catalog, post a requirement, and contact suppliers directly — no platform checkout."}
        </p>
      </aside>
      <div className="auth-form">
        <form className="form" onSubmit={onSubmit}>
          <h2>Create your ApnaMart account</h2>
          {error ? <p className="banner error">{error}</p> : null}
          <div>
            <span className="status">I am a</span>
            <div className="role-toggle" role="group" aria-label="Account type">
              <button type="button" className={role === "BUYER" ? "active" : ""} onClick={() => setRole("BUYER")}>
                Buyer
              </button>
              <button type="button" className={role === "SELLER" ? "active" : ""} onClick={() => setRole("SELLER")}>
                Seller
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required />
          </div>
          {role === "SELLER" ? (
            <div>
              <label htmlFor="companyName">Company name</label>
              <input id="companyName" name="companyName" required />
            </div>
          ) : null}
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" />
          </div>
          <div>
            <label htmlFor="password">Password (min 8 characters)</label>
            <input id="password" name="password" type="password" minLength={8} required />
          </div>
          <button className="accent" type="submit" disabled={loading}>
            {loading ? "Creating…" : role === "SELLER" ? "Start selling" : "Create buyer account"}
          </button>
          <p className="muted">
            Already registered? <Link to={loginPath(next ?? undefined)}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
