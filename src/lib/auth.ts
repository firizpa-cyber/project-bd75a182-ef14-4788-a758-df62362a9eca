import { useSyncExternalStore } from "react";

export type Role = "admin" | "manager" | "cashier";
export interface User {
  id: string;
  login: string;
  password: string;
  name: string;
  role: Role;
}

export const USERS: User[] = [
  { id: "admin", login: "admin", password: "admin123", name: "Нодирчон", role: "admin" },
  { id: "manager", login: "manager", password: "manager123", name: "Мадина Саидова", role: "manager" },
  { id: "cashier", login: "kassa", password: "kassa123", name: "Рустам Назаров", role: "cashier" },
];

export const ROLE_LABEL: Record<Role, string> = { admin: "Администратор", manager: "Менеджер", cashier: "Кассир" };

const KEY = "moysklad:session";
const listeners = new Set<() => void>();
let current: string | null | undefined;

function read(): string | null {
  if (current !== undefined) return current;
  if (typeof window === "undefined") return null;
  current = localStorage.getItem(KEY);
  return current;
}

const emit = () => listeners.forEach((l) => l());

export function login(loginName: string, password: string): User | null {
  const u = USERS.find((x) => x.login === loginName.trim().toLowerCase() && x.password === password);
  if (!u) return null;
  current = u.id;
  localStorage.setItem(KEY, u.id);
  emit();
  return u;
}

export function logout() {
  current = null;
  localStorage.removeItem(KEY);
  emit();
}

export function useUser(): User | null {
  const id = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => null,
  );
  return USERS.find((u) => u.id === id) ?? null;
}
