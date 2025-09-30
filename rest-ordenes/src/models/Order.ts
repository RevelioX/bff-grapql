import mongoose, { Schema, Document, Model } from 'mongoose';

export interface OrderItem {
  productId: string;
  cantidad: number;
}

export interface Order extends Document {
  userId: string;
  items: OrderItem[];
  direccionEnvio?: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  productId: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 }
});

const OrderSchema = new Schema<Order>({
  userId: { type: String, required: true, index: true },
  items: { type: [OrderItemSchema], required: true, validate: (v: OrderItem[]) => v.length > 0 },
  direccionEnvio: { type: String },
  total: { type: Number, required: true, min: 0 }
}, { timestamps: true });

export const OrderModel: Model<Order> = mongoose.models.Order || mongoose.model<Order>('Order', OrderSchema);
