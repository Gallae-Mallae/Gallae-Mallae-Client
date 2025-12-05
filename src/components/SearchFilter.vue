<template>
  <div class="search-filter-container">
    
    <div class="area-selectors">
      <div class="selector-item">
        <select class="area-select">
          <option value="">시/도</option>
          <option value="seoul">서울특별시</option>
          <option value="busan">부산광역시</option>
        </select>
        <!-- <img src="@/assets/icons/ic_down_arrow.png" alt="드롭다운" class="icon-dropdown" /> -->
      </div>

      <div class="selector-item">
        <select class="area-select">
          <option value="">구/군</option>
          <option value="gangnam">강남구</option>
          <option value="haeundae">해운대구</option>
        </select>
        <!-- <img src="@/assets/icons/ic_down_arrow.png" alt="드롭다운" class="icon-dropdown" /> -->
      </div>
    </div>

    <div class="keyword-search-box">
      <img src="@/assets/icons/ic_search.png" alt="검색" class="icon-search" />
      <input 
        type="text" 
        placeholder="장소, 주소를 검색하세요" 
        class="search-input"
        :value="keyword"
        @input="updateKeyword"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 상위 뷰(Search.vue)로 입력된 키워드 값을 전달하기 위한 emit 정의
const emit = defineEmits(['update:keyword']);

// 현재 검색 키워드 상태 (v-model 역할을 하기 위해 prop 대신 ref 사용 또는 prop과 emit 결합)
const keyword = ref(''); 

const updateKeyword = (event: Event) => {
  const target = event.target as HTMLInputElement;
  keyword.value = target.value;
  // 상위 뷰에 키워드 변경 이벤트를 발생시킵니다.
  emit('update:keyword', target.value);
};

// 시/도, 구/군 상태 관리는 추후 구현하겠습니다.
</script>

<style scoped>
/* --- 1. 시/도 & 구/군 선택 영역 --- */
.area-selectors {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  padding: 0 8px; /* 사이드바의 탭 영역에 맞추기 위한 좌우 패딩 */
}

.selector-item {
  position: relative;
  flex-grow: 1;
  border: 1px solid var(--color-gray-light);
  border-radius: 4px;
  overflow: hidden;
}

.area-select {
  width: 100%;
  padding: 8px 30px 8px 10px;
  /* 브라우저 기본 스타일 제거 */
  -webkit-appearance: none; 
  -moz-appearance: none;
  appearance: none;
  border: none;
  background-color: var(--color-white);
  font-size: var(--font-size-address);
  color: var(--color-text-dark, #333);
  cursor: pointer;
}

.icon-dropdown {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  pointer-events: none; /* 드롭다운 클릭 가능하게 설정 */
}

/* --- 2. 키워드 검색 입력창 영역 --- */
.keyword-search-box {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-gray-light);
  border-radius: 4px;
  padding: 8px 10px;
  margin: 0 8px 16px 8px; /* SideBar의 탭 영역에 맞추기 위한 좌우 패딩 */
  background-color: var(--color-white);
}

.icon-search {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: var(--color-gray-medium);
}

.search-input {
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: var(--font-size-address);
  color: var(--color-text-dark, #333);
}

.search-input::placeholder {
  color: var(--color-gray-medium);
}
</style>