<template>
  <div id="pictureDetailPage">
    <a-row :gutter="[24, 24]">
      <!-- 图片预览 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览" class="preview-card" :loading="!picture.url">
          <template #extra>
            <a-space>
              <a-button type="primary" @click="doDownload" class="action-button">
                下载
                <template #icon>
                  <DownloadOutlined />
                </template>
              </a-button>
              <a-button :icon="h(ShareAltOutlined)" type="primary" ghost @click="doShare" class="action-button">
                分享
              </a-button>
            </a-space>
          </template>
          <div class="image-container">
            <a-image :src="picture.url" class="preview-image" />
          </div>
        </a-card>
      </a-col>
      
      <!-- 图片信息区域 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息" class="info-card" :loading="!picture.id">
          <a-descriptions :column="1" bordered size="small" class="info-descriptions">
            <a-descriptions-item label="作者" class="author-item">
              <a-space>
                <a-avatar :size="32" :src="picture.user?.userAvatar" class="author-avatar" />
                <div class="author-name">{{ picture.user?.userName || '未知作者' }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              <div class="info-value">{{ picture.name ?? '未命名' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              <div class="info-value description-text">{{ picture.introduction ?? '-' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              <a-tag color="#3E7BFA" class="category-tag">{{ picture.category ?? '默认' }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <div class="tags-container">
                <a-tag v-for="tag in picture.tags" :key="tag" class="info-tag">
                  {{ tag }}
                </a-tag>
                <div v-if="!picture.tags?.length" class="empty-value">-</div>
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              <div class="info-value">{{ picture.picFormat ?? '-' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="尺寸">
              <div class="info-value">{{ picture.picWidth ? `${picture.picWidth} × ${picture.picHeight}` : '-' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              <div class="info-value">{{ picture.picScale ?? '-' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              <div class="info-value">{{ formatSize(picture.picSize) }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="主色调">
              <a-space>
                <div class="info-value">{{ picture.picColor ?? '-' }}</div>
                <div v-if="picture.picColor" class="color-preview" :style="{
                  backgroundColor: toHexColor(picture.picColor),
                }" />
              </a-space>
            </a-descriptions-item>
          </a-descriptions>
          
          <!-- 图片操作 -->
          <div class="action-buttons">
            <a-button v-if="canEdit" :icon="h(EditOutlined)" type="default" @click="doEdit" class="edit-button">
              编辑
            </a-button>
            <a-button v-if="canDelete" :icon="h(DeleteOutlined)" danger @click="doDelete" class="delete-button">
              删除
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { downloadImage, formatSize, toHexColor } from '@/utils'
import ShareModal from '@/components/ShareModal.vue'
import { SPACE_PERMISSION_ENUM } from '@/constants/space.ts'

interface Props {
  id: string | number
}

const props = defineProps<Props>()
const picture = ref<API.PictureVO>({})

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// 获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
  }
}

onMounted(() => {
  fetchPictureDetail()
})

const router = useRouter()

// 编辑
const doEdit = () => {
  router.push({
    path: '/add_picture',
    query: {
      id: picture.value.id,
      spaceId: picture.value.spaceId,
    },
  })
}

// 删除数据
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    router.push('/')
  } else {
    message.error('删除失败')
  }
}

// 下载图片
const doDownload = () => {
  downloadImage(picture.value.url)
}

// ----- 分享操作 ----
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>()
// 分享
const doShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
#pictureDetailPage {
  margin-bottom: 24px;
}

.preview-card, .info-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  height: 100%;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  max-height: 600px;
  object-fit: contain;
  border-radius: 4px;
}

.info-descriptions {
  margin-bottom: 24px;
}

.author-item {
  height: 48px;
}

.author-avatar {
  border: 2px solid rgba(62, 123, 250, 0.2);
}

.author-name {
  font-weight: 500;
}

.info-value {
  color: #333;
}

.description-text {
  max-height: 80px;
  overflow-y: auto;
  white-space: pre-line;
}

.empty-value {
  color: #999;
}

.category-tag {
  border-radius: 16px;
  font-weight: 500;
  padding: 0 10px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-tag {
  border-radius: 16px;
  background-color: #f0f5ff;
  border-color: #d6e4ff;
  color: #3E7BFA;
  margin: 0;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.action-button, .edit-button, .delete-button {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-button:hover, .edit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.delete-button:hover {
  background-color: #ff4d4f;
  color: white;
  border-color: #ff4d4f;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(255, 77, 79, 0.2);
}
</style>