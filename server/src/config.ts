import "./lib/loadEnv.js";

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function required(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  get databaseUrl(): string {
    return required("DATABASE_URL");
  },
  get jwtSecret(): string {
    return required("JWT_SECRET");
  },
  get clientOrigin(): string {
    return read("CLIENT_ORIGIN") ?? "http://localhost:5173";
  },
  get uploadDir(): string {
    return read("UPLOAD_DIR") ?? "uploads";
  },
  get sendgridApiKey(): string {
    return read("SENDGRID_API_KEY") ?? "";
  },
  get mailFrom(): string {
    return read("MAIL_FROM") ?? "noreply@example.com";
  },
  get adminEmail(): string {
    return read("ADMIN_EMAIL") ?? "admin@marketplace.local";
  },
  get adminPassword(): string {
    return read("ADMIN_PASSWORD") ?? "ChangeMeAdmin123";
  },
};
