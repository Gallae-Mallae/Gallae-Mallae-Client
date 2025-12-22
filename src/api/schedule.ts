import http from "./http";

export const createScheduleItem = async (planId: string, item: any) => {
  return await http.post(`/schedules/${planId}`, item);
};

export const moveScheduleItem = async (itemId: string, payload: any) => {
  return await http.put(`/schedules/${itemId}/position`, payload);
};

export const resizeScheduleItem = async (itemId: string, payload: any) => {
  return await http.put(`/schedules/${itemId}/resize`, payload);
};

export const deleteScheduleItem = async (itemId: string) => {
  return await http.delete(`/schedules/${itemId}`);
};
