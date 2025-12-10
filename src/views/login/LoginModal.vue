<template>
    <BaseModal :is-visible="isModalOpen" @close="closeLoginModal" width="430px">
        <div class="login-popup-content">
            <h2 class="popup-title">{{ strings.LOGIN_TITLE }}</h2>
            <p class="login-text">{{ strings.LOGIN_DESCRIPTION }}</p>

            <button class="kakao-login-button" @click="handleKakaoLogin">
                <img src="@/assets/images/button_kakao_login.png" alt="카카오 로그인" class="kakao-login-image" />
            </button>

            <p class="terms-text">
                {{ strings.LOGIN_DESCRIPTION2 }}
            </p>
        </div>
    </BaseModal>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import strings from "@/assets/values/strings.login.json";
import BaseModal from '@/components/BaseModal.vue';

const isModalOpen = ref(true);

const closeLoginModal = () => {
    isModalOpen.value = false;
};

// 로그인 페이지로 이동
const BACKEND_DOMAIN = 'https://api.gallaemallae.site';
const REDIRECT_PATH = '/oauth2/redirect';

const handleKakaoLogin = () => {
    const currentDomain = window.location.origin;
    const encodedRedirectUri = encodeURIComponent(`${currentDomain}${REDIRECT_PATH}`);

    const KAKAO_AUTH_URI = `${BACKEND_DOMAIN}/oauth2/authorization/kakao?redirect_uri=${encodedRedirectUri}`;

    window.location.href = KAKAO_AUTH_URI;
}

</script>

<style scoped>
.popup-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
}

.login-text {
    text-align: center;
    margin-bottom: 18px;
    color: #555;
}

.terms-text {
    text-align: center;
    font-size: 0.85rem;
    color: #777;
    line-height: 1.4;
}

.kakao-login-button {
    width: 100%;
    height: 52px;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    transition: background-color 0.2s, filter 0.2s;
}

.kakao-login-button:hover {
    filter: brightness(0.95);
}
</style>