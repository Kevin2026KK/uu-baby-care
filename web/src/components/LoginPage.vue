<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../composables/useAuth.js";

const { login } = useAuth();

const code = ref("");
const error = ref("");
const loading = ref(false);

async function onSubmit() {
  if (!code.value.trim()) {
    error.value = "请输入邀请码";
    return;
  }

  loading.value = true;
  error.value = "";

  const result = await login(code.value.trim());

  loading.value = false;

  if (!result.ok) {
    error.value = result.error || "登录失败";
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-emoji">👶</div>
      <h1 class="login-title">UU记录本</h1>
      <p class="login-subtitle">输入邀请码进入</p>

      <form @submit.prevent="onSubmit" class="login-form">
        <input
          v-model="code"
          type="text"
          class="login-input"
          placeholder="请输入邀请码"
          autocomplete="off"
          autofocus
        />
        <div v-if="error" class="login-error">{{ error }}</div>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '验证中...' : '进入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 320px;
  text-align: center;
}

.login-emoji {
  font-size: 56px;
  margin-bottom: 8px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 6px;
}

.login-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0 0 28px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-input {
  height: 50px;
  border: 2px solid #eee;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 16px;
  color: #333;
  background: #fafafa;
  outline: none;
  font-family: inherit;
  text-align: center;
  letter-spacing: 2px;
  -webkit-appearance: none;
}

.login-input:focus {
  border-color: #ff9f43;
  background: white;
}

.login-error {
  font-size: 13px;
  color: #e74c3c;
  font-weight: 500;
}

.login-btn {
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

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .login-title { color: #e0e0e0; }
  .login-input { background: #282828; border-color: #333; color: #e0e0e0; }
}
</style>
