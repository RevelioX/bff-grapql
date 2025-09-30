import { ProductModel } from '../models/Product.js';
export async function listProducts(filter) {
    const query = {};
    if (filter?.search) {
        query.$text = { $search: filter.search };
    }
    return ProductModel.find(query).sort({ updatedAt: -1 }).lean();
}
export async function getProduct(id) {
    return ProductModel.findById(id).lean();
}
export async function createProduct(data) {
    const doc = await ProductModel.create({ ...data, imagenes: data.imagenes || [] });
    return doc.toObject();
}
export async function updateProduct(id, data) {
    const doc = await ProductModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return doc;
}
export async function deleteProduct(id) {
    return ProductModel.findByIdAndDelete(id).lean();
}
