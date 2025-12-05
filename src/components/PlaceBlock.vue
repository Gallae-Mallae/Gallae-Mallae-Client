<template>
    <div class="place-block">
        <div class="block-image">
            <img :src="place.imageUrl" :alt="place.title" loading="lazy" />
        </div>

        <div class="block-info">
            <h3 class="place-title">{{ place.title }}</h3>

            <p class="place-address">
                <img src="@/assets/icons/ic_location.png" alt="주소" class="icon-small" />
                {{ place.address }}
            </p>

            <div class="place-meta">
                <span class="meta-item like-count">
                    <img src="@/assets/icons/ic_heart.png" alt="좋아요" class="icon-small icon-red" />
                    {{ place.likes }}
                </span>

                <span class="meta-item bookmark-toggle" @click.stop="markPlace">
                    <img src="@/assets/icons/ic_mark.png" alt="북마크" class="icon-small" />
                </span>

                <span class="meta-item share-action" @click.stop="sharePlace">
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
import { computed } from 'vue';
import type { PlaceBlockData } from '@/types/place';
import { getCategoryVarName } from '@/utils/categoryMap';

// Props 정의
const props = defineProps<{
    place: PlaceBlockData
}>();

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

// 상호작용 함수
const markPlace = () => {
    // 북마크 API 호출 로직 추가
    console.log(`장소 ${props.place.id} 북마크 토글`);
};

const sharePlace = () => {
    // 공유 기능 로직 추가
    console.log(`장소 ${props.place.id} 공유`);
};
</script>

<style>
.place-block {
    display: flex;
    position: relative;
    padding: 12px;
    cursor: pointer;
    background-color: var(--color-white);
    transition: background-color 0.2s;
    border-bottom: 1px solid var(--color-gray-light);
}

.place-block:hover {
    background-color: var(--color-gray-lightest);
}

/* 마지막 항목에는 구분선 제거 */
.place-block:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

/* --- 이미지 영역 --- */
.block-image img {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 12px;
    /* 드래그 방지 */
    user-select: none;
}

/* --- 정보 영역 --- */
.block-info {
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
    text-overflow: ellipsis;
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

/* --- 메타 (아이콘) 영역 --- */
.place-meta {
    display: flex;
    font-size: var(--font-size-like);
    color: var(--color-gray-medium);
}

.meta-item {
    display: flex;
    align-items: center;
    margin-right: 12px;
    cursor: pointer;
}

.meta-item i {
    margin-right: 4px;
}

/* 좋아요는 붉은색으로 강조 */
.like-count {
    color: var(--color-red-primary);
}

/* --- 카테고리 태그 영역 --- */
.category-tag {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 8px;
    font-size: var(--font-size-category);
    font-weight: 500;
    border-radius: 4px;

    /* 인라인 스타일로 주입된 --tag-bg 사용, 없다면 --category-tag-bg-default 사용 */
    background-color: var(--tag-bg, var(--category-tag-bg-default));

    /* 전역 변수 참조 */
    color: var(--category-tag-color-text);
    user-select: none;
}
</style>