<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";

const emit = defineEmits<{
  confirm: [amount: number | null];
  close: [];
}>();

// Generate 0, 10, 20, ... 250
const amounts: number[] = [];
for (let i = 0; i <= 250; i += 10) amounts.push(i);

const selected = ref(120); // default to 120ml
const wheelRef = ref<HTMLElement>();
const ITEM_H = 44;

function onScroll() {
  const el = wheelRef.value;
  if (!el) return;
  const idx = Math.round(el.scrollTop / ITEM_H);
  selected.value = amounts[Math.min(idx, amounts.length - 1)];
}

function scrollTo(ml: number) {
  const idx = amounts.indexOf(ml);
  if (idx >= 0 && wheelRef.value) {
    wheelRef.value.scrollTop = idx * ITEM_H;
  }
}

onMounted(async () => {
  await nextTick();
  scrollTo(selected.value);
});

function confirm() {
  emit("confirm", selected.value);
}

function skip() {
  emit("confirm", null);
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
          <span class="sheet-title">🍼 喂奶量</span>
          <button class="sheet-close" @click="$emit('close')">✕</button>
        </div>

        <div class="wheel-container">
          <div class="wheel-highlight"></div>
          <div class="wheel-mask wheel-mask--top"></div>
          <div class="wheel-mask wheel-mask--bottom"></div>
          <div
            ref="wheelRef"
            class="wheel"
            @scroll="onScroll"
          >
            <!-- top/bottom padding so first/last items can center -->
            <div class="wheel-pad"></div>
            <div
              v-for="ml in amounts"
              :key="ml"
              class="wheel-item"
              :class="{ 'is-selected': ml === selected }"
              @click="scrollTo(ml)"
            >
              {{ ml }} <span class="wheel-unit">ml</span>
            </div>
            <div class="wheel-pad"></div>
          </div>
        </div>

        <div class="sheet-actions">
          <button class="btn-skip" @click="skip">不记量</button>
          <button class="btn-confirm" @click="confirm">
            记录 {{ selected }}ml
          </button>
        </div>
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
  margin-bottom: 12px;
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

/* Wheel picker */
.wheel-container {
  position: relative;
  height: 220px; /* 5 items visible */
  margin-bottom: 16px;
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
  height: 88px; /* 2 items height for centering */
  flex-shrink: 0;
}

.wheel-item {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 500;
  color: #bbb;
  scroll-snap-align: center;
  cursor: pointer;
  transition: color 0.15s, font-size 0.15s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.wheel-item.is-selected {
  font-size: 24px;
  font-weight: 700;
  color: #ff9f43;
}

.wheel-unit {
  font-size: 14px;
  font-weight: 500;
  margin-left: 4px;
  opacity: 0.7;
}

.wheel-highlight {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 44px;
  transform: translateY(-50%);
  background: #fff8f0;
  border-radius: 12px;
  border: 1.5px solid #ffe0b2;
  pointer-events: none;
  z-index: 0;
}

.wheel-mask {
  position: absolute;
  left: 0;
  right: 0;
  height: 80px;
  pointer-events: none;
  z-index: 1;
}

.wheel-mask--top {
  top: 0;
  background: linear-gradient(to bottom, white 20%, transparent);
}

.wheel-mask--bottom {
  bottom: 0;
  background: linear-gradient(to top, white 20%, transparent);
}

/* Actions */
.sheet-actions {
  display: flex;
  gap: 10px;
}

.btn-skip {
  flex: 1;
  height: 50px;
  border: none;
  border-radius: 14px;
  background: #f0f0f0;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.btn-confirm {
  flex: 2;
  height: 50px;
  border: none;
  border-radius: 14px;
  background: #ff9f43;
  font-size: 15px;
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
  .wheel-highlight { background: #2a2000; border-color: #5a4000; }
  .wheel-mask--top { background: linear-gradient(to bottom, #1e1e1e 20%, transparent); }
  .wheel-mask--bottom { background: linear-gradient(to top, #1e1e1e 20%, transparent); }
  .btn-skip { background: #333; color: #aaa; }
}
</style>
