<template>
  <a-modal :open="visible" :title="mode === 'add' ? t('public.add') : t('public.edit')" width="800px"
    @cancel="handleCancel" @update:open="(val) => emit('update:visible', val)">
    <a-form layout="horizontal" :model="form" :rules="rules" style="margin-top: 20px"
      :labelCol="{ style: { width: '120px' } }" ref="userFormRef">
      <a-row :gutter="24">
        <!-- 用户名（新增模式才显示） -->
        <a-col :span="12" v-if="mode === 'add'">
          <a-form-item label="用户名" name="loginName">
            <a-input v-model:value="form.loginName" placeholder="请输入用户名" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="mode === 'add'">
          <a-form-item>
            <p style="color: gray; font-weight: 700">请输入6-10位，不包含特殊字符的用户名</p>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="密码" name="passWord">
            <a-input-password v-model:value="form.passWord" placeholder="请输入密码" />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item>
            <p style="color: gray; font-weight: 700">请输入8-16位，包含数字、字母、特殊字符的密码</p>
          </a-form-item>
        </a-col>
        <a-col :span="16" v-if="mode === 'add'">
          <a-form-item label="區號" name="countryCode">
            <a-select v-model:value="form.countryCode" placeholder="请选择區號" :filterOption="filterCountry" showSearch>
              <a-select-option v-for="item in countryCodeList" :key="item.id" :value="item.countryCode"
                :countryCn="item.countryCn" :countryEn="item.countryEn" :countryCode="item.countryCode">
                {{ item.countryCn + " | " + item.countryEn + " | " + item.countryCode }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8" v-if="mode === 'add'"></a-col>

        <!-- 手机号 -->
        <a-col :span="12">
          <a-form-item label="手机号" name="telPhone">
            <a-input v-model:value="form.telPhone" placeholder="请输入手机号" :disabled="mode === 'edit'" />
          </a-form-item>
        </a-col>

        <!-- 真实姓名 -->
        <a-col :span="12">
          <a-form-item label="真实姓名" name="realName">
            <a-input v-model:value="form.realName" placeholder="请输入真实姓名" :disabled="mode === 'edit'" />
          </a-form-item>
        </a-col>

        <!-- 证件号码 -->
        <a-col :span="12">
          <a-form-item label="证件号码" name="idCardNo">
            <a-input v-model:value="form.idCardNo" placeholder="请输入证件号码" :disabled="mode === 'edit'" />
          </a-form-item>
        </a-col>

        <!-- 密码 -->

        <!-- 角色 -->
        <a-col :span="12">
          <a-form-item label="角色" name="roleId">
            <a-select v-model:value="form.roleId" placeholder="请选择角色">
              <a-select-option v-for="item in roleList" :key="item.roleId" :value="item.roleId">
                {{ item.roleName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- 医院 -->
        <a-col :span="12">
          <a-form-item label="医院" name="hospitalName">
            <a-select v-model:value="form.hospitalName" placeholder="请选择医院">
              <a-select-option v-for="item in hospitalList" :key="item.hospitalId" :value="item.hospitalName">
                {{ item.hospitalName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- 状态 -->
        <a-col :span="12">
          <a-form-item label="状态" name="status">
            <a-switch v-model:checked="form.status" />
          </a-form-item>
        </a-col>

        <!-- 验证码 -->
        <a-col :span="24">
          <a-form-item label="验证码" name="code">
            <a-input v-model:value="form.code" style="width: 244px" placeholder="请输入验证码" />
            <a-button type="primary" style="margin-left: 8px" :loading="loading" :disabled="countdown > 0"
              @click="handleSendCode">
              {{ countdown > 0 ? `${countdown}s后重试` : "获取验证码" }}
            </a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <a-button key="back" @click="handleCancel">{{ t("public.cancel") }}</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleSubmit">
        {{ t("public.confirm") }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { addUser, updateUserStatus, getCode, getCountryList } from "@/api/api1";

const props = defineProps({
  mode: { type: String, default: "add" }, // 'add' | 'edit'
  visible: { type: Boolean, default: false },
  modelValue: { type: Object, default: () => ({}) },
  roleList: { type: Array, default: () => [] },
  hospitalList: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:visible", "success"]);

const { t } = useI18n();
const loading = ref(false);
const countdown = ref(0);
let timer = null;

const form = reactive({
  loginName: "",
  telPhone: "",
  passWord: "",
  roleId: null,
  hospitalName: null,
  status: true,
  code: "",
  countryCode: null,
  realName: "",
  idCardNo: "",
});

const userFormRef = ref(null);

const rules = computed(() => ({
  loginName: [
    { required: props.mode === "add", message: "请输入用户名", trigger: "blur" },
    { pattern: /^[A-Za-z0-9]{6,10}$/, message: "用户名需为6-10位字母或数字", trigger: "blur" },
  ],
  telPhone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^[0-9]{11}$/, message: "手机号格式不正确", trigger: "blur" },
  ],
  passWord: [
    { required: props.mode === "add", message: "请输入密码", trigger: "blur" },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/,
      message: "密码需为8-16位，且包含字母、数字与特殊字符",
      trigger: "blur",
    },
  ],
  countryCode: [{ required: true, message: "请选择国家区号", trigger: "change" }],
  roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
  hospitalName: [{ required: true, message: "请选择医院", trigger: "change" }],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
  idCardNo: [{ required: true, message: "请输入证件号码", trigger: "blur" }],
}));

// 初始化表单
watch(
  () => props.modelValue,
  (val) => {
    if (props.mode == "edit") {
      Object.assign(form, {
        loginName: val.loginName || "",
        telPhone: val.telPhone || "",
        passWord: "",
        roleId: val.roleId || null,
        hospitalName: val.hospital || null,
        status: val.status !== undefined ? !!val.status : true,
        code: "",
        countryCode: val.countryCode || null,
        realName: val.realName || "",
        idCardNo: val.idCardNo || "",
      });
    } else if (props.mode == "add") {
      Object.assign(form, {
        loginName: "",
        telPhone: "",
        passWord: "",
        roleId: null,
        hospitalName: null,
        status: true,
        code: "",
        countryCode: null,
        realName: "",
        idCardNo: "",
      });
    }
  },
  { immediate: true },
);

// 发送验证码
const handleSendCode = async () => {
  if (!form.telPhone) {
    message.warning(t("public.input") + t("labelText.phone"));
    return;
  }
  if (!form.countryCode && props.mode == "add") {
    message.warning(t("public.select") + t("labelText.countryCode"));
    return;
  }
  loading.value = true;
  try {
    const res = await getCode({ telPhone: form.telPhone, countryCode: form.countryCode });
    if (res.data.verify == 1) {
      message.success(res.data.message);
    }
    message.success(res.data.message);
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 提交
const handleSubmit = () => {
  userFormRef.value
    .validate()
    .then(async () => {
      // 根据选中的 roleId 从 roleList 中获取对应的 orgId
      const selectedRole = props.roleList.find(item => item.roleId === form.roleId);
      const orgId = selectedRole ? selectedRole.orgId : null;

      const params = {
        loginName: form.loginName,
        telPhone: form.telPhone,
        passWord: form.passWord,
        roleId: form.roleId,
        hospital: form.hospitalName,
        status: form.status ? 1 : 0,
        code: form.code,
        countryCode: form.countryCode,
        orgId: orgId,
        realName: form.realName,
        idCardNo: form.idCardNo,
      };

      loading.value = true;
      try {
        if (props.mode === "add") {
          const res = await addUser(params);
          if (res.data.verify == 1) {
            message.success(res.data.message || "新增成功");
            emit("success");
            emit("update:visible", false);
          } else {
            message.error(res.data.message);
          }
        } else {
          const res = await updateUserStatus(params);
          if (res.data.verify == 1) {
            message.success(res.data.message);
            emit("success");
            emit("update:visible", false);
          } else {
            message.error(res.data.message);
          }
        }
      } catch (error) {
        console.error(error);
        message.error(error.message || "操作失败");
      } finally {
        loading.value = false;
      }
    })
    .catch((err) => {
      console.log("表单验证失败", err);
    });
};

const countryCodeList = ref([]);
const filterCountry = (input, option) => {
  const { countryCn, countryEn, countryCode } = option;

  return (
    countryCn?.toLowerCase().includes(input.toLowerCase()) ||
    countryEn?.toLowerCase().includes(input.toLowerCase()) ||
    countryCode?.toLowerCase().includes(input.toLowerCase())
  );
};
const getList = async () => {
  try {
    const res = await getCountryList({});
    countryCodeList.value = res.data.data;
    console.log(countryCodeList.value);
  } catch (error) {
  } finally {
  }
};
onMounted(() => {
  getList();
});

const resetForm = () => {
  Object.assign(form, {
    loginName: "",
    telPhone: "",
    passWord: "",
    roleId: null,
    hospitalName: null,
    status: true,
    code: "",
    countryCode: null,
  });

  userFormRef.value?.clearValidate();
};

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      resetForm();
    }
  },
);
// 取消弹窗
const handleCancel = () => {
  emit("update:visible", false);
};

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>