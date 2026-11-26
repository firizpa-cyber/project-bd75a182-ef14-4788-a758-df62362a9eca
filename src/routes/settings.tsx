import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Moon, RotateCcw, Sun, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { actions } from "@/lib/store";
import { logout, ROLE_LABEL, USERS, useUser } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { pageHead } from "@/lib/head";
import { PageHeader, Panel } from "@/components/crm/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => pageHead("Настройки", "Тема, пользователи и демо-данные"),
  component: Settings,
});

function Settings() {
  const user = useUser();
  const { dark, toggle } = useTheme();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="Настройки" />
      <Panel className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-lg font-bold text-primary-foreground">{user?.name.split(" ").map((x) => x[0]).join("")}</div>
        <div className="min-w-0 flex-1"><div className="truncate text-lg font-bold">{user?.name}</div><div className="text-sm text-muted-foreground">{user && ROLE_LABEL[user.role]} · {user?.login}</div></div>
        <button onClick={logout} className="flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold text-destructive"><LogOut className="size-4" /> Выйти</button>
      </Panel>
      <Panel>
        <h2 className="mb-3 font-bold">Оформление</h2>
        <div className="grid grid-cols-2 gap-2">
          {[{ d: false, label: "Светлая", Icon: Sun }, { d: true, label: "Тёмная", Icon: Moon }].map(({ d, label, Icon }) => (
            <button key={label} onClick={() => dark !== d && toggle()} className={cn("flex h-14 items-center justify-center gap-2 rounded-xl border font-semibold transition", dark === d && "border-primary bg-accent text-accent-foreground")}><Icon className="size-5" /> {label}</button>
          ))}
        </div>
      </Panel>
      <Panel>
        <h2 className="mb-3 font-bold">Пользователи</h2>
        <div className="space-y-2">
          {USERS.map((u) => (
            <div key={u.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-muted/50 p-3">
              <div className="min-w-0"><div className="truncate text-sm font-semibold">{u.name}</div><div className="text-xs text-muted-foreground">{ROLE_LABEL[u.role]}</div></div>
              {u.role === "admin" ? <span className="flex items-center gap-1 text-xs font-bold text-success"><ShieldCheck className="size-4" /> Полный доступ</span> : <span className="text-xs font-semibold text-muted-foreground">В разработке</span>}
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <h2 className="mb-1 font-bold">Демо-данные</h2>
        <p className="mb-3 text-sm text-muted-foreground">Все изменения хранятся в этом браузере.</p>
        <button onClick={() => { if (confirm("Вернуть исходные демо-данные? Ваши изменения будут удалены.")) { actions.reset(); toast.success("Данные сброшены"); } }} className="flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold"><RotateCcw className="size-4" /> Сбросить</button>
      </Panel>
    </div>
  );
}
