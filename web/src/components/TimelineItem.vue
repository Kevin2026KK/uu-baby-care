<script setup lang="ts">
import { ref } from "vue";
import type { BabyCareRecord } from "../api/index.js";
import { EVENT_ICON, EVENT_COLOR } from "../utils/icons.js";
import { formatTime, relativeTime } from "../utils/time.js";

const props = defineProps<{
  record: BabyCareRecord;
  canDelete?: boolean;
}>();

const emit = defineEmits<{ delete: [id: string] }>();

const offsetX = ref(0);
const swiping = ref(false);
let startX = 0;
let startY = 0;
let locked = false; // locks to horizontal once direction is determined

const DELETE_THRESHOLD = 70;

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  swiping.value = true;
  locked = false;
}

function onTouchMove(e: TouchEvent) {
  if (!swiping.value) return;

  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;

  // Determine direction on first significant move
  if (!locked && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
    if (Math.abs(dy) > Math.abs(dx)) {
      // Vertical scroll — abort swipe
      swiping.value = false;
      offsetX.value = 0;
      return;
    }
    locked = true;
  }

  if (locked) {
    e.preventDefault(); // prevent vertical scroll while swiping horizontally
    offsetX.value = Math.min(0, Math.max(-DELETE_THRESHOLD - 20, dx));
  }
}

function onTouchEnd() {
  swiping.value = false;
  if (offsetX.value < -DELETE_THRESHOLD / 2) {
    offsetX.value = -DELETE_THRESHOLD;
  } else {
    offsetX.value = 0;
  }
}

function resetSwipe() {
  offsetX.value = 0;
}
</script>

<template>
  <div class="swipe-wrapper">
    <div
      class="timeline-item"
      :style="{
        '--accent': EVENT_COLOR[record.type],
        transform: `translateX(${offsetX}px)`,
        transition: swiping ? 'none' : 'transform 0.25s ease',
      }"
      @touchstart="canDelete && onTouchStart($event)"
      @touchmove="canDelete && onTouchMove($event)"
      @touchend="canDelete && onTouchEnd()"
    >
      <div class="item-icon">{{ EVENT_ICON[record.type] }}</div>
      <div class="item-body">
        <div class="item-type">{{ record.type }}</div>
        <div class="item-note" v-if="record.note">{{ record.note }}</div>
      </div>
      <div class="item-time">
        <div class="item-clock">{{ formatTime(record.time) }}</div>
        <div class="item-relative">{{ relativeTime(record.time) }}</div>
      </div>
    </div>
    <button
      v-if="canDelete"
      class="delete-btn"
      :style="{ opacity: offsetX < -10 ? 1 : 0 }"
      @click="emit('delete', record.record_id); resetSwipe()"
    >
      删除
    </button>
  </div>
</template>

<style scoped>
.swipe-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 14px;
  border-left: 3px solid var(--accent);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 1;
  touch-action: pan-y;
}

.delete-btn {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 70px;
  border: none;
  background: #e74c3c;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0 14px 14px 0;
  transition: opacity 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  z-index: 0;
}

.item-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.item-body {
  flex: 1;
  min-width: 0;
}

.item-type {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.item-note {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  text-align: right;
  flex-shrink: 0;
}

.item-clock {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.item-relative {
  font-size: 12px;
  color: #aaa;
  margin-top: 2px;
}

@media (prefers-color-scheme: dark) {
  .timeline-item {
    background: #1e1e1e;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
  }
  .item-type, .item-clock {
    color: #e0e0e0;
  }
}
</style>
