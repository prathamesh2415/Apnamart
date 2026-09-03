import { Router } from "express";
import { ProductStatus, SellerStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { buyerProfileSchema, leadSchema } from "../lib/schemas.js";
import { dealerInbox, inquiryEmail, publicContact } from "../lib/contact.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { routeParam } from "../lib/params.js";
import type { Mailer } from "../lib/mailer.js";

const PAGE_SIZE = 12;

export function catalogRouter(mailer: Mailer): Router {
  const router = Router();

  router.get("/categories", async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json({ categories });
  });

  router.get("/cms/:slug", async (req, res) => {
    const page = await prisma.cmsPage.findUnique({ where: { slug: routeParam(req.params.slug) } });
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json({ page });
  });

  router.get("/products", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const where = {
      status: ProductStatus.APPROVED,
      seller: { status: SellerStatus.APPROVED },
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: true,
          seller: { include: { user: { select: { name: true, phone: true, email: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);
    res.json({
      products: products.map((product) => ({
        ...product,
        seller: {
          id: product.seller.id,
          companyName: product.seller.companyName,
          ...publicContact(product.seller),
        },
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
    });
  });

  router.get("/products/:id", async (req, res) => {
    const product = await prisma.product.findFirst({
      where: {
        id: routeParam(req.params.id),
        status: ProductStatus.APPROVED,
        seller: { status: SellerStatus.APPROVED },
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        seller: {
          include: { user: { select: { name: true, phone: true, email: true } } },
        },
      },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ product: withContact(product) });
  });

  router.get("/sellers", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const page = Math.max(1, Number(req.query.page) || 1);
    const where = {
      status: SellerStatus.APPROVED,
      ...(q
        ? {
            OR: [
              { companyName: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
              { address: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [total, sellers] = await Promise.all([
      prisma.sellerProfile.count({ where }),
      prisma.sellerProfile.findMany({
        where,
        include: {
          user: { select: { name: true } },
          categories: { include: { category: true } },
          _count: { select: { products: { where: { status: ProductStatus.APPROVED } } } },
        },
        orderBy: { companyName: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);
    res.json({
      sellers: sellers.map((seller) => ({
        id: seller.id,
        companyName: seller.companyName,
        description: seller.description,
        address: seller.address,
        website: seller.website,
        contactName: seller.user.name,
        categories: seller.categories.map((link) => link.category),
        productCount: seller._count.products,
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
    });
  });

  router.get("/sellers/:id", async (req, res) => {
    const seller = await prisma.sellerProfile.findFirst({
      where: { id: routeParam(req.params.id), status: SellerStatus.APPROVED },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        categories: { include: { category: true } },
        products: {
          where: { status: ProductStatus.APPROVED },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            category: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!seller) {
      res.status(404).json({ error: "Seller not found" });
      return;
    }
    res.json({
      seller: {
        id: seller.id,
        companyName: seller.companyName,
        description: seller.description,
        address: seller.address,
        website: seller.website,
        ...publicContact(seller),
        categories: seller.categories.map((link) => link.category),
        products: seller.products.map((product) => ({
          ...product,
          seller: { id: seller.id, companyName: seller.companyName },
        })),
      },
    });
  });

  router.post(
    "/leads",
    requireAuth,
    requireRole("BUYER"),
    validateBody(leadSchema),
    async (req, res) => {
      const { user } = req as AuthedRequest;
      const { sellerId, productId, message, channel } = req.body as {
        sellerId: string;
        productId?: string;
        message: string;
        channel?: "FORM" | "EMAIL" | "WHATSAPP";
      };
      const leadChannel = channel ?? "FORM";
      const seller = await prisma.sellerProfile.findFirst({
        where: { id: sellerId, status: SellerStatus.APPROVED },
        include: { user: true },
      });
      if (!seller) {
        res.status(404).json({ error: "Seller is not available" });
        return;
      }
      if (leadChannel === "EMAIL" && !seller.emailInquiriesEnabled) {
        res.status(400).json({ error: "This dealer has turned off email requirements" });
        return;
      }
      let productTitle: string | undefined;
      if (productId) {
        const product = await prisma.product.findFirst({
          where: { id: productId, sellerId, status: ProductStatus.APPROVED },
        });
        if (!product) {
          res.status(400).json({ error: "Product does not belong to this seller" });
          return;
        }
        productTitle = product.title;
      }
      const buyer = await prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { buyerProfile: true },
      });
      const lead = await prisma.lead.create({
        data: { buyerId: user.id, sellerId, productId, message, channel: leadChannel },
      });
      const details = {
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        companyName: buyer.buyerProfile?.companyName ?? "",
        city: buyer.buyerProfile?.city ?? "",
        whatsapp: buyer.buyerProfile?.whatsapp ?? "",
        gstin: buyer.buyerProfile?.gstin ?? "",
      };
      if (seller.emailInquiriesEnabled && leadChannel !== "WHATSAPP") {
        await mailer.send({
          to: dealerInbox(seller),
          subject: `ApnaMart requirement: ${productTitle ?? seller.companyName}`,
          text: inquiryEmail(seller.companyName, productTitle, details, message),
        });
      }
      await mailer.send({
        to: buyer.email,
        subject: "Requirement sent on ApnaMart",
        text: `Your requirement was sent to ${seller.companyName} (${leadChannel.toLowerCase()}).\n\n${message}`,
      });
      res.status(201).json({ lead });
    },
  );

  router.get("/buyer/profile", requireAuth, requireRole("BUYER"), async (req, res) => {
    const { user } = req as AuthedRequest;
    const record = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { buyerProfile: true },
    });
    const profile =
      record.buyerProfile ??
      (await prisma.buyerProfile.create({ data: { userId: record.id } }));
    res.json({
      profile: {
        name: record.name,
        email: record.email,
        phone: record.phone ?? "",
        companyName: profile.companyName,
        city: profile.city,
        whatsapp: profile.whatsapp,
        gstin: profile.gstin,
      },
    });
  });

  router.patch("/buyer/profile", requireAuth, requireRole("BUYER"), validateBody(buyerProfileSchema), async (req, res) => {
    const { user } = req as AuthedRequest;
    const { name, phone, companyName, city, whatsapp, gstin } = req.body as {
      name: string;
      phone?: string;
      companyName?: string;
      city?: string;
      whatsapp?: string;
      gstin?: string;
    };
    const [updatedUser, profile] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { name, phone: phone?.trim() || null },
      }),
      prisma.buyerProfile.upsert({
        where: { userId: user.id },
        update: {
          companyName: companyName ?? "",
          city: city ?? "",
          whatsapp: whatsapp ?? "",
          gstin: gstin ?? "",
        },
        create: {
          userId: user.id,
          companyName: companyName ?? "",
          city: city ?? "",
          whatsapp: whatsapp ?? "",
          gstin: gstin ?? "",
        },
      }),
    ]);
    res.json({
      profile: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
        companyName: profile.companyName,
        city: profile.city,
        whatsapp: profile.whatsapp,
        gstin: profile.gstin,
      },
    });
  });

  router.get("/buyer/leads", requireAuth, requireRole("BUYER"), async (req, res) => {
    const { user } = req as AuthedRequest;
    const leads = await prisma.lead.findMany({
      where: { buyerId: user.id },
      include: {
        seller: {
          select: {
            companyName: true,
            whatsappBusiness: true,
            whatsappEnabled: true,
            user: { select: { phone: true, email: true, name: true } },
          },
        },
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ leads });
  });

  return router;
}

function withContact(product: {
  seller: Parameters<typeof publicContact>[0] & { companyName: string };
}) {
  const contact = publicContact(product.seller);
  return {
    ...product,
    seller: {
      ...product.seller,
      ...contact,
    },
  };
}
