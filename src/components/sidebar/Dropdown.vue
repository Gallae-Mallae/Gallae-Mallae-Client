<template>
    <div class="dropdown-container">
        <select :value="modelValue" @change="handleChange" class="custom-dropdown">
            <option value="" disabled selected hidden>
                {{ placeholder }}
            </option>

            <option v-for="option in options" :key="option" :value="option">
                {{ option }}
            </option>
        </select>

        <span class="dropdown-arrow">
            <img src="@/assets/icons/ic_dropdown.png" alt="화살표" class="icon-small" />
        </span>
    </div>
</template>

<script setup lang="ts">
// defineProps : 컴포넌트가 부모로부터 받을 데이터 정의
// defineEmits : 컴포넌트가 부모에게 보낼 이벤트 정의
import { defineProps, defineEmits } from 'vue';

defineProps<{
    modelValue: string; // 현재 드롭다운에 선택된 값
    options: string[]; // 선택 가능한 항목들의 배열
    placeholder?: string; // 선택 전 힌트 텍스트
    disabled?: boolean; // 드롭다운 활성화 여부
}>();

const emit = defineEmits(['update:modelValue']);

// 오류 해결 위한 명시적인 이벤트 핸들러 함수
const handleChange = (event: Event) => {
    // event.target이 존재하며, event.target이 HTMLSelectElement 타입임을 TypeScript에 명시적으로 알림
    if (event.target instanceof HTMLSelectElement) {
        emit('update:modelValue', event.target.value);
    }
};
</script>

<style scoped>
.dropdown-container {
    position: relative;
    flex-grow: 1;
}

.custom-dropdown {
    width: 100%;
    padding: 10px 30px 10px 10px;
    font-size: 1rem;
    border: 1px solid var(--color-gray-light, #ccc);
    border-radius: 4px;
    background-color: var(--color-white, white);
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    cursor: pointer;
}

.custom-dropdown:focus {
    border-color: var(--color-primary-dark);
    outline: none;
}

.custom-dropdown[disabled] {
    background-color: var(--color-gray-light);
    cursor: not-allowed;
    color: var(--color-gray-medium);
}

.dropdown-arrow {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--color-gray-medium);
    font-size: 0.7rem;
}
</style>