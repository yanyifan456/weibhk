// src/store/lang.js
import { reactive, computed } from "vue";
import { antLocales } from "../locales/antLocale";
import { useI18n } from "vue-i18n";

const state = reactive({
  lang: "zh_CN",
});

export function useLangStore() {
  const { locale } = useI18n();
  const currentAntLocale = computed(() => antLocales[state.lang]);

  function switchLang(lang) {
    state.lang = lang;
    locale.value = lang;
    localStorage.setItem("lang", lang); // 刷新后保持
  }

  function initLang() {
    const saved = localStorage.getItem("lang");
    if (saved) {
      switchLang(saved);
    }
  }

  return { state, switchLang, currentAntLocale, initLang };
}
