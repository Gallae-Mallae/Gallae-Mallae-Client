<template>
  <div class="daily-column">
    <div class="grid-background">
      <div v-for="n in 32" :key="n" class="grid-cell"></div>
    </div>
    
    <div class="items-container">
      </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyScheduleDTO } from '@/types/plan';
defineProps<{ data: DailyScheduleDTO }>();
</script>

<style scoped>

.daily-column {
  position: relative;
  flex: 1;
  border-right: 1px solid #eee;
  min-width: 150px;
}

.grid-cell {
  height: 30px; /* 30분 단위 */
  border-bottom: 1px solid #f0f0f0;
}

.items-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

</style>