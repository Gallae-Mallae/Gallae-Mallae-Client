<template>
    <div class="plan-page-layout">

        <SideBar>
            <template #search>
                <SideBarSearchTab />
            </template>
            <template #my>
                <SideBarMyTab />
            </template>
        </SideBar>

        <main class="main-content">
            <router-view />
        </main>

    </div>
</template>

<script setup lang="ts">

import SideBar from '@/components/sidebar/SideBar.vue';
import SideBarSearchTab from '@/views/sidebar/SideBarSearchTab.vue';
import SideBarMyTab from '@/views/sidebar/SideBarMyTab.vue';

</script>

<style scoped>
.plan-page-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

.main-content {
    flex-grow: 1;
    background-color: var(--color-gray-lightest, #f8f8f8);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
</style>