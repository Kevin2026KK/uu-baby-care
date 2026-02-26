import { ref, computed } from "vue";

export type Role = "editor" | "viewer";

const AUTH_KEY = "uu_auth";

interface AuthState {
  code: string;
  role: Role;
}

function loadAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const authState = ref<AuthState | null>(loadAuth());

export function useAuth() {
  const role = computed(() => authState.value?.role ?? null);
  const isEditor = computed(() => role.value === "editor");
  const isLoggedIn = computed(() => authState.value !== null);
  const accessCode = computed(() => authState.value?.code ?? "");

  async function login(code: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "登录失败" };
      }

      authState.value = { code, role: data.role };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authState.value));
      return { ok: true };
    } catch {
      return { ok: false, error: "网络错误" };
    }
  }

  function logout() {
    authState.value = null;
    localStorage.removeItem(AUTH_KEY);
  }

  return { role, isEditor, isLoggedIn, accessCode, login, logout };
}
