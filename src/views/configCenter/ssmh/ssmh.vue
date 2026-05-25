<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px;">
            <a-form layout="inline" :model="searchForm" class="search-form">

                <a-form-item :label="t('verification.phoneNumber')" :validate-status="phoneValidateStatus"
                    :help="phoneHelp">
                    <a-input v-model:value="searchForm.serialNumber" :placeholder="t('verification.enterPhone')"
                        style="width: 200px;" @blur="validatePhone" />
                </a-form-item>

                <a-form-item :label="t('verification.cardType')">
                    <a-select v-model:value="searchForm.cardType" :placeholder="t('verification.selectCardType')"
                        style="width: 200px;" allowClear>
                        <a-select-option v-for="item in certTypeList" :key="item.typeId" :value="item.typeId">
                            {{ item.certName }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item :label="t('verification.verifyStatus')">
                    <a-select v-model:value="searchForm.verifyTag" :placeholder="t('verification.selectVerifyStatus')"
                        style="width: 200px;" allowClear>
                        <a-select-option value="0">{{ t('verification.pending') }}</a-select-option>
                        <a-select-option value="1">{{ t('verification.approved') }}</a-select-option>
                        <a-select-option value="2">{{ t('verification.rejected') }}</a-select-option>
                    </a-select>
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
                    :scroll="{ x: 1600, y: 470 }" bordered class="patient-table" @change="handleTableChange"
                    :loading="loading">

                    <template #bodyCell="{ column, record }">
                        <!-- 证件照正面 -->
                        <template v-if="column.key === 'cardfilefUrl'">
                            <a-image v-if="record.cardfilefUrl" :src="record.cardfilefUrl" :width="60" :height="40"
                                style="object-fit: cover; cursor: pointer;" />
                            <span v-else>-</span>
                        </template>

                        <!-- 证件照反面 -->
                        <template v-if="column.key === 'cardfilebUrl'">
                            <a-image v-if="record.cardfilebUrl" :src="record.cardfilebUrl" :width="60" :height="40"
                                style="object-fit: cover; cursor: pointer;" />
                            <span v-else>-</span>
                        </template>

                        <!-- 审核状态 -->
                        <template v-if="column.key === 'verifyTag'">
                            <a-tag :color="getVerifyTagColor(record.verifyTag)">
                                {{ getVerifyTagText(record.verifyTag) }}
                            </a-tag>
                        </template>

                        <!-- 操作列 -->
                        <template v-if="column.key === 'action'">
                            <a-space v-if="record.verifyTag == '待审核'">
                                <a-button type="link" size="small" style="color: #52c41a;"
                                    @click="handleVerify(record, '1')">
                                    {{ t('verification.approve') }}
                                </a-button>
                                <a-button type="link" size="small" danger @click="handleVerify(record, '2')">
                                    {{ t('verification.reject') }}
                                </a-button>
                            </a-space>
                        </template>
                    </template>

                </a-table>
            </div>
        </a-card>

        <!-- 审核原因弹窗 -->
        <a-modal v-model:open="reasonModalVisible"
            :title="currentVerifyTag === '1' ? t('verification.approveTitle') : t('verification.rejectTitle')"
            @ok="handleReasonSubmit" @cancel="handleReasonCancel"
            :okButtonProps="{ disabled: !reasonForm.verityReason || !reasonForm.verityReason.trim() }">
            <a-form :model="reasonForm" layout="vertical">
                <a-form-item :label="t('verification.verifyReason')" required>
                    <a-textarea v-model:value="reasonForm.verityReason" :placeholder="t('verification.enterReason')"
                        :rows="4" :maxlength="200" showCount />
                </a-form-item>
            </a-form>
        </a-modal>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { listCertType, midDocumentVerification, update } from "@/api/yyf.js";
const { t } = useI18n();

// ==================== 查询表单 ====================
const searchForm = reactive({
    serialNumber: "",
    cardType: undefined,
    verifyTag: undefined,
});

// ==================== 手机号校验 ====================
const phoneValidateStatus = ref("");
const phoneHelp = ref("");

const validatePhone = () => {
    const phone = searchForm.serialNumber;
    if (!phone) {
        phoneValidateStatus.value = "";
        phoneHelp.value = "";
        return true;
    }
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
        phoneValidateStatus.value = "error";
        phoneHelp.value = t('verification.invalidPhone');
        return false;
    }
    phoneValidateStatus.value = "success";
    phoneHelp.value = "";
    return true;
};

// ==================== 证件类型下拉列表 ====================
const certTypeList = ref([]);

const fetchCertTypeList = async () => {
    try {
        const res = await listCertType({})
        if (res.code === "200") {
            certTypeList.value = res.data.data || [];
        }
    } catch (error) {
        console.error(t('verification.getCertTypeFailed'), error);
    }
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
    showTotal: (total) => t('verification.total', { total }),
});

// 列定义
const columns = computed(() => [
    { title: t('verification.userPhone'), dataIndex: "telphone", key: "telphone", align: "center", width: 140 },
    { title: t('verification.cardNumber'), dataIndex: "cardId", key: "cardId", align: "center", width: 200 },
    { title: t('verification.cardType'), dataIndex: "cardType", key: "cardType", align: "center", width: 120 },
    { title: t('verification.cardFront'), dataIndex: "cardfilefUrl", key: "cardfilefUrl", align: "center", width: 120 },
    { title: t('verification.cardBack'), dataIndex: "cardfilebUrl", key: "cardfilebUrl", align: "center", width: 120 },
    { title: t('verification.verifyStatus'), dataIndex: "verifyTag", key: "verifyTag", align: "center", width: 100 },
    { title: t('verification.createTime'), dataIndex: "createTime", key: "createTime", align: "center", width: 180 },
    { title: t('verification.verifyTime'), dataIndex: "verityTime", key: "verityTime", align: "center", width: 180 },
    { title: t('verification.verifyReason'), dataIndex: "verityReason", key: "verityReason", align: "center", width: 160 },
    { title: t('verification.operation'), key: "action", align: "center", width: 150, fixed: "right" },
]);

// 获取表格数据
const fetchTableData = async () => {
    if (searchForm.serialNumber && !validatePhone()) {
        return;
    }
    loading.value = true;
    try {
        const params = {
            telphone: searchForm.serialNumber || "",
            cardType: searchForm.cardType || "",
            verifyTag: searchForm.verifyTag ?? "",
            pageSize: String(pagination.pageSize),
            pageNum: String(pagination.current),
        };
        const res = await midDocumentVerification(params)
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

// ==================== 审核状态处理 ====================
const getVerifyTagText = (tag) => {
    const map = {
        "待审核": t('verification.pending'),
        "审核通过": t('verification.approved'),
        "审核未通过": t('verification.rejected'),
        "0": t('verification.pending'),
        "1": t('verification.approved'),
        "2": t('verification.rejected')
    };
    return map[tag] || tag || "-";
};

const getVerifyTagColor = (tag) => {
    const map = {
        "待审核": "orange", "审核通过": "green", "审核未通过": "red",
        "0": "orange", "1": "green", "2": "red"
    };
    return map[tag] || "default";
};

// ==================== 审核操作 ====================
const reasonModalVisible = ref(false);
const currentVerifyTag = ref("");
const currentRecord = ref(null);
const reasonForm = reactive({
    verityReason: "",
});

const handleVerify = (record, verifyTag) => {
    currentRecord.value = record;
    currentVerifyTag.value = verifyTag;
    reasonForm.verityReason = "";
    reasonModalVisible.value = true;
};

const handleReasonCancel = () => {
    reasonModalVisible.value = false;
    reasonForm.verityReason = "";
    currentRecord.value = null;
    currentVerifyTag.value = "";
};

const handleReasonSubmit = async () => {

    if (!reasonForm.verityReason || !reasonForm.verityReason.trim()) {
        message.warning(t('verification.reasonRequired'));
        return;
    }
    try {
        const params = {
            id: String(currentRecord.value.id),
            verityReason: reasonForm.verityReason.trim(),
            verifyTag: currentVerifyTag.value,
            userName: currentRecord.value.userName || "",
            telphone: currentRecord.value.telphone || "",
            cardId: currentRecord.value.cardId || "",
            front: currentRecord.value.cardfilefUrl || "",
            back: currentRecord.value.cardfilebUrl || "",
        };
        const res = await update(params)
        if (res.code === "200") {
            message.success(currentVerifyTag.value === "1" ? t('verification.approveSuccess') : t('verification.rejectSuccess'));
            reasonModalVisible.value = false;
            reasonForm.verityReason = "";
            currentRecord.value = null;
            currentVerifyTag.value = "";
            // 刷新列表
            fetchTableData();
        } else {
            message.error(res.msg || t('verification.operationFailed'));
        }
    } catch (error) {
        console.error(t('verification.operationFailed'), error);
        message.error(t('verification.operationFailed'));
    }
};

// ==================== 查询 / 重置 / 分页 ====================
const handleSearch = () => {
    if (searchForm.serialNumber && !validatePhone()) {
        return;
    }
    pagination.current = 1;
    fetchTableData();
};

const handleReset = () => {
    searchForm.serialNumber = "";
    searchForm.cardType = undefined;
    searchForm.verifyTag = undefined;
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
    fetchCertTypeList();
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