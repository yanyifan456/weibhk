<template>
  <a-modal
      :open="visible"
      @update:open="$emit('update:visible', $event)"
      @cancel="$emit('update:visible', false)"
      :title="mode === 'add' ? '新增診所' : '編輯診所'"
      width="900px"
      destroyOnClose
  >
    <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="horizontal"
        :labelCol="{ style: { width: '130px' } }"
        style="margin-top: 20px"
    >
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="醫院名稱" name="hospitalName">
            <a-input v-model:value="form.hospitalName" placeholder="請輸入醫院名稱"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="營業執照編碼" name="caseCode">
            <a-input v-model:value="form.caseCode" placeholder="請輸入營業執照編碼"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="法人名稱" name="legalPerson">
            <a-input v-model:value="form.legalPerson" placeholder="請輸入法人名稱"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="法人證件類型" name="typeId">
            <a-select v-model:value="form.typeId" placeholder="請選擇法人證件類型" style="width: 100%">
              <a-select-option v-for="item in certTypeList" :key="item.id" :value="item.typeId">
                {{ item.certName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="法人證件ID" name="legalPersonId">
            <a-input v-model:value="form.legalPersonId" placeholder="請輸入法人證件ID"/>
          </a-form-item>
        </a-col>

        <!--        <a-col :span="12">-->
        <!--          <a-form-item label="醫院編碼" name="hospitalId">-->
        <!--            <a-input v-model:value="form.hospitalId" placeholder="請輸入醫院編碼"/>-->
        <!--          </a-form-item>-->
        <!--        </a-col>-->
        <a-col :span="12">
          <a-form-item label="醫院詳細地址" name="hospitalAddress">
            <a-input v-model:value="form.hospitalAddress" placeholder="請輸入醫院詳細地址" :maxlength="100" show-count/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="聯繫電話" name="hospitalTel">
            <a-input v-model:value="form.hospitalTel" placeholder="請輸入聯繫電話"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="官網地址" name="netAddress">
            <a-input v-model:value="form.netAddress" placeholder="請輸入官網地址"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="開辦資金" name="startupCapital">
            <a-input-number v-model:value="form.startupCapital" placeholder="請輸入開辦資金" :min="1"
                            style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="衛生機構標準代碼" name="institutionCode">
            <a-input v-model:value="form.institutionCode" placeholder="請輸入衛生機構標準代碼"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="衛生機構許可證號" name="licenseNumber">
            <a-input v-model:value="form.licenseNumber" placeholder="請輸入衛生機構許可證號"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="許可證名稱" name="licenseName">
            <a-input v-model:value="form.licenseName" placeholder="請輸入許可證名稱"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="許可證有效期" name="licenseValiteDate">
            <a-date-picker
                v-model:value="form.licenseValiteDate"
                style="width: 100%"
                format="YYYY-MM-DD"
                placeholder="請選擇許可證有效期"
                :disabled-date="disabledDate"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="醫院等級" name="hospitalLevel">
            <a-select v-model:value="form.hospitalLevel" placeholder="請選擇醫院等級" style="width: 100%">
              <a-select-option v-for="item in hospitalLevelList" :key="item.levelCode" :value="item.levelCode">
                {{ item.levelName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="醫療機構級別" name="hospitalGrade">
            <a-select v-model:value="form.hospitalGrade" placeholder="請選擇醫療機構級別" style="width: 100%">
              <a-select-option v-for="item in hospitalTypeList" :key="item.typeCode" :value="item.typeCode">
                {{ item.typeName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <a-button @click="$emit('update:visible', false)">取消</a-button>
      <a-button type="primary" :loading="loading" @click="handleSubmit">
        {{ mode === 'add' ? '新增' : '保存' }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup>
import {ref, reactive, watch, onMounted} from "vue";
import {message} from "ant-design-vue";
import {addHospital, updateHospital, getCertTypeList, getHospitalLevelList, getHospitalTypeList} from "@/api/api1";
import dayjs from "dayjs";

const props = defineProps({
  visible: Boolean,
  mode: {
    type: String,
    default: "add",
    validator: (value) => ["add", "edit"].includes(value),
  },
  data: Object,
});

const emit = defineEmits(["update:visible", "success"]);

const formRef = ref(null);
const loading = ref(false);

const certTypeList = ref([]);
const hospitalLevelList = ref([]);
const hospitalTypeList = ref([]);

const form = reactive({
  hospitalName: "",
  caseCode: "",
  legalPerson: "",
  legalPersonId: "",
  typeId: undefined,
  // hospitalId: "",
  hospitalAddress: "",
  hospitalTel: "",
  netAddress: "",
  startupCapital: "",
  institutionCode: "",
  licenseNumber: "",
  licenseName: "",
  licenseValiteDate: "",
  hospitalLevel: undefined,
  hospitalGrade: undefined,
});

const rules = {
  hospitalName: [{required: true, message: "請輸入醫院名稱", trigger: "blur"}],
  caseCode: [{required: true, message: "請輸入營業執照編碼", trigger: "blur"}],
  legalPerson: [{required: true, message: "請輸入法人名稱", trigger: "blur"}],
  legalPersonId: [{required: true, message: "請輸入法人證件ID", trigger: "blur"}],
  typeId: [{required: true, message: "請選擇法人證件類型", trigger: "change"}],
  // hospitalId: [{required: true, message: "請輸入醫院編碼", trigger: "blur"}],
  hospitalAddress: [{required: true, message: "請輸入醫院詳細地址", trigger: "blur"}],
  hospitalTel: [{required: true, message: "請輸入聯繫電話", trigger: "blur"},
    {pattern: /^[0-9]*$/, message: "聯繫電話格式不正確", trigger: "blur"}
  ],
  netAddress: [{required: true, message: "請輸入官網地址", trigger: "blur"}],
  startupCapital: [{required: true, message: "請輸入開辦資金", trigger: "blur"}],
  institutionCode: [{required: true, message: "請輸入衛生機構標準代碼", trigger: "blur"}],
  licenseNumber: [{required: true, message: "請輸入衛生機構許可證號", trigger: "blur"}],
  licenseName: [{required: true, message: "請輸入許可證名稱", trigger: "blur"}],
  licenseValiteDate: [{required: true, message: "請選擇許可證有效期", trigger: "change"}],
  hospitalLevel: [{required: true, message: "請選擇醫院等級", trigger: "change"}],
  hospitalGrade: [{required: true, message: "請選擇醫療機構級別", trigger: "change"}],
};

const getCertType = async () => {
  try {
    const res = await getCertTypeList({});
    certTypeList.value = res.data.data;
  } catch (error) {
    console.error("獲取證件類型失敗:", error);
  }
};

const getHospitalLevel = async () => {
  try {
    const res = await getHospitalLevelList({});
    hospitalLevelList.value = res.data.data;
  } catch (error) {
    console.error("獲取醫院等級失敗:", error);
  }
};

const getHospitalType = async () => {
  try {
    const res = await getHospitalTypeList({});
    hospitalTypeList.value = res.data.data;
  } catch (error) {
    console.error("獲取醫療機構級別失敗:", error);
  }
};

const disabledDate = (current) => {
  return current && current < dayjs().startOf("day");
};

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    loading.value = true;
    const params = {...form};
    if (form.licenseValiteDate) {
      params.licenseValiteDate = dayjs(form.licenseValiteDate).format("YYYY-MM-DD");
    }

    if (props.mode === "add") {
      const res = await addHospital(params);
      if (res.code == 200) {
        if (res.data.code == 1000) {
          message.success(res.data.message);
        } else {
          message.error(res.data.message);
        }
      }
    } else {
      params.id = props.data.id;
      const res = await updateHospital(params);
      message.success(res.data.message);
    }

    emit("update:visible", false);
    emit("success");
  } catch (err) {
    if (err?.errorFields) {
      message.warning("請檢查表單");
    } else {
      message.error(err.message || (props.mode === "add" ? "新增" : "保存") + "失敗");
    }
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  Object.assign(form, {
    hospitalName: "",
    caseCode: "",
    legalPerson: "",
    legalPersonId: "",
    typeId: undefined,
    // hospitalId: "",
    hospitalAddress: "",
    hospitalTel: "",
    netAddress: "",
    startupCapital: "",
    institutionCode: "",
    licenseNumber: "",
    licenseName: "",
    licenseValiteDate: "",
    hospitalLevel: undefined,
    hospitalGrade: undefined,
  });
};

watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.mode === "edit" && props.data) {
          Object.assign(form, props.data);
          if (props.data.licenseValiteDate) {
            form.licenseValiteDate = dayjs(props.data.licenseValiteDate);
          }
        } else {
          resetForm();
        }
      } else {
        resetForm();
      }
    }
);

onMounted(() => {
  getCertType();
  getHospitalLevel();
  getHospitalType();
});
</script>

<style scoped></style>