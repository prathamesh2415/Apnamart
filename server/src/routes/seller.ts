import { Router } from "express";
import multer from "multer";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { productSchema, sellerProfileSchema } from "../lib/schemas.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80";

const serverless = Boolean(process.env.VERCEL);
const uploadDir = serverless ? os.tmpdir() : (process.env.UPLOAD_DIR ?? "uploads");

const upload = multer({
  storage: serverless
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

export function sellerRouter(): Router {
  const router = Router();
  router.use(requireAuth, requireRole("SELLER"));

  router.get("/profile", async (req, res) => {
    const profile = await loadProfile((req as AuthedRequest).user.id);
    if (!profile) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }
    res.json({ profile });
  });

  router.patch("/profile", validateBody(sellerProfileSchema), async (req, res) => {
    const { user } = req as AuthedRequest;
    const profile = await loadProfile(user.id);
    if (!profile) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }
    const { companyName, description, address, website, phone, inquiryEmail, emailInquiriesEnabled, showEmailPublicly, whatsappBusiness, whatsappEnabled } = req.body;
    const [updated] = await prisma.$transaction([
      prisma.sellerProfile.update({
        where: { id: profile.id },
        data: {
          companyName,
          description: description ?? "",
          address: address ?? "",
          website: website ?? "",
          inquiryEmail: inquiryEmail ?? "",
          emailInquiriesEnabled: emailInquiriesEnabled ?? profile.emailInquiriesEnabled,
          showEmailPublicly: showEmailPublicly ?? profile.showEmailPublicly,
          whatsappBusiness: whatsappBusiness ?? "",
          whatsappEnabled: whatsappEnabled ?? profile.whatsappEnabled,
        },
      }),
      prisma.user.update({ where: { id: user.id }, data: { phone } }),
    ]);
    res.json({ profile: updated });
  });

  router.get("/products", async (req, res) => {
    const profile = await loadProfile((req as AuthedRequest).user.id);
    if (!profile) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }
    const products = await prisma.product.findMany({
      where: { sellerId: profile.id },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ products, sellerStatus: profile.status });
  });

  router.post(
    "/products",
    upload.array("images", 6),
    async (req, res) => {
      const parsed = productSchema.safeParse({
        title: req.body.title,
        description: req.body.description,
        categoryId: req.body.categoryId,
      });
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
        return;
      }
      const profile = await loadProfile((req as AuthedRequest).user.id);
      if (!profile) {
        res.status(404).json({ error: "Seller profile not found" });
        return;
      }
      if (profile.status !== "APPROVED") {
        res.status(403).json({ error: "Your seller account must be approved before listing products" });
        return;
      }
      const allowed = profile.categories.some((link) => link.categoryId === parsed.data.categoryId);
      if (!allowed) {
        res.status(400).json({ error: "Admin has not assigned this category to your account" });
        return;
      }
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      const images =
        serverless || files.length === 0
          ? files.length > 0
            ? files.map((_, index) => ({ url: PLACEHOLDER_IMAGE, sortOrder: index }))
            : [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }]
          : files.map((file, index) => ({
              url: `/uploads/${file.filename}`,
              sortOrder: index,
            }));
      const product = await prisma.product.create({
        data: {
          ...parsed.data,
          sellerId: profile.id,
          images: { create: images },
        },
        include: { images: true, category: true },
      });
      res.status(201).json({ product });
    },
  );

  router.get("/leads", async (req, res) => {
    const profile = await loadProfile((req as AuthedRequest).user.id);
    if (!profile) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }
    const leads = await prisma.lead.findMany({
      where: { sellerId: profile.id },
      include: {
        buyer: { select: { name: true, email: true, phone: true, buyerProfile: true } },
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ leads });
  });

  return router;
}

async function loadProfile(userId: string) {
  return prisma.sellerProfile.findUnique({
    where: { userId },
    include: { categories: { include: { category: true } }, user: true },
  });
}
