import { Link } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <BrandLogo />
          <p>India’s B2B marketplace for discovering suppliers and generating qualified buyer leads.</p>
        </div>
        <div>
          <h3>Buy</h3>
          <Link to="/search">Browse products</Link>
          <Link to="/suppliers">Find suppliers</Link>
          <Link to="/post-requirement">Post your requirement</Link>
          <Link to="/register">Register as buyer</Link>
        </div>
        <div>
          <h3>Sell</h3>
          <Link to="/register">Sell on ApnaMart</Link>
          <Link to="/dashboard/seller">Seller desk</Link>
          <Link to="/page/contact">Talk to us</Link>
        </div>
        <div>
          <h3>Company</h3>
          <Link to="/page/about">About</Link>
          <Link to="/page/contact">Contact</Link>
          <Link to="/page/terms">Terms</Link>
          <Link to="/page/privacy">Privacy</Link>
        </div>
      </div>
      <div className="wrap footer-legal">
        Lead generation only — no payments or listed prices on the platform. Deals close directly between buyer and
        seller.
      </div>
    </footer>
  );
}
