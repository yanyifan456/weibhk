<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px">

            <a-row>
                <a-col :span="6"
                    style="text-align: left;display: flex; align-items: center;justify-content: start;gap: 20px;">
                    <div>{{ $t('labelText.orderId') + ':' }}</div>
                    <a-input v-model:value="search.orderId" :placeholder="$t('public.input') + $t('labelText.orderId')"
                        style="width: 200px" />
                </a-col>
                <a-col :span="6"
                    style="text-align: left;display: flex; align-items: center;justify-content: start;gap: 20px;">
                    <div>{{ $t('form.appointmentTime') + ':' }}</div>
                    <a-date-picker v-model:value="search.time" :placeholder="$t('form.selectAppointmentTime')"
                        style="width: 200px" />
                </a-col>

                <a-col :span="4"></a-col>
                <a-col :span="8" style="text-align: right">
                    <a-button type="primary" @click="handleSearch">{{ $t("button.search") }}</a-button>
                    <a-button style="margin-left: 8px" @click="handleReset">
                        {{ $t("button.reset") }}
                    </a-button></a-col>
            </a-row>
        </a-card>
        <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id" @change="changePage">
            <template #bodyCell="{ column, record, index }">

                <!-- 序号 -->
                <template v-if="column.key === 'index'">
                    {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
                </template>

                <!-- 审核状态 -->
                <template v-if="column.dataIndex === 'orderState'">
                    <a-tag :color="orderStatusMapColor[record.orderState]">
                        {{ orderStatusMap[record.orderState] }}
                    </a-tag>
                </template>

                <template v-if="column.dataIndex === 'checkResult'">
                    <a-tooltip :title="record.checkResult || '无'">
                        <span class="ellipsis-text">
                            {{ record.checkResult || '无' }}
                        </span>
                    </a-tooltip>
                </template>

                <!-- 操作 -->
                <template v-else-if="column.key === 'action'">
                    <a-button type="link" @click="handleViewDetail(record)">查看</a-button>
                    <a-button type="link" @click="handleView(record)" :disabled="record.orderState != '6'">审核</a-button>
                </template>

            </template>
        </a-table>
    </div>
    <a-modal v-model:open="showModal" title="病历详情" @ok="handleOk" width="100%">
        <a-col>
            <div>
                <div style="margin: 20px 0 20px;">
                    <a-row>
                        <h4>病历</h4>
                    </a-row>
                    <a-row>{{ currentData.historyCase ? currentData.historyCase : '无' }}</a-row>
                </div>
                <div>
                    <a-image-preview-group>
                        <a-image :width="100" :height="100" v-for="value in currentData.casePhotoList" :src="value" />
                    </a-image-preview-group>
                </div>
            </div>
            <a-divider />
            <div>
                <div style="margin: 40px 0 20px;">
                    <h4>诊断书</h4>
                    <div>{{ currentData.historyDiagnosis ? currentData.historyDiagnosis : '无' }}</div>
                </div>
                <a-image-preview-group>
                    <a-image :width="100" :height="100" v-for="value in currentData.diagnosisPhotoList" :src="value" />
                </a-image-preview-group>
            </div>
            <a-divider />
            <div>
                <div style="margin: 40px 0 20px;">
                    <h4>检查报告</h4>
                    <div>{{ currentData.historyReport ? currentData.historyReport : '无' }}</div>
                </div>
                <a-image-preview-group>
                    <a-image :width="100" :height="100" v-for="value in currentData.reportPhotoList" :src="value" />
                </a-image-preview-group>
            </div>


        </a-col>
        <a-divider />

        <a-form layout="vertical">
            <a-form-item label="审核原因">
                <a-textarea show-count :minlength="10" :maxlength="100" v-model:value="checkReason"
                    placeholder="请输入审核原因" :rows="4" />
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button key="back" danger :loading="loadingNo" @click="handleCancel">不通过</a-button>
            <a-button key="submit" type="primary" ghost :loading="loadingYes" @click="handleOk">通过</a-button>
            <a-button key="close" @click="handleClose">关闭</a-button>
        </template>

    </a-modal>
    <a-modal v-model:open="showModalDetail" title="病历详情" @ok="handleOk" width="100%">
        <a-col>
            <div>
                <div style="margin: 20px 0 20px;">
                    <a-row>
                        <h4>病历</h4>
                    </a-row>
                    <a-row>{{ currentData.historyCase ? currentData.historyCase : '无' }}</a-row>
                </div>
                <div>
                    <a-image-preview-group>
                        <a-image :width="100" :height="100" v-for="value in currentData.casePhotoList" :src="value" />
                    </a-image-preview-group>
                </div>
            </div>
            <a-divider />
            <div>
                <div style="margin: 40px 0 20px;">
                    <h4>诊断书</h4>
                    <div>{{ currentData.historyDiagnosis ? currentData.historyDiagnosis : '无' }}</div>
                </div>
                <a-image-preview-group>
                    <a-image :width="100" :height="100" v-for="value in currentData.diagnosisPhotoList" :src="value" />
                </a-image-preview-group>
            </div>
            <a-divider />
            <div>
                <div style="margin: 40px 0 20px;">
                    <h4>检查报告</h4>
                    <div>{{ currentData.historyReport ? currentData.historyReport : '无' }}</div>
                </div>
                <a-image-preview-group>
                    <a-image :width="100" :height="100" v-for="value in currentData.reportPhotoList" :src="value" />
                </a-image-preview-group>
            </div>


        </a-col>
        <!-- <a-divider /> -->

        <!-- <a-form layout="vertical">
            <a-form-item label="审核原因">
                <a-textarea show-count minlength="10" maxlength="100" v-model:value="checkReason" placeholder="请输入审核原因"
                    :rows="4" />
            </a-form-item>
        </a-form> -->
        <template #footer>
            <!-- <a-button key="back" danger :loading="loadingNo" @click="handleCancel">不通过</a-button>
            <a-button key="submit" type="primary" ghost :loading="loadingYes" @click="handleOk">通过</a-button> -->
            <a-button key="close" @click="handleCloseDetail">关闭</a-button>
        </template>

    </a-modal>
</template>

<script setup>
import dayjs from 'dayjs';
import { getRecordList, checkRecord } from '@/api/api1'
import { message } from 'ant-design-vue';
import axios from 'axios';

const search = reactive({
    time: null,
    orderId: null
});


const orderStatusMap = {
    '0': '待付款',
    '1': '待會診',
    '2': '待評價',
    '3': '已完成',
    '4': '主動取消預約',
    '5': '醫生取消預約',
    '6': '待審核',
    '7': '審核不通過'
}
const orderStatusMapColor = {
    "0": "#FAAD14", // 待付款（橙色/提醒）
    "1": "#1890FF", // 待會診（蓝色/进行中）
    "2": "#13C2C2", // 待評價（青色/待反馈）
    "3": "#52C41A", // 已完成（绿色/成功）
    "4": "#8C8C8C", // 主動取消預約（灰色/取消）
    "5": "#FF4D4F", // 醫生取消預約（红色/异常取消）
    "6": "#FA8C16", // 待審核（橙色/审核中）
    "7": "#FF4D4F"  // 審核不通過（红色/失败）
}
// 搜索
const handleSearch = () => {
    getList();

};

// 重置
const handleReset = () => {
    search.time = null;
    search.orderId = null;
    handleSearch()
};

// 格式化时间
const formatTime = (time) => {
    return time ? dayjs(time).format('YYYY-MM-DD') : '';
};

// 列表项
const columns = [
    { title: '序号', key: 'index', width: 80, align: 'center' },
    { title: '预约单号', dataIndex: 'orderId', key: 'orderId', align: 'center' },
    { title: '预约状态', dataIndex: 'orderState', key: 'orderState', align: 'center' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', align: 'center' },
    { title: '预约时间', dataIndex: 'orderTime', key: 'orderTime', align: 'center' },
    { title: '预约人', dataIndex: 'orderUserName', key: 'orderUserName', align: 'center' },
    { title: '医生名称', dataIndex: 'doctorName', key: 'doctorName', align: 'center' },
    { title: '审核结果', dataIndex: 'checkResult', key: 'checkResult', align: 'center' },
    // { title: '历史病历', dataIndex: 'historyCase', key: 'historyCase', align: 'center', },
    // { title: '诊断书', dataIndex: 'historyDiagnosis', key: 'historyDiagnosis', align: 'center', },
    // { title: '检查报告', dataIndex: 'historyReport', key: 'historyReport', align: 'center', },
    // { title: '病历图片', dataIndex: 'casePhoto', key: 'casePhoto', align: 'center' },
    // { title: '诊断书图片', dataIndex: 'diagnosisPhoto', key: 'diagnosisPhoto', align: 'center' },
    // { title: '检查报告图片', dataIndex: 'reportPhoto', key: 'reportPhoto', align: 'center' },
    // { title: '病历详情', key: 'recordDetail', align: 'center' },
    { title: '操作', key: 'action', align: 'center' }
];
// 列表
const tableData = ref([]);


// =====获取数据====
// 分页
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ['10', '20', '30', '40', '50'],
});

const changePage = (page) => {
    pagination.current = page.current;
    pagination.pageSize = page.pageSize;
    getList();
};

// 今天
const today = dayjs()
const getList = async () => {
    try {
        const params = {
            currentPage: pagination.current,
            pageSize: pagination.pageSize,
            loginName: sessionStorage.getItem('username'),
            orderId: search.orderId,
            orderTime: formatTime(search.time),
            orderState: 6
        };
        const res = await getRecordList(params);
        if (res.code == 200) {
            tableData.value = res.data.data;
            pagination.total = res.data.total;
        }
    } catch (error) {

    }
};


const currentData = ref(null);
const decryption = async (url) => {
    // 如果不是 .enc 结尾则不进行解密，直接返回原 URL
    if (!url || !url.toLowerCase().endsWith('.enc')) {
        return url
    }
    try {
        const res = await axios.get(
            'https://hqgy.gzxinxingyiyuan.com/filedec/file/desfile/download',
            {
                params: { url }, responseType: 'blob' // 👈 关键
            }
        )
        console.log(res.data);
        const blob = new Blob([res.data])
        const imgUrl = URL.createObjectURL(blob)
        return imgUrl
    } catch (err) {
        console.log('解密失败', err)
        return ''
    }
}
// 查看并审核
const handleView = async (record) => {
    showModal.value = true
    currentData.value = record

    const [caseList, diagnosisList, reportList] = await Promise.all([
        Promise.all(JSON.parse(record.casePhoto || '[]').map(decryption)),
        Promise.all(JSON.parse(record.diagnosisPhoto || '[]').map(decryption)),
        Promise.all(JSON.parse(record.reportPhoto || '[]').map(decryption))
    ])

    record.casePhotoList = caseList
    record.diagnosisPhotoList = diagnosisList
    record.reportPhotoList = reportList
}
const showModalDetail = ref(false)
const handleViewDetail = async (record) => {
    showModalDetail.value = true
    currentData.value = record

    const [caseList, diagnosisList, reportList] = await Promise.all([
        Promise.all(JSON.parse(record.casePhoto || '[]').map(decryption)),
        Promise.all(JSON.parse(record.diagnosisPhoto || '[]').map(decryption)),
        Promise.all(JSON.parse(record.reportPhoto || '[]').map(decryption))
    ])

    record.casePhotoList = caseList
    record.diagnosisPhotoList = diagnosisList
    record.reportPhotoList = reportList
}
// const handleView = (record) => {
//     console.log(record);
//     showModal.value = true;
//     currentData.value = record;
// };

// modal 显示
const showModal = ref(false);
const loadingNo = ref(false);
const loadingYes = ref(false);
const checkReason = ref('');
const handleOk = async () => {
    try {
        loadingYes.value = true;
        const res = await checkRecord({
            orderId: currentData.value.orderId,
            checkResult: '',
            checkTag: 1
        });

        console.log(res);
        if (res.code == 200) {
            message.success('操作成功')
            showModal.value = false;
            checkReason.value = '';
            getList();
        }

    } catch (err) {
        console.log(err);
    } finally {
        loadingYes.value = false;
    }
};
const handleCancel = async () => {
    if (!checkReason.value || !checkReason.value.trim()) {
        message.warning('请填写审核不通过原因');
        return;
    }

    loadingNo.value = true;

    try {

        const res = await checkRecord({
            orderId: currentData.value.orderId,
            checkResult: checkReason.value,
            checkTag: 2
        });

        console.log(res);
        if (res.code == 200) {
            message.success('操作成功')
            showModal.value = false;
            checkReason.value = '';
            getList();
        }


    } catch (err) {
        console.log(err);
    } finally {
        loadingNo.value = false;
    }
};
const handleCloseDetail = () => {
    // showModal.value = false;
    // checkReason.value = '';
    showModalDetail.value = false;
};
const handleClose = () => {
    showModal.value = false;
    checkReason.value = '';
};
watch(() => [showModal.value, showModalDetail.value],
    (newValue) => {
        if (!newValue) {
            currentData.value = null;
        }
    })
onMounted(() => {
    // search.time = today
    getList()
})

</script>

<style scoped lang="scss"></style>
