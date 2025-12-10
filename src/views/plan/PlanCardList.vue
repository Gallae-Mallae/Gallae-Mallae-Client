<template>
    <div id="plan-view">
        <div>
            <PlanSelector @update:type="handleTypeChange" />
            <div class="simple-card-display">
                <PlanCard :plan="mockPlan" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import PlanSelector from '@/components/PlanSelector.vue';
import type { PlanType } from '@/types/plan';
import PlanCard from '@/components/plan/PlanCard.vue';
import type { PlanCardDTO } from '@/types/plan';
import image from '@/assets/images/example_plan.png';

const mockPlan: PlanCardDTO = {
    id: 'mock-1',
    title: '샘플 여행 일정',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    imageUrl: image,
    isShared: true,
};

const handleTypeChange = (newType: PlanType) => {
    console.log(`새로운 일정 유형이 선택되었습니다: ${newType}`);
    // 여기서 API를 호출하여 해당 유형의 일정 목록을 새로 가져오는 로직을 구현합니다.
};

</script>

<style scoped>
#plan-view {
    padding: 50px;
    background-color: #f7f7f7;
    min-height: 100vh;
}

.simple-card-display {
    display: flex;
    justify-content: center;
    max-width: 300px;
    margin: 0 auto;
}
</style>