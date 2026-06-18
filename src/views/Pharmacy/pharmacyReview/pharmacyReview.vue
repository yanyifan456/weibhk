<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <!-- 日期选择器（年月日） -->
        <a-form-item :label="$t('form.appointmentDate')">
          <a-date-picker v-model:value="searchForm.appointmentDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
            placeholder="选择日期" style="width: 200px" />
        </a-form-item>
        <a-form-item class="search-actions">
          <a-button type="primary" @click="handleSearch">{{ $t("button.search") }}</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">{{ $t("button.reset") }}</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <!-- 数据表格 -->
    <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id"
      :row-class-name="(_record, index) => (index % 2 === 0 ? 'ant-table-row-striped' : '')" :scroll="{ y: 470 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'consultationId'">
          <a @click="showConsultationReports(record)" class="text-blue-600 hover:text-blue-800">
            {{ record.consultationId }}
          </a>
        </template>
        <template v-if="column.key === 'orderuserid'">
          <a style="color: #1A6B8A; cursor: pointer;" @click="showUserCaseModal(record)">
            点击查看
          </a>
        </template>
        <template v-else-if="column.key === 'userName'">
          <a @click="showUserDetailModal(record)" style="color: #1A6B8A; cursor: pointer;">
            {{ record.userName }}
          </a>
        </template>
        <template v-else-if="column.key === 'prescription'">
          <a @click="showPrescriptionModal(record)" style="color: #1A6B8A; cursor: pointer;">
            {{ record.consultationId }}
          </a>
        </template>
        <template v-else-if="column.key === 'state'">
          <span v-if="record.state === '0'">待药师审核</span>
          <span v-else-if="record.state === '1'">审核通过</span>
          <span v-else-if="record.state === '2'">审核不过</span>
          <span v-else-if="record.state === '4'">待用户确认</span>
        </template>
        <template v-else-if="column.key === 'shenhe'">
          <div v-if="record.state === '0'">
            <a-button type="link" size="small" @click="handleAudit(record, '1')">
              通过
            </a-button>
            <a-button type="link" size="small" danger @click="handleAudit(record, '2')">
              不通过
            </a-button>
          </div>

          <span v-else-if="record.state === '4'">待用户确认</span>
          <span v-else>已审核</span>
        </template>
      </template>
    </a-table>
    <a-modal v-model:open="editModalVisible" :title="$t('button.edit')" width="600px" @ok="saveEdit"
      @cancel="editModalVisible = false">
      <div class="mb-4">
        <div class="text-gray-700 mb-2">{{ $t("label.diagnosisReport") }}：</div>
        <a-textarea v-model:value="editForm.diagnosisReport" :rows="4" />
      </div>
      <div class="mb-4">
        <div class="text-gray-700 mb-2">{{ $t("label.medication") }}：</div>
        <a-textarea v-model:value="editForm.medicationAdvice" :rows="3" />
      </div>
    </a-modal>

    <!-- 通过审核-药品清单弹窗 -->
    <a-modal v-model:open="medicinePriceModalVisible" title="药品清单" width="1500px" @ok="confirmMedicinePrice"
      @cancel="medicinePriceModalVisible = false">
      <div class="medicine-modal">
        <a-table :columns="medicineColumns" :data-source="medicinePriceList" :pagination="false" :scroll="{ x: 1200 }"
          row-key="id">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'medicineId'">
              <span>{{ record.medicineId }}</span>
            </template>
            <template v-else-if="column.key === 'drugDetails'">
              <span>{{ record.drugDetails }}</span>
            </template>
            <template v-else-if="column.key === 'uom'">
              <span>{{ record.uom }}</span>
            </template>
            <template v-else-if="column.key === 'dosageDirections'">
              <span>{{ record.dosageDirections }}</span>
            </template>
            <template v-else-if="column.key === 'duration'">
              <span>{{ record.duration }}</span>
            </template>
            <template v-else-if="column.key === 'medicineCun'">
              <span>{{ record.medicineCun }}</span>
            </template>
            <template v-else-if="column.key === 'unit'">
              <span>{{ record.unit }}</span>
            </template>
          </template>
        </a-table>
        <!-- <div class="mt-4 text-right">
          <span class="font-bold">总价：</span>
          <span class="text-lg font-bold text-red-600">{{ calculateAllTotalPrice() }}</span>
        </div> -->
      </div>
    </a-modal>
    <!-- 不通过审核-原因说明弹窗 -->
    <a-modal v-model:open="rejectReasonModalVisible" title="审核不通过" width="600px" @ok="confirmRejectReason"
      @cancel="rejectReasonModalVisible = false">
      <div>
        <div class="text-gray-700 mb-2">不通过原因：</div>
        <a-textarea v-model:value="rejectReason" placeholder="请输入不通过原因" :rows="4" />
      </div>
    </a-modal>
    <!-- 会诊报告详情弹窗 -->
    <a-modal v-model:open="reportModalVisible" title="" width="65%" :footer="null">
      <div class="consultation-report">
        <HospitalHeader :doctor-name="checkDetail.doctorName" :hk-certificate="checkDetail.hkCertificate"
          :pro-qualify-certificate="checkDetail.proQualifyCertificate" :practice-site="checkDetail.practiceSite"
          :hospital-name="checkDetail.hospitalName" :sub-hospital-name="checkDetail.subHospitalName"
          :formId="checkDetail.formId" :hospital="checkDetail.hospital"
          :create-time="checkDetail.createTime ? String(checkDetail.createTime).slice(0, 10) : ''" />
        <hr />
        <PatientInfoRow :detail="checkDetail" />
        <div style="margin-top: 10px;"></div>
        <hr />
        <div style="margin: 10px 0 6px; margin-bottom: 50px;">
          <span>診斷意見：</span>
          <span>{{ checkDetail.diagnosticReport || '' }}</span>
        </div>
        <div style="font-size: 13px; margin-bottom: 8px;">建議服用藥物:</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px;">
          <thead>
            <tr>
              <th v-for="col in prescriptionTableHeaders" :key="col.en"
                style="border: 1px solid ; padding: 4px 4px; text-align: center; white-space: nowrap; background: #fff;">
                <div>{{ col.zh }}</div>
                {{ col.en }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="checkDetail.medicines && checkDetail.medicines.length > 0">
              <tr v-for="(item, index) in checkDetail.medicines" :key="index">
                <td style="border: 1px solid ; padding: 6px;">{{ item.medicineId || '' }}</td>

                <td style="border: 1px solid ; padding: 6px;">{{ item.drugDetails || '' }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.uom || ''
                }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.dosageDirections ||
                  '' }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.duration || '' }}
                </td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.medicineCun || ''
                }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.unit || '' }}</td>

              </tr>
            </template>
          </tbody>
        </table>
        <!-- ===== 医生签名盖章 ===== -->
        <div style="text-align: right; margin-bottom: 4px; font-size: 13px;margin-top: 200px;">
          <span>醫生簽名：</span>
          <span v-if="!checkDetail.doctorSign">XXXXX</span>
          <img v-else :src="checkDetail.doctorSign" style="height: 120px; width: auto; vertical-align: middle;"
            alt="医生签名" />
        </div>

        <!-- ===== 插槽：操作区 ===== -->
        <slot />

        <!-- ===== 底部地址栏 ===== -->
        <hr style="border: none; border-top: 1.5px solid ; margin: 10px 0 6px;" />
        <div style="display: flex; justify-content: space-between; font-size: 12px; ">
          <div>
            <!-- 底部免责说明（可根据实际需要配置） -->
            本文件屬於跨境遠程醫學諮詢與延續用藥建議，不屬於中國內地線下實體藥店之普通處方銷售憑證。

          </div>

          <div style="text-align: right;">
            <div>地址：{{ checkDetail.address || '' }}</div>
            <div>TEL：{{ checkDetail.contactPhone || '' }}</div>
          </div>
        </div>
      </div>
    </a-modal>
    <!-- 處方單弹窗 -->

    <a-modal v-model:open="prescriptionModalVisible" title="" width="65%" :footer="null"
      :bodyStyle="{ padding: '32px 40px' }">
      <PrescriptionForm :detail="dispensingDetail" />

    </a-modal>

    <!-- 用户详情弹窗 -->
    <a-modal v-model:open="userDetailModalVisible" title="用戶詳情" width="500px" :footer="null">
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item label="姓名">{{ userDetailData.userName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="性別">{{ userDetailData.sex === '1' ? '男' : userDetailData.sex === '2' ? '女' : '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="年齡">{{ userDetailData.age || '-' }}</a-descriptions-item>
        <a-descriptions-item label="身高">{{ userDetailData.height ? userDetailData.height + ' cm' : '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="體重">{{ userDetailData.weight ? userDetailData.weight + ' kg' : '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="出生日期">{{ userDetailData.birthyDay || '-' }}</a-descriptions-item>
        <a-descriptions-item label="既往病史">{{ userDetailData.phm || '-' }}</a-descriptions-item>
        <a-descriptions-item label="用藥史">{{ userDetailData.medHistory || '-' }}</a-descriptions-item>
        <a-descriptions-item label="過敏史">{{ userDetailData.allergyHistory || '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
    <!-- ========== 用户病例弹窗 ========== -->
    <a-modal v-model:open="userCaseModalVisible" :title="$t('userCase.title')" width="900px" :footer="null">
      <a-spin :spinning="userCaseLoading">
        <div v-if="userCaseList.length === 0 && !userCaseLoading" style="text-align: center; padding: 40px;">
          {{ $t('userCase.noData') }}
        </div>
        <div v-else>
          <a-collapse v-model:activeKey="activeCaseKey" accordion>
            <a-collapse-panel v-for="(item, index) in userCaseList" :key="String(item.id)"
              :header="'病歷記錄' + (index + 1) + ' - ' + item.createTime">
              <a-descriptions :column="1" bordered size="small">
                <a-descriptions-item :label="'病情描述'">{{ item.condDesc || '--'
                }}</a-descriptions-item>
                <a-descriptions-item :label="$t('userCase.historyCase')">{{ item.historyCase || '--'
                }}</a-descriptions-item>
                <a-descriptions-item :label="$t('userCase.historyDiagnosis')">{{ item.historyDiagnosis || '--'
                }}</a-descriptions-item>
                <a-descriptions-item :label="$t('userCase.historyReport')">{{ item.historyReport || '--'
                }}</a-descriptions-item>
                <a-descriptions-item :label="$t('userCase.casePhoto')">
                  <a-image-preview-group v-if="item.casePhotoDecrypt?.length > 0">
                    <a-space>
                      <a-image v-for="(photo, idx) in item.casePhotoDecrypt" :key="idx" :width="80" :src="photo"
                        :fallback="fallbackImage" />
                    </a-space>
                  </a-image-preview-group>
                  <span v-else>--</span>
                </a-descriptions-item>
                <a-descriptions-item :label="$t('userCase.diagnosisPhoto')">
                  <a-image-preview-group v-if="item.diagnosisPhotoDecrypt?.length > 0">
                    <a-space>
                      <a-image v-for="(photo, idx) in item.diagnosisPhotoDecrypt" :key="idx" :width="80" :src="photo"
                        :fallback="fallbackImage" />
                    </a-space>
                  </a-image-preview-group>
                  <span v-else>--</span>
                </a-descriptions-item>
                <a-descriptions-item :label="$t('userCase.reportPhoto')">
                  <a-image-preview-group v-if="item.reportPhotoDecrypt?.length > 0">
                    <a-space>
                      <a-image v-for="(photo, idx) in item.reportPhotoDecrypt" :key="idx" :width="80" :src="photo"
                        :fallback="fallbackImage" />
                    </a-space>
                  </a-image-preview-group>
                  <span v-else>--</span>
                </a-descriptions-item>
                <a-descriptions-item :label="$t('userCase.createTime')">{{ item.createTime || '--'
                }}</a-descriptions-item>
              </a-descriptions>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
import { auditPharmacy, selectPharmacyAuditList, selectPharmacyAuditDetail, signature, selectprescriptiondetail, selectUserDetail, selectUserCaseList } from '@/api/yyf'
import { ref, reactive, computed } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import PatientInfoRow from '../../systemManage/menuManage/remote/PatientInfoRow.vue';
import HospitalHeader from '../../systemManage/menuManage/remote/HospitalHeader.vue';
import PrescriptionForm from '../../systemManage/menuManage/remote/PrescriptionForm.vue';

import axios from 'axios';

// 国际化
const { t } = useI18n();
const checkeds = ref();
const editModalVisible = ref(false);
const editForm = reactive({
  id: null,
  diagnosisReport: "",
  medicationAdvice: "",
});

// 通过审核-药品清单
const medicinePriceModalVisible = ref(false);
const medicinePriceList = ref([]);
const currentAuditRecord = ref(null);

const medicineColumns = [
  { title: "藥品代碼", dataIndex: "medicineId", key: "medicineId", align: "center", width: 100 },
  { title: "藥品詳情", dataIndex: "drugDetails", key: "drugDetails", align: "center", width: 600 },
  { title: "計量單位", dataIndex: "uom", key: "uom", align: "center", width: 100 },
  { title: "用法用量", dataIndex: "dosageDirections", key: "dosageDirections", align: "center", width: 100 },
  { title: "持續時間", dataIndex: "duration", key: "duration", align: "center", width: 100 },
  { title: "數量", dataIndex: "medicineCun", key: "medicineCun", align: "center", width: 100 },
  { title: "單位", dataIndex: "unit", key: "unit", align: "center", width: 100 },
];


const props = defineProps({
  detail: {
    type: Object,
    default: () => ({})
  }
})

const prescriptionTableHeaders = [
  { zh: '藥品代碼', en: 'Code' },
  { zh: '藥品名稱', en: 'Drug Details' },
  { zh: '計量單位', en: 'UOM' },
  { zh: '用法用量', en: 'Dosage and Directions' },
  { zh: '持續時間（天）', en: 'Duration(Days)' },
  { zh: '數量', en: 'Quantity' },
  { zh: '單位', en: 'Unit' },
];
// 不通过审核-原因说明
const rejectReasonModalVisible = ref(false);
const rejectReason = ref("");

const openEditModal = (record) => {
  editForm.id = record.id;
  editForm.diagnosisReport = record.diagnosisReport || "";
  editForm.medicationAdvice = record.medicationAdvice || "";
  editModalVisible.value = true;
};
// ========== 處方單弹窗 ==========
const prescriptionModalVisible = ref(false);
const dispensingDetail = ref({});
const showPrescriptionModal = async (record) => {
  dispensingDetail.value = {};
  prescriptionModalVisible.value = true;
  try {
    const res = await selectPharmacyAuditDetail({ consultationId: record.consultationId });
    if (res.code == 200 || res.code === "200") {
      dispensingDetail.value = res.data.data || {};
    }
  } catch (error) {
    console.error("获取处方单详情失败", error);
  }
};

// ========== 用户详情弹窗 ==========
const userDetailModalVisible = ref(false);
const userDetailData = ref({});
const showUserDetailModal = async (record) => {
  console.log(record)
  userDetailData.value = {};
  userDetailModalVisible.value = true;
  try {
    // record.userserialnumber 
    const res = await selectUserDetail({ userId: record.userId });
    if (res.code == 200 || res.code === "200") {
      userDetailData.value = res.data.data || {};
    }
  } catch (error) {
    console.error("获取用户详情失败", error);
  }
};

//==================签章===========

const saveEdit = () => {
  // 找到表格数据并更新
  const target = tableData.value.find((item) => item.id === editForm.id);
  if (target) {
    target.diagnosisReport = editForm.diagnosisReport;
    target.medicationAdvice = editForm.medicationAdvice;
  }
  message.success(t("button.confirm") + " " + t("button.success"));
  editModalVisible.value = false;
};

// 搜索表单
const searchForm = reactive({
  appointmentDate: null,
  consultingDoctor: "",
  appointmentTime: null,
  status: undefined,
});

const selectedCategory = ref(null);
const searchKeyword = ref("");
const handleMedicationSearch = () => message.info(`${t("button.search")} ${t("label.medication")}`);

// 表格列
const columns = computed(() => [
  { title: t("label.appointmentNumber"), dataIndex: "orderId", key: "orderId", align: "center" },
  { title: t("label.appointmentPerson"), dataIndex: "userName", key: "userName", align: "center" },
  { title: '用户病歷', dataIndex: 'orderuserid', key: 'orderuserid', align: 'center' },

  { title: t("label.consultingDoctor"), dataIndex: "doctorName", key: "doctorName", align: "center" },
  { title: t("label.appointmentTime"), dataIndex: "orderTime", key: "orderTime", align: "center" },
  { title: "创建时间", dataIndex: "createTime", key: "createTime", align: "center" },
  { title: t("label.status"), dataIndex: "state", key: "state", align: "center" },
  { title: t("label.consultationNumber"), dataIndex: "consultationId", key: "consultationId", align: "center" },
  { title: '處方單', dataIndex: "consultationId", key: "prescription", align: "center" },

  // { title: t("button.consultation"), key: "action", width: 100, align: "center" },
  { title: t("button.shenhe"), key: "shenhe", width: 150, align: "center" }, // 新增列
]);

// 表格数据
const tableData = ref([]);

const getTableData = async () => {

  const roleType = sessionStorage.getItem("roleType");
  const username = sessionStorage.getItem("username");

  const params = {
    // state: '0',
    createTime: searchForm.appointmentDate || null,
    ...(!["admin", "superuser"].includes(roleType) && {
      pharmacistId: username
    })

  };

  const res = await selectPharmacyAuditList(params);
  console.log(res);
  if (res.code == 200) {
    tableData.value = res.data.data;
  }
};

getTableData()

// 分页
const pagination = {
  current: 1,
  pageSize: 10,
  total: tableData.value.length,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `${t("button.total")} ${total} ${t("label.records")}`,
};

// 弹窗状态
const consultationModalVisible = ref(false);
const reportModalVisible = ref(false);
const selectedConsultation = reactive({});
const selectedRecord = reactive({});
const diagnosisReport = ref("");
const checkDetail = ref({});

// 会诊用药表格
const medicationColumns = [
  { title: "", key: "selected", width: 50 },
  { title: t("label.icon"), key: "icon", width: 60 },
  { title: t("label.name"), dataIndex: "name", key: "name" },
  { title: t("label.stock"), dataIndex: "stock", key: "stock" },
];

const medicationData = ref([
  { id: 1, selected: false, name: "复方氨1", stock: "468片" },
  { id: 2, selected: true, name: "复方氨", stock: "468片" },
]);

const isAllSelected = computed(
  () => medicationData.value.length > 0 && medicationData.value.every((item) => item.selected));

const isIndeterminate = computed(() => medicationData.value.some((item) => item.selected) && !isAllSelected.value);

const toggleSelectAll = (e) => {
  const checked = e.target.checked;
  medicationData.value.forEach((item) => (item.selected = checked));
};

// 查询/重置
const handleSearch = () => {
  console.log(searchForm.appointmentDate)
  getTableData()
}

const handleReset = () => {
  Object.keys(searchForm).forEach((k) => (searchForm[k] = k === "status" ? undefined : null));
  handleSearch()
};

// 弹窗显示
const showConsultationModal = (record) => {
  Object.assign(selectedConsultation, record);
  consultationModalVisible.value = true;
};

const showConsultationReport = (record) => {
  Object.assign(selectedRecord, record);
  reportModalVisible.value = true;
};

// 计算所有药品的总价
const calculateAllTotalPrice = () => {
  const total = medicinePriceList.value.reduce((sum, item) => {
    const itemTotal = (parseFloat(item.price) || 0) * (item.medicineCun || 0);
    return sum + itemTotal;
  }, 0);
  return total;
};

// 确认药品单价
const confirmMedicinePrice = async () => {
  try {

    const res = await signature({
      realName: sessionStorage.getItem("realName"),
      idCardNo: sessionStorage.getItem("idCardNo"),
    });

    if (res.code == 200 && res.data && res.data.sign) {

      // 构建 medicines
      const medicines = medicinePriceList.value.map(item => ({
        drugDetails: item.drugDetails,
        uom: item.uom,
        dosageDirections: item.dosageDirections,
        duration: item.duration,
        unit: item.unit,
        medicineCun: item.medicineCun,
        medicineId: item.medicineId,
        price: item.price,
      }))

      // 第二个接口
      const ddd = await auditPharmacy({
        consultationId: currentAuditRecord.value.consultationId,
        medicines,
        state: '1',
        pharmaSign: res.data.sign
      })

      if (ddd.code == "200") {
        message.success(ddd.data.message || '审核通过')
        medicinePriceModalVisible.value = false
        getTableData()
      } else {
        message.error(ddd.message || '操作失败')
      }

    }



  } catch (error) {
    console.error(error)
    message.error(error.message || '操作失败')
  }
}

// 确认不通过原因
const confirmRejectReason = async () => {
  if (!rejectReason.value.trim()) {
    message.warning('请填写不通过原因');
    return;
  }

  try {
    const res = await auditPharmacy({
      consultationId: currentAuditRecord.value.consultationId,
      state: '2',
      auditReason: rejectReason.value
    });

    if (res.code == "200") {
      message.success(res.data.message || '已不通过审核');
      rejectReasonModalVisible.value = false;
      rejectReason.value = '';
      // 刷新列表
      getTableData();
    } else {
      message.error(res.message || '操作失败');
    }
  } catch (error) {
    message.error('操作失败');
    console.error(error);
  }
};

// 审核处理
const handleAudit = (record, state) => {
  currentAuditRecord.value = record;

  if (state === '1') {
    // 通过审核 - 显示药品清单弹窗
    if (record.medicines && record.medicines.length > 0) {
      medicinePriceList.value = record.medicines.map(item => ({
        ...item,
        price: item.price || ''
      }));
    } else {
      medicinePriceList.value = [];
    }
    medicinePriceModalVisible.value = true;
  } else if (state === '2') {
    // 不通过审核 - 显示原因说明弹窗
    rejectReason.value = '';
    rejectReasonModalVisible.value = true;
  }
};

// 获取详情
const getDetail = async (id) => {
  try {
    const params = { consultationId: id };
    const res = await selectprescriptiondetail(params);
    console.log(res);
    if (res.code == 200) {
      checkDetail.value = res.data.data;
    }
  } catch (error) {
    console.error("获取会诊详情失败", error);
  }
};

// 显示会诊报告
const showConsultationReports = (record) => {
  Object.assign(selectedRecord, record);
  getDetail(record.consultationId);
  reportModalVisible.value = true;
};

// -----------------------------------------------
// ===== 用户病例弹窗 =====
// -----------------------------------------------
const userCaseModalVisible = ref(false);
const userCaseLoading = ref(false);
const userCaseList = ref([]);
const activeCaseKey = ref([]);
const fallbackImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesAdwF3VP4LAAA=';
const decryption = async (url) => {
  if (!url || !url.toLowerCase().endsWith('.enc')) {
    return url
  }
  try {
    const res = await axios.get(
      'https://hqgy.gzxinxingyiyuan.com/filedec/file/desfile/download',
      { params: { url }, responseType: 'blob' }
    );
    return URL.createObjectURL(new Blob([res.data]));
  } catch {
    return '';
  }
};
const parsePhotos = (photoStr) => {
  if (!photoStr) return [];
  try {
    const arr = JSON.parse(photoStr);
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  } catch {
    return [];
  }
};
const revokeImageUrls = () => {
  userCaseList.value.forEach((item) => {
    [
      ...(item.casePhotoDecrypt || []),
      ...(item.diagnosisPhotoDecrypt || []),
      ...(item.reportPhotoDecrypt || []),
    ].forEach((url) => URL.revokeObjectURL(url));
  });
};
watch(() => userCaseModalVisible.value, (val) => { if (!val) revokeImageUrls(); });
const showUserCaseModal = async (record) => {
  console.log('showUserCaseModal', record);
  userCaseModalVisible.value = true;
  userCaseLoading.value = true;
  userCaseList.value = [];
  activeCaseKey.value = [];
  try {
    const res = await selectUserCaseList({
      userId: String(record.userId),
      orderId: String(record.orderId),
    });
    if (res.code == 200 || res.code === '200') {
      const list = res.data?.data || [];
      await Promise.all(list.map(async (item) => {
        item.casePhotoDecrypt = await Promise.all(parsePhotos(item.casePhoto).map(decryption));
        item.diagnosisPhotoDecrypt = await Promise.all(parsePhotos(item.diagnosisPhoto).map(decryption));
        item.reportPhotoDecrypt = await Promise.all(parsePhotos(item.reportPhoto).map(decryption));
      }));
      userCaseList.value = list;
      if (list.length > 0) activeCaseKey.value = [String(list[0].id)];
    } else {
      message.error(t('userCase.queryFailed'));
    }
  } catch (error) {
    console.error('获取用户病例失败:', error);
    message.error(t('userCase.queryFailed'));
  } finally {
    userCaseLoading.value = false;
  }
};
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
  padding: 0 0 12px;
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
        padding: 8px;
      }
    }
  }
}

.ant-table-row-striped {
  background-color: #fafafa;
}
</style>
