export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-9 w-32 bg-slate-200 rounded-lg animate-pulse" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 h-80 animate-pulse" />
    </div>
  );
}
