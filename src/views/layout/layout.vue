<template>
  <a-layout class="layout">
    <Side />
    <a-layout>
      <Header />
      <!--
          预留标签区域或者面包屑
      -->
      <Tabs />

      <Content />
      <Footer />
    </a-layout>
  </a-layout>
</template>

<script setup>
import Side from "@/views/layout/components/side.vue";
import Content from "@/views/layout/components/content.vue";
import Header from "@/views/layout/components/header.vue";
import Footer from "@/views/layout/components/footer.vue";
import Tabs from "@/views/layout/components/tabs.vue";

const route = useRoute();

// 可以通过路由元信息控制是否显示标签页
const showTabs = computed(() => route.meta.showTabs !== false);
</script>

<style scoped lang="scss"></style>
c