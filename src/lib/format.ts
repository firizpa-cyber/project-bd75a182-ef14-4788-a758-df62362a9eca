import type { Category, MovementType, Payment } from "./types";

export const CURRENCY = "смн";

export const money = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} ${CURRENCY}`;
export const num = (n: number) => Math.round(n).toLocaleString("ru-RU");

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "ip", label: "IP-камеры" },
  { id: "wifi", label: "Wi-Fi камеры" },
  { id: "analog", label: "Аналоговые" },
  { id: "recorder", label: "Регистраторы" },
  { id: "kit", label: "Комплекты" },
  { id: "network", label: "Сеть и PoE" },
  { id: "storage", label: "Диски" },
  { id: "accessory", label: "Аксессуары" },
];
export const catLabel = (c: Category) => CATEGORIES.find((x) => x.id === c)?.label ?? c;

export const PAYMENTS: { id: Payment; label: string }[] = [
  { id: "cash", label: "Наличные" },
  { id: "card", label: "Карта" },
  { id: "transfer", label: "Перевод" },
];
export const payLabel = (p: Payment) => PAYMENTS.find((x) => x.id === p)?.label ?? p;

export const MOVE_LABEL: Record<MovementType, string> = {
  in: "Приёмка",
  sale: "Продажа",
  writeoff: "Списание",
  return: "Возврат",
};

export const uid = () => Math.random().toString(36).slice(2, 10);
