<template>
    <div class="plan-card-list-view">
        <div class="plan-header">
            <PlanSelector @update:type="handleTypeChange" :initial-type="currentPlanType" />
        </div>

        <div class="plan-list-grid">
            <PlanCard v-for="plan in filteredPlans" :key="plan.id" :plan="plan" @edit-plan="handleEditPlan"
                @click="goToDetail(plan.id)" />
            <PlanCreateCard @create="handleCreatePlan" />
        </div>

        <PlanFormModal :is-visible="isModalVisible" :mode="modalMode" :initial-plan="editingPlan" @close="closeModal"
            @submit="handleSubmitPlan" />
    </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 컴포넌트 및 타입 임포트
import PlanSelector from '@/components/plan/PlanSelector.vue';
import PlanCard from '@/components/plan/PlanCard.vue';
import PlanCreateCard from '@/components/plan/PlanCreateCard.vue';
import PlanFormModal from '@/components/plan/PlanFormModal.vue';
import type { PlanType, PlanDTO, PlanCardDTO } from '@/types/plan';

// API 임포트
import { createPlan, fetchPlans } from '@/api/plan';
import type { CreatePlanRequest } from '@/api/plan';

const router = useRouter();

const plans = ref<PlanDTO[]>([]);
const isLoading = ref(false);
const isModalVisible = ref(false);
const modalMode = ref<'CREATE' | 'EDIT'>('CREATE');
const editingPlan = ref<PlanCardDTO | undefined>(undefined);

// 현재 선택된 탭 (기본값: 전체 일정)
const currentPlanType = ref<PlanType>('ALL');

const loadPlans = async () => {
    isLoading.value = true;
    try {
        const data = await fetchPlans();
        plans.value = data;
        console.log("일정 목록 로드 성공:", data);
    } catch (error) {
        console.error("일정 목록 로드 실패:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadPlans();
});

// 탭 선택에 따른 필터링
const filteredPlans = computed(() => {
    if (currentPlanType.value === 'ALL') {
        return plans.value;
    } else if (currentPlanType.value === 'PERSONAL') {
        // 참여자가 1명 이하이면 개인 일정으로 간주
        return plans.value.filter(p => p.participantIds?.length <= 1);
    } else if (currentPlanType.value === 'SHARED') {
        // 참여자가 2명 이상이면 공유 일정으로 간주
        return plans.value.filter(p => p.participantIds?.length > 1);
    }
    return [];
});

// 이벤트 핸들러
const goToDetail = (planId: string) => {
    router.push({
        name: 'PlanDetail',
        params: { id: planId }
    });
};

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
    const planToEdit = plans.value.find(p => p.id === planId);
    if (planToEdit) {
        editingPlan.value = planToEdit;
        openModal('EDIT');
    }
};

// 폼 제출
const handleSubmitPlan = async (payload: any) => {
    if (modalMode.value === 'CREATE') {
        try {
            const requestData: CreatePlanRequest = {
                title: payload.title,
                startDate: payload.startDate,
                endDate: payload.endDate,
            };

            const response = await createPlan(requestData);

            closeModal();

            // 생성 성공 후 바로 상세 페이지로 이동
            router.push({
                name: 'PlanDetail',
                params: { id: response.planId.toString() }
            });

        } catch (error) {
            console.error("일정 생성 중 오류 발생:", error);
        }
    } else if (modalMode.value === 'EDIT' && payload.id) {
        // TODO: 수정 API 연결

        closeModal();
    }
};
</script>

<style scoped>
.plan-card-list-view {
    padding: 40px;
    background-color: #f7f7f7;
    height: 100%;
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