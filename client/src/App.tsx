import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { api, getToken, setToken, type Role, type User } from "./api";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminPage } from "./pages/AdminPage";
import { BuyerDashboard } from "./pages/BuyerDashboard";
import { CatalogPage } from "./pages/CatalogPage";
import { CmsPage } from "./pages/CmsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PostRequirementPage } from "./pages/PostRequirementPage";
import { ProductPage } from "./pages/ProductPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SellerDashboard } from "./pages/SellerDashboard";
import { SellerPage } from "./pages/SellerPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { SessionContext } from "./session";

function Layout() {
  return (
    <>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function RequireRole({ roles }: { roles: Role[] }) {
  const token = getToken();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get<{ user: User }>("/api/auth/me")
      .then((data) => setUser(data.user))
      .finally(() => setReady(true));
  }, [token]);

  if (!ready) return <p className="wrap page-pad">Loading…</p>;
  if (!user || !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sellerStatus, setSellerStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setSellerStatus(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<{ user: User; seller: { status: string } | null }>("/api/auth/me");
      setUser(data.user);
      setSellerStatus(data.seller?.status ?? null);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const session = useMemo(
    () => ({
      user,
      sellerStatus,
      loading,
      refresh,
      logout: () => {
        setToken(null);
        setUser(null);
        setSellerStatus(null);
      },
    }),
    [user, sellerStatus, loading, refresh],
  );

  return (
    <SessionContext.Provider value={session}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<CatalogPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/post-requirement" element={<PostRequirementPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/sellers/:id" element={<SellerPage />} />
            <Route path="/page/:slug" element={<CmsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<RequireRole roles={["BUYER"]} />}>
              <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
            </Route>
            <Route element={<RequireRole roles={["SELLER"]} />}>
              <Route path="/dashboard/seller" element={<SellerDashboard />} />
            </Route>
            <Route element={<RequireRole roles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}
