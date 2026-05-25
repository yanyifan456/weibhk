<template>
  <a-layout-content class="content-container">
    <RouterView />
  </a-layout-content>
</template>
<script setup></script>
<style scoped lang="scss">
.content-container {
  // margin: 12px 16px 0 16px;
  padding: 12px 24px;
  background: #f1f3f6;
  min-height: 280px;
  // border-radius: 5px;
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: auto;
  scrollbar-width: thin;
  border-bottom: 1px solid #e5e5e5;
}
</style>
