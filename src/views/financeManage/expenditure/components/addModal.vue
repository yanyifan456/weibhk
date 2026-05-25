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
        <a-col :span="12">
          <a-form-item :label="t('payOutTableHeader.payTime')" name="tradeTime">
            <a-date-picker
              v-model:value="form.tradeTime"
              style="width: 100%"
              :format="dateFormat"
              :placeholder="t('public.select') + t('public.date')"
              @change="tradeTimeDateChange"
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item :label="t('payOutTableHeader.category')" name="tradeClass">
            <a-select v-model:value="form.tradeClass" :placeholder="t('public.select')">
              <a-select-option v-for="item in tradeClassList" :key="item.id" :value="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item :label="t('payOutTableHeader.receiver')" name="tradeStaff">
            <a-select v-model:value="form.tradeStaff" :placeholder="t('public.select')">
              <a-select-option v-for="item in tradeStaffList" :key="item.id" :value="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item :label="t('payOutTableHeader.paymentMethod')" name="payType">
            <a-select v-model:value="form.payType" :placeholder="t('public.select')">
              <a-select-option v-for="item in payTypeList" :key="item.id" :value="item.payby">
                {{ item.payby }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item :label="t('payOutTableHeader.amount')" name="paidFee">
            <a-input v-model:value="form.paidFee" :placeholder="t('public.input')" />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item :label="t('wareHouseTableHeader.rsvInfo')" name="rsvInfo">
            <a-input v-model:value="form.rsrvInfo" :placeholder="t('public.input')" />
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
import { addExpenseBill, getPaymentMode } from "@/api/api1";

const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(["update:visible", "success"]);
const { t } = useI18n();

const addFormRef = ref(null);
const loading = ref(false);

const dateFormat = "YYYY-MM-DD";
const form = reactive({
  tradeTime: "",
  tradeClass: null,
  payType: null,
  paidFee: "",
  rsrvInfo: "",
  tradeStaff: null,
});

const tradeClassList = ref([{ id: 1, name: "耗材" }]);
const tradeStaffList = ref([{ id: 1, name: "刘信通" }]);
const payTypeList = ref([]);

const rules = {
  tradeTime: [{ required: true, message: t("public.select"), trigger: "change" }],
  tradeClass: [{ required: true, message: t("public.select"), trigger: "change" }],
  tradeStaff: [{ required: true, message: t("public.select"), trigger: "change" }],
  payType: [{ required: true, message: t("public.select"), trigger: "change" }],
  paidFee: [{ required: true, message: t("public.input"), trigger: "blur" }],
};
const currentSelect = ref({});
const changeSelect = (value, options) => {
  currentSelect.value = materialNameList.value.find((item) => item.id === options.key);
  console.log("🚀 ~ changeSelect ~ currentSelect:", currentSelect.value);
};

const tradeTimeSelect = ref(null);
const tradeTimeDateChange = (date, dateString) => {
  tradeTimeSelect.value = dateString;
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
    params.tradeTime = tradeTimeSelect.value;

    const res = await addExpenseBill(params);

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

const resetForm = () => {
  addFormRef.value?.resetFields();

  Object.assign(form, {
    materialName: null,
    supplier: null,
    unit: null,
    tradeTime: null,
    validDate: null,
    reorderLevel: "",
    totalCost: "",
    rsvInfo: "",
    code: "",
  });

  currentSelect.value = {};
  tradeTimeSelect.value = null;
  validTimeSelect.value = null;
};

const getPayTypeList = async () => {
  const res = await getPaymentMode({});
  payTypeList.value = res.data;
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
  getPayTypeList();
});
</script>
