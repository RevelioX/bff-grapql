import mongoose, { Schema, Document, Model } from 'mongoose';

export interface Product extends Document {
  nombre: string;
  descripcionCorta?: string;
  descripcionLarga?: string;
  precio: number;
  imagenes: string[];
  categoria?: string;
  stock: number;
  updatedAt: Date;
  createdAt: Date;
}

const ProductSchema = new Schema<Product>({
  nombre: { type: String, required: true },
  descripcionCorta: { type: String },
  descripcionLarga: { type: String },
  precio: { type: Number, required: true, min: 0 },
  imagenes: { type: [String], default: [] },
  categoria: { type: String },
  stock: { type: Number, required: true, min: 0 }
}, { timestamps: true });

ProductSchema.index({ nombre: 'text', descripcionCorta: 'text', descripcionLarga: 'text' });

export const ProductModel: Model<Product> = mongoose.models.Product || mongoose.model<Product>('Product', ProductSchema);
