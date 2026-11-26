import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Percent, Plus, Search, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { actions, useData } from "@/lib/store";
import { CATEGORIES, catLabel, money } from "@/lib/format";
import { pageHead } from "@/lib/head";
import type { Category, Product } from "@/lib/types";
import { Chips, Empty, fieldCls, PageHeader, StockBadge, Thumb } from "@/components/crm/ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products")({
  head: () => pageHead("Товары", "Каталог товаров, цены и наценки"),
  component: Products,
});

const blank: Omit<Product, "id"> = { name: "", sku: "", brand: "", category: "ip", image: "", cost: 0, price: 0, stock: 0, minStock: 3, specs: [], warranty: 12 };

function Products() {
  const data = useData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [edit, setEdit] = useState<(Omit<Product, "id"> & { id?: string }) | null>(null);
  const [reprice, setReprice] = useState(false);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.products.filter((p) => (cat === "all" || p.category === cat) && (!t || `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(t)));
  }, [data.products, q, cat]);

  return (
    <div>
      <PageHeader title="Товары" subtitle={`${data.products.length} позиций`} action={
        <button onClick={() => setEdit({ ...blank })} className="flex h-11 items-center gap-2 rounded-xl bg-gradient-primary px-4 font-bold text-primary-foreground shadow-glow active:scale-95"><Plus className="size-5" /><span className="hidden sm:inline">Добавить</span></button>
      } />
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <input className={fieldCls + " pl-10"} placeholder="Поиск" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button onClick={() => setReprice(true)} aria-label="Изменить цены" className="flex h-11 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-semibold"><Percent className="size-4" /><span className="hidden sm:inline">Цены</span></button>
        <button onClick={() => setView(view === "grid" ? "list" : "grid")} aria-label="Вид" className="flex size-11 items-center justify-center rounded-xl border bg-card">{view === "grid" ? <List className="size-4" /> : <LayoutGrid className="size-4" />}</button>
      </div>
      <div className="mb-4"><Chips value={cat} onChange={setCat} items={[{ id: "all" as const, label: "Все" }, ...CATEGORIES]} /></div>

      {list.length === 0 && <Empty icon={Package} text="Товары не найдены" />}
      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((p, i) => (
            <button key={p.id} onClick={() => setEdit(p)} className="animate-rise overflow-hidden rounded-2xl border bg-card text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow" style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}>
              <div className="relative"><Thumb src={p.image} alt={p.name} className="aspect-square w-full" /><span className="absolute left-2 top-2"><StockBadge p={p} /></span></div>
              <div className="p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{p.brand}</div>
                <div className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">{p.name}</div>
                <div className="mt-2 font-extrabold">{money(p.price)}</div>
                <div className="text-xs text-success">+{Math.round(((p.price - p.cost) / (p.cost || 1)) * 100)}% наценка</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="divide-y overflow-hidden rounded-2xl border bg-card shadow-soft">
          {list.map((p) => (
            <button key={p.id} onClick={() => setEdit(p)} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3 text-left hover:bg-muted/50">
              <Thumb src={p.image} alt={p.name} className="size-12 rounded-xl" />
              <div className="min-w-0"><div className="truncate font-semibold">{p.name}</div><div className="truncate text-xs text-muted-foreground">{p.sku} · {catLabel(p.category)}</div></div>
              <div className="text-right"><div className="font-bold">{money(p.price)}</div><StockBadge p={p} /></div>
            </button>
          ))}
        </div>
      )}

      <ProductSheet value={edit} onClose={() => setEdit(null)} />
      <RepriceDialog open={reprice} onClose={() => setReprice(false)} products={data.products} />
    </div>
  );
}

function ProductSheet({ value, onClose }: { value: (Omit<Product, "id"> & { id?: string }) | null; onClose: () => void }) {
  const [f, setF] = useState(value);
  const [specs, setSpecs] = useState("");
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) { setPrevValue(value); setF(value); setSpecs(value?.specs.join(", ") ?? ""); }
  if (!f) return <Sheet open={false} />;
  const upd = <K extends keyof Product>(k: K, v: Product[K]) => setF({ ...f, [k]: v });
  const margin = f.price - f.cost;

  const save = () => {
    if (!f.name.trim() || f.price <= 0) { toast.error("Укажите название и цену"); return; }
    actions.saveProduct({ ...f, specs: specs.split(",").map((s) => s.trim()).filter(Boolean), image: f.image || "https://images.pexels.com/photos/7508684/pexels-photo-7508684.jpeg?auto=compress&cs=tinysrgb&w=600" });
    toast.success(f.id ? "Товар сохранён" : "Товар добавлен");
    onClose();
  };

  const field = (label: string, el: React.ReactNode) => <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{el}</label>;

  return (
    <Sheet open={!!value} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-md">
        {f.image && <Thumb src={f.image} alt={f.name} className="aspect-[16/9] w-full" />}
        <div className="space-y-4 p-5">
          <SheetHeader className="p-0"><SheetTitle className="text-xl">{f.id ? "Карточка товара" : "Новый товар"}</SheetTitle></SheetHeader>
          {f.id && f.specs.length > 0 && <div className="flex flex-wrap gap-1.5">{f.specs.map((s) => <span key={s} className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">{s}</span>)}</div>}
          {field("Название", <input className={fieldCls} value={f.name} onChange={(e) => upd("name", e.target.value)} />)}
          <div className="grid grid-cols-2 gap-3">
            {field("Артикул", <input className={fieldCls} value={f.sku} onChange={(e) => upd("sku", e.target.value)} />)}
            {field("Бренд", <input className={fieldCls} value={f.brand} onChange={(e) => upd("brand", e.target.value)} />)}
          </div>
          {field("Категория", <select className={fieldCls} value={f.category} onChange={(e) => upd("category", e.target.value as Category)}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>)}
          <div className="grid grid-cols-2 gap-3">
            {field("Закупка", <input className={fieldCls} type="number" inputMode="numeric" value={f.cost || ""} onChange={(e) => upd("cost", Number(e.target.value))} />)}
            {field("Цена продажи", <input className={fieldCls} type="number" inputMode="numeric" value={f.price || ""} onChange={(e) => upd("price", Number(e.target.value))} />)}
          </div>
          <div className={cn("rounded-xl p-3 text-sm font-semibold", margin >= 0 ? "bg-success-soft text-success" : "bg-danger-soft text-destructive")}>
            Прибыль с единицы: {money(margin)} · {f.cost ? Math.round((margin / f.cost) * 100) : 0}%
          </div>
          <div className="grid grid-cols-3 gap-3">
            {field("Остаток", <input className={fieldCls} type="number" inputMode="numeric" value={f.stock} disabled={!!f.id} onChange={(e) => upd("stock", Number(e.target.value))} />)}
            {field("Минимум", <input className={fieldCls} type="number" inputMode="numeric" value={f.minStock} onChange={(e) => upd("minStock", Number(e.target.value))} />)}
            {field("Гарантия, мес", <input className={fieldCls} type="number" inputMode="numeric" value={f.warranty} onChange={(e) => upd("warranty", Number(e.target.value))} />)}
          </div>
          {f.id && <p className="-mt-2 text-xs text-muted-foreground">Остаток меняется через приёмку или списание на складе</p>}
          {field("Характеристики через запятую", <input className={fieldCls} value={specs} onChange={(e) => setSpecs(e.target.value)} placeholder="4 Мп, PoE, ИК 30 м" />)}
          {field("Ссылка на фото", <input className={fieldCls} value={f.image} onChange={(e) => upd("image", e.target.value)} placeholder="https://..." />)}
          <div className="flex gap-2 pt-2">
            {f.id && <button onClick={() => { actions.deleteProduct(f.id!); toast("Товар удалён"); onClose(); }} aria-label="Удалить" className="flex size-12 shrink-0 items-center justify-center rounded-xl border text-destructive"><Trash2 className="size-5" /></button>}
            <button onClick={save} className="h-12 flex-1 rounded-xl bg-gradient-primary font-bold text-primary-foreground shadow-glow">Сохранить</button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RepriceDialog({ open, onClose, products }: { open: boolean; onClose: () => void; products: Product[] }) {
  const [cat, setCat] = useState<Category | "all">("all");
  const [pct, setPct] = useState(5);
  const ids = products.filter((p) => cat === "all" || p.category === cat).map((p) => p.id);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl">
        <DialogTitle className="text-xl font-extrabold">Изменить цены</DialogTitle>
        <select className={fieldCls} value={cat} onChange={(e) => setCat(e.target.value as Category | "all")}>
          <option value="all">Все товары</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <div className="grid grid-cols-4 gap-2">
          {[-10, -5, 5, 10].map((v) => <button key={v} onClick={() => setPct(v)} className={cn("h-11 rounded-xl border font-bold", pct === v && "border-primary bg-accent text-accent-foreground")}>{v > 0 ? "+" : ""}{v}%</button>)}
        </div>
        <input className={fieldCls} type="number" value={pct} onChange={(e) => setPct(Number(e.target.value))} aria-label="Процент" />
        <p className="text-sm text-muted-foreground">Затронет {ids.length} товаров. Цены округлятся до 5 смн.</p>
        <button onClick={() => { actions.repriceBy(ids, pct); toast.success(`Цены изменены на ${pct}%`); onClose(); }} className="h-12 rounded-xl bg-gradient-primary font-bold text-primary-foreground">Применить</button>
      </DialogContent>
    </Dialog>
  );
}
