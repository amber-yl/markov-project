<template>
  <el-card>
    <div class="flex justify-between items-center">
      <section class="custom-header-left flex flex-col gap-4">
        <h2>{{ props.modeName }}</h2>
        <el-button type="primary" @click="$emit('create')">
          {{ t('cardDetails.createNew') }}
        </el-button>
      </section>
      <section class="custom-header-right">
        <div class="custom-mode flex mb-4">
          <el-button v-for="(item, index) in props.models" :key="item.model"
            @click="handleViewModeChange(item.model, $event)"
            :class="['flex-1', { 'is-active': activeViewMode === item.model }]" class="view-mode-btn">
            <template #icon>
              <Icon :icon="'vi-ep:grid'" v-if="item.model === 'Grid'" />
              <Icon :icon="'vi-ep:list'" v-else />
            </template>
            {{ item.model }}
          </el-button>
        </div>
        <div class="custom-mode flex">
          <el-button v-for="(item) in scopeOptions" :key="item" @click="handleScopeChange(item, $event)"
            :class="['flex-1', { 'is-active': activeScope === item }]" class="scope-btn">
            <template #icon>
              <Icon :icon="'vi-ep:user'" v-if="item === '个人'" />
              <Icon :icon="'vi-ep:office-building'" v-else />
            </template>
            {{ item }}
          </el-button>
        </div>
      </section>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  models: {
    type: Array<{ model: string }>,
    required: true
  },
  modeName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'create', 'change', 'scopeChange'])

const activeViewMode = ref(props.modelValue || 'Grid')
const activeScope = ref('个人')
const scopeOptions = ['个人', '全部']

const handleViewModeChange = (model: string, event: Event) => {
  activeViewMode.value = model
  emit('update:modelValue', model)
  emit('change', model, event)
}

const handleScopeChange = (scope: string, event: Event) => {
  activeScope.value = scope
  emit('scopeChange', scope, event)
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    activeViewMode.value = newValue
  }
})

const handleChangeBtn = (model: string, event: Event) => {
  handleViewModeChange(model, event)
}
</script>

<style lang="less" scoped>
.custom-mode {
  width: 100%;

  .el-button {
    border: 1px solid #d1d5db;
    border-radius: 0;
    position: relative;
    color: #374151;
    background-color: #ffffff;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    &:hover:not(.is-active) {
      background-color: #f9fafb;
      color: #1f2937;
      border-color: #9ca3af;
      // transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    &.is-active {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: #ffffff;
      border-color: #2563eb;
      box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);

      // transform: translateY(-2px);
      :deep(.el-icon) {
        color: #ffffff;
      }
    }

    &:active {
      // transform: translateY(0);
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
    }
  }

  .el-button+.el-button {
    margin-left: 0;
    border-left: none;
  }

  .el-button:first-child {
    border-radius: 6px 0 0 6px;
  }

  .el-button:last-child {
    border-radius: 0 6px 6px 0;
  }

  .el-button:first-child:last-child {
    border-radius: 6px;
  }
}

.view-mode-btn.is-active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #047857;
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);
}

.scope-btn.is-active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #b45309;
  box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.4);
}

@media (max-width: 768px) {
  .custom-header-right {
    .custom-mode {
      margin-bottom: 8px;
    }
  }

  .custom-mode .el-button {
    font-size: 12px;
    padding: 8px 12px;
  }
}

.el-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>