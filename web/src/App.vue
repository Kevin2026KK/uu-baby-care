<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRecords } from "./composables/useRecords.js";
import { useAuth } from "./composables/useAuth.js";
import type { EventType } from "./api/index.js";
import LoginPage from "./components/LoginPage.vue";
import QuickActions from "./components/QuickActions.vue";
import FeedTimer from "./components/FeedTimer.vue";
import Timeline from "./components/Timeline.vue";
import RecordTable from "./components/RecordTable.vue";
import AddRecordSheet from "./components/AddRecordSheet.vue";

const { records, loading, fetchRecords, addRecord, removeRecord } = useRecords();
const { isLoggedIn, isEditor, logout } = useAuth();
const feedTimerRef = ref<InstanceType<typeof FeedTimer>>();

const page = ref<"home" | "table">("home");
const showAddSheet = ref(false);

// Fetch records when logged in
watch(isLoggedIn, (v) => { if (v) fetchRecords(); }, { immediate: true });

function onLogged() {
  feedTimerRef.value?.refresh();
}

function onDelete(id: string) {
  removeRecord(id);
  feedTimerRef.value?.refresh();
}

async function onAddConfirm(type: EventType, time: number, note: string) {
  showAddSheet.value = false;
  await addRecord(type, note, time);
  feedTimerRef.value?.refresh();
}
</script>

<template>
  <!-- Login page -->
  <LoginPage v-if="!isLoggedIn" />

  <!-- Main app -->
  <div v-else class="app">
    <!-- Home page -->
    <template v-if="page === 'home'">
      <header class="app-header">
        <h1 class="app-title">👶 UU记录本</h1>
        <button class="logout-btn" @click="logout">退出</button>
      </header>

      <main class="app-main">
        <FeedTimer ref="feedTimerRef" />

        <QuickActions v-if="isEditor" @logged="onLogged" />

        <div class="section-header">
          <span class="section-title">记录</span>
          <button class="link-btn" @click="page = 'table'">查看全部 →</button>
        </div>

        <Timeline
          :records="records"
          :loading="loading"
          :can-delete="isEditor"
          @delete="onDelete"
        />
      </main>

      <!-- Floating add button (editor only) -->
      <button v-if="isEditor" class="fab" @click="showAddSheet = true">+</button>
    </template>

    <!-- Table page -->
    <template v-else-if="page === 'table'">
      <RecordTable
        :records="records"
        :can-delete="isEditor"
        @back="page = 'home'"
        @delete="onDelete"
      />
    </template>

    <!-- Add record sheet -->
    <AddRecordSheet
      v-if="showAddSheet"
      @confirm="onAddConfirm"
      @close="showAddSheet = false"
    />
  </div>
</template>

<style scoped>
.app {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100dvh;
  padding: 0 16px env(safe-area-inset-bottom);
}

.app-header {
  padding: 16px 0 8px;
  text-align: center;
  position: relative;
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.logout-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  padding: 6px 0;
  -webkit-tap-highlight-color: transparent;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin-top: 4px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.link-btn {
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: #ff9f43;
  cursor: pointer;
  padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
}

.fab {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));
  right: 20px;
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: #ff9f43;
  color: white;
  font-size: 28px;
  font-weight: 300;
  line-height: 1;
  box-shadow: 0 4px 16px rgba(255, 159, 67, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  z-index: 50;
  transition: transform 0.15s ease;
}

.fab:active {
  transform: scale(0.9);
}

@media (prefers-color-scheme: dark) {
  .app-title { color: #f0f0f0; }
  .section-title { color: #e0e0e0; }
}
</style>
