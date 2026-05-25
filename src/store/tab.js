import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTabStore = defineStore('tab', () => {
    const tabs = ref([]);
    const activeKey = ref('');

    // 添加标签页
    const addTab = (tab) => {
        const exists = tabs.value.some(item => item.fullPath === tab.fullPath);
        if (!exists) {
            tabs.value.push(tab);
        }
        activeKey.value = tab.fullPath;
    };

    // 移除标签页
    const removeTab = (targetKey) => {
        if (tabs.value.length <= 1) return;

        const index = tabs.value.findIndex(item => item.fullPath === targetKey);
        if (index !== -1) {
            tabs.value.splice(index, 1);

            // 如果关闭的是当前激活的标签，自动切换到前一个标签
            if (targetKey === activeKey.value) {
                const newTab = tabs.value[Math.max(0, index - 1)];
                activeKey.value = newTab.fullPath;
                router.push(newTab.fullPath);
            }
        }
    };

    // 设置当前激活的标签
    const setActiveKey = (key) => {
        activeKey.value = key;
    };

    return { tabs, activeKey, addTab, removeTab, setActiveKey };
});