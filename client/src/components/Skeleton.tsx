export function ProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="card product-card skel-card skeleton" key={i} />
      ))}
    </div>
  );
}
