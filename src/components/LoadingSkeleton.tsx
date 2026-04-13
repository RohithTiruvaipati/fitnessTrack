export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-dark-border rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <LoadingSkeleton className="h-6 w-1/3 mb-4" />
      <LoadingSkeleton className="h-8 w-1/2 mb-2" />
      <LoadingSkeleton className="h-4 w-1/4" />
    </div>
  );
}

export function GraphSkeleton() {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6 h-80">
      <LoadingSkeleton className="h-6 w-1/4 mb-4" />
      <LoadingSkeleton className="h-64 w-full" />
    </div>
  );
}
