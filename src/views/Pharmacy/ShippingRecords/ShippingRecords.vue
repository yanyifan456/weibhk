<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px;">
            <a-form layout="inline" class="search-form">
                <!-- 将输入框改为下拉列表，添加药物选择和类型选择 -->
                <a-form-item :label="t('button.yaowu')">
                    <a-select v-model:value="selectedMedicine" :placeholder="t('button.ayaowu')" style="width: 300px;"
                        show-search :filter-option="filterOption" @change="handleMedicineChange">
                        <a-select-option value="" disabled>
                            <strong>{{ t('label.medicineName') }} | {{ t('label.supplierLabel') }} | {{
                                t('label.manufacturerLabel') }}</strong>
                        </a-select-option>
                        <a-select-option v-for="item in medicineList" :key="item.id" :value="item.name">
                            {{ item.name }} | {{ item.supplier }} | {{ item.company }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <!-- 添加类型下拉列表 -->
                <a-form-item :label="t('label.totalQuantitys')">
                    <a-select v-model:value="selectedType" :placeholder="t('placeholder.selectType')"
                        style="width: 200px;" @change="handleTypeChange">
                        <a-select-option value="2">{{ t('type.transfer') }}</a-select-option>
                        <a-select-option value="1">{{ t('type.damaged') }}</a-select-option>
                        <a-select-option value="3">{{ t('type.other') }}</a-select-option>
                    </a-select>
                </a-form-item>

                <!-- 默认当前年月 -->
                <a-form-item :label="t('label.monthSelect')">
                    <a-date-picker v-model:value="selectedMonth" picker="month" format="YYYY-MM" style="width: 200px;"
                        :placeholder="t('placeholder.selectMonth')" @change="handleMonthChange" />
                </a-form-item>

                <a-form-item class="search-actions">
                    <a-button style="margin-left: 8px;" @click="daochu">
                        {{ t('button.daochu') }}
                    </a-button>

                    <a-button type="primary" style="margin-left: 8px;" @click="showAddModal">
                        {{ t('button.Patientadd') }}
                    </a-button>
                </a-form-item>
            </a-form>
        </a-card>

        <a-card>
            <!-- 修改表格列为：日期、药物名称、类型、转送到、总数、备注 -->
            <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id"
                :scroll="{ y: 470 }" bordered class="patient-table" @change="handleTableChange">
            </a-table>
        </a-card>

        <!-- 修改新增弹框字段 -->
        <a-modal v-model:open="addModalVisible" :title="t('button.Patientadd')" width="750px" @ok="handleAddSubmit"
            @cancel="handleAddCancel">
            <a-form :model="addForm" layout="vertical">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item :label="t('label.medicineName')">
                            <a-select v-model:value="addForm.medicineId" :placeholder="t('placeholder.selectMedicine')"
                                show-search :filter-option="filterOption" @change="handleAddMedicineChange">
                                <a-select-option value="" disabled>
                                    <strong>{{ t('label.medicineName') }} | {{ t('label.supplierLabel') }} | {{
                                        t('label.manufacturerLabel') }}</strong>
                                </a-select-option>
                                <a-select-option v-for="item in medicineList" :key="item.id" :value="item.id">
                                    {{ item.name }} | {{ item.supplier }} | {{ item.company }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item :label="t('label.supplier')">
                            <a-input v-model:value="addForm.supplier" :placeholder="t('placeholder.enterSupplier')" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item :label="t('label.manufacturerLabel')">
                            <a-input v-model:value="addForm.company"
                                :placeholder="t('placeholder.enterManufacturer')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item :label="t('label.unit')">
                            <a-input disabled v-model:value="addForm.unit" :placeholder="t('placeholder.enterUnit')" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item :label="t('label.date')">
                            <a-date-picker v-model:value="addForm.createTime" style="width: 100%;"
                                format="YYYY-MM-DD HH:mm:ss" show-time :placeholder="t('placeholder.selectDate')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item :label="t('label.totalQuantitys')">
                            <a-select v-model:value="addForm.type" :placeholder="t('placeholder.selectType')"
                                style="width: 100%;">
                                <a-select-option value="2">{{ t('type.transfer') }}</a-select-option>
                                <a-select-option value="1">{{ t('type.damaged') }}</a-select-option>
                                <a-select-option value="3">{{ t('type.other') }}</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item :label="t('label.totalQuantityss')">
                            <a-input v-model:value="addForm.giver" :placeholder="t('placeholder.enterGiver')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <a-form-item :label="t('label.remarks')">
                            <a-textarea v-model:value="addForm.rsrvInfo" :placeholder="t('placeholder.enterRemarks')"
                                :rows="1" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item :label="t('label.quantity')">
                            <a-input-number v-model:value="addForm.total" style="width: 100%;"
                                :placeholder="t('placeholder.enterQuantity')" />
                        </a-form-item>
                    </a-col>


                </a-row>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { selectMedicineOnlyField, selectMedicineLogList, selectMedicineDetails, insertMedicineLog, ruhuo } from "@/api/yyf";
import dayjs from 'dayjs';


const { t } = useI18n();

const medicineList = ref([]);
const selectedMedicine = ref(undefined);
const selectedType = ref(undefined);

const selectedMonth = ref(dayjs());

const columns = computed(() => [
    { title: t("label.date"), dataIndex: "createTime", key: "createTime", align: "center" },
    { title: t("label.pname"), dataIndex: "name", key: "name", align: "center" },
    { title: t("label.totalQuantitys"), dataIndex: "type", key: "type", align: "center" },
    { title: t("label.totalQuantityss"), dataIndex: "giver", key: "giver", align: "center" },
    { title: t("label.totalQuantity"), dataIndex: "total", key: "total", align: "center" },
    { title: t("label.remarks"), dataIndex: "rsrvInfo", key: "rsrvInfo", align: "center" },
]);

const tableData = ref([]);

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `${t('button.total')} ${total} ${t('label.records')}`
});

const handleTableChange = (paginationConfig) => {
    pagination.current = paginationConfig.current;
    pagination.pageSize = paginationConfig.pageSize;
    fetchMedicineLogList();
};

const addModalVisible = ref(false);

const addForm = reactive({
    medicineId: undefined,
    name: "",
    supplier: "",
    company: "",
    unit: "",
    createTime: null,
    type: undefined,
    giver: "",
    batchId: "",
    total: 0,
    rsrvInfo: ""
});

const filterOption = (input, option) => {
    const text = option.children ? option.children.join('') : '';
    return text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const fetchMedicineList = async () => {
    try {
        const res = await selectMedicineOnlyField({});
        if (res.code === "200" && res.data && res.data.data) {
            medicineList.value = res.data.data;
        }
    } catch (error) {
        message.error(t('error.fetchMedicineList'));
        console.error(error);
    }
};

const handleMedicineChange = () => {
    fetchMedicineLogList();
};

const handleTypeChange = () => {
    fetchMedicineLogList();
};

const handleMonthChange = () => {
    fetchMedicineLogList();
};

const fetchMedicineLogList = async () => {
    if (!selectedMedicine.value || !selectedType.value) {
        return;
    }

    try {
        const params = {
            current: pagination.current,
            pageSize: pagination.pageSize,
            name: selectedMedicine.value,
            createTime: selectedMonth.value ? dayjs(selectedMonth.value).format('YYYY-MM') : "",
            type: "4"
        };

        const res = await selectMedicineLogList(params);
        if (res.code === "200" && res.data) {
            tableData.value = res.data.data || [];
            pagination.total = res.data.total || 0;
        }
    } catch (error) {
        message.error(t('error.fetchMedicineLog'));
        console.error(error);
    }
};

const handleAddMedicineChange = async (medicineId) => {
    try {
        const selectedMedicineInfo = medicineList.value.find(item => item.id === medicineId);
        if (selectedMedicineInfo) {
            addForm.name = selectedMedicineInfo.name;
            addForm.supplier = selectedMedicineInfo.supplier;
            addForm.company = selectedMedicineInfo.company;
        }

        const res = await selectMedicineDetails({ id: medicineId });
        if (res.code === "200" && res.data && res.data.data) {
            const detail = res.data.data;
            addForm.unit = detail.unit || "";
        }
    } catch (error) {
        message.error(t('error.fetchMedicineDetails'));
        console.error(error);
    }
};

const showAddModal = () => {
    addModalVisible.value = true;
    addForm.medicineId = undefined;
    addForm.name = "";
    addForm.supplier = "";
    addForm.company = "";
    addForm.unit = "";
    addForm.createTime = null;
    addForm.type = undefined;
    addForm.giver = "";
    addForm.batchId = "";
    addForm.total = 0;
    addForm.rsrvInfo = "";
};
// 生成 BATCH + 10 位随机数字
const generateBatchId = () => {
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000); // 10 位数字
    return `BATCH${randomNum}`;
};

const handleAddSubmit = async () => {
    if (!addForm.medicineId) {
        message.error(t('error.selectMedicine'));
        return;
    }

    if (!addForm.type) {
        message.error(t('error.selectType'));
        return;
    }
    addForm.batchId = generateBatchId();
    try {
        const params = {
            name: addForm.name,
            supplier: addForm.supplier,
            company: addForm.company,
            unit: addForm.unit,
            createTime: addForm.createTime ? dayjs(addForm.createTime).format('YYYY-MM-DD HH:mm:ss') : "",
            type: addForm.type,
            giver: addForm.giver,
            batchId: addForm.batchId,
            total: addForm.total,
            rsrvInfo: addForm.rsrvInfo
        };

        const res = await insertMedicineLog(params);
        if (res.code === "200") {
            message.success(t('success.add'));
            addModalVisible.value = false;
            fetchMedicineLogList();
        } else {
            message.error(res.msg || t('error.add'));
        }
    } catch (error) {
        message.error(t('error.add'));
        console.error(error);
    }
};
const daochu = async () => {
    const res = await ruhuo({
        type: "4"
    });

    const blob = new Blob([res.data], {
        type: "application/vnd.ms-excel",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "出货记录.xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
};
const handleAddCancel = () => {
    addModalVisible.value = false;
};

onMounted(() => {
    fetchMedicineList();
});

</script>

<style scoped lang="scss">
.search-form {
    display: flex;
    width: 100%;
    align-items: center;
}

.search-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
}

.remote-consultation {
    padding: 0px 0px 12px;
}
</style>
