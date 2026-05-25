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
        <a-button
          style="margin-right: 20px; background-color: #52ae7b; color: #fff"
          type="primary"
          @click="exportModal = true"
        >
          {{ $t("public.trade") + $t("public.detail") }}
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
        </template>
        <template #footer>
          <div class="table-footer">
            <span>{{ $t("operationReportTableFooter.totalAppoint") }}：{{ summary.totalAppoint }}</span>
            <span>{{ $t("operationReportTableFooter.totalCompleted") }}：{{ summary.totalCompleted }}</span>
            <span>{{ $t("operationReportTableFooter.totalUnCompleted") }}：{{ summary.totalUnCompleted }}</span>
            <span>{{ $t("operationReportTableFooter.totalCancelled") }}：{{ summary.totalCancelled }}</span>
            <span>{{ $t("operationReportTableFooter.totalSales") }}：{{ summary.totalSales }}</span>
            <span>{{ $t("operationReportTableFooter.totalReceived") }}：{{ summary.totalReceived }}</span>
            <span>{{ $t("operationReportTableFooter.totalAmountDue") }}：{{ summary.totalAmountDue }}</span>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
  <ExportModal v-model:visible="exportModal" @success="getData" />
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
import { getOperationData, printOperationData } from "@/api/api1";

import ExportModal from "./components/modal.vue";
import { downloadByApi } from "@/utils/down.js";

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
  totalAppoint: 0, // 合计预约
  totalCompleted: 0, //合计完成
  totalUnCompleted: 0, //合计未完成
  totalCancelled: 0, //合计已取消
  totalSales: 0, //合计总售价
  totalReceived: 0, //合计已收
  totalAmountDue: 0, //合计欠付
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
    title: t("public.date"),
    dataIndex: "date",
    key: "date",
    align: "center",
    width: 100,
  },
  {
    title: t("operationReportTableHeader.reserved"),
    dataIndex: "Reserved(Orders)",
    key: "Reserved(Orders)",
    align: "center",
    width: 100,
  },
  {
    title: t("operationReportTableHeader.completed"),
    dataIndex: "Completed(Orders)",
    key: "Completed(Orders)",
    align: "center",
    width: 100,
  },
  {
    title: t("operationReportTableHeader.incomplete"),
    dataIndex: "Incomplete(Orders)",
    key: "Incomplete(Orders)",
    align: "center",
    width: 100,
  },
  {
    title: t("operationReportTableHeader.canceled"),
    dataIndex: "Cancelled(Orders)",
    key: "Cancelled(Orders)",
    align: "center",
    width: 100,
  },
  {
    title: t("operationReportTableHeader.originalPrice"),
    dataIndex: "OriginalPrice($)",
    key: "OriginalPrice($)",
    align: "center",
    width: 100,
  },
  {
    title: t("operationReportTableHeader.discount"),
    dataIndex: "Discount($)",
    key: "Discount($)",
    align: "center",
    width: 100,
  },
  {
    title: t("operationReportTableHeader.totalPrice"),
    dataIndex: "TotalSales($)",
    key: "TotalSales($)",
    align: "center",
    width: 100,
  },
  {
    title: t("operationReportTableHeader.received"),
    dataIndex: "Received($)",
    key: "Received($)",
    align: "center",
    width: 100,
  },
  {
    title: t("operationReportTableHeader.arrears"),
    dataIndex: "Outstanding($)",
    key: "Outstanding($)",
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

/**
 * ===============================
 * 5. 数据获取接口
 * ===============================
 */

// 获取列表数据
const getData = async () => {
  const params = {
    date: select.value,
    currentPage: pagination.current,
    pageSize: pagination.pageSize,
  };
  try {
    const res = await getOperationData(params);

    dataList.value = res.data.dailyData;
    // 增加序号
    dataList.value = res.data.dailyData.map((item, index) => {
      return {
        ...item,
        index: index + 1,
      };
    });
    summary.totalAppoint = res.data.totalAppoint;
    summary.totalCompleted = res.data.totalCompleted;
    summary.totalUnCompleted = res.data.totalUnCompleted;
    summary.totalCancelled = res.data.totalCancelled;
    summary.totalSales = res.data.totalSales;
    summary.totalReceived = res.data.totalReceived;
    summary.totalAmountDue = res.data.totalAmountDue;

    pagination.total = res.data.total;
  } catch (error) {
    console.log("🚀 getUserData error:", error);
  }
};

const exportMethod = async () => {
  if (form.date == "") {
    message.warning(t("public.select") + t("public.date"));
    return;
  }
  await downloadByApi(printOperationData, { date: select.value });
};

/**
 * ===============================
 * 7. 生命周期
 * ===============================
 */
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
