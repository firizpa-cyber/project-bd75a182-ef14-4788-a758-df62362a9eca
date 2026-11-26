import { useState } from "react";
import { Loader2, Printer, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { USERS } from "@/lib/auth";
import { dateTime, money, payLabel } from "@/lib/format";
import { useData } from "@/lib/store";
import type { Sale } from "@/lib/types";

const SHOP = "Мой склад";

export function receiptText(sale: Sale, customer?: string) {
  const lines = sale.items.map((i) => `• ${i.name}\n   ${i.qty} × ${money(i.price)} = ${money(i.qty * i.price)}`);
  return [
    `🧾 ${SHOP} — чек №${sale.number}`,
    dateTime(sale.date),
    customer ? `Покупатель: ${customer}` : "",
    "",
    ...lines,
    "",
    sale.discount > 0 ? `Скидка: −${money(sale.discount)}` : "",
    `ИТОГО: ${money(sale.total)}`,
    `Оплата: ${payLabel(sale.payment)}`,
    "",
    "Спасибо за покупку!",
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

function printReceipt(sale: Sale, customer?: string, seller?: string) {
  const w = window.open("", "_blank", "width=380,height=640");
  if (!w) return;
  const rows = sale.items.map((i) => `<tr><td colspan=2>${esc(i.name)}</td></tr><tr><td class=m>${i.qty} × ${esc(money(i.price))}</td><td class=r>${esc(money(i.qty * i.price))}</td></tr>`).join("");
  w.document.write(`<!doctype html><html><head><meta charset=utf-8><title>Чек №${sale.number}</title><style>
body{font:13px/1.4 ui-monospace,Menlo,monospace;width:72mm;margin:0 auto;padding:12px;color:#000}
h1{font-size:18px;text-align:center;margin:0}p{margin:2px 0;text-align:center}table{width:100%;border-collapse:collapse}
td{padding:1px 0}.r{text-align:right;white-space:nowrap}.m{color:#444}hr{border:0;border-top:1px dashed #000;margin:8px 0}
.t td{font-size:16px;font-weight:bold}</style></head><body>
<h1>${SHOP}</h1><p>Чек №${sale.number}</p><p>${esc(dateTime(sale.date))}</p><hr>
<table>${rows}</table><hr><table>
${sale.discount > 0 ? `<tr><td>Скидка</td><td class=r>−${esc(money(sale.discount))}</td></tr>` : ""}
<tr class=t><td>ИТОГО</td><td class=r>${esc(money(sale.total))}</td></tr>
<tr><td>Оплата</td><td class=r>${esc(payLabel(sale.payment))}</td></tr>
${customer ? `<tr><td>Покупатель</td><td class=r>${esc(customer)}</td></tr>` : ""}
${seller ? `<tr><td>Продавец</td><td class=r>${esc(seller)}</td></tr>` : ""}
</table><hr><p>Спасибо за покупку!</p>
<script>onload=()=>{print();setTimeout(()=>close(),300)}</script></body></html>`);
  w.document.close();
}

/** Print + share the receipt as a branded PDF (WhatsApp / Telegram via the phone share sheet). */
export function ReceiptActions({ sale }: { sale: Sale }) {
  const data = useData();
  const [busy, setBusy] = useState<string | null>(null);
  const cust = data.customers.find((c) => c.id === sale.customerId);
  const seller = USERS.find((u) => u.id === sale.userId)?.name;
  const phone = cust?.phone.replace(/\D/g, "") ?? "";

  const share = async (app: "wa" | "tg") => {
    setBusy(app);
    try {
      const { buildReceiptPdf } = await import("@/lib/receipt-pdf");
      const file = await buildReceiptPdf(sale, cust?.name);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: file.name }).catch(() => {});
        return;
      }
      // Desktop: download the PDF and open the messenger so it can be attached.
      const url = URL.createObjectURL(file);
      const a = document.createElement("a"); a.href = url; a.download = file.name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      window.open(app === "wa" ? `https://wa.me/${phone}` : "https://web.telegram.org/", "_blank");
      toast.success("PDF чека скачан — прикрепите его в чате");
    } catch {
      toast.error("Не удалось создать PDF");
    } finally {
      setBusy(null);
    }
  };

  const btn = "flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl border bg-card text-xs font-bold transition active:scale-95 disabled:opacity-60";
  return (
    <div className="grid grid-cols-3 gap-2">
      <button onClick={() => printReceipt(sale, cust?.name, seller)} className={btn}><Printer className="size-4" />Печать</button>
      <button disabled={!!busy} onClick={() => share("wa")} className={`${btn} text-[#25D366]`}>{busy === "wa" ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}WhatsApp PDF</button>
      <button disabled={!!busy} onClick={() => share("tg")} className={`${btn} text-[#229ED9]`}>{busy === "tg" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}Telegram PDF</button>
    </div>
  );
}
