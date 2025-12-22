export type PlanType = "ALL" | "PERSONAL" | "SHARED";

export interface PlanCardDTO {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  planImageUrl: string;
  isShared: boolean;
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
}

export interface PlaceItemDTO {
  id: string;
  title: string;
  categoryCode: number;
  category: string;
  latitude: number;
  longitude: number;
  address: string;

  memoContents: MemoDTO[];
}

export type ScheduleItemType = "PLACE" | "MEMO";

export interface ScheduleItemDTO {
  id: string;
  type: ScheduleItemType;

  day: number;
  startTime: number;
  endTime: number;
  durationTime: number;

  title: string;
  categoryCode?: number;
  category?: string;

  memoContents: MemoDTO[];
  placeId?: string;
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
