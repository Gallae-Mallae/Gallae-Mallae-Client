<template>
  <div class="side-bar-search-tab">
    
    <SearchForm @search-submit="handleSearch" />

    <div class="search-results-area">
      </div>
    
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import SearchForm from '@/components/SearchForm.vue'; 

interface SearchData {
  sido: string;
  gugun: string;
  query: string;
}

const handleSearch = async (data: SearchData) => {
  if (!data.query.trim()) {
    alert("검색어를 입력해 주세요.");
    return;
  }
};
</script>

<style scoped>
.side-bar-search-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-results-area {
  flex-grow: 1;
  padding: 0 15px 15px;
  overflow-y: auto;
}
</style>