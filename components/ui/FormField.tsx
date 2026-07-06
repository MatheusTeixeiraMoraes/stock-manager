interface FormFieldProps {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export default function FormField({ label, optional, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-1.5">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {optional && <span className="text-xs text-ink-soft/70">opcional</span>}
      </div>
      {children}
      {hint && <p className="text-xs text-ink-soft/80">{hint}</p>}
    </div>
  );
}

export function inputClass() {
  return "w-full border border-line rounded-lg px-3 py-2.5 text-sm text-ink bg-surface placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition";
}
