import { z } from 'zod'

export const addressSchema = z
  .object({
    addressType: z.enum(['home', 'shop']),
    shopName: z.string().optional(),
    addressLine1: z
      .string()
      .min(3, 'Address Line 1 is required (min 3 characters)'),
    addressLine2: z.string().optional(),
    street: z.string().min(2, 'Street/Area is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z
      .string()
      .min(6, 'Pincode must be 6 digits')
      .max(6, 'Pincode must be 6 digits')
      .regex(/^\d{6}$/, 'Pincode must be a 6-digit number'),
    country: z.string().default('India'),
  })
  .superRefine((data, ctx) => {
    if (data.addressType === 'shop' && !data.shopName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Shop name is required',
        path: ['shopName'],
      })
    }
  })

export type AddressSchema = z.infer<typeof addressSchema>
