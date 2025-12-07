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
      <div class="map-placeholder">
        <h1>지도 영역</h1>
        <p>검색 결과가 지도에 마커로 표시될 공간입니다.</p>
      </div>
    </main>
    </div>
</template>

<script setup lang="ts">

import SideBar from '@/components/sidebar/SideBar.vue';
import SideBarSearchTab from '@/views/sidebar/SideBarSearchTab.vue';
import SideBarMyTab from '@/views/sidebar/SideBarMyTab.vue';

</script>

<style scoped>
.search-page-layout {
  display: flex;
  min-height: 100vh; 
}

.main-content {
  flex-grow: 1;
  background-color: var(--color-gray-lightest, #f8f8f8);
}

.map-placeholder {
  padding: 50px;
  text-align: center;
  color: var(--color-gray-medium);
}

.my-tab-placeholder {
    padding: 15px;
    color: var(--color-gray-medium);
    text-align: center;
}
</style>