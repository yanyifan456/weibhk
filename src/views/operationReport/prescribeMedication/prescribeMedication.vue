<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="formRef" class="search-form">
        <a-form-item :label="$t('public.date')">
          <a-date-picker
            v-model:value="form.createTime"
            style="width: 100%"
            :placeholder="t('public.select') + t('public.date')"
            @change="dateChange"
            :disabledDate="disabledDate"
          />
        </a-form-item>
        <a-form-item :label="$t('button.materialsname')">
          <a-select style="width: 200px" :placeholder="$t('public.select')" v-model:value="form.name" show-search>
            <a-select-option v-for="item in materialList" :key="item.id" :value="item.name">
              {{ item.name }}
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
        :scroll="{ y: 470 }"
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
        </template>
        <template #footer>
          <div class="table-footer">
            <span>
              {{ $t("makeMedicalTableFooter.totalQuantity") }}：
              <span style="font-weight: bold">{{ summary.totalQuantity || 0 }}</span>
            </span>
            <span>
              {{ $t("makeMedicalTableFooter.totalCost") }}：
              <span style="font-weight: bold">{{ summary.totalCost || 0 }} </span>
            </span>
            <span>
              {{ $t("makeMedicalTableFooter.totalPrice") }}：
              <span style="font-weight: bold">{{ summary.totalPrice || 0 }} </span>
            </span>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
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
import dayjs from "dayjs";
import { getDrugOut, getDrugList, printDrugOut } from "@/api/api1";
import { downloadByApi } from "@/utils/down";
/**
 * ===============================
 * 2. 国际化 & 响应式变量
 * ===============================
 */
const { t } = useI18n();

const dataList = ref([]);
const select = ref(null);
const exportModal = ref(false);
const materialList = ref([]);

const summary = reactive({
  totalQuantity: 0, // 合计总数量
  totalCost: 0, //合计总成本
  totalPrice: 0, //合计总售价
});
const getCurrentDate = () => {
  return dayjs().format("YYYY-MM-DD");
};
/**
 * ===============================
 * 3. 搜索表单逻辑
 * ===============================
 */
const formRef = ref(null);
const form = reactive({
  createTime: "",
  name: null,
});

const disabledDate = (current) => current && current > dayjs().endOf("day");
const dateChange = (date, dateString) => {
  select.value = dateString;
};

// 查询
const handleSearch = () => {
  getData();
};

// 重置
const handleReset = () => {
  form.name = null;
  form.createTime = "";
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
    title: t("makeMedicalTableHeader.medicineName"),
    dataIndex: "name",
    key: "name",
    align: "center",
    ellipsis: true,
  },
  {
    title: t("makeMedicalTableHeader.quantity"),
    dataIndex: "totalCost",
    key: "totalCost",
    align: "center",
  },
  {
    title: t("makeMedicalTableHeader.totalCost"),
    dataIndex: "total",
    key: "total",
    align: "center",
  },
  {
    title: t("makeMedicalTableHeader.totalPrice"),
    dataIndex: "totalPrice",
    key: "totalPrice",
    align: "center",
  },
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
    createTime: select.value,
    name: form.name,
    currentPage: pagination.current,
    pageSize: pagination.pageSize,
  };
  try {
    const res = await getDrugOut(params);

    dataList.value = res.data.data;
    // 增加序号
    dataList.value = res.data.data.map((item, index) => {
      return {
        ...item,
        index: index + 1,
      };
    });
    summary.totalQuantity = res.data.totalQuantity;
    summary.totalCost = res.data.totalCost;
    summary.totalPrice = res.data.totalPrice;

    pagination.total = res.data.total;
  } catch (error) {
    console.log("🚀 getUserData error:", error);
  }
};

// 获取药品下拉列表
const getMaterialList = async () => {
  try {
    const res = await getDrugList({});
    materialList.value = res.data.data;
  } catch (error) {
    console.log("🚀 getMaterialList error:", error);
  }
};
const exportMethod = async () => {
  if (form.createTime == "") {
    message.warning(t("public.select") + t("public.date"));
    return;
  }
  if (form.name == null) {
    message.warning(t("public.select") + t("makeMedicalTableHeader.medicineName"));
    return;
  }
  await downloadByApi(printDrugOut, { data: select.value, drugName: form.name });
};

/**
 * ===============================
 * 7. 生命周期
 * ===============================
 */
onMounted(() => {
  select.value = getCurrentDate();
  getMaterialList();
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
