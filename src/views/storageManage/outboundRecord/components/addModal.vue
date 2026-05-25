<template>
  <a-modal
    :open="visible"
    @update:open="$emit('update:visible', $event)"
    @cancel="$emit('update:visible', false)"
    :title="t('public.add')"
    width="800px"
    destroyOnClose
  >
    <a-form
      ref="addFormRef"
      :model="form"
      :rules="rules"
      layout="horizontal"
      :labelCol="{ style: { width: '100px' } }"
      style="margin-top: 20px"
    >
      <a-row :gutter="24">
        <!-- 物料名称 -->
        <a-col :span="12">
          <a-form-item :label="t('labelText.wareHouse.label')" name="materialName">
            <a-select v-model:value="form.materialName" :placeholder="t('public.select')" @change="changeSelect">
              <a-select-option v-for="item in materialNameList" :key="item.id" :value="item.materialName">
                {{ item.materialName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <!-- 入货日期 createTime -->
        <a-col :span="12">
          <a-form-item :label="t('public.date')" name="createTime">
            <a-date-picker
              v-model:value="form.createTime"
              style="width: 100%"
              :format="dateFormat"
              :placeholder="t('public.select') + t('public.date')"
              @change="createTimeDateChange"
            />
          </a-form-item>
        </a-col>

        <!-- 单位 -->

        <a-col :span="12">
          <a-form-item :label="t('wareHouseTableHeader.unit')" name="unit">
            <a-select v-model:value="form.unit" :placeholder="t('public.select')">
              <a-select-option v-for="item in unitList" :key="item.id" :value="item.unit">
                {{ item.unit }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <!-- 类型 -->
        <a-col :span="12">
          <a-form-item :label="t('public.type')" name="type">
            <a-select v-model:value="form.type" :placeholder="t('public.select')">
              <a-select-option v-for="item in typeList" :key="item.id" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <!-- 转送到 -->
        <a-col :span="12">
          <a-form-item :label="t('wareHouseTableHeader.goTo')" name="unit">
            <a-select v-model:value="form.giver" :placeholder="t('public.select')" :disabled="form.type != '1'">
              <a-select-option v-for="item in hospitalList" :key="item.id" :value="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- 数量 totalCost -->
        <a-col :span="12">
          <a-form-item :label="t('public.number')" name="shipNumber">
            <a-input v-model:value="form.shipNumber" :placeholder="t('public.input')" />
          </a-form-item>
        </a-col>
        <!-- 目前总数 curNumber -->
        <a-col :span="8">
          <a-form-item label="目前总数" name="curNumber">
            {{ currentSelect?.curNumber }}
          </a-form-item>
        </a-col>
        <!-- 备注 rsvInfo -->

        <a-col :span="24">
          <a-form-item :label="t('wareHouseTableHeader.rsvInfo')" name="rsvInfo">
            <a-input v-model:value="form.rsvInfo" :placeholder="t('public.input')" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <template #footer>
      <a-button @click="$emit('update:visible', false)">{{ t("public.cancel") }}</a-button>
      <a-button type="primary" :loading="loading" @click="handleSubmit">{{ t("public.confirm") }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { addOutRecord, getSupplier, getWarehouseInfoNoPage, getInRecordUnit, getOutRecordType } from "@/api/api1";

const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(["update:visible", "success"]);
const { t } = useI18n();

const addFormRef = ref(null);
const loading = ref(false);

const dateFormat = "YYYY-MM-DD";
const form = reactive({
  materialName: null,
  unit: null,
  createTime: null,
  rsvInfo: "",
  type: null,
  giver: null,
  shipNumber: "",
});

const rules = {
  materialName: [{ required: true, message: t("public.input"), trigger: "blur" }],
  unit: [{ required: false, message: t("public.select"), trigger: "change" }],
  createTime: [{ required: true, message: t("public.select"), trigger: "change" }],
  reorderLevel: [{ required: true, message: t("public.input"), trigger: "blur" }],
  shipNumber: [{ required: true, message: t("public.input"), trigger: "blur" }],
};
const currentSelect = ref({});
const changeSelect = (value, options) => {
  currentSelect.value = materialNameList.value.find((item) => item.id === options.key);
  console.log("🚀 ~ changeSelect ~ currentSelect:", currentSelect.value);
};

const createTimeSelect = ref(null);
const createTimeDateChange = (date, dateString) => {
  createTimeSelect.value = dateString;
};
const validTimeSelect = ref(null);
const validDateChange = (date, dateString) => {
  validTimeSelect.value = dateString;
};
const handleSubmit = async () => {
  try {
    // 先校验（失败会直接 throw）
    await addFormRef.value.validate();

    loading.value = true;

    const params = { ...form };
    // params.validDate = validTimeSelect.value;
    params.createTime = createTimeSelect.value;

    const res = await addOutRecord(params);

    message.success(res.data.message);
    emit("update:visible", false);
    emit("success");
  } catch (error) {
    if (error?.errorFields) {
      message.warning(t("public.checkForm"));
    }
  } finally {
    loading.value = false;
  }
};

const supplierList = ref([]);
const unitList = ref([]);
const materialNameList = ref([]);
const typeList = ref([]);
const hospitalList = ref([
  {
    id: 1,
    name: "廣州南沙信興互聯網醫院",
  },
  {
    id: 2,
    name: "南沙信興綜合門診部",
  },
]);

const getSupplierData = async () => {
  const res = await getSupplier({});
  supplierList.value = res.data;
};
const getUnitData = async () => {
  const res = await getInRecordUnit({});
  unitList.value = res.data;
};
// 获取下拉框数据
const getSelectData = async () => {
  try {
    const res = await getWarehouseInfoNoPage({});
    materialNameList.value = res.data.data;
  } catch (error) {
    console.log("🚀 ~ getSelectData ~ error:", error);
  }
};
// 获取下拉框数据 类型
const getSelectDataType = async () => {
  try {
    const res = await getOutRecordType({});
    typeList.value = res.data;
  } catch (error) {
    console.log("🚀 ~ getSelectData ~ error:", error);
  }
};
const resetForm = () => {
  addFormRef.value?.resetFields();

  Object.assign(form, {
    materialName: null,
    supplier: null,
    unit: null,
    createTime: null,
    validDate: null,
    reorderLevel: "",
    totalCost: "",
    rsvInfo: "",
    code: "",
  });

  currentSelect.value = {};
  createTimeSelect.value = null;
  validTimeSelect.value = null;
};

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      resetForm();
    }
  }
);

onMounted(() => {
  getSupplierData();
  getUnitData();
  getSelectData();
  getSelectDataType();
});
</script>
