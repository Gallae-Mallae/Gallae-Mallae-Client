<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SideBar from '@/components/sidebar/SideBar.vue';
import SideBarSearchTab from '@/views/sidebar/SideBarSearchTab.vue';
import SideBarMyTab from '@/views/sidebar/SideBarMyTab.vue';
import { contentTypes } from '@/utils/categoryMap';
import type { SearchData } from '@/types/sidebar';
import { getMapAttractions, type MapAttractionResponse, type MapAttractionParams } from '@/api/attraction';

// 선택된 카테고리 상태 (null이면 선택 안함)
const selectedCategory = ref<number | null>(null);

// Map 관련 상태
const mapInstance = ref<any>(null);
const showReSearchButton = ref(false);
const isSearchMode = ref(false); // SideBarSearchTab의 hasSearched 상태 동기화
const isPanningToCluster = ref(false); // 클러스터 이동 중인지 확인하는 플래그

// 마커 관리를 위한 배열
const markers = ref<any[]>([]);
const customOverlays = ref<any[]>([]);

// 현재 검색 필터 상태 (API 호출 시 사용)
const currentFilters = ref<{
    sido?: number;
    guguns?: number;
    keyword?: string;
    contenttype?: number;
}>({});

// SideBarSearchTab 참조
const sideBarSearchTabRef = ref<InstanceType<typeof SideBarSearchTab> | null>(null);

// 마커 및 오버레이 초기화
const clearMarkers = () => {
  if (markers.value.length > 0) {
    markers.value.forEach(marker => marker.setMap(null));
    markers.value = [];
  }
  if (customOverlays.value.length > 0) {
    customOverlays.value.forEach(overlay => overlay.setMap(null));
    customOverlays.value = [];
  }
};

// 지도 API 호출 및 마커 그리기
const fetchMapMarkers = async () => {
    if (!mapInstance.value) return;

    const bounds = mapInstance.value.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const zoomLevel = mapInstance.value.getLevel();

    const params: MapAttractionParams = {
        zoomLevel,
        southWestLat: sw.getLat(),
        southWestLng: sw.getLng(),
        northEastLat: ne.getLat(),
        northEastLng: ne.getLng(),
        sido: currentFilters.value.sido || undefined,
        guguns: currentFilters.value.guguns || undefined,
        keyword: currentFilters.value.keyword || undefined,
        contenttype: currentFilters.value.contenttype || undefined
    };

    try {
        const data = await getMapAttractions(params);
        console.log(`[Map] Fetched ${data.length} items from /api/attractions/map`);
        drawMarkers(data);
    } catch (error) {
        console.error("Failed to fetch map attractions:", error);
    }
};

// 데이터 기반으로 마커/오버레이 그리기
const drawMarkers = (data: MapAttractionResponse[]) => {
    clearMarkers();

    if (!mapInstance.value) return;

    data.forEach(item => {
        const position = new (window as any).kakao.maps.LatLng(item.latitude, item.longitude);

        if (item.count > 1) {
            // 클러스터 (커스텀 오버레이) - DOM Element 생성 방식 사용
            const content = document.createElement('div');
            content.className = 'cluster-overlay';
            content.innerHTML = `<div class="cluster-count">${item.count}</div>`;

            // 클릭 이벤트: 중심 이동 + 줌 인 + 재검색
            content.addEventListener('click', (e) => {
                e.stopPropagation(); // 이벤트 전파 방지
                if (!mapInstance.value) return;

                console.log(`[Cluster] Clicked! Snapping to ${item.latitude}, ${item.longitude}`);

                // 1. 플래그 설정 (bounds 체크 방지)
                isPanningToCluster.value = true;

                // 2. 먼저 중심을 강제로 이동 (애니메이션 없이 정확한 위치로)
                mapInstance.value.setCenter(position);

                // 3. 그 다음 줌 레벨 변경 (애니메이션)
                const currentLevel = mapInstance.value.getLevel();
                const newLevel = Math.max(1, currentLevel - 2); // 최소 레벨 1

                // 줌 변경 시점
                setTimeout(() => {
                    mapInstance.value.setLevel(newLevel, { animate: true });
                }, 50);

                // 4. 애니메이션 종료 예상 시점 후 API 재호출
                // (idle 이벤트가 줌 애니메이션 중에 여러 번 튈 수 있어 setTimeout이 안전)
                setTimeout(() => {
                    console.log("[Cluster] Animation finished. Re-fetching...");
                    isPanningToCluster.value = false;
                    fetchMapMarkers();
                }, 800); // 줌 애니메이션 시간 고려
            });
            
            const overlay = new (window as any).kakao.maps.CustomOverlay({
                position: position,
                content: content,
                xAnchor: 0.5,
                yAnchor: 0.5,
                clickable: false // 중요: false로 설정해야 DOM의 hover/click 이벤트가 정상 작동함
            });
            
            overlay.setMap(mapInstance.value);
            customOverlays.value.push(overlay);

        } else {
            // 단일 마커
            const marker = new (window as any).kakao.maps.Marker({
                position: position,
                title: item.title // hover 시 타이틀 표시
            });

            marker.setMap(mapInstance.value);
            markers.value.push(marker);
            
            // TODO: 마커 클릭 이벤트 등 추가 가능
        }
    });
};

// 사이드바 검색 요청 처리 (유일한 검색 시작점)
const handleSidebarSearchRequest = (data: SearchData) => {
    // 필터 업데이트 (사이드바 폼 + 현재 선택된 카테고리)
    currentFilters.value = {
        sido: data.sidoCode || undefined,
        guguns: data.gugunCode || undefined,
        keyword: data.query || undefined,
        contenttype: selectedCategory.value || undefined
    };

    const hasActiveFilters = Object.values(currentFilters.value).some(val => val !== undefined && val !== 0 && val !== '');

    if (hasActiveFilters) {
        // 검색 조건이 있으면 검색 모드 활성화 및 API 호출
        isSearchMode.value = true;
        fetchMapMarkers();

        // 사이드바 리스트도 함께 갱신
        if (mapInstance.value && sideBarSearchTabRef.value) {
            sideBarSearchTabRef.value.searchByBounds(mapInstance.value.getBounds(), currentFilters.value);
        }
    } else {
        // 검색 조건이 없으면 검색 모드 해제 및 초기화
        isSearchMode.value = false;
        clearMarkers();
        showReSearchButton.value = false;
    }
};

// 지도 내 재검색 버튼 클릭
const handleReSearchInMap = async () => {
  if (!mapInstance.value || !sideBarSearchTabRef.value) return;
  
  const bounds = mapInstance.value.getBounds();
  showReSearchButton.value = false; // 버튼 숨기기

  // [중요] 검색 폼의 현재 상태 가져오기 (입력만 하고 엔터 안 친 상태 반영)
  const currentSearchData = sideBarSearchTabRef.value.getCurrentSearchData();
  
  if (currentSearchData) {
      currentFilters.value = {
          sido: currentSearchData.sidoCode || undefined,
          guguns: currentSearchData.gugunCode || undefined,
          keyword: currentSearchData.query || undefined,
          contenttype: selectedCategory.value || undefined
      };
  }

  // 1. 지도 마커 갱신 (현재 필터 + 현재 뷰포트)
  fetchMapMarkers();

  // 2. 사이드바 리스트 갱신 (현재 필터 반영)
  await sideBarSearchTabRef.value.searchByBounds(bounds, currentFilters.value);
};

// 지도 이벤트 핸들러
const onMapInteract = () => {
  if (isSearchMode.value && !isPanningToCluster.value) {
    showReSearchButton.value = true;
  }
};

const handleSearchStateChange = (hasSearched: boolean) => {
    isSearchMode.value = hasSearched;
    if (!hasSearched) {
        showReSearchButton.value = false;
        clearMarkers(); // 검색 초기화 시 마커도 제거?
        currentFilters.value = {}; // 필터 초기화
    } else {
        showReSearchButton.value = false;
    }
};

const handleMapHighlight = (placeId: string, coords: { lat: number, lng: number }) => {
  console.log(`[Search] 지도 하이라이트: ${placeId} (${coords.lat}, ${coords.lng})`);
  if (mapInstance.value) {
    const moveLatLon = new (window as any).kakao.maps.LatLng(coords.lat, coords.lng);
    mapInstance.value.panTo(moveLatLon);
  }
};

const handleResetRequest = () => {
    selectedCategory.value = null;
    currentFilters.value = {};
    isSearchMode.value = false;
    showReSearchButton.value = false;
    clearMarkers();
};

const handleMarkAction = (placeId: string) => {
  console.log(`[Search] 마크 액션: ${placeId}`);
};

// 카테고리 토글 함수
const toggleCategory = (code: number) => {
  if (selectedCategory.value === code) {
    selectedCategory.value = null;
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
  const initialLat = 37.5665;
  const initialLng = 126.9780;

  const options = {
    center: new (window as any).kakao.maps.LatLng(initialLat, initialLng),
    level: 3
  };

  try {
    const map = new (window as any).kakao.maps.Map(container, options);
    mapInstance.value = map; // Ref에 저장
    console.log('Map initialized successfully');

    map.setMinLevel(1);
    map.setMaxLevel(13);

    // 줌/드래그 제한 로직
    const wideBounds = new (window as any).kakao.maps.LatLngBounds(
      new (window as any).kakao.maps.LatLng(32.0, 123.0),
      new (window as any).kakao.maps.LatLng(43.0, 134.0)
    );
    const mediumBounds = new (window as any).kakao.maps.LatLngBounds(
      new (window as any).kakao.maps.LatLng(33.5, 125.5),
      new (window as any).kakao.maps.LatLng(42.0, 131.0)
    );
    const tightBounds = new (window as any).kakao.maps.LatLngBounds(
      new (window as any).kakao.maps.LatLng(35.5, 127.0),
      new (window as any).kakao.maps.LatLng(40.0, 128.5)
    );

    const checkBounds = () => {
      // 클러스터 이동 중일 때는 검사하지 않음
      if (isPanningToCluster.value) return;

      const level = map.getLevel();
      const center = map.getCenter();
      let currentBounds;
      
      if (level >= 13) currentBounds = tightBounds;
      else if (level === 12) currentBounds = mediumBounds;
      else currentBounds = wideBounds;
      
      if (!currentBounds.contain(center)) {
        let lat = center.getLat();
        let lng = center.getLng();
        const sw = currentBounds.getSouthWest();
        const ne = currentBounds.getNorthEast();

        if (lat < sw.getLat()) lat = sw.getLat();
        if (lat > ne.getLat()) lat = ne.getLat();
        if (lng < sw.getLng()) lng = sw.getLng();
        if (lng > ne.getLng()) lng = ne.getLng();

        map.setCenter(new (window as any).kakao.maps.LatLng(lat, lng));
      }
    };

    (window as any).kakao.maps.event.addListener(map, 'zoom_changed', () => {
        const level = map.getLevel();
        if (level < 1) map.setLevel(1);
        else if (level > 13) map.setLevel(13);
        
        onMapInteract();
    });

    (window as any).kakao.maps.event.addListener(map, 'center_changed', () => {
        checkBounds();
    });

    (window as any).kakao.maps.event.addListener(map, 'dragend', onMapInteract);

  } catch (err) {
    console.error('Error initializing map:', err);
  }
});
</script>

<template>
  <div class="search-page-layout">
    <SideBar>
      <template #search>
        <SideBarSearchTab 
            ref="sideBarSearchTabRef"
            :selected-category="selectedCategory"
            @map-highlight="handleMapHighlight"
            @mark-action="handleMarkAction"
            @state-change="handleSearchStateChange"
            @search-request="handleSidebarSearchRequest"
            @reset-request="handleResetRequest"
        />
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

      <!-- 현 지도에서 검색 버튼 -->
      <transition name="fade">
        <div v-if="showReSearchButton" class="re-search-overlay">
            <button class="re-search-btn" @click="handleReSearchInMap">
                <span class="re-search-icon">↻</span>
                현 지도에서 검색
            </button>
        </div>
      </transition>

    </main>
    </div>
</template>

<style>
/* 전역 스타일로 추가해야 Kakao Map 오버레이에 적용됨 */
.cluster-overlay {
    background: #fff;
    border: 3px solid #3b82f6; /* 파란색 테두리 */
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
    color: #3b82f6;
    font-weight: 800;
    font-size: 14px; /* 폰트는 살짝 줄여서 긴 숫자 대비 */
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    pointer-events: auto;
    z-index: 999;
    position: relative; /* pseudo-element 위치 기준 */
}

/* 호버 시 효과 */
.cluster-overlay:hover {
    background: #3b82f6;
    color: #fff;
    transform: scale(1.1) translateY(-2px); /* 살짝 커지면서 위로 */
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.5);
    z-index: 1000;
}

.cluster-overlay:active {
    transform: scale(0.95);
    box-shadow: 0 2px 5px rgba(59, 130, 246, 0.4);
}

.cluster-count {
    /* 중앙 정렬됨 */
}
</style>

<style scoped>
@import '@/assets/styles/_category.css';

.search-page-layout {
  display: flex;
  height: calc(100vh - 58px); /* 헤더 높이(약 58px) 제외한 전체 높이 */
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

.category-btn.active {
  background-color: #333; 
  color: var(--color-white);
  border-color: #333;
}

.category-btn.active .category-dot {
  box-shadow: 0 0 2px rgba(255,255,255,0.5);
}

/* 현 지도 검색 버튼 스타일 */
.re-search-overlay {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
}

.re-search-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background-color: var(--color-white, #fff);
    color: var(--color-primary, #3498db); /* Primary Color 추정 */
    border: 1px solid #ddd;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.re-search-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0,0,0,0.15);
    background-color: #fcfcfc;
}

.re-search-btn:active {
    transform: translateY(0);
}

.re-search-icon {
    font-size: 16px;
    line-height: 1;
}

/* 트랜지션 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>