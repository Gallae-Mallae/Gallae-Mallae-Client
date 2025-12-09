// views/login/OAuthRedirect.vue

<template>
    <div class="oauth-redirect-container">
        <h2>로그인 처리 중...</h2>
        <p>잠시만 기다려 주세요. 사용자 정보를 확인하고 있습니다.</p>
        </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchUserMe } from '@/api'; // api/index.ts 또는 api/auth.ts에서 가져옴
// import { useUserStore } from '@/stores/userStore'; // Pinia/Vuex 스토어 사용 가정

const router = useRouter();
// const userStore = useUserStore(); // 스토어 사용 가정

onMounted(async () => {
    // 💡 이 시점에는 백엔드로부터 HttpOnly JWT 쿠키가 브라우저에 이미 저장되어 있습니다.
    
    try {
        // [할 일 2] JWT를 사용하여 사용자 정보 획득 및 상태 저장
        const user = await fetchUserMe(); // GET /api/v1/user/me 호출
        
        // 1. 사용자 정보를 전역 상태에 저장
        // userStore.setUser(user); 
        console.log("로그인 및 유저 정보 획득 성공:", user);

        // 2. 로그인 플로우 완료 후 메인 페이지 또는 계획 페이지로 이동
        router.push('/plan'); 

    } catch (error) {
        console.error("로그인 후 유저 정보 획득 실패 (401 에러 등):", error);
        
        // 3. 에러 발생 시 로그인 실패 처리 및 로그인 페이지로 리다이렉트
        // (401 에러는 api/http.ts 인터셉터에서 처리될 수 있지만, 최종 실패 시 처리)
        alert('로그인 처리 중 오류가 발생했습니다.');
        router.push('/'); // 로그인 버튼이 있는 홈으로 이동하여 재시도 유도
    }
});
</script>

<style scoped>
.oauth-redirect-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
}
</style>