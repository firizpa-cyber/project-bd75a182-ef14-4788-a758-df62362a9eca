import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Boxes, Cctv, LayoutGrid, LogOut, MoreHorizontal, Package, Receipt, Settings, ShoppingCart, Users, Lock } from "lucide-react";
import { logout, ROLE_LABEL, useUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Login } from "./Login";
import { ThemeButton } from "./ThemeButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Главная", icon: LayoutGrid },
  { to: "/pos", label: "Касса", icon: ShoppingCart },
  { to: "/products", label: "Товары", icon: Package },
  { to: "/sales", label: "Продажи", icon: Receipt },
  { to: "/stock", label: "Склад", icon: Boxes },
  { to: "/customers", label: "Клиенты", icon: Users },
  { to: "/settings", label: "Настройки", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const user = useUser();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [more, setMore] = useState(false);

  if (!ready)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex size-14 animate-pulse items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground"><Cctv className="size-7" /></div>
      </div>
    );
  if (!user) return <Login />;
  if (user.role !== "admin")
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="max-w-sm animate-rise text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-warning-soft text-warning"><Lock className="size-8" /></div>
          <h1 className="text-2xl font-extrabold">Доступ скоро откроется</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.name}, роль «{ROLE_LABEL[user.role]}» пока в разработке. Полный доступ есть у администратора.</p>
          <button onClick={logout} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-primary-foreground"><LogOut className="size-4" /> Выйти</button>
        </div>
      </div>
    );

  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  const initials = user.name.split(" ").map((x) => x[0]).join("").slice(0, 2);

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar p-4 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow"><Cctv className="size-5" /></div>
          <div><div className="font-extrabold leading-tight">Мой склад</div><div className="text-xs text-muted-foreground">Видеонаблюдение</div></div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all", isActive(n.to) ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground")}>
              <n.icon className="size-5" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 rounded-2xl border p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">{initials}</div>
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{user.name}</div><div className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</div></div>
          <button onClick={logout} aria-label="Выйти" className="text-muted-foreground hover:text-destructive"><LogOut className="size-4" /></button>
        </div>
      </aside>

      <div className="lg:pl-64">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 lg:invisible">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><Cctv className="size-5" /></div>
            <span className="font-extrabold">Мой склад</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeButton />
            <Link to="/settings" className="flex size-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground lg:hidden">{initials}</Link>
          </div>
        </div>
      </header>

      <main key={path} className="mx-auto max-w-7xl animate-rise px-4 pb-28 pt-5 md:px-6 lg:pb-10">
        {children}
      </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
          {[NAV[0], NAV[2], NAV[1], NAV[3]].map((n, i) =>
            i === 2 ? (
              <Link key={n.to} to={n.to} className="flex justify-center">
                <span className={cn("-mt-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow transition active:scale-90", isActive(n.to) && "ring-4 ring-accent")}>
                  <n.icon className="size-6" />
                </span>
              </Link>
            ) : (
              <Link key={n.to} to={n.to} className={cn("flex flex-col items-center gap-0.5 text-[11px] font-semibold transition", isActive(n.to) ? "text-primary" : "text-muted-foreground")}>
                <n.icon className="size-5" /> {n.label}
              </Link>
            ),
          )}
          <button onClick={() => setMore(true)} className={cn("flex flex-col items-center gap-0.5 text-[11px] font-semibold", ["/stock", "/customers", "/settings"].some(isActive) ? "text-primary" : "text-muted-foreground")}>
            <MoreHorizontal className="size-5" /> Ещё
          </button>
        </div>
      </nav>
      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Разделы</SheetTitle></SheetHeader>
          <div className="grid grid-cols-3 gap-3 p-4 pt-0">
            {[NAV[4], NAV[5], NAV[6]].map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMore(false)} className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-sm font-semibold">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><n.icon className="size-5" /></span>
                {n.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
