<template>
  <!-- 普通 Vue 层字幕面板，用于非通话中预览或测试 -->
  <!-- 通话中使用 plus.nativeObj.View 原生浮层，此组件在通话中隐藏 -->
  <view v-if="visible && !inCall" class="subtitle-panel">
    <!-- 语言切换按钮 -->
    <view class="lang-bar">
      <view
        v-for="lang in langOptions"
        :key="lang.value"
        class="lang-btn"
        :class="{ 'lang-btn--active': currentLang === lang.value }"
        @click="switchLang(lang.value)"
      >
        {{ lang.label }}
      </view>
    </view>
    <!-- 字幕列表 -->
    <scroll-view
      scroll-y
      class="subtitle-scroll"
      :scroll-top="scrollTop"
      scroll-with-animation
    >
      <view
        v-for="(item, idx) in subtitleList"
        :key="idx"
        class="subtitle-item"
        :class="item.speakerRole === 'doctor' ? 'subtitle-item--doctor' : 'subtitle-item--user'"
      >
        <text class="speaker-tag">{{ item.speakerRole === 'doctor' ? '醫生' : '患者' }}</text>
        <text class="subtitle-text">{{ getDisplayText(item) }}</text>
      </view>
      <!-- 中间结果行 -->
      <view v-if="currentLine" class="subtitle-item subtitle-item--current">
        <text class="speaker-tag">{{ currentLine.speakerRole === 'doctor' ? '醫生' : '患者' }}</text>
        <text class="subtitle-text">{{ getDisplayText(currentLine) }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  /** 组件是否可见 */
  visible: { type: Boolean, default: false },
  /** 是否正在通话（通话中使用原生浮层，此组件隐藏） */
  inCall: { type: Boolean, default: false },
  /** 字幕列表（已确认的最终结果） */
  subtitleList: { type: Array, default: () => [] },
  /** 当前中间结果行 */
  currentLine: { type: Object, default: null },
});

const emit = defineEmits(['switch-lang']);

// 语言选项：value 对应显示策略（与 Web 端对齐）
const langOptions = [
  { label: '简体中文', value: 'simplified' },
  { label: '繁體中文', value: 'traditional' },
  { label: 'English',  value: 'none' },
];

/**
 * 当前显示语言。
 * APP 端（患者）接收的字幕是医生说话的内容，后端按 patientOutputFormat 转换。
 * - simplified：显示 convertedText（繁→简后的文本）
 * - traditional：显示 originalText（医生原始粤语/繁体文本）
 * - none：显示 originalText（原文）
 * 切换语言仅影响前端显示字段，不需要重连 WS。
 */
const currentLang = ref('simplified');

const scrollTop = ref(0);

const switchLang = (lang) => {
  currentLang.value = lang;
  emit('switch-lang', lang);
};

/**
 * 根据语言设置返回要显示的文本
 * - simplified：后端已转换为简体，取 convertedText
 * - traditional/none：取原始文本 originalText
 */
const getDisplayText = (item) => {
  if (!item) return '';
  if (currentLang.value === 'simplified') {
    return item.convertedText || item.originalText || '';
  }
  return item.originalText || item.convertedText || '';
};

// 新字幕进来时滚动到底部
watch(
  () => props.subtitleList.length,
  () => {
    scrollTop.value = 99999;
  }
);
</script>

<style scoped lang="scss">
.subtitle-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 20rpx 20rpx 0 0;
  padding: 16rpx 24rpx 32rpx;
  z-index: 9999;
}

.lang-bar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 16rpx;
  gap: 16rpx;
}

.lang-btn {
  padding: 8rpx 28rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.lang-btn--active {
  background-color: #4080ff;
  color: #fff;
  border-color: #4080ff;
}

.subtitle-scroll {
  max-height: 300rpx;
}

.subtitle-item {
  margin-bottom: 12rpx;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.speaker-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.subtitle-item--doctor .speaker-tag {
  background: rgba(64, 128, 255, 0.5);
  color: #a8c8ff;
}

.subtitle-item--user .speaker-tag {
  background: rgba(82, 196, 26, 0.5);
  color: #b7eb8f;
}

.subtitle-item--current .speaker-tag {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
}

.subtitle-text {
  font-size: 28rpx;
  color: #fff;
  line-height: 1.5;
  flex: 1;
}
</style>
