export default function handler(_req: unknown, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void }) {
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      ok: true,
      brand: "ApnaMart",
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
    }),
  );
}
