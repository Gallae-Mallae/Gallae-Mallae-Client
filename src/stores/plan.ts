import { defineStore } from "pinia";
import { ref } from "vue";
import type { PlanDTO, ScheduleItemDTO } from "@/types/plan";

export const usePlanStore = defineStore("plan", () => {
  const planData = ref<PlanDTO | null>(null);

  // 초기 데이터 설정 (PlanTimetable의 onMounted에서 호출)
  const setPlanData = (data: PlanDTO) => {
    planData.value = data;
  };

  // 1. 드래그 앤 드롭으로 일정 추가
  const addScheduleItem = (
    dayNumber: number,
    newItem: Omit<ScheduleItemDTO, "id"> // "id"는 제외하고 받음
  ) => {
    if (!planData.value) return;

    const targetDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === dayNumber
    );
    if (!targetDay) return;

    const isOverlapping = targetDay.items.some((item) => {
      return (
        item.startTime < newItem.endTime && newItem.startTime < item.endTime
      );
    });

    if (isOverlapping) {
      return;
    }

    const finalItem: ScheduleItemDTO = {
      ...newItem,
      id: `block_${Date.now()}`, // 임시 id 생성
    } as ScheduleItemDTO;

    targetDay.items.push(finalItem);
  };

  // 2. 일정 리사이징
  const updateItemDuration = (
    dayNumber: number,
    itemId: string,
    newDuration: number
  ) => {
    if (!planData.value) return;

    const targetDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === dayNumber
    );
    if (!targetDay) return;

    const item = targetDay.items.find((i) => i.id === itemId);
    if (!item) return;

    // 다음 일정 찾기
    const nextItem = targetDay.items
      .filter((i) => i.id !== itemId && i.startTime >= item.startTime)
      .sort((a, b) => a.startTime - b.startTime)[0];

    let finalDuration = newDuration;

    // 다음 일정과 겹치지 않게 조정
    if (nextItem && item.startTime + newDuration > nextItem.startTime) {
      finalDuration = nextItem.startTime - item.startTime;
    }

    item.durationTime = finalDuration;
    item.endTime = item.startTime + finalDuration;
  };

  // 3. 일정 이동
  const moveScheduleItem = (payload: {
    itemId: string;
    fromDay: number;
    toDay: number;
    newStartTime: number;
  }) => {
    if (!planData.value) return;

    //이동 전 데이터
    const fromDayData = planData.value.dailySchedules.find(
      (d) => d.dayNumber === payload.fromDay
    );
    if (!fromDayData) return;

    const item = fromDayData.items.find((i) => i.id === payload.itemId);
    if (!item) return;

    // 이동 후 데이터
    const toDayData = planData.value.dailySchedules.find(
      (d) => d.dayNumber === payload.toDay
    );
    if (!toDayData) return;

    const newEndTime = payload.newStartTime + item.durationTime;

    const isOverlapping = toDayData.items.some((existingItem) => {
      if (existingItem.id === payload.itemId) return false;

      return (
        payload.newStartTime < existingItem.endTime &&
        existingItem.startTime < newEndTime
      );
    });

    if (isOverlapping) {
      return;
    }

    fromDayData.items = fromDayData.items.filter(
      (i) => i.id !== payload.itemId
    );

    item.day = payload.toDay;
    item.startTime = payload.newStartTime;
    item.endTime = newEndTime;

    toDayData.items.push(item);
  };

  // 4. 일정 삭제
  const removeScheduleItem = (dayNumber: number, itemId: string) => {
    if (!planData.value) return;

    const targetDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === dayNumber
    );

    if (targetDay) {
      targetDay.items = targetDay.items.filter((i) => i.id !== itemId);
    }
  };

  return {
    planData,
    setPlanData,
    addScheduleItem,
    updateItemDuration,
    moveScheduleItem,
    removeScheduleItem,
  };
});
