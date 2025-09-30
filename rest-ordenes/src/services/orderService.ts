import { OrderModel, Order, OrderItem } from '../models/Order.js';
import { CreateOrderInput } from '../validators/orderSchemas.js';

export async function listOrders(userId?: string) {
  const filter = userId ? { userId } : {};
  return OrderModel.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getOrder(id: string) {
  return OrderModel.findById(id).lean();
}

export async function createOrder(data: CreateOrderInput) {
  const total = calcularTotal(data.items);
  const doc = await OrderModel.create({ ...data, total });
  return doc.toObject();
}

function calcularTotal(items: OrderItem[]): number {
  // Placeholder: en un escenario real se consultaría el precio de cada producto.
  // Aquí se asumirá un monto ficticio por ítem para simplificar.
  return items.reduce((acc, _it) => acc + 100, 0); // 100 por item (dummy)
}
