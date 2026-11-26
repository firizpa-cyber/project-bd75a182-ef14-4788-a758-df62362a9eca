import { useSyncExternalStore } from "react";
import { createSeed } from "./seed";
import { uid } from "./format";
import type { Customer, Payment, Product, SaleItem, State } from "./types";

const KEY = "moysklad:data:v2";
let state: State | null = null;
const listeners = new Set<() => void>();

function get(): State {
  if (state) return state;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw) as State;
    } catch {
      /* ignore */
    }
  }
  state ??= createSeed();
  return state;
}

function set(fn: (s: State) => State) {
  state = fn(get());
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useData = () => useSyncExternalStore(subscribe, get, get);

const now = () => new Date().toISOString();

export const actions = {
  saveProduct(p: Omit<Product, "id"> & { id?: string }) {
    set((s) => {
      if (p.id) return { ...s, products: s.products.map((x) => (x.id === p.id ? ({ ...x, ...p } as Product) : x)) };
      return { ...s, products: [{ ...p, id: uid() } as Product, ...s.products] };
    });
  },
  deleteProduct(id: string) {
    set((s) => ({ ...s, products: s.products.filter((x) => x.id !== id) }));
  },
  repriceBy(ids: string[], percent: number) {
    set((s) => ({
      ...s,
      products: s.products.map((x) =>
        ids.includes(x.id) ? { ...x, price: Math.max(0, Math.round((x.price * (1 + percent / 100)) / 5) * 5) } : x,
      ),
    }));
  },
  receive(lines: { productId: string; qty: number; cost?: number }[], note: string) {
    set((s) => ({
      ...s,
      products: s.products.map((p) => {
        const l = lines.find((x) => x.productId === p.id);
        return l ? { ...p, stock: p.stock + l.qty, ...(l.cost ? { cost: l.cost } : {}) } : p;
      }),
      movements: [
        ...lines.map((l) => ({ id: uid(), date: now(), productId: l.productId, qty: l.qty, type: "in" as const, note: note || "Приёмка товара" })),
        ...s.movements,
      ],
    }));
  },
  writeOff(productId: string, qty: number, note: string) {
    set((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock - qty) } : p)),
      movements: [{ id: uid(), date: now(), productId, qty: -qty, type: "writeoff", note: note || "Списание" }, ...s.movements],
    }));
  },
  sell(items: SaleItem[], discount: number, payment: Payment, customerId: string | undefined, userId: string) {
    let number = 0;
    set((s) => {
      number = s.saleCounter + 1;
      const sum = items.reduce((a, x) => a + x.qty * x.price, 0);
      const date = now();
      return {
        ...s,
        saleCounter: number,
        sales: [
          { id: uid(), number, date, items, discount, total: Math.max(0, sum - discount), payment, userId, ...(customerId ? { customerId } : {}) },
          ...s.sales,
        ],
        products: s.products.map((p) => {
          const it = items.find((x) => x.productId === p.id);
          return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p;
        }),
        movements: [
          ...items.map((it) => ({ id: uid(), date, productId: it.productId, qty: -it.qty, type: "sale" as const, note: `Продажа №${number}` })),
          ...s.movements,
        ],
      };
    });
    return number;
  },
  cancelSale(id: string) {
    set((s) => {
      const sale = s.sales.find((x) => x.id === id);
      if (!sale || sale.cancelled) return s;
      return {
        ...s,
        sales: s.sales.map((x) => (x.id === id ? { ...x, cancelled: true } : x)),
        products: s.products.map((p) => {
          const it = sale.items.find((x) => x.productId === p.id);
          return it ? { ...p, stock: p.stock + it.qty } : p;
        }),
        movements: [
          ...sale.items.map((it) => ({ id: uid(), date: now(), productId: it.productId, qty: it.qty, type: "return" as const, note: `Возврат по №${sale.number}` })),
          ...s.movements,
        ],
      };
    });
  },
  saveCustomer(c: Omit<Customer, "id" | "createdAt"> & { id?: string }) {
    set((s) => {
      if (c.id) return { ...s, customers: s.customers.map((x) => (x.id === c.id ? { ...x, ...c, id: x.id } : x)) };
      return { ...s, customers: [{ ...c, id: uid(), createdAt: now() }, ...s.customers] };
    });
  },
  deleteCustomer(id: string) {
    set((s) => ({ ...s, customers: s.customers.filter((x) => x.id !== id) }));
  },
  reset() {
    set(() => createSeed());
  },
};
