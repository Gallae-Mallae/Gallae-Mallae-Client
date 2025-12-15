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
            <PlanCardList class="plan-list-area" />
        </main>

    </div>
</template>

<script setup lang="ts">

import SideBar from '@/components/sidebar/SideBar.vue';
import SideBarSearchTab from '@/views/sidebar/SideBarSearchTab.vue';
import SideBarMyTab from '@/views/sidebar/SideBarMyTab.vue';
import PlanCardList from '@/views/plan/PlanCardList.vue';


</script>

<style scoped>
.plan-page-layout {
    display: flex;
    min-height: 100vh;
}

.main-content {
    flex-grow: 1;
    background-color: var(--color-gray-lightest, #f8f8f8);
}

.plan-list-area {
    width: 100%;
}
</style>