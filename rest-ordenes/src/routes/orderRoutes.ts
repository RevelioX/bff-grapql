import { Router } from 'express';
import { createOrderHandler, getOrderHandler, listOrdersHandler } from '../controllers/orderController.js';

const router = Router();

router.get('/', listOrdersHandler);
router.get('/:id', getOrderHandler);
router.post('/', createOrderHandler);

export default router;
