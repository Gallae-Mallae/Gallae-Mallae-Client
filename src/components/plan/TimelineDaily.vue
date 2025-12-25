<template>
  <div class="daily-column">
    <div class="column-header">
      <div class="day-number">{{ data.dayNumber }}일차</div>
      <div class="day-date">{{ formatDate(data.date) }}</div>
    </div>

    <!-- drop.prevent: 드롭 시 기본 동작 방지 -->
    <!-- dragover.prevent: 드래그 오버 시 기본 동작 방지 (드롭 허용) -->
    <div class="column-body" @drop.prevent="handleDrop" @dragover.prevent>
      <div class="grid-background">
        <div v-for="n in 32" :key="n" class="grid-cell"></div>
      </div>

      <div class="items-container">
        <ScheduleBlock v-for="item in enrichedScheduleItems" :key="item.blockId" :day-number="item.day" :item="item"
          :unit-height="80" :max-duration="item.maxDuration" @remove="handleRemoveItem" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlanStore } from '@/stores/plan';
import type { DailyScheduleDTO, ScheduleItemDTO, PlaceItemDTO } from '@/types/plan';
import ScheduleBlock from '@/components/plan/ScheduleBlock.vue';
import { minutesToTimeString, timeToMinutes } from '@/utils/time';

const props = defineProps<{ data: DailyScheduleDTO }>();
const planStore = usePlanStore();

const UNIT_HEIGHT = 80;
const START_TIME_OFFSET = 9 * 60;

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return dateStr.split('-').slice(1).join('/');
};

const enrichedScheduleItems = computed(() => {
  if (!planStore.planData) return [];

  const currentDay = planStore.planData.dailySchedules.find(
    (d) => d.dayNumber === props.data.dayNumber
  );

  const items = currentDay ? [...currentDay.items] : [];

  return items.map((item, index) => {
    const nextItem = items[index + 1];
    let maxDuration = 25 * 60; // 25시(익일 01시)까지 허용

    if (nextItem) {
      const currentStart = timeToMinutes(item.startTime);
      const nextStart = timeToMinutes(nextItem.startTime);
      maxDuration = nextStart - currentStart;
    } else {
      // 다음 아이템이 없으면 그리드 끝(25시)까지
      const currentStart = timeToMinutes(item.startTime);
      maxDuration = (25 * 60) - currentStart;
    }

    return {
      ...item,
      maxDuration
    };
  });
});

const handleDrop = (event: DragEvent) => {
  event.stopPropagation();
  if (!event.dataTransfer) return;

  const STEP_MINUTES = 30;
  const PIXELS_PER_MINUTE = UNIT_HEIGHT / 60;
  const STEP_PIXELS = STEP_MINUTES * PIXELS_PER_MINUTE; // 30분당 픽셀

  // 드롭 위치 좌표 계산 및 시간 변환 (30분 단위)
  const dropZone = event.currentTarget as HTMLElement;
  const rect = dropZone.getBoundingClientRect();
  const dropY = event.clientY - rect.top + dropZone.scrollTop;

  const stepCount = Math.floor(dropY / STEP_PIXELS);

  const minutesFromStart = stepCount * STEP_MINUTES;
  const newStartTime = START_TIME_OFFSET + minutesFromStart;

  const startTimeStr = minutesToTimeString(newStartTime);

  // 데이터 타입 확인 (이동인지, 신규 추가인지)
  const rawJson = event.dataTransfer.getData('application/json');
  const rawPlace = event.dataTransfer.getData('PLACE');
  const rawMemo = event.dataTransfer.getData('MEMO');

  // --- [충돌 감지 로직 시작] ---
  let itemDuration = 60; // 신규 아이템 기본 60분
  let movingBlockId: number | null = null;

  if (rawJson) {
    try {
      const dragData = JSON.parse(rawJson);
      if (dragData.type === 'MOVE_ITEM') {
        itemDuration = dragData.duration || 60;
        movingBlockId = dragData.blockId;
      }
    } catch (e) { /* JSON 파싱 에러 무시 */ }
  }

  const targetStartMin = newStartTime;
  const targetEndMin = targetStartMin + itemDuration;

  // 겹치는지 확인
  const hasOverlap = enrichedScheduleItems.value.some(item => {
    // 이동 중인 자기 자신은 제외
    if (movingBlockId && String(item.blockId) === String(movingBlockId)) return false;

    const itemStart = timeToMinutes(item.startTime);
    const itemEnd = timeToMinutes(item.endTime);

    // 두 구간 (StartA, EndA)와 (StartB, EndB)가 겹치는지: StartA < EndB && EndA > StartB
    return itemStart < targetEndMin && itemEnd > targetStartMin;
  });

  if (hasOverlap) {
    return;
  }
  // --- [충돌 감지 로직 끝] ---

  // 1. 기존 일정 이동
  if (rawJson) {
    const dragData = JSON.parse(rawJson);
    if (dragData.type === 'MOVE_ITEM') {
      planStore.updateItemPositionLocal(
        dragData.blockId,
        dragData.fromDay,
        props.data.dayNumber,
        startTimeStr
      );

      planStore.requestMoveScheduleItem({
        blockId: dragData.blockId,
        fromDay: dragData.fromDay,
        toDay: props.data.dayNumber,
        newStartTime: startTimeStr
      });
      return;
    }
  }

  // 2. 신규 장소 추가 (PLACE)
  if (rawPlace) {
    const placeData: PlaceItemDTO = JSON.parse(rawPlace);

    planStore.addScheduleBlockLocal({
      day: props.data.dayNumber,
      startTime: startTimeStr,
      title: placeData.title,
      categoryCode: Number(placeData.category)
    });

    planStore.requestAddScheduleBlock({
      attractionId: Number(placeData.id),
      day: props.data.dayNumber,
      startTime: startTimeStr,
      title: placeData.title
    });
    return;
  }

  if (rawMemo) {
    const memoData = JSON.parse(rawMemo);

    planStore.addScheduleBlockLocal({
      day: props.data.dayNumber,
      startTime: startTimeStr,
      title: memoData.title
    });

    planStore.requestAddScheduleBlock({
      attractionId: null,
      day: props.data.dayNumber,
      startTime: startTimeStr,
      title: memoData.title
    });
    return;
  }
};

const handleRemoveItem = (blockId: number) => {
  planStore.removeItemLocal(blockId);
  planStore.requestRemoveScheduleBlock(blockId);
};
</script>

<style scoped>
.daily-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  border-right: 1px solid #eee;
}

.column-header {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.day-number {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.day-date {
  font-size: 13px;
  color: #888;
  margin-top: 3px;
}

.column-body {
  position: relative;
  flex: 1;
  background-color: white;
}

.grid-cell {
  height: 40px;
  border-bottom: 1px solid #f0f0f0;
}

.items-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  z-index: 2;
}

.items-container>* {
  pointer-events: auto;
}
</style>