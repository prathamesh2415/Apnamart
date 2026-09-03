import { useEffect, useState } from "react";
import { ApiError, api } from "../api";
import { usePageTitle } from "../hooks";

type Stats = {
  buyers: number;
  sellers: number;
  products: number;
  leads: number;
  pendingSellers: number;
  pendingProducts: number;
};
type Category = { id: string; name: string };
type Seller = {
  id: string;
  companyName: string;
  status: string;
  user: { name: string; email: string };
  categories: { category: Category }[];
  _count: { products: number; leads: number };
};
type Product = { id: string; title: string; status: string; seller: { companyName: string }; category: { name: string } };
type CmsPage = { slug: string; title: string; body: string };

function statusChip(status: string) {
  if (status === "APPROVED") return "chip ok";
  if (status === "PENDING") return "chip warn";
  return "chip danger";
}

export function AdminPage() {
  usePageTitle("Admin | ApnaMart");
  const [stats, setStats] = useState<Stats | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    try {
      const [s, se, p, c, cms] = await Promise.all([
        api.get<Stats>("/api/admin/stats"),
        api.get<{ sellers: Seller[] }>("/api/admin/sellers"),
        api.get<{ products: Product[] }>("/api/admin/products"),
        api.get<{ categories: Category[] }>("/api/categories"),
        api.get<{ pages: CmsPage[] }>("/api/admin/cms"),
      ]);
      setStats(s);
      setSellers(se.sellers);
      setProducts(p.products);
      setCategories(c.categories);
      setPages(cms.pages);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Admin load failed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function setSellerStatus(id: string, status: string) {
    setError("");
    try {
      await api.patch(`/api/admin/sellers/${id}/status`, { status });
      setOk(`Seller ${status.toLowerCase()}`);
      await load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function saveSellerCategories(id: string, form: HTMLFormElement) {
    const selected = [...form.querySelectorAll<HTMLInputElement>("input[type=checkbox]:checked")].map((el) => el.value);
    await api.put(`/api/admin/sellers/${id}/categories`, { categoryIds: selected });
    setOk("Categories assigned");
    await load();
  }

  async function setProductStatus(id: string, status: string) {
    await api.patch(`/api/admin/products/${id}/status`, { status });
    setOk(`Product ${status.toLowerCase()}`);
    await load();
  }

  async function addCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("name") as string;
    await api.post("/api/admin/categories", { name });
    event.currentTarget.reset();
    await load();
  }

  async function saveCms(event: React.FormEvent<HTMLFormElement>, slug: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.patch(`/api/admin/cms/${slug}`, { title: form.get("title"), body: form.get("body") });
    setOk("CMS page saved");
    await load();
  }

  return (
    <div className="wrap page-pad stack">
      <div className="dash-head">
        <div>
          <h1>Admin console</h1>
          <p className="muted">Approve sellers and products, manage categories, and edit public pages.</p>
        </div>
      </div>
      {error ? <p className="banner error">{error}</p> : null}
      {ok ? <p className="banner ok">{ok}</p> : null}
      {stats ? (
        <div className="stats-grid">
          <article className="card stat-card">
            <strong>{stats.buyers}</strong>
            <span>Buyers</span>
          </article>
          <article className="card stat-card">
            <strong>{stats.sellers}</strong>
            <span>Sellers · {stats.pendingSellers} pending</span>
          </article>
          <article className="card stat-card">
            <strong>{stats.products}</strong>
            <span>Products · {stats.pendingProducts} pending</span>
          </article>
          <article className="card stat-card">
            <strong>{stats.leads}</strong>
            <span>Inquiries</span>
          </article>
        </div>
      ) : (
        <div className="skeleton" style={{ height: 90 }} />
      )}

      <h2>Sellers</h2>
      {sellers.map((seller) => (
        <section className="card stack" key={seller.id}>
          <div className="dash-head">
            <div>
              <strong>{seller.companyName}</strong>
              <p className="muted">
                {seller.user.name} · {seller.user.email} · {seller._count.products} products · {seller._count.leads}{" "}
                leads
              </p>
            </div>
            <span className={statusChip(seller.status)}>{seller.status}</span>
          </div>
          <p className="row">
            <button className="ghost" type="button" onClick={() => setSellerStatus(seller.id, "APPROVED")}>
              Approve
            </button>
            <button className="ghost" type="button" onClick={() => setSellerStatus(seller.id, "REJECTED")}>
              Reject
            </button>
            <button className="ghost" type="button" onClick={() => setSellerStatus(seller.id, "DEACTIVATED")}>
              Deactivate
            </button>
          </p>
          <form
            key={`${seller.id}-${seller.categories.map((c) => c.category.id).join(",")}`}
            onSubmit={(e) => {
              e.preventDefault();
              void saveSellerCategories(seller.id, e.currentTarget);
            }}
          >
            <p>Assign categories</p>
            <div className="row">
              {categories.map((c) => (
                <label key={c.id}>
                  <input
                    type="checkbox"
                    value={c.id}
                    defaultChecked={seller.categories.some((link) => link.category.id === c.id)}
                  />{" "}
                  {c.name}
                </label>
              ))}
            </div>
            <p>
              <button className="primary" type="submit">
                Save categories
              </button>
            </p>
          </form>
        </section>
      ))}

      <h2>Products</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Seller</th>
              <th>Category</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.seller.companyName}</td>
                <td>{p.category.name}</td>
                <td>
                  <span className={statusChip(p.status)}>{p.status}</span>
                </td>
                <td>
                  <button className="ghost" type="button" onClick={() => setProductStatus(p.id, "APPROVED")}>
                    Approve
                  </button>{" "}
                  <button className="ghost" type="button" onClick={() => setProductStatus(p.id, "REJECTED")}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card">
        <h2>Categories</h2>
        <ul>
          {categories.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
        <form className="form" onSubmit={addCategory}>
          <label htmlFor="catName">New category</label>
          <input id="catName" name="name" required />
          <button className="primary" type="submit">
            Create
          </button>
        </form>
      </section>

      <h2>CMS pages</h2>
      {pages.map((page) => (
        <form className="card form" key={page.slug} onSubmit={(e) => saveCms(e, page.slug)}>
          <h3>{page.slug}</h3>
          <label htmlFor={`t-${page.slug}`}>Title</label>
          <input id={`t-${page.slug}`} name="title" defaultValue={page.title} />
          <label htmlFor={`b-${page.slug}`}>Body</label>
          <textarea id={`b-${page.slug}`} name="body" defaultValue={page.body} />
          <button className="primary" type="submit">
            Save
          </button>
        </form>
      ))}
    </div>
  );
}
