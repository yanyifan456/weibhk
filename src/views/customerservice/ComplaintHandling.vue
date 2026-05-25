<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px;">
            <a-form layout="inline" :model="searchForm" class="search-form">

                <a-form-item :label="t('feedback.contactPhone')" :validate-status="phoneValidateStatus"
                    :help="phoneHelp">
                    <a-input v-model:value="searchForm.contactPhone" :placeholder="t('feedback.enterPhone')"
                        style="width: 200px;" @blur="validatePhone" allowClear />
                </a-form-item>

                <a-form-item :label="t('feedback.dealTag')">
                    <a-select v-model:value="searchForm.dealTag" :placeholder="t('feedback.selectDealTag')"
                        style="width: 200px;" allowClear>
                        <a-select-option value="0">{{ t('feedback.pending') }}</a-select-option>
                        <a-select-option value="1">{{ t('feedback.processed') }}</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item :label="t('feedback.feedUser')">
                    <a-input v-model:value="searchForm.feedUser" :placeholder="t('feedback.enterFeedUser')"
                        style="width: 200px;" allowClear />
                </a-form-item>

                <a-form-item :label="t('feedback.startTime')">
                    <a-date-picker v-model:value="searchForm.startTime" :placeholder="t('feedback.selectStartTime')"
                        style="width: 200px;" valueFormat="YYYY-MM-DD" />
                </a-form-item>

                <a-form-item :label="t('feedback.endTime')">
                    <a-date-picker v-model:value="searchForm.endTime" :placeholder="t('feedback.selectEndTime')"
                        style="width: 200px;" valueFormat="YYYY-MM-DD" />
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
                <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id"
                    :scroll="{ x: 1400, y: 470 }" bordered class="patient-table" @change="handleTableChange"
                    :loading="loading">

                    <template #bodyCell="{ column, record }">
                        <!-- 反馈类型 -->
                        <template v-if="column.key === 'feedbackType'">
                            <a-tag :color="getFeedbackTypeColor(record.feedbackType)">
                                {{ getFeedbackTypeText(record.feedbackType) }}
                            </a-tag>
                        </template>

                        <!-- 描述图片 -->
                        <template v-if="column.key === 'discPhoto'">
                            <a-image v-if="record.discPhoto" :src="record.discPhoto" :width="60" :height="40"
                                style="object-fit: cover; cursor: pointer;" />
                            <span v-else>-</span>
                        </template>

                        <!-- 处理状态 -->
                        <template v-if="column.key === 'dealTag'">
                            <a-tag :color="getDealTagColor(record.dealTag)">
                                {{ getDealTagText(record.dealTag) }}
                            </a-tag>
                        </template>

                        <!-- 操作列 -->
                        <template v-if="column.key === 'action'">
                            <a-button v-if="record.dealTag === '0'" type="link" size="small" style="color: #52c41a;"
                                @click="handleProcess(record)">
                                {{ t('feedback.process') }}
                            </a-button>
                            <span v-else>-</span>
                        </template>
                    </template>

                </a-table>
            </div>
        </a-card>

        <!-- 处理确认弹窗 -->
        <a-modal v-model:open="processModalVisible" :title="t('feedback.processConfirmTitle')" @ok="handleProcessSubmit"
            @cancel="handleProcessCancel">
            <p>{{ t('feedback.processConfirmContent') }}</p>
        </a-modal>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { updatefeedback, selectmidfeedbacklist } from "@/api/yyf.js";

const { t } = useI18n();

// ==================== 查询表单 ====================
const searchForm = reactive({
    contactPhone: "",
    dealTag: undefined,
    feedUser: "",
    startTime: null,
    endTime: null,
});

// ==================== 手机号校验 ====================
const phoneValidateStatus = ref("");
const phoneHelp = ref("");

const validatePhone = () => {
    const phone = searchForm.contactPhone;
    if (!phone) {
        phoneValidateStatus.value = "";
        phoneHelp.value = "";
        return true;
    }
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
        phoneValidateStatus.value = "error";
        phoneHelp.value = t('feedback.invalidPhone');
        return false;
    }
    phoneValidateStatus.value = "success";
    phoneHelp.value = "";
    return true;
};

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
    showTotal: (total) => t('feedback.total', { total }),
});

// 列定义
const columns = computed(() => [
    { title: t('feedback.feedbackType'), dataIndex: "feedbackType", key: "feedbackType", align: "center", width: 120 },
    { title: t('feedback.disc'), dataIndex: "disc", key: "disc", align: "center", width: 200, ellipsis: true },
    { title: t('feedback.discPhoto'), dataIndex: "discPhoto", key: "discPhoto", align: "center", width: 120 },
    { title: t('feedback.contactPhone'), dataIndex: "contactPhone", key: "contactPhone", align: "center", width: 140 },
    { title: t('feedback.feedUser'), dataIndex: "feedUser", key: "feedUser", align: "center", width: 120 },
    { title: t('feedback.feedTime'), dataIndex: "feedTime", key: "feedTime", align: "center", width: 140 },
    { title: t('feedback.dealTag'), dataIndex: "dealTag", key: "dealTag", align: "center", width: 100 },
    { title: t('feedback.updateTime'), dataIndex: "updateTime", key: "updateTime", align: "center", width: 160 },
    { title: t('feedback.operation'), key: "action", align: "center", width: 100, fixed: "right" },
]);

// 校验时间范围
const validateTimeRange = () => {
    if (!searchForm.startTime && !searchForm.endTime) {
        return true;
    }
    if (searchForm.startTime && searchForm.endTime) {
        if (searchForm.endTime < searchForm.startTime) {
            message.error('开始时间不能大于结束时间');
            return false;
        }
    }
    return true;
};

// 获取表格数据
const fetchTableData = async () => {
    if (searchForm.contactPhone && !validatePhone()) {
        return;
    }
    if (!validateTimeRange()) {
        return;
    }
    loading.value = true;
    try {
        const params = {
            contactPhone: searchForm.contactPhone || "",
            dealTag: searchForm.dealTag ?? "",
            feedUser: searchForm.feedUser || "",
            startTime: searchForm.startTime || "",
            endTime: searchForm.endTime || "",
            pageSize: pagination.pageSize,
            pageNum: pagination.current,
        };
        const res = await selectmidfeedbacklist(params);
        if (res.code === "200") {
            tableData.value = res.data.data || [];
            pagination.total = res.data.total || 0;
        } else {
            message.error(res.msg || t('feedback.queryFailed'));
        }
    } catch (error) {
        console.error(t('feedback.queryFailed'), error);
        message.error(t('feedback.queryFailed'));
    } finally {
        loading.value = false;
    }
};

// ==================== 反馈类型处理 ====================
const getFeedbackTypeText = (type) => {
    const map = {
        "1": t('feedback.typeDoctorIssue'),
        "2": t('feedback.typePaymentIssue'),
        "3": t('feedback.typeSystemIssue'),
        "4": t('feedback.typeOther'),
    };
    return map[type] || type || "-";
};

const getFeedbackTypeColor = (type) => {
    const map = {
        "1": "blue",
        "2": "gold",
        "3": "red",
        "4": "default",
    };
    return map[type] || "default";
};

// ==================== 处理状态处理 ====================
const getDealTagText = (tag) => {
    const map = {
        "0": t('feedback.pending'),
        "1": t('feedback.processed'),
    };
    return map[tag] || tag || "-";
};

const getDealTagColor = (tag) => {
    const map = {
        "0": "orange",
        "1": "green",
    };
    return map[tag] || "default";
};

// ==================== 处理操作 ====================
const processModalVisible = ref(false);
const currentRecord = ref(null);

const handleProcess = (record) => {
    currentRecord.value = record;
    processModalVisible.value = true;
};

const handleProcessCancel = () => {
    processModalVisible.value = false;
    currentRecord.value = null;
};

const handleProcessSubmit = async () => {
    try {
        const params = {
            id: currentRecord.value.id,
            dealTag: "1",
        };
        const res = await updatefeedback(params);
        if (res.code === "200") {
            message.success(t('feedback.processSuccess'));
            processModalVisible.value = false;
            currentRecord.value = null;
            // 刷新列表
            fetchTableData();
        } else {
            message.error(res.msg || t('feedback.operationFailed'));
        }
    } catch (error) {
        console.error(t('feedback.operationFailed'), error);
        message.error(t('feedback.operationFailed'));
    }
};

// ==================== 查询 / 重置 / 分页 ====================
const handleSearch = () => {
    if (searchForm.contactPhone && !validatePhone()) {
        return;
    }
    if (!validateTimeRange()) {
        return;
    }
    pagination.current = 1;
    fetchTableData();
};

const handleReset = () => {
    searchForm.contactPhone = "";
    searchForm.dealTag = undefined;
    searchForm.feedUser = "";
    searchForm.startTime = null;
    searchForm.endTime = null;
    phoneValidateStatus.value = "";
    phoneHelp.value = "";
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