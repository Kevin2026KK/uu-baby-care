export type EventType = "喂奶" | "换尿布" | "拉屎" | "洗澡";

export const EVENT_TYPES: EventType[] = ["喂奶", "换尿布", "拉屎", "洗澡"];

export interface BabyCareRecord {
  record_id: string;
  type: EventType;
  time: number;
  note: string;
  created_time?: number;
}

export interface CreateRecordInput {
  type: EventType;
  time?: number;
  note?: string;
}
