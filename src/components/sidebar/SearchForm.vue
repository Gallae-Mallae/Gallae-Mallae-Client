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
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dropdown from '@/components/sidebar/Dropdown.vue';

// 변경된 데이터 구조 import
import { locations } from '@/assets/datas/address';
import type { Sido } from '@/assets/datas/address';

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

const emit = defineEmits(['searchSubmit']);

const submitForm = () => {
    // 선택된 시도/구군의 Code 찾기
    const sidoObj = locations.find(s => s.name === selectedSidoName.value);
    const gugunObj = sidoObj?.guguns.find(g => g.name === selectedGugunName.value);

    // API 요청을 위해 코드값도 함께 전달
    emit('searchSubmit', {
        sidoName: selectedSidoName.value === '전체' ? '' : selectedSidoName.value,
        sidoCode: sidoObj?.code || 0,
        gugunName: selectedGugunName.value === '전체' ? '' : selectedGugunName.value,
        gugunCode: gugunObj?.code || 0,
        query: searchQuery.value.trim(),
    });
};
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
}

.search-icon {
    background: none;
    border: none;
    padding: 10px 12px;
    font-size: 1.1rem;
    color: var(--color-gray-medium);
    transition: color 0.2s;
}

.search-input-wrapper input {
    flex-grow: 1;
    border: none;
    outline: none;
    font-size: 1rem;
}
</style>