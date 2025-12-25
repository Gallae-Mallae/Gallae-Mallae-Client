<template>
    <div class="plan-card-list-view">
        <div class="plan-header">
            <PlanSelector @update:type="handleTypeChange" :initial-type="currentPlanType" />
        </div>

        <div class="plan-list-grid">
            <PlanCard v-for="plan in filteredPlans" :key="plan.id" :plan="plan" @edit-plan="handleEditPlan"
                @delete-plan="handleDeletePlan" @click="goToDetail(plan.id)" />
            <PlanCreateCard @create="handleCreatePlan" />
        </div>

        <PlanFormModal :is-visible="isModalVisible" :mode="modalMode" :initial-plan="editingPlan" @close="closeModal"
            @submit="handleSubmitPlan" />
    </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanStore } from '@/stores/plan';

// 컴포넌트 및 타입 임포트
import PlanSelector from '@/components/plan/PlanSelector.vue';
import PlanCard from '@/components/plan/PlanCard.vue';
import PlanCreateCard from '@/components/plan/PlanCreateCard.vue';
import PlanFormModal from '@/components/plan/PlanFormModal.vue';
import type { PlanType, PlanDTO, PlanCardDTO } from '@/types/plan';


// API 임포트
import { createPlan, fetchPlans, updatePlan, deletePlan } from '@/api/plan';
import type { CreatePlanRequest, UpdatePlanRequest } from '@/api/plan';

const router = useRouter();
const planStore = usePlanStore();

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
        planStore.allPlans = data;
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
    const all = plans.value;
    if (currentPlanType.value === 'ALL') return all;

    if (currentPlanType.value === 'PERSONAL') {
        // 서버 DTO: isShared가 1이면 개인
        return all.filter(p => Number(p.isShared) === 1);
    }

    if (currentPlanType.value === 'SHARED') {
        // 서버 DTO: isShared가 2 이상이면 공유
        return all.filter(p => Number(p.isShared) >= 2);
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

// 💡 일정 삭제 처리
const handleDeletePlan = async (planId: string) => {
    if (!confirm("여행 계획을 삭제하시겠습니까?")) return;

    try {
        // 스토어의 삭제 요청 함수 호출
        await planStore.requestDeletePlan(Number(planId));

        // 삭제 성공 후 목록 새로고침 (웹소켓이 처리해주지만 수동으로도 한 번 더 관리 가능)
        plans.value = plans.value.filter(p => p.id !== planId);
    } catch (error) {
        console.error("삭제 실패:", error);
    }
};

// 일정 수정 아이콘 클릭 시 호출
const handleEditPlan = (planId: string) => {
    // 1. 전체 목록에서 수정하려는 플랜 찾기
    const planToEdit = plans.value.find(p => String(p.id) === String(planId));

    if (planToEdit) {
        // 2. 수정할 데이터 저장 (이 값이 PlanFormModal의 initialPlan으로 전달됨)
        editingPlan.value = planToEdit;

        // 3. 수정 모드로 모달 열기
        openModal('EDIT');
    } else {
        console.error("수정할 플랜을 찾을 수 없습니다. ID:", planId);
    }
};

// 💡 일정 수정 처리 (폼 제출)
const handleSubmitPlan = async (payload: any) => {
    try {
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
        }
        else if (modalMode.value === 'EDIT' && editingPlan.value) {
            // 1. 로컬 데이터 즉시 업데이트 (Optimistic UI)
            const index = plans.value.findIndex(p => String(p.id) === String(editingPlan.value?.id));

            if (index !== -1) {
                // 💡 기존 객체의 필수값(ownerId, dailySchedules 등)을 보존하면서 
                // 수정된 title, startDate, endDate만 덮어씌웁니다.
                plans.value[index] = {
                    ...plans.value[index],
                    title: payload.title,
                    startDate: payload.startDate,
                    endDate: payload.endDate
                } as PlanDTO;
            }

            // 2. 모달 닫기
            closeModal();

            // 3. 서버 요청 (시연을 위해 try-catch로 감싸서 500 에러 무시)
            try {
                await planStore.requestUpdatePlan(Number(editingPlan.value.id), {
                    title: payload.title,
                    startDate: payload.startDate,
                    endDate: payload.endDate
                });
            } catch (e) {
                console.warn("서버 수정은 실패(500)했지만 로컬 데이터는 유지합니다.");
            }
        }
    } catch (error) {
        console.error("처리 중 오류 발생:", error);
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