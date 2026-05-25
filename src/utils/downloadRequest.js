// src/utils/downloadRequest.js
import axios from "axios";

const downloadRequest = axios.create({
  baseURL: "/api",
  timeout: 20000,
  responseType: "blob",
  withCredentials: false,
});

// ⭐ 单独给下载请求加 token
downloadRequest.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // 或者 sessionStorage

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default downloadRequest;
