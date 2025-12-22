import http from "./http";
import type { PlanDTO } from "@/types/plan";

/* 모든 일정 조회 */
export const fetchPlans = async (): Promise<PlanDTO[]> => {
  const response = await http.get<PlanDTO[]>("/plans");
  return response.data;
};
