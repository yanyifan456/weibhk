/**
 * 路由文件
 */
import { createRouter, createWebHashHistory } from "vue-router";
import route from "@/router/modules/static.js";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useAuthStore } from "@/store/auth";

// 配置路由
const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/login.vue"),
  },
  {
    path: "/home",
    name: "home",
    meta: {
      title: "menu.home",
      requiresAuth: false,
      icon: "https://www.gzxinxingyiyuan.com/images/image/1.png",
    },
    component: () => import("@/views/Home/Home.vue"),
  },
  {
    path: "/register",
    name: "register",
    meta: { title: "menu.register" },
    component: () => import("@/views/register/register.vue"),
  },
  ...route,
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = authStore.token || sessionStorage.getItem("token");

  if (!token) {
    if (to.path === "/login") {
      next();
    } else {
      next("/login");
    }
  } else {
    if (to.path === "/login") {
      next("/home"); // 已登录不能回登录页
    } else {
      next();
    }
  }
});
export default router;
