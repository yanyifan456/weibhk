<template>
    <!--
    药品选择器：搜索+表格勾选+已选药品详情填写+手动新增药品
    props:
      - medicineTypeList:   药品分类列表
      - medicineList:       当前分页药品列表
      - medicinePagination: 分页配置 (reactive)
      - selectedIds:        已选药品ID数组
      - quantities:         各药品数量 { [id]: number }
      - extraFields:        各药品额外字段 { [id]: { dosageForm, frenquency, duration, directionsRoute, specialPurpose } }
      - manualMedicines:    手动新增药品列表
      - searchForm:         搜索表单 { type, name }
    emits:
      - search              触发搜索
      - tableChange(pgn)    分页/排序变化
      - toggleSelectAll(e)  全选/取消全选
      - toggleSelect(id)    单个勾选
      - addManual           新增手动药品
      - removeManual(index) 删除手动药品
  -->
    <div class="medicines-section" style="margin-top: 20px; margin-bottom: 20px; text-align: left">
        <div style="margin-bottom: 10px; font-weight: bold;">会诊用药</div>

        <!-- 搜索栏 -->
        <div style="display: flex; align-items: center; margin-bottom: 10px; gap: 10px;">
            <a-select v-model:value="searchForm.type" placeholder="药品类型" style="width: 120px" allow-clear>
                <a-select-option v-for="item in medicineTypeList" :key="item.typeId" :value="item.typeId">
                    {{ item.typeName }}
                </a-select-option>
            </a-select>
            <a-input v-model:value="searchForm.name" placeholder="请输入商品名称" style="flex: 1" />
            <a-button type="primary" @click="emit('search')">搜索</a-button>
        </div>

        <!-- 药品列表表格（带分页） -->
        <a-table :columns="tableColumns" :data-source="medicineList" :pagination="medicinePagination" row-key="id"
            size="small" :scroll="{ y: 200 }" @change="(pgn) => emit('tableChange', pgn)">
            <template #headerCell="{ column }">
                <template v-if="column.key === 'selection'">
                    <a-checkbox :checked="isAllSelected" :indeterminate="isIndeterminate"
                        @change="(e) => emit('toggleSelectAll', e)" />
                </template>
            </template>
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'selection'">
                    <a-checkbox :checked="selectedIds.includes(record.id)"
                        @change="() => emit('toggleSelect', record.id)" />
                </template>
                <template v-else-if="column.key === 'spec'">
                    {{ record.spec || '--' }}
                </template>
                <template v-else-if="column.key === 'clazz'">
                    {{ record.clazz || '--' }}
                </template>
                <template v-else-if="column.key === 'quantity'">
                    <a-input-number v-model:value="quantities[record.id]" :min="1" :max="999" placeholder="数量"
                        style="width: 70px" />
                </template>
            </template>
        </a-table>

        <!-- 已选接口药品的额外字段填写 -->
        <div v-if="selectedIds.length > 0" style="margin-top: 16px;">
            <div style="font-weight: bold; margin-bottom: 8px;">已选药品详情填写</div>
            <div v-for="id in selectedIds" :key="id"
                style="border: 1px solid #e8e8e8; border-radius: 4px; padding: 10px; margin-bottom: 10px;">
                <!-- 药品名称 + 规格 -->
                <div style="font-size: 13px; color: #333; margin-bottom: 8px; font-weight: 500;">
                    {{ getMedicineName(id) }}（规格：{{ getMedicineSpec(id) }}）
                </div>
                <!-- 额外字段行 -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <MedicineFieldInput label="剂型" v-model="extraFields[id].dosageForm" placeholder="剂型"
                        width="100px" />
                    <MedicineFieldInput label="频次" v-model="extraFields[id].frenquency" placeholder="频次"
                        width="100px" />
                    <MedicineFieldInput label="疗程" v-model="extraFields[id].duration" placeholder="疗程" width="100px" />
                    <MedicineFieldInput label="用法/途径" v-model="extraFields[id].directionsRoute" placeholder="用法/途径"
                        width="120px" />
                    <MedicineFieldInput label="特殊用途" v-model="extraFields[id].specialPurpose" placeholder="特殊用途"
                        width="120px" />
                </div>
            </div>
        </div>

        <!-- 手动新增药品区域 -->
        <div style="margin-top: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: bold; font-size: 13px;">手动新增药品</span>
                <a-button type="dashed" size="small" @click="emit('addManual')">+ 新增药品</a-button>
            </div>

            <div v-for="(item, index) in manualMedicines" :key="item._key"
                style="border: 1px solid #d9d9d9; border-radius: 4px; padding: 10px; margin-bottom: 10px; background: #fafafa;">
                <!-- 基本信息行 -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                    <MedicineFieldInput label="藥物名稱" v-model="item.name" placeholder="藥物名稱" width="110px" />
                    <MedicineFieldInput label="藥品規格" v-model="item.spec" placeholder="藥品規格" width="110px" />
                    <MedicineFieldInput label="藥品分類" v-model="item.clazz" placeholder="藥品分類" width="110px" />
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="white-space: nowrap; font-size: 12px; color: #666;">數量：</span>
                        <a-input-number v-model:value="item.medicineCun" :min="1" :max="999" placeholder="數量"
                            style="width: 70px;" size="small" />
                    </div>
                </div>
                <!-- 详情字段行 -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                    <MedicineFieldInput label="剂型" v-model="item.dosageForm" placeholder="剂型" width="100px" />
                    <MedicineFieldInput label="频次" v-model="item.frenquency" placeholder="频次" width="100px" />
                    <MedicineFieldInput label="疗程" v-model="item.duration" placeholder="疗程" width="100px" />
                    <MedicineFieldInput label="用法/途径" v-model="item.directionsRoute" placeholder="用法/途径"
                        width="120px" />
                    <MedicineFieldInput label="特殊用途" v-model="item.specialPurpose" placeholder="特殊用途" width="110px" />
                    <a-button type="text" danger size="small" style="margin-left: auto;"
                        @click="emit('removeManual', index)">删除</a-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

/** 内联小组件：统一的字段标签+输入框 */
import MedicineFieldInput from './components/MedicineFieldInput.vue'

const props = defineProps({
    medicineTypeList: { type: Array, default: () => [] },
    medicineList: { type: Array, default: () => [] },
    medicinePagination: { type: Object, default: () => ({}) },
    selectedIds: { type: Array, default: () => [] },
    quantities: { type: Object, default: () => ({}) },
    extraFields: { type: Object, default: () => ({}) },
    manualMedicines: { type: Array, default: () => [] },
    searchForm: { type: Object, default: () => ({ type: undefined, name: '' }) },
});

const emit = defineEmits([
    'search',
    'tableChange',
    'toggleSelectAll',
    'toggleSelect',
    'addManual',
    'removeManual',
]);

/** 表格列定义 */
const tableColumns = [
    { title: '', key: 'selection', width: 50, align: 'center' },
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
    { title: '药品名称', dataIndex: 'name', key: 'name', align: 'center' },
    { title: '规格', dataIndex: 'spec', key: 'spec', width: 120, align: 'center' },
    { title: '分类', dataIndex: 'clazz', key: 'clazz', width: 100, align: 'center' },
    { title: '数量', key: 'quantity', width: 100, align: 'center' },
];

/** 是否全选 */
const isAllSelected = computed(() =>
    props.medicineList.length > 0 &&
    props.medicineList.every((item) => props.selectedIds.includes(item.id))
);

/** 半选状态 */
const isIndeterminate = computed(() =>
    props.medicineList.some((item) => props.selectedIds.includes(item.id)) &&
    !isAllSelected.value
);

/** 根据 id 获取药品名称 */
const getMedicineName = (id) => {
    const item = props.medicineList.find((m) => m.id === id);
    return item ? item.name : String(id);
};

/** 根据 id 获取药品规格 */
const getMedicineSpec = (id) => {
    const item = props.medicineList.find((m) => m.id === id);
    return item ? (item.spec || '--') : '--';
};
</script>
