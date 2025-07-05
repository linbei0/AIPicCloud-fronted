<template>
  <div id="userCenterPage">
    <a-card title="个人中心" :bordered="false" style="box-shadow: 0 2px 8px rgba(0,0,0,0.1)">
      <a-spin :spinning="loading" size="large">
        <a-descriptions bordered column="1" size="middle">
          <a-descriptions-item label="头像">
            <!-- flex布局包裹头像和上传按钮 -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <a-avatar :size="64" :src="userInfo.userAvatar" @click="handleAvatarPreview" style="cursor: pointer" />
              <!-- 头像上传按钮 -->
              <a-button type="link" @click="showFilePicker" :loading="avatarLoading">
                <template #icon><right-outlined /></template>
              </a-button>
              <!-- 隐藏的文件输入 -->
              <input ref="fileInput" type="file" accept="image/*" hidden @change="handleAvatarChange" />
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="用户名">{{ userInfo.userName }}</a-descriptions-item>
          <a-descriptions-item label="账号">{{ userInfo.userAccount }}</a-descriptions-item>
          <a-descriptions-item label="简介">{{ userInfo.userProfile || '暂无简介' }}</a-descriptions-item>
          <a-descriptions-item label="用户角色">
            <a-tag color="blue" v-if="userInfo.userRole === 'user'">普通用户</a-tag>
            <a-tag color="green" v-else>管理员</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="用户id">
            <a-tag color="blue">{{ userInfo.id }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-spin>
      <div style="display: flex; justify-content: center; margin-top: 16px;">
        <a-button type="primary" @click="handleEdit">
          修改资料
        </a-button>
      </div>
    </a-card>

    <!-- 修改资料模态框 -->
    <a-modal v-model:visible="editVisible" title="修改资料" :mask-closable="false" @ok="saveEdit" @cancel="resetEdit">
      <a-form :model="editUser" layout="vertical">
        <a-form-item label="用户名">
          <a-input v-model:value="editUser.userName" />
        </a-form-item>
        <a-form-item label="简介">
          <a-textarea v-model:value="editUser.userProfile" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 头像预览模态框 -->
    <a-modal v-model:visible="previewVisible" title="头像预览" footer="" @cancel="previewVisible = false">
      <img :src="userInfo.userAvatar" alt="头像预览" style="width: 100%" />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getLoginUserUsingGet, editUserUsingPost, updateUserAvatarUsingPost } from '@/api/userController'
import { Modal, Form, FormItem, Input, Textarea, message } from 'ant-design-vue'
import { RightOutlined } from '@ant-design/icons-vue'

// 注册组件
const components = {
  aModal: Modal,
  aForm: Form,
  aFormItem: FormItem,
  aInput: Input,
  aTextarea: Textarea
}

// 用户信息状态
const userInfo = ref<API.LoginUserVO>({})
const loading = ref(true)
const previewVisible = ref(false)

// 编辑相关状态
const editVisible = ref(false)
const editUser = ref({
  id: '',
  userName: '',
  userProfile: ''
})


const fileInput = ref()
const avatarLoading = ref(false)

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0) {
      userInfo.value = res.data.data || {}
    } else {
      message.error('获取用户信息失败：' + res.data.message)
    }
  } catch (error) {
    message.error('请求失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 头像预览方法
const handleAvatarPreview = () => {
  previewVisible.value = true
}

// 显示文件选择器
const showFilePicker = () => {
  fileInput.value.click()
}

// 处理头像上传
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 文件校验
  const isValid = await beforeAvatarUpload(file)
  if (!isValid) return

  avatarLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await updateUserAvatarUsingPost({}, file)
    if (res.data.code === 0) {
      message.success('头像更新成功')
      // 刷新用户信息
      await fetchUserInfo()
    } else {
      message.error('头像更新失败：' + res.data.message)
    }
  } catch (error) {
    message.error('上传失败，请重试')
    console.error(error)
  } finally {
    avatarLoading.value = false
  }
}

// 头像上传前校验
const beforeAvatarUpload = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件')
      return resolve(false)
    }

    const isValidSize = file.size / 1024 / 1024 < 5
    if (!isValidSize) {
      message.error('图片大小不能超过5MB')
      return resolve(false)
    }

    resolve(true)
  })
}

// 处理编辑按钮点击
const handleEdit = () => {
  editUser.value = {
    id: userInfo.value.id,
    userName: userInfo.value.userName,
    userProfile: userInfo.value.userProfile
  }
  editVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  const res = await editUserUsingPost(editUser.value)
  if (res.data.code === 0) {
    message.success('更新成功')
    // 刷新用户信息
    await fetchUserInfo()
    editVisible.value = false
  } else {
    message.error('更新失败：' + res.data.message)
  }
}

// 重置编辑状态
const resetEdit = () => {
  editUser.value = {
    id: '',
    userName: '',
    userProfile: ''
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>