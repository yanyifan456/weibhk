<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" class="search-form">
        <a-form-item class="search-actions">
          <a-button style="margin-left: 8px" @click="daochu">{{ t("button.daochu") }}</a-button>
          <a-button type="primary" style="margin-left: 8px" @click="showAddModal">{{
              t("button.Patientadd")
            }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card>
      <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="pagination"
          row-key="id"
          :scroll="{ y: 470 }"
          bordered
          class="patient-table"
          @change="handleTableChange"
          :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.isSwitch">
            <a-switch :checked="record.status === '1'" :disabled="true"/>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="action-buttons">
              <a-button type="link" size="small" @click="showDetail(record)">詳情</a-button>
              <a-button type="link" size="small" @click="daochus(record)">導出</a-button>
              <a-button type="link" size="small" @click="editRecord(record)">{{ t("button.edit") }}</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
        v-model:open="addModalVisible"
        :title="t('button.Patientadd')"
        width="750px"
        @ok="handleAddSubmit"
        destroyOnClose
        @cancel="handleAddCancel"
    >
      <a-form :model="addForm" layout="vertical" ref="addformRef" :rules="addFormRules">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.englishName')" name="englishName">
              <a-input v-model:value="addForm.englishName" :placeholder="t('placeholder.enterResponsibleDoctor')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.h')" name="chineseName">
              <a-input v-model:value="addForm.chineseName" :placeholder="t('placeholder.enterAppointmentPerson')"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.chineseSpecialty')" name="chineseSpecialty">
              <a-input v-model:value="addForm.chineseSpecialty" :placeholder="t('placeholder.a')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.englishSpecialty')" name="englishSpecialty">
              <a-input v-model:value="addForm.englishSpecialty" :placeholder="t('placeholder.b')"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="登錄賬號" name="loginName">
              <a-select
                  v-model:value="addForm.loginName"
                  placeholder="請選擇登錄賬號"
                  allow-clear
                  @change="handleLoginAccountChange"
              >
                <a-select-option v-for="item in loginAccountList" :key="item.loginName" :value="item.loginName">
                  {{ item.loginName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.phone')" name="phone">
              <a-input v-model:value="addForm.phone" placeholder="請輸入電話" :disabled="true"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.email')" name="email">
              <a-input v-model:value="addForm.email" :placeholder="t('placeholder.g')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="機構" name="orgId">
              <a-cascader
                  v-model:value="addForm.orgId"
                  :options="orgList"
                  placeholder="請選擇機構"
                  :field-names="{ label: 'label', value: 'id', children: 'children' }"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.department')" name="subject">
              <a-select v-model:value="addForm.subject" :placeholder="t('placeholder.d')" allow-clear>
                <a-select-option v-for="item in doctorlists" :key="item.departId" :value="item.departId">
                  {{ item.departName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="職稱" name="position">
              <a-select v-model:value="addForm.position" placeholder="請選擇職稱" allow-clear>
                <a-select-option v-for="item in doctorTitles" :key="item" :value="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="香港醫生行醫証" name="hkCertificate">
              <a-input v-model:value="addForm.hkCertificate" :placeholder="t('public.input') + '香港醫生行醫証'"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="大陸行醫資格証" name="proQualifyCertificate">
              <a-input v-model:value="addForm.proQualifyCertificate"
                       :placeholder="t('public.input') + '大陸行醫資格証'"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('menu.PHARMACY')" name="nameChi">
              <a-select
                  v-model:value="addForm.nameChi"
                  :placeholder="t('placeholder.PHARMACY')"
                  allow-clear
                  @change="handleHospitalChange"
              >
                <a-select-option v-for="item in menzhenlist" :key="item.hospitalId" :value="item.hospitalName">
                  {{ item.hospitalName }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('menu.aa')" name="aa">
              <a-input v-model:value="addForm.aa" :placeholder="t('placeholder.gg')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12" style="display: flex; justify-content: space-around">
            <a-form-item label="醫生印章" name="esignature">
              <a-upload
                  v-model:file-list="addForm.esignature"
                  list-type="picture-card"
                  :before-upload="beforeUpload"
                  @preview="handlePreview"
              >
                <div v-if="addForm.esignature.length < 1">
                  <plus-outlined/>
                  <div style="margin-top: 8px">{{ t("button.add") }}</div>
                </div>
              </a-upload>
            </a-form-item>
            <a-form-item label="醫生頭像" name="doctorPhotoFileList">
              <a-upload
                  v-model:file-list="addForm.doctorPhotoFileList"
                  list-type="picture-card"
                  :customRequest="createPhotoUploader(addForm)"
                  :show-upload-list="true"
                  @preview="handlePreview"
              >
                <div v-if="addForm.doctorPhotoFileList.length < 1">
                  <plus-outlined/>
                  <div style="margin-top: 8px">上傳頭像</div>
                </div>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="執業範圍" name="practiceScope">
              <a-input v-model:value="addForm.practiceScope" placeholder="請輸入執業範圍"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="多點執業備案號" name="multiPractice">
              <a-input v-model:value="addForm.multiPractice" placeholder="請輸入多點執業備案號"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="執業有效期" name="professionValidity">
              <a-range-picker
                  v-model:value="addForm.professionValidity"
                  :placeholder="['開始日期', '結束日期']"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal
        v-model:open="editModalVisible"
        :title="t('button.edit')"
        width="750px"
        @ok="handleEditSubmit"
        destroyOnClose
        @cancel="handleEditCancel"
    >
      <a-form :model="editForm" layout="vertical" ref="editformRef" :rules="editFormRules">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.englishName')" name="englishName">
              <a-input v-model:value="editForm.englishName" :placeholder="t('placeholder.enterResponsibleDoctor')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.h')" name="chineseName">
              <a-input v-model:value="editForm.chineseName" :placeholder="t('placeholder.enterAppointmentPerson')"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.chineseSpecialty')" name="chineseSpecialty">
              <a-input v-model:value="editForm.chineseSpecialty" :placeholder="t('placeholder.a')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.englishSpecialty')" name="englishSpecialty">
              <a-input v-model:value="editForm.englishSpecialty" :placeholder="t('placeholder.b')"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="登錄賬號" name="loginName">
              <a-select v-model:value="editForm.loginName" placeholder="請選擇登錄賬號" :disabled="true">
                <a-select-option v-for="item in loginAccountList" :key="item.loginName" :value="item.loginName">
                  {{ item.loginName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.phone')" name="phone">
              <a-input v-model:value="editForm.phone" placeholder="請輸入電話" :disabled="true"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.email')" name="email">
              <a-input v-model:value="editForm.email" :placeholder="t('placeholder.g')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="機構" name="orgId">
              <a-cascader
                  v-model:value="editForm.orgId"
                  :options="orgList"
                  placeholder="請選擇機構"
                  :field-names="{ label: 'label', value: 'id', children: 'children' }"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.department')" name="subject">
              <a-select v-model:value="editForm.subject" :placeholder="t('placeholder.d')" allow-clear>
                <a-select-option v-for="item in doctorlists" :key="item.departId" :value="item.departId">
                  {{ item.departName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="職稱" name="position">
              <a-select v-model:value="editForm.position" placeholder="請選擇職稱" allow-clear>
                <a-select-option v-for="item in doctorTitles" :key="item" :value="item">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="香港醫生行醫証" name="hkCertificate">
              <a-input v-model:value="editForm.hkCertificate" :placeholder="t('public.input') + '香港醫生行醫証'"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="大陸行醫資格証" name="proQualifyCertificate">
              <a-input v-model:value="editForm.proQualifyCertificate"
                       :placeholder="t('public.input') + '大陸行醫資格証'"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('menu.PHARMACY')" name="nameChi">
              <a-select
                  v-model:value="editForm.nameChi"
                  :placeholder="t('placeholder.PHARMACY')"
                  allow-clear
                  @change="handleEditHospitalChange"
              >
                <a-select-option v-for="item in menzhenlist" :key="item.hospitalId" :value="item.hospitalName">
                  {{ item.hospitalName }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('menu.aa')" name="aa">
              <a-input v-model:value="editForm.aa" :placeholder="t('placeholder.gg')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12" style="display: flex; justify-content: space-around">
            <a-form-item label="醫生印章" name="esignature">
              <a-upload
                  v-model:file-list="editForm.esignature"
                  list-type="picture-card"
                  :before-upload="beforeUpload"
                  @preview="handlePreview"
              >
                <div v-if="editForm.esignature.length < 1">
                  <plus-outlined/>
                  <div style="margin-top: 8px">{{ t("button.add") }}</div>
                </div>
              </a-upload>
            </a-form-item>
            <a-form-item label="醫生頭像" name="doctorPhotoFileList">
              <a-upload
                  v-model:file-list="editForm.doctorPhotoFileList"
                  list-type="picture-card"
                  :customRequest="createPhotoUploader(editForm)"
                  :show-upload-list="true"
                  @preview="handlePreview"
              >
                <div v-if="editForm.doctorPhotoFileList.length < 1">
                  <plus-outlined/>
                  <div style="margin-top: 8px">上傳頭像</div>
                </div>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="執業範圍" name="practiceScope">
              <a-input v-model:value="editForm.practiceScope" placeholder="請輸入執業範圍"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="多點執業備案號" name="multiPractice">
              <a-input v-model:value="editForm.multiPractice" placeholder="請輸入多點執業備案號"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="執業有效期" name="professionValidity">
              <a-range-picker
                  v-model:value="editForm.professionValidity"
                  :placeholder="['開始日期', '結束日期']"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal
        v-model:open="channelModalVisible"
        title="預約渠道"
        width="520px"
        @ok="handleChannelSubmit"
        @cancel="handleChannelCancel"
        ok-text="保存"
        cancel-text="取消"
    >
      <div class="channel-modal">
        <div class="channel-header">
          <span style="margin-right: 20px">全選</span>
          <a-switch v-model:checked="allChecked" @change="handleAllCheckChange"/>
        </div>
        <a-table :columns="channelColumns" :data-source="channelList" :pagination="false" bordered row-key="name">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-switch v-model:checked="record.checked"/>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>

    <a-modal v-model:open="previewVisible" title="圖片預覽" :footer="null" @cancel="previewVisible = false">
      <img :src="previewImage" style="width: 100%"/>
    </a-modal>

    <a-modal
        v-model:open="detailModalVisible"
        title="醫生詳情"
        width="750px"
        :footer="null"
        @cancel="detailModalVisible = false"
    >
      <a-form :model="detailForm" layout="vertical" class="detail-form">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.englishName')">
              <span>{{ detailForm.englishName || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.h')">
              <span>{{ detailForm.chineseName || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.chineseSpecialty')">
              <span>{{ detailForm.chineseSpecialty || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.englishSpecialty')">
              <span>{{ detailForm.englishSpecialty || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="登錄賬號">
              <span>{{ detailForm.loginName || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.phone')">
              <span>{{ detailForm.phone || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.email')">
              <span>{{ detailForm.email || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="機構">
              <span>{{ detailForm.orgName || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.department')">
              <span>{{ detailForm.subject || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="職稱">
              <span>{{ detailForm.position || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="香港醫生行醫証">
              <span>{{ detailForm.hkCertificate || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="大陸行醫資格証">
              <span>{{ detailForm.proQualifyCertificate || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('menu.PHARMACY')">
              <span>{{ detailForm.nameChi || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('menu.aa')">
              <span>{{ detailForm.aa || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="醫生印章">
              <a-image v-if="detailForm.esignature" :src="detailForm.esignature" :width="100" :height="100"/>
              <span v-else>-</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="醫生頭像">
              <a-image v-if="detailForm.doctorPhotoUrl" :src="detailForm.doctorPhotoUrl" :width="100" :height="100"/>
              <span v-else>-</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="執業範圍">
              <span>{{ detailForm.practiceScope || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="多點執業備案號">
              <span>{{ detailForm.multiPractice || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="執業有效期">
              <span>{{
                  detailForm.professionValidityStart && detailForm.professionValidityEnd
                      ? detailForm.professionValidityStart + ' 至 ' + detailForm.professionValidityEnd
                      : '-'
                }}</span>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {ref, reactive, computed} from "vue";
import {message} from "ant-design-vue";
import {useI18n} from "vue-i18n";
import {PlusOutlined} from "@ant-design/icons-vue";
import axios from "axios";
import {
  selectDoctorList,
  selectDoctoradd,
  selectDoctordel,
  selectDoctorDetaill,
  selectDoctorupdateDoctor,
  exportMedicines,
  tDoctorList,
  getclinic,
  selectDoctorTitle,
  selectDoctorAccount,
  buildTree,
} from "@/api/yyf";
import {autoMask, maskString} from "@/utils/tools";

const {t} = useI18n();

const columns = computed(() => [
  {title: t("label.f"), dataIndex: "loginName", key: "loginName", align: "center"},
  {title: t("label.g"), dataIndex: "enName", key: "enName", align: "center"},
  {title: t("label.h"), dataIndex: "doctorName", key: "doctorName", align: "center"},
  {title: t("label.i"), dataIndex: "serialNumber", key: "serialNumber", align: "center"},
  {title: t("label.j"), dataIndex: "status", key: "status", align: "center", isSwitch: true},
  {title: t("button.shenhe"), key: "action", align: "center"},
]);

const channelColumns = [
  {title: "渠道名", dataIndex: "name", key: "name", align: "center"},
  {title: "備註", dataIndex: "remark", key: "remark", align: "center"},
  {title: "連接狀態", key: "status", align: "center"},
];

const tableData = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `${t("button.total")} ${total} ${t("label.records")}`,
});

const doctorlists = ref([]);
const menzhenlist = ref([]);
const doctorTitles = ref([]);
const loginAccountList = ref([]);
const orgList = ref([]);
const selectedHospital = ref(null);
const selectedEditHospital = ref(null);

const addModalVisible = ref(false);
const editModalVisible = ref(false);
const detailModalVisible = ref(false);
const channelModalVisible = ref(false);
const previewVisible = ref(false);
const previewImage = ref("");
const channelList = ref([]);
const allChecked = ref(false);
const currentChannelRecord = ref(null);

const addForm = reactive({
  englishName: "",
  chineseName: "",
  chineseSpecialty: "",
  englishSpecialty: "",
  loginName: null,
  phone: "",
  email: "",
  orgId: null,
  subject: null,
  position: null,
  hkCertificate: "",
  proQualifyCertificate: "",
  nameChi: "",
  aa: "",
  esignature: [],
  doctorPhotoFileList: [],
  practiceScope: "",
  multiPractice: "",
  professionValidity: [],
});

const editForm = reactive({
  doctorId: "",
  englishName: "",
  chineseName: "",
  chineseSpecialty: "",
  englishSpecialty: "",
  loginName: null,
  phone: "",
  email: "",
  orgId: null,
  subject: null,
  position: null,
  hkCertificate: "",
  proQualifyCertificate: "",
  nameChi: "",
  aa: "",
  esignature: [],
  doctorPhotoFileList: [],
  channelTag: "",
  rawData: null,
  practiceScope: "",
  multiPractice: "",
  professionValidity: [],
});

const detailForm = reactive({
  englishName: "",
  chineseName: "",
  chineseSpecialty: "",
  englishSpecialty: "",
  loginName: "",
  phone: "",
  email: "",
  orgName: "",
  subject: "",
  position: "",
  hkCertificate: "",
  proQualifyCertificate: "",
  nameChi: "",
  aa: "",
  esignature: "",
  doctorPhotoUrl: "",
  practiceScope: "",
  multiPractice: "",
  professionValidityStart: "",
  professionValidityEnd: "",
});

const addformRef = ref(null);
const editformRef = ref(null);

const addFormRules = {
  englishName: [{required: true, message: "請輸入英文名", trigger: "blur"}],
  chineseName: [{required: true, message: "請輸入中文名", trigger: "blur"}],
  chineseSpecialty: [{required: true, message: "請輸入中文專業", trigger: "blur"}],
  englishSpecialty: [{required: true, message: "請輸入英文專業", trigger: "blur"}],
  loginName: [{required: true, message: "請選擇登錄賬號", trigger: "change"}],
  phone: [{required: true, message: "請輸入電話", trigger: "blur"}],
  email: [{required: true, message: "請輸入郵箱", trigger: "blur"}],
  orgId: [{required: true, message: "請選擇機構", trigger: "change"}],
  subject: [{required: true, message: "請選擇科目", trigger: "change"}],
  position: [{required: true, message: "請選擇職稱", trigger: "change"}],
  hkCertificate: [{required: true, message: "請輸入香港醫生行醫証", trigger: "blur"}],
  proQualifyCertificate: [{required: true, message: "請輸入大陸行醫資格証", trigger: "blur"}],
  nameChi: [{required: true, message: "請選擇診所", trigger: "change"}],
  aa: [{required: true, message: "請輸入專業所長", trigger: "blur"}],
  esignature: [{required: true, message: "請上傳印章", trigger: "change"}],
  doctorPhotoFileList: [{required: true, message: "請上傳醫生頭像", trigger: "change"}],
};

const editFormRules = {
  englishName: [{required: true, message: "請輸入英文名", trigger: "blur"}],
  chineseName: [{required: true, message: "請輸入中文名", trigger: "blur"}],
  chineseSpecialty: [{required: true, message: "請輸入中文專業", trigger: "blur"}],
  englishSpecialty: [{required: true, message: "請輸入英文專業", trigger: "blur"}],
  loginName: [{required: true, message: "請選擇登錄賬號", trigger: "change"}],
  phone: [{required: true, message: "請輸入電話", trigger: "blur"}],
  email: [{required: true, message: "請輸入郵箱", trigger: "blur"}],
  orgId: [{required: true, message: "請選擇機構", trigger: "change"}],
  subject: [{required: true, message: "請選擇科目", trigger: "change"}],
  position: [{required: true, message: "請選擇職稱", trigger: "change"}],
  nameChi: [{required: true, message: "請選擇診所", trigger: "change"}],
  aa: [{required: true, message: "請輸入專業所長", trigger: "blur"}],
  esignature: [{required: true, message: "請上傳印章", trigger: "change"}],
  doctorPhotoFileList: [{required: true, message: "請上傳醫生頭像", trigger: "change"}],
};

const getlist = async () => {
  loading.value = true;
  try {
    const res = await selectDoctorList({
      pageSize: pagination.pageSize,
      current: pagination.current,
    });
    if (res.code === "200" && res.msg === "success") {
      const maskedData = res.data.data.map((item) => ({
        ...item,
        serialNumber: item.serialNumber ? autoMask(item.serialNumber) : "",
        idCardNo: item.idCardNo ? autoMask(item.idCardNo) : "",
        idCard: item.idCard ? autoMask(item.idCard) : "",
        bankCard: item.bankCard ? autoMask(item.bankCard) : "",
        email: item.email ? autoMask(item.email) : "",
        doctorName: item.doctorName ? maskString(item.doctorName, 1, 2) : "",
        enName: item.enName ? maskString(item.enName, 3, 5) : "",
      }));
      tableData.value = maskedData;
      pagination.total = res.data.total || 0;
    }
  } catch (error) {
    message.error("獲取列表失敗");
  } finally {
    loading.value = false;
  }
};

const fetchDoctorList = async () => {
  const res = await tDoctorList({});
  if (res.code === "200" && res.msg === "success") {
    doctorlists.value = res.data.data;
  }
};

const fetchClinicList = async () => {
  const res = await getclinic({});
  if (res.code === "200" && res.msg === "success") {
    menzhenlist.value = res.data.data;
  }
};

const fetchDoctorTitles = async () => {
  const res = await selectDoctorTitle({});
  if (res.code === "200" && res.msg === "success") {
    doctorTitles.value = res.data.data;
  }
};

const fetchLoginAccountList = async () => {
  const res = await selectDoctorAccount({roleType: "doctor"});
  if (res.code === "200") {
    loginAccountList.value = res.data.data || [];
  }
};

const fetchOrgTree = async () => {
  try {
    const res = await buildTree({});
    if (res.code == 200 || res.code === "200") {
      orgList.value = res.data || [];
    }
  } catch (error) {
    console.error(error);
  }
};

const loadDropdownData = async () => {
  await Promise.all([
    fetchDoctorList(),
    fetchClinicList(),
    fetchDoctorTitles(),
    fetchLoginAccountList(),
    fetchOrgTree(),
  ]);
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const beforeUpload = async (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("只能上傳 JPG/PNG 格式的圖片！");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("圖片大小不能超過 2MB！");
    return false;
  }
  try {
    const base64 = await fileToBase64(file);
    file.thumbUrl = base64;
    file.url = base64;
  } catch (error) {
    message.error("圖片轉換失敗");
  }
  return false;
};

const handlePreview = (file) => {
  previewImage.value = file.url || file.thumbUrl;
  previewVisible.value = true;
};

const createPhotoUploader = (form) => {
  return async (options) => {
    const {file, onSuccess, onError} = options;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("serialNumber", form.phone || "");
      const res = await axios.post(
          "https://hqgy.gzxinxingyiyuan.com/filedec/file/upload",
          formData,
          {headers: {"Content-Type": "multipart/form-data"}},
      );
      const imageUrl = res.data.data.data;
      file.url = imageUrl;
      file.thumbUrl = imageUrl;
      onSuccess({url: imageUrl});
      message.success("上傳成功");
    } catch (error) {
      message.error("上傳失敗");
      onError(error);
    }
  };
};

const findCascaderPath = (tree, targetId, path = []) => {
  for (const node of tree) {
    const currentPath = [...path, node.id];
    if (String(node.id) === String(targetId)) return currentPath;
    if (node.children?.length) {
      const result = findCascaderPath(node.children, targetId, currentPath);
      if (result) return result;
    }
  }
  return null;
};

const findNodeInTree = (tree, targetId) => {
  for (const node of tree) {
    if (String(node.id) === String(targetId)) return node;
    if (node.children?.length) {
      const result = findNodeInTree(node.children, targetId);
      if (result) return result;
    }
  }
  return null;
};

const findCascaderLabels = (tree, targetId) => {
  const labels = [];
  const find = (nodes, id) => {
    for (const node of nodes) {
      if (String(node.id) === String(id)) {
        labels.push(node.label);
        return true;
      }
      if (node.children?.length && find(node.children, id)) {
        labels.unshift(node.label);
        return true;
      }
    }
    return false;
  };
  find(tree, targetId);
  return labels;
};

const handleTableChange = (paginationConfig) => {
  pagination.current = paginationConfig.current;
  pagination.pageSize = paginationConfig.pageSize;
  getlist();
};

const handleLoginAccountChange = (value) => {
  if (value) {
    const selectedAccount = loginAccountList.value.find((item) => item.loginName === value);
    if (selectedAccount) {
      addForm.phone = selectedAccount.telPhone || "";
    }
  } else {
    addForm.phone = "";
  }
};

const handleHospitalChange = (value) => {
  selectedHospital.value = value
      ? menzhenlist.value.find((item) => item.hospitalName === value)
      : null;
};

const handleEditHospitalChange = (value) => {
  selectedEditHospital.value = value
      ? menzhenlist.value.find((item) => item.hospitalName === value)
      : null;
};

const resetAddForm = () => {
  Object.assign(addForm, {
    englishName: "",
    chineseName: "",
    chineseSpecialty: "",
    englishSpecialty: "",
    loginName: null,
    phone: "",
    email: "",
    orgId: null,
    subject: null,
    position: null,
    hkCertificate: "",
    proQualifyCertificate: "",
    nameChi: "",
    aa: "",
    esignature: [],
    doctorPhotoFileList: [],
    practiceScope: "",
    multiPractice: "",
    professionValidity: [],
  });
  selectedHospital.value = null;
};

const showAddModal = async () => {
  await loadDropdownData();
  resetAddForm();
  addModalVisible.value = true;
};

const editRecord = async (record) => {
  await loadDropdownData();
  try {
    const res = await selectDoctorDetaill({doctorId: record.doctorId});
    if (res.code === "200" && res.msg === "success") {
      const data = res.data.data;
      editForm.rawData = data;
      editForm.doctorId = data.doctorId || "";
      editForm.englishName = data.enName || "";
      editForm.chineseName = data.doctorName || "";
      editForm.chineseSpecialty = data.profession || "";
      editForm.englishSpecialty = data.enPro || "";
      editForm.phone = data.serialNumber || "";
      editForm.email = data.email || "";
      editForm.orgId = data.orgId ? findCascaderPath(orgList.value, data.orgId) : null;
      const departmentItem = doctorlists.value.find((item) => item.departName === data.departName);
      editForm.subject = departmentItem ? departmentItem.departId : "";
      editForm.position = data.position || "";
      editForm.hkCertificate = data.hkCertificate || "";
      editForm.proQualifyCertificate = data.proQualifyCertificate || "";
      editForm.nameChi = data.hospital || "";
      editForm.aa = data.certification || "";
      editForm.practiceScope = data.practiceScope || "";
      editForm.multiPractice = data.multiPractice || "";
      editForm.loginName = data.loginName || "";
      editForm.channelTag = data.channelTag || "";
      if (data.professionValidityStart && data.professionValidityEnd) {
        editForm.professionValidity = [data.professionValidityStart, data.professionValidityEnd];
      } else {
        editForm.professionValidity = [];
      }
      editForm.esignature = data.esignature
          ? [{uid: "-1", name: "esignature.png", status: "done", url: data.esignature}]
          : [];
      editForm.doctorPhotoFileList = data.doctorPhoto
          ? [{uid: "-2", name: "doctorPhoto.png", status: "done", url: data.doctorPhoto}]
          : [];
      if (data.hospital) {
        selectedEditHospital.value = menzhenlist.value.find((item) => item.hospitalName === data.hospital);
      }
      editModalVisible.value = true;
    } else {
      message.error("獲取醫生詳情失敗");
    }
  } catch (error) {
    message.error("獲取醫生詳情失敗");
  }
};

const showDetail = async (record) => {
  await fetchOrgTree();
  try {
    const res = await selectDoctorDetaill({doctorId: record.doctorId});
    if (res.code === "200" && res.msg === "success") {
      const data = res.data.data;
      detailForm.englishName = data.enName || "-";
      detailForm.chineseName = data.doctorName || "-";
      detailForm.chineseSpecialty = data.profession || "-";
      detailForm.englishSpecialty = data.enPro || "-";
      detailForm.loginName = data.loginName || "-";
      detailForm.phone = data.serialNumber || "-";
      detailForm.email = data.email || "-";
      if (data.orgId && orgList.value.length) {
        const labels = findCascaderLabels(orgList.value, data.orgId);
        detailForm.orgName = labels.length ? labels.join(" / ") : "-";
      } else {
        detailForm.orgName = "-";
      }
      detailForm.subject = data.departName || "-";
      detailForm.position = data.position || "-";
      detailForm.hkCertificate = data.hkCertificate || "-";
      detailForm.proQualifyCertificate = data.proQualifyCertificate || "-";
      detailForm.nameChi = data.hospital || "-";
      detailForm.aa = data.certification || "-";
      detailForm.esignature = data.esignature || "";
      detailForm.doctorPhotoUrl = data.doctorPhoto || "";
      detailForm.practiceScope = data.practiceScope || "-";
      detailForm.multiPractice = data.multiPractice || "-";
      detailForm.professionValidityStart = data.professionValidityStart || "";
      detailForm.professionValidityEnd = data.professionValidityEnd || "";
      detailModalVisible.value = true;
    } else {
      message.error("獲取詳情失敗");
    }
  } catch (error) {
    message.error("獲取詳情失敗");
  }
};

const showChannelModal = (record) => {
  currentChannelRecord.value = record;
  let channels = [];
  if (record.channelTag) {
    try {
      channels = JSON.parse(record.channelTag);
    } catch (error) {
      channels = [];
    }
  }
  channelList.value = channels.map((channel) => ({
    name: channel.name,
    remark: channel.remark,
    status: channel.status,
    checked: channel.status === 1,
  }));
  allChecked.value = channelList.value.length > 0 && channelList.value.every((item) => item.checked);
  channelModalVisible.value = true;
};

const handleAllCheckChange = (checked) => {
  channelList.value.forEach((item) => {
    item.checked = checked;
  });
};

const handleAddSubmit = async () => {
  try {
    await addformRef.value.validate();
  } catch {
    return;
  }
  if (!addForm.chineseName || !addForm.englishName) {
    message.error("請填寫姓名");
    return;
  }
  if (addForm.doctorPhotoFileList.length === 0) {
    message.error("請上傳醫生頭像");
    return;
  }
  try {
    const params = {
      doctorName: addForm.chineseName,
      serialNumber: addForm.phone,
      depart: addForm.subject,
      profession: addForm.chineseSpecialty,
      certification: addForm.aa,
      mainlandFee: "",
      hkFee: "",
      proQualifyCertificate: addForm.proQualifyCertificate || "",
      hkCertificate: addForm.hkCertificate || "",
      esignature: addForm.esignature[0]?.thumbUrl || "",
      proQualifyName: "",
      banckAcctName: "",
      idCardNo: "",
      idCard: "",
      bankCard: "",
      profitShareRatio: "",
      consultationState: "",
      fansNum: 0,
      retireState: "",
      bankAcctNo: "",
      hospitalId: selectedHospital.value?.hospitalId || "",
      hospitalAddress: selectedHospital.value?.hospitalAddress || "",
      hospitalTel: selectedHospital.value?.hospitalTel || "",
      enName: addForm.englishName,
      loginName: addForm.loginName,
      email: addForm.email,
      enPro: addForm.englishSpecialty,
      channelTag: "",
      doctorPhoto: addForm.doctorPhotoFileList[0]?.url || "",
      position: addForm.position,
      practiceScope: addForm.practiceScope,
      multiPractice: addForm.multiPractice,
      professionValidityStart: addForm.professionValidity?.[0] || "",
      professionValidityEnd: addForm.professionValidity?.[1] || "",
      orgId: addForm.orgId?.length ? addForm.orgId[addForm.orgId.length - 1] : "",
    };
    const res = await selectDoctoradd(params);
    if (res.code === "200" && res.msg === "success" && res.data.message === "新增成功") {
      message.success("新增成功");
      addModalVisible.value = false;
      getlist();
    } else if (res.code === "200" && res.msg === "success" && res.data.message === "账号已被绑定") {
      message.error("賬號已被綁定");
    } else {
      message.error(res.data.message);
    }
  } catch (error) {
    message.error("新增失敗");
  }
};

const handleAddCancel = () => {
  addModalVisible.value = false;
};

const handleEditSubmit = async () => {
  try {
    await editformRef.value.validate();
  } catch {
    return;
  }
  if (!editForm.chineseName || !editForm.englishName) {
    message.error("請填寫姓名");
    return;
  }
  if (editForm.doctorPhotoFileList.length === 0) {
    message.error("請上傳醫生頭像");
    return;
  }
  try {
    const originalData = editForm.rawData;
    const params = {
      doctorId: editForm.doctorId,
      doctorName: editForm.chineseName,
      serialNumber: editForm.phone,
      depart: editForm.subject,
      profession: editForm.chineseSpecialty,
      certification: editForm.aa || "",
      mainlandFee: originalData?.mainlandFee || "",
      hkFee: originalData?.hkFee || "",
      proQualifyCertificate: editForm.proQualifyCertificate || "",
      hkCertificate: editForm.hkCertificate || "",
      esignature: editForm.esignature[0]?.thumbUrl || editForm.esignature[0]?.url || "",
      proQualifyName: originalData?.proQualifyName || "",
      banckAcctName: originalData?.banckAcctName || "",
      idCardNo: originalData?.idCardNo || "",
      idCard: originalData?.idCard || "",
      bankCard: originalData?.bankCard || "",
      profitShareRatio: originalData?.profitShareRatio || "",
      consultationState: originalData?.consultationState || "",
      fansNum: originalData?.fansNum || 0,
      retireState: originalData?.retireState || "",
      bankAcctNo: originalData?.bankAcctNo || "",
      hospitalId: selectedEditHospital.value?.hospitalId || originalData?.hospitalId || "",
      hospitalAddress: selectedEditHospital.value?.hospitalAddress || originalData?.hospitalAddress || "",
      hospitalTel: selectedEditHospital.value?.hospitalTel || originalData?.hospitalTel || "",
      enName: editForm.englishName,
      loginName: editForm.loginName,
      email: editForm.email,
      enPro: editForm.englishSpecialty,
      channelTag: editForm.channelTag,
      doctorPhoto: editForm.doctorPhotoFileList[0]?.url || "",
      position: editForm.position,
      practiceScope: editForm.practiceScope,
      multiPractice: editForm.multiPractice,
      professionValidityStart: editForm.professionValidity?.[0] || "",
      professionValidityEnd: editForm.professionValidity?.[1] || "",
      orgId: editForm.orgId?.length
          ? editForm.orgId[editForm.orgId.length - 1]
          : originalData?.orgId || "",
    };
    const res = await selectDoctorupdateDoctor(params);
    if (res.code === "200" && res.data.message === "修改成功") {
      message.success("修改成功");
      editModalVisible.value = false;
      getlist();
    } else {
      message.error("修改失敗");
    }
  } catch (error) {
    message.error("修改失敗");
  }
};

const handleEditCancel = () => {
  editModalVisible.value = false;
};

const handleChannelSubmit = async () => {
  if (!currentChannelRecord.value) return;
  try {
    const detailRes = await selectDoctorDetaill({doctorId: currentChannelRecord.value.doctorId});
    if (detailRes.code !== "200" || detailRes.msg !== "success") {
      message.error("獲取詳情失敗");
      return;
    }
    const originalData = detailRes.data.data;
    const updatedChannels = channelList.value.map((item) => ({
      name: item.name,
      remark: item.remark,
      status: item.checked ? 1 : 0,
    }));
    const channelTagString = JSON.stringify(updatedChannels);
    const params = {
      doctorId: originalData.doctorId,
      doctorName: originalData.doctorName || "",
      serialNumber: originalData.serialNumber || "",
      depart: originalData.depart || "",
      profession: originalData.profession || "",
      certification: originalData.certification || "",
      mainlandFee: originalData.mainlandFee || "",
      hkFee: originalData.hkFee || "",
      proQualifyCertificate: originalData.proQualifyCertificate || "",
      hkCertificate: originalData.hkCertificate || "",
      esignature: originalData.esignature || "",
      proQualifyName: originalData.proQualifyName || "",
      banckAcctName: originalData.banckAcctName || "",
      idCardNo: originalData.idCardNo || "",
      idCard: originalData.idCard || "",
      bankCard: originalData.bankCard || "",
      profitShareRatio: originalData.profitShareRatio || "",
      consultationState: originalData.consultationState || "",
      fansNum: originalData.fansNum || 0,
      retireState: originalData.retireState || "",
      bankAcctNo: originalData.bankAcctNo || "",
      hospitalId: originalData.hospitalId || "",
      hospitalAddress: originalData.hospitalAddress || "",
      hospitalTel: originalData.hospitalTel || "",
      enName: originalData.enName || "",
      loginName: originalData.loginName || "",
      email: originalData.email || "",
      enPro: originalData.enPro || "",
      channelTag: channelTagString,
      doctorPhoto: originalData.doctorPhoto || "",
      position: originalData.position || "",
      practiceScope: originalData.practiceScope || "",
      multiPractice: originalData.multiPractice || "",
      professionValidityStart: originalData.professionValidityStart || "",
      professionValidityEnd: originalData.professionValidityEnd || "",
      orgId: originalData.orgId || "",
    };
    const res = await selectDoctorupdateDoctor(params);
    if (res.code === "200" && res.msg === "success") {
      message.success("保存成功");
      channelModalVisible.value = false;
      getlist();
    } else {
      message.error("保存失敗");
    }
  } catch (error) {
    message.error("保存失敗");
  }
};

const handleChannelCancel = () => {
  channelModalVisible.value = false;
};

const deleteRecord = async (record) => {
  try {
    const res = await selectDoctordel({ids: [record.doctorId]});
    if (res.code === "200" && res.msg === "success") {
      message.success("刪除成功");
      getlist();
    } else {
      message.error("刪除失敗");
    }
  } catch (error) {
    message.error("刪除失敗");
  }
};

const daochu = async () => {
  const res = await exportMedicines({});
  const blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "醫生導出.xlsx";
  a.click();
  window.URL.revokeObjectURL(url);
};

const daochus = async (record) => {
  const res = await exportMedicines({doctorId: record.doctorId});
  const blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "醫生導出.xlsx";
  a.click();
  window.URL.revokeObjectURL(url);
};

getlist();
</script>

<style scoped lang="scss">
.search-form {
  display: flex;
  width: 100%;
  align-items: center;
}

.search-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.remote-consultation {
  padding: 0px 0px 12px;
}

.channel-modal {
  .channel-header {
    display: flex;
    justify-content: right;
    align-items: center;
    padding: 12px 16px;
    color: black;
    margin-bottom: 16px;
    border-radius: 4px;
  }
}
</style>
