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
/* 전역 레이아웃 스타일 제거됨 */
</style>