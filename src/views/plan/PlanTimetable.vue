<template>
  <div class="plan-page-container">
    <div v-if="planStore.isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <template v-else-if="planData">
      <TimelineHeader :plan-data="planData" :participants="planData.participants" />

      <main class="plan-content">
        <div class="timeline-table-container">
          <div class="timeline-scroll-area">
            <div class="timeline-grid">
              <TimelineTime />

              <div class="day-columns">
                <TimelineDaily v-for="day in planData.dailySchedules" :key="day.dayNumber" :data="day" />
              </div>
            </div>
          </div>
        </div>
      </main>

    </template>

  </div>
</template>

<script setup lang="ts">

import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import TimelineHeader from '@/components/plan/TimelineHeader.vue';
import TimelineTime from '@/components/plan/TimelineTime.vue';
import TimelineDaily from '@/components/plan/TimelineDaily.vue';
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

.timeline-table-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  user-select: none;
}

.timeline-grid {
  display: flex;
}

.day-columns {
  display: flex;
  flex: 1;
  overflow-x: auto;
}

.day-columns>* {
  flex: 1;
  min-width: 150px;
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
