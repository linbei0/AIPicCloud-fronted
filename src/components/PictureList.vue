<template>
  <div class="picture-list">
    <!-- 图片列表 -->
    <a-list :grid="{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }" :data-source="dataList"
      :loading="loading">
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0 0 24px 0">
          <!-- 单张图片 -->
          <a-card hoverable @click="doClickPicture(picture)" class="picture-card">
            <template #cover>
              <div class="image-container">
                <img :alt="picture.name" :src="picture.thumbnailUrl ?? picture.url" class="card-image" />
              </div>
            </template>
            <a-card-meta :title="picture.name" class="card-meta">
              <template #description>
                <a-flex wrap="wrap" gap="small">
                  <a-tag color="#3E7BFA" class="category-tag">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template v-if="showOp" #actions>
              <div class="action-icon-wrapper">
                <a-button type="text" class="action-button" @click.stop="doShare(picture, $event)">
                  <ShareAltOutlined />
                </a-button>
              </div>
              <div class="action-icon-wrapper">
                <a-button type="text" class="action-button" @click.stop="doSearch(picture, $event)">
                  <SearchOutlined />
                </a-button>
              </div>
              <div v-if="canEdit" class="action-icon-wrapper">
                <a-button type="text" class="action-button" @click.stop="doEdit(picture, $event)">
                  <EditOutlined />
                </a-button>
              </div>
              <div v-if="canDelete" class="action-icon-wrapper">
                <a-button type="text" class="action-button delete-button" @click.stop="doDelete(picture, $event)">
                  <DeleteOutlined />
                </a-button>
              </div>
            </template>
          </a-card>
        </a-list-item>
      </template>
      <template #empty>
        <div class="empty-container">
          <a-empty description="暂无图片" />
        </div>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { deletePictureUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import ShareModal from '@/components/ShareModal.vue'
import { ref } from 'vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onReload?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
})

const router = useRouter()
// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 搜索
const doSearch = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  // 打开新的页面
  window.open(`/search_picture?pictureId=${picture.id}`)
}

// 编辑
const doEdit = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  // 跳转时一定要携带 spaceId
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

// 删除数据
const doDelete = async (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}

// ----- 分享操作 ----
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>()
// 分享
const doShare = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
.picture-list {
  margin-bottom: 24px;
}

.picture-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.picture-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--hover-shadow);
}

.image-container {
  overflow: hidden;
  position: relative;
  padding-top: 75%; /* 4:3 宽高比 */
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.picture-card:hover .card-image {
  transform: scale(1.05);
}

.card-meta {
  padding: 8px 0;
}

.category-tag {
  border-radius: 16px;
  font-weight: 500;
  padding: 0 10px;
}

.action-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-button {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
  margin: 0;
  padding: 0;
}

.action-button:hover {
  background-color: #f0f5ff;
  color: #3E7BFA;
}

.delete-button:hover {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.empty-container {
  padding: 40px 0;
  text-align: center;
}
</style>