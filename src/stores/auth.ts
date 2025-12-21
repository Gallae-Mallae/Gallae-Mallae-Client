import { defineStore } from "pinia";
import type { UserDTO } from "@/types/user";
import { useLikeStore } from "./like";

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

      // 좋아요 스토어 동기화
      const likeStore = useLikeStore();
      likeStore.fetchMyLikes();
    },

    logout() {
        this.user = null;
        this.isAuthenticated = false;

        // 좋아요 스토어 비우기
        const likeStore = useLikeStore();
        likeStore.clearLikes();
    }
  },
});
