export default function LearnAllLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-9 w-48 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-64 bg-muted animate-pulse rounded" />
      </div>
      <div className="mb-6 flex justify-end">
        <div className="h-10 w-full max-w-sm bg-muted animate-pulse rounded" />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
