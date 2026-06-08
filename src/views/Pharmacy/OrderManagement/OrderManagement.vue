    <template>
        <div class="remote-consultation">
            <a-card style="margin-bottom: 16px">
                <a-form layout="inline" :model="searchForm" class="search-form">
                    <div style="display: flex; flex-direction: column">
                        <div style="width: 1000px; display: flex; justify-content: space-between">
                            <a-form-item :label="t('receipt.tradeId')">
                                <a-input v-model:value="searchForm.tradeId" :placeholder="t('receipt.enterTradeId')"
                                    style="width: 200px" />
                            </a-form-item>
                            <a-form-item :label="t('receipt.tradeTime')">
                                <a-range-picker v-model:value="searchForm.tradeTime" style="width: 260px" />
                            </a-form-item>
                            <a-form-item :label="t('receipt.reciveTel')">
                                <a-input v-model:value="searchForm.reciveTel" :placeholder="t('receipt.enterReciveTel')"
                                    style="width: 200px" />
                            </a-form-item>
                        </div>
                        <div style="width: 1000px; display: flex; justify-content: space-between; margin-top: 20px">
                            <a-form-item :label="t('receipt.orderStatus')">
                                <a-select v-model:value="searchForm.tradeStatu"
                                    :placeholder="t('receipt.selectOrderStatus')" style="width: 150px" allowClear>
                                    <a-select-option value="1">{{ t("receipt.statusPending") }}</a-select-option>
                                    <a-select-option value="2">{{ t("receipt.statusShipping") }}</a-select-option>
                                    <a-select-option value="3">{{ t("receipt.statusDelivering") }}</a-select-option>
                                    <a-select-option value="4">{{ t("receipt.statusReceived") }}</a-select-option>
                                    <a-select-option value="5">{{ t("receipt.statusCancelled") }}</a-select-option>
                                </a-select>
                            </a-form-item>
                            <a-form-item :label="t('receipt.wdlExportCertificate')">
                                <a-input v-model:value="searchForm.wdlExportCertificate"
                                    :placeholder="t('receipt.enterWdlExportCertificate')" style="width: 200px" />
                            </a-form-item>
                            <a-form-item :label="t('receipt.logisticsNo')">
                                <a-input v-model:value="searchForm.logisticsNo"
                                    :placeholder="t('receipt.enterLogisticsNo')" style="width: 200px" />
                            </a-form-item>
                        </div>
                    </div>

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
                        :scroll="{ x: 2600, y: 470 }" bordered class="patient-table" @change="handleTableChange"
                        :loading="loading">
                        <template #bodyCell="{ column, record }">
                            <!-- 购药人证件正面 -->
                            <template v-if="column.key === 'front'">
                                <a-image v-if="record.frontDecrypt" :src="record.frontDecrypt" :width="60" :height="40"
                                    style="object-fit: cover; cursor: pointer" />
                                <span v-else>-</span>
                            </template>
                            <!-- 购药人证件反面 -->
                            <template v-if="column.key === 'back'">
                                <a-image v-if="record.backDecrypt" :src="record.backDecrypt" :width="60" :height="40"
                                    style="object-fit: cover; cursor: pointer" />
                                <span v-else>-</span>
                            </template>
                            <!-- 药品详情 -->
                            <template v-if="column.key === 'medicineDetail'">
                                <a-button type="link" @click="showMedicineDetail(record)">
                                    {{ t("receipt.view") }}
                                </a-button>
                            </template>
                            <!-- 订单状态 -->
                            <template v-if="column.key === 'tradeStatus'">
                                <a-tag :color="getStatusColor(record.tradeStatus * 1)">
                                    {{ tradeStatusMap[record.tradeStatus * 1] || "-" }}
                                </a-tag>
                            </template>
                            <!-- 会诊处方 -->
                            <template v-if="column.key === 'consultationId'">
                                <a-button type="link" @click="showPrescriptionModal(record)">
                                    {{ t("receipt.view") }}
                                </a-button>
                            </template>
                            <!-- 诊费收据 -->
                            <template v-if="column.key === 'receiptView'">
                                <a-button type="link" @click="showReceiptModal(record)">
                                    {{ t("receipt.view") }}
                                </a-button>
                            </template>
                            <!-- 药物授权委托书 -->
                            <template v-if="column.key === 'attorneyBook'">
                                <a-button type="link" @click="showAttorneyModal(record)">
                                    {{ t("receipt.view") }}
                                </a-button>
                            </template>
                            <!-- 出口证号 -->
                            <template v-if="column.key === 'wdlExportCertificate'">
                                <a-button type="link" @click="showExportCertificateModal(record)"
                                    :disabled="!['1', '2',].includes(record.tradeStatus)">
                                    確認配藥
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
                            <!-- 购药单 -->
                            <template v-if="column.key === 'dispensing'">
                                <a-button type="link" @click="showDispensingModal(record)">
                                    {{ t("receipt.view") }}
                                </a-button>
                            </template>
                            <!-- 物流单号 -->
                            <template v-if="column.key === 'logisticsNo'">
                                <a-popconfirm title="是否确认发货" ok-text="是" cancel-text="否"
                                    :disabled="!record.wdlExportCertificate || !!record.logisticsNo"
                                    @confirm="handleLogisticsSubmit(record)">
                                    <!-- @click="showLogisticsModal(record)" -->
                                    <a-button type="link"
                                        :disabled="!record.wdlExportCertificate || !!record.logisticsNo">
                                        {{ record.logisticsNo || t("button.ship") }}
                                    </a-button>
                                </a-popconfirm>
                                <a-popconfirm title="是否取消发货" ok-text="是" cancel-text="否"
                                    :disabled="!record.wdlExportCertificate || !record.logisticsNo"
                                    @confirm="cancelShipment(record)">
                                    <!-- @click="showLogisticsModal(record)" -->
                                    <a-button type="link" :disabled="!record.logisticsNo">
                                        {{ t('public.cancel') + t("button.ship") }}
                                    </a-button>
                                </a-popconfirm>
                            </template>
                        </template>


                    </a-table>
                </div>
            </a-card>
            <!-- 药品详情弹窗 -->
            <a-modal v-model:open="medicineModalVisible" :title="t('receipt.medicineDetail')" width="100%"
                :footer="null">
                <div style="margin-bottom: 16px; text-align: right">
                    <a-button type="primary" style="margin-right: 8px" @click="handlePrint">
                        {{ t("receipt.print") }}
                    </a-button>
                    <a-button @click="handleExport">
                        {{ t("receipt.export") }}
                    </a-button>
                </div>
                <div ref="printRef">
                    <a-table :columns="medicineColumns" :data-source="currentMedicineList" :pagination="false"
                        row-key="medicineId" bordered size="small">
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'photo'">
                                <a-image v-if="record.photo" :src="record.photo" :width="50" :height="50"
                                    style="object-fit: cover" />
                                <span v-else>-</span>
                            </template>
                        </template>
                    </a-table>
                </div>
            </a-modal>

            <!-- 会诊处方弹窗 -->
            <a-modal v-model:open="prescriptionModalVisible" :title="t('receipt.prescription')" width="800px"
                :footer="null">
                <div style="margin-bottom: 16px; text-align: right">
                    <a-button style="margin-right: 8px" @click="handlePrescriptionExport">
                        {{ t("receipt.export") }}
                    </a-button>
                    <a-button type="primary" @click="handlePrescriptionPrint">
                        {{ t("receipt.print") }}
                    </a-button>
                </div>
                <div ref="prescriptionPrintRef" class="prescription-content">
                    <div class="prescription-header">
                        <h2 style="text-align: center; margin-bottom: 20px">{{ t("receipt.prescription") }}</h2>
                        <p>
                            <strong>{{ t("logo") }}</strong>
                        </p>
                        <p>{{ t("receipt.addressLabel") }}：{{ prescriptionData.address || "-" }}</p>
                        <p>{{ t("receipt.phoneLabel") }}：{{ prescriptionData.contactPhone || "-" }}</p>
                        <p>{{ t("receipt.emailLabel") }}：{{ prescriptionData.email || "-" }}</p>
                        <p>{{ t("receipt.urlLabel") }}：{{ prescriptionData.url || "-" }}</p>
                    </div>
                    <a-divider />
                    <div class="prescription-info">
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <p>
                                    <strong>{{ t("receipt.date") }}：</strong>{{ prescriptionData.createTime || "-" }}
                                </p>
                            </a-col>
                            <a-col :span="12">
                                <p>
                                    <strong>{{ t("receipt.name") }}：</strong>{{ prescriptionData.userName || "-" }}
                                </p>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <p>
                                    <strong>{{ t("receipt.sex") }}：</strong>{{
                                        prescriptionData.sex === "1"
                                            ? t("receipt.male")
                                            : prescriptionData.sex === "0"
                                                ? t("receipt.female")
                                                : "-"
                                    }}
                                </p>
                            </a-col>
                            <a-col :span="12">
                                <p>
                                    <strong>{{ t("receipt.age") }}：</strong>{{ prescriptionData.age || "-" }}
                                </p>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <p>
                                    <strong>{{ t("receipt.birthday") }}：</strong>{{ prescriptionData.birthyDay || "-" }}
                                </p>
                            </a-col>
                            <a-col :span="12">
                                <p><strong>ID：</strong>{{ prescriptionData.idCardNo || "-" }}</p>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="24">
                                <p><strong>RP：</strong>{{ prescriptionData.consultationMedicine || "-" }}</p>
                            </a-col>
                        </a-row>
                    </div>
                    <a-divider />
                    <div class="prescription-medicine">
                        <h4>{{ t("receipt.medicineInfo") }}</h4>
                        <a-table :columns="prescriptionMedicineColumns" :data-source="prescriptionData.medicines || []"
                            :pagination="false" row-key="medicineId" bordered size="small" />
                    </div>
                </div>
            </a-modal>

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
                        <div>日期：{{ receiptData.payTime || '-' }}</div>
                        <div>患者姓名：{{ receiptData.userName || '-' }}</div>
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
                                    src="../../../assets/img/13.jpg" alt="">
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
            <!-- 药物授权委托书弹窗 -->
            <a-modal v-model:open="attorneyModalVisible" width="700px" height="800px" :footer="null">
                <div ref="attorneyPrintRef" class="attorney-content">
                    <div style="font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 20px">
                        {{ t("receipt.attorneyTitle") }}
                    </div>
                    <!-- 立书人(委托人)资料 -->
                    <div class="attorney-section">
                        <h3 class="section-title">{{ t("receipt.principalInfo") }}</h3>
                        <p>Alpha One Medical</p>
                        <p>{{ attorneyData.address || "-" }}</p>
                        <p>Tel：{{ attorneyData.contactPhone || "-" }}</p>
                    </div>

                    <!-- 受托人资料 -->
                    <div class="attorney-section">
                        <h3 class="section-title">{{ t("receipt.trusteeInfo") }}</h3>
                    </div>

                    <!-- 授权范围 -->
                    <div class="attorney-section">
                        <h3 class="section-title">{{ t("receipt.authorizationScope") }}</h3>
                        <p>{{ t("receipt.authorizationDesc1") }}</p>
                        <p>a){{ t("receipt.authorizationDesc2") }}</p>
                        <p>b){{ t("receipt.authorizationDesc3") }}</p>
                    </div>

                    <!-- 药品及处方资讯 -->
                    <div class="attorney-section">
                        <h3 class="section-title">{{ t("receipt.medicineAndPrescription") }}</h3>
                        <p>{{ t("receipt.medicineAndPrescriptionDesc") }}</p>
                        <p>{{ t("receipt.receivingCompany") }}：{{ attorneyData.hospitalName || "-" }}</p>
                        <!-- <p>Case Code：{{ attorneyData.caseCode || "-" }}</p> -->
                        <p>Patient Name：{{ attorneyData.userName || "-" }}</p>
                        <p>Patient ID：{{ attorneyData.idCardNo || "-" }}</p>
                        <p>Doctor：{{ attorneyData.doctorName || "-" }}</p>
                        <div class="medicine-list">
                            <p>{{ t("receipt.medicines") }}：</p>
                            <div v-for="(item, index) in attorneyData.medicineList || []" :key="index">
                                <p>{{ item.name }} {{ item.spec }}, {{ item.medicineCun }}{{ t("receipt.box") }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- 免责声明 -->
                    <div class="attorney-section">
                        <h3 class="section-title">{{ t("receipt.disclaimer") }}</h3>
                        <p>{{ t("receipt.disclaimerDesc") }}</p>
                    </div>

                    <!-- 声明 -->
                    <div class="attorney-section">
                        <h3 class="section-title">{{ t("receipt.statement") }}</h3>
                        <p>{{ t("receipt.statementDesc") }}</p>
                    </div>

                    <!-- 签署 -->
                    <div class="attorney-section">
                        <h3 class="section-title">{{ t("receipt.signature") }}</h3>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <p>{{ t("receipt.principalSignature") }}：</p>
                            </a-col>
                            <a-col :span="12">
                                <p>{{ t("receipt.date") }}：</p>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <p>{{ t("receipt.trusteeSignature") }}：</p>
                            </a-col>
                            <a-col :span="12">
                                <p>{{ t("receipt.date") }}：</p>
                            </a-col>
                        </a-row>
                    </div>
                </div>
                <div style="margin-top: 20px; text-align: center">
                    <a-button style="margin-right: 16px" @click="handleAttorneyExport">
                        {{ t("receipt.export") }}
                    </a-button>
                    <a-button type="primary" @click="handleAttorneyPrint">
                        {{ t("receipt.print") }}
                    </a-button>
                </div>
            </a-modal>

            <!-- 出口证号编辑弹窗 -->
            <a-modal v-model:open="exportCertificateModalVisible" :title="'確認配藥'" width="400px"
                @ok="handleExportCertificateSubmit" @cancel="exportCertificateModalVisible = false">
                <a-form layout="vertical">
                    <a-form-item :label="'確認配藥'">
                        <!-- <a-input v-model:value=""
                            :placeholder="t('receipt.enterWdlExportCertificate')" /> -->
                        <div>{{ exportCertificateForm.wdlExportCertificate }}</div>
                    </a-form-item>
                </a-form>
            </a-modal>

            <!-- 物流单号编辑弹窗 -->
            <a-modal v-model:open="logisticsModalVisible" :title="t('receipt.editLogisticsNo')" width="400px"
                @ok="handleLogisticsSubmit" @cancel="logisticsModalVisible = false">
                <a-form layout="vertical">
                    <a-form-item :label="t('receipt.logisticsNo')">
                        <a-input v-model:value="logisticsForm.logisticsNo"
                            :placeholder="t('receipt.enterLogisticsNo')" />
                    </a-form-item>
                </a-form>
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
                                    產品描述<br /><span style="font-size: 10px; color: #666;">(Description)</span>
                                </th>
                                <th
                                    style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center; background: #fafafa;">
                                    規格<br /><span style="font-size: 10px; color: #666;">(Quantity)</span>
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
                                <td style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: left;">{{ med.name
                                    || '-' }}
                                </td>
                                <td style="border: 1px solid #d9d9d9; padding: 6px 4px; text-align: center;">{{ med.spec
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
                        <img src="../../../assets/img/14.png" alt="logo"
                            style="width: 100px;margin-left: 0px;margin-top: -180px;" />
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
                    <a-button style="margin-right: 16px;" @click="handleDrugFeeReceiptGenerateLink"
                        :loading="generateLinkLoading">
                        生成鏈接
                    </a-button>
                    <a-button type="primary" @click="handleDrugFeeReceiptPrint">
                        打印
                    </a-button>
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
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ index + 1 }}
                                    </td>
                                    <td style="border: 1px solid ; padding: 6px;">{{ item.name || '' }}</td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.spec || ''
                                        }}
                                    </td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.dosageForm
                                        ||
                                        ''
                                    }}</td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{
                                        item.directionsRoute ||
                                        '' }}</td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.frenquency
                                        ||
                                        ''
                                    }}</td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.duration
                                        || ''
                                        }}
                                    </td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{
                                        item.medicineCun ||
                                        ''
                                    }}</td>
                                    <td style="border: 1px solid ; padding: 6px; text-align: center;">{{
                                        item.specialPurpose
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
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { acceptance, selectprescriptiondetail, receipt, updexpenditure, attorney, selectPharmacyAuditDetail, updateMedicationReceipt } from "@/api/yyf.js";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import aaa from './PrescriptionForm.vue';
import HospitalHeader from '../../systemManage/menuManage/remote/HospitalHeader.vue';
import PrescriptionForm from '../../systemManage/menuManage/remote/PrescriptionForm.vue';
import PatientInfoRow from '../../systemManage/menuManage/remote/PatientInfoRow.vue';
const kosda = ref(true);
const { t, locale } = useI18n();
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
const tradeStatusMap = {
    0: "待付款",
    1: "待配藥",
    2: "待發貨",
    3: "待收貨",
    4: "已收貨",
    5: "交易取消",
    6: "退款申請中",
    7: "交易取消(退款完成)",
}
// ==================== 查询表单 ====================
const searchForm = reactive({
    tradeId: "",
    tradeTime: null,
    reciveTel: "",
    tradeStatu: undefined,
    wdlExportCertificate: "",
    logisticsNo: "",
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
    { title: t("receipt.tradeId"), dataIndex: "tradeId", key: "tradeId", align: "center", fixed: 'left', width: 220 },
    { title: t("receipt.tradeTime"), dataIndex: "tradeTime", key: "tradeTime", align: "center" },
    { title: t("receipt.buyer"), dataIndex: "userName", key: "userName", align: "center" },
    { title: t("receipt.frontId"), dataIndex: "front", key: "front", align: "center" },
    { title: t("receipt.backId"), dataIndex: "back", key: "back", align: "center" },
    { title: t("receipt.contactPhone"), dataIndex: "reciveTel", key: "reciveTel", align: "center" },
    { title: t("receipt.consultingDoctor"), dataIndex: "doctorName", key: "doctorName", align: "center" },
    { title: t("receipt.medicineDetail"), key: "medicineDetail", align: "center" },
    { title: t("receipt.orderStatus"), dataIndex: "tradeStatus", key: "tradeStatus", align: "center" },
    // { title: t("receipt.prescription"), dataIndex: "consultationId", key: "consultationId", align: "center" },
    { title: t("receipt.receiptTitle"), dataIndex: "tradeId", key: "receiptView", align: "center" },
    { title: '藥費收據', dataIndex: "tradeId", key: "drugFeeReceipt", align: "center" },
    { title: t("receipt.attorneyTitle"), dataIndex: "tradeId", key: "attorneyBook", align: "center" },

    { title: "建議單", dataIndex: "consultationId", key: "consultationReport", align: "center" },
    { title: "處方單", dataIndex: "consultationId", key: "prescriptionNew", align: "center" },
    { title: "購藥單", dataIndex: "consultationId", key: "dispensing", align: "center" },
    {
        title: '配药',
        dataIndex: "wdlExportCertificate",
        key: "wdlExportCertificate",
        align: "center", fixed: 'right'
    },
    { title: t("receipt.logisticsNo"), dataIndex: "logisticsNo", key: "logisticsNo", align: "center", fixed: 'right', width: 280 },
]);

// 获取订单状态颜色
const getStatusColor = (status) => {
    const map = {
        1: "orange",
        // 2: "orange",
        2: "blue",
        // 待出貨: "blue",
        3: "cyan",
        // 待收貨: "cyan",
        4: "green",
        // 已收貨: "green",
        5: "red",
        // 訂單取消: "red",
        6: "gray",
        7: "red",
    };
    return map[status] || "default";
};

// 获取表格数据
const fetchTableData = async () => {
    loading.value = true;
    try {
        const params = {
            tradeId: searchForm.tradeId || "",
            startTime:
                searchForm.tradeTime && searchForm.tradeTime[0] ? dayjs(searchForm.tradeTime[0]).format("YYYY-MM-DD") : "",
            endTime:
                searchForm.tradeTime && searchForm.tradeTime[1] ? dayjs(searchForm.tradeTime[1]).format("YYYY-MM-DD") : "",
            reciveTel: searchForm.reciveTel || "",
            tradeStatus: searchForm.tradeStatu || "",
            wdlExportCertificate: searchForm.wdlExportCertificate || "",
            logisticsNo: searchForm.logisticsNo || "",
            pageSize: pagination.pageSize,
            currentPage: pagination.current,
        };
        const res = await acceptance(params);
        if (res.code === "200" || res.code === 200) {
            const list = res.data.data || [];
            for (const item of list) {
                if (item.front) {
                    item.frontDecrypt = await decryption(item.front)
                }

                if (item.back) {
                    item.backDecrypt = await decryption(item.back)
                }
            }

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
const decryption = async (url) => {
    try {
        if (!url) return ''

        // =========================
        // 不需要解密
        // =========================
        if (!url.endsWith('.enc')) {
            return url
        }

        // =========================
        // 需要解密
        // =========================
        const res = await axios.get(
            'https://hqgy.gzxinxingyiyuan.com/filedec/file/certimage/download',
            {
                params: { url },
                responseType: 'blob'
            }
        )

        const blob = new Blob([res.data])
        const imgUrl = URL.createObjectURL(blob)

        return imgUrl

    } catch (err) {
        console.log('解密失败', err)
        return ''
    }
}
// ==================== 药品详情弹窗 ====================
const medicineModalVisible = ref(false);
const currentMedicineList = ref([]);
const printRef = ref(null);

const medicineColumns = computed(() => [
    // { title: t('receipt.medicineId'), dataIndex: "medicineId", key: "medicineId", align: "center", width: 100 },
    // { title: t('receipt.photo'), dataIndex: "photo", key: "photo", align: "center", width: 80 },
    { title: t("receipt.medicineName"), dataIndex: "name", key: "name", align: "center" },
    { title: t("receipt.spec"), dataIndex: "spec", key: "spec", align: "center" },
    { title: t("receipt.quantity"), dataIndex: "medicineCun", key: "medicineCun", align: "center" },
    { title: t("receipt.unitPrice"), dataIndex: "price", key: "price", align: "center" },
    { title: "總價", dataIndex: "totalPrice", key: "totalPrice", align: "center" },
    { title: "行郵税號", dataIndex: "postalTaxNo", key: "postalTaxNo", align: "center" },
    { title: "商品英文名", dataIndex: "goodsEnName", key: "goodsEnName", align: "center" },
    { title: "商品海關編碼", dataIndex: "hsCode", key: "hsCode", align: "center" },
    { title: "申報計量單位編碼", dataIndex: "goodsQuantityUnitCode", key: "goodsQuantityUnitCode", align: "center" },
    { title: "原產地", dataIndex: "oriProductionField", key: "oriProductionField", align: "center" },
    { title: "原產地編碼", dataIndex: "oriProductionFieldCode", key: "oriProductionFieldCode", align: "center" },
    { title: "商品規格型號", dataIndex: "specifications", key: "specifications", align: "center" },
    { title: "材質", dataIndex: "material", key: "material", align: "center" },
    { title: "品牌", dataIndex: "brand", key: "brand", align: "center" },

    // { title: t('receipt.batchNumber'), dataIndex: "drugLotNumber", key: "drugLotNumber", align: "center", width: 120 },
]);

const showMedicineDetail = (record) => {
    console.log(record);
    currentMedicineList.value = record.tradeMedicineList || [];
    medicineModalVisible.value = true;
};

// 打印
const handlePrint = () => {
    const printContent = printRef.value;
    if (!printContent) return;
    const printWindow = window.open();
    printWindow.document.write(`
            <html>
            <head>
                <title>${t("receipt.medicineDetail")}</title>
                <style>
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #f5f5f5; }
                    img { max-width: 50px; max-height: 50px; }
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

// 导出
const handleExport = () => {
    if (!currentMedicineList.value || currentMedicineList.value.length === 0) {
        message.warning(t("receipt.noData"));
        return;
    }
    const headers = [
        // t("receipt.medicineId"),
        t("receipt.medicineName"),
        // t("receipt.photo"),
        t("receipt.spec"),
        t("receipt.quantity"),
        t("receipt.unitPrice"),
        // t("receipt.batchNumber"),
        '总价',
        "行邮税号",
        "商品英文名",
        "商品海关编码",
        "申报计量单位编码",
        "原产地",
        "原产地编码",
        "商品规格型号",
        "材质",
        "品牌",
    ];
    const rows = currentMedicineList.value.map((item) => [
        // item.medicineId || "",
        item.name || "",
        // item.photo || "",
        item.spec || "",
        item.medicineCun || "",
        item.price || "",
        // item.drugLotNumber || "",
        item.totalPrice || "",
        item.postalTaxNo || "",
        item.goodsEnName || "",
        item.hsCode || "",
        item.goodsQuantityUnitCode || "",
        item.oriProductionField || "",
        item.oriProductionFieldCode || "",
        item.specifications || "",
        item.material || "",
        item.brand || "",
    ]);
    let csvContent = "\uFEFF" + headers.join(",") + "\n";
    rows.forEach((row) => {
        csvContent += row.join(",") + "\n";
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${t("receipt.medicineDetail")}.csv`;
    link.click();
};

// ==================== 会诊处方弹窗 ====================
const prescriptionModalVisible = ref(false);
const prescriptionData = ref({});
const prescriptionPrintRef = ref(null);

const prescriptionMedicineColumns = computed(() => [
    { title: t("receipt.medicineName"), dataIndex: "name", key: "name", align: "center" },
    { title: t("receipt.spec"), dataIndex: "spec", key: "spec", align: "center" },
    { title: t("receipt.quantity"), dataIndex: "medicineCun", key: "medicineCun", align: "center" },
]);

// 显示会诊处方弹窗
const showPrescriptionModal = async (record) => {
    try {
        const res = await selectprescriptiondetail({ consultationId: record.consultationId });
        if (res.code === "200" || res.code === 200) {
            prescriptionData.value = res.data.data || {};
            prescriptionModalVisible.value = true;
        } else {
            message.error(res.msg || t("receipt.queryPrescriptionFailed"));
        }
    } catch (error) {
        console.error("查询处方详情失败", error);
        message.error(t("receipt.queryPrescriptionFailed"));
    }
};

// 会诊处方打印
const handlePrescriptionPrint = () => {
    const printContent = prescriptionPrintRef.value;
    if (!printContent) return;
    const printWindow = window.open();
    printWindow.document.write(`
            <html>
            <head>
                <title>${t("receipt.prescription")}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { text-align: center; }
                    p { margin: 8px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #f5f5f5; }
                    .section-title { font-weight: bold; margin-top: 16px; }
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

// 会诊处方导出PDF
const handlePrescriptionExport = async () => {
    const element = prescriptionPrintRef.value;
    if (!element) return;
    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${t("receipt.prescription")}.pdf`);
        message.success(t("receipt.exportSuccess"));
    } catch (error) {
        console.error("导出失败", error);
        message.error(t("receipt.exportFailed"));
    }
};

// ==================== 诊费收据弹窗 ====================
const receiptModalVisible = ref(false);
const receiptData = ref({});
const receiptPrintRef = ref(null);

// 显示诊费收据弹窗
const showReceiptModal = async (record) => {
    try {
        const res = await receipt({ tradeId: record.tradeId });
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

// 诊费收据导出PDF（修复版 - 支持完整内容导出和多页）
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
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 左右各留10mm边距
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const margin = 10; // 边距

        // 如果内容高度小于等于一页可用高度，直接放到一页
        if (imgHeight <= pdfPageHeight - 2 * margin) {
            pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        } else {
            // 内容超过一页，需要分页处理
            // 计算每页可以显示的内容高度
            const pageContentHeight = pdfPageHeight - 2 * margin;
            // 计算总共需要多少页
            const totalPages = Math.ceil(imgHeight / pageContentHeight);

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) {
                    pdf.addPage();
                }

                // 计算当前页需要裁剪的canvas部分
                const sourceY = (page * pageContentHeight * canvas.width) / imgWidth;
                const sourceHeight = Math.min((pageContentHeight * canvas.width) / imgWidth, canvas.height - sourceY);

                // 创建临时canvas来裁剪当前页的内容
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
const generateLinkLoading = ref(false);

// 显示药费收据弹窗
const showDrugFeeReceiptModal = (record) => {
    console.log('showDrugFeeReceiptModal', record);
    drugFeeReceiptData.value = {
        tradeId: record.tradeId || '',
        formId: record.formId || '',
        userName: record.userName || '',
        hkChargeId: record.hkChargeId || '',
        receiptNumber: record.receiptNumber || '',
        receiptCode: record.receiptCode || '',
        receiptDate: record.receiptDate || record.tradeTime || '',
        medicines: record.tradeMedicineList
            ? record.tradeMedicineList.map(m => ({
                name: m.name || '',
                spec: m.spec || '',
                quantity: m.medicineCun || m.quantity || '',
                taxRate: m.taxRate,
                price: m.price,
                customDuty: m.customDuty,
                medicineId: m.medicineId || '',
            }))
            : [],
        logisticsFee: record.logisticsFee || '',
        totalAmount: record.tradeFee || '',
        stampImg: record.stampImg || '',
        doctorTitle: record.doctorTitle || '',
        totalPrice: record.totalPrice
    };
    drugFeeReceiptVisible.value = true;
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
// ==================== 药物授权委托书弹窗 ====================
const attorneyModalVisible = ref(false);
const attorneyData = ref({});
const attorneyPrintRef = ref(null);

// ==================== 会诊报告详情弹窗 ====================
const reportModalVisible = ref(false);
const checkDetail = ref({});
const selectedRecord = reactive({});

// ==================== 处方单弹窗 ====================
const prescriptionDetail = ref({});

// ==================== 购药单弹窗 ====================
const dispensingModalVisible = ref(false);
const dispensingDetail = ref({});

// 显示药物授权委托书弹窗
const showAttorneyModal = async (record) => {
    try {
        const res = await attorney({ tradeId: record.tradeId });
        if (res.code === "200" || res.code === 200) {
            attorneyData.value = res.data.data || {};
            attorneyModalVisible.value = true;
        } else {
            message.error(res.msg || t("receipt.queryAttorneyFailed"));
        }
    } catch (error) {
        console.error("查询授权委托书失败", error);
        message.error(t("receipt.queryAttorneyFailed"));
    }
};

// 药物授权委托书打印
const handleAttorneyPrint = () => {
    const printContent = attorneyPrintRef.value;
    if (!printContent) return;
    const printWindow = window.open();
    printWindow.document.write(`
            <html>
            <head>
                <title>${t("receipt.attorneyTitle")}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h3 { margin-top: 20px; margin-bottom: 10px; font-size: 16px; }
                    p { margin: 6px 0; font-size: 14px; line-height: 1.6; }
                    .attorney-section { margin-bottom: 16px; }
                    .section-title { font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 4px; }
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

// 药物授权委托书导出PDF（修复版 - 支持完整内容导出和多页）
const handleAttorneyExport = async () => {
    const element = attorneyPrintRef.value;
    if (!element) return;
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 左右各留10mm边距
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const margin = 10; // 边距

        // 如果内容高度小于等于一页可用高度，直接放到一页
        if (imgHeight <= pdfPageHeight - 2 * margin) {
            pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        } else {
            // 内容超过一页，需要分页处理
            // 计算每页可以显示的内容高度
            const pageContentHeight = pdfPageHeight - 2 * margin;
            // 计算总共需要多少页
            const totalPages = Math.ceil(imgHeight / pageContentHeight);

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) {
                    pdf.addPage();
                }

                // 计算当前页需要裁剪的canvas部分
                const sourceY = (page * pageContentHeight * canvas.width) / imgWidth;
                const sourceHeight = Math.min((pageContentHeight * canvas.width) / imgWidth, canvas.height - sourceY);

                // 创建临时canvas来裁剪当前页的内容
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

        pdf.save(`${t("receipt.attorneyTitle")}.pdf`);
        message.success(t("receipt.exportSuccess"));
    } catch (error) {
        console.error("导出失败", error);
        message.error(t("receipt.exportFailed"));
    }
};

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

// ==================== 处方单弹窗方法 ====================
const showPrescriptionModalNew = async (record) => {
    prescriptionDetail.value = {};
    dispensingDetail.value = {};
    try {
        const res = await selectPharmacyAuditDetail({ consultationId: record.consultationId });
        if (res.code == 200 || res.code === "200") {
            prescriptionDetail.value = res.data.data || {};
            dispensingDetail.value = res.data.data || {};
        }
    } catch (error) {
        console.error("获取处方单详情失败", error);
    }
    prescriptionModalVisible.value = true;
};

// ==================== 购药单弹窗方法 ====================
const showDispensingModal = async (record) => {
    dispensingDetail.value = {};
    dispensingModalVisible.value = true;
    try {
        const res = await selectPharmacyAuditDetail({ consultationId: record.consultationId });
        if (res.code == 200 || res.code === "200") {
            dispensingDetail.value = res.data.data || {};
            console.log("获取配药单详情成功", dispensingDetail.value);
            prescriptionDetail.value = res.data.data || {};
        }
    } catch (error) {
        console.error("获取购药单详情失败", error);
    }
};

// ==================== 出口证号编辑弹窗 ====================
const exportCertificateModalVisible = ref(false);
const exportCertificateForm = reactive({
    tradeId: "",
    wdlExportCertificate: "1",
});

const showExportCertificateModal = (record) => {
    exportCertificateForm.tradeId = record.tradeId;
    exportCertificateForm.wdlExportCertificate = record.wdlExportCertificate || "";
    exportCertificateModalVisible.value = true;
};

const handleExportCertificateSubmit = async () => {
    try {
        const res = await updexpenditure({
            tradeId: exportCertificateForm.tradeId,
            wdlExportCertificate: 'wdl2',
            tradeStatus: "2",
        });
        if (res.code === "200" || res.code === 200) {
            message.success(t("receipt.saveSuccess"));
            exportCertificateModalVisible.value = false;
            fetchTableData();
        } else {
            message.error(res.msg || t("receipt.saveFailed"));
        }
    } catch (error) {
        console.error("保存失败", error);
        message.error(t("receipt.saveFailed"));
    }
};

// ==================== 物流单号编辑弹窗 ====================
const logisticsModalVisible = ref(false);
const logisticsForm = reactive({
    tradeId: "",
    logisticsNo: "",
});

const showLogisticsModal = (record) => {
    logisticsForm.tradeId = record.tradeId;
    logisticsForm.logisticsNo = record.logisticsNo || "";
    logisticsModalVisible.value = true;
};

const handleLogisticsSubmit = async (record) => {
    try {
        logisticsForm.tradeId = record.tradeId;
        const res = await updexpenditure({
            tradeId: logisticsForm.tradeId,
            // logisticsNo: logisticsForm.logisticsNo,
            tradeStatus: "3",
            dispenseStaff: sessionStorage.getItem("username"),
        });
        console.log(res);
        if (res.code == 200) {
            if (res.data.code == 1000) {
                message.success(t("receipt.saveSuccess"));
                logisticsModalVisible.value = false;
                fetchTableData();
            } else {
                message.error(res.data.message);
            }

        } else {
            message.error(res.msg || t("receipt.saveFailed"));
        }
    } catch (error) {
        console.error("保存失败", error);
        message.error(t("receipt.saveFailed"));
    }
};
const cancelShipment = async (record) => {
    try {

        console.log(record);

        const params = {
            tradeId: record.tradeId,
            tradeStatus: "2",
            dispenseStaff: sessionStorage.getItem("username"),
            logisticsNo: record.logisticsNo,
        };
        console.log(1);
        const res = await updexpenditure(params);
        console.log(2);
        if (res.data.code == 1000) {
            message.success(t("public.saveSuccess"));
            logisticsModalVisible.value = false;
            fetchTableData();
        } else {
            message.error(res.data.message);
        }


    } catch (error) {

    }
};
// ==================== 查询 / 重置 / 分页 ====================
const handleSearch = () => {
    pagination.current = 1;
    fetchTableData();
};

const handleReset = () => {
    searchForm.tradeId = "";
    searchForm.tradeTime = null;
    searchForm.reciveTel = "";
    searchForm.tradeStatu = undefined;
    searchForm.wdlExportCertificate = "";
    searchForm.logisticsNo = "";
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

.prescription-content {
    padding: 16px;

    .prescription-header {
        p {
            margin: 4px 0;
        }
    }

    .prescription-info {
        p {
            margin: 8px 0;
        }
    }

    .prescription-medicine {
        h4 {
            margin-bottom: 12px;
        }
    }
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

.attorney-content {
    padding: 16px;
    max-height: none;
    overflow-y: visible;

    .attorney-section {
        margin-bottom: 20px;

        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e8e8e8;
        }

        p {
            margin: 6px 0;
            font-size: 14px;
            line-height: 1.8;
            color: #333;
        }

        .medicine-list {
            margin-top: 8px;
            padding-left: 16px;
        }
    }
}
</style>
