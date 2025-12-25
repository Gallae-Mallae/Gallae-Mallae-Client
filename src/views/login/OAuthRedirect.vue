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
    // 1. 이미 로그인된 상태에서 리다이렉트 페이지에 왔다면 로그아웃 복귀로 판단
    if (authStore.isAuthenticated) {
        authStore.clearLocalAuth();
        router.replace('/');
        return;
    }

    // 2. 로그인 처리 로직
    try {
        const user = await fetchUser();
        authStore.setUser(user);
        router.replace('/');
    } catch (e) {
        error.value = true;
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