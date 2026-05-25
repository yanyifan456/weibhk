<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="formRef" class="search-form">
        <a-form-item :label="$t('public.date')">
          <a-month-picker
            v-model:value="form.date"
            style="width: 100%"
            :placeholder="t('public.select') + t('public.date')"
            @change="dateChange"
            :disabledDate="disabledDate"
          />
        </a-form-item>

        <div class="search-actions">
          <a-button type="primary" @click="handleSearch">{{ $t("public.search") }}</a-button>
          <a-button style="margin-left: 20px" @click="handleReset">{{ $t("public.reset") }}</a-button>
        </div>
      </a-form>
    </a-card>
    <a-card>
      <div style="margin-bottom: 20px; display: flex; justify-content: flex-end; align-items: center">
        <a-button style="background-color: #52ae7b; color: #fff" type="primary" @click="addModal = true">
          {{ $t("public.add") }}
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
            <a-popconfirm
              :title="t('public.deleteTip')"
              :ok-text="t('public.confirm')"
              :cancel-text="t('public.cancel')"
              @confirm="deleteHandle(record)"
            >
              <a-button type="link" danger>{{ t("public.delete") }}</a-button>
            </a-popconfirm>
          </template>
        </template>
        <template #footer>
          <div class="table-footer">
            <span>{{ $t("payOutTableHeader.total") }}：{{ summary.total }}</span>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
  <AddModal v-model:visible="addModal" @success="getData" />
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
import { getPayableBill, deleteExpenseBill } from "@/api/api1";
import AddModal from "./components/addModal.vue";

/**
 * ===============================
 * 2. 国际化 & 响应式变量
 * ===============================
 */
const { t } = useI18n();

const dataList = ref([]);
const select = ref(null);
const exportModal = ref(false);

const summary = reactive({
  total: 0,
});
const getCurrentDate = () => {
  return dayjs().format("YYYY-MM");
};
/**
 * ===============================
 * 3. 搜索表单逻辑
 * ===============================
 */
const formRef = ref(null);
const form = reactive({
  date: "",
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
  form.materialName = null;
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
    title: t("payInTableHeader.inputDate"),
    dataIndex: "inputDate",
    key: "inputDate",
    align: "center",
    width: 100,
  },
  {
    title: t("payInTableHeader.receiver"),
    dataIndex: "tradeStaff",
    key: "tradeStaff",
    align: "center",
    width: 100,
  },
  {
    title: t("payInTableHeader.paymentMethod"),
    dataIndex: "payType",
    key: "payType",
    align: "center",
    width: 100,
  },
  {
    title: t("payInTableHeader.category"),
    dataIndex: "tradeClass",
    key: "tradeClass",
    align: "center",
    width: 100,
  },
  {
    title: t("payInTableHeader.amount"),
    dataIndex: "unpaidFee",
    key: "unpaidFee",
    align: "center",
    width: 100,
  },
  {
    title: t("payOutTableHeader.remark"),
    dataIndex: "rsrvInfo",
    key: "rsrvInfo",
    align: "center",
    width: 100,
  },
  {
    title: t("payInTableHeader.createTime"),
    dataIndex: "createTime",
    key: "createTime",
    align: "center",
    width: 100,
  },
  {
    title: t("public.action"),
    dataIndex: "action",
    key: "action",
    align: "center",
    width: 100,
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

// 新增
const addModal = ref(false);

// 删除
const deleteHandle = (record) => {
  console.log(record);
  deletaApi(record.tradeId);
};

/**
 * ===============================
 * 5. 数据获取接口
 * ===============================
 */

// 获取列表数据
const getData = async () => {
  const params = {
    inputDate: select.value,
    currentPage: pagination.current,
    pageSize: pagination.pageSize,
  };
  try {
    const res = await getPayableBill(params);

    dataList.value = res.data.data;
    // 增加序号
    dataList.value = res.data.data.map((item, index) => {
      return {
        ...item,
        index: index + 1,
      };
    });
    summary.total = res.data.totalMoney;

    pagination.total = res.data.total;
  } catch (error) {
    console.log("🚀 getUserData error:", error);
  }
};

const deletaApi = async (id) => {
  try {
    const res = await deleteExpenseBill({ tradeId: id });
    message.success(res.data.message);
    getData();
  } catch (error) {
    console.log("🚀 ~ deletaApi ~ error:", error);
  }
};
onMounted(() => {
  select.value = getCurrentDate();
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
