import "./lib/loadEnv.js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
  mailFrom: process.env.MAIL_FROM ?? "noreply@example.com",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@marketplace.local",
  adminPassword: process.env.ADMIN_PASSWORD ?? "ChangeMeAdmin123",
};
