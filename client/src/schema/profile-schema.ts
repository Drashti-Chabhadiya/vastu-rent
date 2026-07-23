import { z } from 'zod'

export const personalSchema = z
  .object({
    name: z.string().min(1, 'Full Name is required'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    language: z.string().min(1, 'Language is required').default('en'),
    dob: z.string().min(1, 'Date of Birth is required'),
  })
  .superRefine((data, ctx) => {
    if (data.dob) {
      const dobDate = new Date(data.dob)
      const today = new Date()
      let age = today.getFullYear() - dobDate.getFullYear()
      const m = today.getMonth() - dobDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--
      }

      if (age < 18) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'You must be at least 18 years old',
          path: ['dob'],
        })
      }
    }
  })

export const addressSchema = z
  .object({
    addressType: z.enum(['home', 'shop']).default('home'),
    shopName: z.string().optional(),
    addressLine1: z.string().min(1, 'Address Line 1 is required'),
    addressLine2: z.string().optional(),
    street: z.string().min(1, 'Street / Area is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z
      .string()
      .min(1, 'Pincode is required')
      .regex(/^\d{6}$/, 'Pincode must contain 6 digits only'),
    googleMapLink: z
      .string()
      .url('Please enter a valid URL')
      .optional()
      .or(z.literal('')),
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

export const profileSchema = z.intersection(personalSchema, addressSchema)

export type ProfileSchema = z.infer<typeof profileSchema>
