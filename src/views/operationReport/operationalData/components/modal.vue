<template>
  <a-modal
    :open="visible"
    @update:open="$emit('update:visible', $event)"
    @cancel="$emit('update:visible', false)"
    :title="t('public.trade') + t('public.detail')"
    width="500px"
    :destroyOnClose="true"
  >
    <a-range-picker
      ref="rangePickerRef"
      v-model:value="dateRange"
      style="width: 100%"
      :disabled-date="disabledDate"
      :format="dateFormat"
      :open="isRangePicker"
      @focus="isRangePicker = true"
      @blur="isRangePicker = false"
    >
      <template #renderExtraFooter>
        <a-button style="margin-right: 20px" @click="setRecent('week')">最近一周</a-button>
        <a-button style="margin-right: 20px" @click="setRecent('month')">最近一月</a-button>
        <a-button @click="setRecent('quarter')">最近三个月</a-button>
      </template>
    </a-range-picker>

    <template #footer>
      <a-button @click="$emit('update:visible', false)">{{ t("public.cancel") }}</a-button>
      <a-button type="primary" :loading="loading" @click="handleSubmit">
        {{ t("public.export") }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup>
import dayjs from "dayjs";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { downloadByApi } from "@/utils/down";
import { printTradeDetail } from "@/api/api1.js";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["update:visible", "success"]);
const { t } = useI18n();

const dateFormat = "YYYY-MM-DD";
const loading = ref(false);
const dateRange = ref([]);
const rangePickerRef = ref(null);
const isRangePicker = ref(false);
// 不能选未来日期
const disabledDate = (current) => current && current > dayjs().endOf("day");

// 最近一周 / 一月 / 三个月
const setRecent = (type) => {
  const end = dayjs();
  let start;

  switch (type) {
    case "week":
      start = end.subtract(7, "day");
      break;
    case "month":
      start = end.subtract(1, "month");
      break;
    case "quarter":
      start = end.subtract(3, "month");
      break;
  }

  dateRange.value = [start, end];
  isRangePicker.value = false;
};

const handleSubmit = async () => {
  if (dateRange.value.length !== 2) {
    message.warning("请选择时间范围");
    return;
  }

  const params = {
    startTime: dateRange.value[0].format(dateFormat),
    endTime: dateRange.value[1].format(dateFormat),
  };

  console.log("提交参数：", params);

  emit("update:visible", false);
  await downloadByApi(printTradeDetail, params);
};
watch(
  () => props.visible,
  (val) => {
    if (!val) {
      // 弹窗关闭时清空数据
      dateRange.value = [];
      isRangePicker.value = false;
    }
  }
);
</script>
