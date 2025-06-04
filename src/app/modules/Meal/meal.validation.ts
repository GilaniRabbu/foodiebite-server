// validations/meal.validation.ts
import { z } from 'zod';

export const mealTypes = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
  'DESSERT',
] as const;
export const mealStatuses = ['ACTIVE', 'INACTIVE', 'DELETED'] as const;

export const createMealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  description: z.string().optional(),
  type: z.enum(mealTypes),
  images: z.array(z.string().url('Each image must be a valid URL')),
  ingredients: z.array(z.string()).optional(),
  price: z.number().min(0, 'Price must be a positive number'),
  isAvailable: z.boolean().optional(),
  mealStatus: z.enum(mealStatuses).optional(),
  userId: z.string().min(1, 'User ID is required'),
});

export const updateMealSchema = createMealSchema.partial();
