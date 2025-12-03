import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const HomeView = () => import('@/views/Home.vue');
const PlanView = () => import('@/views/Plan.vue'); 
const SearchView = () => import('@/views/Search.vue');

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: HomeView,
        meta: {title: '메인' }
    },

    {
        path: '/search', 
        name: 'SearchPlace',
        component: SearchView,
        meta: { title: '장소 검색' }
    },

    {
        path: '/plan',
        name: 'PlanCreate',
        component: PlanView,
        meta: { title: '일정 짜기' }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;