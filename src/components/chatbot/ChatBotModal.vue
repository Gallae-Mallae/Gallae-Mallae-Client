<template>
  <div v-if="isVisible" class="chatbot-modal-overlay" @click.self="close">
    <div class="chatbot-container">
      <!-- 헤더 -->
      <div class="chatbot-header">
        <div class="header-title">
          <span class="icon">🤖</span>
          <span>AI 여행 가이드</span>
        </div>
        <button class="close-btn" @click="close">×</button>
      </div>

      <!-- 채팅 영역 -->
      <div class="chat-messages" ref="chatContainer">
        <div v-if="messages.length === 0" class="empty-state">
          <p>어디로 떠나고 싶으신가요?</p>
          <p class="sub-text">"경주 여행지 추천해줘" 처럼 물어보세요!</p>
        </div>

        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message-wrapper"
          :class="{ 'user-wrapper': msg.isUser, 'ai-wrapper': !msg.isUser }"
        >
          <div class="message-bubble" :class="{ 'user-bubble': msg.isUser, 'ai-bubble': !msg.isUser }">
            <div class="message-text">{{ msg.text }}</div>
            
            <!-- 추천 장소 리스트 (AI 응답인 경우만) -->
            <div v-if="!msg.isUser && msg.places && msg.places.length > 0" class="place-recommendations">
              <div 
                v-for="place in msg.places" 
                :key="place.id" 
                class="place-card"
                @click="handlePlaceClick(place.id)"
              >
                <div class="place-image-wrapper">
                  <img :src="place.image || defaultImage" alt="place" class="place-image" @error="onImageError">
                </div>
                <div class="place-info">
                  <div class="place-title">{{ place.title }}</div>
                  <div class="place-address">{{ place.address }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 로딩 인디케이터 -->
        <div v-if="isLoading" class="message-wrapper ai-wrapper">
          <div class="message-bubble ai-bubble loading-bubble">
            <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
          </div>
        </div>
      </div>

      <!-- 입력 영역 -->
      <div class="chat-input-area">
        <input 
          v-model="inputMessage" 
          @keyup.enter="sendMessage"
          type="text" 
          placeholder="질문을 입력하세요..." 
          class="chat-input"
          :disabled="isLoading"
        />
        <button @click="sendMessage" class="send-btn" :disabled="isLoading || !inputMessage.trim()">
          ➤
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { getAiChatResponse, type AiPlace } from '@/api/ai';
import defaultImage from '@/assets/images/example_place.png';

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'item-click', id: string): void;
}>();

interface ChatMessage {
  text: string;
  isUser: boolean;
  places?: AiPlace[];
}

const inputMessage = ref('');
const messages = ref<ChatMessage[]>([]);
const isLoading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const userText = inputMessage.value;
  inputMessage.value = '';

  // 사용자 메시지 추가
  messages.value.push({
    text: userText,
    isUser: true
  });
  scrollToBottom();

  isLoading.value = true;

  try {
    const response = await getAiChatResponse(userText);
    
    // AI 응답 추가
    messages.value.push({
      text: response.aiMessage,
      isUser: false,
      places: response.places
    });
  } catch (error) {
    console.error("AI API Error:", error);
    messages.value.push({
      text: "죄송해요, 잠시 문제가 발생했습니다. 다시 시도해 주세요.",
      isUser: false
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

const handlePlaceClick = (id: number) => {
  emit('item-click', String(id));
};

const close = () => {
  emit('close');
};

const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = defaultImage;
};

// 모달이 열릴 때 스크롤 하단으로 이동
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    scrollToBottom();
  }
});
</script>

<style scoped>
.chatbot-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
}

.chatbot-container {
  width: 90%;
  max-width: 400px;
  height: 80vh;
  max-height: 700px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 헤더 */
.chatbot-header {
  padding: 15px 20px;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

/* 채팅 영역 */
.chat-messages {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.empty-state {
  text-align: center;
  margin-top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.sub-text {
  font-size: 12px;
  color: #aaa;
  margin-top: 4px;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.user-wrapper {
  justify-content: flex-end;
}

.ai-wrapper {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  word-break: break-word;
}

.user-bubble {
  background-color: #6e8efb;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-bubble {
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.loading-bubble {
  padding: 8px 16px;
}

.dot {
  animation: blink 1.4s infinite both;
  font-size: 20px;
  line-height: 10px;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0% { opacity: 0.2; }
  20% { opacity: 1; }
  100% { opacity: 0.2; }
}

/* 추천 장소 카드 */
.place-recommendations {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.place-card {
  display: flex;
  gap: 10px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.place-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.place-image-wrapper {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.place-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.place-title {
  font-weight: bold;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.place-address {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 입력 영역 */
.chat-input-area {
  padding: 15px;
  background-color: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.chat-input {
  flex-grow: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #6e8efb;
}

.send-btn {
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #ddd;
  cursor: not-allowed;
}
</style>