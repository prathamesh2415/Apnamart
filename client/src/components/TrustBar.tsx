const ITEMS = [
  { value: "12L+", label: "Product enquiries facilitated" },
  { value: "4.8L+", label: "Suppliers across India" },
  { value: "Direct", label: "Contact — no platform fees" },
  { value: "Verified", label: "Seller approval workflow" },
];

export function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Platform highlights">
      <div className="wrap">
        {ITEMS.map((item) => (
          <div className="trust-item" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
