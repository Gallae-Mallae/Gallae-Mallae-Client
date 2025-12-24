<template>
  <aside class="app-sidebar" :class="{ 'is-closed': !isOpen }">
    <div class="sidebar-container">
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
    </div>

    <button class="toggle-button" @click="isOpen = !isOpen">
      <span class="arrow-icon">{{ isOpen ? '◀' : '▶' }}</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import strings from '@/assets/values/strings.sidebar.json';

const activeTab = ref<'search' | 'my'>('search');
const isOpen = ref(true); // test2: 사이드바 열림 상태 관리

// feature/#16: 탭 변경 이벤트를 정의
const emit = defineEmits(['tab-change']);

// feature/#16: 탭 변경 시 상태 변경 뿐만 아니라 부모에게 알림(emit)
const setTab = (tab: 'search' | 'my') => {
    activeTab.value = tab;
    emit('tab-change', tab);
};
</script>

<style scoped>
/* test2의 스타일(애니메이션, 토글 기능 등)을 전적으로 채택 */
.app-sidebar {
  position: relative;
  width: 380px;
  height: 100%;
  background-color: var(--color-white);
  border-right: 1px solid var(--color-gray-light, #eee);
  box-shadow: var(--shadow-default);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: visible;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.app-sidebar.is-closed {
  width: 0;
  border-right: none;
  box-shadow: none;
}

.sidebar-container {
  width: 380px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  overflow: hidden;
}

.app-sidebar.is-closed .sidebar-container {
  opacity: 0;
  transform: translateX(-100%);
}

.toggle-button {
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  width: 20px;
  height: 40px;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-light);
  border-left: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 101;
  transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 1px;
}

.app-sidebar.is-closed .toggle-button {
  border-left: 1px solid var(--color-gray-light);
}

.arrow-icon {
  font-size: 11px;
  color: var(--color-gray-medium);
  user-select: none;
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

.tab-button:first-child {
  margin-left: 0;
}

.tab-button:last-child {
  margin-right: 0;
}

.tab-button.active {
  color: var(--color-primary-dark, #333);
  font-weight: 700;
  border-bottom: 3px solid var(--color-primary-dark);
}

.tab-content {
  flex-grow: 1;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>