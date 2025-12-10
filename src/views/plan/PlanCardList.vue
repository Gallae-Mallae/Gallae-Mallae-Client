<template>
    <div class="plan-card-list-view">
        <div class="plan-header">
            <PlanSelector @update:type="handleTypeChange" :initial-type="currentPlanType" />
        </div>

        <div class="plan-list-grid">
            <PlanCard v-for="plan in filteredPlans" :key="plan.id" :plan="plan" @edit-plan="handleEditPlan" />
            <PlanCreateCard @create="handleCreatePlan" />
        </div>

        <PlanFormModal :is-visible="isModalVisible" :mode="modalMode" :initial-plan="editingPlan" @close="closeModal"
            @submit="handleSubmitPlan" />
    </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue';

import PlanSelector from '@/components/plan/PlanSelector.vue';
import type { PlanType } from '@/types/plan';

import PlanCard from '@/components/plan/PlanCard.vue';
import PlanCreateCard from '@/components/plan/PlanCreateCard.vue';
import type { PlanCardDTO } from '@/types/plan';

import PlanFormModal from '@/components/plan/PlanFormModal.vue';

import imageMock from '@/assets/images/example_plan.png';

const isModalVisible = ref(false);
const modalMode = ref<'CREATE' | 'EDIT'>('CREATE');
const editingPlan = ref<PlanCardDTO | undefined>(undefined);

// 현재 선택된 탭 (기본값: 전체 일정)
const currentPlanType = ref<PlanType>('ALL');

// 더미 데이터
const mockPlans = ref<PlanCardDTO[]>([
    { id: '1', title: '제주도 여행 2024', startDate: '2024-10-20', endDate: '2024-10-23', imageUrl: imageMock, isShared: true },
    { id: '2', title: '부산 주말 여행', startDate: '2024-11-15', endDate: '2024-11-17', imageUrl: imageMock, isShared: false },
    { id: '3', title: '강원도 캠핑', startDate: '2024-12-01', endDate: '2024-12-03', imageUrl: imageMock, isShared: true },
    // { id: '4', title: '전주 한옥마을', startDate: '2025-01-05', endDate: '2025-01-06', imageUrl: imageMock, isShared: false },
]);

// 탭 선택에 따른 필터링
const filteredPlans = computed(() => {
    if (currentPlanType.value === 'ALL') {
        return mockPlans.value;
    } else if (currentPlanType.value === 'PERSONAL') {
        return mockPlans.value.filter(p => !p.isShared);
    } else if (currentPlanType.value === 'SHARED') {
        return mockPlans.value.filter(p => p.isShared);
    }
    return [];
});

const handleTypeChange = (newType: PlanType) => {
    currentPlanType.value = newType;
    console.log(`일정 필터 변경: ${newType}`);
};

// 모달 열기
const openModal = (mode: 'CREATE' | 'EDIT') => {
    modalMode.value = mode;
    isModalVisible.value = true;
};

// 모달 닫기
const closeModal = () => {
    isModalVisible.value = false;
    editingPlan.value = undefined;
};

// 일정 생성 클릭
const handleCreatePlan = () => {
    editingPlan.value = undefined;
    openModal('CREATE');
};

// 일정 수정 클릭
const handleEditPlan = (planId: string) => {
    const planToEdit = mockPlans.value.find(p => p.id === planId);
    if (planToEdit) {
        editingPlan.value = planToEdit;
        openModal('EDIT');
    }
};

// 폼 제출
const handleSubmitPlan = (payload: any) => {
    if (modalMode.value === 'CREATE') {
        const newPlan = { ...payload, id: Date.now().toString(), imageUrl: imageMock, isShared: false };
        mockPlans.value.push(newPlan);
        console.log("새 일정 생성 완료:", newPlan);
    } else if (modalMode.value === 'EDIT' && payload.id) {
        const index = mockPlans.value.findIndex(p => p.id === payload.id);
        if (index !== -1) {
            mockPlans.value[index] = { ...mockPlans.value[index], ...payload };
            console.log("일정 수정 완료:", mockPlans.value[index]);
        }
    }

    closeModal();
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