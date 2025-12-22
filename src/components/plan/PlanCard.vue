<template>
    <div class="plan-card">
        <div class="plan-card-image-wrapper">
            <img :src="plan.planImageUrl" :alt="plan.title" class="plan-card-image" />

            <span class="plan-edit" @click="handleEditClick">
                <img src="@/assets/icons/ic_edit.png" alt="수정" class="icon-small" />
            </span>

            <div class="plan-card-info-overlay">
                <h3 class="plan-card-title">{{ plan.title }}</h3>
                <p class="plan-card-dates">
                    {{ plan.startDate }} ~ {{ plan.endDate }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PlanCardDTO } from '@/types/plan';

interface Props {
    plan: PlanCardDTO;
}

const props = defineProps<Props>();

const emit = defineEmits(['editPlan']);

const handleEditClick = (event: MouseEvent) => {
    event.stopPropagation();
    emit('editPlan', props.plan.id);
};

</script>

<style scoped>
.plan-card {
    width: 100%;
    max-width: 300px;
    aspect-ratio: 4 / 3;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
}

.plan-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.plan-card-image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
}

.plan-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.8);
}

.plan-card-info-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    color: white;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
}

.plan-card-title {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 10px;
}

.plan-card-dates {
    font-size: 0.8rem;
    opacity: 0.9;
    margin-left: 2px;
}

.plan-edit {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    cursor: pointer;
    opacity: 0.0;
    transition: opacity 0.2s ease-in-out;
}

.plan-card:hover .plan-edit {
    opacity: 0.8;
}

.plan-card:hover .plan-edit:hover {
    opacity: 1.0;
}

.icon-small {
    width: 38px;
    height: 38px;
}
</style>