<template>
  <aside class="app-sidebar">
    <div class="sidebar-tabs">
      <button 
        :class="['tab-button', { active: activeTab === 'search' }]" 
        @click="setTab('search')"
      >
        {{ strings.TAB_SEARCH }}
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'my' }]" 
        @click="setTab('my')"
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

const activeTab = ref<'search' | 'my'>('search');
const emit = defineEmits(['tab-change']);

const setTab = (tab: 'search' | 'my') => {
    activeTab.value = tab;
    emit('tab-change', tab);
};
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
  z-index: 100; /* 지도를 가리지 않으면서도 UI 요소가 위에 오도록 설정 */
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-light);
  background-color: white;
}

.tab-button {
  flex-grow: 1;
  padding: 14px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-gray-medium, #999);
  transition: all 0.2s;
  border-bottom: 3px solid transparent; 
}

.tab-button.active {
  color: var(--color-primary-dark, #333);
  font-weight: 700;
  border-bottom: 3px solid var(--color-primary-dark, #333); 
}

.tab-content {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 자식 요소의 스크롤 작동을 위해 필요 */
}
</style>
