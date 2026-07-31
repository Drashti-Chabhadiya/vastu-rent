import { z } from 'zod'

export const listingSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  securityDeposit: z.coerce
    .number()
    .min(0, 'Security deposit must be 0 or more')
    .optional(),
  city: z.string().min(2, 'City is required'),
  categoryId: z.string().min(1, 'Please select a category'),
  userId: z.string().min(1, 'Please assign a provider'),
  images: z.array(z.string()).min(1, 'At least one image is required'),

  // New Enhanced Fields
  features: z.array(z.string()).default([]),
  deliveryOptions: z
    .array(z.string())
    .min(1, 'Select at least one delivery option')
    .default(['Pickup']),
  pickupReturnDetails: z.string().optional(),
  tags: z.array(z.string()).default([]),
  minDuration: z.coerce.number().min(1).default(1),
  maxDuration: z.coerce.number().positive().optional(),
  listingType: z.enum(['home', 'shop']).default('home'),
  shopName: z.string().optional(),
})

export type ListingSchema = z.infer<typeof listingSchema>
