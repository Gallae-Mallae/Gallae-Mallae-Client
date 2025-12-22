import { defineStore } from "pinia";
import type { UserDTO } from "@/types/user";

interface AuthState {
  isAuthenticated: boolean;
  user: UserDTO | null;
  isInitialLoading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    isInitialLoading: true,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    isCheckingAuth: (state) => state.isInitialLoading,
  },

  actions: {
    setUser(userData: UserDTO) {
      this.user = userData;
      this.isAuthenticated = true;
      this.isInitialLoading = false;
    },

    setLoading(value: boolean) {
      this.isInitialLoading = value;
    },

    logout() {
      this.user = null;
      this.isAuthenticated = false;
      this.isInitialLoading = false;
    },
  },
});
