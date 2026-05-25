<template>
    <div style="display: flex; align-items: center; gap: 4px;">
        <span style="white-space: nowrap; font-size: 12px; color: #666;">
            {{ label }}：
        </span>

        <a-input :value="modelValue" :placeholder="placeholder" :style="{ width }" size="small" @input="handleInput" />
    </div>
</template>

<script setup>
const props = defineProps({
    label: String,
    modelValue: String,
    placeholder: String,
    width: {
        type: String,
        default: '100px',
    },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (e) => {
    emit('update:modelValue', e.target.value)
}
</script>