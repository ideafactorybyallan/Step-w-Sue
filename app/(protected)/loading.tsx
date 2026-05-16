export default function Loading() {
  return (
    <div className="flex flex-col">
      <div className="bg-navy px-6 pt-10 pb-6">
        <div className="h-3 w-24 bg-white/10 rounded mb-3 animate-pulse" />
        <div className="h-10 w-40 bg-white/10 rounded mb-1 animate-pulse" />
        <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="px-4 pt-4 pb-6 space-y-3">
        <div className="h-32 bg-white rounded-2xl shadow-card animate-pulse" />
        <div className="h-24 bg-white rounded-2xl shadow-card animate-pulse" />
        <div className="h-40 bg-white rounded-2xl shadow-card animate-pulse" />
      </div>
    </div>
  );
}
