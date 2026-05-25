<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px;">
            <a-form layout="inline" class="search-form">
                <!-- 将输入框改为下拉列表 -->
                <a-form-item :label="t('button.yaowu')">
                    <!-- 修改下拉框选项格式，添加字段标签 -->
                    <a-select v-model:value="selectedMedicine" :placeholder="t('button.ayaowu')" style="width: 400px;"
                        show-search :filter-option="filterOption" @change="handleMedicineChange">
                        <a-select-option value="" disabled>
                            <strong>{{ t('label.medicineName') }} | {{ t('label.supplierLabel') }} | {{
                                t('label.manufacturerLabel') }}</strong>
                        </a-select-option>
                        <a-select-option v-for="item in medicineList" :key="item.id" :value="item.name">
                            {{ t('label.medicineName') }}: {{ item.name }} | {{ t('label.supplierLabel') }}: {{
                                item.supplier }} | {{ t('label.manufacturerLabel') }}: {{ item.company }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <!-- 年月选择卡片 -->


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
            <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id"
                :scroll="{ y: 470 }" bordered class="patient-table" @change="handleTableChange">

            </a-table>
        </a-card>

        <!-- 修改新增弹框，添加药物入货相关字段 -->
        <a-modal v-model:open="addModalVisible" :title="t('button.Patientadd')" width="750px" @ok="handleAddSubmit"
            @cancel="handleAddCancel">

            <a-form :model="addForm" layout="vertical">

                <a-row :gutter="16">
                    <a-col :span="12">
                        <!-- 添加 i18n 翻译并修改下拉框选项格式 -->
                        <a-form-item :label="t('label.medicineName')">
                            <a-select v-model:value="addForm.name" :placeholder="t('placeholder.selectMedicine')"
                                show-search :filter-option="filterMedicineAddOption" @change="handleAddMedicineChange">
                                <a-select-option v-for="item in medicineList" :key="item.id" :value="item.id">
                                    {{ t('label.medicineName') }}: {{ item.name }} | {{ t('label.supplierLabel') }}: {{
                                        item.supplier }} | {{ t('label.manufacturerLabel') }}: {{ item.company }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.unit')">
                            <a-input disabled v-model:value="addForm.unit" :placeholder="t('placeholder.enterUnit')" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.date')">
                            <a-date-picker v-model:value="addForm.createTime" style="width: 100%;"
                                format="YYYY-MM-DD HH:mm:ss" show-time :placeholder="t('placeholder.selectDate')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.supplier')">
                            <a-input disabled v-model:value="addForm.supplier"
                                :placeholder="t('placeholder.enterSupplier')" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <!-- 修改为药厂翻译 -->
                        <a-form-item :label="t('label.manufacturerLabel')">
                            <a-input disabled v-model:value="addForm.company"
                                :placeholder="t('placeholder.enterManufacturer')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.orderQuantity')">
                            <a-input-number v-model:value="addForm.sellNumber" style="width: 100%;"
                                :placeholder="t('placeholder.enterOrderQuantity')" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.giftQuantity')">
                            <a-input-number v-model:value="addForm.presentNumber" style="width: 100%;"
                                :placeholder="t('placeholder.enterGiftQuantity')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.currentQuantity')">
                            <a-input disabled v-model:value="addForm.stock"
                                :placeholder="t('placeholder.enterCurrentQuantity')" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.expiryDate')">
                            <a-date-picker v-model:value="addForm.validDate" style="width: 100%;" format="YYYY-MM-DD"
                                :placeholder="t('placeholder.selectExpiryDate')" />
                        </a-form-item>
                    </a-col>

                    <a-col :span="12">
                        <!-- 修改为总成本翻译 -->
                        <a-form-item :label="t('label.pphone')">
                            <a-input v-model:value="addForm.totalCost" :placeholder="t('placeholder.enterTotalCost')" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.quantity')">
                            <a-input-number v-model:value="addForm.total" style="width: 100%;"
                                :placeholder="t('placeholder.enterQuantity')" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.unitPrice')">
                            <a-input disabled v-model:value="addForm.unitPrice"
                                :placeholder="t('placeholder.enterUnitPrice')" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="24">
                        <!-- 添加 i18n 翻译 -->
                        <a-form-item :label="t('label.remarks')">
                            <a-textarea v-model:value="addForm.rsrvInfo" :placeholder="t('placeholder.enterRemarks')"
                                :rows="3" />
                        </a-form-item>
                    </a-col>
                </a-row>

            </a-form>
        </a-modal>
        <!-- 图片预览 -->

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

// 年月选择
const selectedMonth = ref(null);

// 表格列
const columns = computed(() => [
    { title: t("label.date"), dataIndex: "createTime", key: "createTime", align: "center" },
    { title: t("label.pname"), dataIndex: "name", key: "name", align: "center" },
    { title: t("label.supplier"), dataIndex: "supplier", key: "supplier", align: "center" },
    { title: t("label.penglishName"), dataIndex: "company", key: "company", align: "center" },
    { title: t("label.code"), dataIndex: "batchId", key: "batchId", align: "center" },
    { title: t("label.expiryDate"), dataIndex: "validDate", key: "validDate", align: "center" },
    { title: t("label.orderQuantity"), dataIndex: "sellNumber", key: "sellNumber", align: "center" },
    { title: t("label.giftQuantity"), dataIndex: "presentNumber", key: "presentNumber", align: "center" },
    { title: t("label.pphone"), dataIndex: "totalCost", key: "totalCost", align: "center" },
    { title: t("label.totalQuantity"), dataIndex: "total", key: "total", align: "center" },
]);

const tableData = ref([]);

// 分页
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
    name: undefined, // 存储药品ID
    unit: "",
    createTime: null,
    supplier: "",
    company: "",
    sellNumber: 0,
    presentNumber: 0,
    batchId: "",
    validDate: null,
    totalCost: "",
    unitCost: "",
    unitPrice: "",
    curNumer: "",
    total: 0,
    rsrvInfo: ""
});

const editModalVisible = ref(false);
const editForm = reactive({
    id: null,
    englishName: "",
    chineseName: "",
    chineseSpecialty: "",
    englishSpecialty: "",
    phone: "",
    email: "",
    printTitle: "",
    department: "",
    licenseFileList: []
});



const filterOption = (input, option) => { return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0; };
const filterMedicineAddOption = (input, option) => {
    // option.children 是显示的整段文字
    const labelText = option.children?.toString().toLowerCase() || "";
    const keyword = input.toLowerCase();
    return labelText.includes(keyword);
};

const fetchMedicineList = async () => {
    try {
        const res = await selectMedicineOnlyField({});
        if (res.code === "200" && res.data && res.data.data) {
            medicineList.value = res.data.data;
            console.log(res.data.data);
        }
    } catch (error) {
        message.error("获取药物列表失败");
        console.error(error);
    }
};

const handleMedicineChange = (value) => {
    fetchMedicineLogList();
};

const handleMonthChange = () => {
    fetchMedicineLogList();
};

const fetchMedicineLogList = async () => {


    try {
        const params = {
            current: pagination.current,
            pageSize: pagination.pageSize,
            name: selectedMedicine.value,
            createTime: selectedMonth.value ? dayjs(selectedMonth.value).format('YYYY-MM') : "",
            type: "0"
        };
        console.log(params);
        const res = await selectMedicineLogList(params);
        console.log(res);
        if (res.code === "200") {
            tableData.value = res.data.data || [];
            pagination.total = res.data.total || 0;
        }
    } catch (error) {
        message.error("获取药物日志失败");
        console.error(error);
    }
};

const handleAddMedicineChange = async (medicineId) => {
    try {
        const res = await selectMedicineDetails({ id: medicineId });
        if (res.code === "200" && res.data && res.data.data) {
            const detail = res.data.data;
            // 填充药厂、当前数量、单位售价
            addForm.company = detail.company || "";
            addForm.stock = detail.stock || "";
            addForm.unitPrice = detail.unitPrice || "";
            // 同时填充其他可用信息
            addForm.supplier = detail.supplier || "";
            addForm.unit = detail.unit || "";
            addForm.unitCost = detail.unitCost || "";
        }
    } catch (error) {
        message.error("获取药物详情失败");
        console.error(error);
    }
};



const showAddModal = () => {
    addModalVisible.value = true;
    addForm.name = undefined;
    addForm.unit = "";
    addForm.createTime = null;
    addForm.supplier = "";
    addForm.company = "";
    addForm.sellNumber = 0;
    addForm.presentNumber = 0;
    addForm.batchId = "";
    addForm.validDate = null;
    addForm.totalCost = "";
    addForm.unitCost = "";
    addForm.unitPrice = "";
    addForm.curNumer = "";
    addForm.total = 0;
    addForm.rsrvInfo = "";
};
// 生成 BATCH + 10 位随机数字
const generateBatchId = () => {
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000); // 10 位数字
    return `BATCH${randomNum}`;
};

const handleAddSubmit = async () => {
    if (!addForm.name) {
        message.error("请选择药品名称");
        return;
    }

    // ⭐ 自动生成 BATCH 开头 + 10 位随机数字
    addForm.batchId = generateBatchId();

    try {
        const selectedMedicineInfo = medicineList.value.find(item => item.id === addForm.name);

        const params = {
            name: selectedMedicineInfo?.name || "",
            unit: addForm.unit,
            createTime: addForm.createTime ? dayjs(addForm.createTime).format('YYYY-MM-DD HH:mm:ss') : "",
            supplier: addForm.supplier,
            company: addForm.company,
            sellNumber: addForm.sellNumber,
            presentNumber: addForm.presentNumber,

            // ⭐ 这里带上自动生成的批次号
            batchId: addForm.batchId,

            validDate: addForm.validDate ? dayjs(addForm.validDate).format('YYYY-MM-DD') : "",
            totalCost: addForm.totalCost,
            unitCost: addForm.unitCost,
            unitPrice: addForm.unitPrice,
            curNumer: addForm.curNumer,
            total: addForm.total,
            rsrvInfo: addForm.rsrvInfo,
            type: "0"
        };

        const res = await insertMedicineLog(params);
        if (res.code === "200") {
            message.success(`新增成功，批次号：${addForm.batchId}`);
            addModalVisible.value = false;
            fetchMedicineLogList();
        } else {
            message.error(res.msg || "新增失败");
        }
    } catch (error) {
        message.error("新增失败");
        console.error(error);
    }
};


const handleAddCancel = () => {
    addModalVisible.value = false;
};
const daochu = async () => {
    const res = await ruhuo({
        type: "0"
    });

    const blob = new Blob([res.data], {
        type: "application/vnd.ms-excel",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "入货记录.xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
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
