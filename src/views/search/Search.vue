<template>
  <div class="search-page-layout">
    <SideBar @tab-change="handleTabChange">
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
        <SideBarMyTab ref="sideBarMyTabRef" />
      </template>
    </SideBar>

    <main class="main-content">
      <div id="map"></div>

      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>여행지를 불러오고 있어요...</p>
      </div>

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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SideBar from '@/components/sidebar/SideBar.vue';
import SideBarSearchTab from '@/views/sidebar/SideBarSearchTab.vue';
import SideBarMyTab from '@/views/sidebar/SideBarMyTab.vue';
import type { SearchData } from '@/types/sidebar';
import {
  getMapAttractions,
  type MapAttractionResponse,
  type MapAttractionParams,
} from '@/api/attraction';

const contentTypes = [
  { code: 12, name: '관광지', cssClass: 'ATTRACTION' },
  { code: 14, name: '문화시설', cssClass: 'CULTURE' },
  { code: 15, name: '축제/공연/행사', cssClass: 'FESTIVAL' },
  { code: 25, name: '여행코스', cssClass: 'COURSE' },
  { code: 28, name: '레포츠', cssClass: 'LEPORTS' },
  { code: 32, name: '숙박', cssClass: 'LODGE' },
  { code: 38, name: '쇼핑', cssClass: 'SHOPPING' },
  { code: 39, name: '식당', cssClass: 'FOOD' },
  { code: 40, name: '카페', cssClass: 'CAFE' },
];

const isLoading = ref(true);
const selectedCategory = ref<number | null>(null);
const mapInstance = ref<any>(null);
const showReSearchButton = ref(false);
const isSearchMode = ref(false);
const isPanningToCluster = ref(false);
const markers = ref<any[]>([]);
const customOverlays = ref<any[]>([]);
const currentFilters = ref<{
  sido?: number;
  guguns?: number;
  keyword?: string;
  contenttype?: number;
}>({});

const sideBarSearchTabRef = ref<InstanceType<typeof SideBarSearchTab> | null>(null);
const sideBarMyTabRef = ref<InstanceType<typeof SideBarMyTab> | null>(null);
const activeTab = ref('search');

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  if (tab === 'my') showReSearchButton.value = false;
};

const openGlobalDetailModal = (placeId: string) => {
  if (activeTab.value === 'search' && sideBarSearchTabRef.value) {
    sideBarSearchTabRef.value.openDetailModal(placeId);
  } else if (activeTab.value === 'my' && sideBarMyTabRef.value) {
    sideBarMyTabRef.value.handleAttractionClick(placeId);
  } else if (sideBarSearchTabRef.value) {
    sideBarSearchTabRef.value.openDetailModal(placeId);
  }
};

const clearMarkers = () => {
  if (markers.value.length > 0) {
    markers.value.forEach((marker) => marker.setMap(null));
    markers.value = [];
  }
  if (customOverlays.value.length > 0) {
    customOverlays.value.forEach((overlay) => overlay.setMap(null));
    customOverlays.value = [];
  }
};

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
    contenttype: currentFilters.value.contenttype || undefined,
  };

  try {
    const data = await getMapAttractions(params);
    drawMarkers(data);
  } catch (error) {
    console.error('Failed to fetch map attractions:', error);
  }
};

const drawMarkers = (data: MapAttractionResponse[]) => {
  clearMarkers();
  if (!mapInstance.value) return;
  const serverClusters: MapAttractionResponse[] = [];
  const singlePlaces: MapAttractionResponse[] = [];
  data.forEach((item) => {
    if (item.count > 1) serverClusters.push(item);
    else singlePlaces.push(item);
  });

  serverClusters.forEach((item) => {
    const position = new (window as any).kakao.maps.LatLng(item.latitude, item.longitude);
    const content = document.createElement('div');
    content.className = 'cluster-overlay';
    content.innerHTML = `<div class="cluster-count">${item.count}</div>`;

    content.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!mapInstance.value) return;
      isPanningToCluster.value = true;
      mapInstance.value.setCenter(position);
      const currentLevel = mapInstance.value.getLevel();
      const newLevel = Math.max(1, currentLevel - 2);
      setTimeout(() => {
        mapInstance.value.setLevel(newLevel, { animate: true });
      }, 50);
      setTimeout(() => {
        isPanningToCluster.value = false;
        fetchMapMarkers();
      }, 800);
    });

    const overlay = new (window as any).kakao.maps.CustomOverlay({
      position,
      content,
      xAnchor: 0.5,
      yAnchor: 0.5,
      clickable: false,
    });
    overlay.setMap(mapInstance.value);
    customOverlays.value.push(overlay);
  });

  const groupedPlaces = new Map<string, MapAttractionResponse[]>();
  singlePlaces.forEach((item) => {
    const key = `${item.latitude},${item.longitude}`;
    if (!groupedPlaces.has(key)) groupedPlaces.set(key, []);
    groupedPlaces.get(key)!.push(item);
  });

  groupedPlaces.forEach((items, key) => {
    const firstItem = items[0]!;
    const position = new (window as any).kakao.maps.LatLng(
      firstItem.latitude,
      firstItem.longitude
    );
    if (items.length === 1) {
      const item = items[0]!;
      const content = document.createElement('div');
      content.className = 'custom-marker-container';
      content.innerHTML = `
        <img src="data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2230%22%20height%3D%2242%22%20viewBox%3D%220%200%2030%2042%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15%200C6.71573%200%200%206.71573%200%2015C0%2026.25%2015%2042%2015%2042C15%2042%2030%2026.25%2030%2015C30%206.71573%2023.2843%200%2015%200Z%22%20fill%3D%22%23EA4335%22%2F%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2215%22%20r%3D%226%22%20fill%3D%22%23960F0F%22%2F%3E%3C%2Fsvg%3E" class="marker-icon" alt="marker">
        <span class="marker-title">${item.title}</span>`;
      content.addEventListener('click', (e) => {
        e.stopPropagation();
        const placeId = String((item as any).attractionId || item.attrId);
        if (placeId !== 'undefined' && placeId !== 'NaN') openGlobalDetailModal(placeId);
      });
      const overlay = new (window as any).kakao.maps.CustomOverlay({
        position,
        content,
        xAnchor: 0.5,
        yAnchor: 1.0,
        clickable: true,
      });
      overlay.setMap(mapInstance.value);
      customOverlays.value.push(overlay);
    } else {
      const content = document.createElement('div');
      content.className = 'bundle-marker-container';
      const listItemsHtml = items
        .map(
          (item) =>
            `<div class="bundle-item" data-id="${
              (item as any).attractionId || item.attrId
            }">${item.title}</div>`
        )
        .join('');
      content.innerHTML = `<div class="bundle-badge">+${items.length}</div><div class="bundle-list" style="display: none;">${listItemsHtml}</div>`;
      const overlay = new (window as any).kakao.maps.CustomOverlay({
        position,
        content,
        xAnchor: 0.5,
        yAnchor: 1.0,
        clickable: true,
        zIndex: 3000,
      });

      const badge = content.querySelector('.bundle-badge');
      const list = content.querySelector('.bundle-list') as HTMLElement;
      if (badge && list) {
        badge.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpening = list.style.display === 'none';
          document.querySelectorAll('.bundle-list').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
          if (isOpening) {
            list.style.display = 'block';
            overlay.setZIndex(9999);
          } else {
            list.style.display = 'none';
            overlay.setZIndex(3000);
          }
        });
        const stopMapEvents = (e: Event) => e.stopPropagation();
        list.addEventListener('wheel', stopMapEvents);
        list.addEventListener('mousedown', stopMapEvents);
        list.addEventListener('touchstart', stopMapEvents);
      }
      content.querySelectorAll('.bundle-item').forEach((itemEl) => {
        itemEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const placeId = (e.target as HTMLElement).dataset.id;
          if (placeId) {
            openGlobalDetailModal(placeId);
            list.style.display = 'none';
            overlay.setZIndex(3000);
          }
        });
      });
      overlay.setMap(mapInstance.value);
      customOverlays.value.push(overlay);
    }
  });
};

const handleSidebarSearchRequest = (data: SearchData) => {
  currentFilters.value = {
    sido: data.sidoCode || undefined,
    guguns: data.gugunCode || undefined,
    keyword: data.query || undefined,
    contenttype: selectedCategory.value || undefined,
  };
  const hasActiveFilters = Object.values(currentFilters.value).some(
    (val) => val !== undefined && val !== 0 && val !== ''
  );
  if (hasActiveFilters) {
    isSearchMode.value = true;
    fetchMapMarkers();
    if (mapInstance.value && sideBarSearchTabRef.value)
      sideBarSearchTabRef.value.searchByBounds(mapInstance.value.getBounds(), currentFilters.value);
  } else {
    isSearchMode.value = false;
    clearMarkers();
    showReSearchButton.value = false;
  }
};

const handleReSearchInMap = async () => {
  if (!mapInstance.value || !sideBarSearchTabRef.value) return;
  const currentSearchData = sideBarSearchTabRef.value.getCurrentSearchData();
  const hasKeyword = currentSearchData?.query && currentSearchData.query.trim() !== '';
  const hasSido = currentSearchData?.sidoCode;
  const hasGugun = currentSearchData?.gugunCode;
  const hasCategory = selectedCategory.value !== null;
  if (!hasKeyword && !hasSido && !hasGugun && !hasCategory) {
    alert('검색어, 지역 또는 카테고리를 하나 이상 선택해주세요.');
    return;
  }
  const bounds = mapInstance.value.getBounds();
  showReSearchButton.value = false;
  if (currentSearchData) {
    currentFilters.value = {
      sido: currentSearchData.sidoCode || undefined,
      guguns: currentSearchData.gugunCode || undefined,
      keyword: currentSearchData.query || undefined,
      contenttype: selectedCategory.value || undefined,
    };
  }
  fetchMapMarkers();
  await sideBarSearchTabRef.value.searchByBounds(bounds, currentFilters.value);
};

const onMapInteract = () => {
  if (isPanningToCluster.value) return;
  if ((!activeTab.value || activeTab.value === 'search') && isSearchMode.value)
    showReSearchButton.value = true;
};

const handleSearchStateChange = (hasSearched: boolean) => {
  isSearchMode.value = hasSearched;
  if (!hasSearched) {
    showReSearchButton.value = false;
    clearMarkers();
    currentFilters.value = {};
  } else {
    showReSearchButton.value = false;
  }
};

const handleMapHighlight = async (
  placeId: string,
  coords: { lat: number; lng: number; level?: number }
) => {
  if (mapInstance.value) {
    const moveLatLon = new (window as any).kakao.maps.LatLng(coords.lat, coords.lng);
    if (coords.level) mapInstance.value.setLevel(coords.level);
    mapInstance.value.setCenter(moveLatLon);
    showReSearchButton.value = false;
    await fetchMapMarkers();
  }
};

const handleResetRequest = () => {
  selectedCategory.value = null;
  currentFilters.value = {};
  isSearchMode.value = false;
  showReSearchButton.value = false;
  clearMarkers();
  if (mapInstance.value && sideBarSearchTabRef.value)
    sideBarSearchTabRef.value.searchByBounds(
      mapInstance.value.getBounds(),
      { keyword: ' ' },
      true
    );
};

const handleMarkAction = (placeId: string) => console.log(`[Search] 마크 액션: ${placeId}`);
const toggleCategory = (code: number) => {
  if (selectedCategory.value === code) selectedCategory.value = null;
  else selectedCategory.value = code;
};

onMounted(() => {
  if (!(window as any).kakao || !(window as any).kakao.maps) {
    console.error('Kakao Maps SDK not loaded!');
    return;
  }
  const container = document.getElementById('map');
  const options = { center: new (window as any).kakao.maps.LatLng(37.5665, 126.978), level: 3 };
  try {
    const map = new (window as any).kakao.maps.Map(container, options);
    mapInstance.value = map;
    const onTilesLoaded = () => {
      if (sideBarSearchTabRef.value) {
        sideBarSearchTabRef.value
          .searchByBounds(map.getBounds(), { keyword: ' ' }, true)
          .finally(() => {
            isLoading.value = false;
          });
        (window as any).kakao.maps.event.removeListener(map, 'tilesloaded', onTilesLoaded);
      }
    };
    (window as any).kakao.maps.event.addListener(map, 'tilesloaded', onTilesLoaded);
    map.setMinLevel(1);
    map.setMaxLevel(13);
    (window as any).kakao.maps.event.addListener(map, 'zoom_changed', () => {
      onMapInteract();
    });
    (window as any).kakao.maps.event.addListener(map, 'dragend', onMapInteract);
  } catch (err) {
    console.error('Error initializing map:', err);
    isLoading.value = false;
  }
});
</script>

<style scoped>
@import '@/assets/styles/_category.css';
.search-page-layout {
  display: flex;
  height: calc(100vh - 58px);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}
.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.category-dot.ATTRACTION {
  background-color: var(--category-tag-bg-ATTRACTION);
}
.category-dot.CULTURE {
  background-color: var(--category-tag-bg-CULTURE);
}
.category-dot.FESTIVAL {
  background-color: var(--category-tag-bg-FESTIVAL);
}
.category-dot.COURSE {
  background-color: var(--category-tag-bg-COURSE);
}
.category-dot.LEPORTS {
  background-color: var(--category-tag-bg-LEPORTS);
}
.category-dot.LODGE {
  background-color: var(--category-tag-bg-LODGE);
}
.category-dot.SHOPPING {
  background-color: var(--category-tag-bg-SHOPPING);
}
.category-dot.FOOD {
  background-color: var(--category-tag-bg-FOOD);
}
.category-dot.CAFE {
  background-color: var(--category-tag-bg-CAFE);
}
.category-btn:hover {
  background-color: #f9f9f9;
}
.category-btn.active {
  background-color: #333;
  color: var(--color-white);
  border-color: #333;
}
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
  color: var(--color-primary, #3498db);
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.re-search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  background-color: #fcfcfc;
}
.re-search-icon {
  font-size: 16px;
  line-height: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 5000;
  backdrop-filter: blur(4px);
}
.loading-overlay p {
  margin-top: 16px;
  font-size: 16px;
  color: #555;
  font-weight: 600;
}
.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>