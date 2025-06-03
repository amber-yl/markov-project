<template>
  <div class="schema-table-column-manager">
    <!-- 统计信息 -->
    <div class="stats mb-4 p-3 bg-gray-50 rounded">
      <div class="flex justify-between text-sm text-gray-600">
        <span>可管理列数: {{ columns.length }}</span>
        <span>
          已显示: {{ visibleCount }} |
          已隐藏: {{ hiddenCount }}
        </span>
      </div>
    </div>

    <!-- 列管理器 -->
    <el-transfer v-model="rightValue" filterable :titles="['隐藏的列', '显示的列']" :data="transferData" @change="handleChange"
      :props="{
        key: 'key',
        label: 'label',
        disabled: 'disabled'
      }" class="custom-transfer">
      <template #default="{ option }">
        <span class="transfer-item">
          {{ option.label }}
        </span>
      </template>
      <template #left-empty>
        <el-empty :image-size="60" description="所有列都已显示"></el-empty>
      </template>
      <template #right-empty>
        <el-empty :image-size="60" description="暂无显示列"></el-empty>
      </template>
    </el-transfer>

    <!-- 快捷操作按钮 -->
    <div class="actions mt-4 flex gap-2 justify-center">
      <el-button size="small" type="success" @click="showAllColumns">
        显示所有
      </el-button>
      <el-button size="small" type="warning" @click="hideAllColumns">
        隐藏所有
      </el-button>
      <el-button size="small" type="info" @click="resetToDefault">
        重置默认
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Column {
  prop: string
  label: string
  defaultHidden?: boolean
  [key: string]: any
}

interface Props {
  columns: Column[]
  visibleColumns: Column[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'column-change': [visibleProps: string[]]
}>()

const rightValue = ref<string[]>([])

// Transfer数据
const transferData = computed(() => {
  return props.columns
    .filter(col => col.prop !== 'operations') // 排除操作列
    .map(col => ({
      key: col.prop,
      label: col.label,
      disabled: false
    }))
})

// 统计信息
const visibleCount = computed(() => rightValue.value.length)
const hiddenCount = computed(() => transferData.value.length - rightValue.value.length)

// 处理变化
const handleChange = (targetKeys: string[]) => {
  rightValue.value = targetKeys
  emit('column-change', targetKeys)
}

// 显示所有列
const showAllColumns = () => {
  const allKeys = transferData.value.map(item => item.key)
  handleChange(allKeys)
}

// 隐藏所有列
const hideAllColumns = () => {
  handleChange([])
}

// 重置为默认
const resetToDefault = () => {
  const defaultVisible = props.columns
    .filter(col => !col.defaultHidden && col.prop !== 'operations')
    .map(col => col.prop)
  handleChange(defaultVisible)
}

// 初始化右侧值
watch(
  () => props.visibleColumns,
  (visibleColumns) => {
    rightValue.value = visibleColumns
      .filter(col => col.prop !== 'operations')
      .map(col => col.prop)
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
.schema-table-column-manager {
  padding: 20px;

  .stats {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
  }

  .custom-transfer {
    :deep(.el-transfer-panel) {
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    :deep(.el-transfer-panel__header) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px 8px 0 0;
      font-weight: 500;
    }
  }

  .transfer-item {
    display: flex;
    align-items: center;
    padding: 2px 0;
    font-size: 14px;
  }

  .actions {
    border-top: 1px solid #e9ecef;
    padding-top: 16px;

    .el-button {
      border-radius: 20px;
      font-weight: 500;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }
}
</style>