<template>
  <a-modal
      :open="visible"
      @update:open="$emit('update:visible', $event)"
      title="診所詳情"
      width="800px"
      destroyOnClose
  >
    <div class="detail-content">
      <a-row :gutter="24">
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">醫院名稱：</span>
            <span class="detail-value">{{ data.hospitalName }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">營業執照編碼：</span>
            <span class="detail-value">{{ data.caseCode }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">法人名稱：</span>
            <span class="detail-value">{{ data.legalPerson }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">法人證件ID：</span>
            <span class="detail-value">{{ data.legalPersonId }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">法人證件類型：</span>
            <span class="detail-value">{{ getCertTypeName(data.typeId) }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">醫院編碼：</span>
            <span class="detail-value">{{ data.hospitalId }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">醫院地址：</span>
            <span class="detail-value">{{ data.hospitalAddress }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">聯繫電話：</span>
            <span class="detail-value">{{ data.hospitalTel }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">官網地址：</span>
            <span class="detail-value">{{ data.netAddress }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">開辦資金：</span>
            <span class="detail-value">{{ data.startupCapital }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">衛生機構代碼：</span>
            <span class="detail-value">{{ data.institutionCode }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">許可證號：</span>
            <span class="detail-value">{{ data.licenseNumber }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">許可證名稱：</span>
            <span class="detail-value">{{ data.licenseName }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">許可證有效期：</span>
            <span class="detail-value">{{ data.licenseValiteDate }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">醫院等級：</span>
            <span class="detail-value">{{ getHospitalLevelName(data.hospitalLevel) }}</span>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="detail-item">
            <span class="detail-label">醫療機構級別：</span>
            <span class="detail-value">{{ getHospitalTypeName(data.hospitalGrade) }}</span>
          </div>
        </a-col>
      </a-row>
    </div>
    <template #footer>
      <a-button @click="$emit('update:visible', false)">關閉</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {getCertTypeList, getHospitalLevelList, getHospitalTypeList} from "@/api/api1";

const props = defineProps({
  visible: Boolean,
  data: Object,
});

defineEmits(["update:visible"]);

const certTypeList = ref([]);
const hospitalLevelList = ref([]);
const hospitalTypeList = ref([]);

const getCertTypeName = (typeId) => {
  const item = certTypeList.value.find((cert) => cert.typeId === typeId);
  return item ? item.certName : typeId;
};

const getHospitalLevelName = (levelCode) => {
  const item = hospitalLevelList.value.find((level) => level.levelCode === levelCode);
  return item ? item.levelName : levelCode;
};

const getHospitalTypeName = (typeCode) => {
  const item = hospitalTypeList.value.find((type) => type.typeCode === typeCode);
  return item ? item.typeName : typeCode;
};

const loadDictData = async () => {
  try {
    const [certRes, levelRes, typeRes] = await Promise.all([
      getCertTypeList({}),
      getHospitalLevelList({}),
      getHospitalTypeList({}),
    ]);
    certTypeList.value = certRes.data.data;
    hospitalLevelList.value = levelRes.data.data;
    hospitalTypeList.value = typeRes.data.data;
  } catch (error) {
    console.error("加载字典数据失败:", error);
  }
};

onMounted(() => {
  loadDictData();
});
</script>

<style scoped lang="scss">
.detail-content {
  padding: 16px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  word-break: break-all;
}

.detail-label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.detail-value {
  color: #333;
  flex: 1;
}
</style>