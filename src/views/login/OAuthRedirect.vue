<template>
    <div class="oauth-redirect-container">
        <div v-if="isLoading" class="loading-overlay">
            <!-- <p>인증 처리 중</p> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchUser } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(true);
const error = ref(false);

onMounted(async () => {
    try {
        // 1. 서버에 유저 정보를 요청 (세션/쿠키 확인)
        const user = await fetchUser();

        if (user) {
            // 2. 유저 정보가 있으면 스토어에 저장 (로그인 성공)
            authStore.setUser(user);
            console.log("로그인 성공:", user.name);
        } else {
            // 유저 정보가 없으면 로컬 데이터 청소
            authStore.clearLocalAuth();
        }
    } catch (e) {
        console.error("인증 처리 중 오류:", e);
        authStore.clearLocalAuth(); // 에러 시에도 안전하게 비우기
        error.value = true;
    } finally {
        isLoading.value = false;
        // 3. 성공하든 실패하든 결국 메인으로 보냄
        router.replace('/');
    }
});
</script>

<style scoped>
.oauth-redirect-container {
    width: 100%;
    height: 100vh;
    background-image: url('@/assets/images/home.png');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-overlay {
    background: rgba(255, 255, 255, 0.7);
    padding: 20px 40px;
    border-radius: 8px;
}

/* p {
    color: #555;
} */
</style>