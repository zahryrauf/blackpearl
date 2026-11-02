import { z } from 'zod';

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional(),
  topic: z.enum(['buy', 'sell', 'charter', 'general']).default('general'),
  message: z.string().trim().max(4000).optional(),
  yachtSlug: z.string().trim().max(120).optional(),
  company: z.string().max(0).optional(), // honeypot, must stay empty
  ts: z.number().optional(), // render time, used as a time trap
});
export const subscribeSchema = z.object({ email: z.string().trim().email().max(200), interests: z.array(z.string()).optional(), company: z.string().max(0).optional() });
export const quoteSchema = z.object({ slug: z.string(), from: z.string(), to: z.string(), guests: z.number().int().min(1).max(60).optional() });
export const bookingSchema = quoteSchema.extend({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  company: z.string().max(0).optional(),
});
