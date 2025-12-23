import axiosInstance from './http';

export interface AiPlace {
  id: number;
  title: string;
  address: string;
  image: string;
}

export interface AiChatResponse {
  aiMessage: string;
  places: AiPlace[];
}

export const getAiChatResponse = async (message: string): Promise<AiChatResponse> => {
  const { data } = await axiosInstance.get<AiChatResponse>('/ai/chat', {
    params: { message },
  });
  return data;
};
