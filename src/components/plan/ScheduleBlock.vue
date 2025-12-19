<template>
    <div class="schedule-block" :style="blockStyle" draggable="true" @dragstart="handleDragStart"
        @click="$emit('select', item)">
        <div class="block-content">
            <div class="memo-icon-container">
                <div class="white-circle">
                    <img src="@/assets/icons/ic_memo.png" alt="메모" />
                </div>
            </div>

            <div class="title-area">
                <span class="block-title">{{ item.title }}</span>
            </div>

            <button class="delete-btn" @click.stop="$emit('remove', item.id)">
                <img src="@/assets/icons/ic_close.png" alt="삭제" />
            </button>
        </div>

        <div class="resize-handle" @mousedown.stop.prevent="initResize"></div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlanStore } from '@/stores/plan';
import type { ScheduleItemDTO } from '@/types/plan';
import { getCategoryVarName } from '@/utils/categoryMap';

const planStore = usePlanStore();

const emit = defineEmits(['click', 'remove']);

const props = defineProps<{
    item: ScheduleItemDTO;
    unitHeight: number; // 1시간당 높이
}>();

const blockStyle = computed(() => {

    const baseColor = props.item.type === 'PLACE' && props.item.categoryCode !== undefined
        ? `var(--category-tag-bg-${getCategoryVarName(props.item.categoryCode)})`
        : 'var(--category-tag-bg-ETC)';
    const bgColor = `color-mix(in srgb, ${baseColor}, transparent 20%)`;

    // 9시 기준으로 시작 위치 계산
    const START_TIME_OFFSET = 9 * 60;
    const relativeStart = props.item.startTime - START_TIME_OFFSET;

    const V_MARGIN = 1; // 상하 1px씩 여백
    const H_MARGIN = 2; // 좌우 2px씩 여백

    // 시작위치 및 높이 계산
    const topPosition = (relativeStart / 60) * props.unitHeight;
    const blockHeight = (props.item.durationTime / 60) * props.unitHeight;

    return {
        backgroundColor: bgColor,
        top: `${topPosition + V_MARGIN}px`,
        height: `${blockHeight - (V_MARGIN * 2) - 1}px`,
        left: `${H_MARGIN}px`,
        width: `calc(100% - ${H_MARGIN * 2}px)`,
        position: 'absolute' as const,
    };
});

const isResizing = ref(false);
const startY = ref(0);
const startDuration = ref(0);

// 리사이징 핸들러
const initResize = (e: MouseEvent) => {
    isResizing.value = true;
    startY.value = e.clientY;
    startDuration.value = props.item.durationTime;

    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResize);
};

const handleResize = (e: MouseEvent) => {
    if (!isResizing.value) return;

    const deltaY = e.clientY - startY.value;
    // px 변화량을 분 단위 변화량으로 변환
    const deltaMinutes = (deltaY / props.unitHeight) * 60;

    // 새로운 지속 시간 계산 (최소 30분)
    let newDuration = Math.max(30, startDuration.value + deltaMinutes);
    newDuration = Math.round(newDuration / 30) * 30;

    planStore.updateItemDuration(props.item.day, props.item.id, newDuration);
};

const stopResize = () => {
    isResizing.value = false;
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = 'default';
};

// 드래그 핸들러
const handleDragStart = (e: DragEvent) => {
    if (isResizing.value) {
        e.preventDefault();
        return;
    }

    if (e.dataTransfer) {
        e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 10, 10);
        e.dataTransfer.effectAllowed = 'move';
    }

    const dragData = {
        type: 'MOVE_ITEM',
        itemId: props.item.id,
        fromDay: props.item.day
    };

    e.dataTransfer?.setData('application/json', JSON.stringify(dragData));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
};
</script>

<style scoped>
.schedule-block {
    display: flex;
    flex-direction: column;
    padding: 0px 10px;
    border-radius: 5px;
    color: rgb(0, 0, 0);
    cursor: pointer;
    z-index: 10;
    overflow: hidden;
    position: absolute;
}

.schedule-block:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.schedule-block:active {
    opacity: 0.5;
}

.block-content {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.memo-icon-container {
    position: absolute;
    left: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.white-circle {
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.white-circle img {
    width: 12px;
    height: 12px;
    object-fit: contain;
}

.title-area {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
}

.block-title {
    font-size: 12.5px;
    font-weight: 550;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
}

.delete-btn {
    position: absolute;
    top: 10px;
    right: 0px;
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    opacity: 0.6;
    display: flex;
    align-items: center;
    z-index: 5;
}

.delete-btn:hover {
    opacity: 1;
}

.delete-btn img {
    width: 12px;
    height: 12px;
}

.resize-handle {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6px;
    cursor: ns-resize;
    z-index: 20;
    background: transparent;
}

.resize-handle:hover {
    background: rgba(0, 0, 0, 0.05);
}
</style>