import http from "./http";
import { mapToPlanDTO } from "./planMapper";
import type { PlanDTO } from "@/types/plan";

/* 모든 일정 조회 */
export const fetchPlans = async (): Promise<PlanDTO[]> => {
  const response = await http.get<PlanDTO[]>("/plans");
  return response.data.map((plan: any) => ({
    ...plan,
    id: plan.id || plan.planId?.toString(),
  }));
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
): Promise<CreatePlanResponse & { id: string }> => {
  const response = await http.post<CreatePlanResponse>("/plans", planData);
  return {
    ...response.data,
    id: response.data.planId.toString(),
  };
};

/* 참여자 목록 조회 */
export interface PlanMemberDTO {
  memberId: number;
  userId: number;
  nickname: string;
  profileImageUrl: string;
}

export const fetchPlanMembers = async (
  planId: number
): Promise<PlanMemberDTO[]> => {
  const response = await http.get<PlanMemberDTO[]>(`/plans/${planId}/members`);
  return response.data || [];
};

/* 특정 일정 조회 */
export const fetchPlanById = async (planId: number): Promise<PlanDTO> => {
  const [itemsRes, allPlans, membersRes] = await Promise.all([
    http.get<any>(`/schedules/${planId}`),
    fetchPlans(),
    fetchPlanMembers(planId),
  ]);

  const items = Array.isArray(itemsRes.data) ? itemsRes.data : [];
  const basicInfo = allPlans.find((p) => String(p.id) === String(planId));

  return mapToPlanDTO(planId, items, {
    ...basicInfo,
    participants: membersRes,
  });
};
