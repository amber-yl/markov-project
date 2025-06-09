<template>
  <section v-if="centerDialogVisible">
    <SimulationForm @cancel="handleCancel" @formSubmit="handleSubmit" />
  </section>
  <section v-else>
    <TopToolbar
      v-model="viewMode"
      :models="models"
      :modeName="modeName"
      @create="createNewSimulation"
      @change="handleModelChange"
      @scopeChange="handleScopeChange"
    />
    <el-card
      class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--header-card-height)-var(--footer-card-height))] overflow-auto mt-2"
    >
      <header class="flex justify-between mb-2">
        <section class="custom-left-box">
          <el-button
            v-if="isSelectionMode"
            @click="jump2Comparison"
            type="primary"
            :disabled="isDisabled"
          >
            <template #icon>
              <Icon :icon="'vi-ep:info-filled'" />
            </template>
            已选择 {{ selectCards.length }}个
          </el-button>
          <el-button @click="changeIsSelectionMode" :type="!isSelectionMode ? 'primary' : 'danger'">
            <template #icon>
              <Icon :icon="'vi-ant-design:retweet-outlined'" v-if="!isSelectionMode" />
              <Icon :icon="'vi-ep:info-filled'" v-else />
            </template>
            <span>{{ (isSelectionMode ? '取消' : '开始') + '模型对比' }}</span>
          </el-button>
        </section>
        <section class="flex gap-2">
          <section class="custom-tag-select">
            <el-select
              v-model="statusValue"
              multiple
              placeholder="筛选运行状态"
              style="min-width: 200px; max-width: 400px"
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="2"
              clearable
            >
              <el-option
                v-for="(status, index) in taskStatusList"
                :key="index"
                :label="status"
                :value="status"
              >
                <div class="flex items-center">
                  <el-tag
                    :type="getStatusTagType(status)"
                    size="small"
                    style="margin-right: 8px"
                    effect="light"
                  />
                  <span :class="getStatusTextClass(status)">{{ status }}</span>
                </div>
              </el-option>
            </el-select>
          </section>
          <InputSearch
            :title="title"
            :filterData="filterData"
            :searchLoading="searchLoading"
            :isShow="isShow"
            @onSearchInput="onSearchInput"
            @onSearchFocus="onSearchFocus"
            @onSearchBlur="onSearchBlur"
            @handleSearchClear="handleSearchClear"
            @changeModelName="changeModelName"
          />
        </section>
      </header>
      <el-skeleton v-if="viewMode === 'Grid'" :rows="5" :loading="loading" animated>
        <CardView
          :displayViewModeList="allTasks"
          :isSelectionMode="isSelectionMode"
          @select="handleSelect"
          @detail="handleDetail"
          :isDisabled="isDisabled"
        />
      </el-skeleton>
      <el-skeleton v-else :rows="5" :loading="loading" animated>
        <table-view
          :displayViewModeList="allTasks"
          :isSelectionMode="isSelectionMode"
          @select="handleSelect"
          @detail="handleDetail"
        />
      </el-skeleton>
      <footer class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="localCurrentPage"
          v-model:page-size="localPageSize"
          :page-sizes="pagination.pageSizes"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </footer>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeMount } from 'vue'
import { useInferenceModelConfigStore } from '@/store/modules/inferenceModelConfigs'
import { useAllTasksStore } from '@/store/modules/allTasks'
import TopToolbar from './components/TopToolbar.vue'
import CardView from './components/CardView.vue'
import TableView from './components/TableView.vue'
import SimulationForm from './components/SimulationForm.vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'
import InputSearch from './components/InputSearch.vue'
// Define Task interface
interface Task {
  id: number
  name: string
  model: string
  status: string
  createTime: string
  updateTime?: string
  creator?: string
  hardware?: string
  deployment?: string
}
const router = useRouter()
const inferenceModelConfigStore = useInferenceModelConfigStore()
const allTasksStore = useAllTasksStore()
const loading = ref(true)
const viewMode = ref('Grid')
const models = ref([{ model: 'Grid' }, { model: 'Table' }])
const title = ref('')
const isShow = ref(false)
const hideTimer = ref<number | null>(null)
const searchLoading = ref(false)
const statusValue = ref<string[]>([])
const modeName = ref('Inference')
const centerDialogVisible = ref(false)
const currentScope = ref('个人')
const isDisabled = ref(false)
const pagination = computed(() => allTasksStore.pagination)

const localCurrentPage = ref(pagination.value.currentPage)
const localPageSize = ref(pagination.value.pageSize)

const handleCurrentChange = (page: number) => {
  console.log(page, '| page')
  allTasksStore.setPagination({ currentPage: page })
}
const handleSizeChange = (size: number) => {
  console.log(size, '| size')
  allTasksStore.setPagination({ pageSize: size, currentPage: 1 })
}

const allTasks = computed<any[]>(() => {
  return allTasksStore.tasksConfigs
})

const taskStatusList = ['running', 'pending', 'completed', 'failed', 'stopped']
const modelNameList = ['llama_3_70b', 'llama_3_8b', 'gpt_4', 'claude_3']

const handleModelChange = (model: string) => {
  viewMode.value = model
  isSelectionMode.value = false
  selectCards.value = []
}

const displayViewModeList = computed(() => {
  let filteredTasks = allTasks.value

  // 根据状态过滤
  if (statusValue.value.length > 0) {
    filteredTasks = filteredTasks.filter((task) => statusValue.value.includes(task.status))
  }

  // 根据模型名称过滤
  if (title.value) {
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.model.toLowerCase().includes(title.value.toLowerCase()) ||
        task.name.toLowerCase().includes(title.value.toLowerCase())
    )
  }
  return filteredTasks
})

watch(
  currentScope,
  (newValue) => {
    // 切换范围时的处理逻辑
  },
  { immediate: true }
)

const isSelectionMode = ref(false)
const createNewSimulation = () => {
  centerDialogVisible.value = true
}

const handleCancel = () => {
  centerDialogVisible.value = false
}

const handleSubmit = async (formData: any) => {
  try {
    // TODO: 这里可以处理表单提交逻辑
    centerDialogVisible.value = false
    ElMessage.success('任务创建成功')
    // 刷新任务列表
    await inferenceModelConfigStore.fetchConfigs()
  } catch (error) {
    ElMessage.error('任务创建失败')
    console.error('Error creating task:', error)
  }
}

const selectCards = ref<number[]>([])

const handleSelect = (task, checked?: boolean) => {
  if (Array.isArray(task)) {
    selectCards.value = task.map((item) => item.id)
  } else {
    if (checked) {
      selectCards.value.push(task.id)
    } else {
      const index = selectCards.value.findIndex((id) => id === task.id)
      if (index !== -1) {
        selectCards.value.splice(index, 1)
      }
    }
  }
}

watch(
  selectCards,
  (newValue) => {
    if (newValue.length >= 3) {
      isDisabled.value = true
      ElMessage.info('对比模型不能超过3条')
    } else {
      isDisabled.value = false
    }
  },
  { immediate: true, deep: true }
)

const handleDetail = (task) => {
  router.push({
    path: '/card/card-details',
    query: {
      id: task.id
    }
  })
}

onMounted(async () => {
  await allTasksStore.fetchConfigs()
  loading.value = false
})

// 监听数据变化，更新分页
watch(
  displayViewModeList,
  () => {
    console.log('displayViewModeList 发生变化，当前数据:', displayViewModeList.value)
  },
  { immediate: true, deep: true }
)

const jump2Comparison = () => {
  router.push({
    path: '/card/card-comparison',
    query: {
      selectCards: JSON.stringify(selectCards.value)
    }
  })
}

const changeIsSelectionMode = () => {
  isSelectionMode.value = !isSelectionMode.value
  if (isSelectionMode.value) {
    selectCards.value = []
  }
}

// 使用防抖优化搜索性能
const debouncedSearch = debounce((val: string) => {
  searchLoading.value = true
  // 模拟搜索延迟，实际项目中这里可能是API调用
  setTimeout(() => {
    searchLoading.value = false
    if (val && filterData.value.length === 0) {
      ElMessage.info('未找到匹配的模型')
    }
  }, 300)
}, 300)

const filterData = computed(() => {
  if (!title.value) {
    return []
  }
  const filtered = modelNameList.filter((item) => {
    return item.toLowerCase().includes(title.value.toLowerCase())
  })
  return filtered.slice(0, 10) // 限制显示条数，提升性能
})

const onSearchInput = (value: string) => {
  title.value = value
  if (value) {
    isShow.value = true
    debouncedSearch(value)
  } else {
    isShow.value = false
    searchLoading.value = false
  }
}

const onSearchFocus = () => {
  if (title.value && filterData.value.length > 0) {
    isShow.value = true
  }
}

const onSearchBlur = () => {
  hideTimer.value = window.setTimeout(() => {
    isShow.value = false
  }, 200)
}

watch(title, () => {
  if (!title.value || filterData.value.length === 0) {
    isShow.value = false
  } else {
    isShow.value = true
  }
})

onBeforeMount(() => {
  hideTimer.value && clearTimeout(hideTimer.value)
})

const changeModelName = (item) => {
  title.value = item
  isShow.value = Boolean(item && filterData.value.length > 0)
}

const handleScopeChange = (scope: string) => {
  currentScope.value = scope
  isSelectionMode.value = false
  selectCards.value = []
}

const handleSearchClear = () => {
  title.value = ''
  isShow.value = false
  searchLoading.value = false
}

const getStatusTagType = (
  status: string
): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    running: 'success',
    pending: 'warning',
    completed: 'info',
    failed: 'danger',
    stopped: 'info'
  }
  return statusMap[status] || 'primary'
}

const getStatusTextClass = (status: string) => {
  const classMap: Record<string, string> = {
    running: 'text-green-600',
    pending: 'text-orange-600',
    completed: 'text-blue-600',
    failed: 'text-red-600',
    stopped: 'text-gray-600'
  }
  return classMap[status] || 'text-gray-600'
}
</script>

<style lang="less" scoped>
.custom-search-result {
  position: absolute;
  top: 100%;
  left: 0;
  width: 240px;
  max-height: 320px;
  overflow-y: auto;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  margin-top: 4px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .custom-search-item {
    margin: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 6px;
    border: 1px solid transparent;

    :deep(.el-card__body) {
      padding: 12px;
    }

    &:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);

      .model-name {
        color: white;
        font-weight: 500;
      }

      .select-icon {
        color: white;
        transform: translateX(2px);
      }
    }

    .model-name {
      margin: 0;
      font-size: 13px;
      color: var(--el-text-color-primary);
      transition: all 0.3s ease;
    }

    .select-icon {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      transition: all 0.3s ease;
    }
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-light);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--el-border-color);
  }
}

.custom-search-loading {
  padding: 16px;
  text-align: center;

  :deep(.el-skeleton) {
    .el-skeleton__item {
      background: linear-gradient(
        90deg,
        var(--el-skeleton-color) 25%,
        var(--el-skeleton-to-color) 37%,
        var(--el-skeleton-color) 63%
      );
    }
  }
}

.custom-search-empty {
  padding: 20px 16px;
  text-align: center;

  :deep(.el-empty) {
    .el-empty__description {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
