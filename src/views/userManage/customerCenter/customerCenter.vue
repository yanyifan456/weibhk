<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" class="search-form">
        <a-form-item class="search-actions">
          <a-button style="margin-left: 8px" @click="daochu">
            {{ t("button.daochu") }}
          </a-button>
          <a-button type="primary" style="margin-left: 8px" @click="showAddModal">
            {{ t("button.Patientadd") }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card>
      <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id" :scroll="{ y: 470 }"
               bordered class="patient-table" @change="handleTableChange" :loading="loading">
        <template #bodyCell="{ column, record }">
          <template v-if="column.isSwitch">
            <a-switch :checked="record.status === '1'" :disabled="true"/>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="action-buttons">
              <!-- <a-button type="link" size="small" @click="showChannelModal(record)"> 预约渠道 </a-button> -->
              <a-button type="link" size="small" @click="showDetail(record)"> 詳情</a-button>
              <a-button type="link" size="small" @click="daochus(record)"> 導出</a-button>
              <a-button type="link" size="small" @click="editRecord(record)">
                {{ t("button.edit") }}
              </a-button>
              <!-- <a-popconfirm :title="'确定删除患者 ' + record.doctorName + ' 吗？'" @confirm="deleteRecord(record)" ok-text="确定"
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
    <!-- 新增弹框 -->
    <a-modal v-model:open="addModalVisible" :title="t('button.Patientadd')" width="750px" @ok="handleAddSubmit"
             destroyOnClose @cancel="handleAddCancel">
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
            <a-form-item :label="'登錄賬號'" name="loginAccount">
              <a-select v-model:value="addForm.loginAccount" :placeholder="'請選擇登錄賬號'" allow-clear
                        @change="handleLoginAccountChange">
                <a-select-option v-for="item in loginAccountList" :key="item.loginName" :value="item.loginName">
                  {{ item.loginName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.phone')" name="phone">
              <a-input v-model:value="addForm.phone" :placeholder="'請輸入電話'" :disabled="true"/>
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
            <a-form-item :label="'機構'" name="orgId">
              <a-cascader v-model:value="addForm.orgId" :options="orgList" placeholder="請選擇機構"
                          :field-names="{ label: 'label', value: 'id', children: 'children' }"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.department')" name="subject">
              <a-select v-model:value="addForm.subject" :placeholder="t('placeholder.d')" allow-clear>
                <a-select-option v-for="item in doctorlists" :key="item.departName" :value="item.departId">
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
            <a-form-item :label="'香港醫生行醫証'" name="hkCertificate">
              <a-input v-model:value="addForm.hkCertificate" :placeholder="t('public.input') + '香港醫生行醫証'"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="'大陸行醫資格証'" name="proQualifyCertificate">
              <a-input v-model:value="addForm.proQualifyCertificate"
                       :placeholder="t('public.input') + '大陸行醫資格証'"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('menu.PHARMACY')" name="nameChi">
              <a-select v-model:value="addForm.nameChi" :placeholder="t('placeholder.PHARMACY')" allow-clear
                        @change="handleHospitalChange">
                <a-select-option v-for="item in menzhenlist" :key="item.hospitalId" :value="item.hospitalName">
                  {{ item.hospitalName }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('menu.aa')" name="aa">
              <a-input v-model:value="addForm.aa" :placeholder="t('placeholder.gg')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12" style="display: flex;justify-content: space-around;">
            <!-- <a-form-item :label="'職業資格證書'" name="licenseFileList">
              <a-upload v-model:file-list="addForm.licenseFileList" list-type="picture-card"
                :before-upload="beforeUpload" @preview="handlePreview">
                <div v-if="addForm.licenseFileList.length < 1">
                  <plus-outlined />
                  <div style="margin-top: 8px">{{ t("button.add") }}</div>
                </div>
              </a-upload>
            </a-form-item> -->
            <a-form-item :label="'医生印章'" name="esignature">
              <a-upload v-model:file-list="addForm.esignature" list-type="picture-card" :before-upload="beforeUpload"
                        @preview="handlePreview">
                <div v-if="addForm.esignature.length < 1">
                  <plus-outlined/>
                  <div style="margin-top: 8px">{{ t("button.add") }}</div>
                </div>
              </a-upload>
            </a-form-item>
            <a-form-item label="医生头像" name="doctorPhotoFileList">
              <a-upload
                  v-model:file-list="addForm.doctorPhotoFileList"
                  list-type="picture-card"
                  :customRequest="uploadDoctorPhoto"
                  :show-upload-list="true"
                  @preview="handlePreview"
              >
                <div v-if="addForm.doctorPhotoFileList.length < 1">
                  <plus-outlined/>
                  <div style="margin-top: 8px">上传头像</div>
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
              <a-range-picker v-model:value="addForm.professionValidity" :placeholder="['開始日期', '結束日期']"
                              format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
    <!-- 编辑弹框 -->
    <a-modal destroyOnClose v-model:open="editModalVisible" :title="t('button.edit')" width="750px"
             @ok="handleEditSubmit" @cancel="handleEditCancel">
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
            <a-form-item :label="'登录账号'" name="loginName">
              <a-select v-model:value="editForm.loginName" :placeholder="'请选择登录账号'" :disabled="true">
                <a-select-option v-for="item in loginAccountList" :key="item.loginName" :value="item.loginName">
                  {{ item.loginName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('label.phone')" name="phone">
              <a-input v-model:value="editForm.phone" :placeholder="t('placeholder.enterEmergencyContactPhone')"
                       :disabled="true"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('label.email')" name="email">
              <a-input v-model:value="editForm.email" :placeholder="t('placeholder.g')"/>
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
            <a-form-item :label="t('menu.PHARMACY')" name="nameChi">
              <a-select v-model:value="editForm.nameChi" :placeholder="t('placeholder.PHARMACY')" allow-clear
                        @change="handleEditHospitalChange">
                <a-select-option v-for="item in menzhenlist" :key="item.hospitalId" :value="item.hospitalName">
                  {{ item.hospitalName }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('menu.aa')" name="aa">
              <a-input v-model:value="editForm.aa" :placeholder="t('placeholder.gg')"/>
            </a-form-item>
          </a-col>
          <a-col :span="12" style="display: flex;justify-content: space-around;">
            <!-- <a-form-item :label="t('label.license')" name="licenseFileList">
              <a-upload v-model:file-list="editForm.licenseFileList" list-type="picture-card"
                :before-upload="beforeUpload" @preview="handlePreview">
                <div v-if="editForm.licenseFileList.length < 1">
                  <plus-outlined />
                  <div style="margin-top: 8px">{{ t("button.add") }}</div>
                </div>
              </a-upload>
            </a-form-item> -->
            <a-form-item :label="'醫生印章'" name="esignature">
              <a-upload v-model:file-list="editForm.esignature" list-type="picture-card" :before-upload="beforeUpload"
                        @preview="handlePreview">
                <div v-if="editForm.esignature.length < 1">
                  <plus-outlined/>
                  <div style="margin-top: 8px">{{ t("button.add") }}</div>
                </div>
              </a-upload>
            </a-form-item>
            <a-form-item label="医生头像" name="doctorPhotoFileList">
              <a-upload
                  v-model:file-list="editForm.doctorPhotoFileList"
                  list-type="picture-card"
                  :customRequest="uploadDoctorPhotoEdit"
                  :show-upload-list="true"
                  @preview="handlePreview"
              >
                <div v-if="editForm.doctorPhotoFileList.length < 1">
                  <plus-outlined/>
                  <div style="margin-top: 8px">上传头像</div>
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
              <a-range-picker v-model:value="editForm.professionValidity" :placeholder="['開始日期', '結束日期']"
                              format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
    <!-- 添加预约渠道弹窗 -->
    <a-modal v-model:open="channelModalVisible" title="预约渠道" width="520px" @ok="handleChannelSubmit"
             @cancel="handleChannelCancel" ok-text="保存" cancel-text="取消">
      <div class="channel-modal">
        <div class="channel-header">
          <span style="margin-right: 20px">全选</span>
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
    <!-- 图片预览 -->
    <a-modal v-model:open="previewVisible" title="圖片預覽" :footer="null" @cancel="previewVisible = false">
      <img :src="previewImage" style="width: 100%"/>
    </a-modal>
    <!-- 详情弹窗 -->
    <a-modal v-model:open="detailModalVisible" title="醫生詳情" width="750px" :footer="null"
             @cancel="detailModalVisible = false">
      <a-form :model="detailForm" layout="vertical" class="detail-form">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="英文名">
              <span>{{ detailForm.englishName || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="中文名">
              <span>{{ detailForm.chineseName || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="登录账号">
              <span>{{ detailForm.loginName || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="電話">
              <span>{{ detailForm.phone || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="中文專業">
              <span>{{ detailForm.chineseSpecialty || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="英文專業">
              <span>{{ detailForm.englishSpecialty || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="郵箱">
              <span>{{ detailForm.email || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="科目">
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
            <a-form-item label="診所">
              <span>{{ detailForm.nameChi || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="專業所長">
              <span>{{ detailForm.aa || '-' }}</span>
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
                  detailForm.professionValidityStart && detailForm.professionValidityEnd ?
                      detailForm.professionValidityStart + ' 至 ' + detailForm.professionValidityEnd : '-'
                }}</span>
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
      </a-form>
    </a-modal>
  </div>
</template>
<script setup>
import {ref, reactive, computed} from "vue";
import {message} from "ant-design-vue";
import {useI18n} from "vue-i18n";
import {PlusOutlined} from "@ant-design/icons-vue";
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
  buildTree
} from "@/api/yyf";

const {t} = useI18n();
import {autoMask, maskString} from "@/utils/tools";
// 表格列
const columns = computed(() => [
  {title: t("label.f"), dataIndex: "loginName", key: "loginName", align: "center"},
  {title: t("label.g"), dataIndex: "enName", key: "enName", align: "center"},
  {title: t("label.h"), dataIndex: "doctorName", key: "doctorName", align: "center"},
  {title: t("label.i"), dataIndex: "serialNumber", key: "serialNumber", align: "center"},
  {
    title: t("label.j"),
    dataIndex: "status",
    key: "status",
    align: "center",
    isSwitch: true, // ⭐ 标记为 switch 渲染
  },
  {title: t("button.shenhe"), key: "action", align: "center"},
]);
const channelColumns = [
  {title: "渠道名", dataIndex: "name", key: "name", align: "center"},
  {title: "备注", dataIndex: "remark", key: "remark", align: "center"},
  {title: "连接状态", key: "status", align: "center"},
];
// 示例数据
const tableData = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `${t("button.total")} ${total} ${t("label.records")}`,
});
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
        // 如果有其他敏感字段，可在这里继续添加
      }));
      tableData.value = maskedData;
      pagination.total = res.data.total || 0; // 设置总数
      console.log(res.data);
    }
  } catch (error) {
    message.error("获取列表失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};
const doctorlists = ref([]);
const doctorlist = async () => {
  const res = await tDoctorList({});
  if (res.code === "200" && res.msg === "success") {
    console.log(res.data);
    doctorlists.value = res.data.data;
    console.log(doctorlists.value);

  }
};
const menzhenlist = ref([]);
const selectedHospital = ref(null);
const selectedEditHospital = ref(null);
const doctorTitles = ref([]);
const loginAccountList = ref([]);

const doctorlistsa = async () => {
  const res = await getclinic({});
  if (res.code === "200" && res.msg === "success") {
    console.log(res.data);
    menzhenlist.value = res.data.data; // 修复：改为 res.data.data
    console.log(menzhenlist.value);
  }
};

const getDoctorTitles = async () => {
  const res = await selectDoctorTitle({});
  if (res.code === "200" && res.msg === "success") {
    doctorTitles.value = res.data.data;
  }
};

// 获取登录账号列表
const getLoginAccountList = async () => {
  const res = await selectDoctorAccount({
    roleType: 'doctor'
  });
  if (res.code === "200") {
    loginAccountList.value = res.data.data || [];
  }
};

// 处理登录账号选择变化
const handleLoginAccountChange = (value) => {
  if (value) {
    const selectedAccount = loginAccountList.value.find(item => item.loginName === value);
    if (selectedAccount) {
      addForm.phone = selectedAccount.telPhone || '';
    }
  } else {
    addForm.phone = '';
  }
};

// 处理编辑弹窗中登录账号选择变化
const handleEditLoginAccountChange = (value) => {
  if (value) {
    const selectedAccount = loginAccountList.value.find(item => item.loginName === value);
    if (selectedAccount) {
      editForm.phone = selectedAccount.telPhone || '';
    }
  } else {
    editForm.phone = '';
  }
};

// 新增：处理门诊选择变化
const handleHospitalChange = (value) => {
  if (value) {
    selectedHospital.value = menzhenlist.value.find(item => item.hospitalName === value);
  } else {
    selectedHospital.value = null;
  }
};

// 编辑：处理门诊选择变化
const handleEditHospitalChange = (value) => {
  if (value) {
    selectedEditHospital.value = menzhenlist.value.find(item => item.hospitalName === value);
  } else {
    selectedEditHospital.value = null;
  }
};

getlist();

const handleTableChange = (paginationConfig) => {
  pagination.current = paginationConfig.current;
  pagination.pageSize = paginationConfig.pageSize;
  getlist(); // 重新获取数据
};
const addModalVisible = ref(false);
const addForm = reactive({
  englishName: "",
  chineseName: "",
  chineseSpecialty: "",
  englishSpecialty: "",
  phone: "",
  email: "",
  printTitle: "",
  department: "",
  loginAccount: null,
  orgId: null,
  password: "",
  nameChi: "",
  proQualifyCertificate: "",
  hkCertificate: "",
  licenseFileList: [],
  esignature: [],
  doctorPhotoFileList: [],
  aa: "",
  position: null,
  practiceScope: "",
  multiPractice: "",
  professionValidity: []
});
const addformRef = ref(null);
const addFormRules = {
  englishName: [{required: true, message: "請輸入英文名", trigger: "blur"}],
  chineseName: [{required: true, message: "請輸入中文名", trigger: "blur"}],
  proQualifyCertificate: [{required: true, message: "大陸行醫資格証", trigger: "blur"}],
  hkCertificate: [{required: true, message: "香港醫生行醫証", trigger: "blur"}],
  chineseSpecialty: [{required: true, message: "請輸入中文專業", trigger: "blur"}],
  englishSpecialty: [{required: true, message: "請輸入英文專業", trigger: "blur"}],
  phone: [{required: true, message: "請輸入手機號", trigger: "blur"}],
  email: [{required: true, message: "請輸入郵箱", trigger: "blur"}],
  printTitle: [{required: true, message: "請輸入打印標題", trigger: "blur"}],
  subject: [{required: true, message: "請輸入科目", trigger: "blur"}],
  aa: [{required: true, message: "請輸入專業所長", trigger: "blur"}],
  password: [{required: true, message: "請輸入密碼", trigger: "blur"}],
  nameChi: [{required: true, message: "請選擇診所", trigger: "blur"}],
  orgId: [{required: true, message: "請選擇機構", trigger: "blur"}],
  licenseFileList: [{required: true, message: "請上傳證件", trigger: "change"}],
  esignature: [{required: true, message: "請上傳印章", trigger: "change"}],
  doctorPhotoFileList: [{required: true, message: "請上傳醫生頭像", trigger: "change"}],
  position: [{required: true, message: "請選擇職稱", trigger: "change"}],
  loginAccount: [{required: true, message: "請選擇登录账号", trigger: "change"}],
};
const editModalVisible = ref(false);
const editForm = reactive({
  doctorId: "",
  englishName: "",
  chineseName: "",
  chineseSpecialty: "",
  englishSpecialty: "",
  phone: "",
  email: "",
  printTitle: "",
  department: "",
  subject: "",
  licenseFileList: [],
  esignature: [],
  doctorPhotoFileList: [],
  channelTag: "",
  rawData: null,
  aa: "",
  position: "",
  nameChi: "",
  practiceScope: "",
  multiPractice: "",
  professionValidity: [],
  loginName: ""
});
const editformRef = ref(null);
const editFormRules = {
  englishName: [{required: true, message: "请输入英文名", trigger: "blur"}],
  chineseName: [{required: true, message: "请输入中英文名", trigger: "blur"}],
  chineseSpecialty: [{required: true, message: "请输入中文专业", trigger: "blur"}],
  englishSpecialty: [{required: true, message: "请输入英文专业", trigger: "blur"}],
  phone: [{required: true, message: "请输入手机号", trigger: "blur"}],
  email: [{required: true, message: "请输入邮箱", trigger: "blur"}],
  printTitle: [{required: true, message: "请输入打印标题", trigger: "blur"}],
  subject: [{required: true, message: "请选择科室", trigger: "change"}],
  licenseFileList: [{required: true, message: "请上传证件", trigger: "change"}],
  esignature: [{required: true, message: "请上传证件", trigger: "change"}],
  doctorPhotoFileList: [{required: true, message: "请上传医生头像", trigger: "change"}],
  channelTag: [{required: true, message: "请选择渠道", trigger: "change"}],
  nameChi: [{required: true, message: "请选择诊所", trigger: "change"}],
  position: [{required: true, message: "请选择职称", trigger: "change"}],
  aa: [{required: true, message: "请输入专业所长", trigger: "blur"}],
  loginName: [{required: true, message: "请选择登录账号", trigger: "change"}],
};
const previewVisible = ref(false);
const previewImage = ref("");
const channelModalVisible = ref(false);
const channelList = ref([]);
const allChecked = ref(false);
const currentChannelRecord = ref(null);
const detailModalVisible = ref(false);
const detailForm = reactive({
  englishName: "",
  chineseName: "",
  chineseSpecialty: "",
  englishSpecialty: "",
  phone: "",
  email: "",
  subject: "",
  aa: "",
  nameChi: "",
  status: "",
  licenseUrl: "",
  doctorPhotoUrl: "",
  position: "",
  practiceScope: "",
  multiPractice: "",
  professionValidityStart: "",
  professionValidityEnd: "",
  loginName: ""
});
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
    message.error("只能上传 JPG/PNG 格式的图片！");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过 2MB！");
    return false;
  }
  try {
    const base64 = await fileToBase64(file);
    file.thumbUrl = base64;
    file.url = base64;
  } catch (error) {
    message.error("图片转换失败");
    console.error(error);
  }
  return false; // 阻止自动上传
};
// const uploadDoctorPhoto = async (file, serialNumber) => {
//   return new Promise((resolve, reject) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('serialNumber', serialNumber);
//     const xhr = new XMLHttpRequest();
//     xhr.open('POST', 'https://hqgy.gzxinxingyiyuan.com/filedec/file/upload');
//     xhr.onload = () => {
//       if (xhr.status === 200) {
//         try {
//           const response = JSON.parse(xhr.responseText);
//           if (response.code === '1000') {
//             resolve(response.data);
//           } else {
//             reject(new Error(response.message || '上传失败'));
//           }
//         } catch (error) {
//           reject(new Error('解析响应失败'));
//         }
//       } else {
//         reject(new Error('上传失败'));
//       }
//     };
//     xhr.onerror = () => {
//       reject(new Error('网络错误'));
//     };
//     xhr.send(formData);
//   });
// };
const handleAddDoctorPhotoChange = async (fileList) => {
  if (fileList.length > 0) {
    const file = fileList[fileList.length - 1];
    if (file.status === 'done' && !file.responseUrl) {
      if (file.originFileObj) {
        try {
          message.loading('正在上传头像...', 0);
          const phone = addForm.phone || '';
          const responseUrl = await uploadDoctorPhoto(file.originFileObj, phone);
          file.responseUrl = responseUrl;
          file.url = responseUrl;
          message.success('头像上传成功');
        } catch (error) {
          message.error('头像上传失败: ' + error.message);
          addForm.doctorPhotoFileList = fileList.slice(0, -1);
        }
      }
    }
  }
};
const handleEditDoctorPhotoChange = async (fileList) => {
  if (fileList.length > 0) {
    const file = fileList[fileList.length - 1];
    if (file.status === 'done' && !file.responseUrl) {
      if (file.originFileObj) {
        try {
          message.loading('正在上传头像...', 0);
          const phone = editForm.phone || '';
          const responseUrl = await uploadDoctorPhoto(file.originFileObj, phone);
          file.responseUrl = responseUrl;
          file.url = responseUrl;
          message.success('头像上传成功');
        } catch (error) {
          message.error('头像上传失败: ' + error.message);
          editForm.doctorPhotoFileList = fileList.slice(0, -1);
        }
      }
    }
  }
};


const handleEditPhotoUpload = async (option) => {
  const {file, onSuccess, onError} = option;
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("只能上传 JPG/PNG 格式的图片！");
    onError(new Error('只能上传 JPG/PNG 格式的图片'));
    return;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过 2MB！");
    onError(new Error('图片大小不能超过 2MB'));
    return;
  }
  try {
    const phone = editForm.phone || '';
    const responseUrl = await uploadDoctorPhoto(file, phone);
    onSuccess({url: responseUrl}, file);
    message.success('头像上传成功');
  } catch (error) {
    message.error('头像上传失败: ' + error.message);
    onError(error);
  }
};
const handlePreview = (file) => {
  previewImage.value = file.url || file.thumbUrl;
  previewVisible.value = true;
};
// 查看详情
const showDetail = async (record) => {
  console.log(record.doctorId);
  try {
    const res = await selectDoctorDetaill({doctorId: record.doctorId});
    if (res.code === "200" && res.msg === "success") {
      const data = res.data.data;

      detailForm.englishName = data.enName || "-";
      detailForm.chineseName = data.doctorName || "-";
      detailForm.chineseSpecialty = data.profession || "-";
      detailForm.englishSpecialty = data.enPro || "-";
      detailForm.phone = data.serialNumber || "-";
      detailForm.email = data.email || "-";
      detailForm.subject = data.departName || "-";
      detailForm.aa = data.position || "-";
      detailForm.nameChi = data.hospital || "-";
      detailForm.status = data.status || "-";
      detailForm.licenseUrl = data.proQualifyCertificate || "";
      detailForm.esignature = data.esignature || "";
      detailForm.doctorPhotoUrl = data.doctorPhoto || "";
      detailForm.position = data.position || "-";
      detailForm.practiceScope = data.practiceScope || "-";
      detailForm.multiPractice = data.multiPractice || "-";
      detailForm.professionValidityStart = data.professionValidityStart || "";
      detailForm.professionValidityEnd = data.professionValidityEnd || "";
      detailForm.loginName = data.loginName || "-";
      detailModalVisible.value = true;
    } else {
      message.error("獲取詳情失敗");
    }
  } catch (error) {
    message.error("獲取詳情失敗");
    console.error(error);
  }
};
const showChannelModal = (record) => {
  currentChannelRecord.value = record;
  // 解析channelTag
  let channels = [];
  if (record.channelTag) {
    try {
      channels = JSON.parse(record.channelTag);
    } catch (error) {
      console.error("解析channelTag失败:", error);
      channels = [];
    }
  }
  // 转换为弹窗需要的格式，添加checked属性
  channelList.value = channels.map((channel) => ({
    name: channel.name,
    remark: channel.remark,
    status: channel.status,
    checked: channel.status === 1,
  }));
  // 检查是否全选
  allChecked.value = channelList.value.length > 0 && channelList.value.every((item) => item.checked);
  channelModalVisible.value = true;
};
const handleAllCheckChange = (checked) => {
  channelList.value.forEach((item) => {
    item.checked = checked;
  });
};
const handleChannelSubmit = async () => {
  if (!currentChannelRecord.value) return;
  try {
    // 获取当前记录的详情，保持其他字段不变
    const detailRes = await selectDoctorDetaill({doctorId: currentChannelRecord.value.doctorId});
    if (detailRes.code !== "200" || detailRes.msg !== "success") {
      message.error("获取详情失败");
      return;
    }
    const originalData = detailRes.data.data;
    // 转换channelList为API需要的格式
    const updatedChannels = channelList.value.map((item) => ({
      name: item.name,
      remark: item.remark,
      status: item.checked ? 1 : 0,
    }));
    // 将数组转换为JSON字符串
    const channelTagString = JSON.stringify(updatedChannels);
    // 构建更新参数，保持所有原始数据不变，只修改channelTag
    const params = {
      doctorId: originalData.doctorId,
      doctorName: originalData.doctorName || "",
      serialNumber: originalData.serialNumber || "",
      depart: originalData.depart || "",
      profession: originalData.profession || "",
      proSkill: originalData.proSkill || "",
      mainlandFee: originalData.mainlandFee || "",
      hkFee: originalData.hkFee || "",
      proQualifyCertificate: originalData.proQualifyCertificate || "",
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
      hospital: originalData.hospital || "",
      enName: originalData.enName || "",
      loginName: originalData.loginName || "",
      email: originalData.email || "",
      enPro: originalData.enPro || "",
      channelTag: channelTagString, // 只修改channelTag
      doctorPhoto: originalData.doctorPhoto || "", // 保持医生头像不变
    };
    const res = await selectDoctorupdateDoctor(params);
    if (res.code === "200" && res.msg === "success") {
      message.success("保存成功");
      channelModalVisible.value = false;
      getlist(); // 刷新列表
    } else {
      message.error("保存失败");
    }
  } catch (error) {
    message.error("保存失败");
    console.error(error);
  }
};
const handleChannelCancel = () => {
  channelModalVisible.value = false;
};
const editRecord = async (record) => {
  await doctorlist();
  await doctorlistsa();
  await getDoctorTitles();
  await getLoginAccountList();
  await getTree()
  try {

    const res = await selectDoctorDetaill({doctorId: record.doctorId});
    if (res.code === "200" && res.msg === "success") {
      console.log("获取医生详情数据:", res);
      const data = res.data.data;
      editModalVisible.value = true;
      editForm.rawData = data;
      // editForm.channelTag = data.channelTag || "";
      // 回显数据到表单字段
      editForm.doctorId = data.doctorId || "";
      editForm.englishName = data.enName || "";
      editForm.chineseName = data.doctorName || "";
      editForm.chineseSpecialty = data.profession || "";
      editForm.englishSpecialty = data.enPro || "";
      editForm.phone = data.serialNumber || "";
      editForm.email = data.email || "";
      editForm.aa = data.proSkill || "";
      editForm.department = data.departName || "";
      // 根据后端返回的科室名称查找对应的科室ID
      const departmentItem = doctorlists.value.find(item => item.departName === data.departName);
      editForm.subject = departmentItem ? departmentItem.departId : "";
      editForm.nameChi = data.hospital || "";
      editForm.position = data.position || "";
      editForm.aa = data.certification || "";
      editForm.practiceScope = data.practiceScope || "";
      editForm.multiPractice = data.multiPractice || "";
      editForm.loginName = data.loginName || "";
      // 处理执业有效期回显
      if (data.professionValidityStart && data.professionValidityEnd) {
        editForm.professionValidity = [data.professionValidityStart, data.professionValidityEnd];
      } else {
        editForm.professionValidity = [];
      }

      // 处理图片回显
      editForm.licenseFileList = data.proQualifyCertificate
          ? [
            {
              uid: "-1",
              name: "license.png",
              status: "done",
              url: data.proQualifyCertificate,
            },
          ]
          : [];
      // 处理医生头像回显
      editForm.doctorPhotoFileList = data.doctorPhoto
          ? [
            {
              uid: "-2",
              name: "doctorPhoto.png",
              status: "done",
              url: data.doctorPhoto,
            },
          ]
          : [];
      editForm.esignature = data.esignature
          ? [
            {
              uid: "-2",
              name: "esignature.png",
              status: "done",
              url: data.esignature,
            },
          ]
          : [];
      // 设置选中的门诊
      if (data.hospital) {
        selectedEditHospital.value = menzhenlist.value.find(item => item.hospitalName === data.hospital);
      }
    } else {
      message.error("获取医生详情失败");
    }
  } catch (error) {
    message.error("获取医生详情失败");
    console.error(error);
  }
};
const deleteRecord = async (record) => {
  try {
    const res = await selectDoctordel({ids: [record.doctorId]});
    if (res.code === "200" && res.msg === "success") {
      message.success("删除成功");
      getlist();
    } else {
      message.error("删除失败");
    }
  } catch (error) {
    message.error("删除失败");
    console.error(error);
  }
};

const orgList = ref([]);
const getTree = async () => {
  try {
    const res = await buildTree({});
    if (res.code == 200) {
      orgList.value = res.data;
    }
  } catch (error) {
    console.error(error);
  }
};
const showAddModal = () => {
  doctorlist();
  doctorlistsa();
  getDoctorTitles();
  getLoginAccountList();
  getTree()
  addModalVisible.value = true;
  // 重置表单
  addForm.englishName = "";
  addForm.chineseName = "";
  addForm.chineseSpecialty = "";
  addForm.englishSpecialty = "";
  addForm.phone = "";
  addForm.email = "";
  addForm.printTitle = "";
  addForm.department = "";
  addForm.loginAccount = "";
  addForm.password = "";
  addForm.clinic = "";
  addForm.nameChi = "";
  addForm.licenseFileList = [];
  addForm.doctorPhotoFileList = []; // 重置医生头像
  addForm.practiceScope = "";
  addForm.multiPractice = "";
  addForm.professionValidity = [];
  addForm.esignature = [];
  addForm.orgId = null;
  selectedHospital.value = null; // 重置选中的门诊
};
import axios from "axios"

const uploadDoctorPhoto = async (options) => {
  const {file, onSuccess, onError} = options

  try {
    const formData = new FormData()

    // 后端要求的参数
    formData.append("file", file)
    formData.append("serialNumber", addForm.serialNumber)

    const res = await axios.post(
        "https://hqgy.gzxinxingyiyuan.com/filedec/file/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
    )

    console.log("上传返回：", res)


    const imageUrl = res.data.data.data
    console.log("图片地址：", imageUrl)
    // 回显上传后的图片
    addForm.doctorPhotoFileList = [
      {
        uid: file.uid,
        name: file.name,
        status: "done",
        url: imageUrl
      }
    ]
    console.log("图片回显：", addForm.doctorPhotoFileList)

    message.success("上传成功")

    // onSuccess(res.data.data.data)
  } catch (error) {
    console.error(error)

    message.error("上传失败")

    onError(error)
  }
}
const uploadDoctorPhotoEdit = async (options) => {
  const {file, onSuccess, onError} = options

  try {
    const formData = new FormData()

    // 后端要求的参数
    formData.append("file", file)
    formData.append("serialNumber", editForm.serialNumber)

    const res = await axios.post(
        "https://hqgy.gzxinxingyiyuan.com/filedec/file/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
    )

    console.log("上传返回：", res)


    const imageUrl = res.data.data.data
    console.log("图片地址：", imageUrl)
    // 回显上传后的图片
    editForm.doctorPhotoFileList = [
      {
        uid: file.uid,
        name: file.name,
        status: "done",
        url: imageUrl
      }
    ]
    console.log("图片回显：", editForm.doctorPhotoFileList)

    message.success("上传成功")

    // onSuccess(res.data.data.data)
  } catch (error) {
    console.error(error)

    message.error("上传失败")

    onError(error)
  }
}
const handleAddSubmit = async () => {
  const isValid = await addformRef.value.validate();
  if (!isValid) return;
  console.log("表单数据:", addForm);
  // 这里可以添加表单验证
  if (!addForm.chineseName || !addForm.englishName) {
    message.error("请填写姓名");
    return;
  }
  // 验证医生头像是否上传
  if (addForm.doctorPhotoFileList.length === 0) {
    message.error("请上传医生头像");
    return;
  }
  console.log("addForm", addForm.doctorPhotoFileList)
  try {
    // 将表单字段映射到API字段，没有的传空字符串
    const params = {
      doctorName: addForm.chineseName,
      serialNumber: addForm.phone,
      depart: addForm.subject,
      profession: addForm.chineseSpecialty,
      certification: addForm.aa,
      mainlandFee: "",
      hkFee: "",
      // proQualifyCertificate: addForm.licenseFileList[0]?.thumbUrl || "",
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
      proQualifyCertificate: addForm.proQualifyCertificate || '',
      hkCertificate: addForm.hkCertificate || '',
      // 修改：传门诊的 hospitalId、hospitalAddress、hospitalTel
      hospitalId: selectedHospital.value?.hospitalId || "",
      hospitalAddress: selectedHospital.value?.hospitalAddress || "",
      hospitalTel: selectedHospital.value?.hospitalTel || "",
      enName: addForm.englishName,
      loginName: addForm.loginAccount,
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
    console.log(params)

    const res = await selectDoctoradd(params);
    console.log(res.data.message);
    if (res.code === "200" && res.msg === "success" && res.data.message === "新增成功") {
      message.success("新增成功");
      addModalVisible.value = false;
      getlist();
    } else if (res.code === "200" && res.msg === "success" && res.data.message === "账号已被绑定") {
      message.error("账号已被绑定");
    } else {
      message.error(res.data.message);
    }
  } catch (error) {
    message.error("新增失败");
    console.error(error);
  }
};
const handleAddCancel = () => {
  addModalVisible.value = false;
};
const handleEditSubmit = async () => {
  const isValid = await editformRef.value.validate();
  if (!isValid) return;
  if (!editForm.chineseName || !editForm.englishName) {
    message.error("请填写姓名");
    return;
  }
  // 验证医生头像是否上传
  if (editForm.doctorPhotoFileList.length === 0) {
    message.error("请上传医生头像");
    return;
  }
  console.log(editForm.subject);

  try {
    const originalData = editForm.rawData;
    const params = {
      doctorId: editForm.doctorId,
      doctorName: editForm.chineseName,
      serialNumber: editForm.phone,
      depart: editForm.subject,
      profession: editForm.chineseSpecialty,
      certification: editForm.aa || "",
      // mainlandFee: originalData?.mainlandFee || "",
      // hkFee: originalData?.hkFee || "",
      proQualifyCertificate: editForm.licenseFileList[0]?.thumbUrl || editForm.licenseFileList[0]?.url || "",
      esignature: editForm.esignature[0]?.thumbUrl || editForm.esignature[0]?.url || "",
      proQualifyName: originalData?.proQualifyName || "",
      banckAcctName: originalData?.banckAcctName || "",
      idCardNo: originalData?.idCardNo || "",
      idCard: originalData?.idCard || "",
      bankCard: originalData?.bankCard || "",
      // profitShareRatio: originalData?.profitShareRatio || "",
      consultationState: originalData?.consultationState || "",
      fansNum: originalData?.fansNum || 0,
      retireState: originalData?.retireState || "",
      bankAcctNo: originalData?.bankAcctNo || "",
      // 修改：传门诊的 hospitalId、hospitalAddress、hospitalTel
      hospitalId: selectedEditHospital.value?.hospitalId || originalData?.hospitalId || "",
      hospitalAddress: selectedEditHospital.value?.hospitalAddress || originalData?.hospitalAddress || "",
      hospitalTel: selectedEditHospital.value?.hospitalTel || originalData?.hospitalTel || "",
      enName: editForm.englishName,
      loginName: editForm.loginName,
      email: editForm.email,
      enPro: editForm.englishSpecialty,
      channelTag: editForm.channelTag, // 保持channelTag不变
      doctorPhoto: editForm.doctorPhotoFileList[0]?.thumbUrl || editForm.doctorPhotoFileList[0]?.url || "", // 新增医生头像字段
      position: editForm.position,
      practiceScope: editForm.practiceScope,
      multiPractice: editForm.multiPractice,
      professionValidityStart: editForm.professionValidity?.[0] || "",
      professionValidityEnd: editForm.professionValidity?.[1] || "",
    };
    const res = await selectDoctorupdateDoctor(params);
    if (res.code === "200" && res.data.message === "修改成功") {
      message.success("修改成功");
      editModalVisible.value = false;
      getlist();
    } else {
      message.error("修改失败");
    }
  } catch (error) {
    message.error("修改失败");
    console.error(error);
  }
};
const handleEditCancel = () => {
  editModalVisible.value = false;
};
const daochu = async () => {
  const res = await exportMedicines({});
  const blob = new Blob([res.data], {
    type: "application/vnd.ms-excel",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "医生导出.xlsx";
  a.click();
  window.URL.revokeObjectURL(url);
};
const daochus = async (record) => {
  const res = await exportMedicines({doctorId: record.doctorId});
  const blob = new Blob([res.data], {
    type: "application/vnd.ms-excel",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "医生导出.xlsx"; // 下载文件名
  a.click();
  window.URL.revokeObjectURL(url);
};
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