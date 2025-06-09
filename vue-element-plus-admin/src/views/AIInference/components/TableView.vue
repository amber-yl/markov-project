<template>
  <el-table
    :data="displayViewModeList"
    style="width: 100%"
    @select="handleSelect"
    @select-all="handleSelect"
    @row-click="handleRowClick"
    @selection-change="handleSelectionChange"
    ref="tableRef"
    stripe
    highlight-current-row
    :default-sort="{ prop: 'createTime', order: 'descending' }"
    class="modern-table"
  >
    <el-table-column v-if="props.isSelectionMode" type="selection" width="55" />
    <el-table-column
      fixed
      prop="name"
      label="任务名称"
      min-width="150"
      sortable
      show-overflow-tooltip
    >
      <template #default="scope">
        <div class="flex items-center gap-2">
          <Icon :icon="'vi-ant-design:project-outlined'" class="text-blue-500" />
          <span class="font-medium">{{ scope.row.name }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="model" label="模型" min-width="120" sortable show-overflow-tooltip>
      <template #default="scope">
        <el-tag type="info" effect="light" size="small">
          {{ scope.row.model }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="状态" prop="status" width="120" sortable>
      <template #default="scope">
        <section class="flex items-center gap-2">
          <el-tag :type="getStatusType(scope.row.status)" effect="light" size="small">
            <Icon :icon="getStatusIcon(scope.row.status)" style="margin-right: 4px" />
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </section>
      </template>
    </el-table-column>
    <el-table-column prop="hardware" label="硬件配置" min-width="120" show-overflow-tooltip>
      <template #default="scope">
        <span class="text-gray-600">{{ scope.row.hardware || 'N/A' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="deployment" label="部署方式" min-width="120" show-overflow-tooltip>
      <template #default="scope">
        <span class="text-gray-600">{{ scope.row.deployment || 'N/A' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" width="160" sortable>
      <template #default="scope">
        <div class="flex items-center gap-1 text-sm text-gray-500">
          <Icon :icon="'vi-ant-design:calendar-outlined'" />
          <span>{{ formatDate(scope.row.createTime) }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="creator" label="创建者" width="100" show-overflow-tooltip>
      <template #default="scope">
        <div class="flex items-center gap-1">
          <Icon :icon="'vi-ant-design:user-outlined'" class="text-gray-400" />
          <span class="text-sm">{{ scope.row.creator || 'Unknown' }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="120" fixed="right">
      <template #default="scope">
        <div class="flex gap-1">
          <el-tooltip content="查看详情" placement="top">
            <el-button size="small" type="primary" circle @click.stop="handleDetail(scope.row)">
              <Icon :icon="'vi-ant-design:eye-outlined'" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="编辑" placement="top">
            <el-button size="small" type="warning" circle @click.stop="handleEdit(scope.row)">
              <Icon :icon="'vi-ant-design:edit-outlined'" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button size="small" type="danger" circle @click.stop="handleDelete(scope.row)">
              <Icon :icon="'vi-ant-design:delete-outlined'" />
            </el-button>
          </el-tooltip>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ElTable } from 'element-plus'

// Define Task type locally
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

const props = defineProps<{
  displayViewModeList?: any[]
  loading?: boolean
  isSelectionMode?: boolean
}>()
const emit = defineEmits<{
  (e: 'select', task: Task[], checked?: boolean): void
  (e: 'detail', task: Task): void
}>()

// Utility functions
const getStatusType = (status: string): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    running: 'success',
    pending: 'warning',
    completed: 'info',
    failed: 'danger',
    stopped: 'info'
  }
  return statusMap[status] || 'primary'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    running: '运行中',
    pending: '等待中',
    completed: '已完成',
    failed: '失败',
    stopped: '已停止'
  }
  return textMap[status] || status
}

const getStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    running: 'vi-ant-design:play-circle-filled',
    pending: 'vi-ant-design:clock-circle-filled',
    completed: 'vi-ant-design:check-circle-filled',
    failed: 'vi-ant-design:close-circle-filled',
    stopped: 'vi-ant-design:pause-circle-filled'
  }
  return iconMap[status] || 'vi-ant-design:question-circle-filled'
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const handleSelect = (task: Task[]) => {
  emit('select', task)
}

const handleRowClick = (row: Task) => {
  emit('detail', row)
}

const handleSelectionChange = (val: Task[]) => {
  console.log(val, '| val')
}

const handleDetail = (row: Task) => {
  emit('detail', row)
}

const handleEdit = (row: Task) => {
  console.log('Edit task:', row)
  // TODO: Implement edit functionality
}

const handleDelete = (row: Task) => {
  console.log('Delete task:', row)
  // TODO: Implement delete functionality
}

const tableRef: any = ref<InstanceType<typeof ElTable>>()
watch(
  () => props.isSelectionMode,
  (newValue) => {
    if (!newValue) {
      // 当退出选择模式时，清空所有选中状态
      tableRef?.value.clearSelection()
    }
  }
)
</script>

<style lang="less" scoped>
.modern-table {
  :deep(.el-table__header-wrapper) {
    .el-table__header {
      th {
        background-color: #f8fafc;
        color: #374151;
        font-weight: 600;
        border-bottom: 2px solid #e5e7eb;
      }
    }
  }

  :deep(.el-table__body-wrapper) {
    .el-table__row {
      transition: all 0.3s ease;

      &:hover {
        background-color: #f0f9ff !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .el-table__cell {
        border-bottom: 1px solid #f1f5f9;
        padding: 12px 8px;
      }
    }
  }

  :deep(.el-table__fixed-right) {
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-button.is-circle) {
    padding: 6px;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
