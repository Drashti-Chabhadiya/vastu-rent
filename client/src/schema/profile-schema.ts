import { z } from 'zod'

const flexibleUrl = (domainRegex?: RegExp, domainMessage?: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (!val || !val.trim()) return ''
      let trimmed = val.trim()
      if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = `https://${trimmed}`
      }
      return trimmed
    })
    .refine(
      (val) => {
        if (!val) return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'Please enter a valid URL' },
    )
    .refine(
      (val) => {
        if (!val || !domainRegex) return true
        return domainRegex.test(val)
      },
      { message: domainMessage || 'Invalid URL' },
    )

export const personalSchema = z
  .object({
    name: z.string().min(1, 'Full Name is required'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^\+91[6-9]\d{9}$/.test(val), {
        message:
          'Phone number must start with +91 followed by 10 digits (e.g. +91XXXXXXXXXX)',
      }),
    language: z.string().min(1, 'Language is required').default('en'),
    dob: z.string().min(1, 'Date of Birth is required'),
    instagramUrl: flexibleUrl(
      /instagram\.com/i,
      'Must be a valid Instagram link',
    ),
    facebookUrl: flexibleUrl(/facebook\.com/i, 'Must be a valid Facebook link'),
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
    googleMapLink: flexibleUrl(),
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
export type AddressSchema = z.infer<typeof addressSchema>
