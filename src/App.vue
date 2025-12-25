<template>
  <div id="app-root">
    <Header></Header>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang='ts'>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Header from '@/components/Header.vue';
import { useAuthStore } from '@/stores/auth';

import { fetchUser } from '@/api/auth';

const authStore = useAuthStore();

onMounted(async () => {
  // 앱 렌더링될 때, 딱 한 번 실행 (새로고침 포함)
  try {
    const user = await fetchUser();

    if (user) {
      authStore.setUser(user);
    }
  } catch (error) {
    console.log("로그인 정보 없음 또는 세션 만료");
    authStore.clearLocalAuth();
  } finally {
    authStore.setLoading(false);
  }

});
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
}

#app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.app-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
}
</style>