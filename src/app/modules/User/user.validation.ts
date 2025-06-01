// validation.ts
import { z } from 'zod';

export const createUserValidation = z
  .object({
    firstName: z.string().min(1, { message: 'First name is required' }),

    lastName: z.string().min(1, { message: 'Last name is required' }),

    phone: z.string().min(1, { message: 'Phone is required' }),

    email: z.string().email({ message: 'Invalid email format' }).optional(),

    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
  })
  .strict(); // ✅ Reject unknown fields
