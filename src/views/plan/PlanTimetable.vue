<template>
  <div class="plan-page-container">
    <TimelineHeader v-if="planData" :plan-data="planData" :participants="planData.participants" />

    <main class="plan-content">
      <TimelineTable v-if="planData" :schedules="planData.dailySchedules" />
    </main>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import TimelineHeader from '@/components/plan/TimelineHeader.vue';
import TimelineTable from '@/components/plan/TimelineTable.vue';
import { usePlanStore } from '@/stores/plan';
import { fetchPlanById } from '@/api/plan';

const route = useRoute();
const planStore = usePlanStore();

const planData = computed(() => planStore.planData);

onMounted(async () => {
  const planId = Number(route.params.id); //
  if (!planId) return;

  try {
    // API 연결 시점에는 이 주석을 해제하면 됩니다.
    // const data = await fetchPlanById(planId);
    // planStore.setPlanData(data);
  } catch (error) {
    console.error("일정 로드 실패:", error);
  }
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