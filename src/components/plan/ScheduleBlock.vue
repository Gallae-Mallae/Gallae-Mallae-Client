<template>
    <div class="schedule-block" :class="{ 'is-active': isMemoModalOpen }" :style="blockStyle" :draggable="isDraggable"
        @dragstart="handleDragStart">

        <div class="block-content" @click="$emit('click', item)">
            <div class="memo-icon-container" @click.stop="planStore.toggleMemo(item.blockId)">
                <div class="white-circle">
                    <img src="@/assets/icons/ic_memo.png" alt="메모" />
                </div>
            </div>

            <div class="title-area" @click="$emit('click', item)">
                <span class="block-title">{{
                    item.attraction
                        ? item.title
                        : (item.memos?.[0]?.content ?? '')
                }}</span>
            </div>

            <button class="delete-btn" @click.stop="$emit('remove', item.blockId)">
                <img src="@/assets/icons/ic_close.png" alt="삭제" />
            </button>
        </div>

        <div class="memo-modal-wrapper" v-if="isMemoModalOpen" @mousedown.stop @mouseenter="isDraggable = false"
            @mouseleave="isDraggable = true">
            <MemoModal :isVisible="isMemoModalOpen" :title="item.attraction ? item.title : '메모'"
                :memoContents="item.memos" @close="planStore.closeMemo" @add-content="handleAddMemo"
                @remove-content="handleRemoveMemo"
                @reorder-memos="(newList) => planStore.updateMemoOrder(item.day, item.blockId, newList)" />
        </div>

        <div class="resize-handle" @mousedown.stop.prevent="initResize"></div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { usePlanStore } from '@/stores/plan';
import type { ScheduleItemDTO } from '@/types/plan';
import { getCategoryVarName } from '@/utils/categoryMap';
import MemoModal from '@/components/plan/MemoModal.vue';
import { timeToMinutes } from '@/utils/time';

const planStore = usePlanStore();
const isMemoModalOpen = computed(() => planStore.activeMemoId === props.item.blockId);

const emit = defineEmits(['click', 'remove']);

const props = defineProps<{
    item: ScheduleItemDTO;
    unitHeight: number; // 1시간당 높이
}>();

const handleAddMemo = (memoData: { type: 'TEXT' | 'LINK', content: string }) => {
    planStore.addMemoToScheduleItem(props.item.day, props.item.blockId, memoData);
};

const handleRemoveMemo = (index: number) => {
    planStore.removeMemoFromScheduleItem(props.item.day, props.item.blockId, index);
};

const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (isMemoModalOpen.value && !target.closest('.schedule-block')) {
        planStore.closeMemo();
    }
};

onMounted(() => {
    window.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('mousedown', handleClickOutside);
});

const blockStyle = computed(() => {
    const categoryCode = props.item.attraction?.categoryCode ?? props.item.categoryCode;
    const baseColor = categoryCode !== undefined
        ? `var(--category-tag-bg-${getCategoryVarName(categoryCode)})`
        : 'var(--category-tag-bg-ETC)';
    const bgColor = `color-mix(in srgb, ${baseColor}, transparent 20%)`;

    // 문자열 시간을 숫자로 변환
    const startMinutes = timeToMinutes(props.item.startTime);
    const endMinutes = timeToMinutes(props.item.endTime);

    // 9시 기준으로 시작 위치 계산
    const START_TIME_OFFSET = 9 * 60;
    const relativeStart = startMinutes - START_TIME_OFFSET;

    const V_MARGIN = 1; // 상하 1px씩 여백
    const H_MARGIN = 2; // 좌우 2px씩 여백

    // 시작위치 및 높이 계산
    const topPosition = (relativeStart / 60) * props.unitHeight;
    const duration = endMinutes - startMinutes;
    const blockHeight = (duration / 60) * props.unitHeight;

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
    startDuration.value = timeToMinutes(props.item.endTime) - timeToMinutes(props.item.startTime);

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

    planStore.updateItemDuration(props.item.day, props.item.blockId, newDuration);
};

const stopResize = () => {
    isResizing.value = false;
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = 'default';
};

const isDraggable = ref(true);

// 드래그 핸들러
const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement;

    if (target.closest('.memo-modal-wrapper')) {
        return;
    }

    if (!isDraggable.value || isResizing.value) {
        e.preventDefault();
        return;
    }

    if (e.dataTransfer) {
        e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 10, 10);
        e.dataTransfer.effectAllowed = 'move';
    }

    const dragData = {
        type: 'MOVE_ITEM',
        blockId: props.item.blockId,
        fromDay: props.item.day
    };

    e.dataTransfer?.setData('application/json', JSON.stringify(dragData));
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
    position: absolute;
    transition: opacity 0.2s, box-shadow 0.2s;
}

.schedule-block.is-active {
    z-index: 999;
    opacity: 1
}

.schedule-block:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.schedule-block:active:not(.is-active) {
    opacity: 0.5;
}

.schedule-block:active .memo-modal-wrapper {
    display: none;
}

.schedule-block.is-active .memo-modal-wrapper {
    display: block !important;
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
    cursor: pointer;
}

.memo-modal-wrapper {
    margin-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 10000;
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
    display: block;
    width: 100%;

    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    overflow: hidden;
    text-overflow: ellipsis;

    font-size: 12.5px;
    font-weight: 550;
    text-align: center;
    word-break: break-all;
    padding: 0 24px;
    box-sizing: border-box;
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