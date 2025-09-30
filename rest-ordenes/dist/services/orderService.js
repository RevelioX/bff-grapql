import { OrderModel } from '../models/Order.js';
export async function listOrders(userId) {
    const filter = userId ? { userId } : {};
    return OrderModel.find(filter).sort({ createdAt: -1 }).lean();
}
export async function getOrder(id) {
    return OrderModel.findById(id).lean();
}
export async function createOrder(data) {
    const total = calcularTotal(data.items);
    const doc = await OrderModel.create({ ...data, total });
    return doc.toObject();
}
function calcularTotal(items) {
    // Placeholder: en un escenario real se consultaría el precio de cada producto.
    // Aquí se asumirá un monto ficticio por ítem para simplificar.
    return items.reduce((acc, _it) => acc + 100, 0); // 100 por item (dummy)
}
