<template>
    <BaseModal :is-visible="isVisible" @close="emit('close')" width="430px">

        <div class="modal-main-content">
            <h2 class="form-title">{{ modalTitle }}</h2>

            <div class="form-group">
                <label for="title">{{ strings.PLAN_NAME }}</label>
                <input id="title" type="text" v-model="formTitle" placeholder=""/>
            </div>

            <div class="form-group">
                <label>{{ strings.PLAN_PERIOD }}</label>
                <div class="date-inputs">
                    <input type="date" v-model="formStartDate" />
                    <span>{{ strings.PLAN_DASH }}</span>
                    <input type="date" v-model="formEndDate" :min="formStartDate" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="modal-footer-actions">
                <button class="btn-submit" @click="handleSubmit">
                    {{ props.mode === 'CREATE' ? strings.PLAN_ADD_BUTTON : strings.PLAN_EDIT_BUTTON }}
                </button>
                <button class="btn-cancel" @click="emit('close')">{{ strings.PLAN_CANCEL_BUTTON }}</button>
            </div>
        </template>

    </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { PlanCardDTO } from '@/types/plan';
import strings from "@/assets/values/strings.plan.json";

type FormMode = 'CREATE' | 'EDIT';

interface Props {
    isVisible: boolean;
    mode: FormMode;
    initialPlan?: PlanCardDTO;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'submit']);

const formTitle = ref('');
const formStartDate = ref('');
const formEndDate = ref('');

// FormMode에 따른 제목 텍스트
const modalTitle = computed(() => {
    return props.mode === 'CREATE' ? strings.ADD_PLAN : strings.EDIT_PLAN;
});

watch(() => props.isVisible, (newVal) => {
    if (newVal && props.mode === 'CREATE') {
        formTitle.value = '';
        formStartDate.value = '';
        formEndDate.value = '';
    }
});

watch(() => props.initialPlan, (newPlan) => {
    if (props.mode === 'EDIT' && newPlan) {
        formTitle.value = newPlan.title;
        formStartDate.value = newPlan.startDate;
        formEndDate.value = newPlan.endDate;
    }
}, { immediate: true });

const handleSubmit = () => {
    if (!formTitle.value.trim()) {
        alert("여행 제목을 입력해주세요.");
        return;
    }
    if (!formStartDate.value || !formEndDate.value) {
        alert("여행 기간을 설정해주세요.");
        return;
    }

    // 날짜 비교 로직 (끝 날짜가 시작 날짜보다 빠르면 안됨)
    if (new Date(formStartDate.value) > new Date(formEndDate.value)) {
        alert("종료 날짜는 시작 날짜보다 빠를 수 없습니다.");
        return;
    }

    const payload = {
        title: formTitle.value,
        startDate: formStartDate.value,
        endDate: formEndDate.value,
        id: props.mode === 'EDIT' && props.initialPlan ? props.initialPlan.id : undefined,
    };

    emit('submit', payload);
};
</script>

<style scoped>
.form-title {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 25px;
    text-align: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
}

.modal-main-content {
    padding: 10px 10px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    color: #555;
    margin-bottom: 6px;
}

input[type="text"],
input[type="date"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1rem;
    color: #333;
    font-family: inherit;
}

.date-inputs {
    display: flex;
    gap: 10px;
    align-items: center;
}

.date-inputs input {
    flex-grow: 1;
}

.modal-footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 12px 20px 0;
    border-top: 1px solid #eee;
}

.btn-cancel,
.btn-submit {
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-cancel {
    background-color: #f0f0f0;
    color: #555;
    border: none;
}

.btn-cancel:hover {
    background-color: #e0e0e0;
}

.btn-submit {
    background-color: #101828;
    color: white;
    border: none;
}
</style>