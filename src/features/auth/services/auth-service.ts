import { apiFetch } from "@/lib/api-client";
import type { LoginData } from "@/features/auth/schemas/login-schema";

export const authService = {
  login(data: LoginData) {
    return apiFetch<{ message?: string }>("/v1/user/login", {
      method: "POST",
      body: JSON.stringify(data),
      redirectOnUnauthorized: false,
    });
  },
  logout() {
    return apiFetch<{ message?: string }>("/v1/user/logout", {
      method: "POST",
    });
  },
};
