<template>
  <aside class="app-sidebar">
    <div class="sidebar-tabs">
      <button 
        :class="['tab-button', { active: activeTab === 'search' }]" 
        @click="activeTab = 'search'"
      >
        {{ strings.TAB_SEARCH }}
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'my' }]" 
        @click="activeTab = 'my'"
      >
        {{ strings.TAB_MY }}
      </button>
    </div>

    <div class="tab-content">
      <slot :name="activeTab"></slot>
    </div>
  </aside>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import strings from '@/assets/values/strings.sidebar.json';

// 탭 상태 관리 (기본값 'search')
const activeTab = ref<'search' | 'my'>('search');

</script>

<style scoped>
.app-sidebar {
  width: 380px;
  min-height: 100vh;
  background-color: var(--color-white);
  border-right: 1px solid var(--color-gray-light, #eee);
  box-shadow: var(--shadow-default);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-light);
}

.tab-button {
  flex-grow: 1;
  padding: 8px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-body, 1rem);
  font-weight: 500;
  color: var(--color-gray-medium);
  transition: all 0.2s;
  
  /* 비활성화된 탭의 하단 바 (높이유지) */
  border-bottom: 3px solid transparent; 
}

.tab-button:first-child { margin-left: 0; }
.tab-button:last-child { margin-right: 0; }


.tab-button.active {
  color: var(--color-primary-dark);
  font-weight: 700;

  /* 활성화된 탭의 하단 바 */
  border-bottom: 3px solid var(--color-primary-dark); 
}

.tab-content {
  flex-grow: 1;
  /* 스크롤바 */
  overflow-y: auto;
  height: 0;
}

</style>