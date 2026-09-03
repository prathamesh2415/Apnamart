type Stats = { products: number; sellers: number; buyers: number; categories: number };

function formatCount(value: number): string {
  if (value >= 100) return `${value}+`;
  return String(value);
}

export function TrustBar({ stats }: { stats?: Stats | null }) {
  const items = [
    { value: stats ? formatCount(stats.products) : "Live", label: "Approved product listings" },
    { value: stats ? formatCount(stats.sellers) : "Verified", label: "Supplier companies" },
    { value: stats ? formatCount(stats.buyers) : "Active", label: "Buyer companies" },
    { value: "Direct", label: "Contact — no platform checkout" },
  ];
  return (
    <section className="trust-bar" aria-label="Platform highlights">
      <div className="wrap">
        {items.map((item) => (
          <div className="trust-item" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
