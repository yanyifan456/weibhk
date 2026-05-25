<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px">
            <a-form layout="inline" :model="searchForm" class="search-form">
                <!-- 日期选择器（年月日） -->
                <a-form-item :label="$t('form.appointmentDate')">
                    <a-date-picker v-model:value="searchForm.appointmentDate" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 200px" />
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
                <template v-else-if="column.key === 'prescription'">
                    <a @click="showPrescriptionModal(record)" style="color: #1890ff; cursor: pointer;">
                        {{ record.consultationId }}
                    </a>
                </template>
                <template v-else-if="column.key === 'dispensing'">
                    <a @click="showDispensingModal(record)" style="color: #1890ff; cursor: pointer;">
                        {{ record.consultationId }}
                    </a>
                </template>
                <template v-else-if="column.key === 'action'">
                    <a-button type="link" @click="showConsultationModal(record)">
                        {{ $t("button.consultation") }}
                    </a-button>
                </template>
                <template v-else-if="column.key === 'state'">
                    <span v-if="record.state === '0'">待药师审核</span>
                    <span v-else-if="record.state === '1'">审核通过</span>
                    <span v-else-if="record.state === '2'">审核不过</span>
                    <span v-else-if="record.state === '4'">用户未提交</span>
                </template>
                <template v-else-if="column.key === 'shenhe'">
                    <div v-if="record.shipTag == 'true'">
                        <a-button type="link" size="small" @click="handleAudit(record, '1')">
                            报价
                        </a-button>
                    </div>
                    <span v-else-if="record.state === '0'">待审核 </span>
                    <span v-else-if="record.state === '2'">审核不通过 </span>
                    <span v-else-if="record.state === '4'">待审核 </span>
                    <span v-else>已报价{{ " (" + (record.tradeFee * 1).toFixed(2) + ')' }}</span>
                </template>
                <template v-else-if="column.key === 'tradeStatus'">
                    <span v-if="record.tradeStatus === '0'">待付款</span>
                    <span v-else-if="record.tradeStatus === '1'">已付款待配药</span>
                    <span v-else-if="record.tradeStatus === '2'">已配药待发货</span>
                    <span v-else-if="record.tradeStatus === '3'">已发货待收货</span>
                    <span v-else-if="record.tradeStatus === '4'">已收货</span>
                    <span v-else-if="record.tradeStatus === '5'">交易取消</span>
                    <span v-else-if="record.tradeStatus === '6'">退款申请中</span>
                    <span v-else-if="record.tradeStatus === '7'">退款交易取消（退款已完成）</span>
                    <span v-else-if="record.tradeStatus === '8'">待报价</span>
                    <span v-else>{{ record.tradeStatus }}</span>
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
        <!-- 会诊诊断报告弹窗 -->
        <a-modal v-model:open="consultationModalVisible" :title="$t('modal.addReport')" width="600px" :footer="null">
            <div class="consultation-modal" style="text-align: center">
                <!-- 头像、姓名、电话居中显示 -->
                <div class="text-center mb-6">
                    <div class="flex justify-center mb-4" style="margin-bottom: 20px">
                        <a-avatar :size="64" src="/placeholder.svg?height=64&width=64" />
                    </div>
                    <div class="text-lg font-medium mb-2" style="margin-bottom: 10px">
                        {{ selectedConsultation.consultingDoctor || "刘德华" }}
                    </div>
                    <div class="text-gray-500 mb-4" style="margin-bottom: 10px">
                        {{ selectedConsultation.phone || "17678787878" }}
                    </div>
                    <a-button type="primary" size="large" class="mb-4" style="margin-bottom: 10px">
                        {{ $t("button.startConsultation") }}
                    </a-button>
                </div>
                <!-- 预约时间简化显示 -->
                <div class="mb-4 text-gray-600 text-sm" style="text-align: left; margin-bottom: 20px">
                    {{ $t("label.appointmentTime") }} {{ selectedConsultation.appointmentTime || "2025-09-09 11:20" }}
                </div>
                <!-- 诊断报告 -->
                <div class="mb-4" style="text-align: left; margin-bottom: 20px">
                    <div class="text-gray-700 mb-2" style="margin-bottom: 10px">{{ $t("label.diagnosisReport") }}</div>
                    <a-textarea v-model:value="diagnosisReport" :placeholder="$t('placeholder.enterDiagnosis')"
                        :rows="4" />
                </div>
                <!-- RP处方 -->
                <div class="mb-6" style="text-align: left; margin-bottom: 20px">
                    <div class="text-gray-700 mb-2" style="margin-bottom: 10px">RP</div>
                    <a-textarea :placeholder="$t('placeholder.medicationAdvice')" :rows="4" />
                </div>
                <!-- 底部按钮右对齐 -->
                <div class="flex justify-end gap-3" style="text-align: right">
                    <a-button style="margin-right: 10px" @click="consultationModalVisible = false">
                        {{ $t("button.cancel") }}
                    </a-button>
                    <a-button type="primary">
                        {{ $t("button.confirm") }}
                    </a-button>
                </div>
            </div>
        </a-modal>
        <!-- 会诊报告详情弹窗 -->
        <!-- 通过审核-药品清单弹窗 -->
        <a-modal v-model:open="medicinePriceModalVisible" title="药品清单" width="100%" @ok="confirmMedicinePrice"
            @cancel="medicinePriceModalVisible = false">
            <div class="medicine-modal">
                <a-table :columns="medicineColumns" :data-source="medicinePriceList" :pagination="false" row-key="id">
                    <template #headerCell="{ column }">
                        <template
                            v-if="['price', 'postalTaxNo', 'hsCode', 'goodsQuantitiyUnitCode', 'oriProductionField', 'oriProductionFieldCode', 'specifications'].includes(column.key)">
                            <span>{{ column.title }}<span style="color: red;">*</span></span>
                        </template>
                        <template v-else>{{ column.title }}</template>
                    </template>
                    <template #bodyCell="{ column, record, index }">
                        <template v-if="column.key === 'name'">
                            <span>{{ record.name }}</span>
                        </template>
                        <template v-else-if="column.key === 'spec'">
                            <span>{{ record.spec }}</span>
                        </template>
                        <template v-else-if="column.key === 'medicineCun'">
                            <span>{{ record.medicineCun }}</span>
                        </template>
                        <template v-else-if="column.key === 'price'">
                            <a-input-number v-model:value="record.price" :min="0" :max="100000000" :precision="2"
                                placeholder="输入单价" style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'totalPrice'">
                            <span>{{ record.price && record.medicineCun ? (parseFloat(record.price) *
                                record.medicineCun).toFixed(2) :
                                '0.00' }}</span>
                        </template>
                        <template v-else-if="column.key === 'postalTaxNo'">
                            <a-input v-model:value="record.postalTaxNo" placeholder="行邮税号" style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'goodsEnName'">
                            <a-input v-model:value="record.goodsEnName" placeholder="商品英文名" style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'hsCode'">
                            <a-input v-model:value="record.hsCode" placeholder="海关编码" style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'goodsQuantitiyUnitCode'">
                            <a-input v-model:value="record.goodsQuantitiyUnitCode" placeholder="计量单位编码"
                                style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'oriProductionField'">
                            <a-input v-model:value="record.oriProductionField" placeholder="原产地" style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'oriProductionFieldCode'">
                            <a-input v-model:value="record.oriProductionFieldCode" placeholder="原产地编码"
                                style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'specifications'">
                            <a-input v-model:value="record.specifications" placeholder="规格型号" style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'material'">
                            <a-input v-model:value="record.material" placeholder="材质" style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'brand'">
                            <a-input v-model:value="record.brand" placeholder="品牌" style="width: 100%" />
                        </template>
                        <template v-else-if="column.key === 'postalTaxRate'">
                            <a-input-number v-model:value="record.postalTaxRate" :min="0" :max="100" :precision="2"
                                placeholder="行政费用（含税%）" style="width: 100%" @change="calculatePostalTaxFee(record)" />
                        </template>
                        <template v-else-if="column.key === 'postalTaxFee'">
                            <a-input :value="(record.price * (record.postalTaxRate || 0) / 100).toFixed(2)" readonly
                                placeholder="行政费用（含税）" style="width: 100%; background-color: #f5f5f5;" />
                        </template>
                    </template>
                </a-table>
                <div class="mt-4" style="margin-top: 50px;">
                    <a-row :gutter="[16, 8]">
                        <a-col :span="6">
                            <a-form-item label="重量(kg)">
                                <span style="color: red;">*</span>
                                <a-input-number v-model:value="weight" :min="0" :max="10000" :precision="2"
                                    placeholder="重量" style="width: 220px" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="6">
                            <a-form-item label="件数">
                                <span style="color: red;">*</span>
                                <a-input-number v-model:value="quantity" :min="1" :max="8" placeholder="件数"
                                    style="width:220px" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="6">
                            <a-form-item label="体积(cm3)">
                                <span style="color: red;">*</span>
                                <a-input-number v-model:value="volume" :min="0" :max="10000" :precision="2"
                                    placeholder="体积" style="width: 220px" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="6">
                            <a-form-item label="寄托物描述">
                                <span style="color: red;">*</span>
                                <a-input v-model:value="desName" placeholder="寄托物描述" :maxlength="200"
                                    style="width: 220px" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row :gutter="[16, 8]" style="margin-top: 16px;">
                        <a-col :span="6">
                            <a-form-item label="物流费用">
                                <span style="color: red;">*</span>
                                <a-input-number v-model:value="logisticsCost" :min="0" :max="100000000" :precision="2"
                                    placeholder="物流费用" style="width: 220px" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                </div>
                <div class="mt-4 text-right">
                    <div class="mb-2">
                        <span class="font-bold">药品总价：</span>
                        <span class="text-lg font-bold text-red-600">{{ calculateMedicineTotalPrice() }}</span>
                    </div>
                    <div class="mb-2">
                        <span class="font-bold">行政费用（含税）总计：</span>
                        <span class="text-lg font-bold text-red-600">{{ calculatePostalTaxTotal() }}</span>
                    </div>
                    <div class="mb-2">
                        <span class="font-bold">物流费用：</span>
                        <span class="text-lg font-bold text-red-600">{{ logisticsCost || 0 }}</span>
                    </div>
                    <div>
                        <span class="font-bold">总价：</span>
                        <span class="text-lg font-bold text-red-600">{{ calculateAllTotalPrice() }}</span>
                    </div>
                </div>
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
        <a-modal v-model:open="reportModalVisible" title="" width="60%" :footer="null">
            <div class="consultation-report">
                <HospitalHeader :doctor-name="checkDetail.doctorName" :hk-certificate="checkDetail.hkCertificate"
                    :pro-qualify-certificate="checkDetail.proQualifyCertificate"
                    :practice-site="checkDetail.practiceSite" :hospital-name="checkDetail.hospitalName"
                    :sub-hospital-name="checkDetail.subHospitalName" :formId="checkDetail.formId"
                    :hospital="checkDetail.hospital"
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
                                {{ col.zh }}({{ col.en }})
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-if="checkDetail.medicines && checkDetail.medicines.length > 0">
                            <tr v-for="(item, index) in checkDetail.medicines" :key="index">
                                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ index + 1 }}</td>
                                <td style="border: 1px solid ; padding: 6px;">{{ item.name || '' }}</td>
                                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.spec || '' }}
                                </td>
                                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.dosageForm ||
                                    ''
                                    }}</td>
                                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{
                                    item.directionsRoute ||
                                    '' }}</td>
                                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.frenquency ||
                                    ''
                                    }}</td>
                                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.duration || ''
                                    }}
                                </td>
                                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.medicineCun ||
                                    ''
                                    }}</td>
                                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.specialPurpose
                                    ||
                                    '' }}</td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <!-- ===== 医生签名盖章 ===== -->
                <div style="text-align: right; margin-bottom: 4px; font-size: 13px;margin-top: 200px;">
                    <span>醫生簽名：</span>
                    <span v-if="!checkDetail.doctorSign">XXXXX</span>
                    <img v-else :src="checkDetail.doctorSign" style="height: 28px; width: auto; vertical-align: middle;"
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
        <a-modal v-model:open="prescriptionModalVisible" title="" width="60%" :footer="null"
            :bodyStyle="{ padding: '32px 40px' }">
            <PrescriptionForm :detail="dispensingDetail" />

        </a-modal>
        <!-- 購藥單弹窗 -->
        <a-modal v-model:open="dispensingModalVisible" title="購藥單" width="60%" :footer="null"
            :bodyStyle="{ padding: '32px 40px' }">
            <aaa :detail="dispensingDetail" />

        </a-modal>
    </div>
</template>
<script setup>
import { auditPharmacy, selectPharmacyAuditList, selectPharmacyAuditDetail, selectprescriptiondetail } from '@/api/yyf'
import { qoute } from '@/api/api1'
import { ref, reactive, computed } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import aaa from './PrescriptionForm.vue';
import HospitalHeader from '../../systemManage/menuManage/remote/HospitalHeader.vue';
import PrescriptionForm from '../../systemManage/menuManage/remote/PrescriptionForm.vue';
import PatientInfoRow from '../../systemManage/menuManage/remote/PatientInfoRow.vue';




const props = defineProps({
    detail: {
        type: Object,
        default: () => ({})
    }
})

const prescriptionTableHeaders = [
    { zh: '項目', en: 'Item' },
    { zh: '藥物名稱', en: 'Drug name' },
    { zh: '劑量', en: 'Strength' },
    { zh: '劑型', en: 'Dosage form' },
    { zh: '用法／途徑', en: 'Directions / route' },
    { zh: '頻次', en: 'Frequency' },
    { zh: '療程', en: 'Duration' },
    { zh: '數量', en: 'Quantity' },
    { zh: '特殊用法', en: 'Route of Administration' },
];
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
// 新增字段（与medicines平级）
const weight = ref(''); // 重量 kg
const quantity = ref(''); // 件数
const volume = ref(''); // 体积 cm3
const desName = ref(''); // 寄托物描述，最大200字符
const logisticsCost = ref(''); // 物流费用
const medicineColumns = [
    { title: "药品名称", dataIndex: "name", key: "name", align: "center", width: 250 },
    { title: "规格", dataIndex: "spec", key: "spec", align: "center", width: 150 },
    { title: "数量", dataIndex: "medicineCun", key: "medicineCun", align: "center", width: 80 },
    { title: "单价", key: "price", align: "center", width: 220 },
    { title: "总价", key: "totalPrice", align: "center", width: 80 },
    { title: "行邮税号", key: "postalTaxNo", align: "center", width: 180 },
    { title: "商品英文名", key: "goodsEnName", align: "center", width: 180 },
    { title: "海关编码", key: "hsCode", align: "center", width: 180 },
    { title: "计量单位编码", key: "goodsQuantitiyUnitCode", align: "center", width: 180 },
    { title: "原产地", key: "oriProductionField", align: "center", width: 180 },
    { title: "原产地编码", key: "oriProductionFieldCode", align: "center", width: 180 },
    { title: "规格型号", key: "specifications", align: "center", width: 200 },
    { title: "材质", key: "material", align: "center", width: 150 },
    { title: "品牌", key: "brand", align: "center", width: 150 },
    { title: "行政费率%（含税）", key: "postalTaxRate", align: "center", width: 150 },
    { title: "行政费用（含税）", key: "postalTaxFee", align: "center", width: 150 },
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
// ========== 處方單弹窗 ==========
const prescriptionModalVisible = ref(false);
const prescriptionDetail = ref({});
const showPrescriptionModal = async (record) => {

    prescriptionDetail.value = {};
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
// ========== 購藥單弹窗 ==========
const dispensingModalVisible = ref(false);
const dispensingDetail = ref({});
const showDispensingModal = async (record) => {
    dispensingDetail.value = {};
    dispensingModalVisible.value = true;
    try {
        const res = await selectPharmacyAuditDetail({ consultationId: record.consultationId });
        if (res.code == 200 || res.code === "200") {
            dispensingDetail.value = res.data.data || {};
        }
    } catch (error) {
        console.error("获取配药单详情失败", error);
    }
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
    // { title: '交易单号', dataIndex: "tradeId", key: "tradeId", align: "center" },
    { title: t("label.appointmentNumber"), dataIndex: "orderId", key: "orderId", align: "center" },
    { title: t("label.appointmentPerson"), dataIndex: "userName", key: "userName", align: "center" },
    { title: t("label.consultingDoctor"), dataIndex: "doctorName", key: "doctorName", align: "center" },
    { title: t("label.appointmentTime"), dataIndex: "orderTime", key: "orderTime", align: "center" },
    { title: "创建时间", dataIndex: "createTime", key: "createTime", align: "center" },
    { title: t("label.status"), dataIndex: "state", key: "state", align: "center" },
    { title: t("label.consultationNumber"), dataIndex: "consultationId", key: "consultationId", align: "center" },
    { title: '處方單', key: "prescription", align: "center" },
    { title: '購藥單', key: "dispensing", align: "center" },

    // { title: "订单状态", dataIndex: "tradeStatus", key: "tradeStatus", align: "center" },
    // { title: t("button.consultation"), key: "action", width: 100, align: "center" },
    { title: t("button.shenhe"), key: "shenhe", width: 150, align: "center" }, // 新增列
]);
// 表格数据
const tableData = ref([]);
const getTableData = async () => {
    const roleType = sessionStorage.getItem("roleType");
    const username = sessionStorage.getItem("username");
    const params = {
        state: "1",
        createTime: searchForm.appointmentDate || null,
        // ...(!["admin", "superuser"].includes(roleType) && {
        //     pharmacistId: username
        // })
    };
    const res = await selectPharmacyAuditList(params);
    console.log(res);
    if (res.code == 200) {
        tableData.value = res.data.data;
    }
};
const canQuote = (record) => {
    return (
        record.state === '1' && (record.tradeStatus === '0' || record.tradeStatus === '8')
    );
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
// 计算所有药品的总价（包括物流费和行邮税费）
const calculateAllTotalPrice = () => {
    const medicineTotal = parseFloat(calculateMedicineTotalPrice()) || 0;
    const taxTotal = parseFloat(calculatePostalTaxTotal()) || 0;
    const logistics = parseFloat(logisticsCost.value) || 0;
    return (medicineTotal + taxTotal + logistics).toFixed(2);
};

// 计算药品总价
const calculateMedicineTotalPrice = () => {
    const total = medicinePriceList.value.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.price) || 0) * (item.medicineCun || 0);
        return sum + itemTotal;
    }, 0);
    return total.toFixed(2);
};

// 计算行邮税费总计
const calculatePostalTaxTotal = () => {
    const total = medicinePriceList.value.reduce((sum, item) => {
        const itemTax = (parseFloat(item.price) || 0) * (item.medicineCun || 0) * ((parseFloat(item.postalTaxRate) || 0) / 100);
        return sum + itemTax;
    }, 0);
    return total.toFixed(2);
};

// 计算单个药品的行邮税费
const calculatePostalTaxFee = (record) => {
    // 当税率变化时，行邮税费会自动计算并在模板中显示，无需手动设置
};

// 确认药品单价
const confirmMedicinePrice = async () => {
    // 验证所有药品的必填字段
    for (let i = 0; i < medicinePriceList.value.length; i++) {
        const item = medicinePriceList.value[i];
        const index = i + 1;

        // 单价必填
        if (!item.price || parseFloat(item.price) <= 0) {
            message.warning(`第${index}行药品：请填写有效的单价`);
            return;
        }

        // 行邮税号：进口必填（当前统一校验为必填）
        if (!item.postalTaxNo || item.postalTaxNo.trim() === '') {
            message.warning(`第${index}行药品：请填写行邮税号`);
            return;
        }

        // 海关编码：出口必填（当前统一校验为必填）
        if (!item.hsCode || item.hsCode.trim() === '') {
            message.warning(`第${index}行药品：请填写海关编码`);
            return;
        }

        // 计量单位编码：必填
        if (!item.goodsQuantitiyUnitCode || item.goodsQuantitiyUnitCode.trim() === '') {
            message.warning(`第${index}行药品：请填写计量单位编码`);
            return;
        }

        // 原产地：必填
        if (!item.oriProductionField || item.oriProductionField.trim() === '') {
            message.warning(`第${index}行药品：请填写原产地`);
            return;
        }

        // 原产地编码：必填
        if (!item.oriProductionFieldCode || item.oriProductionFieldCode.trim() === '') {
            message.warning(`第${index}行药品：请填写原产地编码`);
            return;
        }

        // 规格型号：必填
        if (!item.specifications || item.specifications.trim() === '') {
            message.warning(`第${index}行药品：请填写规格型号`);
            return;
        }

        // 行邮税率验证
        if (!item.postalTaxRate && item.postalTaxRate !== 0) {
            message.warning(`第${index}行药品：请填写行邮税率`);
            return;
        }

        // 验证行邮税率是有效数字
        if (isNaN(parseFloat(item.postalTaxRate)) || parseFloat(item.postalTaxRate) < 0) {
            message.warning(`第${index}行药品：行邮税率必须是非负数`);
            return;
        }
    }

    // 校验新增字段（与medicines平级）
    if (!weight.value || parseFloat(weight.value) <= 0) {
        message.warning('请填写有效的重量');
        return;
    }

    if (!quantity.value || parseInt(quantity.value) <= 0) {
        message.warning('请填写有效的件数');
        return;
    }

    if (!volume.value || parseFloat(volume.value) <= 0) {
        message.warning('请填写有效的体积');
        return;
    }

    if (!desName.value || desName.value.trim() === '') {
        message.warning('请填写寄托物描述');
        return;
    }

    if (!logisticsCost.value && parseFloat(logisticsCost.value) !== 0) {
        message.warning('请填写物流费用');
        return;
    }

    // 验证物流费用是有效数字
    if (isNaN(parseFloat(logisticsCost.value)) || parseFloat(logisticsCost.value) < 0) {
        message.warning('物流费用必须是非负数');
        return;
    }

    console.log('medicinePriceList', medicinePriceList.value);

    try {
        // 构建medicines数据，计算totalPrice，包含扩展属性
        const medicines = medicinePriceList.value.map(item => {
            const unitPrice = parseFloat(item.price) || 0;
            const quantity = item.medicineCun || 0;
            const taxRate = parseFloat(item.postalTaxRate) || 0;

            return {
                name: item.name,
                spec: item.spec,
                medicineCun: item.medicineCun,
                price: item.price,
                totalPrice: (unitPrice * quantity).toFixed(2),
                postalTaxNo: item.postalTaxNo || '',
                goodsEnName: item.goodsEnName || '',
                hsCode: item.hsCode || '',
                goodsQuantityUnitCode: item.goodsQuantitiyUnitCode || '',
                oriProductionField: item.oriProductionField || '',
                oriProductionFieldCode: item.oriProductionFieldCode || '',
                specifications: item.specifications || '',
                material: item.material || '',
                brand: item.brand || '',
                taxRate: taxRate, // 添加行邮税率
                customDuty: (unitPrice * quantity * taxRate / 100).toFixed(2), // 添加计算出的行邮税费

                dosageForm: item.dosageForm || '',
                frenquency: item.frenquency || '',
                duration: item.duration || '',
                directionsRoute: item.directionsRoute || '',
                specialPurpose: item.specialPurpose || '',
            };
        });

        const res = await qoute({
            consultationId: currentAuditRecord.value.consultationId,
            medicines: medicines,
            tradeFee: calculateAllTotalPrice(),
            weight: weight.value,
            quantity: quantity.value,
            volume: volume.value,
            desName: desName.value,
            logisticsFee: logisticsCost.value, // 添加物流费用参数
            medicineFee: calculateMedicineTotalPrice(), // 添加药品费用参数

        });

        if (res.code == "200") {
            message.success('操作成功');
            medicinePriceModalVisible.value = false;
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

// 计算平均税率
const calculateAverageTaxRate = () => {
    if (medicinePriceList.value.length === 0) return 0;

    const total = medicinePriceList.value.reduce((sum, item) => {
        const taxRate = parseFloat(item.postalTaxRate) || 0;
        const amount = (parseFloat(item.price) || 0) * (item.medicineCun || 0);
        return sum + (taxRate * amount);
    }, 0);

    const totalAmount = medicinePriceList.value.reduce((sum, item) => {
        return sum + ((parseFloat(item.price) || 0) * (item.medicineCun || 0));
    }, 0);

    if (totalAmount === 0) return 0;

    return (total / totalAmount).toFixed(2);
};
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
    console.log(record);
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
                padding: 8px 12px;
            }
        }
    }
}
</style>
