<template>
  <div class="remote-consultation">
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline" :model="formRef" class="search-form">
        <a-form-item :label="$t('labelText.wareHouse.label')">
          <a-select
            style="width: 200px"
            :placeholder="$t('public.select')"
            v-model:value="form.materialName"
            show-search
          >
            <a-select-option v-for="item in materialNameList" :key="item.id" :value="item.materialName">
              {{ item.materialName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :label="$t('public.date')">
          <a-date-picker
            v-model:value="form.createTime"
            style="width: 100%"
            :format="dateFormat"
            :placeholder="t('public.select') + t('public.date')"
            @change="dateChange"
          />
        </a-form-item>
        <a-form-item :label="$t('public.type')">
          <a-select style="width: 200px" :placeholder="$t('public.select')" v-model:value="form.type" show-search>
            <a-select-option v-for="item in typeList" :key="item.id" :value="item.name">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <div class="search-actions">
          <a-button type="primary" @click="handleSearch">{{ $t("public.search") }}</a-button>
          <a-button style="margin-left: 20px" @click="handleReset">{{ $t("public.reset") }}</a-button>
        </div>
      </a-form>
    </a-card>
    <a-card>
      <div style="margin-bottom: 20px; display: flex; justify-content: flex-end; align-items: center">
        <a-button
          style="margin-right: 20px; background-color: #52ae7b; color: #fff"
          type="primary"
          @click="addModal = true"
        >
          {{ $t("public.add") }}
        </a-button>
        <a-button style="background-color: #52ae7b; color: #fff" type="primary" @click="exportMethod">
          {{ $t("public.export") }}
        </a-button>
      </div>
      <a-table
        class="ant-table-striped"
        bordered
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        row-key="id"
        @change="changePage"
        :scroll="{ y: 470, x: 'max-content' }"
        :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == 'status'">
            <a-tag :color="record.status == 1 ? 'processing' : 'error'">
              {{ record.status == 1 ? t("public.enable") : t("public.disable") }}
            </a-tag>
          </template>
          <template v-if="column.key == 'type'">
            <a-tag :color="typeListMapColor[record.type]">{{ typeListMap[record.type] }}</a-tag>
          </template>
          <template v-if="column.key == 'activate'">
            <a-tag :color="record.activate == 1 ? 'processing' : 'error'">
              {{ record.activate == 1 ? t("public.enable") : t("public.disable") }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
  <!-- 新增模态框 -->
  <AddWarehouseModal v-model:visible="addModal" @success="getData" />
</template>

<script setup>
/**
 * ===============================
 * 1. Imports（引入）
 * ===============================
 */
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import AddWarehouseModal from "./components/addModal.vue";

import { getOutRecord, getWarehouseInfoNoPage, getOutRecordType, exportOutRecord } from "@/api/api1";
import { downloadByApi } from "@/utils/down";

/**
 * ===============================
 * 2. 国际化 & 响应式变量
 * ===============================
 */
const { t } = useI18n();

const dataList = ref([]);
const materialNameList = ref([]);
const typeList = ref([]);
const select = ref(null);

const typeListMap = {
  1: "转送",
  2: "损坏",
  3: "正常",
};
const typeListMapColor = {
  1: "blue",
  2: "red",
  3: "green",
};

/**
 * ===============================
 * 3. 搜索表单逻辑
 * ===============================
 */
const formRef = ref(null);
const form = reactive({
  materialName: null,
  createTime: "",
  type: null,
});

const dateFormat = "YYYY-MM-DD";
const dateChange = (date, dateString) => {
  select.value = dateString;
};

// 查询
const handleSearch = () => {
  getData();
};

// 重置
const handleReset = () => {
  form.materialName = null;
  form.createTime = "";
  getData();
};

/**
 * ===============================
 * 4. 表格列配置 & 分页
 * ===============================
 */
const columns = computed(() => [
  { title: t("public.index"), dataIndex: "index", key: "index", align: "center", width: 80 },
  {
    title: t("public.date"),
    dataIndex: "createTime",
    key: "createTime",
    align: "center",
    width: 200,
  },
  {
    title: t("wareHouseTableHeader.materialName"),
    dataIndex: "materialName",
    key: "materialName",
    align: "center",
    width: 200,
  },
  {
    title: t("wareHouseTableHeader.unit"),
    dataIndex: "unit",
    key: "unit",
    align: "center",
    width: 200,
  },
  {
    title: t("public.type"),
    dataIndex: "type",
    key: "type",
    align: "center",
    width: 200,
  },
  { title: t("wareHouseTableHeader.goTo"), dataIndex: "giver", key: "giver", align: "center", width: 120 },
  {
    title: t("wareHouseTableHeader.totalNumber"),
    dataIndex: "shipNumber",
    key: "shipNumber",
    align: "center",
    width: 100,
  },
  {
    title: t("wareHouseTableHeader.rsvInfo"),
    dataIndex: "rsvInfo",
    key: "rsvInfo",
    align: "center",
    width: 100,
  },
]);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `${t("public.total")} ${total} ${t("public.records")}`,
});

const changePage = (pgn) => {
  pagination.current = pgn.current;
  pagination.pageSize = pgn.pageSize;
  getData();
};

/**
 * ===============================
 * 5. 数据获取接口
 * ===============================
 */

// 获取列表数据
const getData = async () => {
  const params = {
    materialName: form.materialName,
    createTime: select.value,
    type: form.type,
    currentPage: pagination.current,
    pageSize: pagination.pageSize,
  };
  try {
    const res = await getOutRecord(params);

    dataList.value = res.data.data;
    // 增加序号
    dataList.value = res.data.data.map((item, index) => {
      return {
        ...item,
        index: index + 1,
      };
    });

    pagination.total = res.data.total;
  } catch (error) {
    console.log("🚀 getUserData error:", error);
  }
};
// 获取下拉框数据 物料
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

const addModal = ref(false);

const exportMethod = async () => {
  await downloadByApi(exportOutRecord, { materialName: form.materialName, createTime: select.value, type: form.type });
};

/**
 * ===============================
 * 7. 生命周期
 * ===============================
 */
onMounted(() => {
  getData();
  getSelectData();
  getSelectDataType();
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

.table-footer {
  display: flex;
  justify-content: flex-end; /* 靠右，可换成 space-between */
  align-items: center;
  gap: 24px; /* 每个统计项之间的间距 */
  font-size: 14px;
  color: #333;
  background: #fafafa; /* 可选，让底部更清晰 */
}

.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
