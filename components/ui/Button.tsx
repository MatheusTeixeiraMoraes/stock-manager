type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "hover:bg-slate-100 text-slate-600",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 ${sizeClass} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
