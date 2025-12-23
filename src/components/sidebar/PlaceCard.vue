<template>
    <div class="place-card" 
         @click="$emit('click', place.id)"
         :draggable="isDraggable" 
         :class="{ 'draggable': isDraggable }" 
         @dragstart="handleDragStart">
         
        <div class="card-image">
            <img :src="place.imageUrl" :alt="place.title" loading="lazy" />
        </div>

        <div class="card-info">
            <h3 class="place-title" :title="place.title" ref="titleContainer">
                <div class="marquee-wrapper" :class="{ 'is-overflowing': isOverflowing }">
                    <span class="title-text" ref="titleText">{{ place.title }}</span>
                    <span v-if="isOverflowing" class="title-text clone">{{ place.title }}</span>
                </div>
            </h3>

            <p class="place-address">
                <img src="@/assets/icons/ic_location.png" alt="주소" class="icon-small" />
                {{ place.address }}
            </p>

            <div class="place-meta">
                <button class="meta-item like-count" @click.stop="$emit('like', place.id)">
                    <img src="@/assets/icons/ic_heart.png" alt="좋아요" class="icon-small"
                        :class="{ 'icon-red': isLiked }" />
                    {{ place.likes }}
                </button>

                <button class="meta-item bookmark-toggle" @click.stop="$emit('mark', place.id)">
                    <img src="@/assets/icons/ic_mark.png" alt="북마크" class="icon-small" />
                </button>

                <span class="meta-item share-action" @click.stop="$emit('share', place.id)">
                    <img src="@/assets/icons/ic_share.png" alt="공유" class="icon-small" />
                </span>
            </div>
        </div>

        <div class="category-tag" :style="tagInlineStyle">
            {{ place.categoryName }}
        </div>

        <button v-if="showDelete" class="card-delete-btn" @click.stop="$emit('delete', place.id)" title="폴더에서 삭제">
            <img src="@/assets/icons/ic_close.png" alt="삭제" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router'; // test2에서 추가됨
import type { PlaceCardDTO } from '@/types/sidebar';
import { getCategoryVarName } from '@/utils/categoryMap';
import { useLikeStore } from '@/stores/like'; // feature/#16에서 추가됨

const route = useRoute();
const likeStore = useLikeStore();

// 두 브랜치의 emit을 모두 정의
const emit = defineEmits(['mark', 'share', 'click', 'like', 'delete']);

// Props 정의
const props = defineProps<{
    place: PlaceCardDTO,
    showDelete?: boolean
}>();

const titleContainer = ref<HTMLElement | null>(null);
const titleText = ref<HTMLElement | null>(null);
const isOverflowing = ref(false);
let resizeObserver: ResizeObserver | null = null;

// feature/#16: 좋아요 상태
const isLiked = computed(() => {
    return likeStore.isLiked(Number(props.place.id));
});

// feature/#16: 마퀴(텍스트 흐름) 로직
const checkOverflow = async () => {
    await nextTick();
    if (titleContainer.value && titleText.value) {
        const containerWidth = titleContainer.value.getBoundingClientRect().width;
        const textWidth = titleText.value.getBoundingClientRect().width;
        const availableWidth = containerWidth - 64; // 태그 공간 제외

        if (textWidth > availableWidth - 2) {
            isOverflowing.value = true;
            const scrollDistance = textWidth + 20; 
            titleContainer.value.style.setProperty('--scroll-width', `${scrollDistance}px`);
        } else {
            isOverflowing.value = false;
        }
    }
};

onMounted(() => {
    checkOverflow();
    if (titleContainer.value) {
        resizeObserver = new ResizeObserver(() => {
            checkOverflow();
        });
        resizeObserver.observe(titleContainer.value);
    }
});

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});

watch(() => props.place, () => {
    checkOverflow();
}, { deep: true });

const categoryCssVarName = computed(() => {
    return getCategoryVarName(props.place.categoryCode);
});

const tagInlineStyle = computed(() => {
    return {
        '--tag-bg': `var(--category-tag-bg-${categoryCssVarName.value})`
    };
});

// test2: 드래그 앤 드롭 로직
const isDraggable = computed(() => {
    return route.path.startsWith('/plan/');
});

const handleDragStart = (event: DragEvent) => {
    if (!isDraggable.value) {
        event.preventDefault();
        return;
    }
    if (event.dataTransfer) {
        event.dataTransfer.setDragImage(event.currentTarget as HTMLElement, 20, 20);
        event.dataTransfer.setData('place', JSON.stringify(props.place));
        event.dataTransfer.effectAllowed = 'move';
    }
};
</script>

<style>
/* feature/#16의 스타일을 기반으로 test2 스타일 병합 */
.place-card {
    display: flex;
    position: relative;
    padding: 14px;
    cursor: pointer;
    background-color: var(--color-white);
    transition: background-color 0.2s;
}

.place-card:hover {
    background-color: var(--color-gray-lightest);
}

.card-image img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 12px;
    user-select: none; /* 드래그 방지 */
}

.card-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.place-title {
    font-size: var(--font-size-title);
    font-weight: 600;
    margin: 0 0 4px 0;
    white-space: nowrap;
    overflow: hidden;
    padding-right: 64px;
    position: relative;
}

.marquee-wrapper {
    display: inline-flex;
}

.marquee-wrapper.is-overflowing {
    animation: marquee-slide 10s linear infinite; 
}

.title-text {
    flex-shrink: 0;
}

.title-text.clone {
    padding-left: 20px; 
}

@keyframes marquee-slide {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-1 * var(--scroll-width))); }
}

.place-address {
    display: flex;
    align-items: center;
    font-size: var(--font-size-address);
    color: var(--color-gray-dark);
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.place-meta {
    display: flex;
    font-size: var(--font-size-like);
    color: var(--color-gray-medium);
}

.meta-item {
    display: flex;
    align-items: center;
    margin-right: 8px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 2px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.meta-item:hover {
    background-color: #f0f0f0;
}

.meta-item i, .place-address img, .meta-item img {
    margin-right: 4px;
}

.like-count {
    color: var(--color-red-primary);
}

.icon-red {
    filter: grayscale(1) brightness(0.7) sepia(1) hue-rotate(-50deg) saturate(1000%);
}

.category-tag {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 8px;
    font-size: var(--font-size-category);
    font-weight: 500;
    border-radius: 4px;
    z-index: 1;
    background-color: var(--tag-bg, var(--category-tag-bg-default));
    color: var(--category-tag-color-text);
    user-select: none;
}

.card-delete-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: #ffffff;
    border: 1px solid #000000;
    cursor: pointer;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.card-delete-btn:hover {
    background: #000000;
    transform: scale(1.1);
}

.card-delete-btn:hover img {
    filter: brightness(0) invert(1);
}

.card-delete-btn img {
    width: 10px;
    height: 10px;
    filter: brightness(0);
}
</style>