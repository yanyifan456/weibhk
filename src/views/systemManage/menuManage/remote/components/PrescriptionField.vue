<template>
    <div style="margin-bottom: 4px;">
        <span>{{ label }}</span>

        <span :style="{
            display: 'inline-block',
            borderBottom: '1px solid #555',
            minWidth: minWidth,
            marginLeft: '8px'
        }">
            {{ value }}
        </span>
    </div>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        required: true,
    },

    value: {
        type: String,
        default: '',
    },

    minWidth: {
        type: String,
        default: '180px',
    },
})
</script>