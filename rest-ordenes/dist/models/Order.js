import mongoose, { Schema } from 'mongoose';
const OrderItemSchema = new Schema({
    productId: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 1 }
});
const OrderSchema = new Schema({
    userId: { type: String, required: true, index: true },
    items: { type: [OrderItemSchema], required: true, validate: (v) => v.length > 0 },
    direccionEnvio: { type: String },
    total: { type: Number, required: true, min: 0 }
}, { timestamps: true });
export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
