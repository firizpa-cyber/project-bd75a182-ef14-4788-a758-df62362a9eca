import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Minus, Plus, Search, ShoppingCart, Smartphone, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { actions, useData } from "@/lib/store";
import { useUser } from "@/lib/auth";
import { CATEGORIES, money } from "@/lib/format";
import { pageHead } from "@/lib/head";
import type { Category, Payment, SaleItem } from "@/lib/types";
import { Chips, Empty, fieldCls, Thumb } from "@/components/crm/ui";
import { BottomSheet } from "@/components/crm/BottomSheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pos")({
  head: () => pageHead("Касса", "Быстрая продажа товаров"),
  component: Pos,
});

const PAY: { id: Payment; label: string; icon: typeof Banknote }[] = [
  { id: "cash", label: "Наличные", icon: Banknote },
  { id: "card", label: "Карта", icon: CreditCard },
  { id: "transfer", label: "Перевод", icon: Smartphone },
];

function Pos() {
  const data = useData();
  const user = useUser();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState(0);
  const [pay, setPay] = useState<Payment>("cash");
  const [customer, setCustomer] = useState("");
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<{ number: number; total: number } | null>(null);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.products.filter((p) => (cat === "all" || p.category === cat) && (!t || `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(t)));
  }, [data.products, q, cat]);

  const lines = Object.entries(cart).map(([id, qty]) => ({ p: data.products.find((x) => x.id === id)!, qty })).filter((x) => x.p);
  const sum = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
  const total = Math.max(0, sum - discount);
  const count = lines.reduce((a, l) => a + l.qty, 0);

  const add = (id: string, d = 1) => {
    const p = data.products.find((x) => x.id === id);
    if (!p) return;
    setCart((c) => {
      const next = (c[id] ?? 0) + d;
      if (next > p.stock) { toast.error("Больше нет на складе"); return c; }
      const copy = { ...c };
      if (next <= 0) delete copy[id]; else copy[id] = next;
      return copy;
    });
  };

  const checkout = () => {
    if (!lines.length || !user) return;
    const items: SaleItem[] = lines.map((l) => ({ productId: l.p.id, name: l.p.name, qty: l.qty, price: l.p.price, cost: l.p.cost }));
    const number = actions.sell(items, discount, pay, customer || undefined, user.id);
    setDone({ number, total });
    setCart({}); setDiscount(0); setCustomer(""); setOpen(false);
  };

  const cartView = (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto">
        {lines.length === 0 ? <Empty icon={ShoppingCart} text="Нажмите на товар, чтобы добавить" /> : lines.map(({ p, qty }) => (
          <div key={p.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-background p-2">
            <Thumb src={p.image} alt={p.name} className="size-12 rounded-lg" />
            <div className="min-w-0"><div className="truncate text-sm font-semibold">{p.name}</div><div className="text-sm font-bold text-primary">{money(p.price * qty)}</div></div>
            <div className="flex items-center gap-1">
              <button aria-label="Меньше" onClick={() => add(p.id, -1)} className="flex size-8 items-center justify-center rounded-lg bg-muted active:scale-90">{qty === 1 ? <Trash2 className="size-3.5 text-destructive" /> : <Minus className="size-3.5" />}</button>
              <span className="w-6 text-center text-sm font-bold">{qty}</span>
              <button aria-label="Больше" onClick={() => add(p.id)} className="flex size-8 items-center justify-center rounded-lg bg-muted active:scale-90"><Plus className="size-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-3 border-t pt-4">
        <div className="grid grid-cols-2 gap-2">
          <select className={fieldCls} value={customer} onChange={(e) => setCustomer(e.target.value)} aria-label="Клиент">
            <option value="">Без клиента</option>
            {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className={fieldCls} type="number" inputMode="numeric" min={0} placeholder="Скидка" value={discount || ""} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} aria-label="Скидка" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PAY.map((p) => (
            <button key={p.id} onClick={() => setPay(p.id)} className={cn("flex flex-col items-center gap-1 rounded-xl border py-2 text-xs font-semibold transition", pay === p.id ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground")}>
              <p.icon className="size-4" /> {p.label}
            </button>
          ))}
        </div>
        {discount > 0 && <div className="flex justify-between text-sm text-muted-foreground"><span>Без скидки</span><span className="line-through">{money(sum)}</span></div>}
        <button disabled={!lines.length} onClick={checkout} className="flex h-14 w-full items-center justify-between rounded-2xl bg-gradient-primary px-5 font-bold text-primary-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-40 disabled:shadow-none">
          <span>Оплатить</span><span className="text-lg">{money(total)}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
      <div>
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight md:text-3xl">Касса</h1>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <input className={fieldCls + " h-12 pl-10"} placeholder="Поиск по названию или артикулу" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button aria-label="Очистить" onClick={() => setQ("")} className="absolute right-3 top-3.5 text-muted-foreground"><X className="size-4" /></button>}
        </div>
        <div className="mb-4"><Chips value={cat} onChange={setCat} items={[{ id: "all" as const, label: "Все" }, ...CATEGORIES]} /></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => {
            const inCart = cart[p.id] ?? 0;
            return (
              <button key={p.id} disabled={p.stock === 0} onClick={() => add(p.id)} className={cn("group relative overflow-hidden rounded-2xl border bg-card text-left shadow-soft transition active:scale-[0.97] disabled:opacity-45", inCart && "border-primary ring-3 ring-primary/20")}>
                <Thumb src={p.image} alt={p.name} className="aspect-[4/3] w-full" />
                {inCart > 0 && <span className="absolute right-2 top-2 flex size-7 animate-rise items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-glow">{inCart}</span>}
                <div className="p-3">
                  <div className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">{p.name}</div>
                  <div className="mt-1 flex items-center justify-between gap-2"><span className="font-extrabold">{money(p.price)}</span><span className="text-xs text-muted-foreground">{p.stock ? `${p.stock} шт` : "нет"}</span></div>
                </div>
              </button>
            );
          })}
        </div>
        {list.length === 0 && <Empty icon={Search} text="Ничего не найдено" />}
      </div>

      <aside className="sticky top-20 hidden h-[calc(100dvh-7rem)] rounded-2xl border bg-card p-4 shadow-soft lg:block">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><ShoppingCart className="size-5" /> Чек {count > 0 && <span className="rounded-full bg-accent px-2 text-xs text-accent-foreground">{count}</span>}</h2>
        <div className="h-[calc(100%-2.5rem)]">{cartView}</div>
      </aside>

      {count > 0 && (
        <button onClick={() => setOpen(true)} className="fixed inset-x-4 bottom-20 z-20 flex h-14 animate-rise items-center justify-between rounded-2xl bg-gradient-primary px-5 font-bold text-primary-foreground shadow-glow lg:hidden">
          <span className="flex items-center gap-2"><ShoppingCart className="size-5" /> {count} шт</span><span>{money(total)}</span>
        </button>
      )}
      <BottomSheet open={open} onClose={() => setOpen(false)} title={`Чек · ${count} шт`}>
        <div className="h-[70dvh]">{cartView}</div>
      </BottomSheet>

      <BottomSheet open={!!done} onClose={() => setDone(null)} title="Оплачено" className="items-stretch text-center">
          <div className="mx-auto flex size-16 animate-rise items-center justify-center rounded-full bg-success-soft text-success"><CheckCircle2 className="size-9" /></div>
          <p className="text-lg font-bold">Продажа №{done?.number}</p>
          <p className="text-3xl font-extrabold">{money(done?.total ?? 0)}</p>
          <button onClick={() => setDone(null)} className="mt-2 h-12 rounded-xl bg-primary font-bold text-primary-foreground">Новая продажа</button>
      </BottomSheet>
    </div>
  );
}
