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
    </div>
</template>

<script setup lang="ts">

import SideBar from '@/components/SideBar.vue';
import SideBarSearchTab from './SideBarSearchTab.vue';
import SideBarMyTab from './SideBarMyTab.vue';

</script>