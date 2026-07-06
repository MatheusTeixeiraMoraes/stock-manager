type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "teal";

const variants: Record<BadgeVariant, string> = {
  default: "bg-tan text-tan-ink",
  success: "bg-moss-soft text-moss-ink",
  warning: "bg-warn-soft text-warn-ink",
  danger: "bg-danger-soft text-danger",
  info: "bg-accent-soft text-accent",
  teal: "bg-accent-soft text-accent",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
