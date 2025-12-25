<template>
    <div class="plan-card">
        <div class="plan-card-image-wrapper">
            <img :src="plan.planImageUrl" :alt="plan.title" class="plan-card-image" />

            <div class="action-wrapper delete-wrapper" @click="handleDeleteClick">
                <img src="@/assets/icons/ic_delete_scrap.png" alt="삭제" class="icon-small" />
            </div>

            <div class="action-wrapper edit-wrapper" @click="handleEditClick">
                <img src="@/assets/icons/ic_edit_scrap.png" alt="수정" class="icon-small" />
            </div>

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

const emit = defineEmits(['editPlan', 'deletePlan']);

const handleEditClick = (event: MouseEvent) => {
    event.stopPropagation();
    emit('editPlan', props.plan.id);
};

const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    emit('deletePlan', props.plan.id);
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

/* 원형 버튼 공통 스타일 */
.action-wrapper {
    position: absolute;
    top: 15px;
    z-index: 10;
    width: 24px;
    height: 24px;
    background-color: #d9d4d4;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s ease-in-out;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.delete-wrapper {
    left: 12px;
}

.edit-wrapper {
    right: 12px;
}

.plan-card:hover .action-wrapper {
    opacity: 1;
}

.action-wrapper:hover {
    background-color: #ebe9e9;
    transform: scale(1.05);
}

.icon-small {
    width: 15px;
    height: 15px;
    object-fit: contain;
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
</style>