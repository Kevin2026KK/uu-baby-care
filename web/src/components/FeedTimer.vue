<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { api } from "../api/index.js";
import { relativeTime } from "../utils/time.js";

const lastFeedTime = ref<number | null>(null);
const minutesSince = ref(0);
const nextFeedIn = ref(0);
const loading = ref(true);

let timer: ReturnType<typeof setInterval>;

const statusColor = computed(() => {
  if (minutesSince.value < 120) return "#27ae60";
  if (minutesSince.value < 180) return "#f39c12";
  return "#e74c3c";
});

const statusText = computed(() => {
  if (lastFeedTime.value === null) return "暂无喂奶记录";
  if (nextFeedIn.value > 0) {
    const h = Math.floor(nextFeedIn.value / 60);
    const m = nextFeedIn.value % 60;
    return h > 0 ? `距下次喂奶约 ${h}小时${m}分钟` : `距下次喂奶约 ${m}分钟`;
  }
  const overdue = Math.abs(nextFeedIn.value);
  return `已超时 ${overdue}分钟`;
});

async function refresh(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await api.getLatestFeed();
      if (res.record) {
        lastFeedTime.value = res.record.time;
        minutesSince.value = res.minutesSince;
        nextFeedIn.value = res.nextFeedIn;
      }
      loading.value = false;
      return;
    } catch (err) {
      console.error(`Feed timer attempt ${i + 1} failed:`, err);
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  loading.value = false;
}

onMounted(() => {
  refresh();
  timer = setInterval(refresh, 60000);
});

onUnmounted(() => {
  clearInterval(timer);
});

defineExpose({ refresh });
</script>

<template>
  <div class="feed-timer" v-if="!loading">
    <div class="timer-row" v-if="lastFeedTime !== null">
      <span class="timer-dot" :style="{ background: statusColor }"></span>
      <span class="timer-label">上次喂奶</span>
      <span class="timer-value">{{ relativeTime(lastFeedTime) }}</span>
    </div>
    <div class="timer-status" :style="{ color: statusColor }">
      {{ statusText }}
    </div>
  </div>
  <div class="feed-timer feed-timer--loading" v-else>
    <span class="timer-label">加载中...</span>
  </div>
</template>

<style scoped>
.feed-timer {
  background: white;
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.feed-timer--loading {
  text-align: center;
  color: #999;
}

.timer-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.timer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timer-label {
  font-size: 14px;
  color: #888;
}

.timer-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-left: auto;
}

.timer-status {
  font-size: 13px;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .feed-timer {
    background: #1e1e1e;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }
  .timer-value {
    color: #e0e0e0;
  }
}
</style>
