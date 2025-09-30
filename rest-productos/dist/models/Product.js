import mongoose, { Schema } from 'mongoose';
const ProductSchema = new Schema({
    nombre: { type: String, required: true },
    descripcionCorta: { type: String },
    descripcionLarga: { type: String },
    precio: { type: Number, required: true, min: 0 },
    imagenes: { type: [String], default: [] },
    categoria: { type: String },
    stock: { type: Number, required: true, min: 0 }
}, { timestamps: true });
ProductSchema.index({ nombre: 'text', descripcionCorta: 'text', descripcionLarga: 'text' });
export const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
