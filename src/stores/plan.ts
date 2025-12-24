import { defineStore } from "pinia";
import { ref } from "vue";
import type { PlanDTO, ScheduleItemDTO, MemoDTO } from "@/types/plan";
import { timeToMinutes, minutesToTimeString } from "@/utils/time";
import { fetchPlanById, fetchDailySchedules } from "@/api/plan";
import {
  createScheduleItem,
  deleteScheduleItem,
  moveScheduleItem,
  resizeScheduleItem,
} from "@/api/schedule";

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

  const handleSocketEvent = async (payload: { event: string; data: any }) => {
    if (!planData.value) return;
    const { event, data } = payload;

    switch (event) {
      case "BLOCK_CREATED":
        await refreshDayData(data.day);
        console.log("일정 생성 발생:", data);
        break;

      case "BLOCK_MOVED":
        if (data.fromDay) await refreshDayData(data.fromDay);
        if (data.toDay) await refreshDayData(data.toDay);

        if (planData.value) {
          planData.value.dailySchedules.forEach(async (day) => {
            await refreshDayData(day.dayNumber);
          });
        }
        console.log("일정 이동 발생:", data);
        break;

      case "BLOCK_DELETED":
        const targetDay =
          data.day ||
          planData.value.dailySchedules.find((d) =>
            d.items.some(
              (item) => Number(item.blockId) === Number(data.blockId)
            )
          )?.dayNumber;

        if (targetDay) {
          await refreshDayData(targetDay);
        } else {
          await loadPlan(Number(planData.value.id));
        }

        console.log("일정 삭제 발생:", data);
        break;

      case "BLOCK_RESIZED":
        await refreshDayData(data.day);
        console.log("일정 리사이징 발생:", data);
        break;
    }
  };

  const refreshDayData = async (dayNumber: number) => {
    if (!planData.value) return;

    try {
      const updatedBlocks = await fetchDailySchedules(
        Number(planData.value.id),
        dayNumber
      );
      const targetDay = planData.value.dailySchedules.find(
        (d) => d.dayNumber === dayNumber
      );

      if (targetDay) {
        targetDay.items = (updatedBlocks as any[])
          .map((block) => {
            const minedType =
              (block.attraction as any)?.contentTypeId || block.categoryCode;

            return {
              ...block,
              categoryCode: minedType ? Number(minedType) : 0,

              startTime: block.startTime.substring(0, 5),
              endTime: block.endTime.substring(0, 5),
              durationTime:
                timeToMinutes(block.endTime) - timeToMinutes(block.startTime),

              attraction: block.attraction
                ? {
                    id: String(block.attraction.attractionId),
                    title: block.attraction.title,
                    address: block.attraction.address,
                    contentTypeId: minedType ? Number(minedType) : 0,
                    latitude: 0,
                    longitude: 0,
                  }
                : null,

              memos: block.memos.map((m: any) => ({
                id: String(m.memoId),
                type: m.type,
                content: m.content,
                displayText: m.content,
              })),
            };
          })
          .sort(
            (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
          );
      }
    } catch (error) {
      console.error(`${dayNumber}일차 갱신 실패:`, error);
    }
  };

  // 1. 일정 추가
  const requestAddScheduleBlock = async (payload: {
    attractionId: number | null;
    day: number;
    startTime: string;
    title: string;
    categoryCode?: number;
  }) => {
    if (!planData.value) return;

    try {
      const { categoryCode, ...apiPayload } = payload;
      await createScheduleItem(String(planData.value.id), apiPayload);
      console.log("일정 생성 요청 성공");
    } catch (error) {
      console.error("일정 생성 요청 실패", error);
    }
  };

  // 2. 일정 리사이징
  const requestResizeScheduleItem = async (
    blockId: number,
    newEndTime: string,
    dayNumber: number
  ) => {
    if (!planData.value) return;

    try {
      const formattedEndTime =
        newEndTime.length === 5 ? `${newEndTime}:00` : newEndTime;

      const requestBody = {
        newEndTime: formattedEndTime,
      };

      await resizeScheduleItem(String(blockId), requestBody);

      console.log("리사이징 요청 성공");
    } catch (error) {
      console.error("리사이징 요청 실패", error);
      await refreshDayData(dayNumber);
    }
  };

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

    if (item) {
      const startMin = timeToMinutes(item.startTime);
      item.endTime = minutesToTimeString(startMin + newDuration);
    }
  };

  // 3. 일정 이동
  const requestMoveScheduleItem = async (payload: {
    blockId: number;
    fromDay: number;
    toDay: number;
    newStartTime: string;
  }) => {
    if (!planData.value) return;

    try {
      const startTimeWithSeconds =
        payload.newStartTime.length === 5
          ? `${payload.newStartTime}:00`
          : payload.newStartTime;

      const requestBody = {
        newDay: payload.toDay,
        newStartTime: startTimeWithSeconds,
      };

      await moveScheduleItem(String(payload.blockId), requestBody);
      console.log("이동 요청 성공");
    } catch (error) {
      console.error("이동 요청 실패", error);
      await loadPlan(Number(planData.value.id));
    }
  };

  // 4. 일정 삭제
  const requestRemoveScheduleBlock = async (blockId: number) => {
    try {
      await deleteScheduleItem(String(blockId));
      console.log(`삭제 요청 성공`);
    } catch (error) {
      console.error("삭제 요청 실패", error);
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
    handleSocketEvent,
    refreshDayData,

    requestAddScheduleBlock,
    requestRemoveScheduleBlock,
    requestMoveScheduleItem,
    requestResizeScheduleItem,
    updateItemDuration,

    toggleMemo,
    closeMemo,
    addMemoToScheduleItem,
    removeMemoFromScheduleItem,
    updateMemoOrder,
  };
});
