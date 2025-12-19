<template>
    <form @submit.prevent="submitForm" class="search-form">
        <div class="address-dropdown-group">

            <Dropdown v-model="selectedSidoName" :options="sidoNames" placeholder="시/도 선택" class="sido-dropdown" />

            <Dropdown v-model="selectedGugunName" :options="gugunNames" :disabled="!selectedSidoName"
                placeholder="구/군 선택" class="gugun-dropdown" />
        </div>

        <div class="search-input-wrapper">
            <span class="search-icon">
                <img src="@/assets/icons/ic_search.png" alt="검색 아이콘" class="icon-small" />
            </span>
            <input type="text" v-model="searchQuery" placeholder="장소를 검색하세요" />
            <button type="button" class="reset-btn" @click="handleReset">
                <img src="@/assets/icons/ic_close.png" alt="초기화" class="icon-small" />
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineExpose } from 'vue';
import Dropdown from '@/components/sidebar/Dropdown.vue';

// 변경된 데이터 구조 import
import { locations } from '@/assets/datas/address';
import type { Sido } from '@/assets/datas/address';
import type { SearchData } from '@/types/sidebar';

const selectedSidoName = ref('');
const selectedGugunName = ref('');
const searchQuery = ref('');

// 시도 이름 목록 생성
const sidoNames = computed(() => ['전체', ...locations.map(s => s.name)]);

// 현재 선택된 시도 객체 찾기
const selectedSido = computed<Sido | undefined>(() =>
    locations.find(s => s.name === selectedSidoName.value)
);

// 구군 이름 목록 생성 (선택된 시도 하위의 guguns 배열 사용)
const gugunNames = computed(() => {
    const sido = selectedSido.value;
    if (!sido) return ["전체"];

    return ['전체', ...sido.guguns.map(g => g.name)];
});

// 시도가 변경되면 구군을 '전체'로 초기화
watch(selectedSidoName, (newVal) => {
    if (newVal) {
        selectedGugunName.value = '전체';
    }
});

const emit = defineEmits(['searchSubmit', 'reset']);

// 검색 내용이 있는지 확인 (리셋 버튼 노출 여부)
const hasSearchContent = computed(() => {
    return selectedSidoName.value || searchQuery.value;
});

// 현재 폼 데이터를 반환하는 함수 (외부 노출용)
const getFormData = (): SearchData => {
    const sidoObj = locations.find(s => s.name === selectedSidoName.value);
    const gugunObj = sidoObj?.guguns.find(g => g.name === selectedGugunName.value);

    return {
        sidoName: selectedSidoName.value === '전체' ? '' : selectedSidoName.value,
        sidoCode: sidoObj?.code,
        gugunName: selectedGugunName.value === '전체' ? '' : selectedGugunName.value,
        gugunCode: gugunObj?.code,
        query: searchQuery.value.trim(),
    };
};

const submitForm = () => {
    // API 요청을 위해 코드값도 함께 전달
    emit('searchSubmit', getFormData());
};

const handleReset = () => {
    selectedSidoName.value = '';
    selectedGugunName.value = '';
    searchQuery.value = '';
    emit('reset');
};

defineExpose({
    getFormData
});
</script>

<style scoped>
.search-form {
    padding: 15px;
}

.address-dropdown-group {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.search-input-wrapper {
    display: flex;
    border: 1px solid var(--color-gray-light, #ccc);
    border-radius: 4px;
    overflow: hidden;
    align-items: center;
}

.search-icon {
    background: none;
    border: none;
    padding: 10px 12px;
    font-size: 1.1rem;
    color: var(--color-gray-medium);
    transition: color 0.2s;
    display: flex; /* 아이콘 정렬용 */
}

.search-input-wrapper input {
    flex-grow: 1;
    border: none;
    outline: none;
    font-size: 1rem;
}

.reset-btn {
    background: none;
    border: none;
    padding: 10px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.reset-btn img {
    width: 16px;
    height: 16px;
    opacity: 0.6;
}

.reset-btn:hover img {
    opacity: 1;
}
</style>