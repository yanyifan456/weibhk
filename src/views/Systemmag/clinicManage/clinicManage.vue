<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="formRef" class="search-form">
        <a-form-item label="醫院名稱">
          <a-input
              v-model:value="form.hospitalName"
              placeholder="請輸入醫院名稱"
              style="width: 200px"
              allowClear
          />
        </a-form-item>
        <a-form-item label="法人名稱">
          <a-input
              v-model:value="form.legalPerson"
              placeholder="請輸入法人名稱"
              style="width: 200px"
              allowClear
          />
        </a-form-item>
        <div class="search-actions">
          <a-button type="primary" @click="handleSearch">查詢</a-button>
          <a-button style="margin-left: 20px" @click="handleReset">重置</a-button>
          <a-button
              style="margin-left: 8px; background-color: #52ae7b; color: #fff"
              type="primary"
              @click="addModal = true"
          >
            新增
          </a-button>
        </div>
      </a-form>
    </a-card>
    <a-card>
      <a-table
          class="ant-table-striped"
          bordered
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          row-key="id"
          @change="changePage"
          :scroll="{ y: 470, x: 'max-content' }"
          :rowClassName="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr)">
              <a-button type="link" @click="viewDetail(record)">
                詳情
              </a-button>
              <a-button type="link" @click="editHandle(record)">
                編輯
              </a-button>
              <a-popconfirm
                  title="確認刪除？"
                  ok-text="確認"
                  cancel-text="取消"
                  @confirm="confirmDelete(record.id)"
              >
                <a-button type="link" style="color: #ff4d4f">
                  刪除
                </a-button>
              </a-popconfirm>
            </div>
          </template>
          <template v-if="column.key === 'typeId'">
            {{ getCertTypeName(record.typeId) }}
          </template>
          <template v-if="column.key === 'hospitalLevel'">
            {{ getHospitalLevelName(record.hospitalLevel) }}
          </template>
          <template v-if="column.key === 'hospitalGrade'">
            {{ getHospitalTypeName(record.hospitalGrade) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
  
  <ClinicFormModal
      v-model:visible="addModal"
      mode="add"
      @success="getData"
  />
  
  <ClinicFormModal
      v-model:visible="editModal"
      mode="edit"
      :data="currentData"
      @success="getData"
  />
  
  <ClinicDetailModal
      v-model:visible="detailModal"
      :data="currentDetailData"
  />
</template>

<script setup>
import {ref, reactive, onMounted} from "vue";
import {message} from "ant-design-vue";
import ClinicFormModal from "./components/clinicForm.vue";
import ClinicDetailModal from "./components/clinicDetail.vue";
import {getHospital, deleteHospital, getCertTypeList, getHospitalLevelList, getHospitalTypeList} from "@/api/api1";

const dataList = ref([]);
const addModal = ref(false);
const editModal = ref(false);
const detailModal = ref(false);
const currentData = ref(null);
const currentDetailData = ref({});

const certTypeList = ref([]);
const hospitalLevelList = ref([]);
const hospitalTypeList = ref([]);

const formRef = ref(null);
const form = reactive({
  hospitalName: "",
  legalPerson: "",
});

const handleSearch = () => {
  pagination.current = 1;
  getData();
};

const handleReset = () => {
  form.hospitalName = "";
  form.legalPerson = "";
  pagination.current = 1;
  getData();
};

const columns = [
  {title: "序號", dataIndex: "index", key: "index", align: "center", width: 80},
  {title: "醫院名稱", dataIndex: "hospitalName", key: "hospitalName", align: "center", width: 180},
  {title: "營業執照編碼", dataIndex: "caseCode", key: "caseCode", align: "center", width: 180},
  {title: "法人名稱", dataIndex: "legalPerson", key: "legalPerson", align: "center", width: 120},
  {title: "法人證件ID", dataIndex: "legalPersonId", key: "legalPersonId", align: "center", width: 150},
  {title: "法人證件類型", dataIndex: "typeId", key: "typeId", align: "center", width: 120},
  {title: "醫院編碼", dataIndex: "hospitalId", key: "hospitalId", align: "center", width: 120},
  {title: "醫院地址", dataIndex: "hospitalAddress", key: "hospitalAddress", align: "center", width: 200},
  {title: "聯繫電話", dataIndex: "hospitalTel", key: "hospitalTel", align: "center", width: 150},
  {title: "官網地址", dataIndex: "netAddress", key: "netAddress", align: "center", width: 200},
  {title: "開辦資金", dataIndex: "startupCapital", key: "startupCapital", align: "center", width: 120},
  {title: "衛生機構代碼", dataIndex: "institutionCode", key: "institutionCode", align: "center", width: 180},
  {title: "許可證號", dataIndex: "licenseNumber", key: "licenseNumber", align: "center", width: 180},
  {title: "許可證名稱", dataIndex: "licenseDate", key: "licenseDate", align: "center", width: 120},
  {title: "許可證有效期", dataIndex: "licenseValiteDate", key: "licenseValiteDate", align: "center", width: 150},
  {title: "醫院等級", dataIndex: "hospitalLevel", key: "hospitalLevel", align: "center", width: 100},
  {title: "醫療機構級別", dataIndex: "hospitalGrade", key: "hospitalGrade", align: "center", width: 120},
  {title: "操作", key: "action", align: "center", width: 100},
];

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 條記錄`,
});

const changePage = (pgn) => {
  pagination.current = pgn.current;
  pagination.pageSize = pgn.pageSize;
  getData();
};

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

const getData = async () => {
  const params = {
    hospitalName: form.hospitalName,
    legalPerson: form.legalPerson,
    currentPage: pagination.current,
    pageSize: pagination.pageSize,
  };

  try {
    const res = await getHospital(params);
    dataList.value = res.data.data.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
    pagination.total = res.data.total;
  } catch (error) {
    console.log("🚀 getData error:", error);
  }
};

const viewDetail = (record) => {
  currentDetailData.value = record;
  detailModal.value = true;
};

const editHandle = (record) => {
  currentData.value = record;
  editModal.value = true;
};

const confirmDelete = async (id) => {
  try {
    const res = await deleteHospital({id});
    message.success(res.data.message);
    await getData();
  } catch (error) {
    console.log("🚀 delete error:", error);
  }
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
  getData();
});
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
}

.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>