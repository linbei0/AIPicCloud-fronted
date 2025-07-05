<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <a-layout>
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <a-layout-footer class="footer">
        <div class="footer-content">云图库 © {{ new Date().getFullYear() }} - 让图片管理更简单</div>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from "@/components/GlobalHeader.vue";
import GlobalSider from "@/components/GlobalSider.vue";
</script>

<style scoped>
#basicLayout .header {
  padding-inline: 20px;
  margin-bottom: 1px;
  color: unset;
  background: white;
  position: fixed; /* 固定顶部导航栏 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

#basicLayout .content {
  background: var(--background-color);
  margin-bottom: 48px;
  padding: 24px;
  margin-left: 200px; /* 为固定侧边栏留出空间 */
  transition: all 0.3s;
  margin-top: 64px; /* 为固定的顶部导航栏留出空间 */
  width: auto; /* 确保内容区域宽度自适应 */
  min-height: calc(100vh - 64px - 48px);
  border-radius: 8px;
}

#basicLayout .sider {
  background: white;
  padding-top: 0; /* 移除顶部padding */
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  position: fixed; /* 固定侧边栏 */
  height: calc(100vh - 64px - 48px); /* 减去头部和底部的高度 */
  overflow-y: auto; /* 内容过多时可滚动 */
  z-index: 10;
  left: 0;
  top: 64px; /* 从顶部导航栏下方开始 */
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

#basicLayout .footer {
  background: white;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 5;
  height: 48px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.footer-content {
  color: #888;
  font-size: 14px;
}

/* 当侧边栏收起时调整内容区域 */
#basicLayout :deep(.ant-layout-sider-collapsed) + .content {
  margin-left: 0;
}

/* 添加一个新的类来处理侧边栏收起状态 */
#basicLayout .content.collapsed {
  margin-left: 0;
  width: 100%; /* 确保内容区域占满整个宽度 */
}

/* 添加媒体查询，在小屏幕上自动调整内容区域 */
@media (max-width: 992px) {
  #basicLayout .content {
    margin-left: 0;
    width: 100%;
    padding: 16px;
  }
}
</style>
