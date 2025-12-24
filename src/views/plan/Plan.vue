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
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePlanStore } from '@/stores/plan';
import { stompClient } from '@/utils/websocket';

import SideBar from '@/components/sidebar/SideBar.vue';
import SideBarSearchTab from '@/views/sidebar/SideBarSearchTab.vue';
import SideBarMyTab from '@/views/sidebar/SideBarMyTab.vue';

const route = useRoute();
const planStore = usePlanStore();

let planSubscription: any = null;

const connectWebSocket = (planId: string) => {
    if (!planId) return;

    if (planSubscription) {
        planSubscription.unsubscribe();
        planSubscription = null;
        console.log("기존 구독 해제");
    }

    // 연결 성공 시 실행되는 로직
    stompClient.onConnect = () => {
        console.log(`실시간 통신 연결 성공`);

        // 통합 채널 구독
        planSubscription = stompClient.subscribe(`/topic/plans/${planId}`, (message) => {
            const payload = JSON.parse(message.body);
            console.log('실시간 이벤트 수신:', payload.event, payload.data);

            planStore.handleSocketEvent(payload);
        });
    }

    if (!stompClient.active) {
        stompClient.activate();
    } else if (stompClient.connected) {
        // 이미 연결된 상태에서 planId만 바뀐 경우 (재구독)
        stompClient.onConnect(null as any);
    }
};

// URL의 planId를 사용하여 연결
onMounted(() => {
    const planId = route.params.id as string;
    connectWebSocket(planId);
});

// 다른 플랜 페이지로 이동하면 재연결
watch(() => route.params.id, (newId) => {
    if (newId && typeof newId === 'string') {
        console.log('플랜 변경 감지, 웹소켓 재연결 시도');
        stompClient.deactivate();
        connectWebSocket(newId);
    }
});

onUnmounted(() => {
    if (planSubscription) {
        planSubscription.unsubscribe();
    }
    stompClient.deactivate();
});

</script>

<style scoped>
.plan-page-layout {
    display: flex;
    height: 100%;
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