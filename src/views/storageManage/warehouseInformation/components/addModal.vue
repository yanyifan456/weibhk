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
        <!-- 左列：物料名称 -->
        <a-col :span="12">
          <a-form-item :label="t('labelText.wareHouse.label')" name="materialName">
            <a-input v-model:value="form.materialName" :placeholder="t('public.input')" />
          </a-form-item>
        </a-col>

        <!-- 右列：单位售价 -->
        <a-col :span="12">
          <a-form-item :label="t('wareHouseTableHeader.unitPrice')" name="unitPrice">
            <a-input v-model:value="form.unitPrice" :placeholder="t('public.input')" style="width: 100%" />
          </a-form-item>
        </a-col>

        <!-- 左列：供应商 -->
        <a-col :span="12">
          <a-form-item :label="t('wareHouseTableHeader.supplier')" name="supplier">
            <a-select :placeholder="$t('public.select')" v-model:value="form.supplier">
              <a-select-option v-for="item in supplierList" :key="item.id" :value="item.companyName">
                {{ item.companyName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- 右列：单位 -->
        <a-col :span="12">
          <a-form-item :label="t('wareHouseTableHeader.unit')" name="unit">
            <a-select :placeholder="$t('public.select')" v-model:value="form.unit">
              <a-select-option v-for="item in unitList" :key="item.id" :value="item.unitChi">
                {{ item.unitChi }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- 左列：有效期 -->
        <a-col :span="12">
          <a-form-item :label="t('wareHouseTableHeader.validDate')" name="validDate">
            <a-date-picker
              v-model:value="form.validDate"
              style="width: 100%"
              :format="dateFormat"
              :placeholder="t('public.select') + t('public.date')"
              @change="dateChange"
            />
          </a-form-item>
        </a-col>

        <!-- 右列：订货水平 -->
        <a-col :span="12">
          <a-form-item :label="t('wareHouseTableHeader.reorderLevel')" name="reorderLevel">
            <a-input v-model:value="form.reorderLevel" :placeholder="t('public.input')" style="width: 100%" />
          </a-form-item>
        </a-col>

        <!-- 左列：备注 -->
        <a-col :span="12">
          <a-form-item :label="t('wareHouseTableHeader.rsvInfo')" name="rsvInfo">
            <a-input v-model:value="form.rsvInfo" :placeholder="t('public.input')" />
          </a-form-item>
        </a-col>

        <!-- 右列：启用状态 -->
        <a-col :span="12">
          <a-form-item :label="t('wareHouseTableHeader.activate')" name="activate">
            <a-switch v-model:checked="form.activate" />
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
import { onMounted, reactive, ref, watch } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { addWarehouseInfo, getSupplier, getUnit } from "@/api/api1";
import dayjs from "dayjs";

const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(["update:visible", "success"]);

const { t } = useI18n();

const addFormRef = ref(null);
const loading = ref(false);

const dateFormat = "YYYY-MM-DD";
const form = reactive({
  materialName: "",
  unitPrice: "",
  supplier: null,
  unit: null,
  validDate: null,
  reorderLevel: "",
  rsvInfo: "",
  activate: true,
});
const select = ref(null);

const rules = {
  materialName: [{ required: true, message: t("public.input"), trigger: "blur" }],
  unitPrice: [{ required: true, message: t("public.input"), trigger: "blur" }],
  supplier: [{ required: true, message: t("public.select"), trigger: "change" }],
  unit: [{ required: true, message: t("public.select"), trigger: "change" }],
  validDate: [{ required: true, message: t("public.select"), trigger: "change" }],
  reorderLevel: [{ required: true, message: t("public.input"), trigger: "blur" }],
  rsvInfo: [{ required: false, message: t("public.input"), trigger: "blur" }],
};
const dateChange = (date, dateString) => {
  select.value = dateString;
};
const handleSubmit = async () => {
  try {
    // 校验表单
    const valid = await addFormRef.value.validate();
    if (!valid) return;

    // 提交数据
    loading.value = true;
    const params = { ...form };
    params.validDate = dayjs(select.value).format(dateFormat);
    params.activate = params.activate ? 1 : 0;

    const res = await addWarehouseInfo(params);

    message.success(res.data.message);

    // 关闭弹窗
    emit("update:visible", false);
    emit("success");
  } catch (err) {
    // err 可能来自表单校验，也可能来自接口请求
    if (err?.errorFields) {
      // 表单验证失败
      message.warning(t("public.checkForm"));
    } else {
      // 接口请求失败
      message.error(err.message || t("public.add") + "失败");
    }
  } finally {
    loading.value = false;
  }
};

const unitList = ref([]);
const supplierList = ref([]);

// 获取选择框数据
// == 获取供应商
const getSupplierData = async () => {
  try {
    const res = await getSupplier({});
    supplierList.value = res.data;
  } catch (error) {
    console.error("获取供应商失败:", error);
  }
};
// == 获取单位
const getUnitData = async () => {
  try {
    const res = await getUnit({});
    unitList.value = res.data;
  } catch (error) {
    console.log("🚀 ~ getUnitData ~ error:", error);
  }
};

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      resetForm();
    }
  }
);
const resetForm = () => {
  addFormRef.value?.resetFields(); // antd 自带，自动清空校验 + 还原初始值

  Object.assign(form, {
    materialName: "",
    unitPrice: "",
    supplier: null,
    unit: null,
    validDate: null,
    reorderLevel: "",
    rsvInfo: "",
    activate: true,
  });

  select.value = null;
};

onMounted(() => {
  getSupplierData();
  getUnitData();
});
</script>

<style scoped></style>
