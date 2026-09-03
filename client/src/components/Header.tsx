import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSession } from "../session";
import { BrandLogo } from "./BrandLogo";
import { IconClose, IconMenu } from "./Icons";
import { SearchBar } from "./SearchBar";

export function Header() {
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);

  const dashboard =
    user?.role === "ADMIN" ? "/admin" : user?.role === "SELLER" ? "/dashboard/seller" : "/dashboard/buyer";

  return (
    <header className="header-wrap">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="topbar">
        <div className="wrap">
          <span className="topbar-tag">India’s B2B marketplace · Direct supplier contact</span>
          <div className="topbar-links">
            <NavLink to="/register">Sell on ApnaMart</NavLink>
            <NavLink to="/page/contact">Help</NavLink>
            {user ? (
              <button type="button" onClick={logout}>
                Sign out
              </button>
            ) : (
              <NavLink to="/login">Sign in</NavLink>
            )}
          </div>
        </div>
      </div>
      <div className="header">
        <div className="wrap header-main">
          <BrandLogo />
          <div className="header-search">
            <SearchBar variant="header" />
          </div>
          <div className="header-actions">
            <NavLink className="btn-accent hide-sm" to="/post-requirement">
              Post Requirement
            </NavLink>
            <button
              className="nav-toggle"
              type="button"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
        <div className={`wrap header-drawer ${open ? "open" : ""}`}>
          <NavLink to="/search" onClick={() => setOpen(false)}>
            Products
          </NavLink>
          <NavLink to="/suppliers" onClick={() => setOpen(false)}>
            Suppliers
          </NavLink>
          <NavLink to="/post-requirement" onClick={() => setOpen(false)}>
            Post Requirement
          </NavLink>
          <NavLink to="/register" onClick={() => setOpen(false)}>
            Sell on ApnaMart
          </NavLink>
          {user ? (
            <>
              <NavLink to={dashboard} onClick={() => setOpen(false)}>
                {user.role === "ADMIN" ? "Admin" : user.role === "SELLER" ? "Seller desk" : "My profile"}
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Sign in
              </NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
      <nav className="subnav" aria-label="Marketplace">
        <div className="wrap">
          <NavLink to="/search">All products</NavLink>
          <NavLink to="/suppliers">Suppliers</NavLink>
          <NavLink to="/post-requirement">Post requirement</NavLink>
          <NavLink to="/page/about">About</NavLink>
          {user?.role === "BUYER" ? <NavLink to="/dashboard/buyer">My profile</NavLink> : null}
          {user?.role === "SELLER" ? <NavLink to="/dashboard/seller">Seller desk</NavLink> : null}
          {user?.role === "ADMIN" ? <NavLink to="/admin">Admin</NavLink> : null}
        </div>
      </nav>
    </header>
  );
}
