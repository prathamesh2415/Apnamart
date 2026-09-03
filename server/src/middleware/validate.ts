import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: formatZod(parsed.error) });
      return;
    }
    req.body = parsed.data;
    next();
  };
}

function formatZod(error: ZodError): string {
  return error.issues.map((issue) => issue.message).join("; ");
}
