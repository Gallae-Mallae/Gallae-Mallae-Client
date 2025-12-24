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

        // [구독 1] 일정 블록 생성 채널
        planSubscription = stompClient.subscribe(`/topic/plans/${planId}`, (message) => {
            console.log('일정 생성 이벤트 수신');
            const payload = JSON.parse(message.body);
            planStore.handleSocketEvent(payload);
        });

        // 추후 이동(MOVE), 삭제(DELETE) 채널도 여기에 subscribe를 추가하면 됩니다.
    };

    if (!stompClient.active) {
        stompClient.activate();
    } else if (stompClient.connected) {
        stompClient.onConnect(null as any);
    }

    // STOMP 에러 핸들링
    // stompClient.onStompError = (frame) => {
    //     console.error('STOMP Protocol Error:', frame.headers['message']);
    // };

    // 웹소켓 활성화
    // if (!stompClient.active) {
    //     stompClient.activate();
    // }
};

onMounted(() => {
    // URL의 planId를 사용하여 연결
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
        console.log('웹소켓 연결 해제');
    }
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