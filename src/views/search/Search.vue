<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SideBar from '@/components/sidebar/SideBar.vue';
import SideBarSearchTab from '@/views/sidebar/SideBarSearchTab.vue';
import SideBarMyTab from '@/views/sidebar/SideBarMyTab.vue';
const contentTypes = [
  { code: 12, name: "관광지", cssClass: "ATTRACTION" },
  { code: 14, name: "문화시설", cssClass: "CULTURE" },
  { code: 15, name: "축제/공연/행사", cssClass: "FESTIVAL" },
  { code: 25, name: "여행코스", cssClass: "COURSE" },
  { code: 28, name: "레포츠", cssClass: "LEPORTS" },
  { code: 32, name: "숙박", cssClass: "LODGE" },
  { code: 38, name: "쇼핑", cssClass: "SHOPPING" },
  { code: 39, name: "식당", cssClass: "FOOD" },
  { code: 40, name: "카페", cssClass: "CAFE" },
];
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

    const serverClusters: MapAttractionResponse[] = [];
    const singlePlaces: MapAttractionResponse[] = [];

    // 1. 데이터 분류
    data.forEach(item => {
        if (item.count > 1) serverClusters.push(item);
        else singlePlaces.push(item);
    });

    // 2. 서버 사이드 클러스터 그리기 (기존 로직)
    serverClusters.forEach(item => {
        const position = new (window as any).kakao.maps.LatLng(item.latitude, item.longitude);
        const content = document.createElement('div');
        content.className = 'cluster-overlay';
        content.innerHTML = `<div class="cluster-count">${item.count}</div>`;

        content.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!mapInstance.value) return;

            console.log(`[Cluster] Clicked! Snapping to ${item.latitude}, ${item.longitude}`);
            isPanningToCluster.value = true;
            mapInstance.value.setCenter(position);

            const currentLevel = mapInstance.value.getLevel();
            const newLevel = Math.max(1, currentLevel - 2);

            setTimeout(() => {
                mapInstance.value.setLevel(newLevel, { animate: true });
            }, 50);

            setTimeout(() => {
                console.log("[Cluster] Animation finished. Re-fetching...");
                isPanningToCluster.value = false;
                fetchMapMarkers();
            }, 800);
        });
        
        const overlay = new (window as any).kakao.maps.CustomOverlay({
            position: position,
            content: content,
            xAnchor: 0.5,
            yAnchor: 0.5,
            clickable: false
        });
        
        overlay.setMap(mapInstance.value);
        customOverlays.value.push(overlay);
    });

    // 3. 개별 장소 좌표 그룹핑 (겹침 확인)
    const groupedPlaces = new Map<string, MapAttractionResponse[]>();
    singlePlaces.forEach(item => {
        const key = `${item.latitude},${item.longitude}`;
        if (!groupedPlaces.has(key)) groupedPlaces.set(key, []);
        groupedPlaces.get(key)!.push(item);
    });

    // 4. 그룹핑된 장소 그리기
    groupedPlaces.forEach((items, key) => {
        const firstItem = items[0]!;
        const position = new (window as any).kakao.maps.LatLng(firstItem.latitude, firstItem.longitude);

        if (items.length === 1) {
            // [단일 장소] 빨간 핀 마커
            const item = items[0]!;
            const content = document.createElement('div');
            content.className = 'custom-marker-container';
            
            content.innerHTML = `
                <img src="data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2230%22%20height%3D%2242%22%20viewBox%3D%220%200%2030%2042%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15%200C6.71573%200%200%206.71573%200%2015C0%2026.25%2015%2042%2015%2042C15%2042%2030%2026.25%2030%2015C30%206.71573%2023.2843%200%2015%200Z%22%20fill%3D%22%23EA4335%22%2F%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2215%22%20r%3D%226%22%20fill%3D%22%23960F0F%22%2F%3E%3C%2Fsvg%3E" class="marker-icon" alt="marker">
                <span class="marker-title">${item.title}</span>
            `;

            content.addEventListener('click', (e) => {
                e.stopPropagation();
                const placeId = String((item as any).attractionId || item.attrId);
                if (placeId !== 'undefined' && placeId !== 'NaN' && sideBarSearchTabRef.value) {
                    sideBarSearchTabRef.value.openDetailModal(placeId);
                }
            });

            const overlay = new (window as any).kakao.maps.CustomOverlay({
                position: position,
                content: content,
                xAnchor: 0.5,
                yAnchor: 1.0,
                clickable: true
            });

            overlay.setMap(mapInstance.value);
            customOverlays.value.push(overlay);

        } else {
            // [중복 장소] 묶음 마커 (+N)
            const content = document.createElement('div');
            content.className = 'bundle-marker-container';
            
            // 목록 아이템 생성
            const listItemsHtml = items.map(item => `
                <div class="bundle-item" data-id="${(item as any).attractionId || item.attrId}">
                    ${item.title}
                </div>
            `).join('');

            content.innerHTML = `
                <div class="bundle-badge">+${items.length}</div>
                <div class="bundle-list" style="display: none;">
                    ${listItemsHtml}
                </div>
            `;

            // 오버레이 먼저 생성 (이벤트 리스너에서 참조하기 위해)
            const overlay = new (window as any).kakao.maps.CustomOverlay({
                position: position,
                content: content,
                xAnchor: 0.5,
                yAnchor: 1.0,
                clickable: true,
                zIndex: 3000
            });

            // 클릭 이벤트 (배지 클릭 시 리스트 토글 및 zIndex 상향)
            const badge = content.querySelector('.bundle-badge');
            const list = content.querySelector('.bundle-list') as HTMLElement;

            if (badge && list) {
                badge.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // 다른 열려있는 리스트 닫기 및 zIndex 초기화
                    // (전역 관리가 없으므로 간단히 DOM 조작은 어렵고, 현재 열린 것만 처리)
                    // 완벽하게 하려면 모든 overlay를 순회해야 하나, 여기선 '나를 최상위로' 만으로도 충분할 수 있음.
                    // 더 좋은 방법: customOverlays 배열 활용
                    customOverlays.value.forEach(ov => {
                        if (ov !== overlay) {
                            // ov.getZIndex()는 카카오맵 API에 없을 수 있으므로 안전하게 처리
                            // ov.setZIndex(3000); // 다른 번들은 3000으로 리셋
                        }
                    });
                    
                    // 리스트 토글
                    const isOpening = list.style.display === 'none';
                    document.querySelectorAll('.bundle-list').forEach(el => {
                        (el as HTMLElement).style.display = 'none';
                    });
                    
                    if (isOpening) {
                        list.style.display = 'block';
                        overlay.setZIndex(9999); // [핵심] 리스트 열릴 때 최상위로
                    } else {
                        list.style.display = 'none';
                        overlay.setZIndex(3000); // 닫히면 원래대로
                    }
                });

                // [중요] 리스트 내에서 스크롤 및 드래그 시 지도 이벤트 전파 방지
                const stopMapEvents = (e: Event) => e.stopPropagation();
                list.addEventListener('wheel', stopMapEvents);
                list.addEventListener('mousedown', stopMapEvents);
                list.addEventListener('touchstart', stopMapEvents);
            }

            // 리스트 아이템 클릭 (상세 모달 열기)
            content.querySelectorAll('.bundle-item').forEach(itemEl => {
                itemEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const placeId = (e.target as HTMLElement).dataset.id;
                    if (placeId && sideBarSearchTabRef.value) {
                        sideBarSearchTabRef.value.openDetailModal(placeId);
                        list.style.display = 'none'; // 선택 후 닫기
                        overlay.setZIndex(3000); // 선택 후 zIndex 복구
                    }
                });
            });

            overlay.setMap(mapInstance.value);
            customOverlays.value.push(overlay);
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
  
  // [중요] 검색 폼의 현재 상태 가져오기
  const currentSearchData = sideBarSearchTabRef.value.getCurrentSearchData();
  
  // 유효성 검사: 조건이 하나라도 있는지 확인
  const hasKeyword = currentSearchData?.query && currentSearchData.query.trim() !== '';
  const hasSido = currentSearchData?.sidoCode;
  const hasGugun = currentSearchData?.gugunCode;
  const hasCategory = selectedCategory.value !== null;

  if (!hasKeyword && !hasSido && !hasGugun && !hasCategory) {
      alert("검색어, 지역 또는 카테고리를 하나 이상 선택해주세요.");
      return;
  }

  const bounds = mapInstance.value.getBounds();
  showReSearchButton.value = false; // 버튼 숨기기
  
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

const handleMapHighlight = async (placeId: string, coords: { lat: number, lng: number, level?: number }) => {
  console.log(`[Search] 지도 하이라이트: ${placeId} (${coords.lat}, ${coords.lng})`);
  if (mapInstance.value) {
    const moveLatLon = new (window as any).kakao.maps.LatLng(coords.lat, coords.lng);
    
    // 줌 레벨 정보가 있으면 변경
    if (coords.level) {
        mapInstance.value.setLevel(coords.level);
    }
    
    // panTo는 애니메이션 때문에 bounds 업데이트 타이밍이 꼬일 수 있어 setCenter 사용
    mapInstance.value.setCenter(moveLatLon);

    // 이동한 위치 기준 마커 새로고침 (클러스터 해제 및 상세 마커 표시)
    showReSearchButton.value = false; // 재검색 버튼 숨김
    await fetchMapMarkers();
  }
};

const handleResetRequest = () => {
    selectedCategory.value = null;
    currentFilters.value = {};
    isSearchMode.value = false;
    showReSearchButton.value = false;
    clearMarkers();
    
    // 리셋 시에도 현재 지도 기준 추천(랭킹) 데이터 로드
    if (mapInstance.value && sideBarSearchTabRef.value) {
        sideBarSearchTabRef.value.searchByBounds(mapInstance.value.getBounds(), { keyword: ' ' }, true);
    }
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

    // 지도 타일 로드 완료 시 초기 데이터 로드 (한 번만 실행)
    const onTilesLoaded = () => {
        if (sideBarSearchTabRef.value) {
            console.log('[Search] Initial map load complete. Fetching recommendations...');
            // API 제약(최소 1개 조건)을 우회하기 위해 공백 키워드 전송 시도
            sideBarSearchTabRef.value.searchByBounds(map.getBounds(), { keyword: ' ' }, true);
            
            // 리스너 제거 (최초 1회만 실행)
            (window as any).kakao.maps.event.removeListener(map, 'tilesloaded', onTilesLoaded);
        }
    };

    (window as any).kakao.maps.event.addListener(map, 'tilesloaded', onTilesLoaded);

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

/* 단일 마커 커스텀 스타일 */
.custom-marker-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    position: relative;
    width: fit-content; /* 내용물에 딱 맞게 너비 조절 */
    /* 텍스트가 겹치지 않게 z-index 관리 필요시 설정 */
}

.custom-marker-container:hover {
    z-index: 1000; /* 호버 시 맨 앞으로 */
}

.marker-icon {
    width: 18px; /* 마커 크기 더 축소 */
    height: auto; /* 비율 유지 */
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); /* 그림자 효과 조절 */
    transition: transform 0.2s;
}

.custom-marker-container:hover .marker-icon {
    transform: scale(1.2) translateY(-2px); /* 호버 시 약간 강조 */
}

.marker-title {
    margin-top: 4px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 11px;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 겹친 마커 (Bundle) 스타일 */
.bundle-marker-container {
    position: relative;
    cursor: pointer;
    z-index: 3000; /* 일반 마커보다 위 */
}

.bundle-badge {
    background: #EA4335; /* 빨간색으로 통일 */
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 13px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    border: 2px solid white;
    transition: transform 0.2s;
}

.bundle-badge:hover {
    transform: scale(1.1);
    background: #d33426;
}

.bundle-list {
    position: absolute;
    bottom: 40px; /* 마커 위에 표시 */
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    min-width: 160px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 4000; /* 리스트는 무조건 최상위 */
    padding: 0;
    /* 스크롤바 스타일링 (선택사항) */
    scrollbar-width: thin;
}

.bundle-item {
    padding: 10px 12px;
    font-size: 13px;
    color: #333;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.1s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bundle-item:last-child {
    border-bottom: none;
}

.bundle-item:hover {
    background-color: #f5f5f5;
    color: #EA4335; /* 호버 색상도 빨간색으로 */
    font-weight: 600;
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