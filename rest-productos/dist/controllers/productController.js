import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from '../services/productService.js';
import { createProductSchema, updateProductSchema } from '../validators/productSchemas.js';
export async function listProductsHandler(req, res, next) {
    try {
        const search = req.query.search;
        const products = await listProducts({ search });
        res.json(products);
    }
    catch (err) {
        next(err);
    }
}
export async function getProductHandler(req, res, next) {
    try {
        const { id } = req.params;
        const product = await getProduct(id);
        if (!product)
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Producto no encontrado' });
        res.json(product);
    }
    catch (err) {
        next(err);
    }
}
export async function createProductHandler(req, res, next) {
    try {
        const parsed = createProductSchema.parse(req.body);
        const created = await createProduct(parsed);
        res.status(201).json(created);
    }
    catch (err) {
        if (err?.issues)
            return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Payload inválido', details: err.issues });
        next(err);
    }
}
export async function updateProductHandler(req, res, next) {
    try {
        const { id } = req.params;
        const parsed = updateProductSchema.parse(req.body);
        const updated = await updateProduct(id, parsed);
        if (!updated)
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Producto no encontrado' });
        res.json(updated);
    }
    catch (err) {
        if (err?.issues)
            return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Payload inválido', details: err.issues });
        next(err);
    }
}
export async function deleteProductHandler(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await deleteProduct(id);
        if (!deleted)
            return res.status(404).json({ code: 'NOT_FOUND', message: 'Producto no encontrado' });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
