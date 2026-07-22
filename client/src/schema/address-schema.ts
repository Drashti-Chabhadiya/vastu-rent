import { z } from 'zod'

export const addressSchema = z
  .object({
    addressType: z.enum(['home', 'shop']),
    shopName: z.string().optional(),
    addressLine1: z
      .string()
      .min(1, 'Address Line 1 is required')
      .min(3, 'Address Line 1 must be at least 3 characters'),
    addressLine2: z.string().optional(),
    street: z
      .string()
      .min(1, 'Street / Area is required')
      .min(2, 'Street / Area must be at least 2 characters'),
    city: z.string().min(1, 'Please select or enter a city'),
    state: z.string().min(1, 'Please select or enter a state'),
    pincode: z
      .string()
      .min(1, 'Pincode is required')
      .min(6, 'Pincode must be a 6-digit number')
      .max(6, 'Pincode must be a 6-digit number')
      .regex(/^\d{6}$/, 'Pincode must contain 6 digits only'),
    country: z.string().default('India'),
  })
  .superRefine((data, ctx) => {
    if (data.addressType === 'shop' && !data.shopName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Shop name is required for shop addresses',
        path: ['shopName'],
      })
    }
  })

export type AddressSchema = z.infer<typeof addressSchema>
