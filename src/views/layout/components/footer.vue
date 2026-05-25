<template>
  <div class="footer-container">
    <div class="footer">
       广州南沙信兴互联网医院有限公司 版权所有 © 2024 <span @click="open" class="icp-number">粤ICP备2024187661号</span>
    </div>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'

// 国际化
const { t } = useI18n()
const footertext = t('footer.text')

const open = () => {
  window.open('https://beian.miit.gov.cn/')
}
</script>
<style scoped lang="scss">
.footer-container {
  display: flex;
  justify-content: center;
  align-items: center;

  .footer {
    min-width: 200px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: gray;
  }
}
.icp-number{
  cursor: pointer;
}
.icp-number:hover{
  color: #1890ff;
}
</style>