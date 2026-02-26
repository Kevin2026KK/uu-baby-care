<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import type { EventType } from "../api/index.js";
import { EVENT_ICON, EVENT_COLOR } from "../utils/icons.js";

const emit = defineEmits<{
  confirm: [type: EventType, time: number, note: string];
  close: [];
}>();

const EVENT_TYPES: EventType[] = ["喂奶", "换尿布", "拉屎", "洗澡"];

const selectedType = ref<EventType>("喂奶");
const note = ref("");

// Milk amount wheel
const amounts: number[] = [];
for (let i = 0; i <= 250; i += 10) amounts.push(i);
const milkAmount = ref(120);
const wheelRef = ref<HTMLElement>();
const ITEM_H = 40;

function onWheelScroll() {
  const el = wheelRef.value;
  if (!el) return;
  const idx = Math.round(el.scrollTop / ITEM_H);
  milkAmount.value = amounts[Math.min(idx, amounts.length - 1)];
}

function scrollToMl(ml: number) {
  const idx = amounts.indexOf(ml);
  if (idx >= 0 && wheelRef.value) {
    wheelRef.value.scrollTop = idx * ITEM_H;
  }
}

watch(selectedType, async (t) => {
  if (t === "喂奶") {
    await nextTick();
    scrollToMl(milkAmount.value);
  }
});

onMounted(async () => {
  await nextTick();
  if (selectedType.value === "喂奶") {
    scrollToMl(milkAmount.value);
  }
});

// Default to current time
function toLocalISO(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const timeStr = ref(toLocalISO(new Date()));

function confirm() {
  const t = new Date(timeStr.value).getTime();
  let finalNote = note.value;
  if (selectedType.value === "喂奶" && milkAmount.value > 0) {
    finalNote = finalNote ? `${milkAmount.value}ml ${finalNote}` : `${milkAmount.value}ml`;
  }
  emit("confirm", selectedType.value, t, finalNote);
}

function onOverlayClick(e: Event) {
  if (e.target === e.currentTarget) emit("close");
}
</script>

<template>
  <Teleport to="body">
    <div class="sheet-overlay" @click="onOverlayClick">
      <div class="sheet">
        <div class="sheet-header">
          <span class="sheet-title">添加记录</span>
          <button class="sheet-close" @click="$emit('close')">✕</button>
        </div>

        <!-- Event type selector -->
        <div class="type-row">
          <button
            v-for="t in EVENT_TYPES"
            :key="t"
            class="type-btn"
            :class="{ 'is-selected': selectedType === t }"
            :style="{ '--accent': EVENT_COLOR[t] }"
            @click="selectedType = t"
          >
            <span class="type-icon">{{ EVENT_ICON[t] }}</span>
            <span class="type-label">{{ t }}</span>
          </button>
        </div>

        <!-- Milk amount wheel (only for 喂奶) -->
        <div v-if="selectedType === '喂奶'" class="milk-section">
          <span class="field-label">奶量</span>
          <div class="wheel-container">
            <div class="wheel-highlight"></div>
            <div class="wheel-mask wheel-mask--top"></div>
            <div class="wheel-mask wheel-mask--bottom"></div>
            <div ref="wheelRef" class="wheel" @scroll="onWheelScroll">
              <div class="wheel-pad"></div>
              <div
                v-for="ml in amounts"
                :key="ml"
                class="wheel-item"
                :class="{ 'is-selected': ml === milkAmount }"
                @click="scrollToMl(ml)"
              >
                {{ ml }} <span class="wheel-unit">ml</span>
              </div>
              <div class="wheel-pad"></div>
            </div>
          </div>
        </div>

        <!-- Time picker -->
        <label class="field">
          <span class="field-label">时间</span>
          <input type="datetime-local" v-model="timeStr" class="field-input" />
        </label>

        <!-- Note -->
        <label class="field">
          <span class="field-label">备注</span>
          <input
            type="text"
            v-model="note"
            class="field-input"
            placeholder="如: 母乳, 量多..."
          />
        </label>

        <button class="btn-confirm" @click="confirm">
          {{ selectedType === '喂奶' && milkAmount > 0 ? `记录 ${milkAmount}ml` : '记录' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.15s ease;
}

.sheet {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 480px;
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
  animation: slideUp 0.25s ease;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sheet-title {
  font-size: 17px;
  font-weight: 700;
  color: #333;
}

.sheet-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

/* Type selector */
.type-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 0;
  border: 2px solid #eee;
  border-radius: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.type-btn.is-selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, white);
}

.type-icon {
  font-size: 22px;
}

.type-label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.type-btn.is-selected .type-label {
  color: var(--accent);
}

/* Milk amount section */
.milk-section {
  margin-bottom: 14px;
}

.wheel-container {
  position: relative;
  height: 160px;
  margin-top: 6px;
}

.wheel {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.wheel::-webkit-scrollbar {
  display: none;
}

.wheel-pad {
  height: 60px;
  flex-shrink: 0;
}

.wheel-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  color: #bbb;
  scroll-snap-align: center;
  cursor: pointer;
  transition: color 0.15s, font-size 0.15s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.wheel-item.is-selected {
  font-size: 22px;
  font-weight: 700;
  color: #ff9f43;
}

.wheel-unit {
  font-size: 13px;
  font-weight: 500;
  margin-left: 3px;
  opacity: 0.7;
}

.wheel-highlight {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 40px;
  transform: translateY(-50%);
  background: #fff8f0;
  border-radius: 10px;
  border: 1.5px solid #ffe0b2;
  pointer-events: none;
  z-index: 0;
}

.wheel-mask {
  position: absolute;
  left: 0;
  right: 0;
  height: 56px;
  pointer-events: none;
  z-index: 1;
}

.wheel-mask--top {
  top: 0;
  background: linear-gradient(to bottom, white 10%, transparent);
}

.wheel-mask--bottom {
  bottom: 0;
  background: linear-gradient(to top, white 10%, transparent);
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #888;
}

.field-input {
  height: 44px;
  border: 1.5px solid #eee;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 15px;
  color: #333;
  background: #fafafa;
  outline: none;
  font-family: inherit;
  -webkit-appearance: none;
}

.field-input:focus {
  border-color: #ff9f43;
  background: white;
}

/* Confirm */
.btn-confirm {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  background: #ff9f43;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@media (prefers-color-scheme: dark) {
  .sheet { background: #1e1e1e; }
  .sheet-title { color: #e0e0e0; }
  .sheet-close { background: #333; color: #aaa; }
  .type-btn { background: #1e1e1e; border-color: #333; }
  .type-btn.is-selected { background: color-mix(in srgb, var(--accent) 12%, #1e1e1e); }
  .type-label { color: #aaa; }
  .field-input { background: #282828; border-color: #333; color: #e0e0e0; }
  .wheel-highlight { background: #2a2000; border-color: #5a4000; }
  .wheel-mask--top { background: linear-gradient(to bottom, #1e1e1e 10%, transparent); }
  .wheel-mask--bottom { background: linear-gradient(to top, #1e1e1e 10%, transparent); }
}
</style>
