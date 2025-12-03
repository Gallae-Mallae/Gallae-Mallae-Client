<template>
  <header class="app-header">
    <div class="header-left">
      <nav>
        <router-link to="/search">{{ strings.NAV_SEARCH }}</router-link>
        <router-link to="/plan">{{ strings.NAV_PLAN }}</router-link>
      </nav>
    </div>

    <div class="header-center">
      <router-link to="/">
        <span class="logo">{{ strings.LOGO }}</span>
      </router-link>
    </div>

    <div class="header-right">
      <button class="login-button">{{ strings.BUTTON_LOGIN }}</button>
    </div>

  </header>
</template>

<script setup lang="ts">

import strings from '@/assets/values/strings.header.json';

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
</style>