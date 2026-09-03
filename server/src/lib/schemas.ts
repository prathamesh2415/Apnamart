import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20).optional(),
  role: z.enum(["BUYER", "SELLER"]),
  companyName: z.string().min(2).max(160).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const leadSchema = z.object({
  sellerId: z.string().min(1),
  productId: z.string().optional(),
  message: z.string().min(10).max(2000),
  channel: z.enum(["FORM", "EMAIL", "WHATSAPP"]).optional(),
});

export const productSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(5000),
  categoryId: z.string().min(1),
});

export const sellerProfileSchema = z.object({
  companyName: z.string().min(2).max(160),
  description: z.string().max(4000).optional(),
  address: z.string().max(400).optional(),
  website: z.string().max(200).optional(),
  phone: z.string().min(8).max(20).optional(),
  inquiryEmail: z.union([z.string().email(), z.literal("")]).optional(),
  emailInquiriesEnabled: z.boolean().optional(),
  showEmailPublicly: z.boolean().optional(),
  whatsappBusiness: z.string().max(20).optional(),
  whatsappEnabled: z.boolean().optional(),
});

export const buyerProfileSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().max(20).optional(),
  companyName: z.string().max(160).optional(),
  city: z.string().max(120).optional(),
  whatsapp: z.string().max(20).optional(),
  gstin: z.string().max(20).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
});

export const cmsSchema = z.object({
  title: z.string().min(2).max(160),
  body: z.string().min(1),
});
