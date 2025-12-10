<template>
    <div class="oauth-redirect-container">
        <p v-if="isLoading">사용자 정보를 확인하고 있습니다.</p>
        <p v-else-if="error">로그인 인증에 실패했습니다. 메인 페이지로 돌아갑니다.</p>
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
const error = ref(false)

onMounted(async () => {
    try {
        // 토큰 쿠키를 사용해 사용자 정보 조회
        const user = await fetchUser();
        // 인증 성공 시, Store에 사용자 정보 저장
        authStore.setUser(user);
        router.replace('/test-user');

    } catch (e) {
        error.value = true;
        console.error("인증 검증 실패:", e);

        setTimeout(() => {
            router.replace('/');
        }, 2000);

    } finally {
        isLoading.value = false;
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
    font-family: Arial, sans-serif;
    background-color: #f8f8f8;
}

p {
    color: #555;
}
</style>