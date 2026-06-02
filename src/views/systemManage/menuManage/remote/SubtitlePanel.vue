<template>
  <!-- 字幕面板：固定在页面底部，通话中显示 -->
  <div v-if="active" class="subtitle-panel">
    <!-- 顶部工具栏 -->
    <div class="subtitle-toolbar">
      <span class="subtitle-label">实时字幕</span>
      <!-- 语言切换 -->
      <div class="subtitle-lang-group">
        <button
          v-for="lang in langOptions"
          :key="lang.value"
          class="lang-btn"
          :class="{ active: outputFormat === lang.value }"
          @click="switchLang(lang.value)"
        >
          {{ lang.label }}
        </button>
      </div>
      <!-- 连接状态指示 -->
      <div class="subtitle-status">
        <span
          class="status-dot"
          :class="{
            'dot-connected': wsStatus === 'connected',
            'dot-connecting': wsStatus === 'connecting',
            'dot-disconnected': wsStatus === 'disconnected',
          }"
        ></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>

    <!-- 字幕内容区 -->
    <div class="subtitle-content" ref="subtitleContentRef">
      <div
        v-for="(item, idx) in subtitleList"
        :key="idx"
        class="subtitle-item"
        :class="{ 'subtitle-doctor': item.speakerRole === 'doctor', 'subtitle-user': item.speakerRole === 'user' }"
      >
        <span class="speaker-tag">{{ item.speakerRole === 'doctor' ? '医生' : '患者' }}</span>
        <span class="subtitle-text">{{ item.displayText }}</span>
      </div>
      <!-- 当前正在识别的行（中间结果） -->
      <div v-if="currentLine" class="subtitle-item subtitle-current">
        <span class="speaker-tag">{{ currentLine.speakerRole === 'doctor' ? '医生' : '患者' }}</span>
        <span class="subtitle-text">{{ currentLine.displayText }}<span class="cursor-blink">|</span></span>
      </div>
      <!-- 无内容时提示 -->
      <div v-if="!subtitleList.length && !currentLine" class="subtitle-empty">
        等待语音识别...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  /** 是否处于通话中 */
  active: {
    type: Boolean,
    default: false,
  },
  /** WebSocket 服务器地址，例如 ws://192.168.100.14:8089 */
  wsHost: {
    type: String,
    default: '',
  },
  /** 房间 ID（字符串或数字均可，内部统一转字符串拼 URL） */
  roomId: {
    type: [String, Number],
    default: '',
  },
  /** 当前用户 ID（医生端） */
  userId: {
    type: String,
    default: '',
  },
  /**
   * 当前转换格式，由父组件控制（simplified | traditional | none）
   * 对应语言按钮的高亮状态
   */
  outputFormat: {
    type: String,
    default: 'traditional', // 默认场景：香港医生(粤语)看内地患者(普通话)字幕 → 繁体
  },
});

const emit = defineEmits(['switch-lang']);

// ——— 语言选项（value 对应后端 doctorOutputFormat 枚举） ———
const langOptions = [
  { label: '简体中文', value: 'simplified' },
  { label: '繁體中文', value: 'traditional' },
  { label: 'English',  value: 'en' },
];

// ——— 字幕列表 ———
/** 已确定的字幕列表（isFinal=true） */
const subtitleList = ref([]);
/** 当前正在识别中的行（isFinal=false，会被覆盖） */
const currentLine = ref(null);
const subtitleContentRef = ref(null);

// ——— WebSocket 状态 ———
const wsStatus = ref('disconnected'); // 'connecting' | 'connected' | 'disconnected'
let subtitleWs = null;

const statusText = computed(() => {
  const map = { connecting: '连接中...', connected: '已连接', disconnected: '未连接' };
  return map[wsStatus.value] || '未连接';
});

// ——— 语言切换：通知父组件重启识别任务（outputFormat 变更），本地清空字幕 ———
const switchLang = (lang) => {
  if (props.outputFormat === lang) return;
  clearSubtitles();
  emit('switch-lang', lang);
};

// ——— 自动滚动到底部 ———
const scrollToBottom = async () => {
  await nextTick();
  if (subtitleContentRef.value) {
    subtitleContentRef.value.scrollTop = subtitleContentRef.value.scrollHeight;
  }
};

// ——— WebSocket 字幕连接 ———
const connectSubtitleWs = () => {
  if (!props.wsHost || !props.roomId || !props.userId) return;
  // 字幕 WS 路径：outputFormat 由后端在识别任务启动时已确定，无需 URL 参数
  const url = `${props.wsHost}/ws/subtitle/${props.roomId}/${props.userId}`;
  wsStatus.value = 'connecting';

  subtitleWs = new WebSocket(url);

  subtitleWs.onopen = () => {
    wsStatus.value = 'connected';
  };

  subtitleWs.onmessage = (event) => {
    try {
      const subtitle = JSON.parse(event.data);
      if (subtitle.type !== 'text') return;
      // 统一展示 convertedText（后端已按当前 outputFormat 转换），
      // 若为空（outputFormat=none 时 convertedText 可能与 originalText 相同）则降级用 originalText
      const displayText = subtitle.convertedText || subtitle.originalText || '';
      const item = { ...subtitle, displayText };
      if (subtitle.isFinal) {
        subtitleList.value.push(item);
        currentLine.value = null;
        if (subtitleList.value.length > 100) {
          subtitleList.value = subtitleList.value.slice(-80);
        }
      } else {
        currentLine.value = item;
      }
      scrollToBottom();
    } catch (e) {
      // 非 JSON 消息忽略
    }
  };

  subtitleWs.onclose = () => {
    wsStatus.value = 'disconnected';
  };

  subtitleWs.onerror = () => {
    wsStatus.value = 'disconnected';
  };
};

const disconnectSubtitleWs = () => {
  if (subtitleWs) {
    subtitleWs.close();
    subtitleWs = null;
  }
  wsStatus.value = 'disconnected';
};

// ——— 清空字幕 ———
const clearSubtitles = () => {
  subtitleList.value = [];
  currentLine.value = null;
};

// ——— 监听 active + 连接参数 ———
// active 变 false 时立即断开
watch(
  () => props.active,
  (val) => {
    if (!val) {
      disconnectSubtitleWs();
      clearSubtitles();
    }
  }
);

// 只要 active=true 且三个参数全部就绪，就（重新）连接
watch(
  () => [props.active, props.wsHost, props.roomId, props.userId],
  ([active, wsHost, roomId, userId]) => {
    if (active && wsHost && roomId && userId) {
      // 如果已有旧连接先断开
      disconnectSubtitleWs();
      clearSubtitles();
      connectSubtitleWs();
    }
  }
);

onUnmounted(() => {
  disconnectSubtitleWs();
});

defineExpose({ clearSubtitles, connectSubtitleWs, disconnectSubtitleWs });
</script>

<style scoped>
.subtitle-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9998;
  background: rgba(10, 10, 10, 0.88);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  max-height: 220px;
}

/* 工具栏 */
.subtitle-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.subtitle-label {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* 语言按钮组 */
.subtitle-lang-group {
  display: flex;
  gap: 6px;
}

.lang-btn {
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.lang-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.lang-btn.active {
  background: #1677ff;
  border-color: #1677ff;
  color: #fff;
}

/* 连接状态 */
.subtitle-status {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-connected {
  background: #52c41a;
  box-shadow: 0 0 6px #52c41a;
}

.dot-connecting {
  background: #faad14;
  animation: blink 1s ease-in-out infinite;
}

.dot-disconnected {
  background: #ff4d4f;
}

.status-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* 字幕内容区 */
.subtitle-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.subtitle-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.speaker-tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
  white-space: nowrap;
}

.subtitle-doctor .speaker-tag {
  background: rgba(22, 119, 255, 0.35);
  color: #91caff;
}

.subtitle-user .speaker-tag {
  background: rgba(82, 196, 26, 0.25);
  color: #95de64;
}

.subtitle-current .speaker-tag {
  background: rgba(250, 173, 20, 0.25);
  color: #ffd666;
}

.subtitle-text {
  color: rgba(255, 255, 255, 0.92);
}

.subtitle-empty {
  color: rgba(255, 255, 255, 0.35);
  font-size: 13px;
  text-align: center;
  padding: 12px 0;
}

/* 光标闪烁 */
.cursor-blink {
  display: inline-block;
  animation: blink 0.8s step-start infinite;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 1px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
