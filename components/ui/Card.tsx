interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-surface rounded-xl border border-line shadow-sm ${className}`}>
      {children}
    </div>
  );
}
