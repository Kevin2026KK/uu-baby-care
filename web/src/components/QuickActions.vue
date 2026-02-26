<script setup lang="ts">
import { ref } from "vue";
import { useQuickLog } from "../composables/useQuickLog.js";
import { EVENT_ICON, EVENT_COLOR } from "../utils/icons.js";
import type { EventType } from "../api/index.js";
import MilkAmountSheet from "./MilkAmountSheet.vue";

const emit = defineEmits<{ logged: [] }>();
const { quickLog, cooldown, success } = useQuickLog();

const showMilkSheet = ref(false);

const actions: { type: EventType; label: string }[] = [
  { type: "喂奶", label: "喂奶" },
  { type: "换尿布", label: "换尿布" },
  { type: "拉屎", label: "拉屎" },
  { type: "洗澡", label: "洗澡" },
];

async function handleTap(type: EventType) {
  if (type === "喂奶") {
    showMilkSheet.value = true;
    return;
  }
  await quickLog(type);
  emit("logged");
}

async function onMilkConfirm(amount: number | null) {
  showMilkSheet.value = false;
  const note = amount ? `${amount}ml` : undefined;
  await quickLog("喂奶", note);
  emit("logged");
}
</script>

<template>
  <div class="quick-actions">
    <button
      v-for="action in actions"
      :key="action.type"
      class="action-btn"
      :class="{
        'is-cooldown': cooldown[action.type],
        'is-success': success[action.type],
      }"
      :style="{ '--accent': EVENT_COLOR[action.type] }"
      @click="handleTap(action.type)"
      :disabled="cooldown[action.type]"
    >
      <span class="action-icon">{{ success[action.type] ? '✓' : EVENT_ICON[action.type] }}</span>
      <span class="action-label">{{ action.label }}</span>
    </button>
  </div>

  <MilkAmountSheet
    v-if="showMilkSheet"
    @confirm="onMilkConfirm"
    @close="showMilkSheet = false"
  />
</template>

<style scoped>
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 0 4px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 110px;
  border: none;
  border-radius: 20px;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn:active {
  transform: scale(0.93);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.action-btn.is-success {
  background: var(--accent);
}

.action-btn.is-success::before {
  opacity: 0.1;
}

.action-btn.is-success .action-icon,
.action-btn.is-success .action-label {
  color: white;
}

.action-btn.is-cooldown {
  pointer-events: none;
  opacity: 0.7;
}

.action-icon {
  font-size: 36px;
  line-height: 1;
  position: relative;
  z-index: 1;
  transition: transform 0.2s ease;
}

.action-btn.is-success .action-icon {
  font-size: 28px;
  animation: pop 0.3s ease;
}

.action-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  position: relative;
  z-index: 1;
}

@keyframes pop {
  0% { transform: scale(0.5); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@media (prefers-color-scheme: dark) {
  .action-btn {
    background: #1e1e1e;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }
  .action-label {
    color: #e0e0e0;
  }
}
</style>
