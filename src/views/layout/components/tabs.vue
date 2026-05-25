<template>
  <div class="tabs-container" v-if="showTabs">
    <div class="tabs-wrapper">
      <!-- 首页 tab -->
      <a-tag :color="isActive('/home') ? 'blue' : 'default'" class="tab-tag home-tag" @click="handleTabClick('/home')">
        <home-outlined />
        <span class="tab-title">{{ $t('menu.home') }}</span>
      </a-tag>

      <!-- 其他 tabs -->
      <a-tag v-for="tab in tabsStore.tabsList" :key="tab.path" :color="isActive(tab.path) ? 'blue' : 'default'"
        :closable="true" class="tab-tag" @click="handleTabClick(tab.path)" @close="handleTabRemove(tab.path)">
        <span class="tab-title">{{ $t(tab.title) }}</span>
      </a-tag>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTabsStore } from '@/store/tabs';
import { HomeOutlined } from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const tabsStore = useTabsStore();

const showTabs = computed(() => {
  return tabsStore.tabsList.length > 0 || tabsStore.activeTab === '/home';
});

const isActive = (path) => {
  return tabsStore.activeTab === path;
};

watch(
  () => route.path,
  () => {
    if (route.path !== '/login' && route.name) {
      tabsStore.addTab(route);
    }
  },
  { immediate: true }
);

const handleTabClick = (path) => {
  if (path !== route.path) {
    router.push(path);
  }
};

const handleTabRemove = (targetPath) => {
  tabsStore.removeTab(targetPath, router);
};
</script>

<style scoped lang="scss">
.tabs-container {
  background: #fff;
  padding: 5px 16px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #f0f0f0;
}

.tabs-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;

    &:hover {
      background: #bfbfbf;
    }
  }
}

.tab-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.3s;
  margin: 0 !important;

  &:hover {
    opacity: 0.85;
  }

  .tab-title {
    margin-left: 4px;
  }

  &.home-tag {
    .anticon {
      margin-right: 4px;
    }
  }
}
</style>