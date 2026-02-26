import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });

export const config = {
  feishu: {
    appId: process.env.FEISHU_APP_ID!,
    appSecret: process.env.FEISHU_APP_SECRET!,
  },
  bitable: {
    appToken: process.env.BITABLE_APP_TOKEN!,
    tableId: process.env.BITABLE_TABLE_ID!,
  },
  server: {
    port: parseInt(process.env.SERVER_PORT || "3001"),
  },
  auth: {
    editorCode: process.env.ACCESS_CODE_EDITOR || "editor123",
    viewerCode: process.env.ACCESS_CODE_VIEWER || "viewer123",
  },
  feedIntervalMinutes: parseInt(process.env.FEED_INTERVAL_MINUTES || "180"),
};
