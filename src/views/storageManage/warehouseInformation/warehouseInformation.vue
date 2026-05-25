<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="formRef" class="search-form">
        <a-form-item :label="$t('labelText.wareHouse.label')">
          <a-input
            v-model:value="form.materialName"
            :placeholder="$t('public.input')"
            style="width: 200px"
            allowClear
          />
        </a-form-item>

        <a-form-item :label="$t('public.status')">
          <a-select style="width: 200px" :placeholder="$t('public.select')" v-model:value="form.activate">
            <a-select-option v-for="item in roleList" :key="item.id" :value="item.status">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <div class="search-actions">
          <a-button type="primary" @click="handleSearch">{{ $t("public.search") }}</a-button>
          <a-button style="margin-left: 20px" @click="handleReset">{{ $t("public.reset") }}</a-button>
        </div>
      </a-form>
    </a-card>
    <a-card>
      <div style="margin-bottom: 20px; display: flex; justify-content: flex-end; align-items: center">
        <a-button
          style="margin-right: 20px; background-color: #52ae7b; color: #fff"
          type="primary"
          @click="addModal = true"
        >
          {{ $t("public.add") }}
        </a-button>
        <a-button style="background-color: #52ae7b; color: #fff" type="primary" @click="exportMethod">
          {{ $t("public.export") }}
        </a-button>
      </div>
      <a-table
        class="ant-table-striped"
        bordered
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        row-key="id"
        @change="changePage"
        :scroll="{ y: 470, x: 'max-content' }"
        :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == 'status'">
            <a-tag :color="record.status == 1 ? 'processing' : 'error'">
              {{ record.status == 1 ? t("public.enable") : t("public.disable") }}
            </a-tag>
          </template>
          <template v-if="column.key == 'activate'">
            <a-tag :color="record.activate == 1 ? 'processing' : 'error'">
              {{ record.activate == 1 ? t("public.enable") : t("public.disable") }}
            </a-tag>
          </template>
          <template v-if="column.key == 'action'">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr)">
              <a-button type="link" @click="editHandle(record)">
                {{ $t("public.edit") }}
              </a-button>
              <a-popconfirm
                :title="t('public.deleteTip')"
                :ok-text="t('public.confirm')"
                :cancel-text="t('public.cancel')"
                @confirm="confirmDelete(record.id)"
              >
                <a-button type="link" style="color: #ff4d4f">
                  {{ $t("public.delete") }}
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
        <template #footer>
          <div class="table-footer">
            <span>{{ $t("wareHouseTableFooter.totalPrice") }}：{{ summary.totalPrice }}</span>
            <span>{{ $t("wareHouseTableFooter.totalStock") }}：{{ summary.totalStock }}</span>
            <span>{{ $t("wareHouseTableFooter.totalCost") }}：{{ summary.totalCost }}</span>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
  <!-- 新增模态框 -->
  <AddWarehouseModal v-model:visible="addModal" @success="getData" />
  <EditWarehouseModal v-model:visible="editModal" :data="currentData" @success="getData" />
</template>

<script setup>
/**
 * ===============================
 * 1. Imports（引入）
 * ===============================
 */
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import AddWarehouseModal from "./components/addModal.vue";
import EditWarehouseModal from "./components/editModal.vue";

import { deleteWarehouseInfo, getWarehouseInfo, exportWarehouseInfo } from "@/api/api1";
import { downloadByApi } from "@/utils/down.js";

/**
 * ===============================
 * 2. 国际化 & 响应式变量
 * ===============================
 */
const { t } = useI18n();

const roleList = ref([
  { id: 1, status: 1, value: t("public.enable") },
  { id: 2, status: 0, value: t("public.disable") },
]); // 状态
const dataList = ref([]);
const editModal = ref(false);
const currentUser = ref(null);
const summary = reactive({
  totalPrice: 0,
  totalStock: 0,
  totalCost: 0,
});

/**
 * ===============================
 * 3. 搜索表单逻辑
 * ===============================
 */
const formRef = ref(null);
const form = reactive({
  materialName: "",
  activate: null,
});

// 查询
const handleSearch = () => {
  getData();
};

// 重置
const handleReset = () => {
  form.materialName = "";
  form.activate = null;
  getData();
};

/**
 * ===============================
 * 4. 表格列配置 & 分页
 * ===============================
 */
const columns = computed(() => [
  { title: t("public.index"), dataIndex: "index", key: "index", align: "center", width: 80 },
  {
    title: t("wareHouseTableHeader.materialName"),
    dataIndex: "materialName",
    key: "materialName",
    align: "center",
    width: 200,
  },
  { title: t("wareHouseTableHeader.unitPrice"), dataIndex: "unitPrice", key: "unitPrice", align: "center", width: 120 },
  { title: t("wareHouseTableHeader.supplier"), dataIndex: "supplier", key: "supplier", align: "center", width: 120 },
  { title: t("wareHouseTableHeader.unit"), dataIndex: "unit", key: "unit", align: "center", width: 100 },
  { title: t("wareHouseTableHeader.validDate"), dataIndex: "validDate", key: "validDate", align: "center", width: 150 },
  {
    title: t("wareHouseTableHeader.reorderLevel"),
    dataIndex: "reorderLevel",
    key: "reorderLevel",
    align: "center",
    width: 120,
  },
  { title: t("wareHouseTableHeader.rsvInfo"), dataIndex: "rsvInfo", key: "rsvInfo", align: "center", width: 150 },
  { title: t("wareHouseTableHeader.activate"), dataIndex: "activate", key: "activate", align: "center", width: 100 },
  { title: t("public.action"), key: "action", align: "center", width: 100 },
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
  getData();
};

/**
 * ===============================
 * 5. 数据获取接口
 * ===============================
 */

// 获取列表数据
const getData = async () => {
  const params = {
    materialName: form.materialName,
    activate: form.activate,
    currentPage: pagination.current,
    pageSize: pagination.pageSize,
  };

  try {
    const res = await getWarehouseInfo(params);

    dataList.value = res.data.data;
    // 增加序号
    dataList.value = res.data.data.map((item, index) => {
      return {
        ...item,
        index: index + 1,
      };
    });
    summary.totalPrice = res.data.totalPrice;
    summary.totalStock = res.data.totalStock;
    summary.totalCost = res.data.totalCost;
    pagination.total = res.data.total;
  } catch (error) {
    console.log("🚀 getUserData error:", error);
  }
};

const addModal = ref(false);

const currentData = ref(null);
const editHandle = (record) => {
  currentData.value = record;
  editModal.value = true;
};

const confirmDelete = async (id) => {
  try {
    const res = await deleteWarehouseInfo({ id });
    message.success(res.data.message);
    getData();
  } catch (error) {
    console.log("🚀 delete error:", error);
  }
};

// 下载仓库信息
const exportMethod = async () => {
  await downloadByApi(exportWarehouseInfo, { materialName: form.materialName, activate: form.activate });
};

/**
 * ===============================
 * 7. 生命周期
 * ===============================
 */
onMounted(() => {
  getData();
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
      .ant-table-tbody > tr > td {
        padding: 8px 12px;
      }
    }
  }
}
.table-footer {
  display: flex;
  justify-content: flex-end; /* 靠右，可换成 space-between */
  align-items: center;
  gap: 24px; /* 每个统计项之间的间距 */
  font-size: 14px;
  color: #333;
  background: #fafafa; /* 可选，让底部更清晰 */
}

.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
