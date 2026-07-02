export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse" />
      <div className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 h-32 animate-pulse" />
        <div className="bg-white rounded-xl border border-slate-200 h-32 animate-pulse" />
      </div>
    </div>
  );
}
