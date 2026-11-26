import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Phone, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { actions, useData } from "@/lib/store";
import { dateShort, money } from "@/lib/format";
import { pageHead } from "@/lib/head";
import type { Customer } from "@/lib/types";
import { Empty, fieldCls, PageHeader } from "@/components/crm/ui";
import { BottomSheet } from "@/components/crm/BottomSheet";

export const Route = createFileRoute("/customers")({
  head: () => pageHead("Клиенты", "База клиентов и история покупок"),
  component: Customers,
});

type Draft = { id?: string; name: string; phone: string; note: string };

function Customers() {
  const data = useData();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Draft | null>(null);

  const stats = useMemo(() => {
    const m = new Map<string, { sum: number; count: number; last: string }>();
    data.sales.filter((s) => !s.cancelled && s.customerId).forEach((s) => {
      const c = m.get(s.customerId!) ?? { sum: 0, count: 0, last: s.date };
      m.set(s.customerId!, { sum: c.sum + s.total, count: c.count + 1, last: s.date > c.last ? s.date : c.last });
    });
    return m;
  }, [data.sales]);

  const list = data.customers.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => (stats.get(b.id)?.sum ?? 0) - (stats.get(a.id)?.sum ?? 0));

  return (
    <div>
      <PageHeader title="Клиенты" subtitle={`${data.customers.length} в базе`} action={
        <button onClick={() => setEdit({ name: "", phone: "+992 ", note: "" })} className="flex h-11 items-center gap-2 rounded-xl bg-gradient-primary px-4 font-bold text-primary-foreground shadow-glow active:scale-95"><Plus className="size-5" /><span className="hidden sm:inline">Добавить</span></button>
      } />
      <div className="relative mb-4"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><input className={fieldCls + " pl-10"} placeholder="Имя или телефон" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {list.length === 0 ? <Empty icon={Users} text="Клиентов нет" /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => {
            const s = stats.get(c.id);
            return (
              <button key={c.id} onClick={() => setEdit(c)} className="animate-rise rounded-2xl border bg-card p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-primary" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="mb-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-gradient-primary font-bold text-primary-foreground">{c.name.replace(/[«»"]/g, "").split(" ").map((x) => x[0]).join("").slice(0, 2)}</div>
                  <div className="min-w-0"><div className="truncate font-bold">{c.name}</div><div className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Phone className="size-3" />{c.phone}</div></div>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-2 text-center">
                  <div><div className="truncate text-sm font-bold">{money(s?.sum ?? 0)}</div><div className="text-[10px] text-muted-foreground">Покупки</div></div>
                  <div><div className="text-sm font-bold">{s?.count ?? 0}</div><div className="text-[10px] text-muted-foreground">Чеков</div></div>
                  <div><div className="text-sm font-bold">{s ? dateShort(s.last) : "—"}</div><div className="text-[10px] text-muted-foreground">Последний</div></div>
                </div>
                {c.note && <div className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{c.note}</div>}
              </button>
            );
          })}
        </div>
      )}
      <CustomerDialog value={edit} onClose={() => setEdit(null)} />
    </div>
  );
}

function CustomerDialog({ value, onClose }: { value: Draft | Customer | null; onClose: () => void }) {
  const [f, setF] = useState<Draft | null>(value);
  const [prev, setPrev] = useState(value);
  if (prev !== value) { setPrev(value); setF(value); }
  return (
    <BottomSheet open={!!value} onClose={onClose} title={f?.id ? "Клиент" : "Новый клиент"}>
        {f && (
          <>
            <input className={fieldCls} placeholder="Имя или компания" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input className={fieldCls} type="tel" placeholder="Телефон" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <input className={fieldCls} placeholder="Заметка" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
            <div className="flex gap-2">
              {f.id && <button aria-label="Удалить" onClick={() => { actions.deleteCustomer(f.id!); toast("Клиент удалён"); onClose(); }} className="flex size-12 items-center justify-center rounded-xl border text-destructive"><Trash2 className="size-5" /></button>}
              <button onClick={() => { if (!f.name.trim()) { toast.error("Введите имя"); return; } actions.saveCustomer({ ...f }); toast.success("Сохранено"); onClose(); }} className="h-12 flex-1 rounded-xl bg-gradient-primary font-bold text-primary-foreground">Сохранить</button>
            </div>
          </>
        )}
    </BottomSheet>
  );
}
