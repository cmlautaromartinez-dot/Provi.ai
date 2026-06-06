export type Role = 'comprador' | 'vendedor' | null;

export type Product = {
  id: string;
  nombre: string;
  proveedor: string;
  proveedorId: string;
  precio: number;
  unidad: string;
  rating: number;
  distancia: number;
  categoria: string;
  tags: string[];
  emoji: string;
  color: string;
  descripcion: string;
  stock: number;
  match?: number;
};

export type CartItem = {
  productId: string;
  cantidad: number;
};

export type ChatMsg = {
  id: string;
  from: 'bot' | 'user';
  text: string;
  options?: string[];
  matches?: Product[];
};

export type Pedido = {
  id: string;
  producto: string;
  cantidad: number;
  total: number;
  estado: 'pendiente' | 'aceptado' | 'en camino' | 'entregado' | 'cancelado';
  fecha: string;
  proveedor?: string;
  comprador?: string;
  emoji?: string;
};
