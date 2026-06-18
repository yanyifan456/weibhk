<!-- <script setup>
</script>

<template>

</template>

<style scoped>

</style> -->
<template>
    <a-config-provider :locale="locale" :theme="themeConfig">
        <!-- <div>6</div> -->
        <router-view></router-view>
    </a-config-provider>
</template>

<script>
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

// 全局主题色
const PRIMARY_COLOR = '#1A6B8A';

export default {
    data() {
        return {
            locale: zhCN,
            themeConfig: {
                token: {
                    colorPrimary: PRIMARY_COLOR,
                    colorLink: PRIMARY_COLOR,
                    colorInfo: PRIMARY_COLOR,
                },
                components: {
                    Menu: {
                        itemSelectedColor: PRIMARY_COLOR,
                        itemSelectedBg: 'rgba(26, 107, 138, 0.1)',
                        itemActiveBg: 'rgba(26, 107, 138, 0.1)',
                        subMenuItemSelectedColor: PRIMARY_COLOR,
                    },
                    Button: {
                        colorPrimary: PRIMARY_COLOR,
                        colorPrimaryHover: '#2a7e9e',
                        colorPrimaryActive: '#155b76',
                    },
                },
            },
        };
    },
};
</script>
