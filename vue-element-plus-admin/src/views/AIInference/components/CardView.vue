<template>
  <div class="markov-cards-container grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
    <el-card v-for="item in displayViewModeList" :key="item.id" class="select-card relative" style="max-width: 480px"
      @mouseenter="handleMouseEnter(item.id)" @mouseleave="handleMouseLeave" @click="emit('detail', item)">
      <div v-if="props.isSelectionMode" class="checkbox-wrapper absolute top-2 right-2 z-10">
        <el-checkbox v-model="selectedItems[item.id]" class="!w-4 !h-4 border-2 border-blue-500 rounded" @click.stop
          @change="() => handleSelect(item, selectedItems[item.id])" />
      </div>
      <template #header>
        <span :class="{ 'text-blue-500': hoveredId === item.id }">{{ item.model }}</span>
      </template>
      <div class="text item">
        <p> {{ item.name }}</p>
        <p> {{ item.createTime }}</p>
      </div>
      <template #footer>
        <section class="flex items-center gap-2">
          <Icon :icon="'vi-ant-design:check-circle-filled'" :color="item.status === 'running' ? 'blue' : ''" />
          <span :style="{ color: item.status === 'running' ? 'blue' : '' }">{{ item.status }}</span>
        </section>
      </template>
      <footer class="absolute bottom-2 right-2 flex gap-2 transition-opacity duration-300"
        :class="{ 'opacity-0': hoveredId !== item.id }">
        <Icon :icon="'vi-ant-design:edit-outlined'" :color="'blue'" @click.stop="handleEditTask(item, $event)" />
        <el-tooltip effect="dark" content="Top Center prompts info" placement="top">
          <Icon :icon="'vi-ant-design:question-circle-outlined'" :color="'blue'" @click.stop />
        </el-tooltip>
        <Icon :icon="'vi-ant-design:delete-outlined'" :color="'blue'" @click.stop="handleDeleteTask(item, $event)" />
      </footer>
    </el-card>
  </div>
  <Dialog v-model="showEditDialog" title="编辑任务" @close="showEditDialog = false">
    <el-form v-if="currentTask" label-width="100px">
      <el-form-item label="名称">
        <el-input v-model="currentTask.name" />
      </el-form-item>
      <el-form-item label="模型">
        <el-input v-model="currentTask.model" />
      </el-form-item>
      <el-form-item label="硬件">
        <el-input v-model="currentTask.hardware" />
      </el-form-item>
      <el-form-item label="部署">
        <el-input v-model="currentTask.deployment" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showEditDialog = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCardSelection } from '@/composables/useCardSelection'
import type { Task } from '@/store/types'
import { useInferenceEvalStore } from '@/store/modules/inference'
import { Dialog } from '@/components/Dialog'

const props = defineProps<{
  displayViewModeList: Task[]
  loading?: boolean
  isSelectionMode?: boolean
}>()
const emit = defineEmits<{
  (e: 'select', task: Task, checked: boolean): void
  (e: 'detail', task: Task): void
}>()

const currentList = ref<Task[]>(props.displayViewModeList)

const selectedItems = ref<Record<string, boolean>>({})
const handleSelect = (item: Task, checked: boolean) => {
  emit('select', item, checked)
}
watch(
  () => props.isSelectionMode,
  (newValue) => {
    if (!newValue) {
      // 当退出选择模式时，清空所有选中状态
      selectedItems.value = {}
    }
  }
)
const hoveredId = ref<number | null>(null)
const showEditDialog = ref(false)
const currentTask = ref<Task | null>(null)
const inferenceStore = useInferenceEvalStore()

const { selectedCards, isMultiSelect, ...cardSelection } = useCardSelection()

const handleMouseEnter = (id: number) => {
  hoveredId.value = id
}

const handleMouseLeave = () => {
  hoveredId.value = null
}

const handleDeleteTask = (task: Task, event: Event) => {
  event.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
  const index = currentList.value.findIndex((item) => item.id === task.id)
  if (index !== -1) {
    currentList.value.splice(index, 1)
  }
  // 从 store 中删除任务
  inferenceStore.deleteTask(task)
}
const handleEditTask = (task: Task, event: Event) => {
  event.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
  currentTask.value = { ...task } // 创建任务对象的副本
  showEditDialog.value = true
}

const handleSave = async () => {
  if (currentTask.value) {
    // 更新 store 中的任务数据
    const index = currentList.value.findIndex((task) => task.id === currentTask.value?.id)
    if (index !== -1) {
      currentList.value[index] = { ...currentTask.value }
    }
    showEditDialog.value = false
    currentTask.value = null
  }
}
</script>

<style lang="less" scoped>
.select-card {
  .checkbox-wrapper {
    :deep(.el-checkbox) {
      .el-checkbox__inner {
        border-color: #409eff;

        &.hover {
          border-color: #79bbff;
        }
      }
    }

    &.is-checked {
      .el-checkbox__inner {
        background-color: #409eff;
        border-color: #409eff;
      }
    }
  }

}
</style>
