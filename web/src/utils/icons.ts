import type { EventType } from "../api/index.js";

export const EVENT_ICON: Record<EventType, string> = {
  "喂奶": "🍼",
  "换尿布": "🧷",
  "拉屎": "💩",
  "洗澡": "🛁",
};

export const EVENT_COLOR: Record<EventType, string> = {
  "喂奶": "#ff9f43",
  "换尿布": "#54a0ff",
  "拉屎": "#5f27cd",
  "洗澡": "#01a3a4",
};
