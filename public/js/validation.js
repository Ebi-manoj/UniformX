import * as z from 'https://esm.sh/zod@3.24.2';

export const couponSchema = z.object({
  code: z
    .string()
    .min(5, 'Coupon code must be between 5 and 20 characters')
    .max(20, 'Coupon code must be between 5 and 20 characters')
    .regex(
      /^[A-Za-z0-9]+$/,
      'Coupon code must contain only letters and numbers'
    ),

  description: z.string().min(2, 'Description is required').trim(),
  isActive: z.boolean(),

  discountType: z.enum(['percentage', 'fixed']),

  discountAmount: z
    .string()
    .min(1, 'Discount amount is required')
    .refine(val => !isNaN(val) && parseFloat(val) > 0, {
      message: 'Discount amount must be a positive number',
    }),

  minimumPurchase: z
    .string()
    .min(1, 'Minimum purchase is required')
    .refine(val => !isNaN(val) && parseFloat(val) >= 0, {
      message: 'Minimum purchase must be a positive number',
    }),

  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),

  usageLimit: z
    .string()
    .optional()
    .refine(val => !val || (val && !isNaN(val) && parseInt(val) >= 1), {
      message: 'Usage limit must be at least 1 or empty',
    }),
});

export const addOfferSchema = z.object({
  name: z.string().min(3, 'Offer name must be at least 3 characters').max(50),
  type: z.enum(['product', 'category'], { message: 'Offer type is required' }),

  products: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),

  discountPercentage: z
    .string()
    .min(1, 'Discount percentage is required')
    .refine(
      val => !isNaN(val) && parseFloat(val) > 0 && parseFloat(val) <= 100,
      {
        message: 'Discount must be between 1 and 100',
      }
    ),

  validFrom: z.string().min(1, 'Start date is required'),
  validTo: z.string().min(1, 'End date is required'),
});
