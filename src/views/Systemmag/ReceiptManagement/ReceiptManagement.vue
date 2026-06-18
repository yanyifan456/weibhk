    <template>
        <div class="remote-consultation">
            <a-card style="margin-bottom: 16px">
                <a-form layout="inline" :model="searchForm" class="search-form">
                    <a-form-item label="预约单号">
                        <a-input v-model:value="searchForm.orderId" placeholder="请输入预约单号" style="width: 200px" />
                    </a-form-item>
                    <a-form-item label="医生姓名">
                        <a-input v-model:value="searchForm.doctorName" placeholder="请输入医生姓名" style="width: 200px" />
                    </a-form-item>
                    <a-form-item label="用户姓名">
                        <a-input v-model:value="searchForm.orderUserName" placeholder="请输入用户姓名" style="width: 200px" />
                    </a-form-item>
                    <a-form-item label="会诊时间">
                        <a-range-picker v-model:value="searchForm.orderTime" style="width: 260px" />
                    </a-form-item>

                    <a-form-item class="search-actions">
                        <a-button type="primary" @click="handleSearch">
                            {{ t("button.search") }}
                        </a-button>
                        <a-button style="margin-left: 8px" @click="handleReset">
                            {{ t("button.reset") }}
                        </a-button>
                    </a-form-item>
                </a-form>
            </a-card>
            <!-- 数据表格 -->
            <a-card>
                <div class="table-wrapper">
                    <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="tradeId"
                        bordered class="patient-table" @change="handleTableChange" :loading="loading">
                        <template #bodyCell="{ column, record }">

                            <!-- 诊费收据 -->
                            <template v-if="column.key === 'receiptView'">
                                <a-button type="link" @click="showReceiptModal(record)">
                                    {{ t("receipt.view") }}
                                </a-button>
                            </template>


                            <!-- 药费收据 -->
                            <template v-if="column.key === 'drugFeeReceipt'">
                                <a-button type="link" @click="showDrugFeeReceiptModal(record)">
                                    {{ t("receipt.view") }}
                                </a-button>
                            </template>
                            <!-- 会诊报告 -->
                            <template v-if="column.key === 'consultationReport'">
                                <a-button type="link" @click="showConsultationReport(record)">
                                    {{ t("receipt.view") }}
                                </a-button>
                            </template>
                            <!-- 处方单 -->
                            <template v-if="column.key === 'prescriptionNew'">
                                <a-button type="link" @click="showPrescriptionModalNew(record)">
                                    {{ t("receipt.view") }}
                                </a-button>
                            </template>

                        </template>


                    </a-table>
                </div>
            </a-card>


            <!-- 诊费收据弹窗 -->
            <a-modal v-model:open="receiptModalVisible" width="600px" :footer="null">
                <template #title>
                    <div style="text-align: center; font-size: 18px; font-weight: bold;">廣州南沙信興互聯網醫院</div>
                </template>
                <div ref="receiptPrintRef" class="receipt-content"
                    style="padding: 20px; border: 1px solid #e8e8e8; background: #fff;">
                    <!-- 医院名称 -->
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 16px;">醫療費用票據</div>

                    <!-- 收据基本信息 -->
                    <div style="font-size: 13px; line-height: 2; margin-bottom: 16px;">
                        <div>收據號碼：{{ receiptData.cnChargeId || 'CNR-00000000439' }}</div>
                        <div>日期：{{ receiptData.tradeTime || '-' }}</div>
                        <div>患者姓名：{{ receiptData.tradeUserName || '-' }}</div>
                        <div>醫療建議單號：{{ receiptData.formId || '-' }}</div>
                    </div>

                    <!-- 支付费用 -->
                    <div style="font-size: 13px; margin-bottom: 16px;">
                        <div style="font-weight: bold; margin-bottom: 8px;">支付費用</div>
                        <div style="display: flex; gap: 24px;margin-left: 320px;">
                            <a-checkbox :checked="receiptData.paymentMethod === 'cash'" disabled>現金</a-checkbox>
                            <a-checkbox style="margin-left: 14px;" :checked="receiptData.paymentMethod === 'online'"
                                disabled>線上支付</a-checkbox>
                        </div>
                        <div style="display: flex; gap: 24px;margin-left: 320px; margin-top: 4px;">
                            <a-checkbox :checked="kosda">支付寶</a-checkbox>
                            <a-checkbox :checked="receiptData.paymentMethod === 'wechat'" disabled>微信支付</a-checkbox>
                        </div>
                    </div>

                    <!-- 费用清单 -->
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">費用清單</div>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead>
                                <tr>
                                    <th
                                        style="border: 1px solid #d9d9d9; padding: 8px; text-align: center; background: #fafafa;">
                                        項目名称</th>
                                    <th
                                        style="border: 1px solid #d9d9d9; padding: 8px; text-align: center; background: #fafafa;">
                                        金額
                                    </th>
                                    <th
                                        style="border: 1px solid #d9d9d9; padding: 8px; text-align: center; background: #fafafa;">
                                        備注
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border: 1px solid #d9d9d9; padding: 8px; text-align: center;">一般診療費</td>
                                    <td style="border: 1px solid #d9d9d9; padding: 8px; text-align: center;">HKD {{
                                        receiptData.tradeFee || '10.00' }}</td>
                                    <td style="border: 1px solid #d9d9d9; padding: 8px; text-align: center;"></td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #d9d9d9; padding: 8px; text-align: center;">其他費用</td>
                                    <td style="border: 1px solid #d9d9d9; padding: 8px; text-align: center;">
                                        HKD&nbsp;&nbsp;0</td>
                                    <td style="border: 1px solid #d9d9d9; padding: 8px; text-align: center;"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- 合计 -->
                    <div
                        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <span style="font-size: 14px; font-weight: bold;margin-bottom: 120px;">合計</span>
                        <div style="text-align: right;">
                            <div style="font-size: 18px; font-weight: bold;">HKD {{ receiptData.tradeFee || '15' }}
                            </div>
                            <div style="display: flex;"> <img style="width: 120px; height: auto;"
                                    src="https://hqgy.gzxinxingyiyuan.com/orglogo/xxgz_20260608152737e7aa746304174167a3b747ab88e2cac6.jpg"
                                    alt="">
                                <div style="font-size: 12px; color: #666;">廣州南沙信興互聯網醫院<br />（蓋財務章/公章）</div>
                            </div>


                        </div>
                    </div>

                    <hr style="border: none; border-top: 1px solid #d9d9d9; margin: 16px 0;" />

                    <!-- 注意事项 -->
                    <div style="font-size: 12px; color: #666; line-height: 1.8; margin-bottom: 16px;">
                        <div style="font-weight: bold; margin-bottom: 4px;">
                            注：該票據僅做客戶付款証明使用，無法作為報銷憑據。處方藥物一經售出，概不退換。<br />請妥善保存此收據，以備查閲。請將藥物存放於陰涼</div>
                    </div>

                    <!-- 底部信息 -->
                    <div style="font-size: 11px; color: #999; line-height: 1.8;">
                        <div>地址：廣州市南沙區珠江街南江二路6號【自編6棟（9#樓）5層503】</div>
                        <div>電話 13165755025</div>
                        <div>網址 https://gbalifescience.cn</div>
                    </div>
                </div>

                <!-- 底部按钮 -->
                <div style="margin-top: 20px; text-align: center">
                    <a-button style="margin-right: 16px" @click="handleReceiptExport">
                        導出
                    </a-button>
                    <a-button type="primary" @click="handleReceiptPrint">
                        打印
                    </a-button>
                </div>
            </a-modal>

            <!-- 药费收据弹窗 -->
            <a-modal v-model:open="drugFeeReceiptVisible" width="600px" :footer="null">
                <template #title>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: bold;">Receipt</div>
                        <div style="font-size: 14px; color: #666;">藥費收據</div>
                    </div>
                </template>
                <div ref="drugFeeReceiptPrintRef" class="drug-fee-receipt-content"
                    style="padding: 20px; border: 1px solid #e8e8e8; background: #fff;">
                    <!-- 药房名称 -->
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;text-align: center;">
                        大灣區香港華興藥行有限公司</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px;text-align: center;">GBA HK HUA XING
                        MEDICINE
                        LIMITED
                    </div>

                    <!-- 地址 -->
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;text-align: center;">
                        香港中環德輔道中19號環球大廈11樓1106室
                    </div>
                    <div style="font-size: 11px; color: #666; margin-bottom: 4px;text-align: center;">Unit 1106, 11th
                        Floor,
                        World-Wide
                        House, No.19
                        Des Voeux Road Central HK</div>
                    <div style="font-size: 12px; margin-bottom: 16px;text-align: center;">Tel: (852) 31604886</div>

                    <!-- 基本信息 -->
                    <div style="font-size: 13px; line-height: 1.8; margin-bottom: 16px;">
                        <div>Date 日期：{{ drugFeeReceiptData.receiptDate || '-' }}</div>
                        <div>Receipt No 收據編號：{{ drugFeeReceiptData.hkChargeId || '-' }}</div>
                        <div>EPrescription處方單編號：{{ drugFeeReceiptData.formId || '-' }}</div>
                        <div>Customer Name患者姓名：{{ drugFeeReceiptData.userName || '-' }}</div>
                    </div>

                    <!-- 药品清单标题 -->
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Items Purchased藥品清單：</div>

                    <!-- 药品明细表格 -->
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
                        <thead>
                            <tr>

                                <th
                                    style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center; background: #fafafa;">
                                    药品详情<br /><span style="font-size: 10px; color: #666;">(Drug/Details)</span>
                                </th>
                                <th
                                    style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center; background: #fafafa;">
                                    價格<br /><span style="font-size: 10px; color: #666;">(Amount (HKD))</span>
                                </th>
                                <th
                                    style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center; background: #fafafa;">
                                    行政稅率<br /><span style="font-size: 10px; color: #666;">(Administrative
                                        Fee&Duties)</span>
                                </th>
                                <th
                                    style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center; background: #fafafa;">
                                    數量<br /><span style="font-size: 10px; color: #666;">(Quantity)</span>
                                </th>
                                <th
                                    style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center; background: #fafafa;">
                                    藥物編碼<br /><span style="font-size: 10px; color: #666;">(GBAP COINO)</span>
                                </th>
                                <th
                                    style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center; background: #fafafa;">
                                    價格合計(HKD)<br /><span style="font-size: 10px; color: #666;">(Item Amount)</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(med, idx) in (drugFeeReceiptData.medicines || [])" :key="idx">

                                <td style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center;">{{
                                    med.drugDetails
                                    || '-' }}
                                </td>
                                <td style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center;">HKD{{
                                    med.price || '-'
                                    }}</td>
                                <td style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center;">{{
                                    med.taxRate || '-'
                                    }}%</td>
                                <td style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center;">{{
                                    med.quantity || '-'
                                    }}</td>
                                <td
                                    style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center; font-size: 10px;">
                                    {{
                                        med.medicineId || '-' }}</td>
                                <td style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: right;">
                                    HKD {{
                                        (
                                            Number(med.price || 0) +
                                            Number(med.customDuty || 0)
                                        ).toFixed(2)
                                    }}
                                </td>
                            </tr>
                            <tr v-if="!drugFeeReceiptData.medicines || drugFeeReceiptData.medicines.length === 0">
                                <td colspan="7"
                                    style="border: 1px solid #d9d9d9; padding: 10px; text-align: center; color: #999;">
                                    暫無藥品記錄
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- 费用汇总 -->
                    <div style="font-size: 13px; margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>Subtotal小計</span>
                            <span style="font-weight: bold;">HKD {{
                                (
                                    (Number(drugFeeReceiptData.totalAmount) || 0) -
                                    (Number(drugFeeReceiptData.logisticsFee) || 0)
                                ).toFixed(2)
                            }} </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>Shipping Fee物流費用</span>
                            <span style="font-weight: bold;">HKD {{ drugFeeReceiptData.logisticsFee || '-' }}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
                            <span>TOTAL AMOUNT總計</span>
                            <span>HKD {{ drugFeeReceiptData.totalAmount || '-' }}</span>
                        </div>
                    </div>

                    <!-- 支付方式 -->
                    <div style="font-size: 13px; margin-bottom: 16px;">
                        <div style="margin-bottom: 8px;">Payment Method 支付方式</div>
                        <div style="display: flex; gap: 24px;margin-left: 210px;">
                            <a-checkbox :checked="drugFeeReceiptData.paymentMethod === 'cash'"
                                disabled>Cash現金</a-checkbox>
                            <a-checkbox :checked="drugFeeReceiptData.paymentMethod === 'online'" disabled>Online
                                Payment線上支付</a-checkbox>
                        </div>
                        <div style="display: flex; gap: 24px;margin-left: 210px; margin-top: 4px;">
                            <a-checkbox :checked="kosda">Alipay支付寶</a-checkbox>
                            <a-checkbox :checked="drugFeeReceiptData.paymentMethod === 'wechat'" disabled>WeChat
                                Pay微信支付</a-checkbox>
                        </div>
                        <img src="https://hqgy.gzxinxingyiyuan.com/orglogo/xxgz2_2026060815280186e82ff0e07b4b74869acec45c522e69.png"
                            alt="logo" style="width: 100px;margin-top: -180px;" />
                    </div>

                    <hr style="border: none; border-top: 1px solid #d9d9d9; margin: 16px 0;" />

                    <!-- 感谢语 -->
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">多謝惠顧！</div>
                    <div style="font-size: 12px; margin-bottom: 12px;">Thank you for your purchase!</div>

                    <!-- 注意事项 -->
                    <div style="font-size: 11px; color: #666; line-height: 1.6;">
                        <div style="font-weight: bold; margin-bottom: 4px;">Notes注意:</div>
                        <div>-This receipt is only for customer payment proof and cannot be used as a reimbursement
                            voucher</div>
                        <div>該票據僅做客戶付款証明使用，無法作為報銷憑據</div>
                        <div>- Medications are non-refundable</div>
                        <div>藥物一經售出，概不退換。</div>
                        <div>- Please keep this receipt for your records</div>
                        <div>請妥善保存此收據，以備查閲。</div>
                        <div>- Store medications in a cool, dry place</div>
                        <div>請將藥物存放于陰涼干燥處。</div>


                    </div>

                </div>

                <!-- 底部按钮 -->
                <div style="margin-top: 24px; text-align: center;">
                    <a-button style="margin-right: 16px;" @click="handleDrugFeeReceiptExport">
                        導出
                    </a-button>
                    <!-- <a-button style="margin-right: 16px;" @click="handleDrugFeeReceiptGenerateLink"
                        :loading="generateLinkLoading">
                        生成鏈接
                    </a-button> -->
                    <a-button type="primary" @click="handleDrugFeeReceiptPrint">
                        打印
                    </a-button>
                </div>
            </a-modal>
            <!-- 会诊报告详情弹窗 -->
            <a-modal v-model:open="reportModalVisible" title="" width="60%" :footer="null">
                <div ref="consultationReportPrintRef" class="consultation-report">
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
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{
                                        item.dosageDirections ||
                                        '' }}</td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.duration
                                        || '' }}
                                    </td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{
                                        item.medicineCun || ''
                                        }}</td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.unit || ''
                                        }}</td>

                                </tr>
                            </template>
                        </tbody>
                    </table>
                    <!-- ===== 医生签名盖章 ===== -->
                    <div style="text-align: right; margin-bottom: 4px; font-size: 13px;margin-top: 200px;">
                        <span>醫生簽名：</span>
                        <span v-if="!checkDetail.doctorSign">XXXXX</span>
                        <img v-else :src="checkDetail.doctorSign"
                            style="height: 120px; width: auto; vertical-align: middle;" alt="医生签名" />
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

                <!-- 底部按钮 -->
                <div style="margin-top: 24px; text-align: center;">
                    <a-button style="margin-right: 16px;" @click="handleConsultationReportExport">
                        導出
                    </a-button>
                    <a-button type="primary" @click="handleConsultationReportPrint">
                        打印
                    </a-button>
                </div>
            </a-modal>

            <!-- 處方單弹窗 -->
            <a-modal v-model:open="prescriptionNewModalVisible" title="" width="60%" :footer="null"
                :bodyStyle="{ padding: '32px 40px' }">
                <div ref="prescriptionPrintRef">
                    <PrescriptionForm :detail="dispensingDetail" />

                </div>
                <!-- 底部按钮 -->
                <div style="margin-top: 24px; text-align: center;">
                    <a-button style="margin-right: 16px;" @click="handlePrescriptionExport">
                        導出
                    </a-button>
                    <a-button type="primary" @click="handlePrescriptionPrint">
                        打印
                    </a-button>
                </div>
            </a-modal>
        </div>
    </template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { selectprescriptiondetail, selectPharmacyAuditDetail, updateMedicationReceipt, getReceiptList, getOrderReceiptDetail, getDrugReceiptDetail } from "@/api/yyf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import HospitalHeader from '../../systemManage/menuManage/remote/HospitalHeader.vue';
import PrescriptionForm from '../../systemManage/menuManage/remote/PrescriptionForm.vue';
import PatientInfoRow from '../../systemManage/menuManage/remote/PatientInfoRow.vue';
import drugReceiptLogo from '../../../assets/img/14.png';
const kosda = ref(true);
const { t } = useI18n();
const prescriptionTableHeaders = [
    { zh: '藥品代碼', en: 'Code' },
    { zh: '藥品名稱', en: 'Drug Details' },
    { zh: '計量單位', en: 'UOM' },
    { zh: '用法用量', en: 'Dosage and Directions' },
    { zh: '持續時間（天）', en: 'Duration(Days)' },
    { zh: '數量', en: 'Quantity' },
    { zh: '單位', en: 'Unit' },
];

// ==================== 查询表单 ====================
const searchForm = reactive({
    orderId: "",
    doctorName: "",
    orderUserName: "",
    orderTime: null,
});

// ==================== 表格数据 ====================
const loading = ref(false);
const tableData = ref([]);
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: (total) => `${t("label.a")} ${total} ${t("label.records")}`,
});

// 列定义
const columns = computed(() => [
    { title: '预约单号', dataIndex: "orderId", key: "orderId", width: 160, align: 'center' },
    { title: '医生姓名', dataIndex: "doctorName", key: "doctorName", width: 100, align: 'center' },
    { title: '用户姓名', dataIndex: "orderUserName", key: "orderUserName", width: 100, align: 'center' },
    { title: '会诊时间', dataIndex: "orderTime", key: "orderTime", width: 200, align: 'center' },
    { title: "建議單", dataIndex: "consultationId", key: "consultationReport", width: 100, align: 'center' },
    { title: t("receipt.receiptTitle"), dataIndex: "tradeId", key: "receiptView", width: 100, align: 'center' },
    { title: "處方單", dataIndex: "consultationId", key: "prescriptionNew", width: 100, align: 'center' },
    { title: '藥費收據', dataIndex: "tradeId", key: "drugFeeReceipt", width: 100, align: 'center' },
]);
// 获取表格数据
const fetchTableData = async () => {
    loading.value = true;
    try {
        const params = {
            orderId: searchForm.orderId || "",
            doctorName: searchForm.doctorName || "",
            orderUserName: searchForm.orderUserName || "",
            startTime:
                searchForm.orderTime && searchForm.orderTime[0] ? dayjs(searchForm.orderTime[0]).format("YYYY-MM-DD") : "",
            endTime:
                searchForm.orderTime && searchForm.orderTime[1] ? dayjs(searchForm.orderTime[1]).format("YYYY-MM-DD") : "",
            pageSize: pagination.pageSize,
            currentPage: pagination.current,
        };
        const res = await getReceiptList(params);
        if (res.code === "200" || res.code === 200) {
            const list = res.data.data || [];

            console.log("list", list);
            tableData.value = list
            pagination.total = res.data.total || 0;
        } else {
            message.error(res.msg || t("receipt.queryFailed"));
        }
    } catch (error) {
        console.error("查询失败", error);
        message.error(t("receipt.queryFailed"));
    } finally {
        loading.value = false;
    }
};
// ==================== 诊费收据弹窗 ====================
const receiptModalVisible = ref(false);
const receiptData = ref({});
const receiptPrintRef = ref(null);

// 显示诊费收据弹窗
const showReceiptModal = async (record) => {
    try {
        const res = await getOrderReceiptDetail({ orderId: record.orderId });
        if (res.code === "200" || res.code === 200) {
            receiptData.value = res.data.data || {};
            receiptModalVisible.value = true;
        } else {
            message.error(res.msg || t("receipt.queryReceiptFailed"));
        }
    } catch (error) {
        console.error("查询诊费收据失败", error);
        message.error(t("receipt.queryReceiptFailed"));
    }
};

// 诊费收据打印
const handleReceiptPrint = () => {
    const printContent = receiptPrintRef.value;
    if (!printContent) return;
    const printWindow = window.open();
    printWindow.document.write(`
            <html>
            <head>
                <title>${t("receipt.receiptTitle")}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .receipt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                    .logo-area { display: flex; align-items: center; }
                    .logo-text { font-size: 24px; color: #4ECDC4; margin-left: 10px; }
                    .receipt-number { text-align: right; }
                    .receipt-info p { margin: 8px 0; }
                    .payment-item { display: flex; justify-content: space-between; margin: 8px 0; }
                    .receipt-total { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
                    .total-amount { text-align: right; font-size: 18px; font-weight: bold; }
                    .receipt-footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
    printWindow.document.close();
    printWindow.print();
};
// 诊费收据导出PDF
const handleReceiptExport = async () => {
    const element = receiptPrintRef.value;
    if (!element) return;
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: async (clonedDoc) => {
                clonedDoc.querySelectorAll('slot').forEach(el => el.remove());
                clonedDoc.querySelectorAll('a-checkbox').forEach(el => el.remove());
                // 跨域 orglogo 图片通过代理 fetch 后转 base64
                const imgs = clonedDoc.querySelectorAll('img');
                for (const img of imgs) {
                    const src = img.getAttribute('src') || img.src;
                    if (src && src.includes('hqgy.gzxinxingyiyuan.com/orglogo')) {
                        const proxySrc = src.replace(/https?:\/\/hqgy\.gzxinxingyiyuan\.com\/orglogo/, '/orglogo');
                        try {
                            const response = await fetch(proxySrc);
                            const blob = await response.blob();
                            const base64 = await new Promise(resolve => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                            img.src = base64;
                            img.setAttribute('src', base64);
                        } catch (e) {
                            // 忽略转换失败
                        }
                    }
                }
            },
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const margin = 10;
        if (imgHeight <= pdfPageHeight - 2 * margin) {
            pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        } else {
            const pageContentHeight = pdfPageHeight - 2 * margin;
            const totalPages = Math.ceil(imgHeight / pageContentHeight);
            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();
                const sourceY = (page * pageContentHeight * canvas.width) / imgWidth;
                const sourceHeight = Math.min((pageContentHeight * canvas.width) / imgWidth, canvas.height - sourceY);
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = sourceHeight;
                const tempCtx = tempCanvas.getContext("2d");
                tempCtx.fillStyle = "#ffffff";
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
                const pageImgData = tempCanvas.toDataURL("image/png");
                const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
                pdf.addImage(pageImgData, "PNG", margin, margin, imgWidth, pageImgHeight);
            }
        }
        pdf.save(`${t("receipt.receiptTitle")}.pdf`);
        message.success(t("receipt.exportSuccess"));
    } catch (error) {
        console.error("导出失败", error);
        message.error(t("receipt.exportFailed"));
    }
};
// ==================== 药费收据弹窗 ====================
const drugFeeReceiptVisible = ref(false);
const drugFeeReceiptData = ref({});
const drugFeeReceiptPrintRef = ref(null);
const consultationReportPrintRef = ref(null);
const prescriptionPrintRef = ref(null);
const generateLinkLoading = ref(false);

// 显示药费收据弹窗
const showDrugFeeReceiptModal = async (record) => {
    try {
        const res = await getDrugReceiptDetail({ orderId: record.orderId });
        if (res.code === "200" || res.code === 200) {
            const data = res.data.data || {};
            drugFeeReceiptData.value = {
                tradeId: data.tradeId || record.tradeId || '',
                formId: data.formId || record.formId || '',
                userName: data.userName || record.userName || '',
                hkChargeId: data.hkChargeId || record.hkChargeId || '',
                receiptNumber: data.receiptNumber || record.receiptNumber || '',
                receiptCode: data.receiptCode || record.receiptCode || '',
                receiptDate: data.receiptDate || data.tradeTime || record.tradeTime || '',
                medicines: data.tradeMedicineList
                    ? data.tradeMedicineList.map(m => ({
                        name: m.name || '',
                        spec: m.spec || '',
                        quantity: m.medicineCun || m.quantity || '',
                        taxRate: m.taxRate,
                        price: m.price,
                        customDuty: m.customDuty,
                        medicineId: m.medicineId || '',
                        drugDetails: m.drugDetails
                    }))
                    : [],
                logisticsFee: data.logisticsFee || '',
                totalAmount: data.tradeFee || '',
                stampImg: data.stampImg || '',
                doctorTitle: data.doctorTitle || '',
                totalPrice: data.totalPrice
            };
            drugFeeReceiptVisible.value = true;
        } else {
            message.error(res.msg || '查询药费收据失败');
        }
    } catch (error) {
        console.error('查询药费收据失败', error);
        message.error('查询药费收据失败');
    }
};

// 药费收据打印
const handleDrugFeeReceiptPrint = () => {
    const printContent = drugFeeReceiptPrintRef.value;
    if (!printContent) return;
    const printWindow = window.open();
    printWindow.document.write(`
        <html>
        <head>
            <title>藥費收據</title>
            <style>
                body { font-family: 'SimSun', serif; padding: 24px; color: #222; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
                th, td { border: 1px solid #ccc; padding: 6px 4px; text-align: center; }
                hr { border: none; border-top: 1px solid #ccc; margin: 8px 0; }
            </style>
        </head>
        <body>
            ${printContent.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

// 药费收据导出PDF
const handleDrugFeeReceiptExport = async () => {
    const element = drugFeeReceiptPrintRef.value;
    if (!element) return;
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: async (clonedDoc) => {
                clonedDoc.querySelectorAll('slot').forEach(el => el.remove());
                clonedDoc.querySelectorAll('a-checkbox').forEach(el => el.remove());
                // 跨域 orglogo 图片通过代理 fetch 后转 base64
                const imgs = clonedDoc.querySelectorAll('img');
                for (const img of imgs) {
                    const src = img.getAttribute('src') || img.src;
                    if (src && src.includes('hqgy.gzxinxingyiyuan.com/orglogo')) {
                        const proxySrc = src.replace(/https?:\/\/hqgy\.gzxinxingyiyuan\.com\/orglogo/, '/orglogo');
                        try {
                            const response = await fetch(proxySrc);
                            const blob = await response.blob();
                            const base64 = await new Promise(resolve => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                            img.src = base64;
                            img.setAttribute('src', base64);
                        } catch (e) {
                            // 忽略转换失败
                        }
                    }
                }
            },
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const margin = 10;
        if (imgHeight <= pdfPageHeight - 2 * margin) {
            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        } else {
            const pageContentHeight = pdfPageHeight - 2 * margin;
            const totalPages = Math.ceil(imgHeight / pageContentHeight);
            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();
                const sourceY = (page * pageContentHeight * canvas.width) / imgWidth;
                const sourceHeight = Math.min((pageContentHeight * canvas.width) / imgWidth, canvas.height - sourceY);
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = sourceHeight;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.fillStyle = '#ffffff';
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
                const pageImgData = tempCanvas.toDataURL('image/png');
                const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
                pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, pageImgHeight);
            }
        }
        pdf.save('藥費收據.pdf');
        message.success(t('receipt.exportSuccess'));
    } catch (error) {
        console.error('导出失败', error);
        message.error(t('receipt.exportFailed'));
    }
};

// 药费收据生成链接（截图 + 上传）
const handleDrugFeeReceiptGenerateLink = async () => {
    console.log(drugFeeReceiptData.value);
    const element = drugFeeReceiptPrintRef.value;
    if (!element) return;

    generateLinkLoading.value = true;
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
        });

        // canvas 转 Blob
        const blob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/png');
        });

        // 构建 FormData
        const formData = new FormData();
        formData.append('file', blob, `receipt_${drugFeeReceiptData.value.tradeId || Date.now()}.png`);
        formData.append('medicineId', drugFeeReceiptData.value.tradeId);

        const res = await axios.post('/file/medicinphoto', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        console.log('生成链接响应:', res.data);
        if (res.data && (res.data.code === "200" || res.data.code === '200')) {
            const url = res.data.data.data;
            if (url) {
                // 调用 updateMedicationReceipt 保存链接
                const ddd = await updateMedicationReceipt({
                    tradeId: drugFeeReceiptData.value.tradeId,
                    drugFeeUrl: url,
                });
                console.log(ddd);
                if (ddd.data.code === "1000") {
                    message.success('鏈接已保存到後台');
                } else {
                    message.error(ddd.data?.msg || '保存链接失败');
                }


            } else {
                message.success('圖片已上傳成功');
            }
        } else {
            message.error(res.data?.msg || '生成鏈接失敗');
        }
    } catch (error) {
        console.error('生成鏈接失敗', error);
        message.error('生成鏈接失敗');
    } finally {
        generateLinkLoading.value = false;
    }
};


// ==================== 会诊报告详情弹窗 ====================
const reportModalVisible = ref(false);
const checkDetail = ref({});
const selectedRecord = reactive({});

// ==================== 处方单弹窗 ====================
const prescriptionNewModalVisible = ref(false);
const dispensingDetail = ref({});

// ==================== 会诊报告详情弹窗方法 ====================
const showConsultationReport = (record) => {
    Object.assign(selectedRecord, record);
    getDetail(record.consultationId);
    reportModalVisible.value = true;
};

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

// 会诊报告导出PDF
const handleConsultationReportExport = async () => {
    const element = consultationReportPrintRef.value;
    if (!element) return;
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc) => {
                clonedDoc.querySelectorAll('slot').forEach(el => el.remove());
            },
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const margin = 10;
        if (imgHeight <= pdfPageHeight - 2 * margin) {
            pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        } else {
            const pageContentHeight = pdfPageHeight - 2 * margin;
            const totalPages = Math.ceil(imgHeight / pageContentHeight);
            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();
                const sourceY = (page * pageContentHeight * canvas.width) / imgWidth;
                const sourceHeight = Math.min((pageContentHeight * canvas.width) / imgWidth, canvas.height - sourceY);
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = sourceHeight;
                const tempCtx = tempCanvas.getContext("2d");
                tempCtx.fillStyle = "#ffffff";
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
                const pageImgData = tempCanvas.toDataURL("image/png");
                const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
                pdf.addImage(pageImgData, "PNG", margin, margin, imgWidth, pageImgHeight);
            }
        }
        pdf.save('會診報告.pdf');
        message.success(t('receipt.exportSuccess'));
    } catch (error) {
        console.error('导出失败', error);
        message.error(t('receipt.exportFailed'));
    }
};

// 会诊报告打印
const handleConsultationReportPrint = () => {
    const printContent = consultationReportPrintRef.value;
    if (!printContent) return;
    const printWindow = window.open();
    printWindow.document.write(`
        <html>
        <head>
            <title>會診報告</title>
            <style>
                body { font-family: 'SimSun', serif; padding: 24px; color: #222; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
                th, td { border: 1px solid #ccc; padding: 6px 4px; text-align: center; }
                hr { border: none; border-top: 1px solid #ccc; margin: 8px 0; }
            </style>
        </head>
        <body>
            ${printContent.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

// ==================== 处方单弹窗方法 ====================
const showPrescriptionModalNew = async (record) => {
    dispensingDetail.value = {};
    try {
        const res = await selectPharmacyAuditDetail({ consultationId: record.consultationId });
        if (res.code == 200 || res.code === "200") {
            dispensingDetail.value = res.data.data || {};
        }
    } catch (error) {
        console.error("获取处方单详情失败", error);
    }
    prescriptionNewModalVisible.value = true;
};

// 会诊处方导出PDF
const handlePrescriptionExport = async () => {
    const element = prescriptionPrintRef.value;
    if (!element) return;
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc) => {
                clonedDoc.querySelectorAll('slot').forEach(el => el.remove());
            },
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const margin = 10;
        if (imgHeight <= pdfPageHeight - 2 * margin) {
            pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        } else {
            const pageContentHeight = pdfPageHeight - 2 * margin;
            const totalPages = Math.ceil(imgHeight / pageContentHeight);
            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();
                const sourceY = (page * pageContentHeight * canvas.width) / imgWidth;
                const sourceHeight = Math.min((pageContentHeight * canvas.width) / imgWidth, canvas.height - sourceY);
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = sourceHeight;
                const tempCtx = tempCanvas.getContext("2d");
                tempCtx.fillStyle = "#ffffff";
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
                const pageImgData = tempCanvas.toDataURL("image/png");
                const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
                pdf.addImage(pageImgData, "PNG", margin, margin, imgWidth, pageImgHeight);
            }
        }
        pdf.save('處方單.pdf');
        message.success(t('receipt.exportSuccess'));
    } catch (error) {
        console.error('导出失败', error);
        message.error(t('receipt.exportFailed'));
    }
};

// 处方单打印
const handlePrescriptionPrint = () => {
    const printContent = prescriptionPrintRef.value;
    if (!printContent) return;
    const printWindow = window.open();
    printWindow.document.write(`
        <html>
        <head>
            <title>處方單</title>
            <style>
                body { font-family: 'SimSun', serif; padding: 24px; color: #222; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
                th, td { border: 1px solid #ccc; padding: 6px 4px; text-align: center; }
                hr { border: none; border-top: 1px solid #ccc; margin: 8px 0; }
            </style>
        </head>
        <body>
            ${printContent.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

// ==================== 查询 / 重置 / 分页 ====================
const handleSearch = () => {
    pagination.current = 1;
    fetchTableData();
};

const handleReset = () => {
    searchForm.orderId = "";
    searchForm.doctorName = "";
    searchForm.orderUserName = "";
    searchForm.orderTime = null;
    pagination.current = 1;
    fetchTableData();
};

const handleTableChange = (pag) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchTableData();
};

// ==================== 初始化 ====================
onMounted(() => {
    fetchTableData();
});
</script>
<style scoped lang="scss">
.search-form {
    display: flex;
    width: 100%;
    align-items: flex-start;
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
}

.table-wrapper {
    position: relative;
}

.receipt-content {
    padding: 20px;
    background: #fff;

    .receipt-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;

        .logo-area {
            display: flex;
            align-items: center;

            .logo-text {
                font-size: 24px;
                font-weight: bold;
                margin-left: 10px;
            }
        }

        .receipt-number {
            text-align: right;

            p {
                margin: 2px 0;
                font-size: 14px;
            }

            .number-value {
                font-weight: bold;
                border-bottom: 1px solid #333;
                padding-bottom: 2px;
            }
        }
    }

    .receipt-info {
        margin-bottom: 20px;

        p {
            margin: 8px 0;
            font-size: 14px;
        }
    }

    .receipt-payment {
        margin-bottom: 20px;

        .payment-title {
            font-weight: bold;
            margin-bottom: 10px;
        }

        .payment-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 8px 0;

            .item-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .item-right {
                min-width: 80px;
                text-align: right;
                border-bottom: 1px solid #ddd;
            }
        }
    }

    .receipt-total {
        border-top: 1px solid #ddd;
        padding-top: 15px;

        .total-title {
            font-weight: bold;
            margin-bottom: 10px;
        }

        .payment-methods {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
        }

        .other-method {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 15px;
        }

        .total-amount {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            padding-bottom: 5px;
        }
    }

    .receipt-signature {
        margin-top: 30px;
        text-align: right;

        .signature-stamp {
            display: inline-block;
            margin-bottom: 10px;
        }

        .signature-text {
            font-size: 12px;
            margin-bottom: 10px;
        }

        .doctor-info {
            p {
                margin: 2px 0;
                font-size: 12px;
                color: #333;
            }
        }
    }

    .receipt-footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;

        .hospital-name {
            font-weight: bold;
            margin-bottom: 8px;
        }

        p {
            margin: 4px 0;
            font-size: 12px;
            color: #666;
        }

        .contact-row {
            display: flex;
            font-size: 12px;
            color: #666;
            margin: 4px 0;
        }
    }
}
</style>
