// src/utils/locale.js
import { reactive } from "vue";
import { ConfigProvider } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import zhTW from "ant-design-vue/es/locale/zh_TW";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/zh-tw";

const state = reactive({
  antdLocale: zhCN, // 当前Antd语言包
  dayjsLocale: "zh-cn", // 当前dayjs语言
  currentLang: "zh-hans", // zh-hans / zh-hant
});

// 切换语言方法
const toggleLanguage = () => {
  if (state.currentLang === "zh-hans") {
    state.currentLang = "zh-hant";
    state.antdLocale = zhTW;
    state.dayjsLocale = "zh-tw";
    dayjs.locale("zh-tw");
  } else {
    state.currentLang = "zh-hans";
    state.antdLocale = zhCN;
    state.dayjsLocale = "zh-cn";
    dayjs.locale("zh-cn");
  }
  console.log("当前语言:", state.currentLang);
};

export { state, toggleLanguage };
