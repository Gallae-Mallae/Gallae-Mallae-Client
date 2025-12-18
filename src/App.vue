<template>
  <div id="app-root">
    <Header></Header>

    <div class="content-wrapper">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { RouterView } from 'vue-router';
import Header from '@/components/Header.vue';
</script>

<style>
#app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden; /* 전체 화면 스크롤 방지 */
}

.content-wrapper {
  flex: 1; /* 남은 공간을 모두 차지함 */
  overflow: auto; /* 내용이 넘치면 스크롤 */
  display: flex; /* 자식 컴포넌트도 높이를 꽉 채울 수 있게 함 */
  flex-direction: column;
}
</style>