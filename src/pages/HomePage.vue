<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-section">
      <h1 class="search-title">探索海量精彩图片</h1>
      <div class="search-bar">
        <a-input-search placeholder="输入关键词搜索图片..." v-model:value="searchParams.searchText" enter-button="搜索" size="large"
          @search="doSearch" class="search-input" />
      </div>
    </div>
    
    <!-- 分类 + 标签 -->
    <div class="filter-section">
      <a-tabs v-model:activeKey="selectedCategory" @change="doSearch" class="category-tabs">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
      </a-tabs>
      
      <div class="tag-bar">
        <span class="tag-label">标签：</span>
        <a-space :size="[8, 12]" wrap>
          <a-checkable-tag v-for="(tag, index) in tagList" :key="tag" v-model:checked="selectedTagList[index]"
            @change="doSearch" class="filter-tag">
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>
    
    <!-- 图片列表 -->
    <PictureList :dataList="dataList" :loading="loading" />
    
    <!-- 分页 -->
    <div class="pagination-container">
      <a-pagination 
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize" 
        :total="total" 
        @change="onPageChange"
        show-quick-jumper
        :page-size-options="['12', '24', '36', '48']"
        show-size-changer
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { listPictureVoByPageUsingPost, listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import PictureList from '@/components/PictureList.vue'
// 数据  
const dataList = ref([])
const total = ref(0)
const loading = ref(true)

// 搜索条件  
const searchParams = reactive<API.PictureQueryRequest>({
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
    ...searchParams,
    tags: [],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 分页参数  
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

const doSearch = () => {
  // 重置搜索条件  
  searchParams.current = 1
  fetchData()
}
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<string[]>([])

// 获取标签和分类选项  
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式  
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
    // 初始化选中状态数组
    selectedTagList.value = new Array(tagList.value.length).fill(false)
  } else {
    message.error('加载分类标签失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
  fetchData()
})
</script>

<style scoped>
.search-section {
  text-align: center;
  margin-bottom: 32px;
  padding: 32px 0;
  background: linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.search-bar {
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-section {
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: var(--card-shadow);
}

.category-tabs {
  margin-bottom: 16px;
}

.tag-bar {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.tag-label {
  margin-right: 12px;
  font-weight: 500;
  padding-top: 5px;
}

.filter-tag {
  border-radius: 16px;
  padding: 0 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.filter-tag:hover {
  transform: translateY(-2px);
}

.pagination-container {
  text-align: center;
  margin-top: 32px;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}
</style>
