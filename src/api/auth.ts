import http from "./http";
import type { UserDTO } from "@/types/user";

/* 현재 로그인된 사용자 정보를 조회 (HttpOnly JWT 쿠키로 인증) */
export const fetchUser = async (): Promise<UserDTO> => {
  const response = await http.get<UserDTO>("/user/me");
  return response.data;
};

/* 액세스 토큰 만료 시, 리프레시 토큰으로 재발급 시도 (HttpOnly Refresh Token 쿠키 사용해 인증) */
export const reissueAccessToken = async (): Promise<void> => {
  await http.post("/auth/reissue");
};
