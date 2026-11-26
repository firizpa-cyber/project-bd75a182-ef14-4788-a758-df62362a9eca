export type Category = "ip" | "analog" | "wifi" | "recorder" | "kit" | "network" | "storage" | "accessory";

export interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: Category;
  image: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  specs: string[];
  warranty: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
}

export type Payment = "cash" | "card" | "transfer";

export interface Sale {
  id: string;
  number: number;
  date: string;
  items: SaleItem[];
  discount: number;
  total: number;
  payment: Payment;
  customerId?: string;
  userId: string;
  cancelled?: boolean;
}

export type MovementType = "in" | "sale" | "writeoff" | "return";

export interface Movement {
  id: string;
  date: string;
  productId: string;
  qty: number;
  type: MovementType;
  note: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  note: string;
  createdAt: string;
}

export interface State {
  products: Product[];
  sales: Sale[];
  movements: Movement[];
  customers: Customer[];
  saleCounter: number;
}
