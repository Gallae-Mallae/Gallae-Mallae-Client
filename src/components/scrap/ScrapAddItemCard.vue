<template>
    <div class="add-item-card">
        <div class="content">
            <div class="plus-icon">+</div>
            <span>추가하기</span>
        </div>
    </div>
</template>

<style scoped>
.add-item-card {
    width: 100%;
    aspect-ratio: 1 / 1;
    background-color: #f1f3f5;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: #adb5bd;
}

.plus-icon {
    font-size: 1.5rem;
    margin-bottom: 2px;
    text-align: center;
}

.content span {
    font-size: 0.8rem;
}
</style>