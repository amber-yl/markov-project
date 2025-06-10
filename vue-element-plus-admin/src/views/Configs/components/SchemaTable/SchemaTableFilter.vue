<template>
  <div class="schema-table-filter">
    <div class="filter-header">
      <el-checkbox :model-value="isAllSelected" :indeterminate="isIndeterminate" @change="handleSelectAll">
        全选
      </el-checkbox>
    </div>

    <div class="filter-content">
      <div v-if="column.filterType === 'text'" class="text-filter">
        <el-input :model-value="textValue" @update:model-value="handleTextChange" placeholder="输入关键词筛选" clearable />
      </div>

      <div v-else class="checkbox-filter">
        <div class="max-h-48 overflow-y-auto">
          <el-checkbox-group :model-value="selectedValues" @change="handleCheckboxChange">
            <div v-for="item in uniqueValues" :key="item" class="mb-1">
              <el-checkbox :label="item" :value="item">
                {{ item }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>
    </div>

    <div class="filter-footer">
      <el-button size="small" @click="handleClear">
        清除
      </el-button>
      <el-button type="primary" size="small" @click="handleConfirm">
        确认
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Column {
  prop: string
  label: string
  filterType?: string
  [key: string]: any
}

interface Props {
  column: Column
  data: any[]
  currentFilter: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'filter-change': [prop: string, values: any[]]
  'filter-confirm': [prop: string]
  'filter-clear': [prop: string]
}>()

const selectedValues = ref<string[]>([])
const textValue = ref('')

// 获取列的唯一值
const uniqueValues = computed(() => {
  const values = new Set<string>()
  props.data.forEach(item => {
    const value = getNestedValue(item, props.column.prop)
    if (value !== null && value !== undefined) {
      values.add(String(value))
    }
  })
  return Array.from(values).sort()
})

// 获取嵌套值
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 全选状态
const isAllSelected = computed(() => {
  if (props.column.filterType === 'text') {
    return false
  }
  return selectedValues.value.length === uniqueValues.value.length && uniqueValues.value.length > 0
})

// 半选状态
const isIndeterminate = computed(() => {
  if (props.column.filterType === 'text') {
    return false
  }
  return selectedValues.value.length > 0 && selectedValues.value.length < uniqueValues.value.length
})

// 处理全选
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedValues.value = [...uniqueValues.value]
  } else {
    selectedValues.value = []
  }
  emit('filter-change', props.column.prop, selectedValues.value)
}

// 处理多选框变化
const handleCheckboxChange = (values: string[]) => {
  selectedValues.value = values
  emit('filter-change', props.column.prop, values)
}

// 处理文本输入变化
const handleTextChange = (value: string) => {
  textValue.value = value
  emit('filter-change', props.column.prop, value ? [value] : [])
}

// 处理确认
const handleConfirm = () => {
  emit('filter-confirm', props.column.prop)
}

// 处理清除
const handleClear = () => {
  selectedValues.value = []
  textValue.value = ''
  emit('filter-clear', props.column.prop)
}

// 监听当前筛选器变化
watch(
  () => props.currentFilter,
  (newFilter) => {
    if (props.column.filterType === 'text') {
      textValue.value = newFilter.length > 0 ? newFilter[0] : ''
    } else {
      selectedValues.value = [...newFilter]
    }
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
.schema-table-filter {
  .filter-header {
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
    margin-bottom: 8px;
  }

  .filter-content {
    .text-filter {
      margin-bottom: 8px;
    }

    .checkbox-filter {
      .el-checkbox-group {
        .el-checkbox {
          display: block;
          margin-right: 0;
          margin-bottom: 8px;
        }
      }
    }
  }

  .filter-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>