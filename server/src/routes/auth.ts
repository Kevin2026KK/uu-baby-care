import { Router } from "express";
import { config } from "../config.js";
import type { Role } from "../middleware/auth.js";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({ error: "请输入邀请码" });
    return;
  }

  let role: Role | null = null;

  if (code === config.auth.editorCode) {
    role = "editor";
  } else if (code === config.auth.viewerCode) {
    role = "viewer";
  }

  if (!role) {
    res.status(401).json({ error: "邀请码无效" });
    return;
  }

  res.json({ success: true, role });
});

export default router;
