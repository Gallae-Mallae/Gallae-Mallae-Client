import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import router from '@/router'; 

const BACKEND_DOMAIN = 'http://localhost:8080'; //

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BACKEND_DOMAIN + '/api',
    timeout: 10000,
    // HttpOnly 쿠키 사용을 위한 필수 설정
    withCredentials: true, 
});

// 응답 인터셉터: 401 에러 처리 로직
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            console.error('인증 실패 (401): 토큰 만료 또는 유효하지 않음');
            
            // 토큰 재발급을 시도 또는 로그인 페이지로 강제 이동
            // 일단 시작 페이지로 이동하게 처리
            router.push('/'); 
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;