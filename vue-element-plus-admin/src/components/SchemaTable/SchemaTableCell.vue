<template>
  <div class="schema-table-cell">
    <!-- 日期时间格式 -->
    <span v-if="column.formatter === 'datetime'">
      {{ formatDateTime(value) }}
    </span>

    <!-- 数字格式 -->
    <span v-else-if="column.formatter === 'number'">
      {{ formatNumber(value) }}
    </span>

    <!-- 百分比格式 -->
    <span v-else-if="column.formatter === 'percentage'">
      {{ formatPercentage(value) }}
    </span>

    <!-- 内存格式 -->
    <span v-else-if="column.formatter === 'memory'">
      {{ formatMemory(value) }}
    </span>

    <!-- 带宽格式 -->
    <span v-else-if="column.formatter === 'bandwidth'">
      {{ formatBandwidth(value) }} ---
    </span>

    <!-- 标签格式 -->
    <el-tag v-else-if="column.formatter === 'tag'" :type="getTagType(value, column)">
      {{ formatTagValue(value, column) }}
    </el-tag>

    <!-- 数组格式 -->
    <div v-else-if="Array.isArray(value)" class="array-display">
      <template v-for="(item, index) in value" :key="index">
        <el-tag v-for="(key, idx) in Object.keys(item)" :key="`${index}-${idx}`" size="small" class="array-tag">
          {{ key }}: {{ item[key] }}
        </el-tag>
      </template>
    </div>

    <!-- 默认文本格式 -->
    <span v-else>
      {{ formatDefault(value) }}
    </span>
  </div>
</template>

<script setup lang="ts">

interface Column {
  prop: string
  label: string
  formatter?: string
  [key: string]: any
}

interface Props {
  value: any
  column: Column
  row?: any
}

const props = defineProps<Props>()

// 格式化日期时间
const formatDateTime = (value: any) => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN')
}

// 格式化数字
const formatNumber = (value: any) => {
  if (value === null || value === undefined) return ''
  if (typeof value !== 'number') return value
  return value.toLocaleString()
}

// 格式化百分比
const formatPercentage = (value: any) => {
  if (value === null || value === undefined) return ''
  if (typeof value !== 'number') return value
  return (value * 100).toFixed(2) + '%'
}

// 格式化内存
const formatMemory = (value: any) => {
  if (value === null || value === undefined) return ''
  if (typeof value !== 'number') return value

  if (value >= 1024) {
    return (value / 1024).toFixed(1) + ' TB'
  }
  return value + ' GB'
}

// 格式化带宽
const formatBandwidth = (value: any) => {
  if (value === null || value === undefined) return ''
  if (typeof value !== 'number') return value

  if (value >= 1000) {
    return (value / 1000).toFixed(1) + ' TB/s'
  }
  return value + ' GB/s'
}

// 获取标签类型
const getTagType = (value: any, column: Column): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  if (column.prop === 'type') {
    return value === 'gpu' ? 'primary' : 'success'
  }
  if (column.prop === 'processing_mode') {
    return value === 'roofline' ? 'warning' : 'info'
  }
  return 'info'
}

// 格式化标签值
const formatTagValue = (value: any, column: Column) => {
  if (column.prop === 'type') {
    return String(value).toUpperCase()
  }
  return String(value)
}

// 默认格式化
const formatDefault = (value: any) => {
  if (value === null || value === undefined) return ''
  return String(value)
}
</script>

<style lang="less" scoped>
.schema-table-cell {
  .array-display {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;

    .array-tag {
      margin-right: 4px;
      margin-bottom: 2px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>