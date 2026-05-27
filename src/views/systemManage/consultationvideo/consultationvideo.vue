<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px;">
            <a-form layout="inline" :model="searchForm" class="search-form">

                <a-form-item label="患者姓名">
                    <a-input v-model:value="searchForm.userName" placeholder="請輸入患者姓名" style="width: 200px;"
                        allowClear />
                </a-form-item>

                <a-form-item label="醫生姓名">
                    <a-input v-model:value="searchForm.doctorName" placeholder="請輸入醫生姓名" style="width: 200px;"
                        allowClear />
                </a-form-item>

                <a-form-item label="開始時間">
                    <a-date-picker v-model:value="searchForm.startTimePicker" show-time format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss" placeholder="請選擇開始時間" style="width: 200px;"
                        @change="(val) => searchForm.startTime = val || ''" />
                </a-form-item>

                <a-form-item label="結束時間">
                    <a-date-picker v-model:value="searchForm.endTimePicker" show-time format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss" placeholder="請選擇結束時間" style="width: 200px;"
                        @change="(val) => searchForm.endTime = val || ''" />
                </a-form-item>

                <a-form-item class="search-actions">
                    <a-button type="primary" @click="handleSearch">
                        {{ t('button.search') }}
                    </a-button>

                    <a-button style="margin-left: 8px;" @click="handleReset">
                        {{ t('button.reset') }}
                    </a-button>
                </a-form-item>

            </a-form>
        </a-card>

        <!-- 数据表格 -->
        <a-card>
            <div class="table-wrapper">
                <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="orderId"
                    :scroll="{ x: 1400, y: 470 }" bordered class="patient-table" @change="handleTableChange"
                    :loading="loading">

                    <template #bodyCell="{ column, record }">
                        <!-- 录制文件链接 -->
                        <template v-if="column.key === 'fileUrl'">
                            <a v-if="record.fileUrl" :href="record.fileUrl" target="_blank"
                                style="word-break: break-all;">
                                {{ record.fileUrl }}
                            </a>
                            <span v-else>-</span>
                        </template>

                        <!-- 时长（秒） -->
                        <template v-if="column.key === 'duration'">
                            <span>{{ record.duration != null ? record.duration + ' 秒' : '-' }}</span>
                        </template>

                        <!-- 录制状态 -->
                        <template v-if="column.key === 'status'">
                            <a-tag :color="getStatusColor(record.status)">
                                {{ getStatusText(record.status) }}
                            </a-tag>
                        </template>
                    </template>

                </a-table>
            </div>
        </a-card>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { videolist } from "@/api/yyf.js";
const { t } = useI18n();

// ==================== 查询表单 ====================
const searchForm = reactive({
    userName: "",
    doctorName: "",
    startTime: "",
    endTime: "",
    startTimePicker: null,
    endTimePicker: null,
});

// ==================== 表格数据 ====================
const loading = ref(false);
const tableData = ref([]);

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: (total) => t('verification.total', { total }),
});

// 列定义
const columns = computed(() => [
    { title: '訂單號', dataIndex: "orderId", key: "orderId", align: "center", width: 180, fixed: "left" },
    { title: '患者姓名', dataIndex: "userName", key: "userName", align: "center", width: 120 },
    { title: '醫生姓名', dataIndex: "doctorName", key: "doctorName", align: "center", width: 120 },
    { title: '錄製文件', dataIndex: "fileUrl", key: "fileUrl", align: "center", width: 260 },
    { title: '開始時間', dataIndex: "startTime", key: "startTime", align: "center", width: 180 },
    { title: '結束時間', dataIndex: "endTime", key: "endTime", align: "center", width: 180 },
    { title: '時長', dataIndex: "duration", key: "duration", align: "center", width: 100 },
    { title: '狀態', dataIndex: "status", key: "status", align: "center", width: 100 },
]);

// 获取表格数据
const fetchTableData = async () => {
    loading.value = true;
    try {
        const params = {
            pageSize: String(pagination.pageSize),
            pageNum: String(pagination.current),
            userName: searchForm.userName || "",
            doctorName: searchForm.doctorName || "",
            startTime: searchForm.startTime || "",
            endTime: searchForm.endTime || "",
        };
        const res = await videolist(params);
        if (res.code === "200") {
            tableData.value = res.data.data || [];
            pagination.total = res.data.total || 0;
        } else {
            message.error(res.msg || t('verification.queryFailed'));
        }
    } catch (error) {
        console.error(t('verification.queryFailed'), error);
        message.error(t('verification.queryFailed'));
    } finally {
        loading.value = false;
    }
};

// ==================== 状态处理 ====================
const getStatusText = (status) => {
    const map = { 0: '錄製中', 1: '已完成', 2: '失敗' };
    return map[status] ?? '-';
};

const getStatusColor = (status) => {
    const map = { 0: 'processing', 1: 'success', 2: 'error' };
    return map[status] ?? 'default';
};

// ==================== 查询 / 重置 / 分页 ====================
const handleSearch = () => {
    pagination.current = 1;
    fetchTableData();
};

const handleReset = () => {
    searchForm.userName = "";
    searchForm.doctorName = "";
    searchForm.startTime = "";
    searchForm.endTime = "";
    searchForm.startTimePicker = null;
    searchForm.endTimePicker = null;
    pagination.current = 1;
    fetchTableData();
};

const handleTableChange = (pag) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchTableData();
};

// ==================== 初始化 ====================
onMounted(() => {
    fetchTableData();
});
</script>

<style scoped lang="scss">
.search-form {
    display: flex;
    width: 100%;
    align-items: flex-start;
    flex-wrap: wrap;
}

.search-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
}

.remote-consultation {
    padding: 0px 0px 12px;
    box-sizing: border-box;
}

.table-wrapper {
    position: relative;
}
</style>