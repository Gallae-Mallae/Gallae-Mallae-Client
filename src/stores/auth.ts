import { defineStore } from "pinia";
import type { UserDTO } from "@/types/user";
import { useLikeStore } from "./like";
import { fetchUser } from "@/api/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: UserDTO | null;
  // test2의 명확한 네이밍 채택
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
    // test2의 게터 이름 사용
    isCheckingAuth: (state) => state.isInitialLoading, 
  },

  actions: {
    // 로그인 성공 시 사용자 정보를 저장
    setUser(userData: UserDTO) {
      this.user = userData;
      this.isAuthenticated = true;
      this.isInitialLoading = false;

      // [feature/#16 기능 살림] 로그인 성공 시 내 좋아요 목록 가져오기
      const likeStore = useLikeStore();
      likeStore.fetchMyLikes();
    },

    // [test2 기능 살림] 로딩 상태 강제 조절
    setLoading(value: boolean) {
      this.isInitialLoading = value;
    },

    // [feature/#16 기능 살림] 새로고침 시 세션 복구 로직
    // 변수명은 test2의 isInitialLoading으로 변경하여 통합
    async checkLogin() {
        this.isInitialLoading = true;
        try {
            const user = await fetchUser();
            if (user) {
                // setUser를 호출하면 좋아요 목록까지 자동으로 불러옵니다
                this.setUser(user);
                console.log("[AuthStore] 로그인 세션 복구 완료:", user.name);
            }
        } catch (error) {
            console.log("[AuthStore] 유효한 세션이 없거나 만료되었습니다.");
            this.logout();
        } finally {
            this.isInitialLoading = false;
        }
    },

    // 로그아웃
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      this.isInitialLoading = false;

      // [feature/#16 기능 살림] 로그아웃 시 좋아요 목록 메모리 초기화
      const likeStore = useLikeStore();
      likeStore.clearLikes();
    },
  },
});