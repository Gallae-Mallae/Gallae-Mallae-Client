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

<style></style>