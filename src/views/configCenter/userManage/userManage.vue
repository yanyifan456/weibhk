<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" class="search-form">
        <a-form-item :label="$t('labelText.userName')">
          <a-input v-model:value="form.userName" :placeholder="$t('public.input')" style="width: 200px" allowClear />
        </a-form-item>

        <a-form-item :label="$t('labelText.roleName')">
          <a-select style="width: 200px" :placeholder="$t('public.select')" v-model:value="form.roleName">
            <a-select-option v-for="item in roleList" :key="item.roleId" :value="item.roleId">
              {{ item.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('labelText.phone')">
          <a-input v-model:value="form.telPhone" :placeholder="$t('public.input')" style="width: 200px" allowClear />
        </a-form-item>
        <a-form-item class="search-actions">
          <a-button type="primary" @click="handleSearch">{{ $t("public.search") }}</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">{{ $t("public.reset") }}</a-button>
          <a-button style="margin-left: 8px; background-color: #52ae7b; color: #fff" type="primary"
            @click="addModal = true">
            {{ $t("public.add") }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card style="margin-bottom: 16px">
      <a-table :columns="columns" :data-source="userList" :pagination="pagination" row-key="id" @change="changePage"
        :scroll="{ y: 470 }" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == 'status'">
            <a-tag :color="record.status == 1 ? 'processing' : 'error'">
              {{ record.status == 1 ? t("public.enable") : t("public.disable") }}
            </a-tag>
          </template>
          <template v-if="column.key == 'action'">
            <a-button type="link" @click="openEditModal(record)">
              {{ $t("public.edit") }}
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
  <UserModal :mode="'add'" :visible="addModal" @update:visible="addModal = $event" :roleList="roleList"
    :hospitalList="hospitalList" @success="getUserData" />

  <UserModal :mode="'edit'" :visible="editModal" :modelValue="currentUser" @update:visible="editModal = $event"
    :roleList="roleList" :hospitalList="hospitalList" @success="getUserData" />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";

import { getRoleList, getUserList, updateUserStatus, getCode, addUser, getHospital } from "@/api/api1";
import UserModal from "./components/modal.vue";

const { t } = useI18n();

const roleList = ref([]); // 角色列表
const userList = ref([]); // 用户列表数据
const editModal = ref(false); // 编辑弹窗开关
const currentUser = ref({}); // 当前选中的用户
const hospitalList = ref([]);
const addModal = ref(false);

const form = reactive({
  userName: "",
  roleName: null,
  telPhone: "",
});

// 查询
const handleSearch = () => {
  if (!/^[0-9]*$/.test(form.telPhone)) {
    message.error("手机号码输入有误");
    return;
  }
  pagination.current = 1;
  queryParams.value = {
    loginName: form.userName,
    telPhone: form.telPhone,
    roleId: form.roleName,
  };
  getUserData();
};

const queryParams = ref({});

// 重置
const handleReset = () => {
  form.userName = "";
  form.roleName = null;
  form.telPhone = "";
  pagination.current = 1;
  queryParams.value = {};
  getUserData();
};

/**
 * ===============================
 * 4. 表格列配置 & 分页
 * ===============================
 */
const columns = computed(() => [
  { title: t("userTableHeader.loginName"), dataIndex: "loginName", key: "loginName", align: "center" },
  { title: t("userTableHeader.roleName"), dataIndex: "roleName", key: "roleName", align: "center" },
  { title: t("labelText.hospital"), dataIndex: "hospital", key: "hospital", align: "center" },
  { title: t("labelText.countryCode"), dataIndex: "countryCode", key: "countryCode", align: "center" },
  { title: t("userTableHeader.phone"), dataIndex: "telPhone", key: "telPhone", align: "center" },
  { title: t("public.status"), dataIndex: "status", key: "status", align: "center" },
  { title: t("public.action"), key: "action", align: "center" },
]);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `${t("public.total")} ${total} ${t("public.records")}`,
});

const changePage = (pgn) => {
  pagination.current = pgn.current;
  pagination.pageSize = pgn.pageSize;
  getUserData();
};

/**
 * ===============================
 * 5. 数据获取接口
 * ===============================
 */

// 获取角色列表
const getRoleData = async () => {
  try {
    const res = await getRoleList({});
    roleList.value = res.data.data;
    pagination.total = res.data.total;
  } catch (error) {
    console.log("🚀 getRoleData error:", error);
  }
};

// 获取用户列表数据
const getUserData = async () => {
  // loginName: form.userName,
  //   telPhone: form.telPhone,
  //   roleId: form.roleName,

  const params = {
    ...queryParams.value,
    current: pagination.current,
    pageSize: pagination.pageSize,
  };

  try {
    const res = await getUserList(params);
    userList.value = res.data.data;
    pagination.total = res.data.total;
  } catch (error) {
    console.log("🚀 getUserData error:", error);
  }
};
const getHospitalList = async () => {
  try {
    const res = await getHospital({});
    hospitalList.value = res.data.data;
  } catch (error) {
    console.log("🚀 getHospitalList error:", error);
  }
};

const openEditModal = (record) => {
  currentUser.value = { ...record };
  editModal.value = true;
};
onMounted(() => {
  getRoleData();
  getUserData();
  getHospitalList();
});
</script>
<style scoped lang="scss">
.search-form {
  display: flex;
  width: 100%;
  align-items: center;
  flex-wrap: wrap;
}

.search-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.remote-consultation {
  padding: 0px 0px 12px;
  box-sizing: border-box;
  //min-height: 100vh;

  .consultation-modal {
    .ant-table {
      border: 1px solid #f0f0f0;
    }
  }

  .consultation-report {
    .ant-table {
      .ant-table-tbody>tr>td {
        padding: 8px 12px;
      }
    }
  }
}
</style>
