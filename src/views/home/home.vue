<template>
  <div class="appointment-container">
    <!-- 今日工作汇总 -->
    <div class="work-summary">
      <h2 class="summary-title">{{ t("summary.title") }}</h2>
      <div class="stats-grid">
        <div class="stat-card stat-orange" style="background-color: rgba(250, 157, 42, 1)">
          <div class="stat-icon">
            <img src="@/assets/img/1.png" alt="icon" style="width: 56px; height: 56px" />
          </div>
          <div class="stat-content">
            <div class="stat-value" style="color: #fff">{{ stats.outpatient }}</div>
            <div class="stat-label" style="color: #fff">{{ t("summary.outpatient") }}</div>
          </div>
        </div>
        <div class="stat-card stat-blue" style="background-color: rgba(72, 146, 254, 1)">
          <div class="stat-icon">
            <img src="@/assets/img/2.png" alt="icon" style="width: 56px; height: 56px" />
          </div>
          <div class="stat-content">
            <div class="stat-value" style="color: #fff">{{ 3062 }}</div>
            <div class="stat-label" style="color: #fff">{{ t("summary.medicationStock") }}</div>
          </div>
        </div>
        <div class="stat-card stat-cyan" style="background-color: rgba(71, 207, 245, 1)">
          <div class="stat-icon">
            <img src="@/assets/img/3.png" alt="icon" style="width: 56px; height: 56px" />
          </div>
          <div class="stat-content">
            <div class="stat-value" style="color: #fff">{{ stats.pharmacyPrice }}</div>
            <div class="stat-label" style="color: #fff">{{ t("summary.pharmacyPrice") }}</div>
          </div>
        </div>
        <div class="stat-card stat-green" style="background-color: rgba(75, 216, 132, 1)" @click="huanzhe">
          <div class="stat-icon">
            <img src="@/assets/img/4.png" alt="icon" style="width: 56px; height: 56px" />
          </div>
          <div class="stat-content">
            <div class="stat-value" style="color: #fff">{{ asd?.userCount }}</div>
            <div class="stat-label" style="color: #fff">{{ t("summary.patientCount") }}</div>
          </div>
        </div>
        <div class="stat-card stat-green-alt" style="background-color: rgba(75, 216, 132, 1)">
          <div class="stat-icon">
            <img src="@/assets/img/5.png" alt="icon" style="width: 56px; height: 56px" />
          </div>
          <div class="stat-content">
            <div class="stat-value" style="color: #fff">{{ 10000 }}</div>
            <div class="stat-label" style="color: #fff">{{ t("summary.pharmacyRevenue") }}</div>
          </div>
        </div>
        <div class="stat-card stat-cyan-alt" style="background-color: rgba(71, 207, 245, 1)">
          <div class="stat-icon">
            <img src="@/assets/img/6.png" alt="icon" style="width: 56px; height: 56px" />
          </div>
          <div class="stat-content">
            <div class="stat-value" style="color: #fff">{{ 500 }}</div>
            <div class="stat-label" style="color: #fff">{{ t("summary.materialStock") }}</div>
          </div>
        </div>
        <div class="stat-card stat-blue-alt" style="background-color: rgba(72, 146, 254, 1)">
          <div class="stat-icon">
            <img src="@/assets/img/7.png" alt="icon" style="width: 56px; height: 56px" />
          </div>
          <div class="stat-content">
            <div class="stat-value" style="color: #fff">{{ stats.medicationReceipt }}</div>
            <div class="stat-label" style="color: #fff">{{ t("summary.medicationReceipt") }}</div>
          </div>
        </div>
        <div class="stat-card stat-orange-alt" style="background-color: rgba(250, 157, 42, 1)" @click="godoctor">
          <div class="stat-icon">
            <img src="@/assets/img/8.png" alt="icon" style="width: 56px; height: 56px" />
          </div>
          <div class="stat-content">
            <div class="stat-value" style="color: #fff">{{ asd?.doctorCount }}</div>
            <div class="stat-label" style="color: #fff">{{ t("summary.doctorCount") }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约记录 -->
    <div class="appointment-section">
      <div class="filter-bar">
        <h2 class="section-title">{{ t("appointment.title") }}</h2>
        <a-select v-model:value="statusFilter" :placeholder="t('appointment.orderStatus')" class="status-select">
          <a-select-option value="">{{ t("appointment.orderStatus") }}</a-select-option>
          <a-select-option value="paid">{{ t("appointment.paid") }}</a-select-option>
          <a-select-option value="unpaid">{{ t("appointment.unpaid") }}</a-select-option>
        </a-select>
      </div>

      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading"
        class="appointment-table">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'fee'">
            <span class="fee-text">{{ record.fee }}</span>
          </template>
          <template v-if="column.key === 'status'">
            <span class="status-tag status-paid">{{ record.status }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { getHome } from "@/api/yyf.js";

import { routes } from "vue-router/auto-routes";
const router = useRouter();
// 国际化
const { t } = useI18n();

// 加载状态
const loading = ref(false);

// 统计数据
const stats = ref({
  outpatient: 0,
  medicationStock: 100,
  pharmacyPrice: 1000,
  patientCount: 1000,
  pharmacyRevenue: "1000.000000",
  materialStock: 10,
  medicationReceipt: 100,
  doctorCount: 100,
});
const asd = ref();
const getlistsh = async () => {

  const res = await getHome({});
  asd.value = res.data.data;
  console.log(asd.value);
};
getlistsh()
// 搜索和筛选
const searchValue = ref("");
const statusFilter = ref("");


// 表格列配置
const columns = computed(() => [
  {
    title: t("appointment.orderNumber"),
    dataIndex: "orderNumber",
    key: "orderNumber",
    width: 120,
  },
  {
    title: t("appointment.doctor"),
    dataIndex: "doctor",
    key: "doctor",
    width: 100,
  },
  {
    title: t("appointment.patient"),
    dataIndex: "patient",
    key: "patient",
    width: 100,
  },
  {
    title: t("appointment.time"),
    dataIndex: "time",
    key: "time",
    width: 180,
  },
  {
    title: t("appointment.fee"),
    dataIndex: "fee",
    key: "fee",
    width: 100,
  },
  {
    title: t("appointment.paymentType"),
    dataIndex: "paymentType",
    key: "paymentType",
    width: 100,
  },
  {
    title: t("appointment.status"),
    dataIndex: "status",
    key: "status",
    width: 100,
  },
]);

// 表格数据
const dataSource = ref([
  {
    key: "1",
    orderNumber: "DU42386-1",
    doctor: "Zhang San",
    patient: "陳大文",
    time: "2025-11-20 09:38",
    fee: "¥115",
    paymentType: "微信",
    status: "已支付",
  },
  {
    key: "2",
    orderNumber: "DU42387-2",
    doctor: "Zhang San",
    patient: "张三",
    time: "2025-09-20 12:00",
    fee: "¥129",
    paymentType: "微信",
    status: "已支付",
  },
  {
    key: "3",
    orderNumber: "DU42388-3",
    doctor: "Zhang San",
    patient: "李塱燊",
    time: "2025-11-14 09:36",
    fee: "¥184",
    paymentType: "微信",
    status: "已支付",
  },
  {
    key: "4",
    orderNumber: "DU42389-4",
    doctor: "Zhang San",
    patient: "蔡紅女",
    time: "2025-10-20 12:00",
    fee: "¥136",
    paymentType: "微信",
    status: "已支付",
  },
  {
    key: "5",
    orderNumber: "DU42390-5",
    doctor: "Zhang San",
    patient: "鹤山市",
    time: "2025-09-25 12:00",
    fee: "¥255",
    paymentType: "微信",
    status: "已支付",
  },
]);

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 1,
  showTotal: (total: number) => `${t("appointment.total")}${total}${t("appointment.pages")}`,
  showSizeChanger: false,
});
const godoctor = () => {
  if (sessionStorage.getItem("roleType") == "admin") {
    router.push("/userManage/customerCenter");
  }
};
const huanzhe = () => {
  if (sessionStorage.getItem("roleType") == "admin") {
    router.push("/userManage/Patient");
  }
};
</script>

<style scoped lang="scss">
.appointment-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

// 今日工作汇总
.work-summary {
  margin-bottom: 32px;

  .summary-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .stat-card {
    background: #fff;
    width: 340px;
    height: 140px;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }

    .stat-content {
      flex: 1;
      min-width: 0;

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #333;
        line-height: 1.2;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    &.stat-orange .stat-icon {
      background: linear-gradient(135deg, #ff9a44 0%, #fc6076 100%);
    }

    &.stat-blue .stat-icon {
      background: linear-gradient(135deg, #5b8aff 0%, #4a7cf6 100%);
    }

    &.stat-cyan .stat-icon {
      background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%);
    }

    &.stat-green .stat-icon {
      background: linear-gradient(135deg, #4cd964 0%, #2ecc71 100%);
    }

    &.stat-green-alt .stat-icon {
      background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%);
    }

    &.stat-cyan-alt .stat-icon {
      background: linear-gradient(135deg, #45aaf2 0%, #2e86de 100%);
    }

    &.stat-blue-alt .stat-icon {
      background: linear-gradient(135deg, #5f87fc 0%, #4a69ff 100%);
    }

    &.stat-orange-alt .stat-icon {
      background: linear-gradient(135deg, #ffa940 0%, #fa8c16 100%);
    }
  }
}

// 预约记录
.appointment-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    margin-bottom: 20px;

    .search-input {
      flex: 1;
      max-width: 400px;
    }

    .status-select {
      width: 200px;
    }
  }

  .appointment-table {
    :deep(.ant-table) {
      font-size: 14px;

      .ant-table-thead>tr>th {
        background: #fafafa;
        color: #666;
        font-weight: 500;
        border-bottom: 1px solid #f0f0f0;
      }

      .ant-table-tbody>tr>td {
        border-bottom: 1px solid #f0f0f0;
      }

      .ant-table-tbody>tr:hover>td {
        background: #fafafa;
      }
    }

    .fee-text {
      color: #52c41a;
      font-weight: 500;
    }

    .status-tag {
      display: inline-block;
      padding: 2px 12px;
      border-radius: 4px;
      font-size: 13px;

      &.status-paid {
        background: #e6f7ff;
        color: #1890ff;
      }
    }

    :deep(.ant-pagination) {
      margin-top: 16px;
      text-align: right;

      .ant-pagination-total-text {
        margin-right: auto;
      }
    }
  }
}
</style>
