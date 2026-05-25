import { createApp } from "vue";
import "@/assets/styles/base.scss";
import App from "./App.vue";
import router from "@/router/index.js";
import antd from "ant-design-vue";
import i18n from "./i18n/index";
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';


const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);



app.use(pinia);
app.use(router);
app.use(antd);
app.use(i18n);
document.title = import.meta.env.VITE_APP_TITLE;
app.mount("#app");
