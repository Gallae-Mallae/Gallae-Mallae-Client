import { defineStore } from "pinia";
import type { UserDTO } from "@/types/user";

interface AuthState {
  isAuthenticated: boolean;
  user: UserDTO | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
  },

  actions: {
    setUser(userData: UserDTO) {
      this.user = userData;
      this.isAuthenticated = true;
    },

    logout() {
        this.user = null;
        this.isAuthenticated = false;
    }
  },
});
