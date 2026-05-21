import { z } from 'zod'

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignupSchema = z.infer<typeof signupSchema>
