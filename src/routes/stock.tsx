import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Boxes, History, MinusCircle, PackagePlus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { actions, useData } from "@/lib/store";
import { dateTime, money, MOVE_LABEL } from "@/lib/format";
import { pageHead } from "@/lib/head";
import { Chips, Empty, fieldCls, PageHeader, Panel, StockBadge, Thumb } from "@/components/crm/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stock")({
  head: () => pageHead("Склад", "Остатки, приёмка и движение товаров"),
  component: Stock,
});

type Tab = "left" | "in" | "out" | "log";

function Stock() {
  const [tab, setTab] = useState<Tab>("left");
  return (
    <div>
      <PageHeader title="Склад" subtitle="Остатки и движение" />
      <div className="mb-5 grid grid-cols-4 gap-1 rounded-2xl bg-muted p-1">
        {([["left", "Остатки", Boxes], ["in", "Приёмка", PackagePlus], ["out", "Списание", MinusCircle], ["log", "История", History]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-bold transition sm:flex-row sm:justify-center sm:text-sm", tab === id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground")}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>
      <div key={tab} className="animate-rise">
        {tab === "left" && <Leftovers />}
        {tab === "in" && <Receive />}
        {tab === "out" && <WriteOff />}
        {tab === "log" && <Log />}
      </div>
    </div>
  );
}

function Leftovers() {
  const { products } = useData();
  const [f, setF] = useState<"all" | "low" | "out">("all");
  const [q, setQ] = useState("");
  const list = products.filter((p) => (f === "all" || (f === "low" ? p.stock > 0 && p.stock <= p.minStock : p.stock === 0)) && p.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.stock / (a.minStock || 1) - b.stock / (b.minStock || 1));
  const total = products.reduce((a, p) => a + p.stock, 0);
  const value = products.reduce((a, p) => a + p.stock * p.cost, 0);
  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Panel><div className="text-2xl font-extrabold">{total} шт</div><div className="text-xs text-muted-foreground">На складе</div></Panel>
        <Panel><div className="truncate text-2xl font-extrabold">{money(value)}</div><div className="text-xs text-muted-foreground">По закупке</div></Panel>
      </div>
      <div className="relative mb-3"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><input className={fieldCls + " pl-10"} placeholder="Поиск" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="mb-4"><Chips value={f} onChange={setF} items={[{ id: "all", label: "Все" }, { id: "low", label: "Мало" }, { id: "out", label: "Нет в наличии" }]} /></div>
      {list.length === 0 ? <Empty icon={Boxes} text="Нет товаров" /> : (
        <div className="grid gap-2 md:grid-cols-2">
          {list.map((p) => {
            const pct = Math.min(100, (p.stock / Math.max(p.minStock * 3, 1)) * 100);
            const tone = p.stock === 0 ? "bg-destructive" : p.stock <= p.minStock ? "bg-warning" : "bg-success";
            return (
              <div key={p.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card p-3 shadow-soft">
                <Thumb src={p.image} alt={p.name} className="size-12 rounded-xl" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${Math.max(pct, 3)}%` }} /></div>
                </div>
                <StockBadge p={p} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function Receive() {
  const { products } = useData();
  const [lines, setLines] = useState<{ productId: string; qty: number; cost: number }[]>([]);
  const [pid, setPid] = useState("");
  const [note, setNote] = useState("");
  const addLine = () => {
    const p = products.find((x) => x.id === pid);
    if (!p || lines.some((l) => l.productId === pid)) return;
    setLines([...lines, { productId: p.id, qty: 1, cost: p.cost }]);
    setPid("");
  };
  const total = lines.reduce((a, l) => a + l.qty * l.cost, 0);
  const submit = () => {
    actions.receive(lines.filter((l) => l.qty > 0), note);
    toast.success(`Принято ${lines.reduce((a, l) => a + l.qty, 0)} шт`);
    setLines([]); setNote("");
  };
  return (
    <Panel className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <select className={fieldCls} value={pid} onChange={(e) => setPid(e.target.value)} aria-label="Товар">
          <option value="">Выберите товар…</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock} шт)</option>)}
        </select>
        <button onClick={addLine} disabled={!pid} aria-label="Добавить" className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"><Plus className="size-5" /></button>
      </div>
      {lines.length === 0 ? <Empty icon={PackagePlus} text="Добавьте товары поставки" /> : (
        <div className="space-y-2">
          {lines.map((l, i) => {
            const p = products.find((x) => x.id === l.productId);
            if (!p) return null;
            const set = (k: "qty" | "cost", v: number) => setLines(lines.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
            return (
              <div key={l.productId} className="rounded-xl border p-3">
                <div className="mb-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                  <Thumb src={p.image} alt={p.name} className="size-9 rounded-lg" />
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <button aria-label="Убрать" onClick={() => setLines(lines.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label><span className="text-xs text-muted-foreground">Кол-во</span><input className={fieldCls} type="number" inputMode="numeric" value={l.qty} onChange={(e) => set("qty", Number(e.target.value))} /></label>
                  <label><span className="text-xs text-muted-foreground">Закупка за шт</span><input className={fieldCls} type="number" inputMode="numeric" value={l.cost} onChange={(e) => set("cost", Number(e.target.value))} /></label>
                </div>
              </div>
            );
          })}
          <input className={fieldCls} placeholder="Поставщик или комментарий" value={note} onChange={(e) => setNote(e.target.value)} />
          <button onClick={submit} className="flex h-12 w-full items-center justify-between rounded-xl bg-gradient-primary px-5 font-bold text-primary-foreground shadow-glow"><span>Принять на склад</span><span>{money(total)}</span></button>
        </div>
      )}
    </Panel>
  );
}

function WriteOff() {
  const { products } = useData();
  const [pid, setPid] = useState("");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("Брак");
  const p = products.find((x) => x.id === pid);
  return (
    <Panel className="space-y-4">
      <select className={fieldCls} value={pid} onChange={(e) => setPid(e.target.value)} aria-label="Товар">
        <option value="">Выберите товар…</option>
        {products.filter((x) => x.stock > 0).map((x) => <option key={x.id} value={x.id}>{x.name} ({x.stock} шт)</option>)}
      </select>
      <Chips value={reason} onChange={setReason} items={["Брак", "Повреждение", "Пересорт", "Для монтажа"].map((x) => ({ id: x, label: x }))} />
      <input className={fieldCls} type="number" inputMode="numeric" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} aria-label="Количество" />
      <button disabled={!p || qty < 1 || qty > (p?.stock ?? 0)} onClick={() => { actions.writeOff(pid, qty, reason); toast.success("Списано"); setPid(""); setQty(1); }} className="h-12 w-full rounded-xl bg-destructive font-bold text-destructive-foreground disabled:opacity-40">Списать</button>
    </Panel>
  );
}

function Log() {
  const { movements, products } = useData();
  const [t, setT] = useState<"all" | "in" | "sale" | "writeoff" | "return">("all");
  const list = useMemo(() => movements.filter((m) => t === "all" || m.type === t).slice(0, 80), [movements, t]);
  return (
    <>
      <div className="mb-4"><Chips value={t} onChange={setT} items={[{ id: "all", label: "Все" }, { id: "in", label: "Приёмка" }, { id: "sale", label: "Продажи" }, { id: "writeoff", label: "Списания" }, { id: "return", label: "Возвраты" }]} /></div>
      <div className="divide-y overflow-hidden rounded-2xl border bg-card shadow-soft">
        {list.map((m) => {
          const p = products.find((x) => x.id === m.productId);
          const plus = m.qty > 0;
          return (
            <div key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3">
              <div className={cn("flex size-10 items-center justify-center rounded-xl", plus ? "bg-success-soft text-success" : "bg-danger-soft text-destructive")}>{plus ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}</div>
              <div className="min-w-0"><div className="truncate text-sm font-semibold">{p?.name ?? "Удалённый товар"}</div><div className="truncate text-xs text-muted-foreground">{MOVE_LABEL[m.type]} · {m.note} · {dateTime(m.date)}</div></div>
              <div className={cn("font-bold", plus ? "text-success" : "text-destructive")}>{plus ? "+" : ""}{m.qty}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
