import { Router } from 'express';
import { createProductHandler, deleteProductHandler, getProductHandler, listProductsHandler, updateProductHandler } from '../controllers/productController.js';

const router = Router();

router.get('/', listProductsHandler);
router.get('/:id', getProductHandler);
router.post('/', createProductHandler);
router.put('/:id', updateProductHandler);
router.delete('/:id', deleteProductHandler);

export default router;
