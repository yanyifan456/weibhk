<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px;">
            <a-form layout="inline" :model="searchForm" class="search-form">

                <a-form-item :label="t('button.materialsname')">
                    <a-input v-model:value="searchForm.name" :placeholder="t('button.materialsname')"
                        style="width: 200px;" />
                </a-form-item>
                <a-form-item :label="t('button.yaopin')">
                    <a-select v-model:value="searchForm.names" :placeholder="t('button.A')" style="width: 200px;"
                        allow-clear>
                        <a-select-option value="disabled">{{ t('medicine.hazardousDrug') }}</a-select-option>
                        <a-select-option value="danger">{{ t('medicine.medicalSolution') }}</a-select-option>
                        <a-select-option value="low">{{ t('medicine.deductUnit') }}</a-select-option>
                        <a-select-option value="A">{{ t('medicine.injectableMedicine') }}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item class="search-actions">
                    <a-button type="primary" @click="handleSearch">
                        {{ t('button.search') }}
                    </a-button>

                    <a-button style="margin-left: 8px;" @click="handleReset">
                        {{ t('button.reset') }}
                    </a-button>

                    <a-button type="primary" style="margin-left: 8px;" @click="showAddModal">
                        {{ t('button.Patientadd') }}
                    </a-button>
                    <a-button style="margin-left: 8px;" @click="daochu">
                        {{ t('button.daochu') }}
                    </a-button>
                </a-form-item>

            </a-form>
        </a-card>
        <!-- 数据表格 -->
        <a-card>
            <div class="table-wrapper">
                <!-- 修改表格数据源为tableData，添加分页配置 -->
                <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id"
                    :scroll="{ x: 3000, y: 470 }" bordered class="patient-table" @change="handleTableChange">
                    <!-- 你的操作列 bodyCell 完整保留 -->
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'photo'">
                            <a-image v-if="record.photo" :src="record.photo" :width="50" :height="50" />
                            <span v-else>-</span>
                        </template>
                        <template v-if="column.key === 'action'">
                            <div class="action-buttons">
                                <a-button type="link" size="small" @click="editRecord(record)">
                                    {{ t('button.edit') }}
                                </a-button>
                                <a-button type="link" size="small" @click="daochus(record)">
                                    {{ t('button.daochu') }}
                                </a-button>
                                <a-popconfirm :title="t('medicine.confirmDelete') + record.name + '？'"
                                    @confirm="deleteRecord(record)" :ok-text="t('button.confirm')"
                                    :cancel-text="t('button.cancel')">
                                    <a-button type="link" size="small" danger>
                                        {{ t('button.delete') }}
                                    </a-button>
                                </a-popconfirm>
                            </div>
                        </template>
                    </template>
                </a-table>

            </div>
        </a-card>
        <!-- 修改新增/编辑 Modal -->
        <a-modal :destroyOnClose="true" v-model:open="modalVisible"
            :title="isEdit ? t('button.edit') : t('button.Patientadd')" @ok="submitForm" @cancel="closeModal"
            width="900px" :bodyStyle="{ maxHeight: '680px', overflowY: 'auto' }">
            <!-- 添加选项卡 -->
            <a-tabs v-model:activeKey="activeTabKey">
                <!-- 第一个选项卡：编辑药物 -->
                <a-tab-pane key="1" :tab="t('modal.editDrug')">
                    <a-form ref="formRef" :model="formData" :rules="formRules" :label-col="{ span: 6 }"
                        :wrapper-col="{ span: 18 }">
                        <!-- 药片图片 -->
                        <a-row :gutter="16">
                            <a-col :span="24">
                                <a-form-item :label="t('medicine.photo')" name="photo" :label-col="{ span: 3 }"
                                    :wrapper-col="{ span: 21 }">
                                    <a-upload v-model:file-list="photoFileList" name="file" list-type="picture-card"
                                        :show-upload-list="true" :before-upload="beforeUpload"
                                        :custom-request="customUploadRequest" :max-count="1">
                                        <div v-if="photoFileList.length === 0">
                                            <plus-outlined />
                                            <!-- <div style="margin-top: 8px">{{ t('medicine.uploadPhoto') }}</div> -->
                                        </div>
                                    </a-upload>
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item :label="t('label.pname')" name="name">
                                    <a-input v-model:value="formData.name"
                                        :placeholder="t('placeholder.enterRemarks')" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.type')" name="type">
                                    <a-select v-model:value="formData.type" :placeholder="t('medicine.selectType')"
                                        allow-clear>
                                        <a-select-option v-for="item in medicineTypeList" :key="item.id"
                                            :value="item.typeId">
                                            {{ item.typeName }}
                                        </a-select-option>
                                    </a-select>

                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.company')" name="company">
                                    <a-input v-model:value="formData.company"
                                        :placeholder="t('medicine.enterCompany')" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.validDate')" name="validDate">
                                    <a-date-picker v-model:value="formData.validDate" style="width: 100%;"
                                        :placeholder="t('medicine.selectValidDate')" />
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.code')" name="code">
                                    <a-input v-model:value="formData.code" :placeholder="t('medicine.enterCode')" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.clazz')" name="clazz">
                                    <a-select v-model:value="formData.clazz" :placeholder="t('medicine.selectClazz')"
                                        allow-clear>
                                        <a-select-option value="处方药">{{ t('medicine.prescription') }}</a-select-option>
                                        <a-select-option value="非处方药">{{ t('medicine.nonPrescription')
                                        }}</a-select-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.unitPrice')" name="unitPrice">
                                    <a-input-number v-model:value="formData.unitPrice"
                                        :placeholder="t('medicine.enterUnitPrice')" :precision="2"
                                        style="width: 100%;" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.spec')" name="spec">
                                    <a-input v-model:value="formData.spec" :placeholder="t('medicine.enterSpec')" />
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.indication')" name="indication">
                                    <a-input v-model:value="formData.indication"
                                        :placeholder="t('medicine.enterIndication')" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.pharmacyId')" name="pharmacyId">
                                    <a-select v-model:value="formData.pharmacyId"
                                        :placeholder="t('medicine.selectPharmacy')" allow-clear>
                                        <a-select-option v-for="item in pharmacyList" :key="item.pharmacyId"
                                            :value="item.pharmacyId">
                                            {{ item.pharmacyName }}
                                        </a-select-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.adverseReaction')" name="adverseReaction">
                                    <a-input v-model:value="formData.adverseReaction"
                                        :placeholder="t('medicine.enterAdverseReaction')" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.contraind')" name="contraind">
                                    <a-input v-model:value="formData.contraind"
                                        :placeholder="t('medicine.enterContraind')" />
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.precautions')" name="precautions">
                                    <a-input v-model:value="formData.precautions"
                                        :placeholder="t('medicine.enterPrecautions')" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.drugLotNumber')" name="drugLotNumber">
                                    <a-input v-model:value="formData.drugLotNumber"
                                        :placeholder="t('medicine.enterDrugLotNumber')" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item :label="t('medicine.signetur')" name="signetur">
                                    <a-input v-model:value="formData.signetur" :placeholder="t('medicine.signeturs')" />
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-form-item :label="t('medicine.medicineDesc')" name="medicineDesc" :label-col="{ span: 3 }"
                            :wrapper-col="{ span: 21 }">
                            <a-textarea v-model:value="formData.medicineDesc"
                                :placeholder="t('medicine.enterMedicineDesc')" :rows="3" />
                        </a-form-item>
                    </a-form>
                </a-tab-pane>
            </a-tabs>
        </a-modal>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { message, Empty } from "ant-design-vue";
import { PlusOutlined } from '@ant-design/icons-vue';
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { getDrugLabel, getsupplier, getIntensityUnit, getDrugType, getunit, getUsage, getTimes, getDays, getReuseRemark, getAdvice, selectPharmacyList } from "@/api/yyf.js";
import { selectMedicineList, selectMedicineListup, selectMedicineListDetail, selectMedicineListdel, selectMedicineListadd, exportMedicine, insertMedicine, updateMedicine, selectMedicineTypeList } from "@/api/yyf.js";

const { t } = useI18n();

const activeTabKey = ref('1');
const innerTabKey = ref('remarks'); // 新增内嵌标签页的key

const drugLabelList = ref([]);
const supplierList = ref([]);
const intensityUnitList = ref([]);
const drugTypeList = ref([]);
const unitList = ref([]);
const usageList = ref([]);
const timesList = ref([]);
const daysList = ref([]);
const reuseRemarkList = ref([]);
const adviceList = ref([]);
const pharmacyList = ref([]); // 药房列表
const medicineTypeList = ref([])
// 图片上传相关
const photoFileList = ref([]);
const uploadedFile = ref(null); // 存储上传的文件对象

// 新增临时变量用于添加
const tempUsage = ref(null);
const tempTimes = ref(null);
const tempDays = ref(null);
const tempReuseRemark = ref(null);
const tempAdvice = ref(null);

// 表单ref
const formRef = ref(null);

// 表单校验规则
const formRules = computed(() => ({
    name: [{ required: true, message: t('placeholder.enterRemarks'), trigger: 'blur' }],
    type: [{ required: true, message: t('medicine.selectType'), trigger: 'change' }],
    company: [{ required: true, message: t('medicine.enterCompany'), trigger: 'blur' }],
    validDate: [{ required: true, message: t('medicine.selectValidDate'), trigger: 'change' }],
    code: [{ required: true, message: t('medicine.enterCode'), trigger: 'blur' }],
    clazz: [{ required: true, message: t('medicine.selectClazz'), trigger: 'change' }],
    unitPrice: [{ required: true, message: t('medicine.enterUnitPrice'), trigger: 'blur' }],
    spec: [{ required: true, message: t('medicine.enterSpec'), trigger: 'blur' }],
    indication: [{ required: true, message: t('medicine.enterIndication'), trigger: 'blur' }],
    pharmacyId: [{ required: true, message: t('medicine.selectPharmacy'), trigger: 'change' }],
    adverseReaction: [{ required: true, message: t('medicine.enterAdverseReaction'), trigger: 'blur' }],
    contraind: [{ required: true, message: t('medicine.enterContraind'), trigger: 'blur' }],
    precautions: [{ required: true, message: t('medicine.enterPrecautions'), trigger: 'blur' }],
    drugLotNumber: [{ required: true, message: t('medicine.enterDrugLotNumber'), trigger: 'blur' }],
    signetur: [{ required: true, message: t('medicine.signeturs'), trigger: 'blur' }],
    medicineDesc: [{ required: true, message: t('medicine.enterMedicineDesc'), trigger: 'blur' }],
    photo: [
        {
            required: true,
            validator: (_, value) => {
                if (!photoFileList.value || photoFileList.value.length === 0) {
                    return Promise.reject('药品图片不能为空');
                }
                return Promise.resolve();
            },
            trigger: 'change'
        }
    ]
}));

// 搜索
const searchForm = reactive({
    name: "",
    names: ''
});
// 列定义 - 操作列固定在右侧
const columns = computed(() => [
    { title: t("medicine.photo"), dataIndex: "photo", key: "photo", align: "center", width: 80, fixed: 'left', ellipsis: true, },
    { title: t("label.pname"), dataIndex: "name", key: "name", align: "center", width: 120, fixed: 'left', ellipsis: true, },
    { title: t("medicine.type"), dataIndex: "type", key: "type", align: "center", width: 120, ellipsis: true, },
    { title: t("medicine.createStaff"), dataIndex: "createStaff", key: "createStaff", align: "center", width: 100, ellipsis: true, },
    { title: t("medicine.company"), dataIndex: "company", key: "company", align: "center", width: 120, ellipsis: true, },
    { title: t("medicine.code"), dataIndex: "code", key: "code", align: "center", width: 150, ellipsis: true, },
    { title: t("medicine.clazz"), dataIndex: "clazz", key: "clazz", align: "center", width: 100, ellipsis: true, },
    { title: t("medicine.unitPrice"), dataIndex: "unitPrice", key: "unitPrice", align: "center", width: 100, ellipsis: true, },
    { title: t("medicine.medicineDesc"), dataIndex: "medicineDesc", key: "medicineDesc", align: "center", width: 180, ellipsis: true, },
    { title: t("medicine.spec"), dataIndex: "spec", key: "spec", align: "center", width: 100, ellipsis: true, },
    { title: t("medicine.indication"), dataIndex: "indication", key: "indication", align: "center", width: 150, ellipsis: true, },
    { title: t("medicine.pharmacyId"), dataIndex: "pharmacyId", key: "pharmacyId", align: "center", width: 120, ellipsis: true, },
    { title: t("medicine.adverseReaction"), dataIndex: "adverseReaction", key: "adverseReaction", align: "center", width: 150, ellipsis: true, },
    { title: t("medicine.contraind"), dataIndex: "contraind", key: "contraind", align: "center", width: 150, ellipsis: true, },
    { title: t("medicine.precautions"), dataIndex: "precautions", key: "precautions", align: "center", width: 150, ellipsis: true, },
    { title: t("medicine.drugLotNumber"), dataIndex: "drugLotNumber", key: "drugLotNumber", align: "center", width: 120, ellipsis: true, },
    { title: t("medicine.signetur"), dataIndex: "signetur", key: "signetur", align: "center", width: 150, ellipsis: true, },
    { title: t("medicine.validDate"), dataIndex: "validDate", key: "validDate", align: "center", width: 120, ellipsis: true, },
    { title: t("label.aa"), dataIndex: "createTime", key: "createTime", align: "center", width: 180, ellipsis: true, },
    { title: t("button.shenhe"), key: "action", align: "center", width: 150, fixed: 'right' },
]);

//列表
const tableData = ref([]);
const tableDatas = ref({});

const getlist = async (params = {}) => {
    const requestParams = {
        name: params.name || "",
        hazardous: params.hazardous || "",
        medicalsolution: params.medicalsolution || "",
        deductUnit: params.deductUnit || "",
        injectableMedicine: params.injectableMedicine || "",
        current: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize
    };

    const res = await selectMedicineList(requestParams);
    console.log(res);
    if (res.code === '200' && res.msg === 'success') {
        tableData.value = res.data.data;
        tableDatas.value = res.data;
        pagination.total = res.data.total || 0;
    }
};

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `${t('button.total')} ${total} ${t('label.records')}`,
});

const handleTableChange = (paginationConfig) => {
    pagination.current = paginationConfig.current;
    pagination.pageSize = paginationConfig.pageSize;
    getlist({
        name: searchForm.name,
        hazardous: getFilterParam('hazardous'),
        medicalSolution: getFilterParam('medicalsolution'),
        deductUnit: getFilterParam('deductUnit'),
        injectableMedicine: getFilterParam('injectableMedicine'),
        current: pagination.current,
        pageSize: pagination.pageSize
    });
};

const getFilterParam = (type) => {
    if (!searchForm.names) return "";

    const filterMap = {
        'disabled': { key: 'hazardous', value: 'true' },
        'danger': { key: 'medicalsolution', value: 'true' },
        'low': { key: 'deductUnit', value: 'true' },
        'A': { key: 'injectableMedicine', value: 'true' }
    };

    const filter = filterMap[searchForm.names];
    return filter && filter.key === type ? filter.value : "";
};


const loadDropdownData = async () => {
    try {
        // 获取药物标签
        const labelRes = await getDrugLabel({});
        if (labelRes.code == 200 && labelRes.msg === 'success') {
            drugLabelList.value = labelRes.data || [];
        }

        // 获取供应商
        const supplierRes = await getsupplier({});
        if (supplierRes.code == 200 && supplierRes.msg === 'success') {
            supplierList.value = supplierRes.data || [];
        }

        // 获取强度单位
        const intensityRes = await getIntensityUnit({});
        if (intensityRes.code == 200 && intensityRes.msg === 'success') {
            intensityUnitList.value = intensityRes.data || [];
        }

        // 获取药物种类
        const typeRes = await getDrugType({});
        if (typeRes.code == 200 && typeRes.msg === 'success') {
            drugTypeList.value = typeRes.data || [];
        }

        // 获取单位
        const unitRes = await getunit({});
        if (unitRes.code == 200 && unitRes.msg === 'success') {
            unitList.value = unitRes.data || [];
        }

        // 获取用法
        const usageRes = await getUsage({});
        if (usageRes.code == 200 && usageRes.msg === 'success') {
            usageList.value = usageRes.data || [];
        }

        // 获取次数
        const timesRes = await getTimes({});
        if (timesRes.code == 200 && timesRes.msg === 'success') {
            timesList.value = timesRes.data || [];
        }

        // 获取日数
        const daysRes = await getDays({});
        if (daysRes.code == 200 && daysRes.msg === 'success') {
            daysList.value = daysRes.data || [];
        }

        // 获取服用备注
        const remarkRes = await getReuseRemark({});
        if (remarkRes.code == 200 && remarkRes.msg === 'success') {
            reuseRemarkList.value = remarkRes.data || [];
        }

        // 获取医嘱
        const adviceRes = await getAdvice({});
        if (adviceRes.code == 200 && adviceRes.msg === 'success') {
            adviceList.value = adviceRes.data || [];
        }

        // 获取药房列表
        const pharmacyRes = await selectPharmacyList({});
        if (pharmacyRes.code == '200' && pharmacyRes.msg === 'success') {
            pharmacyList.value = pharmacyRes.data.data || [];
        }
        const kkkk = await selectMedicineTypeList({});
        if (kkkk.code == '200' && kkkk.msg === 'success') {
            medicineTypeList.value = kkkk.data.data || [];
            console.log(medicineTypeList.value);
        }
    } catch (error) {
        console.error("获取下拉列表数据失败:", error);
    }
}

onMounted(() => {
    getlist();
    loadDropdownData();

});

const modalVisible = ref(false);
const isEdit = ref(false);

const formData = reactive({
    id: null,
    name: "",              // 药物名称
    type: null,              // 药品类型 (抗感冒类，胃肠道类，肝胆用药，祛痰止咳，抗晕抗过敏)
    createStaff: "",       // 创建人
    company: "",           // 生产厂家
    code: "",              // 香港注册编号
    clazz: null,           // 药品分类 (处方药/非处方药)
    unitPrice: null,       // 药品单价
    medicineDesc: "",      // 药品描述
    spec: "",              // 药品规格
    indication: "",        // 功能
    pharmacyId: null,      // 药房id
    adverseReaction: "",   // 不良反应
    contraind: "",         // 药品禁忌
    precautions: "",       // 注意事项
    validDate: null,       // 有效期
    photo: "",             // 药片图片
    drugLotNumber: "",
    signetur: "",   // 批次号
    // 状态选项
    medicalSolution: false,
    isDangerous: false,
    noLinjectableMedicineabel: false,
    deductUnit: false,
    // 服用备注相关
    usage: null,
    times: null,
    days: null,
    remarksList: [],
    adviceList: [],

});

// 图片上传前处理
const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error(t('medicine.uploadImageType'));
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error(t('medicine.uploadImageSize'));
    }
    return isJpgOrPng && isLt2M;
};

// 自定义上传请求 - 不立即上传，只保存文件
const customUploadRequest = ({ file, onSuccess }) => {
    uploadedFile.value = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        const url = e.target.result;

        formData.photo = url;

        // 🔥 手动更新 fileList
        photoFileList.value = [{
            uid: file.uid,
            name: file.name,
            status: 'done',   // ⭐关键
            url: url          // ⭐关键
        }];

        onSuccess("ok"); // ⭐必须传值
    };

    reader.readAsDataURL(file);
};

const showAddModal = () => {
    loadDropdownData();

    isEdit.value = false;
    activeTabKey.value = '1'; // 重置到第一个选项卡
    photoFileList.value = [];
    uploadedFile.value = null;
    Object.assign(formData, {
        id: null,
        name: "",
        type: "",
        createStaff: "",
        company: "",
        code: "",
        clazz: null,
        unitPrice: null,
        medicineDesc: "",
        spec: "",
        indication: "",
        pharmacyId: null,
        adverseReaction: "",
        contraind: "",
        precautions: "",
        validDate: null,
        photo: "",
        drugLotNumber: "",
        signetur: "",
        medicalSolution: false,
        isDangerous: false,
        noLinjectableMedicineabel: false,
        deductUnit: false,
        usage: null,
        times: null,
        days: null,
        remarksList: [],
        adviceList: []
    });
    // 重置表单校验状态
    if (formRef.value) {
        formRef.value.resetFields();
    }
    modalVisible.value = true;
};

const editRecord = async (record) => {
    try {
        const res = await selectMedicineListDetail({ id: record.id });
        console.log('获取药品详情数据:', res);
        if (res.code === '200' && res.msg === 'success') {
            isEdit.value = true;
            activeTabKey.value = '1';
            const detailData = res.data.data;

            // 处理服药备注 (administrationNotes)
            let remarksListData = [];
            if (detailData.administrationNotes && detailData.administrationNotes.trim()) {
                remarksListData = detailData.administrationNotes.split(',').map((item, index) => ({
                    id: `remark_${index}`,
                    instructionChi: item.trim(),
                    instructionEng: item.trim()
                }));
            }

            // 处理医嘱 (advice)
            let adviceListData = [];
            if (detailData.advice && detailData.advice.trim()) {
                adviceListData = detailData.advice.split(',').map((item, index) => ({
                    id: `advice_${index}`,
                    cautionChi: item.trim(),
                    cautionEng: item.trim()
                }));
            }

            // 处理图片
            photoFileList.value = detailData.photo ? [{
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: detailData.photo,
            }] : [];
            uploadedFile.value = null; // 编辑时重置文件

            Object.assign(formData, {
                id: detailData.id,
                name: detailData.name || "",
                type: detailData.type || "",
                createStaff: detailData.createStaff || "",
                company: detailData.company || "",
                code: detailData.code || "",
                clazz: detailData.clazz || null,
                unitPrice: detailData.unitPrice ? parseFloat(detailData.unitPrice) : null,
                medicineDesc: detailData.medicineDesc || "",
                spec: detailData.spec || "",
                indication: detailData.indication || "",
                pharmacyId: detailData.pharmacyId || null,
                adverseReaction: detailData.adverseReaction || "",
                contraind: detailData.contraind || "",
                precautions: detailData.precautions || "",
                validDate: detailData.validDate ? dayjs(detailData.validDate) : null,
                photo: detailData.photo || "",
                drugLotNumber: detailData.drugLotNumber || "",
                signetur: detailData.signetur || "",
                medicalSolution: detailData.medicalSolution === "1" || detailData.medicalSolution === "true" || detailData.medicalSolution === true,
                isDangerous: detailData.hazardous === "1" || detailData.hazardous === "true" || detailData.hazardous === true,
                noLinjectableMedicineabel: detailData.injectableMedicine === "1" || detailData.injectableMedicine === "true" || detailData.injectableMedicine === true,
                deductUnit: detailData.deductUnit === "1" || detailData.deductUnit === "true" || detailData.deductUnit === true,
                usage: detailData.usage || null,
                times: detailData.times || null,
                days: detailData.days || null,
                remarksList: remarksListData,
                adviceList: adviceListData
            });

            // 重置表单校验状态
            if (formRef.value) {
                formRef.value.clearValidate();
            }

            modalVisible.value = true;
        } else {
            message.error(t('error.fetchMedicineDetails'));
        }
    } catch (error) {
        console.error("获取药品详情失败:", error);
        message.error(t('error.fetchMedicineDetails'));
    }
};

const deleteRecord = async (record) => {
    try {
        const res = await selectMedicineListdel({ ids: [record.id] });
        if (res.code === '200' && res.msg === 'success') {
            message.success(t('medicine.deleteSuccess'));
            getlist();
        } else {
            message.error(t('medicine.deleteFail'));
        }
    } catch (error) {
        console.error("删除失败:", error);
        message.error(t('medicine.deleteFail'));
    }
};

const submitForm = async () => {
    // 表单校验
    try {
        await formRef.value.validate();
    } catch (error) {
        console.log('表单校验失败:', error);
        return;
    }

    console.log(formData.remarksList);
    console.log(formData.adviceList);
    try {
        // 构建medicine对象
        const medicineData = {
            name: formData.name || "",
            type: formData.type || "",
            createStaff: sessionStorage.getItem("username"),
            company: formData.company || "",
            code: formData.code || "",
            clazz: formData.clazz || "",
            unitPrice: formData.unitPrice ? String(formData.unitPrice) : "0.00",
            medicineDesc: formData.medicineDesc || "",
            spec: formData.spec || "",
            indication: formData.indication || "",
            pharmacyId: formData.pharmacyId || "",
            adverseReaction: formData.adverseReaction || "",
            contraind: formData.contraind || "",
            precautions: formData.precautions || "",
            validDate: formData.validDate ? dayjs(formData.validDate).format('YYYY-MM-DD') : "",
            drugLotNumber: formData.drugLotNumber || "",
            signetur: formData.signetur
        };

        // 编辑时添加id
        if (isEdit.value) {
            medicineData.id = formData.id;
            
            // 【修改点】：如果是编辑模式，且没有上传新文件，但存在原图片URL，则将其加入 medicineData
            if (!uploadedFile.value && photoFileList.value.length > 0 && photoFileList.value[0].url) {
                medicineData.photo = photoFileList.value[0].url;
            }
        }

        // 创建FormData对象
        const submitFormData = new FormData();
        // 将medicine对象转为JSON字符串
        submitFormData.append('medicine', JSON.stringify(medicineData));

        // 如果有上传的新文件，添加file字段
        if (uploadedFile.value) {
            submitFormData.append('file', uploadedFile.value);
        }

        console.log('[v0] 提交参数 medicine:', medicineData);

        let res;
        if (isEdit.value) {
            res = await updateMedicine(submitFormData);
        } else {
            res = await insertMedicine(submitFormData);
        }

        if (res.code === '200' && res.msg === 'success') {
            message.success(isEdit.value ? t('medicine.editSuccess') : t('success.add'));
            modalVisible.value = false;
            getlist();
        } else {
            message.error(isEdit.value ? t('medicine.editFail') : t('error.add'));
        }
    } catch (error) {
        console.error("提交失败:", error);
        message.error(t('medicine.submitFail'));
    }
};

const closeModal = () => {
    modalVisible.value = false;
};
// 搜索
const handleSearch = () => {
    pagination.current = 1; // 搜索时重置到第一页
    getlist({
        name: searchForm.name,
        hazardous: getFilterParam('hazardous'),
        medicalSolution: getFilterParam('medicalSolution'),
        deductUnit: getFilterParam('deductUnit'),
        injectableMedicine: getFilterParam('injectableMedicine'),
        current: 1,
        pageSize: pagination.pageSize
    });
};
// 重置
const handleReset = () => {
    searchForm.name = "";
    searchForm.names = "";
    pagination.current = 1;
    getlist();
};
const daochu = async () => {
    const res = await exportMedicine({});

    const blob = new Blob([res.data], {
        type: "application/vnd.ms-excel",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = t('medicine.exportFileName') + ".xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
};

const daochus = async (record) => {
    const res = await exportMedicine({ name: record.name });

    const blob = new Blob([res.data], {
        type: "application/vnd.ms-excel",
    });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = t('medicine.exportFileName') + ".xlsx"; // 下载文件名
    a.click();

    window.URL.revokeObjectURL(url);
};

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

.remote-consultation {
    padding: 0px 0px 12px;
    box-sizing: border-box;

    .consultation-modal {
        .ant-table {
            border: 1px solid #f0f0f0;
        }
    }

    .consultation-report {
        .ant-table {
            .ant-table-tbody>tr>td {
                padding: 8px 12px;
            }
        }
    }
}

.table-wrapper {
    position: relative;
}

/* 让统计栏强制处在分页栏左边,让它们显示在同一行 */
.table-summary {
    position: absolute;
    right: 650px;
    bottom: 22px;
    /* 调整到和分页同一水平 */
    font-size: 14px;
    color: #333;
    z-index: 10;
}

.table-summary .num {
    color: #1677ff;
    font-weight: 600;
}

/* 添加服用备注和医嘱列表的样式 */
.usage-remarks-container {

    .remarks-section,
    .advice-section {
        margin-bottom: 24px;

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f0f0f0;

            h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }
        }

        .remarks-list,
        .advice-list {

            .remark-item,
            .advice-item {
                position: relative;
                padding: 16px;
                margin-bottom: 16px;
                background: #fafafa;
                border: 1px solid #e8e8e8;
                border-radius: 4px;

                &:hover {
                    background: #f5f5f5;
                }

                .remark-actions,
                .advice-actions {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                }
            }
        }
    }
}

// 新增的内嵌标签页样式
.ant-tabs-nav {
    margin-bottom: 16px;
}

.remark-item,
.advice-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 10px;
    background: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 4px;

    &:hover {
        background: #f5f5f5;
    }

    .remark-content,
    .advice-content {
        flex: 1;
    }
}
</style>