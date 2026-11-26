import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border bg-card p-4 shadow-soft md:p-5", className)}>{children}</div>;
}

const tones = {
  primary: "bg-accent text-accent-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-destructive",
} as const;

export function Stat({ icon: Icon, label, value, hint, tone = "primary", delay = 0 }: { icon: LucideIcon; label: string; value: string; hint?: string; tone?: keyof typeof tones; delay?: number }) {
  return (
    <div className="animate-rise rounded-2xl border bg-card p-4 shadow-soft" style={{ animationDelay: `${delay}ms` }}>
      <div className={cn("mb-3 inline-flex size-10 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="size-5" />
      </div>
      <div className="truncate text-xl font-extrabold tracking-tight md:text-2xl">{value}</div>
      <div className="mt-0.5 truncate text-xs text-muted-foreground md:text-sm">{label}</div>
      {hint && <div className="mt-1 truncate text-xs font-semibold text-success">{hint}</div>}
    </div>
  );
}

export function StockBadge({ p }: { p: Pick<Product, "stock" | "minStock"> }) {
  const tone = p.stock === 0 ? "danger" : p.stock <= p.minStock ? "warning" : "success";
  const label = p.stock === 0 ? "Нет" : `${p.stock} шт`;
  return <span className={cn("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-bold", tones[tone])}>{label}</span>;
}

export function Thumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      <img src={src} alt={alt} loading="lazy" className="size-full object-cover" />
    </div>
  );
}

export function Chips<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
      {items.map((i) => (
        <button
          key={i.id}
          onClick={() => onChange(i.id)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all active:scale-95",
            value === i.id ? "border-transparent bg-primary text-primary-foreground shadow-glow" : "bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-muted-foreground">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="size-6" />
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export const fieldCls =
  "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-hidden transition focus:border-primary focus:ring-3 focus:ring-primary/15";
