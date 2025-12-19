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
import { RouterView } from 'vue-router';
import Header from '@/components/Header.vue';
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