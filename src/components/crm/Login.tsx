import { useState } from "react";
import { Cctv, Eye, EyeOff, LogIn } from "lucide-react";
import { login, USERS, ROLE_LABEL } from "@/lib/auth";
import { fieldCls } from "./ui";
import { ThemeButton } from "./ThemeButton";

export function Login() {
  const [l, setL] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(l, p)) setErr("Неверный логин или пароль");
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4"><ThemeButton /></div>
      <div className="w-full max-w-sm animate-rise">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Cctv className="size-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Мой склад</h1>
          <p className="mt-1 text-sm text-muted-foreground">Магазин техники и видеонаблюдения</p>
        </div>
        <form onSubmit={submit} className="space-y-3 rounded-3xl border bg-card p-5 shadow-soft">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Логин</span>
            <input className={fieldCls} value={l} onChange={(e) => { setL(e.target.value); setErr(""); }} autoComplete="username" placeholder="admin" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Пароль</span>
            <div className="relative">
              <input className={fieldCls + " pr-11"} type={show ? "text" : "password"} value={p} onChange={(e) => { setP(e.target.value); setErr(""); }} autoComplete="current-password" placeholder="••••••" />
              <button type="button" aria-label="Показать пароль" onClick={() => setShow(!show)} className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>
          {err && <p className="text-sm font-medium text-destructive">{err}</p>}
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary font-bold text-primary-foreground shadow-glow transition active:scale-[0.98]">
            <LogIn className="size-4" /> Войти
          </button>
        </form>
        <div className="mt-5 space-y-2">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Демо-доступ</p>
          {USERS.map((u) => (
            <button key={u.id} onClick={() => { setL(u.login); setP(u.password); setErr(""); }} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-left text-sm transition hover:border-primary">
              <span className="min-w-0 truncate"><b>{ROLE_LABEL[u.role]}</b> <span className="text-muted-foreground">· {u.login} / {u.password}</span></span>
              {u.role === "admin" ? <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success">Полный</span> : <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Скоро</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
