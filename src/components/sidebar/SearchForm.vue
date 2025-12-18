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

// 타입과 값의 import 분리 => TypeScript 오류 방지
import { sidos, guguns } from '@/assets/datas/address';
import type { Sido, Gugun } from '@/types/sidebar';

const selectedSidoName = ref('');
const selectedGugunName = ref('');
const searchQuery = ref('');

// 시도 이름 목록
const sidoNames = computed(() => ['전체', ...sidos.map(s => s.name)]);

// 현재 선택된 시도 객체를 찾습니다. (구군 필터링을 위한 내부 로직)
const selectedSido = computed<Sido | undefined>(() =>
    sidos.find(s => s.name === selectedSidoName.value)
);

// 구군 이름 목록 (선택된 시도에 따라 동적으로 변경)
const gugunNames = computed(() => {
    const sido = selectedSido.value;
    // 시도가 선택 전, 빈 배열 반환
    if (!sido) return ["전체"];

    // 선택된 시도의 sidoId와 일치하는 구군만 필터링
    const filteredGuguns = guguns.filter(g => g.sidoId === sido.id);

    return ['전체', ...filteredGuguns.map(g => g.name)];
});

// 감시자(Watcher): 시도 변경 시 구군 초기화 로직
watch(selectedSidoName, (newSidoName) => {
    // 시도가 새로 선택되면, 구군 선택을 '전체'로 설정
    if (newSidoName) {
        selectedGugunName.value = '전체';
    }
});

// 폼 제출 로직
const emit = defineEmits(['searchSubmit']);

const submitForm = () => {
    // SearchTab으로 모든 입력 데이터를 전달
    emit('searchSubmit', {
        sido: selectedSidoName.value,
        gugun: selectedGugunName.value,
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