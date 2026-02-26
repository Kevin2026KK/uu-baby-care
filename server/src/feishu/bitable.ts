import { feishuClient } from "./client.js";
import { config } from "../config.js";
import type { BabyCareRecord, CreateRecordInput, EventType } from "../types.js";

const { appToken, tableId } = config.bitable;

export async function createRecord(input: CreateRecordInput): Promise<BabyCareRecord> {
  const time = input.time || Date.now();
  const res = await feishuClient.bitable.appTableRecord.create({
    path: { app_token: appToken, table_id: tableId },
    data: {
      fields: {
        "记录": input.type,
        "事件类型": input.type,
        "时间": time,
        "备注": input.note || "",
      } as any,
    },
  });

  if (res.code !== 0) {
    throw new Error(`Feishu API error: ${res.msg}`);
  }

  const record = res.data?.record;
  return {
    record_id: record?.record_id || "",
    type: input.type,
    time,
    note: input.note || "",
  };
}

export async function listRecords(limit = 20, pageToken?: string): Promise<{
  records: BabyCareRecord[];
  hasMore: boolean;
  pageToken?: string;
  total?: number;
}> {
  const res = await feishuClient.bitable.appTableRecord.list({
    path: { app_token: appToken, table_id: tableId },
    params: {
      page_size: limit,
      ...(pageToken && { page_token: pageToken }),
    },
  });

  if (res.code !== 0) {
    throw new Error(`Feishu API error: ${res.msg}`);
  }

  const items = res.data?.items || [];
  const records: BabyCareRecord[] = items.map((item) => {
    const fields = item.fields as Record<string, any>;
    return {
      record_id: item.record_id || "",
      type: (typeof fields["事件类型"] === "object" ? fields["事件类型"]?.text : fields["事件类型"]) as EventType,
      time: typeof fields["时间"] === "object" ? fields["时间"]?.value : fields["时间"],
      note: typeof fields["备注"] === "object"
        ? (fields["备注"]?.[0]?.text || "")
        : (fields["备注"] || ""),
      created_time: item.created_time,
    };
  });

  // Sort by time descending (client-side, since Bitable list API sort is limited)
  records.sort((a, b) => (b.time || 0) - (a.time || 0));

  return {
    records,
    hasMore: res.data?.has_more || false,
    pageToken: res.data?.page_token,
    total: res.data?.total,
  };
}

export async function getLatestFeed(): Promise<{
  record: BabyCareRecord | null;
  minutesSince: number;
  nextFeedIn: number;
}> {
  // Fetch recent records and filter for feeding on the client side
  const res = await feishuClient.bitable.appTableRecord.list({
    path: { app_token: appToken, table_id: tableId },
    params: {
      page_size: 50,
    },
  });

  if (res.code !== 0) {
    throw new Error(`Feishu API error: ${res.msg}`);
  }

  const items = res.data?.items || [];

  // Find the latest feeding record
  let latestFeedItem: typeof items[0] | null = null;
  let latestFeedTime = 0;

  for (const item of items) {
    const fields = item.fields as Record<string, any>;
    const typeVal = typeof fields["事件类型"] === "object" ? fields["事件类型"]?.text : fields["事件类型"];
    if (typeVal === "喂奶") {
      const t = typeof fields["时间"] === "object" ? fields["时间"]?.value : fields["时间"];
      if (t > latestFeedTime) {
        latestFeedTime = t;
        latestFeedItem = item;
      }
    }
  }

  if (!latestFeedItem) {
    return { record: null, minutesSince: Infinity, nextFeedIn: 0 };
  }

  const latestFields = latestFeedItem.fields as Record<string, any>;
  const feedTime = latestFeedTime;
  const minutesSince = Math.floor((Date.now() - feedTime) / 60000);
  const nextFeedIn = config.feedIntervalMinutes - minutesSince;

  return {
    record: {
      record_id: latestFeedItem.record_id || "",
      type: "喂奶",
      time: feedTime,
      note: typeof latestFields["备注"] === "object"
        ? (latestFields["备注"]?.[0]?.text || "")
        : (latestFields["备注"] || ""),
    },
    minutesSince,
    nextFeedIn,
  };
}

export async function deleteRecord(recordId: string): Promise<void> {
  const res = await feishuClient.bitable.appTableRecord.delete({
    path: { app_token: appToken, table_id: tableId, record_id: recordId },
  });

  if (res.code !== 0) {
    throw new Error(`Feishu API error: ${res.msg}`);
  }
}
