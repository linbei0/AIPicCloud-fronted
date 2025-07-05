<template>
  <div id="app">
    <a-config-provider :locale="zhCN">
      <BasicLayout />
    </a-config-provider>
      <a-config-provider
    :theme="{
      token: {
        colorPrimary: '#4169E1',
        borderRadius: 28,
        fontFamily:'Apple Color Emoji'
      },
    }"
  >
  </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

import BasicLayout from '@/layouts/BasicLayout.vue'
// import { useLoginUserStore } from "@/stores/useLoginUserStore.ts";
// const loginUserStore = useLoginUserStore()
// loginUserStore.fetchLoginUser()

</script>


<style scoped>
:root {
  --primary-color: #3E7BFA;
  --secondary-color: #6C5CE7;
  --accent-color: #00D2D3;
  --background-color: #F5F8FF;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --hover-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  --transition-speed: 0.3s;
}

body {
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: var(--background-color);
  color: #333;
  margin: 0;
  padding: 0;
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
