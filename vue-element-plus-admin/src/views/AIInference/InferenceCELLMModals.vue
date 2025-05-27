<template>
  <ContentDetailWrap>
    <section v-if="centerDialogVisible">
      <SimulationForm @cancel="handleCancel" @formSubmit="handleSubmit" />
    </section>
    <section v-else>
      <TopToolbar v-model="viewMode" :models="models" :modeName="modeName" @create="createNewSimulation"
        @change="handleModelChange" />
      <el-card
        class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--header-card-height)-var(--footer-card-height))] overflow-auto mt-2">
        <header class="flex justify-start mb-2">
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
        </header>
        <CardView v-if="viewMode === 'Grid'" :displayViewModeList="currentList" :loading="loading"
          :isSelectionMode="isSelectionMode" @select="handleSelect" @detail="handleDetail" />
        <table-view v-else :loading="loading" :displayViewModeList="currentList" :isSelectionMode="isSelectionMode"
          @select="handleSelect" @detail="handleDetail" />
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
import { ref, computed, onMounted } from 'vue'
import { useInferenceEvalStore } from '@/store/modules/inference'
import { useInferenceData } from './hooks/useInferenceData'
import TopToolbar from './components/TopToolbar.vue'
import CardView from './components/CardView.vue'
import TableView from './components/TableView.vue'
import SimulationForm from './components/SimulationForm.vue'
import { useRouter } from 'vue-router'
import { usePagination } from '@/composables/usePagination'
import { Task } from '@/store/types'

const router = useRouter()
const inferenceEvalStore = useInferenceEvalStore()
const { loading, fetchData } = useInferenceData()

const viewMode = ref('Grid')
const models = ref([{ model: 'Grid' }, { model: 'Table' }])
const handleModelChange = (model: string) => {
  console.log(model, '| model')

  viewMode.value = model
  isSelectionMode.value = false
  selectCards.value = []
}

const modeName = ref('Inference')
const centerDialogVisible = ref(false)
const displayViewModeList = computed(() => {
  return inferenceEvalStore.$state.allTasks
})
const isSelectionMode = ref(false)
// 显示PersonTasks和AllTasks
// const viewRole = ref('person')
// const displayRoleList = computed(() => {
//   return viewRole.value === 'person' ? ['person', 'company'] : ['person', 'company']
// })

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

const selectCards = ref<number[]>([]) // 添加响应式数组存储选中的任务

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
  await fetchData()
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
</script>
