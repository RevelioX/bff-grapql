import { createOrder, getOrder, listOrders } from '../services/orderService.js';
import { createOrderSchema } from '../validators/orderSchemas.js';
export async function listOrdersHandler(req, res, next) {
    try {
        const userId = req.query.userId;
        const orders = await listOrders(userId);
        res.json(orders);
    }
    catch (err) {
        next(err);
    }
}
export async function getOrderHandler(req, res, next) {
    try {
        const { id } = req.params;
        const order = await getOrder(id);
        if (!order)
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Orden no encontrada' });
        res.json(order);
    }
    catch (err) {
        next(err);
    }
}
export async function createOrderHandler(req, res, next) {
    try {
        const parsed = createOrderSchema.parse(req.body);
        const created = await createOrder(parsed);
        res.status(201).json(created);
    }
    catch (err) {
        if (err?.issues) {
            return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Payload inválido', details: err.issues });
        }
        next(err);
    }
}
