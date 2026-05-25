// src/utils/request.js
import axios from "axios";
import { message } from "ant-design-vue";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import router from "@/router";
import { useAuthStore } from "@/store/auth";

// 配置进度条
NProgress.configure({ showSpinner: false, trickleSpeed: 200 });
// 读取环境变量（vite）
const baseURL = "/api";
console.log("🚀 ~ baseURL:", baseURL);

const request = axios.create({
  baseURL, // 会自动拼接请求地址
  timeout: 60000, // 超时时间
  withCredentials: false,
});
message.config({
  maxCount: 1,
});
// =============================
// 🚀 请求拦截器
// =============================
request.interceptors.request.use(
  (config) => {
    NProgress.start();

    // token
    const token = sessionStorage.getItem("token");
    // const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

// =============================
// 🚀 响应拦截器
// =============================
request.interceptors.response.use(
  (response) => {
    NProgress.done(); // 请求完成，结束进度条
    const res = response.data;

    // 后端定义的状态码检查
    if (res.code != 200) {
      message.error(res.data.message);
      return Promise.reject(res);
    }

    return res; // 返回业务数据
  },
  (error) => {
    NProgress.done(); // 请求失败也结束进度条
    // 网络、timeout、500 错误
    if (error.status == 401) {
      message.error("身份过期，请重新登录");
      const authStore = useAuthStore();

      authStore.$reset(); // 如果你的 store 没有自定义 reset，可手动清空 token、menuTree、permissionNames
      sessionStorage.clear(); // 清空 sessionStorage
      router.replace({
        path: "/login",
        query: { redirect: router.currentRoute.value.fullPath }, // 登录成功后可以跳回之前页面
      });
    } else {
      message.error("网络错误");
    }

    return Promise.reject(error);
  }
);

// =============================
// 🚀 统一导出
// =============================
export default request;
