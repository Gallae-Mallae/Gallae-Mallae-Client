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
        <ScheduleBlock v-for="item in data.items" :key="item.id" :item="item" :unit-height="80"
          @remove="handleRemoveItem" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { usePlanStore } from '@/stores/plan';
import type { DailyScheduleDTO, ScheduleItemDTO, PlaceItemDTO } from '@/types/plan';
import ScheduleBlock from '@/components/plan/ScheduleBlock.vue';

const props = defineProps<{ data: DailyScheduleDTO }>();
const planStore = usePlanStore();

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return dateStr.split('-').slice(1).join('/');
};

const UNIT_HEIGHT = 80;
const START_TIME_OFFSET = 9 * 60;

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

  // 데이터 타입 확인 (이동인지, 신규 추가인지)
  const rawJson = event.dataTransfer.getData('application/json');
  const rawPlace = event.dataTransfer.getData('PLACE');

  // 1. 기존 일정 이동
  if (rawJson) {
    const dragData = JSON.parse(rawJson);
    if (dragData.type === 'MOVE_ITEM') {
      planStore.moveScheduleItem({
        itemId: dragData.itemId,
        fromDay: dragData.fromDay,
        toDay: props.data.dayNumber,
        newStartTime: newStartTime
      });
      return;
    }
  }

  // 2. 신규 장소 추가
  if (rawPlace) {
    const placeData: PlaceItemDTO = JSON.parse(rawPlace);
    const newItem: Omit<ScheduleItemDTO, 'id'> = {
      type: 'PLACE',
      day: props.data.dayNumber,
      startTime: newStartTime,
      endTime: newStartTime + 30, // 기본 30분
      durationTime: 30,
      title: placeData.title,
      categoryCode: placeData.categoryCode,
      category: placeData.category,
      placeId: placeData.id
    };
    planStore.addScheduleItem(props.data.dayNumber, newItem);
  }
};

const handleRemoveItem = (itemId: string) => {
  planStore.removeScheduleItem(props.data.dayNumber, itemId);
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
  pointer-events: none;
}

.items-container>* {
  pointer-events: auto;
}
</style>