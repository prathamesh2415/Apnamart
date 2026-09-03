import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../lib/schemas.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth, signToken, type AuthedRequest } from "../middleware/auth.js";
import type { Mailer } from "../lib/mailer.js";

export function authRouter(mailer: Mailer): Router {
  const router = Router();

  router.post("/register", validateBody(registerSchema), async (req, res) => {
    const { email, password, name, phone, role, companyName } = req.body;
    if (role === "SELLER" && !companyName) {
      res.status(400).json({ error: "Company name is required for sellers" });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone,
        role,
        sellerProfile:
          role === "SELLER"
            ? { create: { companyName: companyName as string } }
            : undefined,
        buyerProfile: role === "BUYER" ? { create: {} } : undefined,
      },
    });
    await mailer.send({
      to: user.email,
      subject: role === "SELLER" ? "Seller registration received" : "Welcome to the marketplace",
      text:
        role === "SELLER"
          ? "Your seller account is pending admin approval. You will be notified when it is reviewed."
          : "Your buyer account is ready. You can search products and send lead inquiries.",
    });
    const token = signToken({ id: user.id, role: user.role, email: user.email });
    res.status(201).json({ token, user: publicUser(user) });
  });

  router.post("/login", validateBody(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { sellerProfile: true },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    if (user.role === "SELLER" && user.sellerProfile?.status === "DEACTIVATED") {
      res.status(403).json({ error: "This seller account has been deactivated" });
      return;
    }
    const token = signToken({ id: user.id, role: user.role, email: user.email });
    res.json({ token, user: publicUser(user) });
  });

  router.get("/me", requireAuth, async (req, res) => {
    const { user } = req as AuthedRequest;
    const record = await prisma.user.findUnique({
      where: { id: user.id },
      include: { sellerProfile: true, buyerProfile: true },
    });
    if (!record) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user: publicUser(record), seller: record.sellerProfile, buyer: record.buyerProfile });
  });

  return router;
}

function publicUser(user: { id: string; email: string; name: string; role: string; phone: string | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
  };
}
