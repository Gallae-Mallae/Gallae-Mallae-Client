<template>
  <div class="plan-page-container">
    <div v-if="planStore.isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <template v-else-if="planData">
      <TimelineHeader :plan-data="planData" :participants="planData.participants" />
      <main class="plan-content">
        <TimelineTable :schedules="planData.dailySchedules" />
      </main>
    </template>

  </div>
</template>

<script setup lang="ts">

import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import TimelineHeader from '@/components/plan/TimelineHeader.vue';
import TimelineTable from '@/components/plan/TimelineTable.vue';
import { usePlanStore } from '@/stores/plan';

const route = useRoute();
const planStore = usePlanStore();

const planData = computed(() => planStore.planData);

const initPlan = async () => {
  const planId = Number(route.params.id);
  if (planId) {
    await planStore.loadPlan(planId);
  }
};

onMounted(() => {
  initPlan();
});
</script>

<style scoped>
.plan-page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #fff;
}

.plan-content {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
  background-color: #f8f9fa;
}
</style>
