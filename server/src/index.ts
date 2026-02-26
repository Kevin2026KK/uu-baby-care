import express from "express";
import cors from "cors";
import { resolve } from "path";
import { config } from "./config.js";
import { authMiddleware } from "./middleware/auth.js";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import recordsRouter from "./routes/records.js";

const app = express();

app.use(cors());
app.use(express.json());

// Auth middleware for /api routes
app.use("/api", authMiddleware);

app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", recordsRouter);

// Serve frontend static files in production
const distPath = resolve(import.meta.dirname, "../../web/dist");
app.use(express.static(distPath));

// SPA fallback: non-API routes → index.html
app.get("*", (_req, res) => {
  res.sendFile(resolve(distPath, "index.html"));
});

app.listen(config.server.port, "0.0.0.0", () => {
  console.log(`Baby Care API running at http://0.0.0.0:${config.server.port}`);
  console.log(`LAN access: http://<your-ip>:${config.server.port}`);
});
