<template>
  <div id="globalSider">
    <a-layout-sider
      v-if="loginUserStore.loginUser.id"
      width="200"
      breakpoint="lg"
      collapsed-width="0"
      :trigger="null"
      collapsible
      v-model:collapsed="collapsed"
      class="sider-component"
      @breakpoint="onBreakpoint"
    >
      <a-menu
        v-model:selectedKeys="current"
        mode="inline"
        :items="menuItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
    
    <div 
      v-if="loginUserStore.loginUser.id" 
      class="sider-trigger"
      :class="{ 'sider-trigger-collapsed': collapsed }"
      @click="toggleCollapsed"
    >
      <menu-unfold-outlined v-if="collapsed" />
      <menu-fold-outlined v-else />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'
import { PictureOutlined, TeamOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { SPACE_TYPE_ENUM } from '@/constants/space'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()
const router = useRouter()
const collapsed = ref(false)
const current = ref([])
const teamSpaceList = ref<API.SpaceUserVO[]>([])

// 固定的菜单列表
const fixedMenuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon: () => h(TeamOutlined),
  },
]

// 计算菜单项
const menuItems = computed(() => {
  if (teamSpaceList.value.length < 1) return fixedMenuItems
  
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => ({
    key: '/space/' + spaceUser.spaceId,
    label: spaceUser.space?.spaceName,
  }))
  
  return [
    ...fixedMenuItems, 
    {
      type: 'group',
      label: '我的团队',
      key: 'teamSpace',
      children: teamSpaceSubMenus,
    }
  ]
})

// 断点变化处理
const onBreakpoint = (broken) => {
  updateContentClass(broken || collapsed.value)
}

// 切换侧边栏折叠状态
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  updateContentClass(collapsed.value)
}

// 更新内容区域样式
const updateContentClass = (isCollapsed) => {
  const contentElement = document.querySelector('#basicLayout .content')
  if (contentElement) {
    if (isCollapsed) {
      contentElement.classList.add('collapsed')
    } else {
      contentElement.classList.remove('collapsed')
    }
  }
}

// 加载团队空间列表
const fetchTeamSpaceList = async () => {
  try {
    const res = await listMyTeamSpaceUsingPost()
    if (res.data.code === 0 && res.data.data) {
      teamSpaceList.value = res.data.data
    } else {
      message.error('加载我的团队空间失败，' + res.data.message)
    }
  } catch (error) {
    message.error('加载团队空间失败')
  }
}

// 获取菜单项的key
const getMenuKey = (path) => {
  // 处理特殊情况：从我的空间进入的空间页面
  if (path.startsWith('/space/')) {
    const fromMySpace = sessionStorage.getItem('fromMySpace') === 'true'
    if (fromMySpace) return '/my_space'
    return path
  }
  
  // 处理我的空间路径
  if (path === '/my_space') {
    sessionStorage.setItem('fromMySpace', 'true')
    return '/my_space'
  }
  
  // 其他路径清除标记
  if (path !== '/my_space' && !path.startsWith('/space/')) {
    sessionStorage.removeItem('fromMySpace')
  }
  
  // 匹配固定菜单项
  for (const item of fixedMenuItems) {
    if (item.key.includes('?')) {
      const basePath = item.key.split('?')[0]
      if (path === basePath) return item.key
    }
    if (item.key === path) return item.key
  }
  
  return path
}

// 菜单点击事件
const doMenuClick = ({ key }) => {
  if (key === '/my_space') {
    sessionStorage.setItem('fromMySpace', 'true')
  } else {
    sessionStorage.removeItem('fromMySpace')
  }
  router.push(key)
}

// 初始化当前路由的菜单高亮
const initCurrentMenu = () => {
  if (router.currentRoute.value) {
    const path = router.currentRoute.value.path
    if (path.startsWith('/space/') && sessionStorage.getItem('fromMySpace') === 'true') {
      current.value = ['/my_space']
    } else {
      current.value = [getMenuKey(path)]
    }
  }
}

// 监听路由变化，更新当前选中菜单
router.afterEach((to) => {
  current.value = [getMenuKey(to.path)]
})

// 监听登录状态，加载数据和初始化菜单
watchEffect(() => {
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
    initCurrentMenu()
  }
})
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}

.sider-component {
  overflow: hidden;
}

.sider-trigger {
  position: fixed;
  top: 72px;
  left: 200px;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #fff;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  border-left: none;
  z-index: 21;
  transition: left 0.3s;
}

.sider-trigger-collapsed {
  left: 0;
}

:deep(.ant-menu-item-selected) {
  background-color: #e6f7ff !important;
}

:deep(.ant-layout-sider-collapsed) {
  min-width: 0 !important;
  width: 0 !important;
}
</style>