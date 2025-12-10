<template>
    <div id="plan-view">
        <div class="simple-card-display">
            <PlanCard :plan="mockPlan" />
        </div>
    </div>
</template>

<script setup lang="ts">

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