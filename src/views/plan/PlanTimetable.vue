<template>
  <div class="plan-page-container">
    <div v-if="planStore.isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <template v-else-if="planData">
      <TimelineHeader 
        :plan-data="planData" 
        :participants="planData.participants" 
        @view-map="handleMapView"
      />

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
import { useRoute, useRouter } from 'vue-router';
import TimelineHeader from '@/components/plan/TimelineHeader.vue';
import TimelineTime from '@/components/plan/TimelineTime.vue';
import TimelineDaily from '@/components/plan/TimelineDaily.vue';
import { usePlanStore } from '@/stores/plan';

const route = useRoute();
const router = useRouter();
const planStore = usePlanStore();

const planData = computed(() => planStore.planData);

const handleMapView = () => {
  if (!planData.value) return;

  const mapItems: any[] = [];
  const addedIds = new Set<string>();

  planData.value.dailySchedules.forEach(day => {
    day.items.forEach(item => {
      if (item.attraction) {
        const placeId = String(item.attraction.id || (item.attraction as any).attractionId);
        
        // 중복 방지 (선택 사항, 마커가 겹치지 않게 하려면 필요)
        if (!addedIds.has(placeId)) {
            addedIds.add(placeId);
            mapItems.push({
                attrId: Number(placeId),
                latitude: Number(item.attraction.latitude),
                longitude: Number(item.attraction.longitude),
                title: item.attraction.title,
                count: 1 // 클러스터링 로직 호환용
            });
        }
      }
    });
  });

  if (mapItems.length === 0) {
    alert("지도에 표시할 장소가 없습니다.");
    return;
  }

  // 세션 스토리지에 저장 후 검색 페이지로 이동
  sessionStorage.setItem('PLAN_MAP_ITEMS', JSON.stringify(mapItems));
  router.push({ name: 'SearchPlace', query: { mode: 'plan_view' } });
};

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
