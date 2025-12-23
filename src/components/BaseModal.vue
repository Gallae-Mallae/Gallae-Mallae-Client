<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container" :style="modalStyle">
            <header class="modal-header">
                <button class="close-button" @click="closeModal">
                    <img src="@/assets/icons/ic_close.png" alt="닫기" class="close-icon" />
                </button>
            </header>

            <!-- 모달의 주요 내용을 넣을 부분 (로그인 버튼, 지도 등) -->
            <div class="modal-content">
                <slot></slot>
            </div>

            <!-- 필요 시 사용할 푸터 -->
            <footer v-if="$slots.footer" class="modal-footer">
                <slot name="footer"></slot>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';

const props = defineProps({
    isVisible: {
        type: Boolean,
        required: true,
    },

    // 기본 너비
    width: {
        type: String,
        default: '400px',
    },
});

const emit = defineEmits(['close']);

const closeModal = () => {
    emit('close');
};

// 동적 스타일 (너비 적용)
const modalStyle = computed(() => ({
    width: props.width,
}));

</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 18px;
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: flex-end;
    padding: 0;
    position: absolute;
    top: 10px;
    right: 10px;
}

.close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
}

.close-icon {
    width: 20px;
    height: 20px;
    transition: opacity 0.2s;
}

.close-button:hover .close-icon {
    opacity: 0.7;
}

.modal-content {
    padding-top: 24px;
    padding-bottom: 12px;
}
</style>