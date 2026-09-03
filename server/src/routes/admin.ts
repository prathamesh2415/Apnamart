import { Router } from "express";
import { ProductStatus, SellerStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { categorySchema, cmsSchema } from "../lib/schemas.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { routeParam } from "../lib/params.js";
import type { Mailer } from "../lib/mailer.js";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function adminRouter(mailer: Mailer): Router {
  const router = Router();
  router.use(requireAuth, requireRole("ADMIN"));

  router.get("/stats", async (_req, res) => {
    const [buyers, sellers, products, leads, pendingSellers, pendingProducts] = await Promise.all([
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.sellerProfile.count(),
      prisma.product.count(),
      prisma.lead.count(),
      prisma.sellerProfile.count({ where: { status: SellerStatus.PENDING } }),
      prisma.product.count({ where: { status: ProductStatus.PENDING } }),
    ]);
    res.json({ buyers, sellers, products, leads, pendingSellers, pendingProducts });
  });

  router.get("/sellers", async (_req, res) => {
    const sellers = await prisma.sellerProfile.findMany({
      include: {
        user: { select: { email: true, name: true, phone: true } },
        categories: { include: { category: true } },
        _count: { select: { products: true, leads: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ sellers });
  });

  router.patch("/sellers/:id/status", async (req, res) => {
    const status = req.body.status as SellerStatus;
    if (!Object.values(SellerStatus).includes(status)) {
      res.status(400).json({ error: "Invalid seller status" });
      return;
    }
    const seller = await prisma.sellerProfile.update({
      where: { id: routeParam(req.params.id) },
      data: { status },
      include: { user: true },
    });
    await mailer.send({
      to: seller.user.email,
      subject: `Seller account ${status.toLowerCase()}`,
      text: `Your seller account status is now ${status}.`,
    });
    res.json({ seller });
  });

  router.put("/sellers/:id/categories", async (req, res) => {
    const categoryIds = Array.isArray(req.body.categoryIds) ? (req.body.categoryIds as string[]) : [];
    await prisma.$transaction([
      prisma.sellerCategory.deleteMany({ where: { sellerId: routeParam(req.params.id) } }),
      prisma.sellerCategory.createMany({
        data: categoryIds.map((categoryId) => ({ sellerId: routeParam(req.params.id), categoryId })),
      }),
    ]);
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: routeParam(req.params.id) },
      include: { categories: { include: { category: true } } },
    });
    res.json({ seller });
  });

  router.get("/products", async (_req, res) => {
    const products = await prisma.product.findMany({
      include: {
        seller: { select: { companyName: true } },
        category: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ products });
  });

  router.patch("/products/:id/status", async (req, res) => {
    const status = req.body.status as ProductStatus;
    if (!Object.values(ProductStatus).includes(status)) {
      res.status(400).json({ error: "Invalid product status" });
      return;
    }
    const product = await prisma.product.update({
      where: { id: routeParam(req.params.id) },
      data: { status },
      include: { seller: { include: { user: true } } },
    });
    await mailer.send({
      to: product.seller.user.email,
      subject: `Product ${status.toLowerCase()}: ${product.title}`,
      text: `Your product "${product.title}" is now ${status}.`,
    });
    res.json({ product });
  });

  router.post("/categories", validateBody(categorySchema), async (req, res) => {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name, slug: slugify(name) } });
    res.status(201).json({ category });
  });

  router.patch("/categories/:id", validateBody(categorySchema), async (req, res) => {
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: routeParam(req.params.id) },
      data: { name, slug: slugify(name) },
    });
    res.json({ category });
  });

  router.delete("/categories/:id", async (req, res) => {
    const inUse = await prisma.product.count({ where: { categoryId: routeParam(req.params.id) } });
    if (inUse > 0) {
      res.status(409).json({ error: "Cannot delete a category that still has products" });
      return;
    }
    await prisma.category.delete({ where: { id: routeParam(req.params.id) } });
    res.status(204).end();
  });

  router.get("/cms", async (_req, res) => {
    const pages = await prisma.cmsPage.findMany({ orderBy: { slug: "asc" } });
    res.json({ pages });
  });

  router.patch("/cms/:slug", validateBody(cmsSchema), async (req, res) => {
    const page = await prisma.cmsPage.upsert({
      where: { slug: routeParam(req.params.slug) },
      update: req.body,
      create: { slug: routeParam(req.params.slug), ...req.body },
    });
    res.json({ page });
  });

  return router;
}
