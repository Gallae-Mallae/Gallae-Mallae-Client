import { defineStore } from "pinia";
import { ref } from "vue";
import type { PlanDTO, MemoDTO } from "@/types/plan";
import { timeToMinutes, minutesToTimeString } from "@/utils/time";
import { fetchPlanById, fetchDailySchedules } from "@/api/plan";
import {
  createScheduleItem,
  deleteScheduleItem,
  moveScheduleItem,
  resizeScheduleItem,
} from "@/api/schedule";

import { createMemo, deleteMemo, fetchMemos } from "@/api/memo";
import type { MemoRequest } from "@/api/memo";

import { updatePlan, deletePlan } from "@/api/plan";

export const usePlanStore = defineStore("plan", () => {
  const planData = ref<PlanDTO | null>(null);
  const activeMemoId = ref<number | null>(null);
  const allPlans = ref<PlanDTO[]>([]);
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
        await refreshDayData(data.day);
        console.log("일정 이동 발생:", data);
        break;

      case "BLOCK_DELETED":
        await refreshDayData(data.day);
        console.log("일정 삭제 발생:", data);
        break;

      case "BLOCK_RESIZED":
        await refreshDayData(data.day);
        console.log("일정 리사이징 발생:", data);
        break;

      case "MEMO_CREATED": {
        const targetDay = planData.value.dailySchedules.find((d) =>
          d.items.some((item) => Number(item.blockId) === Number(data.blockId))
        );
        if (targetDay) {
          await refreshDayData(targetDay.dayNumber);
        }
        console.log("메모 생성 발생:", data);
        break;
      }

      case "MEMO_DELETED": {
        const targetDay = planData.value.dailySchedules.find((d) =>
          d.items.some((item) => Number(item.blockId) === Number(data.blockId))
        );
        if (targetDay) {
          await refreshDayData(targetDay.dayNumber);
        }
        break;
      }

      // 💡 여행 계획 수정 이벤트 처리
      case "PLAN_UPDATED": {
        // 현재 보고 있는 플랜이 수정된 경우 데이터 동기화
        if (Number(planData.value.id) === Number(data.planId)) {
          planData.value = {
            ...planData.value,
            title: data.title,
            startDate: data.startDate,
            endDate: data.endDate,
            planImageUrl: data.planImageUrl,
          };
        }
        // 목록(allPlans)에서도 해당 플랜을 찾아 업데이트
        const planInList = allPlans.value.find(
          (p) => Number(p.id) === Number(data.planId)
        );
        if (planInList) {
          planInList.title = data.title;
          planInList.startDate = data.startDate;
          planInList.endDate = data.endDate;
          planInList.planImageUrl = data.planImageUrl;
        }
        console.log("여행 계획 수정 발생:", data);
        break;
      }

      // 💡 여행 계획 삭제 이벤트 처리
      case "PLAN_DELETED": {
        // 현재 보고 있는 플랜이 삭제된 경우 처리 (예: 홈으로 이동은 컴포넌트에서 판단)
        if (Number(planData.value.id) === Number(data)) {
          console.log("현재 보고 있는 플랜이 삭제되었습니다.");
          planData.value = null;
        }
        // 목록에서 제거
        allPlans.value = allPlans.value.filter(
          (p) => Number(p.id) !== Number(data)
        );
        console.log("여행 계획 삭제 발생. 삭제된 ID:", data);
        break;
      }
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
                linkUrl: m.linkUrl,
                displayText:
                  m.type === "LINK" ? m.linkUrl || m.content : m.content,
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

  const addScheduleBlockLocal = (payload: {
    day: number;
    startTime: string;
    title: string;
    isTemp?: boolean;
    categoryCode?: number;
  }) => {
    if (!planData.value) return;

    const targetDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === payload.day
    );

    if (targetDay) {
      const tempItem: any = {
        blockId: Date.now(),
        title: payload.title,
        startTime: payload.startTime.substring(0, 5),
        endTime: minutesToTimeString(timeToMinutes(payload.startTime) + 60),
        durationTime: 60,
        categoryCode: payload.categoryCode || 0,
        attraction: null,
        memos: [],
        isTemp: true,
      };

      targetDay.items.push(tempItem);
      targetDay.items.sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
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

  const updateItemPositionLocal = (
    blockId: number,
    fromDay: number,
    toDay: number,
    newStartTime: string
  ) => {
    if (!planData.value) return;

    const sourceDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === fromDay
    );
    if (!sourceDay) return;

    const itemIndex = sourceDay.items.findIndex((i) => i.blockId === blockId);

    if (itemIndex !== -1) {
      const removedItems = sourceDay.items.splice(itemIndex, 1);
      const item = removedItems[0];

      if (item) {
        const originalDuration = item.durationTime || 60;

        item.startTime = newStartTime.substring(0, 5);

        const newStartMin = timeToMinutes(item.startTime);
        item.endTime = minutesToTimeString(newStartMin + originalDuration);
        item.durationTime = originalDuration;

        const targetDay = planData.value.dailySchedules.find(
          (d) => d.dayNumber === toDay
        );
        if (targetDay) {
          targetDay.items.push(item);
          targetDay.items.sort(
            (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
          );
        }
      }
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

  const removeItemLocal = (blockId: number) => {
    if (!planData.value) return;

    planData.value.dailySchedules.forEach((day) => {
      day.items = day.items.filter((item) => item.blockId !== blockId);
    });
  };

  const toggleMemo = (blockId: number | null) => {
    activeMemoId.value = activeMemoId.value === blockId ? null : blockId;
  };

  const closeMemo = () => {
    activeMemoId.value = null;
  };

  // 1. 메모 추가
  const requestAddMemo = async (
    blockId: number,
    dayNumber: number,
    payload: { type: "TEXT" | "LINK"; content: string }
  ) => {
    if (!planData.value) return;

    addMemoLocal(dayNumber, blockId, payload);

    try {
      const requestBody: MemoRequest = {
        type: payload.type,
        content: payload.type === "TEXT" ? payload.content : null,
        linkUrl: payload.type === "LINK" ? payload.content : null,
      };

      await createMemo(String(blockId), requestBody);
    } catch (error) {
      console.error(error);
      await refreshDayData(dayNumber);
    }
  };

  const addMemoLocal = (
    dayNumber: number,
    blockId: number,
    memoData: { type: "TEXT" | "LINK"; content: string }
  ) => {
    if (!planData.value) return;

    const targetDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === dayNumber
    );
    const item = targetDay?.items.find((i) => i.blockId === blockId);

    if (item) {
      const newMemo: MemoDTO = {
        id: `temp_${Date.now()}`,
        type: memoData.type,
        content: memoData.type === "TEXT" ? memoData.content : "",
        linkUrl: memoData.type === "LINK" ? memoData.content : null,
        displayText: memoData.content,
      };

      if (!item.memos) item.memos = [];
      item.memos.push(newMemo);
    }
  };

  // 2. 메모 삭제
  const requestDeleteMemo = async (
    memoId: string,
    blockId: number,
    dayNumber: number
  ) => {
    if (!planData.value) return;

    removeMemoLocal(dayNumber, blockId, memoId);

    try {
      await deleteMemo(memoId);
      console.log(`메모 삭제 성공: ${memoId}`);
    } catch (error) {
      console.error("메모 삭제 실패", error);
      await refreshDayData(dayNumber);
    }
  };

  const removeMemoLocal = (
    dayNumber: number,
    blockId: number,
    memoId: string
  ) => {
    if (!planData.value) return;

    const targetDay = planData.value.dailySchedules.find(
      (d) => d.dayNumber === dayNumber
    );
    const item = targetDay?.items.find((i) => i.blockId === blockId);

    if (item && item.memos) {
      item.memos = item.memos.filter((m) => m.id !== memoId);
    }
  };

  // 3. 메모 조회
  const fetchAndSyncMemos = async (blockId: number, dayNumber: number) => {
    if (!planData.value) return;

    try {
      const response = await fetchMemos(String(blockId));

      const targetDay = planData.value.dailySchedules.find(
        (d) => d.dayNumber === dayNumber
      );
      const item = targetDay?.items.find((i) => i.blockId === blockId);

      if (item && response.data) {
        item.memos = response.data
          .map((m: any) => ({
            id: String(m.memoId),
            type: m.type,
            content: m.content,
            linkUrl: m.linkUrl,
            orderIndex: m.orderIndex,
            displayText: m.type === "LINK" ? m.linkUrl || m.content : m.content,
          }))
          .sort((a: any, b: any) => a.orderIndex - b.orderIndex);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* 💡 여행 계획 수정 요청 */
  const requestUpdatePlan = async (
    planId: number,
    payload: { title: string; startDate: string; endDate: string }
  ) => {
    try {
      await updatePlan(planId, payload);
      console.log("플랜 수정 요청 성공");
    } catch (error) {
      console.error("플랜 수정 요청 실패", error);
    }
  };

  /* 💡 여행 계획 삭제 요청 */
  const requestDeletePlan = async (planId: number) => {
    try {
      await deletePlan(planId);
      console.log("플랜 삭제 요청 성공");
    } catch (error) {
      console.error("플랜 삭제 요청 실패", error);
    }
  };

  return {
    planData,
    activeMemoId,
    allPlans,
    isLoading,

    loadPlan,
    setPlanData,
    handleSocketEvent,
    refreshDayData,

    requestAddScheduleBlock,
    addScheduleBlockLocal,
    requestRemoveScheduleBlock,
    removeItemLocal,
    requestMoveScheduleItem,
    updateItemPositionLocal,
    requestResizeScheduleItem,
    updateItemDuration,

    toggleMemo,
    closeMemo,
    requestAddMemo,
    requestDeleteMemo,
    fetchAndSyncMemos,

    requestUpdatePlan,
    requestDeletePlan,
  };
});
