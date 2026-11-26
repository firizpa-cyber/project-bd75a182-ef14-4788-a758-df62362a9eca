import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The app's single dialog: a sheet that slides up from the bottom, swipe down to close. */
export function BottomSheet({ open, onClose, title, children, className, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; className?: string; wide?: boolean }) {
  const [dy, setDy] = useState(0);
  const start = useRef<number | null>(null);

  const onDown = (e: React.PointerEvent) => { start.current = e.clientY; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { if (start.current !== null) setDy(Math.max(0, e.clientY - start.current)); };
  const onUp = () => { if (dy > 110) onClose(); start.current = null; setDy(0); };

  return (
    <D.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <D.Content
          aria-describedby={undefined}
          style={{ transform: dy ? `translateY(${dy}px)` : undefined, transition: start.current === null ? "transform 0.25s" : "none" }}
          className={cn(
            "pb-safe fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full flex-col rounded-t-[28px] border border-b-0 bg-card shadow-2xl outline-hidden duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            wide ? "max-w-2xl" : "max-w-lg",
          )}
        >
          <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} className="shrink-0 cursor-grab touch-none px-5 pb-3 pt-2.5 active:cursor-grabbing">
            <div className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-muted-foreground/30" />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <D.Title className="truncate text-xl font-extrabold tracking-tight">{title}</D.Title>
              <D.Close aria-label="Закрыть" onPointerDown={(e) => e.stopPropagation()} className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground active:scale-90">
                <X className="size-4" />
              </D.Close>
            </div>
          </div>
          <div className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-5 pb-6", className)}>{children}</div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
