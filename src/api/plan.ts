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
export interface PlanMemberResponse {
  memberId: number;
  userId: number;
  name: string;
  profileImageUrl: string;
}

export const fetchPlanMembers = async (
  planId: number
): Promise<PlanMemberResponse[]> => {
  const response = await http.get<PlanMemberResponse[]>(
    `/plans/${planId}/members`
  );
  return response.data || [];
};

/* 특정 일정 조회 (일별) */
export interface ScheduleBlockResponse {
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
  } | null;
  memos: {
    memoId: number;
    content: string;
    type: "TEXT" | "LINK";
    orderIndex: number;
  }[];
}

export const fetchPlanById = async (planId: number): Promise<PlanDTO> => {
  const [itemsRes, allPlans, membersRes] = await Promise.all([
    http.get<ScheduleBlockResponse[]>(`/schedules/${planId}`),
    fetchPlans(),
    fetchPlanMembers(planId),
  ]);

  const items = Array.isArray(itemsRes.data) ? itemsRes.data : [];
  const basicInfo = allPlans.find((p) => String(p.id) === String(planId));

  return mapToPlanDTO(planId, items, {
    ...(basicInfo || {}),
    participants: membersRes,
  });
};

export const fetchDailySchedules = async (
  planId: number,
  day: number
): Promise<ScheduleBlockResponse[]> => {
  const response = await http.get<ScheduleBlockResponse[]>(
    `/schedules/${planId}/days/${day}`
  );
  return response.data || [];
};

/* 일정 수정 */
export interface UpdatePlanRequest {
  title: string;
  startDate: string;
  endDate: string;
}

export interface PlanUpdatedResponse {
  planId: number;
  title: string;
  startDate: string;
  endDate: string;
  inviteCode: string;
  planImageUrl: string | null;
}

export const updatePlan = async (
  planId: number,
  planData: UpdatePlanRequest
): Promise<PlanUpdatedResponse> => {
  const response = await http.patch<PlanUpdatedResponse>(
    `/plans/${planId}`,
    planData
  );
  return response.data;
};

/* 일정 삭제 */
export interface PlanDeletedResponse {
  planId: number; // 삭제된 일정의 ID
}

export const deletePlan = async (
  planId: number
): Promise<PlanDeletedResponse> => {
  await http.delete<void>(`/plans/${planId}`);
  return { planId };
};
