import { ProductModel, Product } from '../models/Product.js';
import { CreateProductInput, UpdateProductInput } from '../validators/productSchemas.js';

export async function listProducts(filter?: { search?: string }) {
  const query: any = {};
  if (filter?.search) {
    query.$text = { $search: filter.search };
  }
  return ProductModel.find(query).sort({ updatedAt: -1 }).lean();
}

export async function getProduct(id: string) {
  return ProductModel.findById(id).lean();
}

export async function createProduct(data: CreateProductInput) {
  const doc = await ProductModel.create({ ...data, imagenes: data.imagenes || [] });
  return doc.toObject();
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  const doc = await ProductModel.findByIdAndUpdate(id, data, { new: true }).lean();
  return doc;
}

export async function deleteProduct(id: string) {
  return ProductModel.findByIdAndDelete(id).lean();
}
