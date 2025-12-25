export type PlanType = "ALL" | "PERSONAL" | "SHARED";

export interface PlanCardDTO {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  planImageUrl: string;
  isShared: number;
  participants: PlanMemberDTO[];
}

export interface PlanMemberDTO {
  id: string;
  userId: string;
  planId: string;
  name: string;
  nickname: string | null;
  profileImageUrl: string | null;
}

export type MemoContentType = "TEXT" | "LINK";

export interface MemoDTO {
  id: string;
  type: MemoContentType;
  content: string;
  displayText: string;
  linkUrl?: string | null;
}

export interface PlaceItemDTO {
  id: string;
  title: string;
  categoryCode: number;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
}

export type ScheduleItemType = "PLACE" | "MEMO";

export interface ScheduleItemDTO {
  blockId: number;
  day: number;
  title: string;
  startTime: string;
  endTime: string;
  durationTime?: number;

  memos: MemoDTO[];
  attraction: PlaceItemDTO | null;

  categoryCode?: number;
  // category?: string;

  isTemp?: boolean;
}

export interface DailyScheduleDTO {
  dayNumber: number;
  date: string;
  items: ScheduleItemDTO[];
}

export interface PlanDTO extends PlanCardDTO {
  ownerId: string;
  participantIds: string[];
  inviteCode: string;
  dailySchedules: DailyScheduleDTO[];
}
