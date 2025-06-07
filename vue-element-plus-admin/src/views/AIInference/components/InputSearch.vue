<template>
  <section class="relative">
    <el-input
      style="width: 240px"
      placeholder="搜索模型名称..."
      @input="(v: string) => onSearchInput(v)"
      :model-value="title"
      @focus="onSearchFocus"
      @blur="onSearchBlur"
      clearable
      @clear="handleSearchClear"
    >
      <template #prefix>
        <Icon
          :icon="searchLoading ? 'vi-ep:loading' : 'vi-ant-design:search-outlined'"
          :class="{ 'animate-spin': searchLoading }"
        />
      </template>
    </el-input>
    <div v-show="isShow" class="custom-search-result">
      <div v-if="searchLoading" class="custom-search-loading">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="filterData.length === 0 && title" class="custom-search-empty">
        <el-empty :image-size="60" description="未找到匹配的模型" />
      </div>
      <el-card
        v-else
        v-for="(item, index) in filterData"
        :key="index"
        class="custom-search-item"
        @click="changeModelName(item)"
      >
        <div class="flex items-center justify-between">
          <p class="model-name">{{ item }}</p>
          <Icon :icon="'vi-ant-design:enter-outlined'" class="select-icon" />
        </div>
      </el-card>
    </div>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  searchLoading: boolean
  isShow: boolean
  filterData: string[]
}>()
const emit = defineEmits<{
  onSearchInput: [value: string]
  onSearchFocus: []
  onSearchBlur: []
  handleSearchClear: []
  changeModelName: [value: string]
}>()

const onSearchInput = (value: string) => {
  emit('onSearchInput', value)
}
const onSearchFocus = () => {
  emit('onSearchFocus')
}
const onSearchBlur = () => {
  emit('onSearchBlur')
}
const handleSearchClear = () => {
  emit('handleSearchClear')
}
const changeModelName = (value: string) => {
  emit('changeModelName', value)
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
</style>
