<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <a-card class="space-header-card">
      <a-flex justify="space-between" align="center">
        <div class="space-title-container">
          <h2 class="space-title">{{ space.spaceName }}
            <a-tag class="space-type-tag" color="blue">{{ SPACE_TYPE_MAP[space.spaceType] }}</a-tag>
          </h2>
          <p class="space-description">{{ space.description || '暂无描述' }}</p>
        </div>
        <a-space size="middle" wrap>
          <a-button v-if="canUploadPicture" type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank"
            class="action-button">
            + 创建图片
          </a-button>
          <a-button v-if="canManageSpaceUser && SPACE_TYPE_ENUM.TEAM == space.spaceType" type="primary" ghost
            :icon="h(TeamOutlined)" :href="`/spaceUserManage/${id}`" target="_blank" class="action-button">
            成员管理
          </a-button>
          <a-button v-if="canManageSpaceUser" type="primary" ghost :icon="h(BarChartOutlined)"
            :href="`/space_analyze?spaceId=${id}`" target="_blank" class="action-button">
            空间分析
          </a-button>
          <a-button v-if="canEditPicture" :icon="h(EditOutlined)" @click="doBatchEdit" class="action-button">
            批量编辑
          </a-button>
          <a-tooltip :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`">
            <a-progress type="circle" :size="48" :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
              :stroke-color="getProgressColor(space.totalSize, space.maxSize)" class="space-progress" />
          </a-tooltip>
        </a-space>
      </a-flex>
    </a-card>

    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-tabs>
        <a-tab-pane key="basic" tab="基本搜索">
          <!-- 搜索表单 -->
          <PictureSearchForm :onSearch="onSearch" />
        </a-tab-pane>
        <a-tab-pane key="color" tab="颜色搜索">
          <!-- 按颜色搜索，跟其他搜索条件独立 -->
          <a-form-item label="选择颜色：" class="color-search-form">
            <color-picker format="hex" @pureColorChange="onColorChange" />
            <div class="color-hint">选择一个颜色，系统将查找包含该颜色的图片</div>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 图片列表 -->
    <PictureList :dataList="dataList" :loading="loading" :showOp="true" :canEdit="canEditPicture"
      :canDelete="canDeletePicture" :onReload="fetchData" />

    <!-- 分页 -->
    <div class="pagination-container">
      <a-pagination v-model:current="searchParams.current" v-model:pageSize="searchParams.pageSize" :total="total"
        @change="onPageChange" show-quick-jumper :page-size-options="['12', '24', '36', '48']" show-size-changer />
    </div>

    <BatchEditPictureModal ref="batchEditPictureModalRef" :spaceId="id" :pictureList="dataList"
      :onSuccess="onBatchEditPictureSuccess" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController.ts'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { BarChartOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_PERMISSION_ENUM, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '../constants/space.ts'

interface Props {
  id: string | number
}

const props = defineProps<Props>()
const space = ref<API.SpaceVO>({})

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// 获取进度条颜色
const getProgressColor = (totalSize, maxSize) => {
  const percent = (totalSize / maxSize) * 100;
  if (percent < 60) return '#52c41a';
  if (percent < 80) return '#faad14';
  return '#f5222d';
}

// -------- 获取空间详情 --------
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败：' + e.message)
  }
}

onMounted(() => {
  fetchSpaceDetail()
})

// --------- 获取图片列表 --------

// 定义数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    spaceId: props.id,
    ...searchParams.value,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

// 搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}

// 按照颜色搜索
const onColorChange = async (color: string) => {
  loading.value = true
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data ?? []
    dataList.value = data
    total.value = data.length
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// ---- 批量编辑图片 -----
const batchEditPictureModalRef = ref()

// 批量编辑图片成功
const onBatchEditPictureSuccess = () => {
  fetchData()
}

// 打开批量编辑图片弹窗
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}

// 空间 id 改变时，必须重新获取数据
watch(
  () => props.id,
  (newSpaceId) => {
    fetchSpaceDetail()
    fetchData()
  },
)
</script>

<style scoped>
#spaceDetailPage {
  margin-bottom: 24px;
}

.space-header-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}

.space-title-container {
  max-width: 70%;
}

.space-title {
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  color: #333;
}

.space-type-tag {
  font-size: 14px;
  padding: 0 10px;
  border-radius: 16px;
  background-color: var(--primary-color);
}

.space-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.space-progress {
  margin-left: 8px;
}

.search-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}

.color-search-form {
  margin-top: 16px;
}

.color-hint {
  margin-top: 8px;
  color: #888;
  font-size: 13px;
}

.action-button {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  text-align: center;
  margin-top: 32px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}
</style>