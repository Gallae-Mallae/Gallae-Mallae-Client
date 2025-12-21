import { defineStore } from "pinia";
import type { UserDTO } from "@/types/user";
import { useLikeStore } from "./like";
import { fetchUser } from "@/api/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: UserDTO | null;
  loading: boolean; // 앱 초기 로딩 시 로그인 체크 중인지 확인하는 플래그
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    loading: true, // 초기값은 true로 설정하여 체크 전까지는 로딩 상태로 간주
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    isLoading: (state) => state.loading,
  },

  actions: {
    // 로그인 성공 시 사용자 정보를 저장하고 필요한 데이터를 로드하는 함수
    setUser(userData: UserDTO) {
      this.user = userData;
      this.isAuthenticated = true;

      // 사용자가 로그인되면 해당 사용자의 좋아요 목록도 자동으로 가져옴
      const likeStore = useLikeStore();
      likeStore.fetchMyLikes();
    },

    // 새로고침 시 세션을 복구하는 핵심 로직
    async checkLogin() {
        this.loading = true;
        try {
            const user = await fetchUser();
            if (user) {
                this.setUser(user);
                console.log("[AuthStore] 로그인 세션 복구 완료:", user.name);
            }
        } catch (error) {
            console.log("[AuthStore] 유효한 세션이 없거나 만료되었습니다.");
            this.logout();
        } finally {
            this.loading = false;
        }
    },

    // 로그아웃 시 스토어의 모든 인증 상태를 초기화
    logout() {
        this.user = null;
        this.isAuthenticated = false;

        // 로그아웃 시 좋아요 목록도 메모리에서 삭제
        const likeStore = useLikeStore();
        likeStore.clearLikes();
    }
  },
});