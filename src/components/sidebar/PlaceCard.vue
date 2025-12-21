<template>
    <div class="place-card">
        <div class="card-image">
            <img :src="place.imageUrl" :alt="place.title" loading="lazy" />
        </div>

        <div class="card-info">
            <h3 class="place-title" :title="place.title" ref="titleContainer">
                <div class="marquee-wrapper" :class="{ 'is-overflowing': isOverflowing }">
                    <span class="title-text" ref="titleText">{{ place.title }}</span>
                    <!-- 오버플로우 시 자연스러운 반복을 위해 복제된 텍스트 추가 -->
                    <span v-if="isOverflowing" class="title-text clone">{{ place.title }}</span>
                </div>
            </h3>

            <p class="place-address">
                <img src="@/assets/icons/ic_location.png" alt="주소" class="icon-small" />
                {{ place.address }}
            </p>

            <div class="place-meta">
                <span class="meta-item like-count">
                    <img src="@/assets/icons/ic_heart.png" alt="좋아요" class="icon-small"
                        :class="{ 'icon-red': place.isLiked }" />
                    {{ place.likes }}
                </span>

                <span class="meta-item bookmark-toggle" @click.stop="emit('mark', place.id)">
                    <img src="@/assets/icons/ic_mark.png" alt="북마크" class="icon-small"
                        :class="{ 'icon-marked': place.isMarked }" />
                </span>

                <span class="meta-item share-action" @click.stop="emit('share', place.id)">
                    <img src="@/assets/icons/ic_share.png" alt="공유" class="icon-small" />
                </span>
            </div>
        </div>

        <div class="category-tag" :style="tagInlineStyle">
            {{ place.categoryName }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { PlaceCardDTO } from '@/types/sidebar';
import { getCategoryVarName } from '@/utils/categoryMap';

const emit = defineEmits(['mark', 'share', 'click'])

// Props 정의
const props = defineProps<{
    place: PlaceCardDTO
}>();

const titleContainer = ref<HTMLElement | null>(null);
const titleText = ref<HTMLElement | null>(null);
const isOverflowing = ref(false);
let resizeObserver: ResizeObserver | null = null;

const checkOverflow = async () => {
    await nextTick();
    if (titleContainer.value && titleText.value) {
        // 정밀한 계산을 위해 getBoundingClientRect 사용
        const containerWidth = titleContainer.value.getBoundingClientRect().width;
        const textWidth = titleText.value.getBoundingClientRect().width;
        
        // 태그 공간(64px) 제외
        const availableWidth = containerWidth - 64;

        // "여유 공간이 2px 남았어도 그냥 움직여라" (경계선 케이스 확실히 포함)
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
    
    // 컨테이너 크기 변화 감지 (창 크기 조절, 사이드바 변경 등 대응)
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

// 데이터가 바뀌었을 때도 다시 체크
watch(() => props.place, () => {
    checkOverflow();
}, { deep: true });

// computed 속성을 사용하여 카테고리 코드에 맞는 변수 이름을 계산
const categoryCssVarName = computed(() => {
    return getCategoryVarName(props.place.categoryCode);
});

// 카테고리 태그 배경색 동적으로 설정하는 인라인 스타일
const tagInlineStyle = computed(() => {
    return {
        '--tag-bg': `var(--category-tag-bg-${categoryCssVarName.value})`
    };
});

</script>

<style>
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
    /* 드래그 방지 */
    user-select: none;
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
    /* 텍스트가 흐를 때 블러 효과 등으로 부드럽게 보이게 하려면 mask-image 사용 가능 (선택 사항) */
}

.marquee-wrapper {
    display: inline-flex;
}

.marquee-wrapper.is-overflowing {
    /* 두 개의 텍스트가 들어있으므로 -50%까지 이동하면 첫 번째 텍스트가 완전히 사라지고 두 번째가 그 자리에 옴 */
    animation: marquee-slide 10s linear infinite; 
}

/* 마우스를 올리면 멈추게 하려면 아래 주석 해제 */
/* .marquee-wrapper.is-overflowing:hover {
    animation-play-state: paused;
} */

.title-text {
    flex-shrink: 0;
}

.title-text.clone {
    /* 원본과 복제본 사이 간격 */
    padding-left: 20px; 
}

@keyframes marquee-slide {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(calc(-1 * var(--scroll-width))); 
    }
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

.place-address i {
    margin-right: 4px;
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
}

.meta-item i {
    margin-right: 4px;
}

.place-address img,
.meta-item img {
    margin-right: 4px;
}

.like-count {
    color: var(--color-red-primary);
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

    /* 인라인 스타일로 주입된 --tag-bg 사용, 없다면 --category-tag-bg-default 사용 */
    background-color: var(--tag-bg, var(--category-tag-bg-default));

    color: var(--category-tag-color-text);
    user-select: none;
}
</style>