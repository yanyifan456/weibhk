<template>
    <!-- 30分钟倒计时浮窗，仅在通话中显示 -->
    <div v-if="isActive" class="video-call-timer" :class="{ 'timer-warning': isWarning }">
        <div class="timer-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8z" />
                <path
                    d="M7.5 3a.5.5 0 01.5.5v5.21l3.248 1.856a.5.5 0 01-.496.868l-3.5-2A.5.5 0 017 9V3.5a.5.5 0 01.5-.5z" />
            </svg>
        </div>
        <span class="timer-text">{{ formattedTime }}</span>
        <span v-if="isWarning" class="timer-warning-text">即将结束</span>
    </div>

    <!-- 最后5分钟警告提示 -->
    <a-alert v-if="showWarningAlert" message="通话即将结束" description="距离通话结束还有 5 分钟，请做好收尾准备。" type="warning" show-icon
        closable
        style="position: fixed; top: 80px; right: 20px; z-index: 10000; width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
        @close="showWarningAlert = false" />
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';

const props = defineProps({
    /** 是否处于通话中 */
    active: {
        type: Boolean,
        default: false,
    },
    /** 通话总时长（秒），默认 30 分钟 */
    totalSeconds: {
        type: Number,
        default: 30 * 60,
    },
    /** 提前几秒开始警告，默认最后 5 分钟 */
    warningSeconds: {
        type: Number,
        default: 5 * 60,
    },
});

const emit = defineEmits(['timeout', 'warning']);

const isActive = ref(false);
const remainingSeconds = ref(props.totalSeconds);
const showWarningAlert = ref(false);
const warningEmitted = ref(false);

let timer = null;

const isWarning = computed(() => remainingSeconds.value <= props.warningSeconds);

const formattedTime = computed(() => {
    const m = Math.floor(remainingSeconds.value / 60);
    const s = remainingSeconds.value % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const startTimer = () => {
    remainingSeconds.value = props.totalSeconds;
    warningEmitted.value = false;
    showWarningAlert.value = false;
    isActive.value = true;
    timer = setInterval(() => {
        remainingSeconds.value -= 1;

        // 最后5分钟触发一次警告
        if (remainingSeconds.value === props.warningSeconds && !warningEmitted.value) {
            warningEmitted.value = true;
            showWarningAlert.value = true;
            emit('warning');
            // 警告提示10秒后自动隐藏
            setTimeout(() => { showWarningAlert.value = false; }, 10000);
        }

        // 倒计时结束
        if (remainingSeconds.value <= 0) {
            stopTimer();
            emit('timeout');
        }
    }, 1000);
};

const stopTimer = () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    isActive.value = false;
    remainingSeconds.value = props.totalSeconds;
    showWarningAlert.value = false;
    warningEmitted.value = false;
};

// 监听 active 属性变化
watch(
    () => props.active,
    (val) => {
        if (val) {
            startTimer();
        } else {
            stopTimer();
        }
    },
    { immediate: true }
);

onUnmounted(() => {
    stopTimer();
});

// 暴露方法，供父组件直接调用
defineExpose({ startTimer, stopTimer });
</script>

<style scoped>
.video-call-timer {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10001;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 1px;
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: background 0.3s;
    user-select: none;
}

.video-call-timer.timer-warning {
    background: rgba(220, 38, 38, 0.88);
    animation: timerPulse 1.2s ease-in-out infinite;
}

.timer-icon {
    display: flex;
    align-items: center;
    opacity: 0.9;
}

.timer-text {
    font-variant-numeric: tabular-nums;
}

.timer-warning-text {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.9;
    margin-left: 2px;
}

@keyframes timerPulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.75;
    }
}
</style>
