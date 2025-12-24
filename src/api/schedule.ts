import http from "./http";

/* 블록 생성 */
export interface CreateScheduleRequest {
  attractionId: number | null;
  day: number;
  startTime: string;
  title: string;
}

export interface CreateScheduleResponse {
  attractionId: number | null;
  day: number;
  title: string;
  startTime: string;
}

export interface CreateSocketData {
  blockId: number;
  planId: number;
  day: number;
  title: string;
  startTime: string;
  endTime: string;
  attraction: {
    attractionId: number;
    title: string;
    address: string;
    imageUrl: string;
    categoryCode?: string;
  } | null;
  memos: any[];
}

export const createScheduleItem = async (planId: string, item: any) => {
  return await http.post(`/schedules/${planId}`, item);
};

/* 블록 이동 */
export interface MoveScheduleRequest {
  newDay: number;
  newStartTime: string;
}

export interface MoveSocketData {
  blockId: number;
  planId: number;
  day: number;
  fromDay: number;
  title: string;
  startTime: string;
  endTime: string;
  attraction: any;
  memos: any[];
}

export const moveScheduleItem = async (blockId: string, payload: any) => {
  return await http.patch(`/schedules/${blockId}/position`, payload);
};

/* 블록 리사이징 */
export interface ResizeScheduleRequest {
  newEndTime: string;
}

export interface ResizeSocketData {
  blockId: number;
  planId: number;
  day: number;
  title: string;
  startTime: string;
  endTime: string;
  attraction: any;
  memos: any[];
}

export const resizeScheduleItem = async (blockId: string, payload: any) => {
  return await http.patch(`/schedules/${blockId}/resize`, payload);
};

/* 블록 삭제 */
export interface DeleteSocketData {
  blockId: number;
}
export const deleteScheduleItem = async (blockId: string) => {
  return await http.delete(`/schedules/${blockId}`);
};
