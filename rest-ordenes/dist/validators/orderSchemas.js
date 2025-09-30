import { z } from 'zod';
export const createOrderSchema = z.object({
    userId: z.string().min(1),
    items: z.array(z.object({
        productId: z.string().min(1),
        cantidad: z.number().int().positive()
    })).min(1),
    direccionEnvio: z.string().optional()
});
