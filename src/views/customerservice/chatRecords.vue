<template>
    <div class="chat-records-page">

        <!-- 頂部標題 -->
        <div class="page-header">
            <h1>聊天記錄管理</h1>
        </div>

        <!-- 搜索區域 -->
        <a-card class="search-card" :bordered="false">
            <a-form layout="inline" :model="searchForm">
                <a-form-item label="用户名">
                    <a-input v-model:value="searchForm.userName" placeholder="請輸入用户名" allow-clear
                        @press-enter="handleSearch" style="width: 180px" />
                </a-form-item>
                <a-form-item label="用户ID">
                    <a-input v-model:value="searchForm.userId" placeholder="請輸入用户ID" allow-clear
                        @press-enter="handleSearch" style="width: 180px" />
                </a-form-item>
                <a-form-item label="客服ID">
                    <a-input v-model:value="searchForm.serviceId" placeholder="請輸入客服ID" allow-clear
                        @press-enter="handleSearch" style="width: 180px" />
                </a-form-item>
                <a-form-item label="開始日期">
                    <a-date-picker v-model:value="searchForm.startTime" value-format="YYYY-MM-DD" placeholder="請選擇開始日期"
                        style="width: 180px" />
                </a-form-item>
                <a-form-item label="結束日期">
                    <a-date-picker v-model:value="searchForm.endTime" value-format="YYYY-MM-DD" placeholder="請選擇結束日期"
                        style="width: 180px" />
                </a-form-item>
                <a-form-item>
                    <a-space>
                        <a-button type="primary" @click="handleSearch">查詢</a-button>
                        <a-button @click="handleReset">重置</a-button>
                    </a-space>
                </a-form-item>
            </a-form>
        </a-card>

        <!-- 數據表格（會話聚合列表） -->
        <a-card :bordered="false" class="table-card">
            <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="false"
                row-key="sessionId" size="middle" :scroll="{ x: 900 }">
                <!-- 自定義列渲染 -->
                <template #bodyCell="{ column, record, index }">
                    <template v-if="column.key === 'index'">
                        {{ (pagination.currentPage - 1) * pagination.pageSize + index + 1 }}
                    </template>

                    <!-- 客服ID -->
                    <template v-else-if="column.key === 'serviceId'">
                        <a-tag color="geekblue">{{ record.serviceId }}</a-tag>
                    </template>

                    <!-- 消息條數 -->
                    <template v-else-if="column.key === 'msgCount'">
                        <a-badge :count="record.msgCount" :number-style="{ backgroundColor: '#52c41a' }" show-zero />
                    </template>

                    <!-- 操作 -->
                    <template v-else-if="column.key === 'action'">
                        <a-button type="link" size="small" @click="viewChatDetail(record)">查看對話</a-button>
                    </template>
                </template>

                <!-- 空數據 -->
                <template #emptyText>
                    <a-empty description="暫無數據" />
                </template>
            </a-table>

            <!-- 分頁 -->
            <div class="pagination-bar">
                <span class="total-text">共 {{ pagination.total }} 個會話</span>
                <a-pagination v-model:current="pagination.currentPage" v-model:page-size="pagination.pageSize"
                    :total="pagination.total" :page-size-options="['10', '20', '50', '100']" show-size-changer
                    show-quick-jumper @change="onPageChange" @show-size-change="onSizeChange" />
            </div>
        </a-card>

        <!-- 聊天詳情彈窗 -->
        <a-modal v-model:open="dialogVisible" :title="dialogTitle" :footer="null" width="680px" destroy-on-close>
            <div class="dialog-body">
                <a-spin :spinning="dialogLoading">
                    <div class="chat-timeline">
                        <template v-if="dialogMessages.length > 0">
                            <div v-for="msg in dialogMessages" :key="msg.id"
                                :class="['chat-item', msg.senderType === 'user' ? 'chat-left' : 'chat-right']">
                                <a-avatar
                                    :style="{ backgroundColor: msg.senderType === 'user' ? '#1890ff' : '#52c41a', flexShrink: 0 }"
                                    size="small">
                                    {{ msg.senderType === 'user' ? 'U' : '客' }}
                                </a-avatar>
                                <div class="chat-content-wrap">
                                    <div class="chat-bubble"
                                        :class="msg.senderType === 'user' ? 'bubble-left' : 'bubble-right'">
                                        {{ msg.content }}
                                    </div>
                                    <div class="chat-time-label">{{ msg.sendTime }}</div>
                                </div>
                            </div>
                        </template>
                        <a-empty v-else description="暫無聊天記錄" />
                    </div>
                </a-spin>
            </div>
        </a-modal>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getChatRecords, getChatRecordDetail } from '@/api/yyf'

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
    userName: '',
    userId: '',
    serviceId: '',
    startTime: '',
    endTime: ''
})

const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    total: 0
})

// 會話詳情彈窗
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogUserId = ref('')
const dialogServiceId = ref('')
const dialogMessages = ref([])

const dialogTitle = computed(() => {
    if (!dialogUserId.value || !dialogServiceId.value) return '聊天詳情'
    return `${dialogUserId.value} 與 客服${dialogServiceId.value} 的對話`
})

// 表格列定義（會話聚合視圖）
const columns = [
    { title: '序號', key: 'index', width: 70, fixed: 'left' },
    { title: '用户名', dataIndex: 'userName', key: 'userName', width: 120 },
    { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 120 },
    { title: '客服ID', key: 'serviceId' },
    { title: '消息條數', key: 'msgCount', width: 100 },
    { title: '首次對話', dataIndex: 'firstTime', key: 'firstTime', width: 170 },
    { title: '最後對話', dataIndex: 'lastTime', key: 'lastTime', width: 170 },
    { title: '操作', key: 'action', width: 80, fixed: 'right' }
]

// ================= 查詢 =================
const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize
        }
        if (searchForm.userName) params.userName = searchForm.userName
        if (searchForm.userId) params.userId = searchForm.userId
        if (searchForm.serviceId) params.serviceId = searchForm.serviceId
        if (searchForm.startTime) params.startTime = searchForm.startTime
        if (searchForm.endTime) params.endTime = searchForm.endTime

        const res = await getChatRecords(params)
        if (res.code === '200') {
            tableData.value = res.data?.data || []
            pagination.total = res.data?.total || 0
        }
    } catch (e) {
        console.error('查詢聊天記錄失敗', e)
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    pagination.currentPage = 1
    fetchData()
}

const handleReset = () => {
    searchForm.userName = ''
    searchForm.userId = ''
    searchForm.serviceId = ''
    searchForm.startTime = ''
    searchForm.endTime = ''
    pagination.currentPage = 1
    fetchData()
}

const onPageChange = (page) => {
    pagination.currentPage = page
    fetchData()
}

const onSizeChange = (current, size) => {
    pagination.currentPage = 1
    pagination.pageSize = size
    fetchData()
}

// ================= 查看對話詳情 =================
const viewChatDetail = async (record) => {
    dialogUserId.value = record.userId
    dialogServiceId.value = record.serviceId
    dialogMessages.value = []
    dialogVisible.value = true
    dialogLoading.value = true

    try {
        const res = await getChatRecordDetail({
            userId: record.userId,
            serviceId: record.serviceId
        })
        if (res.code === '200') {
            dialogMessages.value = res.data || []
        }
    } catch (e) {
        console.error('查詢對話詳情失敗', e)
    } finally {
        dialogLoading.value = false
    }
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.chat-records-page {
    padding: 20px;
    background: #f0f2f5;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.page-header {
    margin-bottom: 16px;
}

.page-header h1 {
    font-size: 20px;
    color: #333;
    font-weight: 600;
    margin: 0;
}

.search-card {
    margin-bottom: 16px;
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.table-card {
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* 分頁欄 */
.pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0 0;
}

.total-text {
    font-size: 14px;
    color: #666;
}

/* 彈窗內容 */
.dialog-body {
    max-height: 60vh;
    overflow-y: auto;
    padding: 4px 0;
}

/* 聊天時間線 */
.chat-timeline {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 4px 0;
}

.chat-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.chat-left {
    justify-content: flex-start;
}

.chat-right {
    justify-content: flex-end;
}

.chat-right .chat-content-wrap {
    align-items: flex-end;
}

.chat-content-wrap {
    display: flex;
    flex-direction: column;
    max-width: 70%;
}

.chat-bubble {
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    word-break: break-all;
}

.bubble-left {
    background: #f0f0f0;
    border-top-left-radius: 2px;
    color: #333;
}

.bubble-right {
    background: #95ec69;
    border-top-right-radius: 2px;
    color: #333;
}

.chat-time-label {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
}

.chat-left .chat-time-label {
    text-align: left;
}

.chat-right .chat-time-label {
    text-align: right;
}
</style>