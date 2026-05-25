import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTabsStore = defineStore('tabs', () => {
    const tabsList = ref([]);
    const activeTab = ref('');

    // 添加 tab
    const addTab = (route) => {
        // 首页始终存在，不需要添加到可关闭列表
        if (route.path === '/home') {
            activeTab.value = route.path;
            return;
        }

        const existTab = tabsList.value.find(item => item.path === route.path);
        if (!existTab) {
            tabsList.value.push({
                path: route.path,
                name: route.name,
                title: route.meta?.title || route.name,
            });
        }
        activeTab.value = route.path;
    };

    // 删除 tab
    const removeTab = (targetPath, router) => {
        const index = tabsList.value.findIndex(item => item.path === targetPath);
        if (index === -1) return;

        tabsList.value.splice(index, 1);

        // 如果关闭的是当前激活的 tab
        if (activeTab.value === targetPath) {
            // 如果还有其他 tab，跳转到最后一个
            if (tabsList.value.length > 0) {
                const lastTab = tabsList.value[tabsList.value.length - 1];
                router.push(lastTab.path);
            } else {
                // 如果没有 tab 了，跳转到首页
                router.push('/home');
            }
        }
    };

    // 关闭所有 tab
    const clearTabs = () => {
        tabsList.value = [];
        activeTab.value = '';
    };

    return {
        tabsList,
        activeTab,
        addTab,
        removeTab,
        clearTabs,
    };
});