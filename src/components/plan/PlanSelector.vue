<template>
    <div class="plan-selector-container">
        <button v-for="tab in tabs" :key="tab.type" :class="['tab-button', { 'is-active': selectedType === tab.type }]"
            @click="selectType(tab.type)" :aria-pressed="selectedType === tab.type">
            <img :src="tab.iconPath" :alt="tab.label" class="tab-icon" />
            <span>{{ tab.label }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export type PlanType = "ALL" | "PERSONAL" | "SHARED";
import allPlanIcon from '@/assets/icons/ic_all_plan.png';
import personalPlanIcon from '@/assets/icons/ic_personal_plan.png';
import sharedPlanIcon from '@/assets/icons/ic_shared_plan.png';

interface Props {
    initialType?: PlanType;
}

const props = withDefaults(defineProps<Props>(), {
    initialType: 'ALL'
});

const selectedType = ref<PlanType>(props.initialType);

const emit = defineEmits<{
    (e: 'update:type', type: PlanType): void;
}>();

const selectType = (type: PlanType) => {
    selectedType.value = type;
    emit('update:type', type);
};

const tabs: { type: PlanType, label: string, iconPath: string }[] = [
    { type: 'ALL', label: '전체 일정', iconPath: allPlanIcon },
    { type: 'PERSONAL', label: '개인 일정', iconPath: personalPlanIcon },
    { type: 'SHARED', label: '공유 일정', iconPath: sharedPlanIcon },
];

</script>

<style scoped>
.plan-selector-container {
    display: flex;
    gap: 16px;
    padding: 4px;
}

.tab-button {
    padding: 6px 12px;
    border: none;
    border-radius: 5px;
    font-size: 0.9rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #333;
    transition: all 0.2s ease;
}

.tab-icon {
    width: 18px;
    height: 18px;
}

.tab-button:hover:not(.is-active) {
    background-color: #f0f0f0;
}

.tab-button.is-active {
    background-color: #101828;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-button.is-active .tab-icon {
    filter: brightness(5);
}
</style>