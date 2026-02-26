import { ref } from "vue";
import { useRecords } from "./useRecords.js";
import type { EventType } from "../api/index.js";

const cooldown = ref<Record<string, boolean>>({});
const success = ref<Record<string, boolean>>({});

export function useQuickLog() {
  const { addRecord } = useRecords();

  async function quickLog(type: EventType, note?: string) {
    if (cooldown.value[type]) return;

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Set cooldown
    cooldown.value[type] = true;

    const ok = await addRecord(type, note);

    if (ok) {
      success.value[type] = true;
      setTimeout(() => {
        success.value[type] = false;
      }, 1200);
    }

    setTimeout(() => {
      cooldown.value[type] = false;
    }, 800);
  }

  return { quickLog, cooldown, success };
}
