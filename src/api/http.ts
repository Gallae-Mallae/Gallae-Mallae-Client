import axios from "axios";
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import router from "@/router";
import { reissueAccessToken } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

const BACKEND_DOMAIN = "https://api.gallaemallae.site";

// Axios 에러 타입 확장 (재시도 플래그 추가)
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BACKEND_DOMAIN + "/api",
  timeout: 10000,
  // HttpOnly 쿠키 사용을 위한 필수 설정
  withCredentials: true,
});

// 응답 인터셉터: 401 에러 처리 로직
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const authStore = useAuthStore();

    // 401 에러가 발생했고, 재시도한 적이 없는 요청인 경우
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/reissue")
    ) {
      originalRequest._retry = true; // 무한 루프 방지

      try {
        console.log("토큰 만료: 재발급 시도");
        await reissueAccessToken(); // /auth/reissue 호출
        return axiosInstance(originalRequest);
      } catch (reissueError) {
        console.error("세션 만료: 재로그인 필요");
        authStore.logout();
        router.push("/");
        return Promise.reject(reissueError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
