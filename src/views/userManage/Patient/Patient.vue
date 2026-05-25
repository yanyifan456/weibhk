<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item :label="t('button.Patientname')">
          <a-input v-model:value="searchForm.name" :placeholder="t('button.Patientname')" style="width: 200px" />
        </a-form-item>
        <a-form-item :label="t('button.Patientnames')">
          <a-input v-model:value="searchForm.names" :placeholder="t('button.Patientnames')" style="width: 200px" />
        </a-form-item>
        <a-form-item class="search-actions">
          <!-- <a-button type="primary" style="margin-left: 8px" @click="showAddModal">
            {{ t("button.Patientadd") }}
          </a-button> -->

          <a-button style="margin-left: 8px" @click="handleReset">
            {{ t("button.reset") }}
          </a-button>

          <a-button type="primary" style="margin-left: 8px" @click="handleSearch">
            {{ t("button.search") }}
          </a-button>

          <a-button style="margin-left: 8px" @click="handledel">
            {{ t("button.daochu") }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <!-- 数据表格 -->
    <a-card>
      <!-- 修复分页：移除 paginatedData，直接使用 tableData -->
      <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id" :scroll="{ y: 470 }"
        bordered class="patient-table" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="action-buttons">
              <a-button type="link" size="small" @click="showDetail(record)">
                {{ t("button.detail") }}
              </a-button>
              <a-button type="link" size="small" @click="sffa(record)">
                {{ t("button.daochu") }}
              </a-button>
              <!-- <a-button type="link" size="small" @click="editRecord(record)">
                {{ t("button.edit") }}
              </a-button> -->

              <!-- <a-popconfirm :title="'确定删除患者 ' + record.userName + ' 吗？'" @confirm="deleteRecord(record)" ok-text="确定"
                cancel-text="取消">
                <a-button type="link" size="small" danger>
                  {{ t("button.delete") }}
                </a-button>
              </a-popconfirm> -->
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑患者信息 Modal -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? t('button.edit') : t('button.Patientadd')" @ok="submitForm"
      @cancel="closeModal" width="800px" :bodyStyle="{ maxHeight: '600px', overflowY: 'auto' }">
      <a-form :model="formData" ref="formRef" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" :rules="formRules">
        <a-divider orientation="left">基本信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.name')" name="userName">
              <a-input v-model:value="formData.userName" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="t('label.englishName')" name="enName">
              <a-input v-model:value="formData.enName" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.sex')" name="sex">
              <a-select v-model:value="formData.sex">
                <a-select-option :value="1">男</a-select-option>
                <a-select-option :value="0">女</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.bloodType')" name="bloodType">
              <a-select v-model:value="formData.bloodType">
                <a-select-option value="A型">A型</a-select-option>
                <a-select-option value="B型">B型</a-select-option>
                <a-select-option value="AB型">AB型</a-select-option>
                <a-select-option value="O型">O型</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.call')" name="nickName">
              <a-input v-model:value="formData.nickName" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.cardId')" name="idCardNo">
              <a-input v-model:value="formData.idCardNo" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.birthday')" name="birthyDay">
              <a-date-picker v-model:value="formData.birthyDay" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">联系方式</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.phone')" name="serialNumber">
              <a-input v-model:value="formData.serialNumber" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="t('label.email')" name="email">
              <a-input v-model:value="formData.email" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.job')" name="userType">
              <a-input v-model:value="formData.userType" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="t('label.residentialAddress')" name="houseAddress">
              <a-input v-model:value="formData.houseAddress" :placeholder="t('placeholder.enterResidentialAddress')" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="'固定电话'" name="fixedPhone">
              <a-input v-model:value="formData.fixedPhone" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="'微信号'" name="weixinNo">
              <a-input v-model:value="formData.weixinNo" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item :label="t('label.officeAddress')" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }"
          name="officeAddress">
          <a-input v-model:value="formData.officeAddress" :placeholder="t('placeholder.enterOfficeAddress')" />
        </a-form-item>

        <a-divider orientation="left">医疗信息</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="'职称'" name="title">
              <a-input v-model:value="formData.title" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="'职业'" name="profession">
              <a-input v-model:value="formData.profession" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="'专业分类'" name="professialClass">
              <a-input v-model:value="formData.professialClass" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="t('label.responsibleDoctor')" name="attendingDoctor">
              <a-input v-model:value="formData.attendingDoctor"
                :placeholder="t('placeholder.enterResponsibleDoctor')" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <!-- 将介绍人输入框改为下拉选择 -->
            <a-form-item :label="t('label.referrer')" name="introducer">
              <a-select v-model:value="formData.introducer" :placeholder="t('placeholder.enterReferrer')" allow-clear>
                <a-select-option v-for="item in introducerList" :key="item.id" :value="item.referredBy">
                  {{ item.referredBy }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="'头像链接'" name="profilePicture">
              <a-input v-model:value="formData.profilePicture" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item :label="t('label.familyHistory')" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }"
          name="familyMedicalHistory">
          <a-textarea v-model:value="formData.familyMedicalHistory" :placeholder="t('placeholder.enterFamilyHistory')"
            :rows="3" />
        </a-form-item>

        <a-divider orientation="left">紧急联系人</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.emergencyContactPhone')" name="emergencyContact">
              <a-input v-model:value="formData.emergencyContact"
                :placeholder="t('placeholder.enterEmergencyContactPhone')" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="t('label.relationship')" name="relationShip">
              <a-input v-model:value="formData.relationShip" :placeholder="t('placeholder.enterRelationship')" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">保险信息</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.insuranceCompany')" name="insuranceCompany">
              <a-input v-model:value="formData.insuranceCompany"
                :placeholder="t('placeholder.enterInsuranceCompany')" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="'密码'" name="passWord">
              <a-input v-model:value="formData.passWord" type="password" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item :label="t('label.insuranceContent')" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }"
          name="insuranceCoverage">
          <a-textarea v-model:value="formData.insuranceCoverage" :placeholder="t('placeholder.enterInsuranceContent')"
            :rows="3" />
        </a-form-item>

        <a-divider orientation="left">其他信息</a-divider>

        <a-form-item :label="t('label.remarks')" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" name="rsrvInfo">
          <a-textarea v-model:value="formData.rsrvInfo" :placeholder="t('placeholder.enterRemarks')" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 新增详情展示 Modal -->
    <a-modal v-model:open="detailVisible" title="患者详情" @ok="detailVisible = false" @cancel="detailVisible = false"
      width="800px" :bodyStyle="{ maxHeight: '600px', overflowY: 'auto' }">
      <a-form :model="detailData" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-divider orientation="left">基本信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.name')">
              <span>{{ detailData.userName }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.englishName')">
              <span>{{ detailData.enName }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.sex')">
              <span>{{ detailData.sex === "0" ? '女' : detailData.sex === "1" ? '男' : '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.age')">
              <span>{{ detailData.age }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.call')">
              <span>{{ detailData.nickName }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.cardId')">
              <span>{{ detailData.idCardNo }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.birthday')">
              <span>{{ detailData.birthyDay }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.bloodType')">
              <span>{{ detailData.bloodType }}</span>
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">联系方式</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.phone')">
              <span>{{ detailData.serialNumber }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.email')">
              <span>{{ detailData.email }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.job')">
              <span>{{ detailData.userType }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.residentialAddress')">
              <span>{{ detailData.houseAddress }}</span>
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">医疗信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.responsibleDoctor')">
              <span>{{ detailData.attendingDoctor }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.referrer')">
              <span>{{ detailData.introducer }}</span>
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">紧急联系人</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.emergencyContactPhone')">
              <span>{{ detailData.emergencyContact }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.relationship')">
              <span>{{ detailData.relationShip }}</span>
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">保险信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.insuranceCompany')">
              <span>{{ detailData.insuranceCompany }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.insuranceContent')">
              <span>{{ detailData.insuranceCoverage }}</span>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import {
  getPatientlist,
  getPatientadd,
  getPatientDetail,
  getPatientdeleteUser,
  getPatientupdateUserInfo,
  getPatientselectIntroducer,
  fff,
} from "@/api/yyf.js";
const { t } = useI18n();
import { autoMask, maskString } from "@/utils/tools";

const introducerList = ref([]);

const detailVisible = ref(false);
const detailData = ref({});

// 搜索
const searchForm = ref({
  name: "",
  names: "",
});

//列表
const getlist = async () => {
  const res = await getPatientlist({
    userName: searchForm.value.name,
    enName: searchForm.value.names,
    startTime: "",
    endTime: "",
    pageSize: 25,
    current: 1,
    orgId: sessionStorage.getItem("orgId"),
    roleType: sessionStorage.getItem("roleType")
  });
  if (res.code == 200 && res.msg == "success") {
    // 对敏感字段进行脱敏
    const maskedData = res.data.data.map((item) => ({
      ...item,
      serialNumber: item.serialNumber ? autoMask(item.serialNumber) : "",
      idCardNo: item.idCardNo ? autoMask(item.idCardNo) : "",
      email: item.email ? autoMask(item.email) : "",
      userName: item.userName ? maskString(item.userName, 1, 2) : "",
      birthyDay: item.birthyDay ? maskString(item.birthyDay, 2, 6) : "",
      // 如果有其他需要脱敏的字段，也可以在这里加
      //   fixedPhone: item.fixedPhone ? autoMask(item.fixedPhone) : "",
    }));
    console.log("🚀 ~ maskedData:", maskedData);

    tableData.value = maskedData;
  }
  console.log("🚀 ~ res:", res);
};

const getIntroducerList = async () => {
  try {
    const res = await getPatientselectIntroducer({});
    if (res.code == 200 && res.msg === "success") {
      introducerList.value = res.data || [];
    }
  } catch (error) {
    console.error("获取介绍人列表失败:", error);
  }
};

onMounted(() => {
  getlist();
  getIntroducerList();
});

// 列定义 - 操作列固定在右侧
const columns = computed(() => [
  { title: t("label.name"), dataIndex: "userName", key: "userName", align: "center", width: 100, fixed: "left" },
  { title: t("label.englishName"), dataIndex: "enName", key: "enName", align: "center", width: 100 },
  {
    title: t("label.sex"),
    dataIndex: "sex",
    key: "sex",
    align: "center",
    width: 80,
    customRender: ({ text }) => text === "0" ? '女' : text === "1" ? '男' : text
  },
  { title: t("label.age"), dataIndex: "age", key: "age", align: "center", width: 80 },
  { title: t("label.call"), dataIndex: "nickName", key: "nickName", align: "center", width: 100 },
  { title: t("label.cardId"), dataIndex: "idCardNo", key: "idCardNo", align: "center", width: 180 },
  { title: t("label.birthday"), dataIndex: "birthyDay", key: "birthyDay", align: "center", width: 120 },
  { title: t("label.phone"), dataIndex: "serialNumber", key: "serialNumber", align: "center", width: 150 },
  { title: t("label.email"), dataIndex: "email", key: "email", align: "center", width: 180 },
  { title: t("label.job"), dataIndex: "userType", key: "userType", align: "center", width: 100 },
  { title: t("label.bloodType"), dataIndex: "bloodType", key: "bloodType", align: "center", width: 100 },
  { title: t("button.shenhe"), key: "action", align: "center", width: 200, fixed: "right" },
]);

const tableData = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: tableData.value.total,
  showSizeChanger: true,
  showTotal: (total) => `${t("button.total")} ${total} ${t("label.records")}`,
});

const paginatedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return tableData.value.slice(start, end);
});

const handleTableChange = (paginationConfig) => {
  pagination.current = paginationConfig.current;
  pagination.pageSize = paginationConfig.pageSize;
};

const showDetail = async (record) => {
  try {
    const res = await getPatientDetail({ userId: record.userId });
    if (res.code == 200 && res.msg === "success") {
      detailData.value = res.data.data;
      detailVisible.value = true;
    } else {
      message.error("获取详情失败");
    }
  } catch (error) {
    console.error("获取详情失败:", error);
    message.error("获取详情失败");
  }
};

// 打开新增/编辑表单
const modalVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const formData = reactive({
  userId: null,
  userName: "",
  enName: "",
  sex: "",
  age: "",
  nickName: "",
  idCardNo: "",
  birthyDay: null,
  serialNumber: "",
  email: "",
  userType: "",
  bloodType: "",
  houseAddress: "",
  officeAddress: "",
  attendingDoctor: "",
  introducer: "",
  familyMedicalHistory: "",
  emergencyContact: "",
  relationShip: "",
  rsrvInfo: "",
  insuranceCompany: "",
  insuranceCoverage: "",
  title: "",
  profilePicture: "",
  passWord: "",
  fixedPhone: "",
  weixinNo: "",
  profession: "",
  professialClass: "",
  removeTag: "0",
});

const formRules = {
  userName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  serialNumber: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  title: [{ required: true, message: "请输入职称", trigger: "blur" }],
  sex: [{ required: true, message: "请选择性别", trigger: "change" }],
  houseAddress: [{ required: true, message: "请输入住址", trigger: "blur" }],
  idCardNo: [{ required: true, message: "请输入身份证号", trigger: "blur" }],
  profilePicture: [{ required: true, message: "请输入头像链接", trigger: "blur" }],
  passWord: [{ required: true, message: "请输入密码", trigger: "blur" }],
  createTime: [{ required: true, message: "请输入创建时间", trigger: "blur" }],
  nickName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  userType: [{ required: true, message: "请输入用户类型", trigger: "blur" }],
  weixinNo: [{ required: true, message: "请输入微信号", trigger: "blur" }],
  enName: [{ required: true, message: "请输入英文名", trigger: "blur" }],
  birthyDay: [{ required: true, message: "请选择生日", trigger: "change" }],
  fixedPhone: [{ required: true, message: "请输入固定电话", trigger: "blur" }],
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  profession: [{ required: true, message: "请输入职业", trigger: "blur" }],
  professialClass: [{ required: true, message: "请输入专业分类", trigger: "blur" }],
  bloodType: [{ required: true, message: "请选择血型", trigger: "change" }],
  rsrvInfo: [{ required: true, message: "请输入备注信息", trigger: "blur" }],
  officeAddress: [{ required: true, message: "请输入办公室地址", trigger: "blur" }],
  attendingDoctor: [{ required: true, message: "请输入责任医生", trigger: "blur" }],
  introducer: [{ required: true, message: "请选择介绍人", trigger: "change" }],
  familyMedicalHistory: [{ required: true, message: "请输入家族病史", trigger: "blur" }],
  emergencyContact: [{ required: true, message: "请输入紧急联系人电话", trigger: "blur" }],
  relationShip: [{ required: true, message: "请输入关系", trigger: "blur" }],
  insuranceCompany: [{ required: true, message: "请输入保险公司", trigger: "blur" }],
  insuranceCoverage: [{ required: true, message: "请输入保险内容", trigger: "blur" }],
  removeTag: [{ required: true, message: "请输入删除标识", trigger: "blur" }],
};

const showAddModal = () => {
  isEdit.value = false;
  Object.assign(formData, {
    userId: null,
    userName: "",
    enName: "",
    sex: "",
    age: "",
    nickName: "",
    idCardNo: "",
    birthyDay: null,
    serialNumber: "",
    email: "",
    userType: "",
    bloodType: "",
    houseAddress: "",
    officeAddress: "",
    attendingDoctor: "",
    introducer: "",
    familyMedicalHistory: "",
    emergencyContact: "",
    relationShip: "",
    rsrvInfo: "",
    insuranceCompany: "",
    insuranceCoverage: "",
    title: "",
    profilePicture: "",
    passWord: "",
    fixedPhone: "",
    weixinNo: "",
    profession: "",
    professialClass: "",
    removeTag: "0",
  });
  modalVisible.value = true;
};

const editRecord = async (record) => {
  try {
    const res = await getPatientDetail({ userId: record.userId });
    if (res.code == 200 && res.msg === "success") {
      isEdit.value = true;
      Object.assign(formData, {
        ...res.data.data,
        birthyDay: res.data.data.birthyDay ? dayjs(res.data.data.birthyDay) : null,
      });
      modalVisible.value = true;
    } else {
      message.error("获取详情失败");
    }
  } catch (error) {
    console.error("获取详情失败:", error);
    message.error("获取详情失败");
  }
};

const deleteRecord = async (record) => {
  try {
    const res = await getPatientdeleteUser({
      userIds: [record.userId],
    });
    if (res.code == 200 && res.msg === "success") {
      message.success("删除成功");
      await getlist();
    } else {
      message.error("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    message.error("删除失败");
  }
};

const submitForm = async () => {
  const isValid = await formRef.value.validate();
  if (!isValid) return;
  const submitData = {
    ...formData,
    birthyDay: formData.birthyDay ? dayjs(formData.birthyDay).format("YYYY-MM-DD") : "",
    createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  };

  try {
    if (isEdit.value) {
      // 修改
      const res = await getPatientupdateUserInfo(submitData);
      if (res.code == 200 && res.msg === "success") {
        message.success("修改成功");
        modalVisible.value = false;
        await getlist();
      } else {
        message.error("修改失败");
      }
    } else {
      // 新增
      const res = await getPatientadd(submitData);
      if (res.code == 200 && res.msg === "success") {
        message.success("新增成功");
        modalVisible.value = false;
        await getlist();
      } else {
        message.error("新增失败");
      }
    }
  } catch (error) {
    console.error("提交失败:", error);
    message.error("提交失败");
  }
};

const closeModal = () => {
  modalVisible.value = false;
};

// 搜索
const handleSearch = async () => {
  await getlist();
};

// 重置
const handleReset = async () => {
  searchForm.value.name = "";
  searchForm.value.names = "";
  await getlist();
};

const handledel = async () => {
  const res = await fff({});

  const blob = new Blob([res.data], {
    type: "application/vnd.ms-excel",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "患者.xlsx";
  a.click();

  window.URL.revokeObjectURL(url);
};
const sffa = async (record) => {
  const res = await fff({
    userId: record.userId,
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.ms-excel",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "患者.xlsx";
  a.click();

  window.URL.revokeObjectURL(url);
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
  padding: 0px 0px 12px;
  box-sizing: border-box;

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
