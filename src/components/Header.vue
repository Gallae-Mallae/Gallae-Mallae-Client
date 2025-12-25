<template>
  <header class="app-header">
    <div class="header-left">
      <nav>
        <router-link to="/search">{{ strings.NAV_SEARCH }}</router-link>
        <router-link to="/plan">{{ strings.NAV_PLAN }}</router-link>
      </nav>
    </div>

    <div class="header-center">
      <router-link to="/" class="logo-link">
        <img src="@/assets/icons/ms-icon-310x310.png" alt="Logo Icon" class="logo-icon" />
        <span class="logo">{{ strings.LOGO }}</span>
      </router-link>
    </div>

    <div class="header-right">
      <template v-if="!authStore.isCheckingAuth">
        <div v-if="authStore.isLoggedIn && authStore.user" class="user-actions">
          <button class="link-button" @click="openScrapModal">
            <img src="@/assets/icons/ic_scrap.png" alt="스크랩북" class="link-icon" />
          </button>

          <div class="user-menu-wrapper">
            <User :user="authStore.user" :show-name="false" @click.stop="handleProfileClick" />
            <UserDropdown v-if="isUserDropdownOpen" @edit-nickname="handleEditNickname" @logout="handleLogout" />
          </div>
        </div>

        <button v-else class="login-button" @click="openLoginModal">
          {{ strings.BUTTON_LOGIN }}
        </button>
      </template>
      <div v-else class="auth-loading-placeholder"></div>
    </div>
  </header>

  <LoginModal :is-visible="isLoginModalOpen" @close="closeLoginModal" />
  <ScrapModal :is-visible="isScrapModalOpen" @close="closeScrapModal" />
</template>

<script setup lang="ts">

import { ref, onMounted, onUnmounted } from 'vue';
import strings from '@/assets/values/strings.header.json';
import LoginModal from '@/views/login/LoginModal.vue';
import ScrapModal from '@/views/scrap/ScrapModal.vue';
import User from '@/components/User.vue';
import UserDropdown from '@/components/UserDropdown.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const isLoginModalOpen = ref(false);
const openLoginModal = () => isLoginModalOpen.value = true;
const closeLoginModal = () => isLoginModalOpen.value = false;

const isScrapModalOpen = ref(false);
const openScrapModal = () => isScrapModalOpen.value = true;
const closeScrapModal = () => isScrapModalOpen.value = false;

const isUserDropdownOpen = ref(false);

const handleProfileClick = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
};

const handleEditNickname = () => {
  isUserDropdownOpen.value = false;
};

const handleLogout = async () => {
  await authStore.handleLogout();
  isUserDropdownOpen.value = false;
};

const closeDropdown = () => {
  isUserDropdownOpen.value = false;
};

onMounted(() => {
  window.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-header-padding);
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-gray-light);
  width: 100%;
  box-shadow: var(--shadow-default);
}

.logo {
  font-size: var(--font-size-logo);
  font-weight: bold;
  color: var(--color-primary-dark);
  text-decoration: none;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 8px;
}

.logo-icon {
  width: 46px;
  height: 46px;
  object-fit: contain;
}

.header-center a {
  text-decoration: none;
}

.header-left nav {
  display: flex;
  gap: 24px;
}

.header-left nav a {
  color: var(--color-primary-dark);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.header-left nav a:hover {
  color: var(--color-primary-dark);
}

.header-right {
  display: flex;
  align-items: center;
  min-width: 100px;
  justify-content: flex-end;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: opacity 0.2s;
}

.link-button:hover {
  opacity: 0.85;
}

.link-icon {
  width: 25px;
  height: 25px;
}

.login-button {
  padding: 8px 16px;
  background-color: var(--color-primary-dark);
  color: var(--color-white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: var(--color-primary-dark);
}

.auth-loading-placeholder {
  width: 70px;
  height: 35px;
}

.user-menu-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

:deep(.user-container) {
  cursor: pointer;
}
</style>