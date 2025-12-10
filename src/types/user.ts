export interface UserDTO {
  userId: number;
  email: string;
  name: string;
  nickname: string | null;
  profileImageUrl: string | null;
  deletedAt: string | null;
}
