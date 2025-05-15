<script setup lang="ts">
import { ElButton, ElInput, ElCard, ElCheckbox } from 'element-plus'
import { BaseButton } from '@/components/Button/index'
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'

defineOptions({
  name: 'Menu12'
})

const { t } = useI18n()

const text = ref('')

// 定义两个不同的卡片列表数据
const list1 = ref([
  { name: 'Card 1', items: ['Item 1-1', 'Item 1-2', 'Item 1-3', 'Item 1-4'] },
  { name: 'Card 2', items: ['Item 2-1', 'Item 2-2', 'Item 2-3', 'Item 2-4'] },
  { name: 'Card 3', items: ['Item 3-1', 'Item 3-2', 'Item 3-3', 'Item 3-4'] }
])

const list2 = ref([
  { name: 'List A', items: ['Task A-1', 'Task A-2', 'Task A-3', 'Task A-4'] },
  { name: 'List B', items: ['Task B-1', 'Task B-2', 'Task B-3', 'Task B-4'] },
  { name: 'List C', items: ['Task C-1', 'Task C-2', 'Task C-3', 'Task C-4'] }
])

// 当前显示的列表
const currentList = ref(list1.value)

// 添加当前激活的按钮状态
const activeBtn = ref(1)

// 修改切换方法
const switchList = (listNumber: number) => {
  activeBtn.value = listNumber
  currentList.value = listNumber === 1 ? list1.value : list2.value
}

// 添加多选模式状态
const isMultiSelect = ref(false)
// 选中的卡片ID数组
const selectedCards = ref<number[]>([])

// 切换多选模式
const toggleMultiSelect = () => {
  isMultiSelect.value = !isMultiSelect.value
  // 切换时清空选中状态
  if (!isMultiSelect.value) {
    selectedCards.value = []
  }
}

// 切换卡片选中状态
const toggleCardSelection = (index: number) => {
  const position = selectedCards.value.indexOf(index)
  if (position === -1) {
    selectedCards.value.push(index)
  } else {
    selectedCards.value.splice(position, 1)
  }
}
</script>

<template>
  <!-- <ContentWrap :title="t('levelDemo.menu')" /> -->
  <div>
    <nav class="flex justify-between items-center">
      <div>
        <p>Models</p>
        <BaseButton :type="'primary'"> CreateNewSimulation </BaseButton>
      </div>
      <div>
        <ElInput />
        <div class="flex items-center gap-2">
          <span v-if="selectedCards.length > 0" class="text-sm text-gray-600">
            已选择 {{ selectedCards.length }} 个
          </span>
          <ElButton @click="toggleMultiSelect">
            {{ isMultiSelect ? '取消选择' : '选择多个Card，并进行对比' }}
          </ElButton>
        </div>
        <div class="btn flex relative">
          <div class="slider" :style="{ left: activeBtn === 1 ? '0' : '50%' }"></div>
          <ElButton
            class="flex-1"
            :class="{ 'is-active': activeBtn === 1 }"
            @click="switchList(1)"
            type="primary"
            >btn1</ElButton
          >
          <ElButton
            class="flex-1"
            :class="{ 'is-active': activeBtn === 2 }"
            @click="switchList(2)"
            type="primary"
            >btn2</ElButton
          >
        </div>
      </div>
    </nav>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <el-card
        style="max-width: 480px"
        v-for="(item, k) in currentList"
        :key="k"
        :class="{ 'card-selected': selectedCards.includes(k) }"
        class="card-container"
      >
        <div v-if="isMultiSelect" class="checkbox-wrapper">
          <el-checkbox
            :model-value="selectedCards.includes(k)"
            @change="() => toggleCardSelection(k)"
          />
        </div>
        <template #header>
          <div class="card-header">
            <span>{{ item.name }}</span>
          </div>
        </template>
        <p v-for="(text, index) in item.items" :key="index" class="text item">
          {{ text }}
        </p>
        <template #footer>Footer content</template>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="less">
.btn {
  .el-button {
    border: none;
    border-radius: 0px;
    position: relative;
    z-index: 1;
    transition: color 0.3s;
    background: transparent;
    color: #909399;

    &.is-active {
      color: #fff;
    }
  }

  .slider {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    background-color: var(--el-color-primary);
    transition: left 0.3s ease;
    z-index: 0;
  }

  .el-button + .el-button {
    margin-left: 0px;
  }
}

.card-header {
  .el-checkbox {
    margin-right: 0;
  }
}

.el-card {
  transition: all 0.3s ease;

  &.card-selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 8px rgba(var(--el-color-primary-rgb), 0.4);
  }
}

.card-container {
  position: relative;

  .checkbox-wrapper {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    background-color: white;
    padding: 4px;
    border-radius: 4px;
  }
}
</style>
