import http from "./http";
import type { PlanDTO } from "@/types/plan";

/* 모든 일정 조회 */
export const fetchPlans = async (): Promise<PlanDTO[]> => {
  const response = await http.get<PlanDTO[]>("/plans");
  return response.data;
};

/* 새로운 일정 생성 */
export interface CreatePlanRequest {
  title: string;
  startDate: string;
  endDate: string;
}

export interface CreatePlanResponse {
  planId: number;
  title: string;
  inviteCode: string;
  startDate: string;
  endDate: string;
  planImageUrl: string;
}

export const createPlan = async (
  planData: CreatePlanRequest
): Promise<CreatePlanResponse> => {
  const response = await http.post<CreatePlanResponse>("/plans", planData);
  return response.data;
};

/* 특정 일정 조회 */
export const fetchPlanById = async (planId: number): Promise<PlanDTO> => {
  const response = await http.get<PlanDTO>(`/schedules/${planId}`);
  return response.data;
};
