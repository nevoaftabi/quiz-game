import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.locals.userId = auth.userId;
  next();
};
