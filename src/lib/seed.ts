import type { Customer, Movement, Product, Sale, SaleItem, State } from "./types";

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;
const us = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

type P = Omit<Product, "id">;
const P = (o: P): P => o;

const products: P[] = [
  P({ name: "Hikvision DS-2CD1143G2-I", sku: "HK-1143", brand: "Hikvision", category: "ip", image: px(7508684), cost: 450, price: 600, stock: 24, minStock: 8, specs: ["4 Мп", "Купольная", "ИК 30 м", "PoE"], warranty: 24 }),
  P({ name: "Dahua IPC-HDW1431S", sku: "DH-1431", brand: "Dahua", category: "ip", image: px(37591147), cost: 390, price: 530, stock: 18, minStock: 6, specs: ["4 Мп", "Турель", "ИК 30 м", "PoE"], warranty: 24 }),
  P({ name: "Hikvision DS-2CD2043G2-I", sku: "HK-2043", brand: "Hikvision", category: "ip", image: px(13646859), cost: 775, price: 1000, stock: 9, minStock: 5, specs: ["4 Мп", "Цилиндр", "AcuSense", "IP67"], warranty: 36 }),
  P({ name: "Dahua SD49225XA PTZ", sku: "DH-PTZ49", brand: "Dahua", category: "ip", image: px(32516148), cost: 5390, price: 6870, stock: 2, minStock: 2, specs: ["2 Мп", "Зум 25×", "ИК 100 м", "Поворотная"], warranty: 24 }),
  P({ name: "Uniview IPC2124LB", sku: "UV-2124", brand: "Uniview", category: "ip", image: px(29866272), cost: 330, price: 450, stock: 31, minStock: 10, specs: ["4 Мп", "Купольная", "Smart IR", "PoE"], warranty: 24 }),
  P({ name: "Hikvision ColorVu DS-2CD2347G2", sku: "HK-CV47", brand: "Hikvision", category: "ip", image: px(37591146), cost: 1175, price: 1520, stock: 4, minStock: 4, specs: ["4 Мп", "Цвет ночью", "Турель", "Микрофон"], warranty: 36 }),
  P({ name: "Ezviz C6N", sku: "EZ-C6N", brand: "Ezviz", category: "wifi", image: px(27934755), cost: 270, price: 365, stock: 42, minStock: 12, specs: ["2 Мп", "Поворотная", "Wi-Fi", "Двусторонний звук"], warranty: 12 }),
  P({ name: "Xiaomi Smart Camera C300", sku: "XM-C300", brand: "Xiaomi", category: "wifi", image: px(27662879), cost: 295, price: 400, stock: 3, minStock: 10, specs: ["3 Мп", "360°", "Wi-Fi", "microSD"], warranty: 12 }),
  P({ name: "Imou Ranger 2", sku: "IM-RG2", brand: "Imou", category: "wifi", image: px(16423102), cost: 225, price: 310, stock: 27, minStock: 8, specs: ["2 Мп", "Поворотная", "Wi-Fi", "Слежение"], warranty: 12 }),
  P({ name: "TP-Link Tapo C120", sku: "TP-C120", brand: "TP-Link", category: "wifi", image: px(26597080), cost: 250, price: 340, stock: 15, minStock: 6, specs: ["2K", "Wi-Fi", "Улица/дом", "IP66"], warranty: 24 }),
  P({ name: "Ezviz DB2 видеозвонок", sku: "EZ-DB2", brand: "Ezviz", category: "wifi", image: px(7848351), cost: 625, price: 825, stock: 6, minStock: 3, specs: ["3 Мп", "Аккумулятор", "Wi-Fi", "Звонок"], warranty: 12 }),
  P({ name: "Ezviz CB8 4G Solar", sku: "EZ-CB8", brand: "Ezviz", category: "wifi", image: px(30228097), cost: 1260, price: 1645, stock: 0, minStock: 2, specs: ["2K", "Солнечная панель", "4G", "Автономная"], warranty: 12 }),
  P({ name: "Hikvision DS-2CE76D0T-ITPF", sku: "HK-76D0", brand: "Hikvision", category: "analog", image: px(19653611), cost: 130, price: 185, stock: 55, minStock: 15, specs: ["2 Мп", "TVI/AHD", "ИК 20 м", "Купол"], warranty: 24 }),
  P({ name: "Dahua HAC-HFW1200CP", sku: "DH-1200", brand: "Dahua", category: "analog", image: us("1557597774-9d273605dfa9"), cost: 140, price: 195, stock: 7, minStock: 10, specs: ["2 Мп", "HDCVI", "ИК 30 м", "Цилиндр"], warranty: 24 }),
  P({ name: "Hikvision DS-7608NI-K2/8P", sku: "HK-NVR8P", brand: "Hikvision", category: "recorder", image: us("1593784991095-a205069470b6"), cost: 1650, price: 2130, stock: 8, minStock: 3, specs: ["8 каналов", "8 PoE", "2 HDD", "4K выход"], warranty: 24 }),
  P({ name: "Dahua NVR2104HS-4KS3", sku: "DH-NVR4", brand: "Dahua", category: "recorder", image: us("1544197150-b99a580bb7a8"), cost: 715, price: 950, stock: 11, minStock: 4, specs: ["4 канала", "1 HDD", "H.265+", "Облако"], warranty: 24 }),
  P({ name: "Комплект 4 камеры + NVR", sku: "KIT-4IP", brand: "Hikvision", category: "kit", image: px(27588336), cost: 3130, price: 3990, stock: 5, minStock: 2, specs: ["4 × 4 Мп", "NVR 4K", "HDD 1 ТБ", "Кабели"], warranty: 24 }),
  P({ name: "Комплект Wi-Fi 2 камеры", sku: "KIT-2WF", brand: "Imou", category: "kit", image: px(27662879), cost: 850, price: 1120, stock: 1, minStock: 3, specs: ["2 × 2K", "Wi-Fi", "Приложение", "Без проводов"], warranty: 12 }),
  P({ name: "TP-Link TL-SF1008P PoE", sku: "TP-SF8P", brand: "TP-Link", category: "network", image: us("1544197150-b99a580bb7a8"), cost: 410, price: 540, stock: 13, minStock: 5, specs: ["8 портов", "4 PoE", "57 Вт", "Без настройки"], warranty: 36 }),
  P({ name: "Роутер TP-Link Archer C6", sku: "TP-AC6", brand: "TP-Link", category: "network", image: us("1606904825846-647eb07f5be2"), cost: 330, price: 435, stock: 19, minStock: 6, specs: ["AC1200", "Двухдиапазонный", "MU-MIMO", "4 антенны"], warranty: 36 }),
  P({ name: "WD Purple 2 ТБ", sku: "WD-P2T", brand: "Western Digital", category: "storage", image: us("1544197150-b99a580bb7a8"), cost: 600, price: 765, stock: 14, minStock: 6, specs: ["2 ТБ", "Для видео", "24/7", "SATA"], warranty: 36 }),
  P({ name: "Seagate SkyHawk 4 ТБ", sku: "SG-SH4", brand: "Seagate", category: "storage", image: us("1544197150-b99a580bb7a8"), cost: 915, price: 1165, stock: 6, minStock: 4, specs: ["4 ТБ", "Для видео", "ImagePerfect", "SATA"], warranty: 36 }),
  P({ name: "Кабель UTP Cat5e, 305 м", sku: "CB-UTP5", brand: "Netlan", category: "accessory", image: us("1544197150-b99a580bb7a8"), cost: 365, price: 485, stock: 22, minStock: 5, specs: ["305 м", "Медь", "Внутренний", "Cat5e"], warranty: 12 }),
  P({ name: "Блок питания 12В 2А", sku: "PS-122", brand: "Smartec", category: "accessory", image: px(19653611), cost: 30, price: 50, stock: 120, minStock: 30, specs: ["12 В", "2 А", "Импульсный"], warranty: 12 }),
  P({ name: "Карта microSD 128 ГБ", sku: "SD-128", brand: "Kingston", category: "accessory", image: px(27934755), cost: 85, price: 120, stock: 9, minStock: 15, specs: ["128 ГБ", "Class 10", "Для камер"], warranty: 12 }),
];

const names = ["Фирдавс Рахимов", "ООО «Строй Сервис»", "Мадина Саидова", "Магазин «Мега»", "Рустам Назаров", "Шахром Каримов", "ЧП «Охрана Плюс»", "Нилуфар Юсупова"];
const phones = ["+992 93 123-45-67", "+992 93 200-11-22", "+992 93 555-66-77", "+992 93 404-30-30", "+992 93 777-88-99", "+992 93 321-00-12", "+992 93 255-44-33", "+992 93 812-23-45"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function createSeed(): State {
  const r = rng(42);
  const now = Date.now();
  const day = 86400000;
  const prods: Product[] = products.map((p, i) => ({ ...p, id: `p${i + 1}` }));
  const customers: Customer[] = names.map((name, i) => ({
    id: `c${i + 1}`,
    name,
    phone: phones[i] ?? "",
    note: i % 3 === 1 ? "Оптовый клиент" : "",
    createdAt: new Date(now - (60 - i * 5) * day).toISOString(),
  }));
  const sales: Sale[] = [];
  const movements: Movement[] = [];
  let n = 1000;
  for (let d = 29; d >= 0; d--) {
    const count = 2 + Math.floor(r() * 5);
    for (let k = 0; k < count; k++) {
      const lines = 1 + Math.floor(r() * 3);
      const items: SaleItem[] = [];
      for (let l = 0; l < lines; l++) {
        const p = prods[Math.floor(r() * prods.length)]!;
        if (items.some((x) => x.productId === p.id)) continue;
        items.push({ productId: p.id, name: p.name, qty: 1 + Math.floor(r() * 3), price: p.price, cost: p.cost });
      }
      const sum = items.reduce((a, x) => a + x.qty * x.price, 0);
      const discount = r() < 0.2 ? Math.round((sum * 0.05) / 5) * 5 : 0;
      const date = new Date(now - d * day - Math.floor(r() * 9) * 3600000 - 3600000).toISOString();
      const pay = r();
      const c = r() < 0.5 ? customers[Math.floor(r() * customers.length)] : undefined;
      n++;
      sales.push({
        id: `s${n}`, number: n, date, items, discount, total: sum - discount,
        payment: pay < 0.45 ? "cash" : pay < 0.85 ? "card" : "transfer",
        ...(c ? { customerId: c.id } : {}),
        userId: "admin",
      });
      for (const it of items) movements.push({ id: `m${n}${it.productId}`, date, productId: it.productId, qty: -it.qty, type: "sale", note: `Продажа №${n}` });
    }
    if (d % 7 === 3) {
      const p = prods[Math.floor(r() * prods.length)]!;
      movements.push({ id: `mi${d}`, date: new Date(now - d * day).toISOString(), productId: p.id, qty: 10, type: "in", note: "Поставка от дистрибьютора" });
    }
  }
  sales.reverse();
  movements.sort((a, b) => b.date.localeCompare(a.date));
  return { products: prods, sales, movements, customers, saleCounter: n };
}
