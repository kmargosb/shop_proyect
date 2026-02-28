import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  description: z.string().optional(),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo"),
})

export const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  primaryImageId: z.string().optional(),
  imagesToDelete: z.string().optional(),
})