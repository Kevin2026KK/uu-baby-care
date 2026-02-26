const BASE = "/api";

export type EventType = "喂奶" | "换尿布" | "拉屎" | "洗澡";

export interface BabyCareRecord {
  record_id: string;
  type: EventType;
  time: number;
  note: string;
}

export interface LatestFeedResult {
  record: BabyCareRecord | null;
  minutesSince: number;
  nextFeedIn: number;
}

function getAuthHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem("uu_auth");
    if (raw) {
      const { code } = JSON.parse(raw);
      if (code) return { Authorization: `Bearer ${code}` };
    }
  } catch { /* ignore */ }
  return {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  createRecord(type: EventType, note?: string, time?: number) {
    return request<{ success: boolean; record: BabyCareRecord }>("/records", {
      method: "POST",
      body: JSON.stringify({ type, note, time }),
    });
  },

  listRecords(limit = 20) {
    return request<{ records: BabyCareRecord[]; hasMore: boolean }>(`/records?limit=${limit}`);
  },

  getLatestFeed() {
    return request<LatestFeedResult>("/records/latest-feed");
  },

  deleteRecord(id: string) {
    return request<{ success: boolean }>(`/records/${id}`, { method: "DELETE" });
  },
};
