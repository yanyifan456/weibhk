<template>
  <div class="login-container">
    <a-form :model="formState" :rules="formRules" name="login_form" class="login-form" @finish="handleLogin">
      <div class="login-header">
        <div style="display: flex; justify-content: flex-start; align-items: baseline">
          <h2>{{ pageTitle }}</h2>
        </div>
        <p class="subtitle">港通醫患兩端　網守健康周全</p>
      </div>
      <!-- 賬號 -->
      <a-form-item name="username" label-align="left">
        <a-input v-model:value="formState.username" placeholder="请输入账号" size="large">
          <template #prefix>
            <UserOutlined class="input-icon" />
          </template>
        </a-input>
      </a-form-item>
      <!-- 驗證碼 -->
      <!-- <a-form-item name="yzm" label-align="left">
        <div class="yzm-row">
          <a-input v-model:value="formState.yzm" placeholder="验证码" size="large" class="yzm-input">
            <template #prefix>
              <SafetyOutlined class="input-icon" />
            </template>
          </a-input>
          <a-button type="default" size="large" class="yzm-btn" :disabled="countDown > 0 || !formState.username"
            @click="handleGetCode">
            {{ countDown > 0 ? `${countDown}s後重新獲取` : "获取验证码" }}
          </a-button>
        </div>
      </a-form-item> -->
      <!-- 密碼 -->
      <a-form-item name="password" label-align="left">
        <a-input-password v-model:value="formState.password" placeholder="请输入密码" size="large">
          <template #prefix>
            <LockOutlined class="input-icon" />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" size="large" :loading="loading" block class="login-btn">
          登录
        </a-button>
      </a-form-item>
    </a-form>
    <div class="login-footer">
      <div class="copyright">
        广州南沙信兴互联网医院有限公司 版权所有 © 2024 <span @click="open" class="icp-number">粤ICP备2024187661号</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { message } from "ant-design-vue";
import router from "@/router/index.js";
import { reactive, ref } from "vue";
import { getyanzhengma, getlogin } from "@/api/yyf.js";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();

const loading = ref(false);
const countDown = ref(0);
let timer = null;

const formState = reactive({
  username: "", //hkhq_yyf01
  password: "", // hkhqyyf01
  yzm: "",
});

const formRules = {
  username: [{ required: true, message: "請輸入用戶名", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
  yzm: [{ required: true, message: "請輸入驗證碼", trigger: "blur" }],
};

const handleGetCode = async () => {
  if (!formState.username) {
    return message.warning("請先輸入賬號");
  }
  const res = await getyanzhengma({ loginName: formState.username });
  console.log(res);
  if (res.code == "200" && res.data == "验证码获取成功") {
    message.success("驗證碼已發送");
    console.log(res);
    countDown.value = 60;
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      countDown.value--;
      if (countDown.value <= 0) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  } else if (res.code == "200" && res.data == "验证码5分钟内有效") {
    message.error("验证码5分钟内有效");
  } else {
    message.error("用户不存在");
  }
};

const handleLogin = async () => {
  loading.value = true;
  try {
    // if (!formState.username || !formState.password || !formState.yzm) {
    //   message.warning("請完善登入信息");
    //   loading.value = false;
    //   return;
    // }
    if (!formState.username || !formState.password) {
      message.warning("請完善登入信息");
      loading.value = false;
      return;
    }
    const res = await getlogin({
      loginName: formState.username,
      passWord: formState.password,
      // code: formState.yzm * 1,
      status: "1",
      roleType: roleType.value,
    });
    console.log("登入返回結果：", res);
    if (res.code == "200" && res.data.message == "success") {
      // 保存 token
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("username", res.data.data[0].loginName);
      sessionStorage.setItem("roleType", res.data.data[0].roleType);
      sessionStorage.setItem("userId", res.data.data[0].userId);
      sessionStorage.setItem("orgId", res.data.data[0].orgId);
      sessionStorage.setItem("roleType", res.data.data[0].roleType);
      sessionStorage.setItem("idCardNo", res.data.data[0].idCardNo);
      sessionStorage.setItem("realName", res.data.data[0].realName);

      authStore.setToken(res.data.token);
      // 加载权限（必须在进入首页前完成）
      try {
        await authStore.loadPermissions(res.data.data[0].roleId * 1);
      } catch (error) {
      }

      router.push("/home");
      message.success("登入成功");
    } else {
      message.error(res.data.message || "登入失敗");
    }
  } catch (error) {
    console.error(error);
    message.error("登入出錯");
  } finally {
    loading.value = false;
  }
};

const hostname = window.location.hostname; // 当前域名
const prefix = hostname.split(".")[0]; // 取前缀
console.log(prefix);

const pageTitle = ref("");

const roleType = ref("");

switch (prefix) {
  case "hqgy":
    pageTitle.value = "信兴综合门诊部互联网医院系统";
    roleType.value = "admin";
    break;
  case "doctor":
    pageTitle.value = "信兴医生端";
    roleType.value = "doctor";
    break;
  case "pharmacist":
    pageTitle.value = "信兴药师端";
    roleType.value = "pharmacist";
    break;
  case "supergy":
    pageTitle.value = "信兴综合门诊部互联网医院系统";
    roleType.value = "superuser";
    break;
  case "dispensary":
    pageTitle.value = "信兴药房端";
    roleType.value = "dispensary";
    break;
  default:
    pageTitle.value = "信兴综合门诊部互联网医院系统";
    roleType.value = "pharmacist";
}

const open = () => {
  window.open("https://beian.miit.gov.cn/");
};
</script>
<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
  background: url("@/assets/img/9.png") no-repeat;
  background-size: cover;
  padding: 20px;

  .login-form {
    width: 100%;
    max-width: 680px;
    padding: 50px 60px 60px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);

    .login-header {
      margin-bottom: 40px;

      h2 {
        color: #000;
        font-size: 36px;
        font-weight: 700;
        margin: 0 0 12px 0;
        letter-spacing: 2px;
      }

      .subtitle {
        color: #999;
        font-size: 14px;
        margin: 0;
        font-weight: 400;
      }
    }

    :deep(.ant-form-item) {
      margin-bottom: 24px;
    }

    :deep(.ant-input),
    :deep(.ant-input-password) {
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      padding: 12px 16px;
      font-size: 15px;
      background: #fff;

      &:hover,
      &:focus {
        border-color: #d0d0d0;
        background: #fff;
      }
    }

    :deep(.ant-input-affix-wrapper) {
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      padding: 12px 16px;
      background: #fff;

      &:hover,
      &:focus,
      &:focus-within {
        border-color: #d0d0d0;
        background: #fff;
      }

      .ant-input {
        background: transparent;
        border: none;
        padding: 0;
      }
    }

    :deep(.input-icon) {
      color: #bbb;
      font-size: 18px;
    }

    .yzm-row {
      display: flex;
      gap: 12px;
      width: 100%;
    }

    .yzm-input {
      flex: 1;
    }

    .yzm-btn {
      height: 48px;
      min-width: 180px;
      border-radius: 12px;
      background: #e8f4ff;
      border: 1px solid #d0e8ff;
      color: #409eff;
      font-size: 15px;
      white-space: nowrap;
      padding: 0 20px;
    }

    .login-btn {
      height: 52px;
      border-radius: 12px;
      background: #1A6B8A;
      border: none;
      font-size: 16px;
      font-weight: 500;
      margin-top: 12px;
    }
  }
}

.login-footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
}

.icp-number {
  cursor: pointer;
  color: #fff;
  /* 默认颜色 */
  transition: color 0.3s;
  /* 平滑过渡 */
}

.icp-number:hover {
  color: #1A6B8A;
  /* 悬停时颜色，比如 Ant Design 蓝色 */
}
</style>
