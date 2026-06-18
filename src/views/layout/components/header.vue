<template>
  <a-layout-header class="layout-header">
    <div class="header-content">
      <!-- 语言切换 -->
      <div style="cursor: pointer; margin-right: 16px" @click="toggleLanguage">
        {{ currentLanguageLabel }}
      </div>

      <!-- 用户信息 -->
      <a-dropdown :trigger="['click']" placement="bottom" arrow>
        <div class="user-info">
          <span class="username">{{ avatarValue }}</span>
          <down-outlined class="dropdown-arrow" />
        </div>
        <template #overlay>
          <a-menu class="user-menu">
            <a-menu-item key="profile">
              <user-outlined />
              <span>{{ $t("label.profile") }}</span>
            </a-menu-item>
            <a-menu-item key="password">
              <lock-outlined />
              <span>{{ $t("label.password") }}</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item @click="logout" key="logout" class="logout-item">
              <logout-outlined />
              <span>{{ $t("label.logout") }}</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { DownOutlined, LockOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();

// 国际化
const { t } = useI18n();

const router = useRouter();
const avatarValue = ref(sessionStorage.getItem("username"));

const { locale } = useI18n();

// 当前语言显示标签
const currentLanguageLabel = computed(() => (locale.value === "zh" ? "中文" : "港文"));

// 切换语言
const toggleLanguage = () => {
  locale.value = locale.value === "zh" ? "hk" : "zh";
};

const logout = () => {
  // 清空 Pinia 状态
  authStore.$reset(); // 如果你的 store 没有自定义 reset，可手动清空 token、menuTree、permissionNames
  sessionStorage.clear(); // 清空 sessionStorage
  router.push("/login"); // 跳回登录页
};
</script>

<style scoped lang="scss">
.layout-header {
  height: 64px;
  //background: #fff;
  background: #fff;
  color: #000;
  padding: 0 24px;
  border-bottom: 1px solid #e5e5e5;
  // box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .header-content {
    display: flex;
    align-items: center;
    height: 100%;

    .notification-badge {
      margin-right: 24px;

      .header-icon {
        font-size: 18px;
        color: rgba(0, 0, 0, 0.65);
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: #1A6B8A;
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }

      .username {
        margin: 0 8px;
        font-size: 14px;
      }

      .dropdown-arrow {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
        transition: all 0.3s;
      }
    }
  }
}

// 覆盖下拉菜单样式
</style>
