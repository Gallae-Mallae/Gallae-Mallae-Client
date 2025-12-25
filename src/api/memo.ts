import http from "./http";

// 메모 생성
export interface MemoRequest {
  type: "TEXT" | "LINK";
  content: string | null;
  linkUrl: string | null;
}

export interface MemoCreatedSocketData {
  memoId: number;
  blockId: number;
  type: "TEXT" | "LINK";
  content: string | null;
  linkUrl: string | null;
}

export const createMemo = (blockId: string, data: MemoRequest) => {
  return http.post<CreateMemoResponse>(`/memos/${blockId}`, data);
};

// 메모 조회
export interface CreateMemoResponse {
  memoId: number;
  blockId: number;
  type: "TEXT" | "LINK";
  orderIndex: number;
  content: string | null;
  linkUrl: string | null;
}

export const fetchMemos = (blockId: string) => {
  return http.get<CreateMemoResponse[]>(`/memos/${blockId}`);
};

// 메모 삭제
export interface MemoDeletedSocketData {
  memoId: number;
  blockId: number;
}

export const deleteMemo = (memoId: string) => {
  return http.delete(`/memos/${memoId}`);
};

// 메모 순서 조정
export const updateMemoOrderApi = (blockId: string, memoIds: string[]) => {
  return http.patch(`/memos/${blockId}/order`, { memoIds });
};
