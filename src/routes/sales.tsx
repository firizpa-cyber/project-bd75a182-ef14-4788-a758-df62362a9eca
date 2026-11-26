import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Banknote, CreditCard, Receipt, RotateCcw, Smartphone, User } from "lucide-react";
import { toast } from "sonner";
import { actions, useData } from "@/lib/store";
import { dateTime, money, payLabel } from "@/lib/format";
import { pageHead } from "@/lib/head";
import type { Sale } from "@/lib/types";
import { Chips, Empty, PageHeader, Stat } from "@/components/crm/ui";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sales")({
  head: () => pageHead("Продажи", "История продаж и возвраты"),
  component: Sales,
});

type Period = "today" | "week" | "month" | "all";
const payIcon = { cash: Banknote, card: CreditCard, transfer: Smartphone };

function Sales() {
  const data = useData();
  const [period, setPeriod] = useState<Period>("week");
  const [open, setOpen] = useState<Sale | null>(null);

  const list = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const from = period === "today" ? start.getTime() : period === "week" ? start.getTime() - 6 * 86400000 : period === "month" ? start.getTime() - 29 * 86400000 : 0;
    return data.sales.filter((s) => new Date(s.date).getTime() >= from);
  }, [data.sales, period]);
  const active = list.filter((s) => !s.cancelled);
  const revenue = active.reduce((a, s) => a + s.total, 0);
  const profit = active.reduce((a, s) => a + s.total - s.items.reduce((b, i) => b + i.cost * i.qty, 0), 0);
  const cust = (id?: string) => data.customers.find((c) => c.id === id)?.name;

  return (
    <div>
      <PageHeader title="Продажи" subtitle="История чеков" />
      <div className="mb-4"><Chips value={period} onChange={setPeriod} items={[{ id: "today", label: "Сегодня" }, { id: "week", label: "7 дней" }, { id: "month", label: "30 дней" }, { id: "all", label: "Всё время" }]} /></div>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat icon={Receipt} label="Чеков" value={String(active.length)} />
        <Stat icon={Banknote} label="Выручка" value={money(revenue)} tone="success" delay={60} />
        <Stat icon={CreditCard} label="Средний чек" value={money(active.length ? revenue / active.length : 0)} tone="warning" delay={120} />
      </div>
      <p className="mb-3 text-sm text-muted-foreground">Прибыль за период: <b className="text-success">{money(profit)}</b></p>
      {list.length === 0 ? <Empty icon={Receipt} text="Продаж за период нет" /> : (
        <div className="divide-y overflow-hidden rounded-2xl border bg-card shadow-soft">
          {list.map((s) => {
            const Icon = payIcon[s.payment];
            return (
              <button key={s.id} onClick={() => setOpen(s)} className={cn("grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3 text-left transition hover:bg-muted/50", s.cancelled && "opacity-50")}>
                <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-5" /></div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">№{s.number} · {s.items.length === 1 ? s.items[0]?.name : `${s.items.length} товара`}</div>
                  <div className="truncate text-xs text-muted-foreground">{dateTime(s.date)}{cust(s.customerId) ? ` · ${cust(s.customerId)}` : ""}</div>
                </div>
                <div className="text-right">
                  <div className={cn("font-bold", s.cancelled && "line-through")}>{money(s.total)}</div>
                  {s.cancelled && <div className="text-xs font-semibold text-destructive">Возврат</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="rounded-3xl">
          {open && (
            <>
              <DialogTitle className="text-xl font-extrabold">Чек №{open.number}</DialogTitle>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-muted px-2.5 py-1 font-semibold">{dateTime(open.date)}</span>
                <span className="rounded-full bg-muted px-2.5 py-1 font-semibold">{payLabel(open.payment)}</span>
                {cust(open.customerId) && <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-semibold text-accent-foreground"><User className="size-3" />{cust(open.customerId)}</span>}
              </div>
              <div className="divide-y rounded-xl border">
                {open.items.map((i) => (
                  <div key={i.productId} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-3 text-sm">
                    <div className="min-w-0"><div className="truncate font-semibold">{i.name}</div><div className="text-xs text-muted-foreground">{i.qty} × {money(i.price)}</div></div>
                    <div className="font-bold">{money(i.qty * i.price)}</div>
                  </div>
                ))}
              </div>
              {open.discount > 0 && <div className="flex justify-between text-sm"><span>Скидка</span><span>−{money(open.discount)}</span></div>}
              <div className="flex justify-between text-xl font-extrabold"><span>Итого</span><span>{money(open.total)}</span></div>
              {!open.cancelled ? (
                <button onClick={() => { actions.cancelSale(open.id); toast.success("Возврат оформлен, товар вернулся на склад"); setOpen(null); }} className="flex h-12 items-center justify-center gap-2 rounded-xl border font-bold text-destructive"><RotateCcw className="size-4" /> Оформить возврат</button>
              ) : <p className="text-center text-sm font-semibold text-destructive">Возврат оформлен</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
