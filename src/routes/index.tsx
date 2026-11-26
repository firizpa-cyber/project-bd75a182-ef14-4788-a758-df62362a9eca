import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AlertTriangle, ArrowRight, PackagePlus, Receipt, ShoppingCart, TrendingUp, Wallet, Plus } from "lucide-react";
import { useData } from "@/lib/store";
import { useUser } from "@/lib/auth";
import { money, num } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { Panel, Stat, StockBadge, Thumb } from "@/components/crm/ui";

export const Route = createFileRoute("/")({
  head: () => pageHead("Главная", "Сводка продаж, остатков и прибыли магазина"),
  component: Dashboard,
});

function Dashboard() {
  const data = useData();
  const user = useUser();

  const s = useMemo(() => {
    const active = data.sales.filter((x) => !x.cancelled);
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const today = active.filter((x) => new Date(x.date) >= start);
    const month = active.filter((x) => Date.now() - new Date(x.date).getTime() < 30 * 86400000);
    const profit = (list: typeof active) => list.reduce((a, x) => a + x.total - x.items.reduce((b, i) => b + i.cost * i.qty, 0), 0);
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(start.getTime() - (13 - i) * 86400000);
      const e = d.getTime() + 86400000;
      const v = active.filter((x) => { const t = new Date(x.date).getTime(); return t >= d.getTime() && t < e; }).reduce((a, x) => a + x.total, 0);
      return { day: d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }), v };
    });
    const top = new Map<string, number>();
    month.forEach((x) => x.items.forEach((i) => top.set(i.productId, (top.get(i.productId) ?? 0) + i.qty)));
    const topList = [...top.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, q]) => ({ p: data.products.find((p) => p.id === id), q })).filter((x) => x.p);
    const low = data.products.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock);
    const stockValue = data.products.reduce((a, p) => a + p.cost * p.stock, 0);
    return { today, todaySum: today.reduce((a, x) => a + x.total, 0), monthSum: month.reduce((a, x) => a + x.total, 0), monthProfit: profit(month), days, topList, low, stockValue };
  }, [data]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{greet}, {user?.name.split(" ")[0]} 👋</h1>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {[
          { to: "/pos", icon: ShoppingCart, label: "Продать", primary: true },
          { to: "/stock", icon: PackagePlus, label: "Приёмка" },
          { to: "/products", icon: Plus, label: "Товар" },
        ].map((a) => (
          <Link key={a.label} to={a.to} className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-sm font-bold transition active:scale-95 md:flex-row ${a.primary ? "bg-gradient-primary text-primary-foreground shadow-glow" : "border bg-card shadow-soft hover:border-primary"}`}>
            <a.icon className="size-5" /> {a.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Wallet} label="Выручка сегодня" value={money(s.todaySum)} tone="primary" />
        <Stat icon={Receipt} label="Чеков сегодня" value={num(s.today.length)} tone="success" delay={60} />
        <Stat icon={TrendingUp} label="Прибыль за 30 дней" value={money(s.monthProfit)} tone="success" delay={120} />
        <Stat icon={AlertTriangle} label="Заканчиваются" value={`${s.low.length} поз.`} tone={s.low.length ? "warning" : "success"} delay={180} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><div className="text-sm text-muted-foreground">Выручка · 14 дней</div><div className="text-2xl font-extrabold">{money(s.monthSum)}<span className="ml-2 text-sm font-medium text-muted-foreground">за месяц</span></div></div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s.days} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval="preserveStartEnd" />
                <Tooltip formatter={(v: number) => money(v)} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} labelStyle={{ color: "var(--muted-foreground)" }} />
                <Area type="monotone" dataKey="v" name="Выручка" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Хиты продаж</h2><span className="text-xs text-muted-foreground">30 дней</span></div>
          <div className="space-y-3">
            {s.topList.map(({ p, q }, i) => (
              <div key={p!.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <div className="relative"><Thumb src={p!.image} alt={p!.name} className="size-11 rounded-xl" /><span className="absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span></div>
                <div className="min-w-0"><div className="truncate text-sm font-semibold">{p!.name}</div><div className="text-xs text-muted-foreground">{money(p!.price)}</div></div>
                <div className="text-sm font-bold">{q} шт</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold"><AlertTriangle className="size-4 text-warning" /> Пора заказать</h2>
          <Link to="/stock" className="flex items-center gap-1 text-sm font-semibold text-primary">Склад <ArrowRight className="size-4" /></Link>
        </div>
        {s.low.length === 0 ? <p className="text-sm text-muted-foreground">Все товары в наличии 🎉</p> : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {s.low.slice(0, 6).map((p) => (
              <div key={p.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/50 p-2">
                <Thumb src={p.image} alt={p.name} className="size-10 rounded-lg" />
                <div className="min-w-0"><div className="truncate text-sm font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">мин. {p.minStock} шт</div></div>
                <StockBadge p={p} />
              </div>
            ))}
          </div>
        )}
      </Panel>
      <p className="text-center text-xs text-muted-foreground">Стоимость склада по закупке: <b>{money(s.stockValue)}</b></p>
    </div>
  );
}
