import { ref } from "vue";
import { api } from "../api/index.js";
import type { BabyCareRecord, EventType } from "../api/index.js";

const records = ref<BabyCareRecord[]>([]);
const loading = ref(false);

let tempId = 0;

export function useRecords() {
  async function fetchRecords() {
    loading.value = true;
    try {
      const res = await api.listRecords(50);
      records.value = res.records;
    } catch (err) {
      console.error("Failed to fetch records:", err);
    } finally {
      loading.value = false;
    }
  }

  async function addRecord(type: EventType, note?: string, time?: number): Promise<boolean> {
    // Optimistic update
    const tempRecord: BabyCareRecord = {
      record_id: `temp_${++tempId}`,
      type,
      time: time || Date.now(),
      note: note || "",
    };
    // Insert at correct sorted position (records are sorted newest-first)
    const insertIdx = records.value.findIndex((r) => r.time < tempRecord.time);
    if (insertIdx === -1) {
      records.value.push(tempRecord);
    } else {
      records.value.splice(insertIdx, 0, tempRecord);
    }

    try {
      const res = await api.createRecord(type, note, time);
      // Replace temp with real record
      const idx = records.value.findIndex((r) => r.record_id === tempRecord.record_id);
      if (idx !== -1) {
        records.value[idx] = res.record;
      }
      return true;
    } catch (err) {
      // Remove temp on failure
      records.value = records.value.filter((r) => r.record_id !== tempRecord.record_id);
      console.error("Failed to add record:", err);
      return false;
    }
  }

  async function removeRecord(id: string) {
    const backup = [...records.value];
    records.value = records.value.filter((r) => r.record_id !== id);
    try {
      await api.deleteRecord(id);
    } catch {
      records.value = backup;
    }
  }

  return { records, loading, fetchRecords, addRecord, removeRecord };
}
