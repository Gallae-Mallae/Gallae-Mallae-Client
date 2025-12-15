<template>
    <header class="timeline-header">
        <div class="header-left">
            <span class="back-action" @click="handleBack">
                <img src="@/assets/icons/ic_back.png" alt="뒤로가기" class="icon-small" />
            </span>

            <div class="plan-info">
                <h1 class="plan-title">{{ props.planData.title }}</h1>
                <p class="plan-dates">{{ dateRange }}</p>
            </div>
            <button class="map-button" @click="handleMapView">
                <img src="@/assets/icons/ic_map.png" alt="지도보기" class="map-icon-img" />
                <span class="map-text">{{ strings.MAP_BUTTON }}</span>
            </button>
        </div>

        <div class="header-right">
            <TimelineParticipants :participants="props.participants" />

            <div class="action-buttons">
                <button class="action-button primary" @click="handleCopy">
                    <img src="@/assets/icons/ic_copy_link.png" alt="링크 복사 아이콘" class="action-icon" />
                    <span>{{ strings.COPY_LINK_BUTTON }}</span>
                </button>
                <button class="action-button secondary" @click="handleEditSaveToggle">
                    <img :src="saveEditButtonIcon" :alt="saveEditButtonText + ' 아이콘'" class="action-icon" />
                    <span>{{ saveEditButtonText }}</span>
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PlanCardDTO, PlanMemberDTO } from '@/types/plan';
import TimelineParticipants from '@/components/plan/TimelineParticipants.vue';
import savePlanIcon from '@/assets/icons/ic_save_plan.png';
import editPlanIcon from '@/assets/icons/ic_edit_plan.png';
import strings from '@/assets/values/strings.plan.json';

interface Props {
    planData: PlanCardDTO;
    participants: PlanMemberDTO[];
}

const props = defineProps<Props>();

const isEditing = ref(false);

const saveEditButtonText = computed(() => isEditing.value ? strings.SAVE_PLAN_BUTTON : strings.EDIT_PLAN_BUTTON);
const saveEditButtonIcon = computed(() => isEditing.value ? savePlanIcon : editPlanIcon);

const handleEditSaveToggle = () => {
    if (isEditing.value) {
        // 현재 수정 모드 -> 저장 액션 수행
        handleSave();
    } else {
        // 현재 저장 모드 -> 수정 액션 수행
        handleEdit();
    }
    // 상태 토글
    isEditing.value = !isEditing.value;
};

const dateRange = computed(() => {
    return `${props.planData.startDate} ~ ${props.planData.endDate}`;
});

const handleBack = () => {

};

const handleMapView = () => {

};

const handleCopy = () => {

};

const handleSave = () => {

};

const handleEdit = () => {

};

</script>

<style scoped>
.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #eee;
    background: white;
    width: 100%;
}

.header-left,
.header-right {
    display: flex;
    align-items: center;
}

.back-action {
    width: 24px;
    height: 24px;
    margin-right: 24px;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
}

.icon-small {
    width: 120%;
    height: 120%;
    object-fit: contain;
}

.plan-info {
    margin-right: 24px;
}

.plan-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #333;
}

.plan-dates {
    font-size: 12px;
    color: #777;
    margin: 4px 0 0 0;
}

.map-button {
    background: #222;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    border: none;
    display: flex;
    align-items: center;
    gap: 4px;
}

.map-icon-img {
    width: 18px;
    height: 18px;
    object-fit: contain;
}

.map-text {
    color: white;
}

.action-buttons {
    margin-left: 8px;
    display: flex;
}

.action-buttons button {
    padding: 5px 10px;
    border-radius: 12px;
    font-size: 14px;
    margin-left: 10px;
    cursor: pointer;
    border: 1px solid #ccc;
    background: white;
    color: #333;
    box-shadow: none;
    display: flex;
    align-items: center;
    gap: 4px;
}

.action-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
}
</style>