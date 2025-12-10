import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const HomeView = () => import("@/views/Home.vue");
const PlanView = () => import("@/views/plan/Plan.vue");
const SearchView = () => import("@/views/search/Search.vue");
const OAuthRedirectView = () => import("@/views/login/OAuthRedirect.vue");
const TestUserView = () => import("@/views/login/TestUser.vue");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
    meta: { title: "메인" },
  },

  {
    path: "/search",
    name: "SearchPlace",
    component: SearchView,
    meta: { title: "장소 검색" },
  },

  {
    path: "/plan",
    name: "PlanCreate",
    component: PlanView,
    meta: { title: "일정 짜기" },
  },

  {
    path: "/oauth2/redirect",
    name: "OAuthRedirect",
    component: OAuthRedirectView,
    meta: { title: "로그인" },
  },

  {
    path: "/test-user",
    name: "TestUser",
    component: TestUserView,
    meta: { title: "유저 정보 확인 테스트" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
