import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

export type Role = "editor" | "viewer";

declare global {
  namespace Express {
    interface Request {
      role?: Role;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth for login endpoint and health check
  if (req.path === "/auth/login" || req.path === "/health") {
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "未授权，请输入邀请码" });
    return;
  }

  const code = header.slice(7);

  if (code === config.auth.editorCode) {
    req.role = "editor";
  } else if (code === config.auth.viewerCode) {
    req.role = "viewer";
  } else {
    res.status(401).json({ error: "邀请码无效" });
    return;
  }

  next();
}

export function requireEditor(req: Request, res: Response, next: NextFunction) {
  if (req.role !== "editor") {
    res.status(403).json({ error: "仅编辑权限可执行此操作" });
    return;
  }
  next();
}
