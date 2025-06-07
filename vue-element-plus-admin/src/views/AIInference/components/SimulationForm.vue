<template>
  <el-card
    class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] relative"
  >
    <div class="p-6 mb-4 flex flex-col gap-6">
      <el-steps :active="active" finish-status="success" align-center>
        <el-step :title="t('AIInference.modelSelection')" />
        <el-step :title="t('AIInference.hardware')" />
        <el-step :title="t('AIInference.deployment')" />
        <el-step :title="t('AIInference.confirmation')" />
      </el-steps>
      <section v-if="active === 0">
        <div v-if="isLoadingSchemas" class="loading-placeholder">
          <el-skeleton :rows="5" animated />
          <p class="text-center text-gray-500 mt-4">正在加载模型配置架构...</p>
        </div>
        <div v-else-if="currentStepSections.length === 0" class="empty-schema">
          <el-empty description="模型配置架构为空，使用默认配置" />
        </div>
        <section v-else>
          <SchemaForm
            ref="schemaFormRef"
            :schema="modelSchema"
            v-model="formItems"
            @validate="handleFormValidate"
            @search="handleSearch"
          />
        </section>
      </section>
      <section v-if="active === 1">
        <div v-if="isLoadingSchemas" class="loading-placeholder">
          <el-skeleton :rows="5" animated />
          <p class="text-center text-gray-500 mt-4">正在加载硬件配置架构...</p>
        </div>
        <div v-else-if="currentStepSections.length === 0" class="empty-schema">
          <el-empty description="硬件配置架构为空，使用默认配置" />
        </div>
        <el-form
          v-else
          ref="formRef"
          :model="formData[active]"
          label-width="140px"
          label-position="left"
        >
          <!-- 渲染表单区块 -->
          <div v-for="section in visibleSections" :key="section.key" class="form-section">
            <el-divider content-position="left" class="section-title">
              {{ section.title }}
              <span v-if="section.required" class="required">*</span>
            </el-divider>
            <!-- 两列布局 -->
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item
                  v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 0)"
                  :key="field.field"
                  :prop="field.field"
                  :rules="getFieldRules(field)"
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="field"
                    :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item
                  v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 1)"
                  :key="field.field"
                  :prop="field.field"
                  :rules="getFieldRules(field)"
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="field"
                    :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </section>
      <section v-if="active === 2">
        <el-form ref="formRef" :model="formData[active]" label-width="140px" label-position="left">
          <!-- 渲染表单区块 -->
          <div v-for="section in visibleSections" :key="section.key" class="form-section">
            <el-divider content-position="left" class="section-title">
              {{ section.title }}
              <span v-if="section.required" class="required">*</span>
            </el-divider>
            <!-- 两列布局 -->
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item
                  v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 0)"
                  :key="field.field"
                  :prop="field.field"
                  :rules="getFieldRules(field)"
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="field"
                    :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item
                  v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 1)"
                  :key="field.field"
                  :prop="field.field"
                  :rules="getFieldRules(field)"
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="field"
                    :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- MLA提示配置 -->
          <div class="custom-section">
            <el-alert
              v-if="formData[active].environment === 'staging'"
              title="Staging Extended Options are now visible!"
              type="success"
              :closable="false"
              show-icon
            />
            <el-alert
              v-else="formData[active].environment === 'moe'"
              title="(Staging options hidden)"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
          <!-- 高级配置切换 -->
          <div v-if="showToggle" class="toggle-section">
            <el-switch
              :model-value="showAdvancedConfig"
              @update:model-value="handleAdvancedConfigToggle"
              active-text="Advanced Config"
            />
          </div>
          <!-- High-Level Options (显示在toggle下方) -->
          <div v-if="showAdvancedConfig" class="form-section">
            <el-divider content-position="left" class="section-title">
              High-Level Options
              <span class="required">*</span>
            </el-divider>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item
                  prop="norm"
                  :rules="
                    getFieldRules({
                      field: 'norm',
                      label: 'norm',
                      component: 'Select',
                      required: true
                    })
                  "
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="norm" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">norm</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{
                      field: 'norm',
                      label: 'norm',
                      component: 'Select',
                      componentProps: { placeholder: '请选择' },
                      options: [
                        { label: 'RMSNorm', value: 'rmsnorm' },
                        { label: 'LayerNorm', value: 'layernorm' }
                      ]
                    }"
                    :value="formData[active].norm"
                    @update="(value) => handleFieldUpdate('norm', value)"
                    style="width: 300px"
                  />
                </el-form-item>
                <el-form-item
                  prop="hybridModelEnable"
                  :rules="
                    getFieldRules({
                      field: 'hybridModelEnable',
                      label: 'hybrid_model_enable',
                      component: 'Switch'
                    })
                  "
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="hybrid_model_enable" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">hybrid_model_enable</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{
                      field: 'hybridModelEnable',
                      label: 'hybrid_model_enable',
                      component: 'Switch'
                    }"
                    :value="formData[active].hybridModelEnable"
                    @update="(value) => handleFieldUpdate('hybridModelEnable', value)"
                    style="width: 300px"
                  />
                </el-form-item>
                <el-form-item
                  prop="hybridDenseBlocksNum"
                  :rules="
                    getFieldRules({
                      field: 'hybridDenseBlocksNum',
                      label: 'hybrid_dense_blocks_num',
                      component: 'InputNumber'
                    })
                  "
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="hybrid_dense_blocks_num" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">hybrid_dense_blocks_num</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{
                      field: 'hybridDenseBlocksNum',
                      label: 'hybrid_dense_blocks_num',
                      component: 'InputNumber',
                      componentProps: { controls: false, placeholder: '0' }
                    }"
                    :value="formData[active].hybridDenseBlocksNum"
                    @update="(value) => handleFieldUpdate('hybridDenseBlocksNum', value)"
                    style="width: 300px"
                  />
                </el-form-item>
                <el-form-item
                  prop="embeddingOutputShare"
                  :rules="
                    getFieldRules({
                      field: 'embeddingOutputShare',
                      label: 'embedding_output_share',
                      component: 'Switch'
                    })
                  "
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="embedding_output_share" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">embedding_output_share</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{
                      field: 'embeddingOutputShare',
                      label: 'embedding_output_share',
                      component: 'Switch'
                    }"
                    :value="formData[active].embeddingOutputShare"
                    @update="(value) => handleFieldUpdate('embeddingOutputShare', value)"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item
                  prop="embeddingSize"
                  :rules="
                    getFieldRules({
                      field: 'embeddingSize',
                      label: 'embedding_size',
                      component: 'InputNumber'
                    })
                  "
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="embedding_size" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">embedding_size</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{
                      field: 'embeddingSize',
                      label: 'embedding_size',
                      component: 'InputNumber',
                      componentProps: { controls: false, placeholder: '0' }
                    }"
                    :value="formData[active].embeddingSize"
                    @update="(value) => handleFieldUpdate('embeddingSize', value)"
                    style="width: 300px"
                  />
                </el-form-item>
                <el-form-item
                  prop="hybridMoeBlocksNum"
                  :rules="
                    getFieldRules({
                      field: 'hybridMoeBlocksNum',
                      label: 'hybrid_moe_blocks_num',
                      component: 'InputNumber'
                    })
                  "
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="hybrid_moe_blocks_num" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">hybrid_moe_blocks_num</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{
                      field: 'hybridMoeBlocksNum',
                      label: 'hybrid_moe_blocks_num',
                      component: 'InputNumber',
                      componentProps: { controls: false, placeholder: '0' }
                    }"
                    :value="formData[active].hybridMoeBlocksNum"
                    @update="(value) => handleFieldUpdate('hybridMoeBlocksNum', value)"
                    style="width: 300px"
                  />
                </el-form-item>
                <el-form-item
                  prop="mtpModuleNum"
                  :rules="
                    getFieldRules({
                      field: 'mtpModuleNum',
                      label: 'mtp_module_num',
                      component: 'InputNumber'
                    })
                  "
                  :label-position="'left'"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="mtp_module_num" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">mtp_module_num</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{
                      field: 'mtpModuleNum',
                      label: 'mtp_module_num',
                      component: 'InputNumber',
                      componentProps: { controls: false, placeholder: '0' }
                    }"
                    :value="formData[active].mtpModuleNum"
                    @update="(value) => handleFieldUpdate('mtpModuleNum', value)"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </section>
      <div v-if="active === 3" class="flex flex-col gap-4 min-h-40 pl-20 pt-20">
        <h2>Run Simulation with selected parameters?</h2>
        <div
          ><el-tag size="large" effect="dark" style="width: 120px">Task Name</el-tag> :
          <el-input placeholder="Enter job Name" v-model="taskName" style="width: 400px" />
        </div>
        <p v-for="(step, idx) in ['modelSelection', 'handwareSelection', 'environment']">
          <el-tag size="large" effect="dark" style="width: 120px">{{ step }}</el-tag> :
          <el-tag size="large" effect="light">{{ formData[idx][step] }}</el-tag>
        </p>
      </div>
    </div>
    <footer>
      <div class="flex justify-center mt-4 space-x-4">
        <el-button @click="handlePrevious" :disabled="active === 0">{{
          t('common.prevLabel')
        }}</el-button>
        <!-- :disabled="!canProceed" -->
        <el-button type="primary" @click="handleNext" :loading="isSubmitting">
          {{ active === 3 ? t('common.ok') : t('common.nextLabel') }}</el-button
        >
        <el-button type="info"> 保存草稿 </el-button>
      </div>
    </footer>
    <div class="absolute top-4 right-6" @click="handleCancelModelChange">
      <!-- #f56c6c -->
      <Icon :icon="'vi-ep:close-bold'" :size="25" color="var(--el-color-danger)" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  nextTick,
  watch,
  defineComponent,
  h,
  onMounted,
  onBeforeMount
} from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ElSelect, ElInputNumber, ElSwitch, ElOption } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useSystemConfigStore } from '@/store/modules/systemConfigs'
import { useInferenceModelConfigStore } from '@/store/modules/inferenceModelConfigs'
import SchemaForm from './schemaForm.vue'

const { t } = useI18n()
const systemConfigStore = useSystemConfigStore()
const inferenceModelConfigStore = useInferenceModelConfigStore()
const formItems = ref<any>({})
const schemaFormRef = ref()
// 字段类型定义
interface FormField {
  field: string
  label: string
  component: 'Select' | 'InputNumber' | 'Switch'
  componentProps?: Record<string, any>
  options?: Array<{ label: string; value: string | number }>
  required?: boolean
  validator?: (value: any) => boolean | string
}

interface FormSection {
  key: string
  title: string
  required?: boolean
  visible?: () => boolean
  fields: FormField[]
}

const formValid = ref(false)
const handleFormValidate = (valid: boolean) => {
  formValid.value = valid
}

const active = ref(0)
const showAdvancedConfig = ref(false)
const isSubmitting = ref(false)
const validationErrors = ref<Record<string, string>>({})
const hasUnsavedChanges = ref(false)
const taskName = ref('')
const showToggle = ref(true)

// 硬件选择相关的响应式数据
const hardwareOptions = ref<Array<{ label: string; value: string }>>([])

// Schema配置
const modelSchema = ref<any>(null)
const hardwareSchema = ref<any>(null)
const isLoadingSchemas = ref(false)

// 动态生成的表单配置
const dynamicFormSections = ref<FormSection[][]>([[], [], []])
// 获取schema数据
// const schemaConfigs: any = computed(() => inferenceModelConfigStore.schemeConfigs)
// 组件挂载时获取硬件配置数据
onBeforeMount(async () => {
  isLoadingSchemas.value = true
  // 先获取Schema配置，再获取数据
  await Promise.all([loadHardwareOptions(), loadModelSchema(), loadHardwareSchema()])
  isLoadingSchemas.value = false
})

// 加载模型配置Schema (Step 0)
const loadModelSchema = async () => {
  try {
    console.log('开始加载模型Schema配置...')
    await inferenceModelConfigStore.fetchSchemaConfigs()
    const schemaData = inferenceModelConfigStore.schemeConfigs

    console.log('获取的模型Schema数据:', schemaData)

    if (schemaData) {
      modelSchema.value = schemaData
      console.log('模型Schema加载成功')
    } else {
      console.warn('模型Schema数据格式不正确')
    }
  } catch (error) {
    console.error('Failed to load model schema:', error)
    ElMessage.error('加载模型Schema失败')
  }
}

// 加载硬件配置Schema (Step 1)
const loadHardwareSchema = async () => {
  try {
    console.log('开始加载硬件Schema配置...')
    await systemConfigStore.fetchSchemaConfigs()
    const schemaData = systemConfigStore.schemeConfigs

    console.log('获取的硬件Schema数据:', schemaData)

    if (schemaData && schemaData.uiConfig) {
      hardwareSchema.value = schemaData.uiConfig
      generateFormSectionsFromSchema(hardwareSchema.value, 1)
      generateFormDataFromSchema(hardwareSchema.value, 1)
      console.log('硬件Schema加载成功')
    } else {
      console.warn('硬件Schema数据格式不正确')
    }
  } catch (error) {
    console.error('Failed to load hardware schema:', error)
    ElMessage.error('加载硬件Schema失败')
  }
}

// 从 store 加载硬件选项
const loadHardwareOptions = async () => {
  try {
    // 设置page_size为1来获取单个硬件配置用于渲染
    systemConfigStore.pagination.pageSize = 1
    await systemConfigStore.fetchConfigs()

    // 将硬件配置转换为选项格式
    hardwareOptions.value = systemConfigStore.configs.map((config) => ({
      label: config.name,
      value: config.id || config.name
    }))
  } catch (error) {
    console.error('Failed to load hardware options:', error)
    ElMessage.error('加载硬件配置失败')
  }
}

// 从Schema生成表单配置
const generateFormSectionsFromSchema = (schema: any, stepIndex: number) => {
  if (!schema || !schema.formSections) {
    console.warn(`Schema中没有找到formSections，stepIndex: ${stepIndex}`)
    return
  }

  try {
    const sections: FormSection[] = schema.formSections.map((section: any) => ({
      key: section.key,
      title: section.title,
      required: section.required || false,
      visible: section.visible ? () => eval(section.visible) : undefined,
      fields: section.fields.map((field: any) => ({
        field: field.field,
        label: field.label,
        component: field.component as 'Select' | 'InputNumber' | 'Switch',
        componentProps: field.componentProps || {},
        options: field.options || [],
        required: field.required || false,
        validator: field.validator ? (value: any) => eval(field.validator) : undefined
      }))
    }))

    dynamicFormSections.value[stepIndex] = sections
    console.log(`Step ${stepIndex} 表单配置生成完成:`, sections)
  } catch (error) {
    console.error(`生成Step ${stepIndex}表单配置失败:`, error)
  }
}

// 从Schema生成表单数据
const generateFormDataFromSchema = (schema: any, stepIndex: number) => {
  if (!schema || !schema.defaultData) {
    console.warn(`Schema中没有找到defaultData，stepIndex: ${stepIndex}`)
    return
  }

  try {
    // 合并默认数据到formData中
    Object.assign(formData[stepIndex], schema.defaultData)
    console.log(`Step ${stepIndex} 表单数据初始化完成:`, formData[stepIndex])
  } catch (error) {
    console.error(`生成Step ${stepIndex}表单数据失败:`, error)
  }
}

// 监听硬件选择变化
const onHardwareSelectionChange = async (value: string) => {
  try {
    // 根据选择的硬件ID获取详细配置
    const selectedConfig = systemConfigStore.configs.find(
      (config) => (config.id || config.name) === value
    )

    if (selectedConfig) {
      // 自动填充硬件详细信息到表单
      const hardwareData = formData[1]
      hardwareData.handwareSelection = value
      hardwareData.Type = selectedConfig.type.toUpperCase()
      hardwareData.processingMode = selectedConfig.processing_mode
      hardwareData.MatrixSize = selectedConfig.matrix.float16.tflops
      hardwareData.VectorSize = selectedConfig.vector.float16.tflops

      // 更新内存相关信息
      hardwareData.memorySize = selectedConfig.mem1.GiB
      hardwareData.batchSize = 32 // 默认值
      hardwareData.maxSequenceLength = 2048 // 默认值

      ElMessage.success(`已加载硬件配置: ${selectedConfig.name}`)
    }
  } catch (error) {
    console.error('Failed to load hardware details:', error)
    ElMessage.error('加载硬件详细信息失败')
  }
}

const formData = reactive([
  {
    // Step 1: Hardware Configuration
    handwareSelection: '',
    Type: '',
    processingMode: '',
    MatrixSize: 0,
    VectorSize: 0,
    gpuType: '',
    gpuCount: 1,
    memorySize: 32,
    cpuCores: 16,
    storageType: '',
    storageSize: 1000,
    batchSize: 32,
    maxSequenceLength: 2048,
    precision: '',
    optimizationLevel: ''
  },
  {
    // Step 2: Deployment Configuration
    environment: '',
    replicas: 1,
    autoScaling: false,
    loadBalancer: false,
    monitoring: false,
    logging: false,
    port: 8080,
    protocol: '',
    timeout: 30,
    maxConnections: 1000
  }
])

// 动态硬件选择配置
const dynamicHardwareSelectionSection = computed(() => ({
  key: 'handwareSelection',
  title: 'Hardware Selection',
  required: true,
  fields: [
    {
      field: 'handwareSelection',
      label: 'Hardware Selection',
      component: 'Select' as const,
      componentProps: {
        placeholder: 'Select Hardware',
        onChange: onHardwareSelectionChange
      },
      options: hardwareOptions.value
    }
  ]
}))

const allFormSections: FormSection[][] = [
  // Step 1: Hardware Configuration - 使用动态配置
  [
    // 使用计算属性的动态硬件选择部分
    // 注意：这里需要使用computed来动态获取最新的硬件选项
    dynamicHardwareSelectionSection.value,
    {
      key: 'hardwareDetails',
      title: 'Hardware Details',
      required: true,
      fields: [
        {
          field: 'Type',
          label: 'GPU Type',
          component: 'Select' as const,
          componentProps: { placeholder: 'Select GPU' },
          options: [
            { label: 'GPU', value: 'GPU' },
            { label: 'NPU', value: 'NPU' }
          ]
        },
        {
          field: 'processingMode',
          label: 'Processing Mode',
          component: 'Select' as const,
          componentProps: { placeholder: 'Select' },
          options: [
            { label: 'roofline', value: 'roofline' },
            { label: 'no_overlap', value: 'no_overlap' }
          ]
        },
        {
          field: 'MatrixSize',
          label: 'Matrix(Float16 TFLOPS)',
          component: 'InputNumber' as const,
          componentProps: { controls: false, placeholder: '32' }
        },
        {
          field: 'VectorSize',
          label: 'Vector(Float16 TFLOPS)',
          component: 'InputNumber' as const,
          componentProps: { controls: false, placeholder: '16' }
        }
      ]
    },
    {
      key: 'MemoryDetails',
      title: 'Memory Details',
      required: true,
      fields: [
        {
          field: 'batchSize',
          label: 'Batch Size',
          component: 'InputNumber' as const,
          componentProps: { controls: false, placeholder: '32' }
        },
        {
          field: 'maxSequenceLength',
          label: 'Max Sequence Length',
          component: 'InputNumber' as const,
          componentProps: { controls: false, placeholder: '2048' }
        },
        {
          field: 'precision',
          label: 'Precision',
          component: 'Select' as const,
          componentProps: { placeholder: 'Select Precision' },
          options: [
            { label: 'FP16', value: 'fp16' },
            { label: 'FP32', value: 'fp32' },
            { label: 'INT8', value: 'int8' }
          ]
        },
        {
          field: 'optimizationLevel',
          label: 'Optimization Level',
          component: 'Select' as const,
          componentProps: { placeholder: 'Select Level' },
          options: [
            { label: 'O1', value: 'o1' },
            { label: 'O2', value: 'o2' },
            { label: 'O3', value: 'o3' }
          ]
        }
      ]
    }
  ],
  // Step 2: Deployment Configuration
  [
    {
      key: 'deploymentSettings',
      title: 'Deployment Settings',
      required: true,
      fields: [
        {
          field: 'environment',
          label: 'Environment',
          component: 'Select',
          componentProps: { placeholder: 'Select Environment' },
          options: [
            { label: 'Development', value: 'dev' },
            { label: 'Staging', value: 'staging' },
            { label: 'Production', value: 'prod' }
          ]
        },
        {
          field: 'replicas',
          label: 'Replicas',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '1', min: 1 }
        },
        {
          field: 'autoScaling',
          label: 'Auto Scaling',
          component: 'Switch'
        },
        {
          field: 'loadBalancer',
          label: 'Load Balancer',
          component: 'Switch'
        },
        {
          field: 'monitoring',
          label: 'Monitoring',
          component: 'Switch'
        },
        {
          field: 'logging',
          label: 'Logging',
          component: 'Switch'
        }
      ]
    },
    {
      key: 'networkSettings',
      title: 'Network Settings',
      required: false,
      fields: [
        {
          field: 'port',
          label: 'Port',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '8080' }
        },
        {
          field: 'protocol',
          label: 'Protocol',
          component: 'Select',
          componentProps: { placeholder: 'Select Protocol' },
          options: [
            { label: 'HTTP', value: 'http' },
            { label: 'HTTPS', value: 'https' },
            { label: 'gRPC', value: 'grpc' }
          ]
        },
        {
          field: 'timeout',
          label: 'Timeout (seconds)',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '30' }
        },
        {
          field: 'maxConnections',
          label: 'Max Connections',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '1000' }
        }
      ]
    }
  ]
]

// 根据当前步骤返回对应的表单配置
const currentStepSections = computed(() => {
  // 优先使用动态生成的配置
  if (
    active.value < dynamicFormSections.value.length &&
    dynamicFormSections.value[active.value].length > 0
  ) {
    return dynamicFormSections.value[active.value]
  }

  // 如果动态配置不存在，回退到静态配置
  if (active.value < allFormSections.length) {
    return allFormSections[active.value]
  }

  return []
})

// 过滤可见的sections (排除High-Level Options，因为它单独渲染)
const visibleSections = computed(() => {
  return currentStepSections.value.filter((section) => {
    // 排除High-Level Options，因为它在toggle-section下方单独渲染
    if (section.key === 'highLevel') {
      return false
    }
    return section.visible ? section.visible() : true
  })
})

// 注意力类型变化处理
const onAttentionTypeChange = (attnType: string) => {
  console.log('Attention type changed:', attnType)
  // 重置相关字段
}

// GPU类型变化处理
// const onGpuTypeChange = (gpuType: string) => {
//   console.log('GPU type changed:', gpuType)
//   // 根据GPU类型设置推荐配置
//   switch (gpuType) {
//     case 'a100':
//       formData[active.value].memorySize = 80
//       formData[active.value].cpuCores = 32
//       break
//     case 'h100':
//       formData[active.value].memorySize = 80
//       formData[active.value].cpuCores = 48
//       break
//     case 'v100':
//       formData[active.value].memorySize = 32
//       formData[active.value].cpuCores = 16
//       break
//   }
//   emit('gpuTypeChange', gpuType)
// }

// 表单验证规则
console.log(inferenceModelConfigStore.schemeConfigs, '| inferenceModelConfigStore.schemeConfigs')

// const validationRules = {
//   0: [
//     'name',
//     'structure_type',
//     'hidden',
//     'feedforward',
//     'attn_heads',
//     'attn_size',
//     'attn_type',
//     'num_blocks'
//   ], // Step 0 required fields
//   1: [], // Step 1 required fields
//   2: ['environment'] // Step 2 required fields
// }

// 计算当前步骤是否可以继续
// const canProceed = computed(() => {
//   const requiredFields = validationRules[active.value] || []
//   return requiredFields.every((field) => {
//     const value = formData[active.value][field]
//     return value !== '' && value !== null && value !== undefined
//   })
// })

// 监听表单数据变化
watch(
  () => formData,
  (newData, oldData) => {
    if (oldData) {
      hasUnsavedChanges.value = true
      onFormDataChange(newData)
    }
  },
  { deep: true }
)

// 监听步骤变化
watch(active, (newStep, oldStep) => {
  onStepChange(newStep, oldStep)
})

// 表单字段变化事件
// const onFieldChange = (field: string, value: any, oldValue: any) => {
//   console.log(`Field changed: ${field}`, { value, oldValue })

//   // 特殊字段变化处理
//   if (field === 'modelSelection') {
//     onModelSelectionChange(value)
//   } else if (field === 'attnType') {
//     onAttentionTypeChange(value)
//   } else if (field === 'gpuType') {
//     onGpuTypeChange(value)
//   }

//   // 清除该字段的验证错误
//   if (validationErrors.value[field]) {
//     delete validationErrors.value[field]
//   }

//   // 触发自定义事件
//   emit('fieldChange', { field, value, oldValue })
// }

// 区块切换事件
// const onSectionToggle = (sectionKey: string, visible: boolean) => {
//   console.log(`Section toggled: ${sectionKey}`, visible)
//   emit('sectionToggle', { sectionKey, visible })
// }

// 验证状态变化事件
// const onValidationChange = (field: string, isValid: boolean, message?: string) => {
//   if (isValid) {
//     delete validationErrors.value[field]
//   } else {
//     validationErrors.value[field] = message || 'Validation failed'
//   }
//   emit('validationChange', { field, isValid, message })
// }

// 模型选择变化处理
// const onModelSelectionChange = (model: string) => {
//   console.log('Model selection changed:', model)
//   ElMessage.success(`Model ${model} selected with default configurations`)
//   emit('modelChange', model)
// }

// 表单数据变化处理
const onFormDataChange = (newData: any) => {
  console.log('Form data changed:', newData)
  emit('dataChange', newData)
}

// 步骤变化处理
const onStepChange = (newStep: number, oldStep: number) => {
  console.log(`Step changed from ${oldStep} to ${newStep}`)

  // 验证上一步的数据
  if (oldStep < newStep) {
    validateStep(oldStep)
  }

  emit('stepChange', { newStep, oldStep })
}

// 验证指定步骤
const validateStep = (step: number) => {
  const requiredFields = validationRules[step] || []
  const errors: string[] = []

  requiredFields.forEach((field) => {
    const value = formData[step][field]
    if (!value || value === '') {
      errors.push(field)
    }
  })

  if (errors.length > 0) {
    ElMessage.warning(`Please fill in required fields: ${errors.join(', ')}`)
    return false
  }

  return true
}

// 下一步处理
const handleNext = async () => {
  showAdvancedConfig.value = false
  try {
    if (active.value === 3) {
      await handleSubmit(taskName.value)
    } else {
      if (!validateStep(active.value)) {
        return
      }
      active.value++
      hasUnsavedChanges.value = false
      // 滚动到顶部
      await nextTick()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (error) {
    console.error('Error in handleNext:', error)
    ElMessage.error('An error occurred while proceeding')
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
    Object.keys(formData).forEach((key) => {
      if (typeof formData[key] === 'boolean') {
        formData[key] = false
      } else if (typeof formData[key] === 'number') {
        formData[key] = 0
      } else {
        formData[key] = ''
      }
    })

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
    // 模拟API调用
    console.log('Form submitted:', formData, 'Form value:', taskName)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    ElMessage.success('Configuration submitted successfully!')
    // emit('formSubmit', formData, taskName)
    // 可以在这里添加路由跳转或其他逻辑
  } catch (error) {
    console.error('Submission error:', error)
    ElMessage.error('Failed to submit configuration')
    emit('formSubmitError', error)
  } finally {
    isSubmitting.value = false
  }
}

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
  getFormData: () => ({ ...formData }),
  setFormData: (data: Partial<typeof formData>) => {
    Object.assign(formData, data)
  }
})

// const excuteFromData = () => {
//   console.log('获取填写完成的表单')
// }

// 字段验证规则
const getFieldRules = (field: FormField): FormRules[string] => {
  const rules: any[] = []

  if (field.required) {
    rules.push({
      required: true,
      message: `${field.label} is required`,
      trigger: ['blur', 'change']
    })
  }

  if (field.validator) {
    rules.push({
      validator: (rule: any, value: any, callback: any) => {
        const result = field.validator!(value)
        if (result === true) {
          callback()
        } else {
          callback(new Error(typeof result === 'string' ? result : 'Validation failed'))
        }
      },
      trigger: ['blur', 'change']
    })
  }

  if (field.component === 'InputNumber') {
    rules.push({
      type: 'number',
      message: `${field.label} must be a number`,
      trigger: ['blur', 'change']
    })
  }

  return rules
}

const FormFieldRenderer = defineComponent({
  name: 'FormFieldRenderer',
  props: {
    field: {
      type: Object as () => FormField,
      required: true
    },
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const handleUpdate = (value: any) => {
      emit('update', value)
    }
    return () => {
      const { field, value } = props
      switch (field.component) {
        case 'Select':
          return h(
            ElSelect,
            {
              modelValue: value || '',
              'onUpdate:modelValue': handleUpdate,
              clearable: true,
              ...field.componentProps
            },
            {
              default: () =>
                field.options?.map((option) =>
                  h(ElOption, {
                    key: option.value,
                    label: option.label,
                    value: option.value
                  })
                )
            }
          )

        case 'InputNumber':
          return h(ElInputNumber, {
            modelValue: typeof value === 'number' ? value : 0,
            'onUpdate:modelValue': handleUpdate,
            style: { width: '100%' },
            ...field.componentProps
          })

        case 'Switch':
          return h(ElSwitch, {
            modelValue: value || false,
            'onUpdate:modelValue': handleUpdate,
            ...field.componentProps
          })

        default:
          return null
      }
    }
  }
})
// 字段更新处理
const handleFieldUpdate = (field: string, value: any) => {
  const oldValue = formData[active.value][field]

  // 更新表单数据
  formData[active.value][field] = value

  // 创建新的 modelValue
  const newModelValue = { ...formData }

  console.log(newModelValue, 'newModelValue')

  // 特殊字段变化处理
  if (field === 'attnType') {
    onAttentionTypeChange(value)
  }
}

// 搜索功能
const handleSearch = (keyword: string) => {
  // inferenceModelConfigStore.setFilter('name', keyword.trim() || null)
  console.log(keyword, '| keyword')
}

// 高级配置切换
const handleAdvancedConfigToggle = (value: boolean) => {
  showAdvancedConfig.value = value
  emit('sectionToggle', { sectionKey: 'advanced', visible: value })
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
</style>
