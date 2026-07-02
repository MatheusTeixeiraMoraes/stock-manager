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
        <span className="block text-sm font-medium text-zinc-800">{label}</span>
        {optional && <span className="text-xs text-zinc-400">opcional</span>}
      </div>
      {children}
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

export function inputClass() {
  return "w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
}
