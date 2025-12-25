<template>
    <div class="plan-page-layout">

        <SideBar v-if="authStore.isLoggedIn">
            <template #search>
                <SideBarSearchTab />
            </template>
            <template #my>
                <SideBarMyTab />
            </template>
        </SideBar>

        <main class="main-content">
            <div v-if="!authStore.isLoggedIn" class="login-required-overlay">
                <div class="lock-icon">🔒</div>
                <h3>로그인이 필요한 서비스입니다</h3>
                <p>나만의 여행 계획을 세우고<br />친구들과 실시간으로 공유해보세요.</p>
            </div>

            <router-view v-else />
        </main>

    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePlanStore } from '@/stores/plan';
import { stompClient } from '@/utils/websocket';
import { useAuthStore } from '@/stores/auth';

import SideBar from '@/components/sidebar/SideBar.vue';
import SideBarSearchTab from '@/views/sidebar/SideBarSearchTab.vue';
import SideBarMyTab from '@/views/sidebar/SideBarMyTab.vue';

const route = useRoute();
const planStore = usePlanStore();
const authStore = useAuthStore();

let planSubscription: any = null;

const connectWebSocket = (planId: string) => {
    if (!planId || !authStore.isLoggedIn) return;

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
    height: calc(100vh - 58px);
    width: 100vw;
    overflow: hidden;
}

.main-content {
    flex: 1;
    background-color: var(--color-gray-lightest, #f8f8f8);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
}

.full-center {
    justify-content: center;
    align-items: center;
    background-color: white;
}

.login-required-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-top: 25vh;
}

.lock-icon {
    font-size: 80px;
    margin-bottom: 20px;
    line-height: 1;
}

.login-required-overlay h3 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #1a1f27;
}

.login-required-overlay p {
    font-size: 16px;
    color: #666;
    line-height: 1.6;
}
</style>