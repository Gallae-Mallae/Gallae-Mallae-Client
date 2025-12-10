<template>
    <div class="plan-card-list-view">
        <div class="plan-header">
            <PlanSelector @update:type="handleTypeChange" :initial-type="currentPlanType" />
        </div>

        <div class="plan-list-grid">
            <PlanCard v-for="plan in filteredPlans" :key="plan.id" :plan="plan" @edit-plan="handleEditPlan"/>
            <PlanCreateCard @create="handleCreatePlan" />
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue';

import PlanSelector from '@/components/plan/PlanSelector.vue';
import type { PlanType } from '@/types/plan';

import PlanCard from '@/components/plan/PlanCard.vue';
import PlanCreateCard from '@/components/plan/PlanCreateCard.vue';
import type { PlanCardDTO } from '@/types/plan';

import imageMock from '@/assets/images/example_plan.png';

// 현재 선택된 탭 (기본값: 전체 일정)
const currentPlanType = ref<PlanType>('ALL');

// 더미 데이터
const mockPlans: PlanCardDTO[] = [
    { id: '1', title: '제주도 여행 2024', startDate: '2024-10-20', endDate: '2024-10-23', imageUrl: imageMock, isShared: true },
    { id: '2', title: '부산 주말 여행', startDate: '2024-11-15', endDate: '2024-11-17', imageUrl: imageMock, isShared: false },
    { id: '3', title: '강원도 캠핑', startDate: '2024-12-01', endDate: '2024-12-03', imageUrl: imageMock, isShared: true },
    // { id: '4', title: '전주 한옥마을', startDate: '2025-01-05', endDate: '2025-01-06', imageUrl: imageMock, isShared: false },
];

// 탭 선택에 따른 필터링
const filteredPlans = computed(() => {
    if (currentPlanType.value === 'ALL') {
        return mockPlans;
    } else if (currentPlanType.value === 'PERSONAL') {
        return mockPlans.filter(p => !p.isShared);
    } else if (currentPlanType.value === 'SHARED') {
        return mockPlans.filter(p => p.isShared);
    }
    return [];
});

const handleTypeChange = (newType: PlanType) => {
    currentPlanType.value = newType;
    console.log(`일정 필터 변경: ${newType}`);
};

const handleEditPlan = (planId: string) => {
    console.log(`일정 수정: ${planId}`);
};

const handleCreatePlan = () => {
    console.log("새 일정 생성");
};
</script>

<style scoped>
.plan-card-list-view {
    padding: 50px;
    background-color: #f7f7f7;
    min-height: 100vh;
}

.plan-header {
    margin-bottom: 30px;
    max-width: 1200px;
    margin: 0 auto 30px auto;
}

.plan-list-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    max-width: 1200px;
    margin: 0 auto;
}
</style>