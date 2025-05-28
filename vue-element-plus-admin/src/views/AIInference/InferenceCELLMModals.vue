<template>
  <ContentDetailWrap>
    <section v-if="centerDialogVisible">
      <SimulationForm @cancel="handleCancel" @formSubmit="handleSubmit" />
    </section>
    <section v-else>
      <TopToolbar v-model="viewMode" :models="models" :modeName="modeName" @create="createNewSimulation"
        @change="handleModelChange" @scopeChange="handleScopeChange" />
      <el-card
        class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--header-card-height)-var(--footer-card-height))] overflow-auto mt-2">
        <header class="flex justify-between mb-2">
          <section class="custom-left-box">
            <el-button v-if="isSelectionMode" @click="jump2Comparison" type="primary">
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
              <el-select v-model="statusValue" multiple placeholder="请选择运行状态"
                style="min-width: 200px;max-width: 400px;">
                <el-option v-for="(status, index) in inferenceEvalStore.getTaskStatusList" :key="index" :label="status"
                  :value="status">
                  <div class="flex items-center">
                    <el-tag class="text-sky-500" style="margin-right: 8px" size="small" />
                    <span class="text-sky-500">{{ status }}</span>
                  </div>
                </el-option>
                <template #tag>
                  <!-- <el-tag v-for="(item) in showTags" :key="item.value" :color="item.value">
                  <span style="color: white;">{{item.label}}</span>
                </el-tag> -->
                </template>
              </el-select>
            </section>
            <section class="custom-right-box relative">
              <el-input style="width: 240px;" placeholder="Model Name" @input="(v: string) => onSearchInput(v)"
                :model-value="title" @focus="onSearchFocus" @blur="onSearchBlur">
                <template #prefix>
                  <Icon :icon="'vi-ant-design:search-outlined'" />
                </template>
              </el-input>
              <div v-show="isShow && filterData.length > 0" class="custom-search-result">
                <el-card v-for="(item, index) in filterData" :key="index" class="custom-search-item"
                  @click="changeModelName(item)">
                  <p>{{ item }}</p>
                </el-card>
              </div>
            </section>
          </section>
        </header>
        <el-skeleton v-if="viewMode === 'Grid'" :rows="5" :loading="loading" animated>
          <CardView :displayViewModeList="currentList" :isSelectionMode="isSelectionMode" @select="handleSelect"
            @detail="handleDetail" />
        </el-skeleton>
        <el-skeletpn v-else :rows="5" :loading="loading" animated>
          <table-view :displayViewModeList="currentList" :isSelectionMode="isSelectionMode" @select="handleSelect"
            @detail="handleDetail" />
        </el-skeletpn>
        <footer class="flex justify-end mt-4">
          <el-pagination v-model:current-page="pagination.currentPage.value"
            v-model:page-size="pagination.pageSize.value" :page-sizes="[5, 10, 15, 20]" :size="'small'"
            layout="total, sizes, prev, pager, next, jumper" :total="displayViewModeList.length"
            @size-change="pagination.handleSizeChange" @current-change="pagination.handleCurrentChange" />
        </footer>
      </el-card>
    </section>
  </ContentDetailWrap>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeMount } from 'vue'
import { useInferenceEvalStore } from '@/store/modules/inference'
import TopToolbar from './components/TopToolbar.vue'
import CardView from './components/CardView.vue'
import TableView from './components/TableView.vue'
import SimulationForm from './components/SimulationForm.vue'
import { useRouter } from 'vue-router'
import { usePagination } from '@/composables/usePagination'
import { Task } from '@/store/types'

const router = useRouter()
const inferenceEvalStore = useInferenceEvalStore()
const loading = ref(true)
const viewMode = ref('Grid')
const models = ref([{ model: 'Grid' }, { model: 'Table' }])
const handleModelChange = (model: string) => {
  viewMode.value = model
  isSelectionMode.value = false
  selectCards.value = []
}

const modeName = ref('Inference')
const centerDialogVisible = ref(false)
const currentScope = ref('个人')

const displayViewModeList = computed(() => {
  const allTasks = inferenceEvalStore.$state.allTasks
  // if (currentScope.value === '个人') {
  //   return allTasks.filter(task => task.creator === 'current_user')
  // }
  return allTasks
})

// console.log(displayViewModeList.value, "| displayViewModeList");

watch(currentScope, (newValue) => {
  console.log(newValue, "| newValue");
}, { immediate: true })

const isSelectionMode = ref(false)
const createNewSimulation = () => {
  centerDialogVisible.value = true
}

const handleCancel = () => {
  centerDialogVisible.value = false
}

const handleSubmit = async (formData, taskName: string) => {
  console.log(formData, "| formData");
  console.log(taskName, "| taskName");
  // await inferenceEvalStore.createTask(formData)
  // centerDialogVisible.value = false
  // await fetchData()
}

const selectCards = ref<number[]>([])

const handleSelect = (task: Task | Task[], checked?: boolean) => {
  if (Array.isArray(task)) {
    selectCards.value = task.map((item) => item.id)
  } else {
    if (checked) {
      selectCards.value.push((task as Task).id)
    } else {
      const index = selectCards.value.findIndex((id) => id === (task as Task).id)
      if (index !== -1) {
        selectCards.value.splice(index, 1)
      }
    }
  }
}

const { currentList, ...pagination } = usePagination(displayViewModeList.value)

const handleDetail = (task) => {
  router.push({
    path: '/card/card-details',
    query: {
      id: task.id
    }
  })
}

onMounted(async () => {
  // await fetchData()
  await inferenceEvalStore.fetchTasks()
  loading.value = false
})

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

const statusValue = ref<string[]>([])

const title = ref('')
const isShow = ref(false)
const hideTimer = ref<number | null>(null)
const filterData = computed(() => {
  if (!title.value) {
    return []
  }
  const filtered = inferenceEvalStore.getModelNameList.filter((item) => {
    return item.includes(title.value)
  })
  return filtered.length ? filtered : []
})

const onSearchInput = (val) => {
  title.value = val
  isShow.value = true
}

const onSearchFocus = (val) => {
  if (title.value && filterData.value.length > 0) {
    isShow.value = true
  }
}

const onSearchBlur = (val) => {
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
  console.log(`Switched to scope: ${scope}`)

  isSelectionMode.value = false
  selectCards.value = []

  // 可以触发数据重新获取或过滤
  // await inferenceEvalStore.fetchTasks({ scope })
}
</script>


<style lang="less" scoped>
.custom-search-result {
  position: absolute;
  top: 100%;
  left: 0;
  width: 240px;
  max-height: 300px;
  overflow-y: auto;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  margin-top: 4px;
  z-index: 1000;

  .custom-search-item {
    padding: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    height: 40px;

    :deep(.el-card__body) {
      padding: 0;
    }

    &:hover {
      background-color: skyblue;
      color: white;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>