<template>
  <div class="remote-consultation">
    <!-- ========== 搜索栏 ========== -->
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item :label="$t('form.appointmentPerson')">
          <a-input v-model:value="searchForm.appointmentPerson" :placeholder="$t('form.enterAppointmentPerson')"
            style="width: 200px" />
        </a-form-item>
        <a-form-item :label="$t('form.consultingDoctor')">
          <a-input v-model:value="searchForm.consultingDoctor" :placeholder="$t('form.enterConsultingDoctor')"
            style="width: 200px" />
        </a-form-item>
        <a-form-item :label="$t('form.appointmentTime')">
          <a-date-picker v-model:value="searchForm.appointmentTime" :placeholder="$t('form.selectAppointmentTime')"
            style="width: 200px" />
        </a-form-item>
        <a-form-item class="search-actions">
          <a-button type="primary" @click="handleSearch">{{ $t('button.search') }}</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">{{ $t('button.reset') }}</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <!-- ========== 数据表格 ========== -->
    <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id" :scroll="{ y: 470 }"
      @change="changePage">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'orderuserid'">
          <a style="color: #1890ff; cursor: pointer;" @click="showUserCaseModal(record)">
            点击查看
          </a>
        </template>
        <template v-else-if="column.key === 'username'">
          <a @click="showUserDetailModal(record)" style="color: #1890ff; cursor: pointer;">
            {{ record.username }}
          </a>
        </template>
        <template v-else-if="column.key === 'consultationid'">
          <a class="text-blue-600 hover:text-blue-800" @click="showConsultationReport(record)">
            {{ record.consultationid }}
          </a>
        </template>
        <template v-else-if="column.key === 'prescription'">
          <a-button type="link" :disabled="String(record.state) === '5' || record.consultationid == null"
            @click="showPrescriptionModal(record)">
            点击查看
          </a-button>
        </template>
        <template v-else-if="column.key === 'writePrescription'">
          <a-button type="link" :disabled="String(record.state) !== '5'"
            @click="String(record.state) === '5' && openUploadTypeModal(record)">
            填写处方
          </a-button>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" @click="showConsultationModal(record)" :disabled="record.operationType !== 'CONSULT'">
            {{ $t('button.consultation') }}
          </a-button>
        </template>

        <template v-else-if="column.key === 'editSuggestion'">
          <a-button type="link" :disabled="!['2', '7'].includes(String(record.state))"
            @click="openEditSuggestionModal(record)">
            修改建議單
          </a-button>
        </template>
        <template v-else-if="column.key === 'editPrescription'">
          <a-button type="link" :disabled="String(record.state) !== '6'" @click="openEditPrescriptionModal(record)">
            修改處方單
          </a-button>
        </template>
        <template v-else-if="column.key === 'viewUserCase'">
          <a-button type="link" :disabled="String(record.state) !== '7'" @click="Sendprescription(record)">
            发送处方
          </a-button>
        </template>
      </template>
    </a-table>
    <!-- ========== 编辑弹窗（updateConsultation） ========== -->
    <a-modal v-model:open="editModalVisible" :title="$t('button.edit')" width="600px" @ok="saveEdit"
      @cancel="editModalVisible = false">
      <div class="mb-4">
        <div class="text-gray-700 mb-2">诊断建议：</div>
        <a-textarea v-model:value="editForm.diagnosticReport" :rows="4" />
      </div>
      <div class="mb-4">
        <div class="text-gray-700 mb-2">{{ $t('label.medication') }}：</div>
        <a-textarea v-if="!editFormIsImage" v-model:value="editForm.medicationAdvice" :rows="3" />
        <div v-else style="display: flex; gap: 20px;">
          <a-upload v-model:file-list="editUpload.fileList.value" :before-upload="editUpload.beforeUpload"
            :max-count="1" accept="image/*" list-type="picture-card">
            <div v-if="editUpload.fileList.value.length < 1">
              <div style="margin-top: 8px; font-size: 13px; color: #999;">点击上传图片</div>
            </div>
          </a-upload>
          <PrescriptionUploadTips />
        </div>
      </div>
      <div style="margin-top: 20px; margin-bottom: 20px; text-align: left">
        <div style="margin-bottom: 10px; font-weight: bold;">药品列表</div>
        <div v-for="(medicine, index) in editForm.medicines" :key="index"
          style="display: flex; gap: 10px; margin-bottom: 15px; align-items: flex-start">
          <div style="display: flex; justify-content: space-around;">
            <a-input v-model:value="medicine.name" placeholder="药品名称" style="width: 150px; margin-right: 10px;" />
            <a-input v-model:value="medicine.spec" placeholder="药品规格" style="width: 150px; margin-right: 10px;" />
            <a-input-number v-model:value="medicine.medicineCun" :min="1" placeholder="药品数量" />
          </div>
          <a-button type="text" danger @click="removeEditMedicine(index)">删除</a-button>
        </div>
        <a-button type="dashed" style="width: 100%; margin-bottom: 15px" @click="addEditMedicine">
          <template #icon><span style="font-size: 16px; font-weight: bold">+</span></template>
          新增药品
        </a-button>
      </div>
      <ConfirmModal v-model:step1Visible="editConfirmSignVisible" v-model:step2Visible="editConfirmNameVisible"
        step1Title="确认签署" step1Text="您确认签署？" step2Title="确认签字" step2Text="您确认签字？" @confirm="handleEditConfirmName" />
    </a-modal>

    <!-- ========== 会诊弹窗（insertConsultation） ========== -->
    <a-modal v-model:open="consultationModalVisible" destroyOnClose title="醫療建議單" width="65%" :footer="null"
      style="transform: translateX(300px);">
      <a-spin :spinning="consultationDetailLoading">
        <div class="consultation-report">
          <!-- 建议单头部（1.png样式），用 ref 绑定截图区域 -->
          <div ref="suggestionPreviewRef">
            <HospitalHeader :doctor-name="detailsss.doctorName" :hk-certificate="detailsss.hkCertificate"
              :pro-qualify-certificate="detailsss.proQualifyCertificate" :practice-site="detailsss.practiceSite"
              :hospital-name="detailsss.hospitalName" :sub-hospital-name="detailsss.subHospitalName"
              :hospital="detailsss.hospital" :formId="detailsss.formId"
              :create-time="detailsss.createTime ? String(detailsss.createTime).slice(0, 10) : ''" />
            <hr style="border: none; border-top: 1.5px solid #555; margin: 8px 0;" />

            <!-- 患者信息行（1.png样式） -->
            <div
              style="display: flex; flex-wrap: wrap; gap: 0 24px; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #ccc; margin-bottom: 8px;">
              <span>患者姓名：{{ detailsss.userName || '' }}</span>
              <span>性別：{{ detailsss.sex == 1 ? '男' : '女' }}</span>
              <span>出生日期：{{ detailsss.birthyDay || '' }}</span>
              <span>年齡：{{ detailsss.age || '' }}</span>
              <span>診療方式：{{ detailsss.consultationType || '互聯網視診' }}</span>
              <span>患者編號：{{ detailsss.userPatientId || '' }}</span>
            </div>

            <div style="text-align: center; margin: 12px 0;">
              <a-button type="primary" size="large" @click="startConsultation" style="margin-right: 20px;">
                {{ $t('button.startConsultation') }}
              </a-button>
              <a-button type="primary" size="large" @click="showUserCaseModal(detailsss)">
                查看病历
              </a-button>
            </div>

            <!-- 会诊用药（MedicineSelector 封装） -->
            <MedicineSelector :medicine-type-list="medicineTypeList" :medicine-list="consultationMed.medicineList.value"
              :medicine-pagination="consultationMed.medicinePagination"
              :selected-ids="consultationMed.selectedIds.value" :quantities="consultationMed.quantities"
              :extra-fields="consultationMed.extraFields" :manual-medicines="consultationMed.manualMedicines.value"
              :search-form="consultationMed.searchForm" @search="consultationMed.handleSearch"
              @table-change="consultationMed.handleTableChange" @toggle-select-all="consultationMed.toggleSelectAll"
              @toggle-select="consultationMed.toggleSelect" @add-manual="consultationMed.addManual"
              @remove-manual="consultationMed.removeManual" />

          </div>

          <!-- 诊断意见输入 -->
          <div style="margin-top: 16px;">
            <span style="font-weight: bold;">诊断意见（输入）：</span>
            <a-textarea v-model:value="diagnosisReport" :rows="4" placeholder="请输入诊断意见" style="margin-top: 6px;" />
          </div>

          <!-- 底部按钮 -->
          <div style="text-align: right; margin-top: 16px;">
            <a-button style="margin-right: 10px" @click="consultationModalVisible = false">
              {{ $t('button.cancel') }}
            </a-button>
            <a-button type="primary" @click="saveConsultation">
              {{ $t('button.confirm') }}
            </a-button>
          </div>
        </div>

      </a-spin>
      <!-- ========== 会诊弹窗 - 第一步确认（预览建议单 + 截图上传） ========== -->
      <a-modal v-model:open="confirmSignVisible" style="transform: translateX(300px);" title="確認簽署建議單" width="68%"
        ok-text="確定" cancel-text="取消" :confirm-loading="suggestionUploading" @ok="handleSuggestionStep1Ok"
        @cancel="confirmSignVisible = false">
        <p style="color: #c0392b; font-size: 13px; margin-bottom: 12px;">請確認以下建議單內容，點擊確定後將生成圖片並提交。</p>
        <!-- 建议单预览（克隆展开截图区域） -->
        <div ref="suggestionPreviewCloneRef"
          style="background:#fff; padding:24px 28px; border:1px solid #eee; border-radius:4px; overflow:visible;">
          <HospitalHeader :doctor-name="detailsss.doctorName" :hk-certificate="detailsss.hkCertificate"
            :hospital="detailsss.hospital" :pro-qualify-certificate="detailsss.proQualifyCertificate"
            :practice-site="detailsss.practiceSite" :hospital-name="detailsss.hospitalName" :formId="detailsss.formId"
            :sub-hospital-name="detailsss.subHospitalName" :serial-number="detailsss.serialNumber"
            :create-time="detailsss.createTime ? String(detailsss.createTime).slice(0, 10) : ''" />
          <hr style="border: none; border-top: 1.5px solid #555; margin: 8px 0;" />
          <div
            style="display: flex; flex-wrap: wrap; gap: 0 24px; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #ccc; margin-bottom: 8px;">
            <span>患者姓名：{{ detailsss.userName || '' }}</span>
            <span>性別：{{ detailsss.sex == 1 ? '男' : '女' }}</span>
            <span>出生日期：{{ detailsss.birthyDay || '' }}</span>
            <span>年齡：{{ detailsss.age || '' }}</span>
            <span>診療方式：{{ detailsss.consultationType || '互聯網視診' }}</span>
            <span>患者編號：{{ detailsss.userPatientId || '' }}</span>
          </div>
          <div style="margin: 10px 0 6px; font-size: 13px;">
            <span style="font-weight: bold;">診斷意見：</span>{{ diagnosisReport }}
          </div>
          <div style="min-height: 32px; margin-bottom: 14px;"></div>
          <div style="font-size: 13px; margin-bottom: 8px;">建議服用藥物:</div>
          <!-- 简化药品列表预览（仅列名称） -->
          <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">
            <thead>
              <tr>
                <th v-for="col in suggestionTableHeaders" :key="col"
                  style="border:1px solid #555;padding:3px 4px;text-align:center;white-space:nowrap;">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in consultationMed.buildMedicines()" :key="idx">
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ idx + 1 }}</td>
                <td style="border:1px solid #555;padding:4px;">{{ item.name }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.spec }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.dosageForm }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.directionsRoute }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.frenquency }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.duration }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.medicineCun }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.specialPurpose }}</td>
              </tr>
              <tr v-if="!consultationMed.buildMedicines().length">
                <td colspan="9" style="border:1px solid #555;padding:8px;text-align:center;">（暫無藥品）</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align: right; font-size: 13px;">醫生簽名：<img :src="detailsss.doctorSign"
              style="height: 120px; width: auto; vertical-align: middle;" alt="医生签名" /></div>

          <hr style="border: none; border-top: 1.5px solid; margin: 10px 0 6px;" />
          <div style="display: flex; justify-content: space-between; font-size: 12px; ">
            <div>
              <!-- 底部免责说明（可根据实际需要配置） -->
              本文件屬於跨境遠程醫學諮詢與延續用藥建議，不屬於中國內地線下實體藥店之普通處方銷售憑證。

            </div>
            <div style="text-align: right;">
              <div>地址：{{ detailsss.address || '' }}</div>
              <div>TEL：{{ detailsss.contactPhone || '' }}</div>
            </div>
          </div>
        </div>
      </a-modal>
      <!-- 会诊弹窗 - 第二步确认（独立，在 modal 外） -->
      <a-modal v-model:open="confirmNameVisible" title="確認簽名" :width="360" ok-text="確定" cancel-text="取消"
        @ok="handleConfirmName" @cancel="confirmNameVisible = false">
        <p style="font-size: 16px; text-align: center; padding: 12px 0;">您確認簽名？</p>
      </a-modal>
      <!-- ========== 用户病例弹窗 ========== -->
      <a-modal v-model:open="userCaseModalVisible" :title="$t('userCase.title')"
        style="transform: translateX(300px); width: 900px;" z-index="1000" :footer="null">
        <a-spin :spinning="userCaseLoading">
          <div v-if="userCaseList.length === 0 && !userCaseLoading" style="text-align: center; padding: 40px;">
            {{ $t('userCase.noData') }}
          </div>
          <div v-else>
            <a-collapse v-model:activeKey="activeCaseKey" accordion>
              <a-collapse-panel v-for="(item, index) in userCaseList" :key="String(item.id)"
                :header="$t('userCase.record') + (index + 1) + ' - ' + item.createTime">
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
    </a-modal>
    <!-- ========== 会诊报告详情弹窗 ========== -->
    <a-modal v-model:open="reportModalVisible" title="" width="60%" :footer="null">
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
                {{ col.zh }}({{ col.en }})
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="checkDetail.medicines && checkDetail.medicines.length > 0">
              <tr v-for="(item, index) in checkDetail.medicines" :key="index">
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ index + 1 }}</td>
                <td style="border: 1px solid ; padding: 6px;">{{ item.name || '' }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.spec || '' }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.dosageForm || ''
                }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.directionsRoute ||
                  '' }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.frenquency || ''
                }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.duration || '' }}
                </td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.medicineCun || ''
                }}</td>
                <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.specialPurpose ||
                  '' }}</td>
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
    <!-- ========== 查看处方单弹窗 ========== -->
    <a-modal v-model:open="prescriptionModalVisible" title="" width="60%" :footer="null"
      :bodyStyle="{ padding: '32px 40px' }">
      <PrescriptionForm :detail="dispensingDetail" />
    </a-modal>
    <!-- ========== 选择填写方式弹窗（文字/图片） ========== -->
    <a-modal v-model:open="uploadTypeVisible" title="选择填写方式" :width="360" :footer="null"
      @cancel="uploadTypeVisible = false">
      <div style="display: flex; gap: 16px; justify-content: center; padding: 24px 0;">
        <a-button type="primary" size="large" style="width: 120px; height: 60px; font-size: 16px;"
          @click="selectUploadType('text')">
          文字上传
        </a-button>
        <a-button size="large" style="width: 120px; height: 60px; font-size: 16px;" @click="selectUploadType('image')">
          图片上传
        </a-button>
      </div>
    </a-modal>
    <!-- ========== 图片上传处方弹窗 ========== -->
    <a-modal v-model:open="imgPrescriptionVisible" title="图片上传处方" :width="520" :footer="null" destroyOnClose>
      <div style="padding: 16px 0;">
        <div style="margin-bottom: 16px; font-weight: bold;">上传处方图片</div>
        <a-upload v-model:file-list="wpImgUpload.fileList.value" :before-upload="wpImgUpload.beforeUpload"
          :max-count="1" accept="image/*" list-type="picture-card">
          <div v-if="wpImgUpload.fileList.value.length < 1">
            <div style="margin-top: 8px; font-size: 13px; color: #999;">点击上传图片</div>
          </div>
        </a-upload>
        <PrescriptionUploadTips />
        <div v-if="wpImgUpload.uploading.value" style="color: #1890ff; margin-top: 8px; font-size: 13px;">图片上传中...</div>
        <div v-if="wpImgUpload.uploadedUrl.value && !wpImgUpload.uploading.value"
          style="color: #52c41a; margin-top: 8px; font-size: 13px;">图片上传成功</div>
        <div v-if="wpImgUpload.uploadError.value" style="color: #ff4d4f; margin-top: 8px; font-size: 13px;">{{
          wpImgUpload.uploadError.value }}</div>
        <div style="margin-top: 20px; margin-bottom: 8px;">
          <span style="font-weight: bold; margin-right: 10px;">选择药房：</span>
          <a-select v-model:value="wpImgSelectedPharmacy" placeholder="请选择药房" style="width: 300px">
            <a-select-option v-for="item in getlistfh" :key="item.pharmacistId" :value="item.pharmacistId">
              {{ item.pharmacyName }} - {{ item.pharmacistId }}
            </a-select-option>
          </a-select>
        </div>
        <div style="text-align: right; margin-top: 24px;">
          <a-button style="margin-right: 10px" @click="imgPrescriptionVisible = false">取消</a-button>
          <a-button type="primary" :disabled="wpImgUpload.uploading.value" @click="submitImgPrescription">确认</a-button>
        </div>
      </div>

      <!-- 图片上传处方 - 第一步确认（预览处方单 + 截图上传） -->
      <a-modal v-model:open="wpImgConfirmSignVisible" title="確認簽署處方單" width="60%" ok-text="確定" cancel-text="取消"
        :confirm-loading="wpImgPrescriptionUploading" @ok="handleWpImgPrescriptionStep1Ok"
        @cancel="wpImgConfirmSignVisible = false">
        <p style="color: #c0392b; font-size: 13px; margin-bottom: 12px;">請確認以下處方單內容，點擊確定後將生成圖片並提交。</p>
        <div ref="wpImgPrescriptionPreviewRef"
          style="background:#fff; padding:24px 28px; border:1px solid #eee; border-radius:4px; overflow:visible;">
          <PrescriptionFormSSS :detail="wpImgPrescriptionDetail" />
        </div>
      </a-modal>

      <!-- 图片上传处方 - 第二步确认（独立，在 modal 外） -->
      <a-modal v-model:open="wpImgConfirmNameVisible" title="確認簽名" :width="360" ok-text="確定" cancel-text="取消"
        @ok="handleWpImgConfirmName" @cancel="wpImgConfirmNameVisible = false">
        <p style="font-size: 16px; text-align: center; padding: 12px 0;">您確認簽名？</p>
      </a-modal>
    </a-modal>
    <!-- ========== 填写处方弹窗（文字） ========== -->
    <a-modal v-model:open="writePrescriptionVisible" title="填写处方" width="60%" :footer="null"
      :bodyStyle="{ padding: '32px 40px' }" destroyOnClose>
      <PrescriptionFormSSS :detail="writePrescriptionDetail" ref="prescriptionFormRef">
        <template #default>
          <div style="margin-bottom: 20px; margin-top: 16px;">
            <div style="margin-bottom: 10px;">RX</div>
            <a-textarea v-model:value="wpRx" :placeholder="$t('placeholder.medicationAdvice')" :rows="4" />
          </div>
          <div style="margin-bottom: 20px;">
            <span style="margin-right: 10px; font-weight: bold;">选择药房：</span>
            <a-select v-model:value="wpSelectedPharmacy" placeholder="请选择药房" style="width: 300px">
              <a-select-option v-for="item in getlistfh" :key="item.pharmacistId" :value="item.pharmacistId">
                {{ item.pharmacyName }} - {{ item.pharmacistId }}
              </a-select-option>
            </a-select>
          </div>
          <div style="text-align: right; margin-top: 24px;">
            <a-button style="margin-right: 10px" @click="writePrescriptionVisible = false">取消</a-button>
            <a-button type="primary" @click="submitWritePrescription(writePrescriptionDetail)">确认</a-button>
          </div>
        </template>
      </PrescriptionFormSSS>
      <!-- ========== 填写处方 - 第一步确认（预览处方单 + 截图上传） ========== -->
      <a-modal v-model:open="wpConfirmSignVisible" title="確認簽署處方單" width="60%" ok-text="確定" cancel-text="取消"
        :confirm-loading="prescriptionUploading" @ok="handlePrescriptionStep1Ok" @cancel="wpConfirmSignVisible = false">
        <p style="color: #c0392b; font-size: 13px; margin-bottom: 12px;">請確認以下處方單內容，點擊確定後將生成圖片並提交。</p>
        <div ref="prescriptionPreviewRef"
          style="background:#fff; padding:24px 28px; border:1px solid #eee; border-radius:4px; overflow:visible;">
          <PrescriptionFormSSS :detail="writePrescriptionDetail" />
        </div>
      </a-modal>

      <!-- 填写处方 - 第二步确认（独立，在 modal 外） -->
      <a-modal v-model:open="wpConfirmNameVisible" title="確認簽名" :width="360" ok-text="確定" cancel-text="取消"
        @ok="handleWpConfirmName" @cancel="wpConfirmNameVisible = false">
        <p style="font-size: 16px; text-align: center; padding: 12px 0;">您確認簽名？</p>
      </a-modal>

    </a-modal>
    <!-- ========== 修改建议单弹窗（state=2/7） ========== -->
    <a-modal v-model:open="editSuggestionModalVisible" destroyOnClose title="修改建議單" width="60%" :footer="null"
      style="transform: translateX(350px);">
      <a-spin :spinning="editSuggestionLoading">
        <div class="consultation-report">
          <!-- 建议单头部（1.png样式） -->
          <HospitalHeader :doctor-name="editSuggestionDetail.doctorName"
            :hk-certificate="editSuggestionDetail.hkCertificate" :hospital="editSuggestionDetail.hospital"
            :pro-qualify-certificate="editSuggestionDetail.proQualifyCertificate"
            :practice-site="editSuggestionDetail.practiceSite" :hospital-name="editSuggestionDetail.hospitalName"
            :sub-hospital-name="editSuggestionDetail.subHospitalName" :formId="editSuggestionDetail.formId"
            :create-time="editSuggestionDetail.createTime ? String(editSuggestionDetail.createTime).slice(0, 10) : ''" />
          <hr style="border: none; border-top: 1.5px solid #555; margin: 8px 0;" />

          <!-- 患者信息行（1.png样式） -->
          <div
            style="display: flex; flex-wrap: wrap; gap: 0 24px; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #ccc; margin-bottom: 8px;">
            <span>患者姓名：{{ editSuggestionDetail.userName || '' }}</span>
            <span>性別：{{ editSuggestionDetail.sex == 1 ? '男' : '女' }}</span>
            <span>出生日期：{{ editSuggestionDetail.birthyDay || '' }}</span>
            <span>年齡：{{ editSuggestionDetail.age || '' }}</span>
            <span>診療方式：{{ editSuggestionDetail.consultationType || '互聯網視診' }}</span>
            <span>患者編號：{{ editSuggestionDetail.userPatientId || '' }}</span>
          </div>

          <div style="margin-bottom: 20px;">
            <MedicineSelector :medicine-type-list="medicineTypeList"
              :medicine-list="editSuggestionMed.medicineList.value"
              :medicine-pagination="editSuggestionMed.medicinePagination"
              :selected-ids="editSuggestionMed.selectedIds.value" :quantities="editSuggestionMed.quantities"
              :extra-fields="editSuggestionMed.extraFields" :manual-medicines="editSuggestionMed.manualMedicines.value"
              :search-form="editSuggestionMed.searchForm" @search="editSuggestionMed.handleSearch"
              @table-change="editSuggestionMed.handleTableChange" @toggle-select-all="editSuggestionMed.toggleSelectAll"
              @toggle-select="editSuggestionMed.toggleSelect" @add-manual="editSuggestionMed.addManual"
              @remove-manual="editSuggestionMed.removeManual" />
          </div>
          <div style="margin-top: 10px;">
            <span style="font-weight: bold;">诊断意见：</span>
            <a-textarea v-model:value="editSuggestionDiagnosisReport" :rows="4" placeholder="请输入诊断意见"
              style="margin-top: 6px;" />
          </div>
          <div style="text-align: right; margin-top: 16px;">
            <a-button style="margin-right: 10px" @click="editSuggestionModalVisible = false">
              {{ $t('button.cancel') }}
            </a-button>
            <a-button type="primary" @click="saveEditSuggestion">
              {{ $t('button.confirm') }}
            </a-button>
          </div>
        </div>
      </a-spin>
      <!-- 修改建议单 - 第一步确认（预览建议单 + 截图上传） -->
      <a-modal v-model:open="editSuggestionConfirmSignVisible" title="確認簽署建議單" width="63%" ok-text="確定" cancel-text="取消"
        :confirm-loading="editSuggestionUploading" @ok="handleEditSuggestionStep1Ok"
        @cancel="editSuggestionConfirmSignVisible = false">
        <p style="color: #c0392b; font-size: 13px; margin-bottom: 12px;">請確認以下建議單內容，點擊確定後將生成圖片並提交。</p>
        <div ref="editSuggestionPreviewRef"
          style="background:#fff; padding:24px 28px; border:1px solid #eee; border-radius:4px; overflow:visible;">
          <HospitalHeader :doctor-name="editSuggestionDetail.doctorName"
            :hk-certificate="editSuggestionDetail.hkCertificate" :hospital="editSuggestionDetail.hospital"
            :pro-qualify-certificate="editSuggestionDetail.proQualifyCertificate" :formId="editSuggestionDetail.formId"
            :practice-site="editSuggestionDetail.practiceSite" :hospital-name="editSuggestionDetail.hospitalName"
            :sub-hospital-name="editSuggestionDetail.subHospitalName" :shospital="editSuggestionDetail.hospital"
            :create-time="editSuggestionDetail.createTime ? String(editSuggestionDetail.createTime).slice(0, 10) : ''" />
          <hr style="border: none; border-top: 1.5px solid #555; margin: 8px 0;" />
          <div
            style="display: flex; flex-wrap: wrap; gap: 0 24px; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #ccc; margin-bottom: 8px;">
            <span>患者姓名：{{ editSuggestionDetail.userName || '' }}</span>
            <span>性別：{{ editSuggestionDetail.sex == 1 ? '男' : '女' }}</span>
            <span>出生日期：{{ editSuggestionDetail.birthyDay || '' }}</span>
            <span>年齡：{{ editSuggestionDetail.age || '' }}</span>
            <span>診療方式：{{ editSuggestionDetail.consultationType || '互聯網視診' }}</span>
            <span>患者編號：{{ editSuggestionDetail.userPatientId || '' }}</span>
          </div>
          <div style="margin: 10px 0 6px; font-size: 13px;">
            <span style="font-weight: bold;">診斷意見：</span>{{ editSuggestionDiagnosisReport }}
          </div>
          <div style="min-height: 32px; margin-bottom: 14px;"></div>
          <div style="font-size: 13px; margin-bottom: 8px;">建議服用藥物:</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">
            <thead>
              <tr>
                <th v-for="col in suggestionTableHeaders" :key="col"
                  style="border:1px solid #555;padding:3px 4px;text-align:center;white-space:nowrap;">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in editSuggestionMed.buildMedicines()" :key="idx">
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ idx + 1 }}</td>
                <td style="border:1px solid #555;padding:4px;">{{ item.name }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.spec }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.dosageForm }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.directionsRoute }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.frenquency }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.duration }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.medicineCun }}</td>
                <td style="border:1px solid #555;padding:4px;text-align:center;">{{ item.specialPurpose }}</td>
              </tr>
              <tr v-if="!editSuggestionMed.buildMedicines().length">
                <td colspan="9" style="border:1px solid #555;padding:8px;text-align:center;">（暫無藥品）</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align: right; font-size: 13px;">醫生簽名：<img :src="editSuggestionDetail.doctorSign"
              style="height: 120px; width: auto; vertical-align: middle;" alt="医生签名" /></div>
          <hr style="border: none; border-top: 1.5px solid ; margin: 10px 0 6px;" />
          <div style="display: flex; justify-content: space-between; font-size: 12px; ">
            <div>
              <!-- 底部免责说明（可根据实际需要配置） -->
              本文件屬於跨境遠程醫學諮詢與延續用藥建議，不屬於中國內地線下實體藥店之普通處方銷售憑證。

            </div>
            <div style="text-align: right;">
              <div>地址：{{ editSuggestionDetail.address || '' }}</div>
              <div>TEL：{{ editSuggestionDetail.contactPhone || '' }}</div>
            </div>
          </div>
        </div>
      </a-modal>

      <!-- 修改建议单 - 第二步确认（独立，在 modal 外） -->
      <a-modal v-model:open="editSuggestionConfirmNameVisible" title="確認簽名" :width="360" ok-text="確定" cancel-text="取消"
        @ok="handleEditSuggestionConfirmName" @cancel="editSuggestionConfirmNameVisible = false">
        <p style="font-size: 16px; text-align: center; padding: 12px 0;">您確認簽名？</p>
      </a-modal>

    </a-modal>
    <!-- ========== 修改处方单弹窗（state=6） ========== -->
    <a-modal v-model:open="editPrescriptionModalVisible" title="修改處方單" width="1100px" :footer="null"
      :bodyStyle="{ padding: '32px 40px' }" destroyOnClose>
      <PrescriptionForm :detail="editPrescriptionDetail">
        <template #default>
          <div style="margin-bottom: 10px;">
            <span style="font-weight: bold;">會診藥方(Consultation Medicine):</span>
            <div style="margin-top: 8px;">
              <template v-if="editPrescriptionIsImage">
                <a-upload v-model:file-list="epUpload.fileList.value" :before-upload="epUpload.beforeUpload"
                  :max-count="1" accept="image/*" list-type="picture-card">
                  <div v-if="epUpload.fileList.value.length < 1">
                    <div style="margin-top: 8px; font-size: 13px; color: #999;">点击上传图片</div>
                  </div>
                </a-upload>
                <PrescriptionUploadTips style="margin-top: 8px;" />
                <div v-if="epUpload.uploading.value" style="color: #1890ff; margin-top: 8px; font-size: 13px;">图片上传中...
                </div>
                <div v-if="epUpload.uploadedUrl.value && !epUpload.uploading.value"
                  style="color: #52c41a; margin-top: 8px; font-size: 13px;">图片上传成功</div>
                <div v-if="epUpload.uploadError.value" style="color: #ff4d4f; margin-top: 8px; font-size: 13px;">{{
                  epUpload.uploadError.value }}</div>
              </template>
              <template v-else>
                <a-textarea v-model:value="editPrescriptionTextValue" :rows="4" placeholder="请输入处方内容" />
              </template>
            </div>
          </div>
          <div style="text-align: right; margin-top: 24px;">
            <a-button style="margin-right: 10px" @click="editPrescriptionModalVisible = false">取消</a-button>
            <a-button type="primary" :disabled="epUpload.uploading.value" @click="saveEditPrescription">确认</a-button>
          </div>
        </template>
      </PrescriptionForm>
      <!-- 修改处方单 - 第一步确认（预览处方单 + 截图上传） -->
      <a-modal v-model:open="editPrescriptionConfirmSignVisible" title="確認簽署處方單" width="1080px" ok-text="確定"
        cancel-text="取消" :confirm-loading="editPrescriptionUploading" @ok="handleEditPrescriptionStep1Ok"
        @cancel="editPrescriptionConfirmSignVisible = false">
        <p style="color: #c0392b; font-size: 13px; margin-bottom: 12px;">請確認以下處方單內容，點擊確定後將生成圖片並提交。</p>
        <div ref="editPrescriptionPreviewRef"
          style="background:#fff; padding:24px 28px; border:1px solid #eee; border-radius:4px; overflow:visible;">
          <PrescriptionForms :detail="editPrescriptionDetail" />
        </div>
      </a-modal>

      <!-- 修改处方单 - 第二步确认（独立，在 modal 外） -->
      <a-modal v-model:open="editPrescriptionConfirmNameVisible" title="確認簽名" :width="360" ok-text="確定" cancel-text="取消"
        @ok="handleEditPrescriptionConfirmName" @cancel="editPrescriptionConfirmNameVisible = false">
        <p style="font-size: 16px; text-align: center; padding: 12px 0;">您確認簽名？</p>
      </a-modal>
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
  </div>
  <!-- 视频通话组件（固定定位，全局显示） -->
  <TUICallKit style="width: 600px; height: 650px; position: fixed; top: 7%; left: 1%; z-index: 9999;" />

  <!-- 30分钟通话倒计时 -->
  <VideoCallTimer :active="callActive" @timeout="handleTimerTimeout" @warning="handleTimerWarning"
    ref="videoCallTimerRef" />

  <!-- 实时字幕面板 -->
  <SubtitlePanel :active="callActive" :ws-host="subtitleWsHostRef" :room-id="subtitleRoomId" :user-id="subtitleUserId"
    :second-user-id="subtitleSecondUserId" ref="subtitlePanelRef" />
</template>
<script setup>
// ===== 第三方依赖 =====
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { TUICallKit, TUICallKitAPI, CallMediaType } from '@trtc/calls-uikit-vue';
import * as GenerateTestUserSig from '@/debug/GenerateTestUserSig-es';
// ===== API =====
import {
  selectPharmacyList,
  selectMidUserOrderList,
  midSelectMedicineList,
  selectMedicineTypeList,
  selectUserCaseList,
  selectPharmacyAuditDetail,
  signature,
  updonsultations,
  selectprescriptiondetail,
  asadasdq,
  getuserorderList,
  presConsultation,
  getfirstpreDetail,
  selectUserDetail
} from '@/api/yyf';
import { startRecording, stopRecording } from '@/api/video';
import {
  insertConsultation,
  getConsultationDetail,
  updateConsultation,
} from '@/api/api1';
import { detail } from '@/api/yyf';
// ===== 封装的子组件 =====
import PrescriptionForm from './PrescriptionForm.vue';
import HospitalHeader from './HospitalHeader.vue';
import ConfirmModal from './ConfirmModal.vue';
import MedicineSelector from './MedicineSelector.vue';
import PrescriptionFormSSS from './PrescriptionFormSSS.vue';
import PrescriptionForms from './PrescriptionForms.vue';
import PatientInfoRow from './PatientInfoRow.vue';
import PrescriptionUploadTips from './PrescriptionUploadTips.vue';
import VideoCallTimer from './VideoCallTimer.vue';
import SubtitlePanel from './SubtitlePanel.vue';
import { useSpeechRecognition } from './useSpeechRecognition.js';
// ===== 封装的 Composables =====
import { useMedicineSelector } from './useMedicineSelector';
import { useImageUpload } from './useImageUpload';
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
// -----------------------------------------------
// i18n
// -----------------------------------------------
const { t } = useI18n();

// -----------------------------------------------
// 药房列表
// -----------------------------------------------
const getlistfh = ref([]);
const getlist = async () => {
  const res = await selectPharmacyList({});
  if (res.code == 200) {
    getlistfh.value = res.data.data;
  }
};
getlist();
// -----------------------------------------------
// 搜索表单
// -----------------------------------------------
const searchForm = reactive({
  appointmentPerson: '',
  consultingDoctor: '',
  appointmentTime: '',
  status: undefined,
});
const handleSearch = () => getlists();
const handleReset = () => {
  Object.keys(searchForm).forEach((k) => (searchForm[k] = k === 'status' ? undefined : ''));
  searchForm.appointmentTime = null;
  getlists();
};
// -----------------------------------------------
// 表格列定��
// -----------------------------------------------
const columns = computed(() => [
  { title: t('label.appointmentNumber'), dataIndex: 'orderid', key: 'orderid', align: 'center' },
  { title: t('label.appointmentPerson'), dataIndex: 'username', key: 'username', align: 'center' },
  // { title: '用户病歷', dataIndex: 'orderuserid', key: 'orderuserid', align: 'center' },

  { title: t('label.consultingDoctor'), dataIndex: 'doctorname', key: 'doctorname', align: 'center' },
  { title: t('label.appointmentTime'), dataIndex: 'ordertime', key: 'ordertime', align: 'center' },
  { title: t('label.consultationNumber'), dataIndex: 'consultationid', key: 'consultationid', align: 'center' },
  { title: '處方單', dataIndex: 'consultationid', key: 'prescription', align: 'center' },
  { title: '填写处方', key: 'writePrescription', align: 'center' },
  { title: t('不通过原因'), dataIndex: 'auditreason', key: 'auditreason', align: 'center' },
  { title: t('button.consultation'), key: 'action', width: 100, align: 'center' },
  { title: '修改建議單', key: 'editSuggestion', width: 120, align: 'center' },
  { title: '修改處方單', key: 'editPrescription', width: 120, align: 'center' },
  { title: '发送处方', key: 'viewUserCase', width: 120, align: 'center' },
]);
// -----------------------------------------------
// 表格数据 + 分页
// -----------------------------------------------
const tableData = ref([]);
const totalCount = ref(0);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: totalCount,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `${t('button.total')} ${total} ${t('label.records')}`,
});
const changePage = (pgn) => {
  pagination.current = pgn.current;
  pagination.pageSize = pgn.pageSize;
  getlists();
};
const getlists = async () => {
  const roleType = sessionStorage.getItem('roleType');
  const username = sessionStorage.getItem('username');
  const loginName = ['admin', 'superuser'].includes(roleType) ? '' : username;
  const res = await selectMidUserOrderList({
    orderUserName: searchForm.appointmentPerson,
    doctorName: searchForm.consultingDoctor,
    orderTime: searchForm.appointmentTime,
    orderState: searchForm.status,
    currentPage: pagination.current,
    pageSize: pagination.pageSize,
    roleType,
    loginName,
  });
  if (res.code === '200') {
    tableData.value = res.data.data;
    totalCount.value = res.data.total;
  }
};
getlists();
//-------用户详情-----------
const userDetailModalVisible = ref(false);
const userDetailData = ref({});
const showUserDetailModal = async (record) => {
  console.log(record)
  userDetailData.value = {};
  userDetailModalVisible.value = true;
  try {
    const res = await selectUserDetail({ userId: record.userid });
    if (res.code == 200 || res.code === "200") {
      userDetailData.value = res.data.data || {};
    }
  } catch (error) {
    console.error("获取用户详情失败", error);
  }
};
// -----------------------------------------------
// 发送处方
// -----------------------------------------------
const Sendprescription = async (record) => {
  const res = await asadasdq({
    consultationId: record.consultationid,
    userId: record.userid,
    state: '4',
  });
  if (res.code == 200) {
    message.success('发送成功');
    getlists();
  } else {
    message.error('发送失败');
  }
};
// -----------------------------------------------
// ===== TUICallKit 视频通话 =====
// -----------------------------------------------
/** 是否正在通话（驱动倒计时和字幕面板） */
const callActive = ref(false);
/** 倒计时组件 ref */
const videoCallTimerRef = ref(null);
/** 字幕面板 ref */
const subtitlePanelRef = ref(null);
/**
 * 字幕 WebSocket 服务 host。
 * 字幕服务与业务 API 在同一台机器，端口固定 8089。
 * 从 VITE_API_URL（如 http://192.168.100.14:18085）中提取 host，替换端口为 8089，
 * 协议改为 ws:// / wss://，得到 ws://192.168.100.14:8089。
 */
const subtitleWsHost = (() => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    // 支持 http/https，转换为 ws/wss
    const wsProto = apiUrl.startsWith('https') ? 'wss' : 'ws';
    // 提取 host（去掉协议、去掉路径）
    const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
    return `${wsProto}://${host}:8089`;
  } catch {
    return '';
  }
})();
/** 字幕 WS host��响应式，供模板 prop 绑定） */
const subtitleWsHostRef = ref(subtitleWsHost);
/** 字幕订阅房间 ID */
const subtitleRoomId = ref('');
/** 字幕订阅用户 ID（医生端 userId，如 doctor_16） */
const subtitleUserId = ref('');
/** 字幕订阅第二用户 ID（患者手机号），用于接收医生自己说的话 */
const subtitleSecondUserId = ref('');
/** 患者端识别任务ID（语言切换时需要停止旧任务、启动新任务） */
const userTaskId = ref('');
/** 医生端识别任务ID */
const doctorTaskId = ref('');
/** 音频WS基础地址（如 ws://192.168.100.14:8089/ws/audio/） */
const audioWsBaseUrl = ref('');
/** 双路音频采集 Composable */
const { start: startSpeechCapture, stop: stopSpeechCapture, restartUserAudio } = useSpeechRecognition();

const roomId = ref('');
const callId = ref('');
const recordId = ref('');
const callerUserID = ref(sessionStorage.getItem('username'));
const init = async () => {
  const { userSig, SDKAppID } = GenerateTestUserSig.genTestUserSig({ userID: callerUserID.value });
  await TUICallKitAPI.init({ userID: callerUserID.value, userSig, SDKAppID });
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    await TUICallKitAPI.setSelfInfo({
      nickName: '医生',
      avatar: sessionStorage.getItem('avatar') || '',
    });
  } catch (error) {
    console.error('设置昵称失败:', error);
  }
};
const startConsultation = async () => {
  const calleeUserID = selectedConsultation.value.userserialnumber;
  try {
    await TUICallKitAPI.setSelfInfo({ nickName: '医生', avatar: sessionStorage.getItem('avatar') || '' });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const el = document.querySelector('.tui-call-kit');
    if (el) el.style.display = 'block';
    await TUICallKitAPI.calls({
      userIDList: [calleeUserID],
      type: CallMediaType.VIDEO,
      offlinePushInfo: { title: '来电', desc: '您有一个视频通话', androidOPPOChannelID: 'tuikit' },
    });
  } catch (err) {
    console.error('呼叫失败', err);
    message.error(err.message || '呼叫失败，请重试');
    const el = document.querySelector('.tui-call-kit');
    if (el) el.style.display = 'none';
  }
};
const handleCallBegin = async (params) => {
  if (!params) return;
  roomId.value = params.roomID;
  if (params.callId) callId.value = params.callId;

  try {
    const reqParams = {
      roomId: String(roomId.value),
      userId: selectedConsultation.value.userserialnumber,
      doctorId: selectedConsultation.value.doctorid,
      orderId: selectedConsultation.value.orderid,
      doctorSpeakLanguage: 'yue-CN',
      patientSpeakLanguage: 'zh-CN',
      patientOutputFormat: 'simplified',
      doctorOutputFormat: 'traditional',
      doctorTargetUserId: `doctor_${selectedConsultation.value.doctorid}`,
    };
    console.log("[CallBegin] startRecording 入参:", JSON.stringify(reqParams));

    const res = await startRecording(reqParams);
    console.log("[CallBegin] startRecording 原始返回:", JSON.stringify(res));

    const data = res?.data || {};
    console.log("[CallBegin] startRecording data:", JSON.stringify(data));

    if (data.recordId) recordId.value = data.recordId;
    if (data.userTaskId) userTaskId.value = data.userTaskId;
    if (data.doctorTaskId) doctorTaskId.value = data.doctorTaskId;
    if (data.audioWsUrl) audioWsBaseUrl.value = data.audioWsUrl;

    if (data.audioWsUrl) {
      const match = data.audioWsUrl.match(/^(wss?:\/\/[^/]+)/);
      if (match) subtitleWsHostRef.value = match[1];
    }

    subtitleRoomId.value = String(roomId.value);
    subtitleUserId.value = `doctor_${selectedConsultation.value.doctorid}`;
    subtitleSecondUserId.value = selectedConsultation.value.userserialnumber || '';

    if (data.audioWsUrl && data.doctorTaskId && data.userTaskId) {
      console.log("[CallBegin] 音频采集条件满足，启动双路采集");
      const getTRTCInstance = () => {
        try {
          const engine = TUICallKitAPI.getTUICallEngineInstance();
          console.log("[CallBegin] TUICallEngine:", engine ? "获取成功" : "null");
          const cloud = engine?.getTRTCCloudInstance?.();
          console.log("[CallBegin] TRTCCloud:", cloud ? "获取成功" : "null");
          const trtc = cloud?._trtc ?? cloud?.trtcCloud ?? cloud?.trtc ?? null;
          console.log("[CallBegin] 原始 TRTC 实例:", trtc ? "获取成功" : "null");
          return trtc;
        } catch (e) {
          console.error("[CallBegin] 获取 TRTC 实例异常:", e);
          return null;
        }
      };
      startSpeechCapture(data.audioWsUrl, data.doctorTaskId, data.userTaskId, getTRTCInstance);
    } else {
      console.warn("[CallBegin] 音频采集条件不满足:", {
        audioWsUrl: data.audioWsUrl,
        doctorTaskId: data.doctorTaskId,
        userTaskId: data.userTaskId,
      });
    }
  } catch (error) {
    console.error('[CallBegin] startRecording 调用失败:', error);
  }

  callActive.value = true;
};

/** 倒计时结束自动挂断 */
const handleTimerTimeout = async () => {
  message.warning('通话时长已达30分钟，即将自动挂断');
  try {
    await TUICallKitAPI.hangup();
  } catch (e) {
    console.error('自动挂断失败:', e);
  }
};

/** 最后5分钟警告回调（字幕组件已处理弹窗，此处可做额外逻辑） */
const handleTimerWarning = () => {
  // 可扩展：记录日志、播放提示音等
};

const handleCallEnd = async () => {
  // 停止倒计时 & 字幕面板
  callActive.value = false;

  // 停止双路音频采集，关闭音频WS（后端 onClose 自动停止识别，无需额外调接口）
  await stopSpeechCapture();

  if (recordId.value) {
    try {
      await stopRecording(recordId.value);
    } catch (error) {
      console.error('调用stopRecording失败:', error);
    }
  }
  const el = document.querySelector('.tui-call-kit');
  if (el) el.style.display = 'none';
  recordId.value = '';

  // 重置字幕相关状态
  subtitleRoomId.value = '';
  subtitleUserId.value = '';
  subtitleSecondUserId.value = '';
  userTaskId.value = '';
  doctorTaskId.value = '';
  audioWsBaseUrl.value = '';
};

onMounted(async () => {
  await init();
  try {
    const engine = TUICallKitAPI.getTUICallEngineInstance();
    if (engine) {
      engine.on('onCallBegin', handleCallBegin);
      engine.on('onCallEnd', handleCallEnd);
    }
  } catch (error) {
    console.error('初始化事件监听失败:', error);
  }
});
onUnmounted(() => {
  try {
    const engine = TUICallKitAPI.getTUICallEngineInstance();
    if (engine) {
      engine.off('onCallBegin', handleCallBegin);
      engine.off('onCallEnd', handleCallEnd);
    }
  } catch (error) {
    console.error('��除事件监听失败:', error);
  }
});
// -----------------------------------------------
// ===== 用户病例弹窗 =====
// -----------------------------------------------
const userCaseModalVisible = ref(false);
const userCaseLoading = ref(false);
const userCaseList = ref([]);
const activeCaseKey = ref([]);
const fallbackImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesAdwF3VP4LAAA=';
const decryption = async (url) => {
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
  console.log('查看用户病例', record);
  userCaseModalVisible.value = true;
  userCaseLoading.value = true;
  userCaseList.value = [];
  activeCaseKey.value = [];
  try {
    const res = await selectUserCaseList({
      userId: record.userId,
      orderId: record.orderId,
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
// -----------------------------------------------
// ===== 药品分类列表 =====
// -----------------------------------------------
const medicineTypeList = ref([]);
const getMedicineTypeList = async () => {
  try {
    const res = await selectMedicineTypeList({});
    if (res.code == 200) medicineTypeList.value = res.data.data || [];
  } catch (error) {
    console.error('获取药品分类失败:', error);
  }
};
// -----------------------------------------------
// ===== 截图 + 上传到专用接口 =====
// -----------------------------------------------
/** 处方图片上传接口 */
const PRESCRIP_FILE_URL = 'https://hqgy.gzxinxingyiyuan.com/filedec/file/prescripfile';
/** 建议单图片上传接口 */
const ADVICE_FILE_URL = 'https://hqgy.gzxinxingyiyuan.com/filedec/file/advicefile';
const convertImageToBase64 = async (url) => {
  if (!url || !url.startsWith('http')) return url;
  // 如果已经是 base64，���接返回
  if (url.startsWith('data:')) return url;
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('图片转base64失败，尝试使用canvas方式:', url, error);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        } catch (e) {
          console.warn('Canvas转换失败:', e);
          resolve(url); // 转换失败返回原URL
        }
      };
      img.onerror = () => {
        console.warn('图片加载失败:', url);
        resolve(url); // 加载失败返回原URL
      };
      img.src = url;
    });
  }
};
/**
 * 预加载并转换元素内所有跨域图片为base64
 * @param {HTMLElement} el - DOM元素
 */
const preloadAndConvertImages = async (el) => {
  const images = el.querySelectorAll('img');
  const promises = Array.from(images).map(async (img) => {
    const src = img.src;
    if (src && src.startsWith('http') && !src.startsWith('data:')) {
      try {
        const base64 = await convertImageToBase64(src);
        img.src = base64;
      } catch (e) {
        console.warn('图片预加载转换失败:', src, e);
      }
    }
  });
  await Promise.all(promises);
};
/**
 * 克隆 DOM + 展开截图，返回 base64 dataURL
 * @param {HTMLElement} el - 要截图的元素
 */
const captureElement = async (el) => {
  if (!el) throw new Error('截图元素不存在');
  // 克隆节点，展开所有隐藏区域
  const clone = el.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.zIndex = '-9999';
  clone.style.overflow = 'visible';
  clone.style.width = el.scrollWidth + 'px';
  clone.style.height = 'auto';
  document.body.appendChild(clone);
  await nextTick();
  // 关键：在截图前将所有跨域图片转换为base64
  await preloadAndConvertImages(clone);
  // 等待图片渲染完成
  await new Promise(resolve => setTimeout(resolve, 100));
  try {
    const canvas = await html2canvas(clone, {
      useCORS: true,
      allowTaint: true, // 允许跨域图片（配合base64转换使用）
      scale: 2,
      backgroundColor: '#ffffff',
      width: clone.scrollWidth,
      height: clone.scrollHeight,
    });
    return canvas.toDataURL('image/jpeg', 0.92);
  } finally {
    document.body.removeChild(clone);
  }
};
/**
 * 将 base64 dataURL 转为 File 对象
 */
const dataURLtoFile = (dataurl, filename = 'document.jpg') => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};
/**
 * 上传图片到专用接口
 * @param {File} file
 * @param {string} serialNumber - 流水号
 * @param {'prescription' | 'advice'} uploadType - 上传类型，决定调用哪个接口
 * @returns {string} 上传成功后的图片 URL
 */
const uploadImageToServer = async (file, serialNumber = '', uploadType = 'prescription') => {
  const url = uploadType === 'advice' ? ADVICE_FILE_URL : PRESCRIP_FILE_URL;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('serialNumber', serialNumber);
  const res = await fetch(url, { method: 'POST', body: formData });
  const data = await res.json();
  if ((data.code == 200 || data.code === '200') && (data.data?.url || data.data?.data || data.url)) {
    return data.data?.url || data.data?.data || data.url || '';
  }
  throw new Error(data.msg || '图片上传失败');
};
// -----------------------------------------------
// ===== 会诊弹窗（insertConsultation） =====
// -----------------------------------------------
const consultationModalVisible = ref(false);
const consultationDetailLoading = ref(false);
const selectedConsultation = ref({});
const diagnosisReport = ref('');
const selectedPharmacy = ref(null);
const chufang = ref('');
const detailsss = ref({});
/** 截图区 ref（第一步预览弹窗中的 DOM） */
const suggestionPreviewCloneRef = ref(null);
/** 建议单上传中标志 */
const suggestionUploading = ref(false);
/** 建议单上传成功后的图片 URL */
const suggestionImageUrl = ref('');
/** 建议单药品表格列头 */
const suggestionTableHeaders = ['項目(Item)', '藥物名稱(Drug name)', '劑量(Strength)', '劑型(Dosage form)', '用法/途徑(Directions/route)', '頻次(Frequency)', '療程(Duration)', '數量(Quantity)', '特殊用法(Route)'];
const consultationMed = useMedicineSelector();
watch(() => consultationModalVisible.value, (val) => { if (!val) consultationMed.reset(); });
const showConsultationModal = async (record) => {
  const prefix = window.location.hostname.split('.')[0];
  if (prefix === 'testgy' && sessionStorage.getItem('roleType') !== 'admin') return;
  selectedConsultation.value = record;
  consultationModalVisible.value = true;
  getMedicineTypeList();
  const orderRes = await getuserorderList({ orderId: record.orderid });
  if (orderRes.code == 200 || orderRes.code === '200') {
    detailsss.value = orderRes.data.data[0] || {};
  }
  if (record.consultationid) {
    consultationDetailLoading.value = true;
    try {
      const res = await selectPharmacyAuditDetail({ consultationId: record.consultationid });
      if (res.code == 200 || res.code === '200') {
        const d = res.data?.data;
        if (d) {
          diagnosisReport.value = d.diagnosticReport || '';
          chufang.value = d.consultationMedicine || '';
          selectedPharmacy.value = d.pharmacistId || null;
          await consultationMed.prefillFromDetail(Array.isArray(d.medicines) ? d.medicines : []);
        }
      }
    } catch (error) {
      console.error('获取会诊详情失败:', error);
      await consultationMed.fetchList();
    } finally {
      consultationDetailLoading.value = false;
    }
  } else {
    await consultationMed.fetchList();
  }
};
// 二步确认弹窗状态（会诊，独立于 modal 外）
const confirmSignVisible = ref(false);
const confirmNameVisible = ref(false);
/** 点击提交会诊：校验后弹第一步确认（建议单预览） */
const saveConsultation = () => {
  if (!diagnosisReport.value) {
    message.warning('诊断意见不能为空');
    return;
  }
  for (const id of consultationMed.selectedIds.value) {
    const extra = consultationMed.extraFields[id] || {};
    const item = consultationMed.medicineList.value.find((m) => m.id === id);
    const name = item?.name || '藥品';
    if (!extra.dosageForm) return message.warning(`請填寫【${name}】的劑型`);
    if (!extra.frenquency) return message.warning(`請填寫【${name}】的頻次`);
    if (!extra.duration) return message.warning(`請填寫【${name}】的療程`);
    if (!extra.directionsRoute) return message.warning(`��填寫【${name}】的用法/途徑`);
    if (!extra.specialPurpose) return message.warning(`請填寫【${name}】的特殊用途`);
    if (!consultationMed.quantities[id]) return message.warning(`請填寫【${name}】的數量`);
  }
  for (const item of consultationMed.manualMedicines.value) {
    const isEmpty = !item.name && !item.spec && !item.clazz && !item.medicineCun &&
      !item.dosageForm && !item.frenquency && !item.duration && !item.directionsRoute && !item.specialPurpose;
    if (isEmpty) continue;
    if (!item.name) return message.warning('請填寫手動新增藥品名稱');
    if (!item.medicineCun) return message.warning(`請填寫【${item.name}】的數��`);
    if (!item.dosageForm) return message.warning(`請填寫【${item.name}】的劑型`);
    if (!item.frenquency) return message.warning(`請填寫【${item.name}】的頻次`);
    if (!item.duration) return message.warning(`請填寫【${item.name}】的療程`);
    if (!item.directionsRoute) return message.warning(`請填寫【${item.name}】的用法/途徑`);
    if (!item.specialPurpose) return message.warning(`請填寫【${item.name}】的特殊用途`);
    if (!item.clazz) return message.warning(`請填寫【${item.name}】的藥品分類`);
    if (!item.spec) return message.warning(`請填寫【${item.name}】的藥品規格`);
  }
  // 弹第一步预览确认（建议单样式）
  confirmSignVisible.value = true;
};
/**
 * 第一步确认：截图 → 上传到建议单接口（advicefile） → 成功后弹第二步
 */
const handleSuggestionStep1Ok = async () => {
  suggestionUploading.value = true;
  try {
    // 克隆 DOM + 展开截图
    const dataUrl = await captureElement(suggestionPreviewCloneRef.value);
    const file = dataURLtoFile(dataUrl, `suggestion_${Date.now()}.jpg`);
    // 上传到建议单专用接口，传入 serialNumber
    const serialNumber = detailsss.value?.serialNumber || selectedConsultation.value?.userserialnumber || '';
    suggestionImageUrl.value = await uploadImageToServer(file, serialNumber, 'advice');
    message.success('建議單圖片生成成功');
    // 关闭第一步，弹第二步
    confirmSignVisible.value = false;
    confirmNameVisible.value = true;
  } catch (err) {
    message.error('建議單圖片生成失敗：' + (err.message || ''));
  } finally {
    suggestionUploading.value = false;
  }
};
/** 第二步确认完成，提交会诊 */
const handleConfirmName = async () => {
  confirmNameVisible.value = false;
  await _doSaveConsultation();
};
const _doSaveConsultation = async () => {

  try {
    const params = {
      orderId: selectedConsultation.value.orderid,
      doctorId: selectedConsultation.value.doctorid,
      doctorUserId: sessionStorage.getItem('username'),
      diagnosticReport: diagnosisReport.value,
      consultationMedicine: chufang.value,
      userId: selectedConsultation.value.orderuserid,
      consulationType: '0',
      medicines: consultationMed.buildMedicines(),
      pharmacistId: selectedPharmacy.value,
      phone: selectedConsultation.value.userserialnumber,
      state: '5',
      adviceUrl: suggestionImageUrl.value,
    };
    const res = await insertConsultation(params);
    if (res.code == 200) {
      getlists();
    }
  } catch (error) {
    console.error('提交会诊失败:', error);
  } finally {
    consultationModalVisible.value = false;
  }
};
// -----------------------------------------------
// ===== 会诊报告详情弹窗 =====
// -----------------------------------------------
const reportModalVisible = ref(false);
const checkDetail = ref({});

const showConsultationReport = async (record) => {
  reportModalVisible.value = true;
  try {
    const res = await selectprescriptiondetail({ consultationId: record.consultationid });
    if (res.code == 200 || res.code === '200') {
      checkDetail.value = res.data.data || {};
      console.log('会诊报告详情:', checkDetail.value);
    }
  } catch (error) {
    console.error('获取报告详情失败:', error);
  }
};
// -----------------------------------------------
// ===== 查看处方单弹窗 =====
// -----------------------------------------------
const prescriptionModalVisible = ref(false);
const dispensingDetail = ref({});
const showPrescriptionModal = async (record) => {
  dispensingDetail.value = {};
  prescriptionModalVisible.value = true;
  try {
    const res = await selectPharmacyAuditDetail({ consultationId: record.consultationid });
    if (res.code == 200 || res.code === '200') {
      dispensingDetail.value = res.data.data || {};
    }
  } catch (error) {
    console.error('获取处方单详情失败:', error);
  }
};
// -----------------------------------------------
// ===== 选择填写方式弹窗 =====
// -----------------------------------------------
const uploadTypeVisible = ref(false);
const pendingWriteRecord = ref(null);

const openUploadTypeModal = (record) => {
  pendingWriteRecord.value = record;
  uploadTypeVisible.value = true;
};
const selectUploadType = (type) => {
  uploadTypeVisible.value = false;
  if (type === 'text') {
    openWritePrescriptionModal(pendingWriteRecord.value);
  } else {
    openImgPrescriptionModal(pendingWriteRecord.value);
  }
};
// -----------------------------------------------
// ===== 图片上传处方弹窗 =====
// -----------------------------------------------
const imgPrescriptionVisible = ref(false);
const imgPrescriptionRecord = ref(null);
const wpImgSelectedPharmacy = ref(null);
const wpImgConfirmSignVisible = ref(false);
const wpImgConfirmNameVisible = ref(false);
const wpImgUpload = useImageUpload(
  () => imgPrescriptionRecord.value?.userserialnumber || imgPrescriptionRecord.value?.serialNumber || '',
  'prescription'
);
/** 图片上传处方 - 第一步预览截图弹窗 */
const wpImgPrescriptionPreviewRef = ref(null);
/** 图片上传处方 - 处方单预览数据（从 detail 接口获取） */
const wpImgPrescriptionDetail = ref({});
/** 图片上传处方 - 处方单截图上传中标志 */
const wpImgPrescriptionUploading = ref(false);
/** 图片上传处方 - 截图上传成功后的 presUrl */
const wpImgPrescriptionImageUrl = ref('');
const openImgPrescriptionModal = async (record) => {
  imgPrescriptionRecord.value = record;
  wpImgSelectedPharmacy.value = null;
  wpImgUpload.reset();
  wpImgPrescriptionDetail.value = {};
  wpImgPrescriptionImageUrl.value = '';
  imgPrescriptionVisible.value = true;
  // 预加载处方单详情，用于第一步预览
  try {
    const res = await getfirstpreDetail({ consultationId: record.consultationid });
    if (res.code == 200 || res.code === '200') {
      wpImgPrescriptionDetail.value = res.data.data || {};
      console.log('处方单详情:', wpImgPrescriptionDetail.value);
    }
  } catch (error) {
    console.error('获取处��单详情失败:', error);
  }
};
const submitImgPrescription = () => {
  if (wpImgUpload.fileList.value.length === 0) {
    message.warning('请先选择处方图片');
    return;
  }
  if (!wpImgUpload.uploadedUrl.value) {
    message.warning(wpImgUpload.uploadError.value || '图片尚未上传成功，请重试');
    return;
  }
  if (!wpImgSelectedPharmacy.value) {
    message.warning('请选择药房');
    return;
  }
  // 将当前用户上传的图片 URL 同步到预览 detail，确保第一步预览显示最新数据
  wpImgPrescriptionDetail.value = {
    ...wpImgPrescriptionDetail.value,
    consultationMedicine: wpImgUpload.uploadedUrl.value,
  };
  // 弹第一步：预览处方单 + 截��上传
  wpImgPrescriptionImageUrl.value = '';
  wpImgConfirmSignVisible.value = true;
};
/**
 * 图片上传处方 - 第一步确认：截图 �� 上传到处方接口（prescripfile） → 成功后弹第二步
 */
const handleWpImgPrescriptionStep1Ok = async () => {
  wpImgPrescriptionUploading.value = true;
  try {
    const dataUrl = await captureElement(wpImgPrescriptionPreviewRef.value);
    const file = dataURLtoFile(dataUrl, `wpimg_prescription_${Date.now()}.jpg`);
    const serialNumber = wpImgPrescriptionDetail.value?.serialNumber || imgPrescriptionRecord.value?.userserialnumber || '';
    wpImgPrescriptionImageUrl.value = await uploadImageToServer(file, serialNumber, 'prescription');
    message.success('處方單圖片生成成功');
    wpImgConfirmSignVisible.value = false;
    wpImgConfirmNameVisible.value = true;
  } catch (err) {
    message.error('處方單圖片生成失敗：' + (err.message || ''));
  } finally {
    wpImgPrescriptionUploading.value = false;
  }
};
/** 图片上传处方 - 第二步确认完成，提交 */
const handleWpImgConfirmName = async () => {
  wpImgConfirmNameVisible.value = false;
  const asdf = await selectprescriptiondetail({ consultationId: imgPrescriptionRecord.value.consultationid });
  const medicines = asdf?.data?.data?.medicines || [];
  const state = medicines.length === 0 ? '8' : '7';
  try {
    const res = await presConsultation({
      state,
      consultationId: imgPrescriptionRecord.value.consultationid,
      consultationMedicine: wpImgUpload.uploadedUrl.value,
      pharmacistId: wpImgSelectedPharmacy.value,
      presUrl: wpImgPrescriptionImageUrl.value,
      presType: '1', // 标记为图片上传处方
    });
    if (res.code == 200 || res.code === '200') {
      message.success('处方提交成功');
      imgPrescriptionVisible.value = false;
      getlists();
    } else {
      message.error(res.msg || '处方提交失败');
    }
  } catch {
    message.error('处方提交失败，请重试');
  }
};
// -----------------------------------------------
// ===== 填写处方弹窗（文字） =====
// -----------------------------------------------
const writePrescriptionVisible = ref(false);
const writePrescriptionDetail = ref({});
const writePrescriptionRecord = ref(null);
const wpRx = ref('');
const wpSelectedPharmacy = ref(null);
/** 填写处方 - 第一步预览确认弹窗 */
const wpConfirmSignVisible = ref(false);
/** 填写处方 - 第二步签名确认弹窗（独立） */
const wpConfirmNameVisible = ref(false);
/** 处方单截图区 ref（第一步预览中） */
const prescriptionPreviewRef = ref(null);
/** 处方单上传中标志 */
const prescriptionUploading = ref(false);
/** 处方单上传成功后的图片 URL */
const prescriptionImageUrl = ref('');
let _wpSubmitDetail = null;
const openWritePrescriptionModal = async (record) => {
  writePrescriptionRecord.value = record;
  writePrescriptionDetail.value = {};
  wpRx.value = '';
  wpSelectedPharmacy.value = null;
  writePrescriptionVisible.value = true;
  try {
    const res = await getfirstpreDetail({ consultationId: record.consultationid });

    if (res.code == 200 || res.code === '200') {
      writePrescriptionDetail.value = res.data.data || {};
    }
  } catch (error) {
    console.error('获取填写处方详情失败:', error);
  }
};
const submitWritePrescription = (detail) => {
  _wpSubmitDetail = detail;
  if (!wpRx.value?.trim()) {
    message.warning('请填写RP内容');
    return;
  }
  if (!wpSelectedPharmacy.value) {
    message.warning('请选择药房');
    return;
  }
  // 将当前用户输入的 RP 内容同步到预览 detail，确保第一步预览显示最新数据
  writePrescriptionDetail.value = {
    ...writePrescriptionDetail.value,
    consultationMedicine: wpRx.value,
  };
  // 弹第一步：处方单预览（2.png样式）
  wpConfirmSignVisible.value = true;
};
/**
 * 处方单第一步确认：截�� → 上传到处方接口（prescripfile） → 成功后弹第二步
 */
const handlePrescriptionStep1Ok = async () => {
  prescriptionUploading.value = true;
  try {
    const dataUrl = await captureElement(prescriptionPreviewRef.value);
    const file = dataURLtoFile(dataUrl, `prescription_${Date.now()}.jpg`);
    // 上传到处方专用接口，传入 serialNumber
    const serialNumber = writePrescriptionDetail.value?.serialNumber || writePrescriptionRecord.value?.userserialnumber || '';
    prescriptionImageUrl.value = await uploadImageToServer(file, serialNumber, 'prescription');
    message.success('處方單圖片生成成功');
    wpConfirmSignVisible.value = false;
    wpConfirmNameVisible.value = true;
  } catch (err) {
    message.error('處方單圖片生成失敗：' + (err.message || ''));
  } finally {
    prescriptionUploading.value = false;
  }
};
/** 处方单第二步确认完成，提交 */
const handleWpConfirmName = async () => {
  wpConfirmNameVisible.value = false;
  try {
    const medicines = _wpSubmitDetail?.medicines || [];
    const state = medicines.length === 0 ? '8' : '7';
    const res = await presConsultation({
      state,
      consultationId: writePrescriptionRecord.value.consultationid,
      consultationMedicine: wpRx.value,
      pharmacistId: wpSelectedPharmacy.value,
      presUrl: prescriptionImageUrl.value,
      presType: '0', // 标记为文字填写处方
    });
    if (res.code == 200 || res.code === '200') {
      message.success('处方提交成功');
      writePrescriptionVisible.value = false;
      getlists();
    } else {
      message.error(res.msg || '处方提交失败');
    }
  } catch (error) {
    console.error('提交处方失败:', error);
    message.error('处方提交失败，请重试');
  }
};
// -----------------------------------------------
// ===== 编辑弹窗（updateConsultation） =====
// -----------------------------------------------
const editModalVisible = ref(false);
const editFormIsImage = ref(false);
const editConfirmSignVisible = ref(false);
const editConfirmNameVisible = ref(false);
const editCurrentRecord = ref(null);
const editForm = reactive({
  id: null,
  diagnosticReport: '',
  medicationAdvice: '',
  medicines: [],
  orderId: '',
  doctorId: '',
  userId: '',
  pharmacistId: '',
});
const editUpload = useImageUpload(() =>
  editCurrentRecord.value?.userserialnumber ||
  editCurrentRecord.value?.serialNumber || ''
);
const addEditMedicine = () => editForm.medicines.push({ name: '', spec: '', medicineCun: 1 });
const removeEditMedicine = (index) => editForm.medicines.splice(index, 1);
const saveEdit = async () => {
  if (!editForm.id) { message.error(t('message.error.id')); return; }
  if (!editForm.diagnosticReport) { message.error('诊断报告不能为空'); return; }
  if (editFormIsImage.value) {
    if (editUpload.fileList.value.length === 0) { message.error('请上传处方图片'); return; }
    if (!editUpload.uploadedUrl.value) { message.error('图片尚未上传成功，请重试'); return; }
  } else {
    if (!editForm.medicationAdvice) { message.error(t('message.error.medicationAdvice')); return; }
  }
  if (editForm.medicines.length === 0) { message.error('请至少添加一种药品'); return; }
  for (let i = 0; i < editForm.medicines.length; i++) {
    const m = editForm.medicines[i];
    if (!m.name?.trim()) { message.error(`请填写第${i + 1}种药品的名称`); return; }
    if (!m.spec?.trim()) { message.error(`请填写第${i + 1}种药品的规格`); return; }
    if (!m.medicineCun || m.medicineCun <= 0) { message.error(`请填写第${i + 1}种药品的有效数量`); return; }
  }
  editConfirmSignVisible.value = true;
};
const handleEditConfirmName = async () => {
  await editData();
  editModalVisible.value = false;
};
const getDetail = async (record) => {
  try {
    const res = await selectPharmacyAuditDetail({ consultationId: record.consultationid });
    if (res.code == 200) {
      const d = res.data.data;
      editForm.id = d.consultationId;
      editForm.diagnosticReport = d.diagnosticReport || '';
      editForm.orderId = d.orderId || '';
      editForm.doctorId = d.doctorId || '';
      editForm.pharmacistId = d.pharmacistId || '';
      editForm.userId = d.userId || '';
      const cm = d.consultationMedicine || '';
      const isImage = cm.startsWith('https://hqgy.gzxinxingyiyuan.com/filedec/file/presupload') ||
        cm.startsWith('https://hqgy.gzxinxingyiyuan.com/presimage/') ||
        /\.(png|jpg|jpeg|gif|webp)$/i.test(cm);
      editFormIsImage.value = isImage;
      if (isImage) {
        editForm.medicationAdvice = '';
        editUpload.initFromUrl(cm);
      } else {
        editForm.medicationAdvice = cm;
        editUpload.reset();
      }
      editForm.medicines = Array.isArray(d.medicines) && d.medicines.length > 0
        ? d.medicines.map((item) => ({ name: item.name || '', spec: item.spec || '', medicineCun: item.medicineCun || 1 }))
        : [];
    }
  } catch (error) {
    console.error('获取编辑详情失败:', error);
  }
};
const openEditModal = (record) => {
  editCurrentRecord.value = record;
  editUpload.reset();
  editFormIsImage.value = false;
  getDetail(record);
  editModalVisible.value = true;
};
watch(() => editModalVisible.value, (val) => {
  if (!val) {
    editForm.medicines = [];
    editUpload.reset();
  }
});
const editData = async () => {
  try {
    const res = await updateConsultation({
      consultationId: editForm.id,
      diagnosticReport: editForm.diagnosticReport,
      consultationMedicine: editFormIsImage.value ? editUpload.uploadedUrl.value : editForm.medicationAdvice,
      medicines: editForm.medicines,
      orderId: editForm.orderId,
      doctorId: editForm.doctorId,
      userId: editForm.userId,
      pharmacistId: editForm.pharmacistId,
    });
    if (res.code == 200) {
      message.success('修改成功');
      getlists();
    }
  } catch (error) {
    console.error('修改失败:', error);
  }
};
// -----------------------------------------------
// ===== 修改建议单弹窗（state=2/7） =====
// -----------------------------------------------
const editSuggestionModalVisible = ref(false);
const editSuggestionLoading = ref(false);
const editSuggestionRecord = ref(null);
const editSuggestionDetail = ref({});
const editSuggestionDiagnosisReport = ref('');
const editSuggestionConfirmSignVisible = ref(false);
const editSuggestionConfirmNameVisible = ref(false);
const editconsultationMedicine = ref('');
/** 修改建议单截图区 ref（第一步预览中） */
const editSuggestionPreviewRef = ref(null);
/** 修改建议单上传中标志 */
const editSuggestionUploading = ref(false);
/** 修改建议单上传成功后的图片 URL */
const editSuggestionImageUrl = ref('');
const editSuggestionMed = useMedicineSelector();
watch(() => editSuggestionModalVisible.value, (val) => { if (!val) editSuggestionMed.reset(); });
const openEditSuggestionModal = async (record) => {
  if (!['2', '7'].includes(String(record.state))) {
    message.warning('当前状态不允许修改建議單');
    return;
  }
  editSuggestionRecord.value = record;
  editSuggestionDetail.value = {};
  editSuggestionDiagnosisReport.value = '';
  editSuggestionModalVisible.value = true;
  editSuggestionLoading.value = true;
  getMedicineTypeList();
  try {
    const orderRes = await selectprescriptiondetail({ consultationId: record.consultationid });
    if (orderRes.code == 200 || orderRes.code === '200') {
      editSuggestionDetail.value = orderRes.data.data || {};
      console.log('订单详情:', editSuggestionDetail.value);
    }
    if (record.consultationid) {
      const res = await selectPharmacyAuditDetail({ consultationId: record.consultationid });
      if (res.code == 200 || res.code === '200') {
        const d = res.data?.data;
        if (d) {
          editSuggestionDiagnosisReport.value = d.diagnosticReport || '';
          editconsultationMedicine.value = d.consultationMedicine || '';
          await editSuggestionMed.prefillFromDetail(Array.isArray(d.medicines) ? d.medicines : []);
        }
      }
    } else {
      await editSuggestionMed.fetchList();
    }
  } catch (error) {
    console.error('获取建议单详情失败:', error);
    await editSuggestionMed.fetchList();
  } finally {
    editSuggestionLoading.value = false;
  }
};
const saveEditSuggestion = () => {
  if (!editSuggestionDiagnosisReport.value?.trim()) {
    message.warning('诊断意见不能为空');
    return;
  }
  for (const id of editSuggestionMed.selectedIds.value) {
    const extra = editSuggestionMed.extraFields[id] || {};
    const item = editSuggestionMed.medicineList.value.find((m) => m.id === id);
    const name = item?.name || '藥品';
    if (!extra.dosageForm) return message.warning(`請填寫【${name}】的劑型`);
    if (!extra.frenquency) return message.warning(`請填寫【${name}】的頻次`);
    if (!extra.duration) return message.warning(`請填寫【${name}】的療程`);
    if (!extra.directionsRoute) return message.warning(`請填寫【${name}】的用法/途徑`);
    if (!extra.specialPurpose) return message.warning(`請填寫【${name}】的特殊用途`);
    if (!editSuggestionMed.quantities[id]) return message.warning(`請填寫【${name}】的數量`);
  }
  for (const item of editSuggestionMed.manualMedicines.value) {
    const isEmpty = !item.name && !item.spec && !item.clazz && !item.medicineCun &&
      !item.dosageForm && !item.frenquency && !item.duration && !item.directionsRoute && !item.specialPurpose;
    if (isEmpty) continue;
    if (!item.name) return message.warning('請填寫手動新增藥品名稱');
    if (!item.medicineCun) return message.warning(`請填寫【${item.name}】的數量`);
    if (!item.dosageForm) return message.warning(`請填寫【${item.name}】的劑型`);
    if (!item.frenquency) return message.warning(`請填寫【${item.name}】的頻次`);
    if (!item.duration) return message.warning(`請填寫【${item.name}】的療程`);
    if (!item.directionsRoute) return message.warning(`請填寫【${item.name}】的用法/途徑`);
    if (!item.specialPurpose) return message.warning(`請填寫【${item.name}】的特殊用途`);
    if (!item.clazz) return message.warning(`請填寫【${item.name}】的藥品分類`);
    if (!item.spec) return message.warning(`請填寫【${item.name}】的藥品規格`);
  }
  // 弹第一步：预览建议单 + 截���上传
  editSuggestionImageUrl.value = '';
  editSuggestionConfirmSignVisible.value = true;
};
/**
 * 修改建议单 - 第一步确认：截图 → 上传到建议单接口（advicefile） → 成功后弹第二步
 */
const handleEditSuggestionStep1Ok = async () => {
  editSuggestionUploading.value = true;
  try {
    const dataUrl = await captureElement(editSuggestionPreviewRef.value);
    const file = dataURLtoFile(dataUrl, `edit_suggestion_${Date.now()}.jpg`);
    const serialNumber = editSuggestionDetail.value?.serialNumber || editSuggestionRecord.value?.userserialnumber || '';
    editSuggestionImageUrl.value = await uploadImageToServer(file, serialNumber, 'advice');
    message.success('建議單圖片生成成功');
    editSuggestionConfirmSignVisible.value = false;
    editSuggestionConfirmNameVisible.value = true;
  } catch (err) {
    message.error('建議單圖片生成失敗：' + (err.message || ''));
  } finally {
    editSuggestionUploading.value = false;
  }
};
/** 修改建议单 - 第二步确认完成，提交 */
const handleEditSuggestionConfirmName = async () => {
  editSuggestionConfirmNameVisible.value = false;
  const editconsultationMedicine = editSuggestionMed.buildMedicines();
  console.log('修改建议单提交数据:', editSuggestionDetail.value.presUrl);
  console.log('修改建议单提交数据:', editSuggestionDetail.value.adviceUrl);
  try {
    const record = editSuggestionRecord.value;
    const params = {
      consultationId: record.consultationid,
      diagnosticReport: editSuggestionDiagnosisReport.value,
      medicines: editSuggestionMed.buildMedicines(),
      orderId: record.orderid,
      doctorId: record.doctorid,
      userId: record.orderuserid,
      state: '6',
      pharmacistId: record.pharmacistid,
      consultationMedicine: editconsultationMedicine.value,
      adviceUrl: editSuggestionImageUrl.value,
      presUrl: editSuggestionDetail.value.presUrl,
      consultationMedicine: editSuggestionDetail.value.consultationMedicine,
      presType: editSuggestionDetail.value.presType,
    };
    const res = await updateConsultation(params);
    if (res.code == 200) {
      message.success('修改成功');
      editSuggestionModalVisible.value = false;
      getlists();
    } else {
      message.error(res.msg || '修改失败');
    }
  } catch (error) {
    console.error('修改建议单失败:', error);
    message.error('修改失败，请重试');
  }
};
// -----------------------------------------------
// ===== 修改处方单弹窗（state=6） =====
// -----------------------------------------------
const editPrescriptionModalVisible = ref(false);
const editPrescriptionRecord = ref(null);
const editPrescriptionDetail = ref({});
const editPrescriptionIsImage = ref(false);
const editPrescriptionTextValue = ref('');
const editPrescriptionConfirmSignVisible = ref(false);
const editPrescriptionConfirmNameVisible = ref(false);
/** 修改处方单截图区 ref（第一步预览中） */
const editPrescriptionPreviewRef = ref(null);
/** 修改处方单上传中标志 */
const editPrescriptionUploading = ref(false);
/** 修改处方单上传成功���的图片 URL */
const editPrescriptionImageUrl = ref('');
const epUpload = useImageUpload(
  () => editPrescriptionRecord.value?.userserialnumber || editPrescriptionRecord.value?.serialNumber || '',
  'prescription'
);
const openEditPrescriptionModal = async (record) => {
  if (!['6', '7'].includes(String(record.state))) {
    message.warning('当前状态不允许修改处方单');
    return;
  }
  editPrescriptionRecord.value = record;
  editPrescriptionDetail.value = {};
  editPrescriptionIsImage.value = false;
  editPrescriptionTextValue.value = '';
  epUpload.reset();
  editPrescriptionModalVisible.value = true;
  try {
    const res = await selectPharmacyAuditDetail({ consultationId: record.consultationid });
    if (res.code == 200 || res.code === '200') {
      editPrescriptionDetail.value = res.data.data || {};
      const cm = res.data.data?.consultationMedicine || '';
      const isImage = cm.startsWith('https://');
      editPrescriptionIsImage.value = isImage;
      if (isImage) {
        epUpload.initFromUrl(cm);
      } else {
        editPrescriptionTextValue.value = cm;
      }
    }
  } catch (error) {
    console.error('获取处方单详情失败:', error);
  }
};
const saveEditPrescription = () => {
  if (editPrescriptionIsImage.value) {
    if (epUpload.fileList.value.length === 0) { message.warning('请上传处方图片'); return; }
    if (!epUpload.uploadedUrl.value) { message.warning(epUpload.uploadError.value || '图片尚未上传成功，请重试'); return; }
  } else {
    if (!editPrescriptionTextValue.value?.trim()) { message.warning('请输入处方内容'); return; }
  }
  // 将当前用户输入的内容同步到预览 detail，确保第一步预览显示最新数据
  editPrescriptionDetail.value = {
    ...editPrescriptionDetail.value,
    consultationMedicine: editPrescriptionIsImage.value
      ? epUpload.uploadedUrl.value
      : editPrescriptionTextValue.value,
  };
  // 弹第一步：预览处方单 + 截图上传
  editPrescriptionImageUrl.value = '';
  editPrescriptionConfirmSignVisible.value = true;
};
/**
 * 修改处方单 - 第一步确认：截图 → 上传���处方接口（prescripfile） → 成功后弹第二步
 */
const handleEditPrescriptionStep1Ok = async () => {
  console.log(detail.consultationMedicine)
  editPrescriptionUploading.value = true;
  try {
    const dataUrl = await captureElement(editPrescriptionPreviewRef.value);
    const file = dataURLtoFile(dataUrl, `edit_prescription_${Date.now()}.jpg`);
    const serialNumber = editPrescriptionDetail.value?.serialNumber || editPrescriptionRecord.value?.userserialnumber || '';
    editPrescriptionImageUrl.value = await uploadImageToServer(file, serialNumber, 'prescription');
    message.success('處方單圖片生成成功');
    editPrescriptionConfirmSignVisible.value = false;
    editPrescriptionConfirmNameVisible.value = true;
  } catch (err) {
    message.error('處方單圖片生成失敗：' + (err.message || ''));
  } finally {
    editPrescriptionUploading.value = false;
  }
};
/** 修改处方单 - 第二步确认完成，提交 */
const handleEditPrescriptionConfirmName = async () => {
  editPrescriptionConfirmNameVisible.value = false;
  console.log('修改处方单提交数据:', editPrescriptionDetail.value);
  try {
    const medicines = editPrescriptionDetail.value?.medicines || [];
    const state = medicines.length === 0 ? '8' : '7';
    const res = await updateConsultation({
      consultationId: editPrescriptionRecord.value.consultationid,
      consultationMedicine: editPrescriptionIsImage.value ? epUpload.uploadedUrl.value : editPrescriptionTextValue.value,
      orderId: editPrescriptionRecord.value.orderid,
      doctorId: editPrescriptionRecord.value.doctorid,
      userId: editPrescriptionRecord.value.orderuserid,
      pharmacistId: editPrescriptionDetail.value?.pharmacistId,
      diagnosticReport: editPrescriptionDetail.value?.diagnosticReport,
      medicines,
      state,
      presUrl: editPrescriptionImageUrl.value,
      adviceUrl: editPrescriptionDetail.value.adviceUrl,
      presType: editPrescriptionDetail.value.presType,
    });
    if (res.code == 200) {
      message.success('修改成功');
      editPrescriptionModalVisible.value = false;
      getlists();
    } else {
      message.error(res.msg || '修改失败');
    }
  } catch (error) {
    console.error('修改处方单失败:', error);
    message.error('修改失败，请重试');
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

  .consultation-modal .ant-table {
    border: 1px solid #f0f0f0;
  }

  .consultation-report .ant-table .ant-table-tbody>tr>td {
    padding: 8px 12px;
  }
}
</style>
