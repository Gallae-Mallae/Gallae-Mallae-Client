<template>
    <div class="place-card">
        <div class="card-image">
            <img :src="place.imageUrl" :alt="place.title" loading="lazy" />
        </div>

        <div class="card-info">
            <h3 class="place-title">{{ place.title }}</h3>

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
import { computed } from 'vue';
import type { PlaceCardDTO } from '@/types/place';
import { getCategoryVarName } from '@/utils/categoryMap';

const emit = defineEmits(['mark', 'share', 'click'])

// Props 정의
const props = defineProps<{
    place: PlaceCardDTO
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

    /* 인라인 스타일로 주입된 --tag-bg 사용, 없다면 --category-tag-bg-default 사용 */
    background-color: var(--tag-bg, var(--category-tag-bg-default));

    color: var(--category-tag-color-text);
    user-select: none;
}
</style>