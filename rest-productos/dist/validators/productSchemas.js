import { z } from 'zod';
export const createProductSchema = z.object({
    nombre: z.string().min(1),
    descripcionCorta: z.string().optional(),
    descripcionLarga: z.string().optional(),
    precio: z.number().positive(),
    imagenes: z.array(z.string()).optional(),
    categoria: z.string().optional(),
    stock: z.number().int().nonnegative()
});
export const updateProductSchema = createProductSchema.partial();
