<script setup lang="ts">
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput
} from 'element-plus'
import { ref } from 'vue'

defineOptions({
  name: 'Menu12'
})

// 添加视图模式状态
const viewMode = ref('grid') // 'grid' 或 'table'

// 定义两个不同的卡片列表数据
const list1 = ref([
  { name: 'Card 1', items: ['Item 1-1', 'Item 1-2', 'Item 1-3', 'Item 1-4'] },
  { name: 'Card 2', items: ['Item 2-1', 'Item 2-2', 'Item 2-3', 'Item 2-4'] },
  { name: 'Card 3', items: ['Item 3-1', 'Item 3-2', 'Item 3-3', 'Item 3-4'] }
])

// 当前显示的列表
const currentList = ref(list1.value)

// 添加多选模式状态
const isMultiSelect = ref(false)
// 选中的卡片ID数组
const selectedCards = ref<number[]>([])

// 切换视图模式
const toggleView = (mode: 'grid' | 'table') => {
  viewMode.value = mode
}

// 表格选择相关
const tableSelection = ref<any[]>([])

// 处理表格选择变化
const handleSelectionChange = (selection: any[]) => {
  tableSelection.value = selection
  selectedCards.value = selection.map((_, index) => index)
}

// 弹框相关
const dialogVisible = ref(false)
const formData = ref({
  name: '',
  description: ''
})

// 打开弹框
const openDialog = () => {
  dialogVisible.value = true
}

// 关闭弹框
const closeDialog = () => {
  dialogVisible.value = false
  formData.value = {
    name: '',
    description: ''
  }
}

// 提交表单
const handleSubmit = () => {
  // 这里处理表单提交逻辑
  console.log('提交的数据：', formData.value)
  closeDialog()
}

// 添加表格相关的功能
const toggleMultiSelect = () => {
  isMultiSelect.value = !isMultiSelect.value
  if (!isMultiSelect.value) {
    selectedCards.value = []
    tableSelection.value = []
  }
}

// 添加操作列的处理函数
const handleEdit = (row: any) => {
  formData.value = {
    name: row.name,
    description: row.items.join(', ')
  }
  openDialog()
}

const handleDelete = (index: number) => {
  currentList.value.splice(index, 1)
}
</script>

<template>
  <div>
    <ElButton
      type="primary"
      :class="{ 'is-active': viewMode === 'grid' }"
      @click="toggleView('grid')"
      >Create</ElButton
    >
    <nav class="flex justify-between items-center">
      <div class="flex gap-2">
        <ElButton
          type="primary"
          :class="{ 'is-active': viewMode === 'grid' }"
          @click="toggleView('grid')"
          >Grid</ElButton
        >
        <ElButton
          type="primary"
          :class="{ 'is-active': viewMode === 'table' }"
          @click="toggleView('table')"
          >Table</ElButton
        >
      </div>
    </nav>

    <!-- 网格视图 -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <el-card
        v-for="(item, k) in currentList"
        :key="k"
        :class="{ 'card-selected': selectedCards.includes(k) }"
        class="card-container"
      >
        <div v-if="isMultiSelect" class="checkbox-wrapper">
          <el-checkbox :model-value="selectedCards.includes(k)" />
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

    <!-- 表格视图 -->
    <div v-else class="table-view">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span v-if="tableSelection.length > 0" class="text-sm text-gray-600">
            已选择 {{ tableSelection.length }} 个项目
          </span>
          <ElButton @click="toggleMultiSelect">
            {{ isMultiSelect ? '取消选择' : '选择多个项目' }}
          </ElButton>
        </div>
        <ElButton type="primary" @click="openDialog">新建</ElButton>
      </div>

      <el-table
        :data="currentList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column label="内容">
          <template #default="{ row }">
            <div class="flex flex-col gap-1">
              <span v-for="(item, index) in row.items" :key="index">{{ item }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row, $index }">
            <ElButton type="primary" link @click="handleEdit(row)"> 编辑 </ElButton>
            <ElButton type="danger" link @click="handleDelete($index)"> 删除 </ElButton>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="formData.name ? '编辑项目' : '新建项目'"
        width="500px"
      >
        <el-form :model="formData" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="formData.name" placeholder="请输入名称" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </div>
        </template>
      </el-dialog>
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

.view-switch {
  .el-button {
    &.is-active {
      background-color: var(--el-color-primary);
      color: white;
    }
  }
}

.table-view {
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  :deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;
  }
}

.el-button {
  &.is-active {
    background-color: var(--el-color-primary-dark-2);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
