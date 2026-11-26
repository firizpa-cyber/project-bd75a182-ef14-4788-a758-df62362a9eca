import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeButton() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label="Сменить тему" className="flex size-10 items-center justify-center rounded-xl border bg-card text-muted-foreground transition hover:text-foreground active:scale-95">
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
