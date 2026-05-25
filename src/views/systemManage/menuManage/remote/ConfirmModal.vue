<template>
    <!--
    二步确认弹窗：
    props:
      - step1Visible: 第一步弹窗是否显示
      - step2Visible: 第二步弹窗是否显示
      - step1Title: 第一步标题，默认"确认签署"
      - step2Title: 第二步标题，默认"确认签名"
      - step1Text:  第一步正文，默认"您确认签署？"
      - step2Text:  第二步正文，默认"您确认签名？"
    emits:
      - update:step1Visible
      - update:step2Visible
      - confirm  (第二步确认，最终触发)
  -->
    <div>
        <!-- 第一步确认弹窗 -->
        <a-modal :open="step1Visible" :title="step1Title" :width="360" ok-text="确定" cancel-text="取消" @ok="handleStep1Ok"
            @cancel="emit('update:step1Visible', false)">
            <p style="font-size: 16px; text-align: center; padding: 12px 0;">{{ step1Text }}</p>
        </a-modal>

        <!-- 第二步确认弹窗 -->
        <a-modal :open="step2Visible" :title="step2Title" :width="360" ok-text="确定" cancel-text="取消" @ok="handleStep2Ok"
            @cancel="emit('update:step2Visible', false)">
            <p style="font-size: 16px; text-align: center; padding: 12px 0;">{{ step2Text }}</p>
        </a-modal>
    </div>
</template>

<script setup>
const props = defineProps({
    step1Visible: { type: Boolean, default: false },
    step2Visible: { type: Boolean, default: false },
    step1Title: { type: String, default: '确认签署' },
    step2Title: { type: String, default: '确认签名' },
    step1Text: { type: String, default: '您确认签署？' },
    step2Text: { type: String, default: '您确认签名？' },
});

const emit = defineEmits([
    'update:step1Visible',
    'update:step2Visible',
    'confirm',
]);

/** 第一步点确定：关闭第一步，打开第二步 */
const handleStep1Ok = () => {
    emit('update:step1Visible', false);
    emit('update:step2Visible', true);
};

/** 第二步点确定：关闭第二步，触发最终 confirm */
const handleStep2Ok = () => {
    emit('update:step2Visible', false);
    emit('confirm');
};
</script>
