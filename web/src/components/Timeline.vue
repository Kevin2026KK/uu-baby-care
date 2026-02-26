<script setup lang="ts">
import { computed } from "vue";
import type { BabyCareRecord } from "../api/index.js";
import { formatDate } from "../utils/time.js";
import TimelineItem from "./TimelineItem.vue";

const props = defineProps<{
  records: BabyCareRecord[];
  loading: boolean;
  canDelete?: boolean;
}>();

const emit = defineEmits<{ delete: [id: string] }>();

interface DateGroup {
  label: string;
  records: BabyCareRecord[];
}

const grouped = computed<DateGroup[]>(() => {
  const groups: Map<string, BabyCareRecord[]> = new Map();
  for (const r of props.records) {
    const label = formatDate(r.time);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(r);
  }
  return Array.from(groups, ([label, records]) => ({ label, records }));
});
</script>

<template>
  <div class="timeline">
    <div v-if="loading && records.length === 0" class="timeline-empty">
      加载中...
    </div>

    <div v-else-if="records.length === 0" class="timeline-empty">
      还没有记录，点击上方按钮开始
    </div>

    <template v-else>
      <div v-for="group in grouped" :key="group.label" class="timeline-group">
        <div class="group-label">{{ group.label }}</div>
        <div class="group-items">
          <TimelineItem
            v-for="record in group.records"
            :key="record.record_id"
            :record="record"
            :can-delete="canDelete"
            @delete="emit('delete', $event)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.timeline {
  margin-top: 8px;
}

.timeline-empty {
  text-align: center;
  color: #aaa;
  padding: 32px 0;
  font-size: 14px;
}

.group-label {
  font-size: 13px;
  font-weight: 600;
  color: #999;
  margin-bottom: 8px;
  padding: 0 4px;
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

</style>
