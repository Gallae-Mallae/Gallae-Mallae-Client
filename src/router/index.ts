import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const HomeView = () => import("@/views/Home.vue");

const PlanView = () => import("@/views/plan/Plan.vue");
const PlanCardList = () => import("@/views/plan/PlanCardList.vue");
const PlanTimetable = () => import("@/views/plan/PlanTimetable.vue");
const PlanJoinView = () => import("@/views/plan/PlanJoin.vue");

const SearchView = () => import("@/views/search/Search.vue");

const OAuthRedirectView = () => import("@/views/login/OAuthRedirect.vue");

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
    path: "/join",
    name: "PlanJoin",
    component: PlanJoinView,
    meta: { title: "여행 합류하기", requiresAuth: true }, // 로그인 필요
  },

  {
    path: "/plan",
    component: PlanView,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "PlanList",
        component: PlanCardList,
        meta: { title: "일정 목록", requiresAuth: true },
      },
      {
        path: ":id",
        name: "PlanDetail",
        component: PlanTimetable,
        meta: { title: "일정 상세", requiresAuth: true },
        props: true,
      },
    ],
  },

  {
    path: "/oauth2/redirect",
    name: "OAuthRedirect",
    component: OAuthRedirectView,
    meta: { title: "로그인" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
