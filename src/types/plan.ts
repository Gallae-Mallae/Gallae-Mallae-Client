export type PlanType = "ALL" | "PERSONAL" | "SHARED";

export interface PlanCardDTO {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  isShared: boolean;
}

export interface PlanMemberDTO {
  id: string;
  userId: string;
  planId: string;

  nickname: string | null;
  profileImageUrl: string | null;
}
