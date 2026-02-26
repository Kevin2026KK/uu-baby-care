import { Router } from "express";
import { createRecord, listRecords, getLatestFeed, deleteRecord } from "../feishu/bitable.js";
import { EVENT_TYPES } from "../types.js";
import type { EventType } from "../types.js";
import { requireEditor } from "../middleware/auth.js";

const router = Router();

router.post("/records", requireEditor, async (req, res) => {
  try {
    const { type, time, note } = req.body;

    if (!type || !EVENT_TYPES.includes(type as EventType)) {
      res.status(400).json({ error: `type must be one of: ${EVENT_TYPES.join(", ")}` });
      return;
    }

    const record = await createRecord({
      type: type as EventType,
      time: time ? Number(time) : undefined,
      note,
    });

    res.status(201).json({ success: true, record });
  } catch (err) {
    console.error("Create record error:", err);
    res.status(500).json({ error: String(err) });
  }
});

router.get("/records", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const pageToken = req.query.page_token as string | undefined;

    const result = await listRecords(limit, pageToken);
    res.json(result);
  } catch (err) {
    console.error("List records error:", err);
    res.status(500).json({ error: String(err) });
  }
});

router.get("/records/latest-feed", async (_req, res) => {
  try {
    const result = await getLatestFeed();
    res.json(result);
  } catch (err) {
    console.error("Get latest feed error:", err);
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/records/:id", requireEditor, async (req, res) => {
  try {
    await deleteRecord(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete record error:", err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
