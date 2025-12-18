<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SideBar from '@/components/sidebar/SideBar.vue';
import SideBarSearchTab from '@/views/sidebar/SideBarSearchTab.vue';
import SideBarMyTab from '@/views/sidebar/SideBarMyTab.vue';
import { contentTypes } from '@/utils/categoryMap';

// 선택된 카테고리 상태 (null이면 선택 안함)
const selectedCategory = ref<number | null>(null);

// 카테고리 토글 함수
const toggleCategory = (code: number) => {
  if (selectedCategory.value === code) {
    selectedCategory.value = null; // 이미 선택된거 누르면 해제 (One-by-one, Toggle)
  } else {
    selectedCategory.value = code;
  }
};

onMounted(() => {
  if (!(window as any).kakao || !(window as any).kakao.maps) {
    console.error('Kakao Maps SDK not loaded!');
    return;
  }

  const container = document.getElementById('map');
  
  // 초기 위치 고정: 서울시청
  const initialLat = 37.5665;
  const initialLng = 126.9780;

  const options = {
    center: new (window as any).kakao.maps.LatLng(initialLat, initialLng),
    level: 3
  };

  try {
    const map = new (window as any).kakao.maps.Map(container, options);
    console.log('Map initialized successfully at Seoul City Hall');

    // 1. 줌 레벨 제한 (1 ~ 13)
    map.setMinLevel(1);
    map.setMaxLevel(13);

    // 사용자가 요청한 '직접 레벨을 가져와서 확인하는' 안전장치 추가
    (window as any).kakao.maps.event.addListener(map, 'zoom_changed', () => {
      const level = map.getLevel();
      if (level < 1) {
        map.setLevel(1);
      } else if (level > 13) {
        map.setLevel(13);
      }
    });

    // 2. 드래그 영역 제한 (줌 레벨에 따라 동적으로 제한)
    // 넓은 영역 (줌 1~11): 북쪽을 아주 시원하게(43.0) 뚫어줌
    const wideSouthWest = new (window as any).kakao.maps.LatLng(32.0, 123.0);
    const wideNorthEast = new (window as any).kakao.maps.LatLng(43.0, 134.0);
    const wideBounds = new (window as any).kakao.maps.LatLngBounds(wideSouthWest, wideNorthEast);

    // 중간 영역 (줌 12): 북쪽을 훨씬 더 느슨하게(42.0) 확장
    const mediumSouthWest = new (window as any).kakao.maps.LatLng(33.5, 125.5);
    const mediumNorthEast = new (window as any).kakao.maps.LatLng(42.0, 131.0);
    const mediumBounds = new (window as any).kakao.maps.LatLngBounds(mediumSouthWest, mediumNorthEast);

    // 좁은 영역 (줌 13): 흰 공백 방지용. 아래(남쪽)는 타이트하게, 위(북쪽)는 더 시원하게(40.0) 확장
    const tightSouthWest = new (window as any).kakao.maps.LatLng(35.5, 127.0);
    const tightNorthEast = new (window as any).kakao.maps.LatLng(40.0, 128.5);
    const tightBounds = new (window as any).kakao.maps.LatLngBounds(tightSouthWest, tightNorthEast);

    // 중심 좌표가 변경될 때마다(드래그 중에도) 영역 확인
    (window as any).kakao.maps.event.addListener(map, 'center_changed', () => {
      const level = map.getLevel();
      const center = map.getCenter();
      
      // 줌 레벨에 따라 적용할 경계선 선택
      let currentBounds, targetSW, targetNE;
      
      if (level >= 13) {
        currentBounds = tightBounds;
        targetSW = tightSouthWest;
        targetNE = tightNorthEast;
      } else if (level === 12) {
        currentBounds = mediumBounds;
        targetSW = mediumSouthWest;
        targetNE = mediumNorthEast;
      } else {
        currentBounds = wideBounds;
        targetSW = wideSouthWest;
        targetNE = wideNorthEast;
      }
      
      if (!currentBounds.contain(center)) {
        // 영역을 벗어나려고 하면 즉시 경계선으로 고정
        let lat = center.getLat();
        let lng = center.getLng();

        const swLat = targetSW.getLat();
        const swLng = targetSW.getLng();
        const neLat = targetNE.getLat();
        const neLng = targetNE.getLng();

        if (lat < swLat) lat = swLat;
        if (lat > neLat) lat = neLat;
        if (lng < swLng) lng = swLng;
        if (lng > neLng) lng = neLng;

        map.setCenter(new (window as any).kakao.maps.LatLng(lat, lng));
      }
    });

  } catch (err) {
    console.error('Error initializing map:', err);
  }
});
</script>

<template>
  <div class="search-page-layout">
    <SideBar>
      <template #search>
        <SideBarSearchTab />
      </template>
      <template #my>
        <SideBarMyTab />
      </template>
    </SideBar>

    <main class="main-content">
      <div id="map"></div>
      
      <!-- 지도 상단 카테고리 토글 -->
      <div class="category-overlay">
        <button 
          v-for="type in contentTypes" 
          :key="type.code"
          class="category-btn"
          :class="{ active: selectedCategory === type.code }"
          @click="toggleCategory(type.code)"
        >
          <span class="category-dot" :class="type.cssClass"></span>
          {{ type.name }}
        </button>
      </div>
    </main>
    </div>
</template>

<style scoped>
@import '@/assets/styles/_category.css';

.search-page-layout {
  display: flex;
  height: 100%; 
  width: 100%;
  overflow: hidden; 
}

.main-content {
  flex-grow: 1;
  background-color: var(--color-gray-lightest, #f8f8f8);
  position: relative;
  height: 100%; 
}

#map {
  width: 100%;
  height: 100%; 
}

/* 카테고리 오버레이 스타일 */
.category-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
}

.category-btn {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--color-gray-light, #eee);
  border-radius: 12px;
  background-color: var(--color-white);
  color: var(--color-gray-dark, #666);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
}

/* 고유 색상 동그라미 */
.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* 각 카테고리별 색상 매핑 */
.category-dot.ATTRACTION { background-color: var(--category-tag-bg-ATTRACTION); }
.category-dot.CULTURE { background-color: var(--category-tag-bg-CULTURE); }
.category-dot.FESTIVAL { background-color: var(--category-tag-bg-FESTIVAL); }
.category-dot.COURSE { background-color: var(--category-tag-bg-COURSE); }
.category-dot.LEPORTS { background-color: var(--category-tag-bg-LEPORTS); }
.category-dot.LODGE { background-color: var(--category-tag-bg-LODGE); }
.category-dot.SHOPPING { background-color: var(--category-tag-bg-SHOPPING); }
.category-dot.FOOD { background-color: var(--category-tag-bg-FOOD); }
.category-dot.CAFE { background-color: var(--category-tag-bg-CAFE); }

.category-btn:hover {
  background-color: #f9f9f9;
}

/* Active 상태: 바탕색이 어두워지고 글자가 흰색으로 */
.category-btn.active {
  background-color: #333; /* 어두운 바탕 */
  color: var(--color-white); /* 흰색 글자 */
  border-color: #333;
}

/* Active 상태일 때 동그라미 색상은 유지되도록 */
.category-btn.active .category-dot {
  box-shadow: 0 0 2px rgba(255,255,255,0.5); /* 흰 글자 사이에서 더 잘 보이게 살짝 강조 */
}
</style>