<template>
  <a-layout-sider theme="light">
    <div class="logo">
      <div class="logo-content">{{ $t("logo") }}</div>
    </div>
    <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" theme="light" mode="inline">
      <template v-for="item in processedMenu" :key="item.fullPath">
        <a-sub-menu v-if="hasChildren(item)" :key="item.fullPath" @titleClick="() => handleSubMenuClick(item)">
          <template #icon>
            <img :src="isActive(item) ? item.meta?.activeIcon : item.meta?.icon" style="width: 30px; height: 30px" />
          </template>
          <template #title>
            <span>{{ $t(item.meta?.title) }}</span>
          </template>
          <a-menu-item v-for="child in item.children" :key="child.fullPath" @click="() => handleMenuClick(child)">
            <span>{{ $t(child.meta?.title) }}</span>
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item v-else :key="item?.fullPath" @click="() => handleMenuClick(item)">
          <template #icon>
            <img :src="isActive(item) ? item.meta?.activeIcon : item.meta?.icon" style="width: 30px; height: 30px" />
          </template>
          <span>{{ $t(item.meta?.title) }}</span>
        </a-menu-item>
      </template>
    </a-menu>
  </a-layout-sider>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const selectedKeys = ref([]);
const openKeys = ref([]);

const hasChildren = (item) => item.children && item.children.length > 0;

/** -------------------------
 *  使用 authStore.menu 作为最终菜单
 * ------------------------- */
const processedMenu = computed(() => {
  const menu = authStore.menu;

  const processMenuItems = (items, parentPath = "") => {
    return items.map((item) => {
      const fullPath = parentPath + (item.path.startsWith("/") ? item.path : `/${item.path}`);

      const processedItem = {
        ...item,
        fullPath: fullPath.replace(/\/+/g, "/"),
      };

      if (hasChildren(item)) {
        processedItem.children = processMenuItems(item.children, `${fullPath}/`);
      }
      return processedItem;
    });
  };

  return processMenuItems(menu);
});

/** -------------------------
 *  菜单高亮逻辑
 * ------------------------- */
const updateMenuState = () => {
  const currentPath = route.path;
  selectedKeys.value = [currentPath];

  const parentPath = findParentPath(currentPath, processedMenu.value);
  if (parentPath) {
    openKeys.value = [parentPath];
  }
};

const findParentPath = (currentPath, menuList) => {
  for (const item of menuList) {
    if (hasChildren(item)) {
      for (const child of item.children) {
        if (child.fullPath === currentPath) return item.fullPath;
      }
      const found = findParentPath(currentPath, item.children);
      if (found) return found;
    }
  }
  return null;
};

const handleMenuClick = (item) => router.push(item.fullPath);
const handleSubMenuClick = (item) => item.redirect && router.push(item.redirect);

const isActive = (item) => {
  if (selectedKeys.value.includes(item.fullPath)) return true;
  if (hasChildren(item)) {
    return item.children.some((child) => selectedKeys.value.includes(child.fullPath));
  }
  return false;
};

onMounted(() => {
  updateMenuState();
});

router.afterEach(() => updateMenuState());
</script>

<style scoped lang="scss">
.logo {
  height: 64px;
  background-color: #fff;
  padding: 10px 20px;
  box-sizing: border-box;

  .logo-content {
    width: 100%;
    height: 100%;
    font-size: 22px;
    //color: rgb(100, 152, 201);
    color: #000;
    letter-spacing: 2px;
    // background-color: #ffffff52;
    // 字体阴影
    text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  }
}

:deep(.ant-menu-light.ant-menu-root.ant-menu-inline),
:deep(.ant-menu-light.ant-menu-root.ant-menu-vertical) {
  border: none !important;
}
</style>
