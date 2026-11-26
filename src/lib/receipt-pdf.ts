// Browser-only: builds a branded receipt as a PDF file. Imported dynamically.
import { USERS } from "@/lib/auth";
import { dateTime, money, payLabel } from "@/lib/format";
import type { Sale } from "@/lib/types";

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

export async function buildReceiptPdf(sale: Sale, customer?: string): Promise<File> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
  const seller = USERS.find((u) => u.id === sale.userId)?.name;
  const el = document.createElement("div");
  el.style.cssText = "position:fixed;left:-10000px;top:0;width:400px;background:#fff;font-family:Manrope,system-ui,sans-serif;color:#0f172a";
  const row = (l: string, r: string, strong = false) =>
    `<div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0;${strong ? "font-size:22px;font-weight:800" : "font-size:13px;color:#475569"}"><span>${esc(l)}</span><span style="white-space:nowrap;${strong ? "" : "color:#0f172a;font-weight:600"}">${esc(r)}</span></div>`;
  el.innerHTML = `
  <div style="background:linear-gradient(135deg,#3b5bdb,#7048e8);color:#fff;padding:26px 24px 30px;border-radius:0 0 28px 28px">
    <div style="display:flex;align-items:center;gap:10px"><div style="width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px">М</div>
    <div><div style="font-weight:800;font-size:19px">Мой склад</div><div style="font-size:12px;opacity:.85">Техника и видеонаблюдение</div></div></div>
    <div style="margin-top:22px;font-size:13px;opacity:.85">Чек №${sale.number} · ${esc(dateTime(sale.date))}</div>
    <div style="font-size:34px;font-weight:800;margin-top:2px">${esc(money(sale.total))}</div>
  </div>
  <div style="padding:20px 24px 8px">
    ${sale.items.map((i) => `<div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #eef2f7"><div style="min-width:0"><div style="font-weight:700;font-size:14px">${esc(i.name)}</div><div style="font-size:12px;color:#64748b">${i.qty} × ${esc(money(i.price))}</div></div><div style="font-weight:800;font-size:14px;white-space:nowrap">${esc(money(i.qty * i.price))}</div></div>`).join("")}
    <div style="margin-top:12px">
      ${sale.discount > 0 ? row("Скидка", "−" + money(sale.discount)) : ""}
      ${row("Оплата", payLabel(sale.payment))}
      ${customer ? row("Покупатель", customer) : ""}
      ${seller ? row("Продавец", seller) : ""}
      <div style="border-top:2px dashed #e2e8f0;margin:10px 0"></div>
      ${row("Итого", money(sale.total), true)}
    </div>
  </div>
  <div style="margin:16px 24px 24px;padding:14px;border-radius:16px;background:#f1f5ff;text-align:center;font-size:13px;color:#3b5bdb;font-weight:700">Спасибо за покупку! 💙</div>`;
  document.body.appendChild(el);
  try {
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
    const w = 80, h = (canvas.height / canvas.width) * w; // 80mm receipt width
    const pdf = new jsPDF({ unit: "mm", format: [w, h] });
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, w, h);
    return new File([pdf.output("blob")], `Чек-${sale.number}.pdf`, { type: "application/pdf" });
  } finally {
    el.remove();
  }
}
