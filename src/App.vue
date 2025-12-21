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

const authStore = useAuthStore();

// 앱이 브라우저에 처음 로드될 때 실행되는 생명주기 훅
onMounted(() => {
  // 사용자가 새로고침을 하거나 사이트에 재방문했을 때, 
  // 기존 로그인 세션(쿠키)이 살아있는지 확인하여 자동으로 로그인 상태를 복구함
  authStore.checkLogin();
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