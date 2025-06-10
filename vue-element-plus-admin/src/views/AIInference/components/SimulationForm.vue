<template>
  <el-card
    class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] relative">
    <div class="p-6 mb-4 flex flex-col gap-6">
      <el-steps :active="active" finish-status="success" align-center>
        <el-step :title="t('AIInference.modelSelection')" :status="getStepStatus(0)"
          :description="getStepDescription(0)" />
        <el-step :title="t('AIInference.hardware')" :status="getStepStatus(1)" :description="getStepDescription(1)" />
        <el-step :title="t('AIInference.deployment')" :status="getStepStatus(2)" :description="getStepDescription(2)" />
        <el-step :title="t('AIInference.confirmation')" :status="getStepStatus(3)"
          :description="getStepDescription(3)" />
      </el-steps>
      <section v-if="active === 0">
        <div v-if="isLoadingSchemas" class="loading-placeholder">
          <el-skeleton :rows="5" animated />
          <p class="text-center text-gray-500 mt-4">正在加载模型配置架构...</p>
        </div>
        <div v-else-if="Object.keys(inferenceModelSchema).length === 0" class="empty-schema">
          <el-empty description="模型配置架构为空，使用默认配置" />
        </div>
        <section v-else>
          <InferenceSchemaForm ref="inferenceSchemaFormRef" :schema="inferenceModelSchema" v-model="inferenceFormItems"
            @validate="handleFormValidate" @search="handleSearch" />
        </section>
      </section>
      <section v-if="active === 1">
        <div v-if="isLoadingSchemas" class="loading-placeholder">
          <el-skeleton :rows="5" animated />
          <p class="text-center text-gray-500 mt-4">正在加载硬件配置架构...</p>
        </div>
        <div v-else-if="Object.keys(hardwareModelSchema).length === 0" class="empty-schema">
          <el-empty description="硬件配置架构为空，使用默认配置" />
        </div>
        <section v-else>
          <schema-form ref="hardwareSchemaFormRef" :schema="hardwareModelSchema" v-model="hardwareFormItems"
            @validate="handleFormValidate" />
        </section>
      </section>
      <section v-if="active === 2">
        <div v-if="isLoadingSchemas" class="loading-placeholder">
          <el-skeleton :rows="5" animated />
          <p class="text-center text-gray-500 mt-4">正在加载部署配置架构...</p>
        </div>
        <div v-else-if="0" class="empty-schema">
          <el-empty description="部署配置架构为空，使用默认配置" />
        </div>
        <section v-else>
          <RuntimeSchemaForm ref="runtimeSchemaFormRef" :schema="runtimeSchema" v-model="runtimeFormItems"
            @validate="handleFormValidate" @search="handleSearch" />
        </section>
      </section>
      <div v-if="active === 3" class="confirmation-section">
        <h2 class="confirmation-title">确认并提交仿真任务</h2>

        <div class="task-name-section">
          <el-tag size="large" effect="dark" class="label-tag">任务名称</el-tag>
          <el-input placeholder="请输入任务名称" v-model="taskName" style="width: 400px"
            :class="{ 'error-input': !taskName.trim() }" />
          <span v-if="!taskName.trim()" class="error-text">* 任务名称为必填项</span>
        </div>

        <div class="config-summary">
          <h3>配置摘要</h3>
          <el-card class="summary-card">
            <div class="summary-item">
              <el-tag size="large" effect="dark" class="label-tag">模型配置</el-tag>
              <div class="config-details">
                <div v-if="inferenceFormItems.name">
                  <span class="config-label">模型名称:</span> {{ inferenceFormItems.name }}
                </div>
                <div v-if="inferenceFormItems.base_options?.attn_type">
                  <span class="config-label">注意力类型:</span> {{ inferenceFormItems.base_options.attn_type }}
                </div>
                <div v-if="inferenceFormItems.base_options?.structure_type">
                  <span class="config-label">结构类型:</span> {{ inferenceFormItems.base_options.structure_type }}
                </div>
              </div>
            </div>

            <div class="summary-item">
              <el-tag size="large" effect="dark" class="label-tag">硬件配置</el-tag>
              <div class="config-details">
                <div v-if="hardwareFormItems.name">
                  <span class="config-label">配置名称:</span> {{ hardwareFormItems.name }}
                </div>
                <div v-if="hardwareFormItems.gpu?.gpu_type">
                  <span class="config-label">GPU类型:</span> {{ hardwareFormItems.gpu.gpu_type }}
                </div>
                <div v-if="hardwareFormItems.gpu?.gpu_num">
                  <span class="config-label">GPU数量:</span> {{ hardwareFormItems.gpu.gpu_num }}
                </div>
              </div>
            </div>

            <div class="summary-item">
              <el-tag size="large" effect="dark" class="label-tag">部署环境</el-tag>
              <div class="config-details">
                <span class="config-label">状态:</span> 配置完成
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
    <footer>
      <div class="flex justify-center mt-4 space-x-4">
        <el-button @click="handlePrevious" :disabled="active === 0">{{
          t('common.prevLabel')
        }}</el-button>
        <!-- :disabled="!canProceed" -->
        <el-button type="primary" @click="handleNext" :loading="isSubmitting">
          {{ active === 3 ? t('common.ok') : t('common.nextLabel') }}</el-button>
        <el-button type="info" @click="handleSaveDraft" :loading="isSavingDraft"> 保存草稿 </el-button>
      </div>
    </footer>
    <div class="absolute top-4 right-6" @click="handleCancelModelChange">
      <Icon :icon="'vi-ep:close-bold'" :size="25" color="var(--el-color-danger)" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import {
  ref,
  nextTick,
  watch,
  onBeforeMount
} from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSystemConfigStore } from '@/store/modules/systemConfigs'
import { useInferenceModelConfigStore } from '@/store/modules/inferenceModelConfigs'
import InferenceSchemaForm from './InferenceSchemaForm.vue'
import RuntimeSchemaForm from './RuntimeSchemaForm.vue'
import SchemaForm from '@/components/SchemaForm/index.vue'
import { useRuntimeConfigStore } from '@/store/modules/inferenceRuntimeConfigs'
const { t } = useI18n()
// 定义事件
const emit = defineEmits<{
  fieldChange: [data: { field: string; value: any; oldValue: any }]
  sectionToggle: [data: { sectionKey: string; visible: boolean }]
  validationChange: [data: { field: string; isValid: boolean; message?: string }]
  dataChange: [data: any]
  stepChange: [data: { newStep: number; oldStep: number }]
  modelChange: [model: string]
  attentionTypeChange: [attnType: string]
  gpuTypeChange: [gpuType: string]
  formReset: []
  formSubmit: [data: any, taskName: string]
  formSubmitError: [error: any]
  cancel: []
}>()
// store仓库相关定义
const systemConfigStore = useSystemConfigStore()
const inferenceModelConfigStore = useInferenceModelConfigStore()
const runtimeConfigStore = useRuntimeConfigStore()
// 步骤条
const active = ref(2)
const showAdvancedConfig = ref(false)
const isSubmitting = ref(false)
const isSavingDraft = ref(false)
const hasUnsavedChanges = ref(false)
const taskName = ref('')
// Form验证
const validationErrors = ref<Record<string, string>>({})
// Schema配置
const inferenceSchemaFormRef = ref()
const runtimeSchemaFormRef = ref()
const inferenceModelSchema = ref<any>({})
const runtimeSchema = ref<any>({})
const inferenceFormItems = ref<any>({})
const runtimeFormItems = ref<any>({})
const hardwareModelSchema = ref<any>({})
const hardwareSchemaFormRef = ref()
const hardwareFormItems = ref<any>({})
const isLoadingSchemas = ref(false)
// 硬件选择相关的响应式数据
const formValid = ref(false)
// 步骤验证状态
const stepValidationStatus = ref<Record<number, 'wait' | 'process' | 'finish' | 'error'>>({
  0: 'wait',
  1: 'wait',
  2: 'wait',
  3: 'wait'
})
// 步骤验证错误信息
const stepValidationErrors = ref<Record<number, string>>({})

const handleFormValidate = (valid: boolean) => {
  formValid.value = valid
  // 更新当前步骤的验证状态
  if (valid) {
    stepValidationStatus.value[active.value] = 'finish'
    delete stepValidationErrors.value[active.value]
  } else {
    stepValidationStatus.value[active.value] = 'error'
  }
}

// 组件挂载时获取硬件配置数据
onBeforeMount(async () => {
  isLoadingSchemas.value = true
  await Promise.all([loadInferenceModelSchema(), loadDraftIfExists()])
  isLoadingSchemas.value = false
})

// 加载模型配置InferenceModelSchema
const loadInferenceModelSchema = async () => {
  try {
    await inferenceModelConfigStore.fetchSchemaConfigs()
    const schemaData = inferenceModelConfigStore.schemeConfigs
    if (schemaData) {
      inferenceModelSchema.value = schemaData
    } else {
      ElMessage.warning('模型Schema数据格式不正确')
    }
  } catch (error) {
    ElMessage.error('加载模型Schema失败')
  }
}

// 加载硬件配置Schema (Step 1)
const loadHardwareModelSchema = async () => {
  try {
    await systemConfigStore.fetchSchemaConfigs()
    const schemaData = systemConfigStore.schemeConfigs
    if (schemaData) {
      hardwareModelSchema.value = schemaData
      console.log(hardwareModelSchema.value, '硬件Schema加载成功')
    } else {
      ElMessage.warning('模型Schema数据格式不正确')
    }
  } catch (error) {
    ElMessage.error('加载硬件Schema失败')
  }
}

// 加载模型配置RuntimeSchema
const loadRuntimeSchema = async () => {
  try {
    await runtimeConfigStore.fetchSchemaConfigs()
    const schemaData = runtimeConfigStore.schemeConfigs
    if (schemaData) {
      runtimeSchema.value = schemaData
    } else {
      ElMessage.warning('模型Schema数据格式不正确')
    }
  } catch (error) {
    ElMessage.error('加载模型Schema失败')
  }
}
// 监听步骤变化
watch(active, (newStep, oldStep) => {
  onStepChange(newStep, oldStep)
})

// 监听表单数据变化
watch([inferenceFormItems, hardwareFormItems, taskName], () => {
  hasUnsavedChanges.value = true
}, { deep: true })

// 步骤变化处理
const onStepChange = (newStep: number, oldStep: number) => {
  // 验证上一步的数据
  if (oldStep < newStep) {
    // validateStep(oldStep)
  }

  emit('stepChange', { newStep, oldStep })
}

// 获取步骤状态
const getStepStatus = (step: number) => {
  if (step < active.value) {
    return stepValidationStatus.value[step] || 'finish'
  } else if (step === active.value) {
    return stepValidationStatus.value[step] || 'process'
  } else {
    return 'wait'
  }
}

// 获取步骤描述
const getStepDescription = (step: number) => {
  if (stepValidationErrors.value[step]) {
    return stepValidationErrors.value[step]
  }

  switch (step) {
    case 0:
      return formValid.value ? '配置完成' : '请完成模型配置'
    case 1:
      return '硬件资源配置'
    case 2:
      return '部署环境配置'
    case 3:
      return '确认并提交'
    default:
      return ''
  }
}

// 验证指定步骤
const validateStep = async (step: number) => {
  try {
    let isValid = false
    let errorMessage = ''

    switch (step) {
      case 0:
        // 验证模型配置表单
        if (inferenceSchemaFormRef.value) {
          isValid = await inferenceSchemaFormRef.value.validate()
          if (!isValid) {
            errorMessage = '模型配置有误，请检查必填项'
          }
        } else {
          errorMessage = '模型配置表单未加载'
        }
        break
      case 1:
        // 验证硬件配置表单
        if (hardwareSchemaFormRef.value) {
          isValid = await hardwareSchemaFormRef.value.validate()
          if (!isValid) {
            errorMessage = '硬件配置有误，请检查必填项'
          }
        } else {
          errorMessage = '硬件配置表单未加载'
        }
        break
      case 2:
        // 验证部署配置
        isValid = true // 部署配置暂时没有复杂验证
        break
      case 3:
        // 验证任务名称
        if (!taskName.value.trim()) {
          isValid = false
          errorMessage = '请输入任务名称'
        } else {
          isValid = true
        }
        break
      default:
        isValid = true
    }

    // 更新步骤状态
    if (isValid) {
      stepValidationStatus.value[step] = 'finish'
      delete stepValidationErrors.value[step]
    } else {
      stepValidationStatus.value[step] = 'error'
      stepValidationErrors.value[step] = errorMessage
      ElMessage.error(errorMessage)
    }

    return isValid
  } catch (error) {
    console.error(`Step ${step} validation error:`, error)
    stepValidationStatus.value[step] = 'error'
    stepValidationErrors.value[step] = '验证失败，请重试'
    ElMessage.error('验证失败，请重试')
    return false
  }
}

// 下一步处理
const handleNext = async () => {
  try {
    // 验证当前步骤
    const isValid = await validateStep(active.value)
    if (!isValid) {
      return // 验证失败，不继续
    }

    // 验证通过，进入下一步
    if (active.value === 3) {
      // 最后一步，提交表单
      await handleSubmit(taskName.value)
    } else {
      // 进入下一步
      const oldStep = active.value
      active.value++

      // 根据步骤加载对应的数据
      if (active.value === 1) {
        await loadHardwareModelSchema()
      }
      if (active.value === 2) {
        await loadRuntimeSchema()
      }
      ElMessage.success(`第${oldStep + 1}步验证通过`)

      // 滚动到顶部
      await nextTick()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (error) {
    console.error('Error in handleNext:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 上一步处理
const handlePrevious = async () => {
  if (hasUnsavedChanges.value) {
    try {
      await ElMessageBox.confirm(
        'You have unsaved changes. Are you sure you want to go back?',
        'Unsaved Changes',
        {
          confirmButtonText: 'Yes, go back',
          cancelButtonText: 'Stay here',
          type: 'warning'
        }
      )
    } catch {
      return // User cancelled
    }
  }

  active.value--
  hasUnsavedChanges.value = false

  // 滚动到顶部
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 重置表单
const handleReset = async () => {
  try {
    await ElMessageBox.confirm('This will reset all form data. Are you sure?', 'Reset Form', {
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })

    // 重置表单数据


    // 重置状态
    active.value = 0
    showAdvancedConfig.value = false
    hasUnsavedChanges.value = false
    validationErrors.value = {}

    ElMessage.success('Form has been reset')
    emit('formReset')
  } catch {
    // User cancelled
  }
}

const handleCancelModelChange = async () => {
  await ElMessageBox.confirm('确认取消模型创建吗?', '取消创建', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  ElMessage.success('取消创建模型')
  emit('cancel')
}

// 提交表单
const handleSubmit = async (taskName: string) => {
  isSubmitting.value = true
  try {
    // 收集所有表单数据
    const formData = {
      taskName: taskName,
      step: active.value,
      modelConfig: inferenceFormItems.value,
      hardwareConfig: hardwareFormItems.value,
      timestamp: new Date().toISOString()
    }

    await new Promise((resolve) => setTimeout(resolve, 2000))
    ElMessage.success('Configuration submitted successfully!')
    emit('formSubmit', formData, taskName)
  } catch (error) {
    console.error('Submission error:', error)
    ElMessage.error('Failed to submit configuration')
    emit('formSubmitError', error)
  } finally {
    isSubmitting.value = false
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  isSavingDraft.value = true
  try {
    // 收集当前表单数据
    const draftData = {
      taskName: taskName.value,
      currentStep: active.value,
      modelConfig: inferenceFormItems.value,
      hardwareConfig: hardwareFormItems.value,
      timestamp: new Date().toISOString(),
      isDraft: true
    }

    // 模拟保存到本地存储或服务器
    localStorage.setItem('simulation_draft', JSON.stringify(draftData))

    await new Promise((resolve) => setTimeout(resolve, 1000))
    ElMessage.success('草稿保存成功')
    hasUnsavedChanges.value = false
  } catch (error) {
    console.error('Save draft error:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    isSavingDraft.value = false
  }
}

// 加载草稿（如果存在）
const loadDraftIfExists = async () => {
  try {
    const draftStr = localStorage.getItem('simulation_draft')
    if (draftStr) {
      const draftData = JSON.parse(draftStr)

      // 询问用户是否加载草稿
      const result = await ElMessageBox.confirm(
        `发现保存的草稿（${new Date(draftData.timestamp).toLocaleString()}），是否要加载？`,
        '发现草稿',
        {
          confirmButtonText: '加载草稿',
          cancelButtonText: '忽略草稿',
          type: 'info'
        }
      )

      if (result === 'confirm') {
        // 恢复草稿数据
        taskName.value = draftData.taskName || ''
        active.value = draftData.currentStep || 0

        if (draftData.modelConfig) {
          inferenceFormItems.value = draftData.modelConfig
        }

        if (draftData.hardwareConfig) {
          hardwareFormItems.value = draftData.hardwareConfig
        }

        ElMessage.success('草稿加载成功')
        hasUnsavedChanges.value = true
      }
    }
  } catch (error) {
    // 用户取消或其他错误，静默处理
    console.log('Draft loading cancelled or failed:', error)
  }
}


// 暴露方法给父组件
defineExpose({
  validateCurrentStep: () => validateStep(active.value),
  goToStep: (step: number) => {
    if (step >= 0 && step <= 3) {
      active.value = step
    }
  },
  resetForm: handleReset,
  submitForm: handleSubmit,
})

// 搜索功能
const handleSearch = (keyword: string) => {
  // inferenceModelConfigStore.setFilter('name', keyword.trim() || null)
  console.log(keyword, '| keyword')
}
</script>

<style lang="less" scoped>
.step-content {
  padding: 20px;
  min-height: 200px;

  h3 {
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 500;
  }

  .config-summary {
    margin-bottom: 20px;
  }

  pre {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    overflow: auto;
    max-height: 400px;
  }
}

.custom-section {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  .el-alert {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .mla-values-display {
    margin-top: 15px;
    padding: 10px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #d1ecf1;

    :deep(.el-descriptions__title) {
      font-size: 14px;
      font-weight: 500;
      color: #155724;
      margin-bottom: 10px;
    }

    :deep(.el-descriptions__body) {
      .el-descriptions__table {
        .el-descriptions__cell {
          padding: 8px 12px;
        }
      }
    }
  }
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}

:deep(.el-collapse-item__header) {
  font-weight: 500;
}

:deep(.el-alert__title) {
  font-size: 14px;
}

.form-section {
  margin-bottom: 30px;

  .section-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 20px;
    color: var(--el-text-color-primary);

    .required {
      color: var(--el-color-danger);
      margin-left: 4px;
    }
  }
}

.label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.loading-placeholder {
  padding: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.empty-schema {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-section {
  padding: 20px;
  min-height: 400px;

  .confirmation-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 24px;
    text-align: center;
  }

  .task-name-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;

    .label-tag {
      width: 120px;
      justify-content: center;
    }

    .error-input {
      :deep(.el-input__wrapper) {
        border-color: var(--el-color-danger);
      }
    }

    .error-text {
      color: var(--el-color-danger);
      font-size: 12px;
    }
  }

  .config-summary {
    h3 {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 16px;
      color: #303133;
    }

    .summary-card {
      .summary-item {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }

        .label-tag {
          width: 120px;
          justify-content: center;
          margin-bottom: 12px;
        }

        .config-details {
          margin-left: 8px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;

          div {
            margin-bottom: 8px;

            &:last-child {
              margin-bottom: 0;
            }
          }

          .config-label {
            font-weight: 500;
            color: #606266;
            margin-right: 8px;
          }
        }
      }
    }
  }
}
</style>
