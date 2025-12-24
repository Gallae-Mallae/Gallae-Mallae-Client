<template>
  <div class="home-background" :style="{ backgroundImage: `url(${homeImg})` }"></div>
</template>

<script setup lang="ts">
import homeImg from '@/assets/images/home.png';
</script>

<style scoped>
.home-background {
  width: 100%;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #f0f0f0;
}
</style>