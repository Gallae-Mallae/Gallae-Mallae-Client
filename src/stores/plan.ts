import { defineStore } from "pinia";
import { ref } from "vue";
import type { PlanDTO, ScheduleItemDTO, MemoDTO } from "@/types/plan";
import { timeToMinutes, minutesToTimeString } from "@/utils/time";
import { fetchPlanById } from "@/api/plan";
import { createScheduleItem } from "@/api/schedule";
import { stompClient } from "@/utils/websocket";

export const usePlanStore = defineStore("plan", () => {
  const planData = ref<PlanDTO | null>(null);
  const activeMemoId = ref<number | null>(null);
  const isLoading = ref(false);

  // 초기 데이터 설정 (PlanTimetable의 onMounted에서 호출)
  const setPlanData = (data: PlanDTO) => {
    planData.value = data;
  };

  const loadPlan = async (planId: number) => {
    isLoading.value = true;
    try {
      planData.value = null;
      const data = await fetchPlanById(planId);
      planData.value = data;
    } catch (error) {
      console.error("일정 로드 실패", error);
    } finally {
      isLoading.value = false;
    }
  };

  const handleSocketEvent = (payload: { event: string; data: any }) => {
    if (!planData.value) return;
    const { event, data } = payload;

    switch (event) {
      case "BLOCK_CREATED":
        applyCreatedBlock(data);
        console.log("일정 생성 발생:", data);
        break;
      case "BLOCK_MOVED":
        console.log("일정 이동 발생:", data);
        break;
      case "BLOCK_DELETED":
        console.log("일정 삭제 발생:", data);
        break;
      case "BLOCK_RESIZED":
        console.log("일정 리사이징 발생:", data);
        break;
    }
  };

  // 1. 드래그 앤 드롭으로 일정 추가
  const requestAddScheduleBlock = async (payload: {
    attractionId: number | null;
    day: number;
    startTime: string;
    title: string;
  }) => {
    if (!planData.value) return;

    try {
      await createScheduleItem(String(planData.value.id), payload);
      console.log("일정 생성 요청 성공");
    } catch (error) {
      console.error("일정 생성 요청 실패:", error);
    }
  };

  const applyCreatedBlock = (data: any) => {
    const targetDay = planData.value?.dailySchedules.find(
      (d) => d.dayNumber === data.day
    );
    if (!targetDay) return;

    if (targetDay.items.some((i) => String(i.blockId) === String(data.blockId)))
      return;

    const newItem: ScheduleItemDTO = {
      blockId: data.blockId,
      day: data.day,
      title: data.title,
      startTime: data.startTime.substring(0, 5),
      endTime: data.endTime.substring(0, 5),
      durationTime: timeToMinutes(data.endTime) - timeToMinutes(data.startTime),
      memos: data.memos || [],
      attraction: data.attraction || null,
      categoryCode: data.attraction?.categoryCode,
    };

    targetDay.items.push(newItem);
    targetDay.items.sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
  };

  // 2. 일정 리사이징
  const updateItemDuration = (
    dayNumber: number,
    blockId: number,
    newDuration: number
  ) => {
    if (!planData.value) return;

    const targetDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === dayNumber
    );
    const item = targetDay?.items.find((i) => i.blockId === blockId);
    if (!item) return;

    const startMin = timeToMinutes(item.startTime);
    let finalEndMin = startMin + newDuration;

    // 다음 일정과 겹치지 않게 조정
    const nextItem = targetDay!.items
      .filter(
        (i) => i.blockId !== blockId && timeToMinutes(i.startTime) >= startMin
      )
      .sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      )[0];

    if (nextItem) {
      const nextStartMin = timeToMinutes(nextItem.startTime);
      if (finalEndMin > nextStartMin) {
        finalEndMin = nextStartMin;
      }
    }

    item.endTime = minutesToTimeString(finalEndMin);

    // durationTime 필드가 DTO에 있다면 업데이트
    if (item.durationTime !== undefined) {
      item.durationTime = finalEndMin - startMin;
    }
  };

  // 3. 일정 이동
  const moveScheduleItem = (payload: {
    blockId: number;
    fromDay: number;
    toDay: number;
    newStartTime: string;
  }) => {
    if (!planData.value) return;

    //이동 전 데이터
    const fromDayData = planData.value.dailySchedules.find(
      (d) => d.dayNumber === payload.fromDay
    );
    const item = fromDayData?.items.find((i) => i.blockId === payload.blockId);
    if (!item || !fromDayData) return;

    // 이동 후 데이터
    const toDayData = planData.value.dailySchedules.find(
      (d) => d.dayNumber === payload.toDay
    );
    if (!toDayData) return;

    const currentDuration =
      timeToMinutes(item.endTime) - timeToMinutes(item.startTime);
    const newStartMin = timeToMinutes(payload.newStartTime);
    const newEndMin = newStartMin + currentDuration;
    const newEndTimeStr = minutesToTimeString(newEndMin);

    const isOverlapping = toDayData.items.some((existingItem) => {
      if (existingItem.blockId === payload.blockId) return false;
      const exStart = timeToMinutes(existingItem.startTime);
      const exEnd = timeToMinutes(existingItem.endTime);
      return newStartMin < exEnd && exStart < newEndMin;
    });

    if (isOverlapping) {
      return;
    }

    fromDayData.items = fromDayData.items.filter(
      (i) => i.blockId !== payload.blockId
    );

    item.day = payload.toDay;
    item.startTime = payload.newStartTime;
    item.endTime = newEndTimeStr;

    toDayData.items.push(item);
  };

  // 4. 일정 삭제
  const removeScheduleItem = (dayNumber: number, blockId: number) => {
    const targetDay = planData.value?.dailySchedules.find(
      (d) => d.dayNumber === dayNumber
    );
    if (targetDay) {
      targetDay.items = targetDay.items.filter((i) => i.blockId !== blockId);
    }
  };

  // 메모 관련 로직
  const toggleMemo = (blockId: number | null) => {
    activeMemoId.value = activeMemoId.value === blockId ? null : blockId;
  };

  const closeMemo = () => {
    activeMemoId.value = null;
  };

  const addMemoToScheduleItem = (
    dayNumber: number,
    blockId: number,
    memoData: { type: "TEXT" | "LINK"; content: string }
  ) => {
    const targetDay = planData.value?.dailySchedules.find(
      (d) => d.dayNumber === dayNumber
    );
    const item = targetDay?.items.find((i) => i.blockId === blockId);

    if (item) {
      const newMemo: MemoDTO = {
        id: `memo_${Date.now()}`,
        type: memoData.type,
        content: memoData.content,
        displayText: memoData.content,
      };
      item.memos.push(newMemo);
    }
  };

  const removeMemoFromScheduleItem = (
    dayNumber: number,
    blockId: number,
    memoIndex: number
  ) => {
    if (!planData.value) return;

    const targetDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === dayNumber
    );

    const item = targetDay?.items.find((i) => i.blockId === blockId);

    if (item && item.memos[memoIndex]) {
      item.memos.splice(memoIndex, 1);
    }
  };

  const updateMemoOrder = (
    day: number,
    blockId: number,
    newList: MemoDTO[]
  ) => {
    if (!planData.value) return;

    const targetDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === day
    );

    if (targetDay) {
      const scheduleItem = targetDay.items.find((i) => i.blockId === blockId);

      if (scheduleItem) {
        scheduleItem.memos = [...newList];
      }
    }
  };

  return {
    planData,
    activeMemoId,
    isLoading,
    loadPlan,
    setPlanData,

    requestAddScheduleBlock,
    handleSocketEvent,

    updateItemDuration,
    moveScheduleItem,
    removeScheduleItem,
    toggleMemo,
    closeMemo,
    addMemoToScheduleItem,
    removeMemoFromScheduleItem,
    updateMemoOrder,
  };
});
