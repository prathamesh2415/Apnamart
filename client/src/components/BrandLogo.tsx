import { NavLink } from "react-router-dom";

export function BrandLogo() {
  return (
    <NavLink className="brand" to="/" aria-label="ApnaMart home">
      <span className="brand-mark" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M5 19V9.5L12 5l7 4.5V19h-4.5v-6h-5V19H5z" fill="#fff" />
        </svg>
      </span>
      <span className="brand-name">
        Apna<span>Mart</span>
      </span>
    </NavLink>
  );
}
