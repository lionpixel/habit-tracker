// ─────────────────────────────────────────────
//  Loading — skeleton global entre navegações
// ─────────────────────────────────────────────

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="space-y-1.5">
          <div className="h-6 w-40 rounded-lg skeleton" />
          <div className="h-3.5 w-56 rounded-lg skeleton" />
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl skeleton" />
        ))}
      </div>
      {/* Content blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl skeleton" />
        ))}
      </div>
    </div>
  )
}
