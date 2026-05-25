<template>
    <div class="remote-consultation">
        <a-card style="margin-bottom: 16px;">
            <!-- 月份导航 -->
            <div class="month-navigation">
                <a-button type="primary" size="small" @click="prevMonth">
                    <LeftOutlined />
                </a-button>
                <span class="month-text">
                    <LeftOutlined @click="prevMonth" style="cursor: pointer; margin-right: 8px;" />
                    {{ currentYear }}{{ t('schedule.year') }}{{ currentMonth }}{{ t('schedule.month') }}
                    <RightOutlined @click="nextMonth" style="cursor: pointer; margin-left: 8px;" />
                </span>
                <a-button type="primary" size="small" @click="nextMonth">
                    <RightOutlined />
                </a-button>
            </div>
            <!-- 周日期选择器 -->
            <div class="week-selector">
                <LeftOutlined class="week-arrow" @click="prevWeek" />
                <div class="week-days">
                    <div v-for="(day, index) in weekDays" :key="index"
                        :class="['week-day', { 'week-day-active': day.date === selectedDate }]"
                        @click="selectDate(day.date)">
                        <div class="week-day-name">{{ day.weekName }}</div>
                        <div class="week-day-date">{{ day.dateText }}</div>

                    </div>
                </div>
                <RightOutlined class="week-arrow" @click="nextWeek" />
            </div>
            <!-- 图例 -->
            <div class="legend">
                <span class="legend-item">
                    <span class="legend-dot legend-dot-inactive"></span>
                    {{ t('schedule.unscheduled') }}
                </span>
                <span class="legend-item">
                    <span class="legend-dot legend-dot-active"></span>
                    {{ t('schedule.scheduled') }}
                </span>
            </div>
            <!-- 时间段网格 -->
            <div class="time-grid">
                <div v-for="item in scheduleList" :key="item.id"
                    :class="['time-slot', { 'time-slot-active': item.scheduleTag === '1' }]"
                    @click="toggleSchedule(item)">
                    {{ formatTimeDisplay(item.scheduleTime) }}
                    <div class="doctor-name">{{ item.userName }}</div>
                </div>
            </div>
        </a-card>

        <!-- 取消预约弹窗 -->
        <a-modal v-model:open="cancelModalVisible" :title="modalTitle" @ok="handleModalConfirm"
            @cancel="handleModalClose" :confirmLoading="modalLoading">
            <div class="detail-info" v-if="currentScheduleItem?.scheduleTag === '1' && currentScheduleItem?.userId">
                <p><span class="label">预约人：</span>{{ detailInfo?.userName || detailInfo?.orderUserName }}</p>
                <p><span class="label">联系电话：</span>{{ detailInfo?.phone || '暂无' }}</p>
                <p><span class="label">诊费：</span>{{ detailInfo?.orderFee || '暂无' }}</p>
            </div>
            <div class="cancel-reason" v-if="currentScheduleItem?.scheduleTag === '1' && currentScheduleItem?.userId">
                <span class="label">取消原因：</span>
                <a-textarea v-model:value="cancelCase" placeholder="请输入取消原因" :rows="3" />
            </div>
            <div class="confirm-info" v-else-if="currentScheduleItem?.scheduleTag === '1'">
                <p>确定要将此时间段设置为<strong>不可预约</strong>吗？</p>
            </div>
            <div class="confirm-info" v-else>
                <p>确定要将此时间段设置为<strong>可预约</strong>吗？</p>
            </div>
        </a-modal>
    </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { message } from "ant-design-vue";
import { LeftOutlined, RightOutlined } from "@ant-design/icons-vue";
import { choice, updateMid, detail } from "@/api/yyf.js";
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
// 当前日期状态
const currentYear = ref(2026);
const currentMonth = ref(7);
const selectedDate = ref("");
const weekStartDate = ref(null);
// 数据列表
const scheduleList = ref([]);
const loading = ref(false);

// 取消预约弹窗相关
const cancelModalVisible = ref(false);
const modalLoading = ref(false);
const modalTitle = ref('预约详情');
const cancelCase = ref("");
const detailInfo = ref({
    orderUserName: "",
    userName: "",
    phone: "",
    orderFee: ""
});
const currentScheduleItem = ref(null);

// 计算当前周的日期列表
const weekDays = computed(() => {
    if (!weekStartDate.value) return [];
    const days = [];
    const weekNames = [
        t('schedule.monday'),
        t('schedule.tuesday'),
        t('schedule.wednesday'),
        t('schedule.thursday'),
        t('schedule.friday'),
        t('schedule.saturday'),
        t('schedule.sunday')
    ];

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStartDate.value);
        date.setDate(date.getDate() + i);

        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dateStr = formatDate(date);

        days.push({
            weekName: weekNames[i],
            dateText: `${month}${t('schedule.month')}${day}日`,
            date: dateStr
        });
    }
    return days;
});

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// 格式化时间显示 (移除秒数，添加空格)
const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "";
    // 08:00-08:30 => 8:00-8:30
    return timeStr.replace(/:00/g, ":00").replace(/:30/g, ":30");
};

// 初始化周起始日期
const initWeekStartDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 周一为起始
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    weekStartDate.value = monday;
    selectedDate.value = formatDate(today);
    currentYear.value = today.getFullYear();
    currentMonth.value = today.getMonth() + 1;
};

// 上一个月
const prevMonth = () => {
    if (currentMonth.value === 1) {
        currentMonth.value = 12;
        currentYear.value--;
    } else {
        currentMonth.value--;
    }
    // 跳转到该月第一周的周一
    const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(firstDay);
    monday.setDate(firstDay.getDate() + diff);
    weekStartDate.value = monday;
    selectedDate.value = formatDate(firstDay);
    fetchScheduleData();
};

// 下一个月
const nextMonth = () => {
    if (currentMonth.value === 12) {
        currentMonth.value = 1;
        currentYear.value++;
    } else {
        currentMonth.value++;
    }
    // 跳转到该月第一周的周一
    const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(firstDay);
    monday.setDate(firstDay.getDate() + diff);
    weekStartDate.value = monday;
    selectedDate.value = formatDate(firstDay);
    fetchScheduleData();
};

// 上一周
const prevWeek = () => {
    const newDate = new Date(weekStartDate.value);
    newDate.setDate(newDate.getDate() - 7);
    weekStartDate.value = newDate;
    selectedDate.value = formatDate(newDate);
    updateCurrentMonthYear();
    fetchScheduleData();
};

// 下一周
const nextWeek = () => {
    const newDate = new Date(weekStartDate.value);
    newDate.setDate(newDate.getDate() + 7);
    weekStartDate.value = newDate;
    selectedDate.value = formatDate(newDate);
    updateCurrentMonthYear();
    fetchScheduleData();
};

// 更新当前月份和年份显示
const updateCurrentMonthYear = () => {
    const date = new Date(selectedDate.value);
    currentYear.value = date.getFullYear();
    currentMonth.value = date.getMonth() + 1;
};

// 选择日期
const selectDate = (date) => {
    selectedDate.value = date;
    updateCurrentMonthYear();
    fetchScheduleData();
};

// 获取排班数据
const fetchScheduleData = async () => {
    loading.value = true;
    try {
        const res = await choice({
            loginName: sessionStorage.getItem("username"),
            currentTime: selectedDate.value
        });
        if (res.code === "200" && res.data && res.data.data) {
            scheduleList.value = res.data.data;
        }
    } catch (error) {
        console.error("获取排班数据失败:", error);
        // message.error(t('schedule.fetchFailed'));
    } finally {
        loading.value = false;
    }
};

// 切换排班状态
const toggleSchedule = async (item) => {
    currentScheduleItem.value = item;

    // 如果是已预约状态且有用户预约，显示详情并允许取消
    if (item.scheduleTag === '1' && item.userId) {
        modalTitle.value = '预约详情';
        cancelModalVisible.value = true;

        try {
            const res = await detail({ id: item.id });
            if (res.code === "200" && res.data) {
                detailInfo.value = res.data.data || {};
                cancelCase.value = "";
            } else {
                message.error(res.data?.message || "获取详情失败");
                cancelModalVisible.value = false;
            }
        } catch (error) {
            console.error("获取详情失败:", error);
            message.error("获取详情失败");
            cancelModalVisible.value = false;
        }
    } else if (item.scheduleTag === '1') {
        // 可预约但没有被预约，确认是否要设置为不可预约
        modalTitle.value = '设置为不可预约';
        cancelCase.value = "";
        cancelModalVisible.value = true;
    } else {
        // 不可预约状态，确认是否要设置为可预约
        modalTitle.value = '确认可预约';
        cancelCase.value = "";
        cancelModalVisible.value = true;
    }
}


// 确认操作
const handleModalConfirm = async () => {
    if (!currentScheduleItem.value) return;

    // 如果是取消预约（已有预约记录），需要填写取消原因
    if (currentScheduleItem.value.scheduleTag === '1' && currentScheduleItem.value.userId) {
        if (!cancelCase.value || cancelCase.value.trim() === '') {
            message.warning('请输入取消原因');
            return;
        }
    }

    modalLoading.value = true;
    try {
        // 确定新的scheduleTag值
        const newScheduleTag = currentScheduleItem.value.scheduleTag === '1' ? '0' : '1';

        const res = await updateMid({
            id: currentScheduleItem.value.id,
            scheduleTag: newScheduleTag,
            scheduleDay: currentScheduleItem.value.scheduleDay,
            scheduleTime: currentScheduleItem.value.scheduleTime,
            cancelCase: cancelCase.value || ''
        });

        if (res.code === "200" || res.data?.data === '1') {
            message.success(newScheduleTag === '0' ? t('schedule.setUnavailable') : '已设置为可预约');
            cancelModalVisible.value = false;
            fetchScheduleData();
        } else {
            message.error(res.data?.message || '操作失败');
        }
    } catch (error) {
        console.error("更新排班失败:", error);
        message.error(t('schedule.updateFailed'));
    } finally {
        modalLoading.value = false;
    }
};

// 关闭弹窗
const handleModalClose = () => {
    cancelModalVisible.value = false;
    cancelCase.value = "";
    currentScheduleItem.value = null;
    detailInfo.value = {
        orderUserName: "",
        userName: "",
        phone: "",
        orderFee: ""
    };
};

// 组件挂载
onMounted(() => {
    initWeekStartDate();
    fetchScheduleData();
});
</script>

<style scoped lang="scss">
.remote-consultation {
    padding: 16px;
    background: #f5f5f5;
    // min-height: 100vh;
}

.month-navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    gap: 12px;

    .month-text {
        font-size: 18px;
        font-weight: 500;
        color: #333;
        display: flex;
        align-items: center;
    }
}

.week-selector {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #e8e8e8;
    padding-bottom: 16px;

    .week-arrow {
        cursor: pointer;
        color: #999;
        font-size: 14px;
        padding: 8px;

        &:hover {
            color: #1890ff;
        }
    }

    .week-days {
        display: flex;
        flex: 1;
        justify-content: space-between;
    }

    .week-day {
        text-align: center;
        padding: 12px 20px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s;
        min-width: 80px;

        &:hover {
            background: #e6f7ff;
        }

        &-active {
            background: #1890ff;
            color: #fff;

            &:hover {
                background: #1890ff;
            }

            .week-day-name,
            .week-day-date {
                color: #fff;
            }
        }

        &-name {
            font-size: 14px;
            color: #333;
            margin-bottom: 4px;
        }

        &-date {
            font-size: 12px;
            color: #999;
        }
    }
}

.legend {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 24px;

    .legend-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #666;
    }

    .legend-dot {
        width: 16px;
        height: 16px;
        border-radius: 2px;
        margin-right: 8px;

        &-inactive {
            background: #fff;
            border: 1px solid #d9d9d9;
        }

        &-active {
            background: #1890ff;
        }
    }
}

.time-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 40px;

    .time-slot {
        position: relative;
        text-align: center;
        padding: 20px 8px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        background: #fff;
        transition: all 0.3s;

        &:hover {
            border-color: #1890ff;
        }

        &-active {
            background: #1890ff;
            color: #fff;
            border-color: #1890ff;

            &:hover {
                background: #40a9ff;
            }
        }
    }

    .doctor-name {
        position: absolute;
        right: 6px;
        bottom: 4px;
        font-size: 12px;
    }
}

.detail-info {
    margin-bottom: 16px;

    p {
        margin-bottom: 8px;
        font-size: 14px;
        color: #333;
    }

    .label {
        color: #666;
    }
}

.cancel-reason {
    display: flex;
    align-items: flex-start;
    margin-top: 16px;

    .label {
        white-space: nowrap;
        margin-right: 8px;
        color: #666;
        padding-top: 8px;
    }
}

.confirm-info {
    padding: 16px 0;
    text-align: center;
    font-size: 14px;
    color: #666;

    p {
        margin: 0;
    }
}
</style>