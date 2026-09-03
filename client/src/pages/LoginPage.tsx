import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, api, setToken, type User } from "../api";
import { usePageTitle } from "../hooks";
import { dashboardPath, registerPath, safeNext } from "../lib/navigation";
import { useSession } from "../session";

export function LoginPage() {
  usePageTitle("Sign in | ApnaMart");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = params.get("next");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ token: string; user: User }>("/api/auth/login", { email, password });
      setToken(data.token);
      await refresh();
      navigate(safeNext(next, dashboardPath(data.user.role)));
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <aside className="auth-panel">
        <h1>Welcome back to ApnaMart</h1>
        <p>Sign in to send Get Best Price inquiries, manage leads, or list your company as a supplier.</p>
      </aside>
      <div className="auth-form">
        <form className="form" onSubmit={onSubmit}>
          <h2>Sign in</h2>
          {error ? <p className="banner error">{error}</p> : null}
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="accent" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="muted">
            New here? <Link to={registerPath(next ?? undefined)}>Create a free account</Link>
          </p>
        </form>
        <div className="demo-logins">
          <p className="demo-logins-title">Try a demo account</p>
          <p className="muted">Fills the form. Same logins after Neon is seeded.</p>
          <button className="ghost" type="button" onClick={() => { setEmail("buyer@marketplace.local"); setPassword("BuyerPass123"); }}>
            Buyer
          </button>
          <button className="ghost" type="button" onClick={() => { setEmail("seller@marketplace.local"); setPassword("SellerPass123"); }}>
            Seller
          </button>
          <button className="ghost" type="button" onClick={() => { setEmail("admin@marketplace.local"); setPassword("ChangeMeAdmin123"); }}>
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}
