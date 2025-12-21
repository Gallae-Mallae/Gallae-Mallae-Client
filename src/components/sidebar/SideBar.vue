<template>
  <aside class="app-sidebar" :class="{ 'is-closed': !isOpen }">
    <div class="sidebar-container">
      <div class="sidebar-tabs">
        <button :class="['tab-button', { active: activeTab === 'search' }]" @click="activeTab = 'search'">
          {{ strings.TAB_SEARCH }}
        </button>
        <button :class="['tab-button', { active: activeTab === 'my' }]" @click="activeTab = 'my'">
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

// 탭 상태 관리 (기본값 'search')
const activeTab = ref<'search' | 'my'>('search');

const isOpen = ref(true);

</script>

<style scoped>
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

.tab-button:first-child {
  margin-left: 0;
}

.tab-button:last-child {
  margin-right: 0;
}

.tab-button.active {
  color: var(--color-primary-dark);
  font-weight: 700;

  /* 활성화된 탭의 하단 바 */
  border-bottom: 3px solid var(--color-primary-dark);
}

.tab-content {
  flex-grow: 1;
  overflow-y: auto;
  height: 0;
}
</style>