export default function NewReportLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-32 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
