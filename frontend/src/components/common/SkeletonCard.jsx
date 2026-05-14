export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="skeleton aspect-[2/3] rounded-xl" />
      <div className="p-3 bg-[#0f1623] space-y-2">
        <div className="skeleton h-3.5 rounded-lg w-4/5" />
        <div className="skeleton h-2.5 rounded-lg w-2/5" />
      </div>
    </div>
  )
}

export function SkeletonRow({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
