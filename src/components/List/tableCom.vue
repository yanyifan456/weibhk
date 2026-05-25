<template>
  <a-table class="ant-table-striped" :columns="columns" :data-source="dataSource" :row-class-name="(_record, index) => (index % 2 === 0 ? 'ant-table-row-striped' : '')
    " bordered :loading="props.loading" :scroll="{ y: 600 }" :pagination="pagination" @change="changePage">
    <template #emptyText>
      <div class="empty-text">
        <a-empty description="暂无数据"></a-empty>
      </div>
    </template>
  </a-table>
</template>
<script setup>

import { useI18n } from 'vue-i18n'

// 国际化
const { t } = useI18n()

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  columns: {
    type: Array,
    default: () => [],
  }
});
const emit = defineEmits(["change"]);
const dataSource = reactive([]);
const columns = reactive([]);

watchEffect(() => {
  dataSource.splice(0, dataSource.length, ...props.data);
  columns.splice(0, columns.length, ...props.columns);
});


// 分页相关
const page = reactive({
  total: dataSource.length,
  pageSize: 10,
  current: 1,
});
const pagination = computed(() => ({
  size: 'default',
  current: page.current,
  pageSize: page.pageSize,
  total: page.total,
  pageSizeOptions: ["10", "50", "100", "200"],
  showTotal: (total, range) => `${t('button.total')} ${total} ${t('label.records')}`,
  locale: { items_per_page: "条/页" }
}));
const changePage = (pagination) => {
  page.current = pagination.current;
  page.pageSize = pagination.pageSize;
};
</script>
<style scoped lang="scss">
.ant-table-body {
  scrollbar-width: none;
}
</style>
