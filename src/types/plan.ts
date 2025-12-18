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

  name: string,
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
    category: string;
    latitude: number;
    longitude: number;
    address: string;
    
    memoContents: MemoDTO[];
}

export interface MemoItemDTO {
    id: string;
    title: string;
    
    memoContents: MemoDTO[];
}

export type ScheduleItemType = "Place" | "Memo";

export interface ScheduleItemDTO {
    id: string;
    type: ScheduleItemType;
    
    startTime: number;
    durationTime: number;
    
    itemId: string;
}

export interface DailyScheduleDTO {
    dayNumber: number;
    date: string;
    
    items: ScheduleItemDTO[];
}

export interface PlanDTO extends PlanCardDTO {
    ownerId: string;
    participantIds: string[];
    
    dailySchedules: DailyScheduleDTO[];
}
