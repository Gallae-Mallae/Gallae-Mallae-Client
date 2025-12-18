<template>
  <div class="plan-page-container">
    <TimelineHeader 
      v-if="planData"
      :plan-data="planData" 
      :participants="participants" 
    />

    <main class="plan-content">
      <TimelineTable 
        v-if="planData"
        :schedules="planData.dailySchedules" 
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TimelineHeader from '@/components/plan/TimelineHeader.vue';
import TimelineTable from '@/components/plan/TimelineTable.vue';
import type { PlanDTO, PlanMemberDTO } from '@/types/plan';

const planData = ref<PlanDTO | null>(null);
const participants = ref<PlanMemberDTO[]>([]);

onMounted(() => {
  planData.value = {
    id: 'plan-test-01',
    title: '제주도 여행 2024',
    startDate: '2024-10-20',
    endDate: '2024-10-23',
    imageUrl: '',
    isShared: true,
    ownerId: 'u1',
    participantIds: ['u1', 'u2', 'u3', 'u4'],
    dailySchedules: [
      {
        dayNumber: 1,
        date: '2024-10-20',
        items: [
          { id: 'i1', type: 'Place', startTime: 570, durationTime: 120, itemId: 'p1' },
          { id: 'i2', type: 'Place', startTime: 720, durationTime: 90, itemId: 'p2' },
        ]
      },
      {
        dayNumber: 2,
        date: '2024-10-21',
        items: [
          { id: 'i3', type: 'Place', startTime: 600, durationTime: 60, itemId: 'p3' },
          { id: 'i4', type: 'Memo', startTime: 690, durationTime: 60, itemId: 'm1' },
        ]
      },
      { dayNumber: 3, date: '2024-10-22', items: [] },
      { dayNumber: 4, date: '2024-10-23', items: [] },
    ]
  };

  participants.value = [
    { id: 'm1', userId: 'u1', planId: 'p1', name: '김민수', nickname: '민수', profileImageUrl: 'https://i.pravatar.cc/150?img=60' },
    { id: 'm2', userId: 'u2', planId: 'p1', name: '이지은', nickname: null, profileImageUrl: 'https://i.pravatar.cc/150?img=49' },
    { id: 'm3', userId: 'u3', planId: 'p1', name: '박서준', nickname: '서준', profileImageUrl: 'https://i.pravatar.cc/150?img=53' },
    { id: 'm4', userId: 'u4', planId: 'p1', name: '최유진', nickname: '유진', profileImageUrl: 'https://i.pravatar.cc/150?img=54' },
  ];
});
</script>

<style scoped>
.plan-page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #fff;
}

.plan-content {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
  background-color: #f8f9fa;
}
</style>