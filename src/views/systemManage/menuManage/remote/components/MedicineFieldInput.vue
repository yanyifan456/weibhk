<template>
    <div style="display: flex; align-items: center; gap: 4px;">
        <span style="white-space: nowrap; font-size: 12px; color: #666;">
            {{ label }}：
        </span>

        <a-input :value="modelValue" :placeholder="placeholder" :style="{ width }" :maxlength="maxlength" size="small" @input="handleInput" />
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
    maxlength: {
        type: Number,
        default: undefined,
    },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (e) => {
    let val = e.target.value;
    if (props.maxlength && val.length > props.maxlength) {
        val = val.slice(0, props.maxlength);
    }
    emit('update:modelValue', val);
}
</script>