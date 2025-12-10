<template>
    <div class="test-view-container">
        <h2>로그인 인증 결과</h2>

        <div v-if="authStore.isLoggedIn">
            <p class="success-message">인증 성공</p>

            <h3>사용자 정보 (UserDTO)</h3>
            <div class="user-info-box">
                <pre>{{ authStore.currentUser }}</pre>
            </div>
        </div>

        <div v-else>
            <p class="error-message">인증 실패</p>
        </div>
    </div>
</template>

<script setup lang="ts">

import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

</script>

<style scoped>
    
.test-view-container {
    max-width: 600px;
    margin: 50px auto;
    padding: 30px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    text-align: center;
    background-color: #ffffff;
}

h2 {
    color: var(--color-primary-dark, #3f51b5);
    margin-bottom: 25px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
}

.success-message {
    color: #4CAF50;
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 15px;
}

.error-message {
    color: #F44336;
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 15px;
}

h3 {
    margin-top: 30px;
    margin-bottom: 10px;
    color: #333;
}

.user-info-box {
    background-color: #f7f7f7;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #ddd;
    overflow-x: auto;
    margin-bottom: 20px;
    text-align: left;
}

.user-info-box pre {
    margin: 0; 
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: monospace;
    font-size: 0.9rem;
}

</style>