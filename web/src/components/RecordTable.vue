<script setup lang="ts">
import { computed } from "vue";
import type { BabyCareRecord, EventType } from "../api/index.js";
import { EVENT_ICON, EVENT_COLOR } from "../utils/icons.js";
import { formatTime, formatDate } from "../utils/time.js";

const props = defineProps<{
  records: BabyCareRecord[];
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  back: [];
  delete: [id: string];
}>();

const EVENT_TYPES: EventType[] = ["喂奶", "换尿布", "拉屎", "洗澡"];

// Group records by type
interface TypeGroup {
  type: EventType;
  icon: string;
  color: string;
  records: BabyCareRecord[];
}

const groups = computed<TypeGroup[]>(() => {
  return EVENT_TYPES.map((t) => ({
    type: t,
    icon: EVENT_ICON[t],
    color: EVENT_COLOR[t],
    records: props.records.filter((r) => r.type === t),
  })).filter((g) => g.records.length > 0);
});
</script>

<template>
  <div class="record-page">
    <div class="page-header">
      <button class="back-btn" @click="emit('back')">← 返回</button>
      <span class="page-title">全部记录</span>
      <span class="page-count">{{ records.length }}条</span>
    </div>

    <div v-if="records.length === 0" class="empty">暂无记录</div>

    <div v-else class="groups">
      <div
        v-for="group in groups"
        :key="group.type"
        class="group-card"
        :style="{ '--accent': group.color }"
      >
        <div class="group-header">
          <span class="group-icon">{{ group.icon }}</span>
          <span class="group-type">{{ group.type }}</span>
          <span class="group-count">{{ group.records.length }}次</span>
        </div>

        <div class="group-list">
          <div
            v-for="r in group.records"
            :key="r.record_id"
            class="record-row"
          >
            <div class="row-left">
              <span class="row-date">{{ formatDate(r.time) }}</span>
              <span class="row-time">{{ formatTime(r.time) }}</span>
            </div>
            <span class="row-note">{{ r.note || '-' }}</span>
            <button v-if="canDelete" class="del-btn" @click="emit('delete', r.record_id)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.record-page {
  min-height: 100dvh;
  padding-bottom: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 14px 0;
  gap: 8px;
}

.back-btn {
  border: none;
  background: none;
  font-size: 15px;
  color: #ff9f43;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  flex: 1;
}

.page-count {
  font-size: 13px;
  color: #999;
}

/* Groups */
.groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.group-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--accent) 8%, white);
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 15%, white);
}

.group-icon {
  font-size: 20px;
}

.group-type {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
  flex: 1;
}

.group-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  opacity: 0.7;
  background: color-mix(in srgb, var(--accent) 12%, white);
  padding: 2px 8px;
  border-radius: 10px;
}

/* Record rows */
.group-list {
  padding: 4px 0;
}

.record-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 10px;
  border-bottom: 1px solid #f6f6f6;
}

.record-row:last-child {
  border-bottom: none;
}

.row-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 56px;
}

.row-date {
  font-size: 11px;
  color: #aaa;
  font-weight: 500;
}

.row-time {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  font-variant-numeric: tabular-nums;
}

.row-note {
  flex: 1;
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.del-btn {
  border: none;
  background: none;
  color: #e74c3c;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.del-btn:active {
  background: #fee;
}

.empty {
  text-align: center;
  color: #aaa;
  padding: 60px 0;
  font-size: 14px;
}

@media (prefers-color-scheme: dark) {
  .page-title { color: #e0e0e0; }
  .group-card { background: #1e1e1e; box-shadow: 0 2px 12px rgba(0,0,0,0.2); }
  .group-header {
    background: color-mix(in srgb, var(--accent) 10%, #1e1e1e);
    border-color: color-mix(in srgb, var(--accent) 15%, #1e1e1e);
  }
  .group-count { background: color-mix(in srgb, var(--accent) 15%, #1e1e1e); }
  .row-time { color: #e0e0e0; }
  .record-row { border-color: #282828; }
}
</style>
