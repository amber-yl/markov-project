<template>
  <el-card
    class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--footer-card-height))] overflow-auto">
    <div class="p-6 mb-4 flex flex-col gap-6">
      <el-steps :active="active" finish-status="success" align-center>
        <el-step :title="t('AIInference.modelSelection')" />
        <el-step :title="t('AIInference.hardware')" />
        <el-step :title="t('AIInference.deployment')" />
        <el-step :title="t('AIInference.confirmation')" />
      </el-steps>
      <section v-if="active === 0">
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
                <el-form-item v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 0)" :key="field.field"
                  :prop="field.field" :rules="getFieldRules(field)" :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer :field="field" :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px;" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 1)" :key="field.field"
                  :prop="field.field" :rules="getFieldRules(field)" :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer :field="field" :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px;" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- MLA提示配置 -->
          <div class="custom-section">

            <el-alert v-if="formData[active].attnType === 'mla'" title="MLA Extended Options are now visible!"
              type="success" :closable="false" show-icon />
            <el-alert v-else-if="formData[active].attnType === 'moe'"
              title="MOE configuration selected (MLA options hidden)" type="warning" :closable="false" show-icon />
            <el-alert v-else :title="`Current attn_type: ${formData[active].attnType || 'Not selected'}`" type="info"
              :closable="false" show-icon />
          </div>
          <!-- 高级配置切换 -->
          <div v-if="showToggle" class="toggle-section">
            <el-switch :model-value="showAdvancedConfig" @update:model-value="handleAdvancedConfigToggle"
              active-text="Advanced Config" />
          </div>
          <!-- High-Level Options (显示在toggle下方) -->
          <div v-if="showAdvancedConfig" class="form-section">
            <el-divider content-position="left" class="section-title">
              High-Level Options
              <span class="required">*</span>
            </el-divider>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item prop="norm"
                  :rules="getFieldRules({ field: 'norm', label: 'norm', component: 'Select', required: true })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="norm" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">norm</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'norm', label: 'norm', component: 'Select', componentProps: { placeholder: '请选择' }, options: [{ label: 'RMSNorm', value: 'rmsnorm' }, { label: 'LayerNorm', value: 'layernorm' }] }"
                    :value="formData[active].norm" @update="(value) => handleFieldUpdate('norm', value)"
                    style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="hybridModelEnable"
                  :rules="getFieldRules({ field: 'hybridModelEnable', label: 'hybrid_model_enable', component: 'Switch' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="hybrid_model_enable" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">hybrid_model_enable</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'hybridModelEnable', label: 'hybrid_model_enable', component: 'Switch' }"
                    :value="formData[active].hybridModelEnable"
                    @update="(value) => handleFieldUpdate('hybridModelEnable', value)" style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="hybridDenseBlocksNum"
                  :rules="getFieldRules({ field: 'hybridDenseBlocksNum', label: 'hybrid_dense_blocks_num', component: 'InputNumber' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="hybrid_dense_blocks_num" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">hybrid_dense_blocks_num</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'hybridDenseBlocksNum', label: 'hybrid_dense_blocks_num', component: 'InputNumber', componentProps: { controls: false, placeholder: '0' } }"
                    :value="formData[active].hybridDenseBlocksNum"
                    @update="(value) => handleFieldUpdate('hybridDenseBlocksNum', value)" style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="embeddingOutputShare"
                  :rules="getFieldRules({ field: 'embeddingOutputShare', label: 'embedding_output_share', component: 'Switch' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="embedding_output_share" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">embedding_output_share</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'embeddingOutputShare', label: 'embedding_output_share', component: 'Switch' }"
                    :value="formData[active].embeddingOutputShare"
                    @update="(value) => handleFieldUpdate('embeddingOutputShare', value)" style="width: 300px;" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item prop="embeddingSize"
                  :rules="getFieldRules({ field: 'embeddingSize', label: 'embedding_size', component: 'InputNumber' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="embedding_size" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">embedding_size</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'embeddingSize', label: 'embedding_size', component: 'InputNumber', componentProps: { controls: false, placeholder: '0' } }"
                    :value="formData[active].embeddingSize"
                    @update="(value) => handleFieldUpdate('embeddingSize', value)" style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="hybridMoeBlocksNum"
                  :rules="getFieldRules({ field: 'hybridMoeBlocksNum', label: 'hybrid_moe_blocks_num', component: 'InputNumber' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="hybrid_moe_blocks_num" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">hybrid_moe_blocks_num</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'hybridMoeBlocksNum', label: 'hybrid_moe_blocks_num', component: 'InputNumber', componentProps: { controls: false, placeholder: '0' } }"
                    :value="formData[active].hybridMoeBlocksNum"
                    @update="(value) => handleFieldUpdate('hybridMoeBlocksNum', value)" style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="mtpModuleNum"
                  :rules="getFieldRules({ field: 'mtpModuleNum', label: 'mtp_module_num', component: 'InputNumber' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="mtp_module_num" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">mtp_module_num</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'mtpModuleNum', label: 'mtp_module_num', component: 'InputNumber', componentProps: { controls: false, placeholder: '0' } }"
                    :value="formData[active].mtpModuleNum" @update="(value) => handleFieldUpdate('mtpModuleNum', value)"
                    style="width: 300px;" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </section>

      <section v-if="active === 1">
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
                <el-form-item v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 0)" :key="field.field"
                  :prop="field.field" :rules="getFieldRules(field)" :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer :field="field" :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px;" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 1)" :key="field.field"
                  :prop="field.field" :rules="getFieldRules(field)" :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer :field="field" :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px;" />
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
                <el-form-item v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 0)" :key="field.field"
                  :prop="field.field" :rules="getFieldRules(field)" :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer :field="field" :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px;" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 1)" :key="field.field"
                  :prop="field.field" :rules="getFieldRules(field)" :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer :field="field" :value="formData[active][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px;" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- MLA提示配置 -->
          <div class="custom-section">
            <el-alert v-if="formData[active].environment === 'staging'"
              title="Staging Extended Options are now visible!" type="success" :closable="false" show-icon />
            <el-alert v-else="formData[active].environment === 'moe'" title="(Staging options hidden)" type="warning"
              :closable="false" show-icon />
          </div>
          <!-- 高级配置切换 -->
          <div v-if="showToggle" class="toggle-section">
            <el-switch :model-value="showAdvancedConfig" @update:model-value="handleAdvancedConfigToggle"
              active-text="Advanced Config" />
          </div>
          <!-- High-Level Options (显示在toggle下方) -->
          <div v-if="showAdvancedConfig" class="form-section">
            <el-divider content-position="left" class="section-title">
              High-Level Options
              <span class="required">*</span>
            </el-divider>
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item prop="norm"
                  :rules="getFieldRules({ field: 'norm', label: 'norm', component: 'Select', required: true })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="norm" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">norm</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'norm', label: 'norm', component: 'Select', componentProps: { placeholder: '请选择' }, options: [{ label: 'RMSNorm', value: 'rmsnorm' }, { label: 'LayerNorm', value: 'layernorm' }] }"
                    :value="formData[active].norm" @update="(value) => handleFieldUpdate('norm', value)"
                    style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="hybridModelEnable"
                  :rules="getFieldRules({ field: 'hybridModelEnable', label: 'hybrid_model_enable', component: 'Switch' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="hybrid_model_enable" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">hybrid_model_enable</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'hybridModelEnable', label: 'hybrid_model_enable', component: 'Switch' }"
                    :value="formData[active].hybridModelEnable"
                    @update="(value) => handleFieldUpdate('hybridModelEnable', value)" style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="hybridDenseBlocksNum"
                  :rules="getFieldRules({ field: 'hybridDenseBlocksNum', label: 'hybrid_dense_blocks_num', component: 'InputNumber' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="hybrid_dense_blocks_num" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">hybrid_dense_blocks_num</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'hybridDenseBlocksNum', label: 'hybrid_dense_blocks_num', component: 'InputNumber', componentProps: { controls: false, placeholder: '0' } }"
                    :value="formData[active].hybridDenseBlocksNum"
                    @update="(value) => handleFieldUpdate('hybridDenseBlocksNum', value)" style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="embeddingOutputShare"
                  :rules="getFieldRules({ field: 'embeddingOutputShare', label: 'embedding_output_share', component: 'Switch' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="embedding_output_share" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">embedding_output_share</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'embeddingOutputShare', label: 'embedding_output_share', component: 'Switch' }"
                    :value="formData[active].embeddingOutputShare"
                    @update="(value) => handleFieldUpdate('embeddingOutputShare', value)" style="width: 300px;" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                <el-form-item prop="embeddingSize"
                  :rules="getFieldRules({ field: 'embeddingSize', label: 'embedding_size', component: 'InputNumber' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="embedding_size" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">embedding_size</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'embeddingSize', label: 'embedding_size', component: 'InputNumber', componentProps: { controls: false, placeholder: '0' } }"
                    :value="formData[active].embeddingSize"
                    @update="(value) => handleFieldUpdate('embeddingSize', value)" style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="hybridMoeBlocksNum"
                  :rules="getFieldRules({ field: 'hybridMoeBlocksNum', label: 'hybrid_moe_blocks_num', component: 'InputNumber' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="hybrid_moe_blocks_num" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">hybrid_moe_blocks_num</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'hybridMoeBlocksNum', label: 'hybrid_moe_blocks_num', component: 'InputNumber', componentProps: { controls: false, placeholder: '0' } }"
                    :value="formData[active].hybridMoeBlocksNum"
                    @update="(value) => handleFieldUpdate('hybridMoeBlocksNum', value)" style="width: 300px;" />
                </el-form-item>
                <el-form-item prop="mtpModuleNum"
                  :rules="getFieldRules({ field: 'mtpModuleNum', label: 'mtp_module_num', component: 'InputNumber' })"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" content="mtp_module_num" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0;" />
                      </el-tooltip>
                      <span class="label-text">mtp_module_num</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="{ field: 'mtpModuleNum', label: 'mtp_module_num', component: 'InputNumber', componentProps: { controls: false, placeholder: '0' } }"
                    :value="formData[active].mtpModuleNum" @update="(value) => handleFieldUpdate('mtpModuleNum', value)"
                    style="width: 300px;" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </section>

      <div v-if="active === 3" class="flex flex-col gap-4 min-h-40 pl-20 pt-20">
        <h2>Run Simulation with selected parameters?</h2>
        <div><el-tag size="large" effect="dark" style="width: 120px;">Task Name</el-tag> : <el-input
            placeholder="Enter job Name" v-model="taskName" style="width: 400px;" /></div>
        <p v-for="(step, idx) in ['modelSelection', 'handwareSelection', 'environment']">
          <el-tag size="large" effect="dark" style="width: 120px;">{{ step }}</el-tag> : <el-tag size="large"
            effect="light">{{
              formData[idx][step]
            }}</el-tag>
        </p>
      </div>
    </div>
    <footer>
      <div class="flex justify-center mt-4 space-x-4">
        <el-button @click="handlePrevious" :disabled="active === 0">{{
          t('common.prevLabel')
        }}</el-button>
        <!-- :disabled="!canProceed" -->
        <el-button type="primary" @click="handleNext" :loading="isSubmitting"> {{
          active === 3 ? t('common.ok') : t('common.nextLabel')
          }}</el-button>
        <el-button @click="handleCancelModelChange" type="info">
          取消模型选择
        </el-button>
      </div>
    </footer>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch, defineComponent, h } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ElSelect, ElInputNumber, ElSwitch, ElOption } from 'element-plus'
import { Icon } from '@/components/Icon'

const { t } = useI18n()

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

const active = ref(0)
const showAdvancedConfig = ref(false)
const isSubmitting = ref(false)
const validationErrors = ref<Record<string, string>>({})
const hasUnsavedChanges = ref(false)
const taskName = ref('')
const showToggle = ref(true)

const formData = reactive([
  {
    // Step 0: Model Configuration
    modelSelection: '',
    structureType: '',
    feedforward: 0,
    attnHeads: 0,
    attnSize: 0,
    hidden: '',
    attnType: '',
    numBlocks: 0,
    numQueryGroups: 0,
    qLoraRank: 0,
    qkRopeHeadDim: 0,
    qHeadDim: 0,
    kvLoraRank: 0,
    qkRopeHeadDim2: 0,
    vHeadDim: 0,
    norm: '',
    hybridModelEnable: false,
    hybridDenseBlocksNum: 0,
    embeddingOutputShare: false,
    embeddingSize: 0,
    hybridMoeBlocksNum: 0,
    mtpModuleNum: 0,
  },
  {
    // Step 1: Hardware Configuration
    gpuType: '',
    gpuCount: 1,
    memorySize: 32,
    cpuCores: 16,
    storageType: '',
    storageSize: 1000,
    batchSize: 32,
    maxSequenceLength: 2048,
    precision: '',
    optimizationLevel: '',
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

const allFormSections: FormSection[][] = [
  // Step 0: Model Selection and Configuration
  [
    {
      key: 'modelSelection',
      title: 'Model Selection',
      required: true,
      fields: [
        {
          field: 'modelSelection',
          label: 'Model Selection',
          component: 'Select',
          componentProps: { placeholder: 'Select' },
          options: [
            { label: 'llama_3_70b', value: 'llama_3_70b' },
            { label: 'llama_3_8b', value: 'llama_3_8b' },
            { label: 'gpt_4', value: 'gpt_4' }
          ]
        }
      ]
    },
    {
      key: 'baseOptions',
      title: 'Base Options',
      required: true,
      fields: [
        {
          field: 'structureType',
          label: 'Structure Type',
          component: 'Select',
          componentProps: { placeholder: '请选择' },
          options: [
            { label: 'llm-08', value: 'llm-08' },
            { label: 'llm-16', value: 'llm-16' },
            { label: 'llm-32', value: 'llm-32' }
          ]
        },
        {
          field: 'feedforward',
          label: 'feedforward',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'attnHeads',
          label: 'attn_heads',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'attnSize',
          label: 'attn_size',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'hidden',
          label: 'Hidden',
          component: 'Select',
          componentProps: { placeholder: '请选择' },
          options: [
            { label: 'Hidden Layer 1', value: 'hidden1' },
            { label: 'Hidden Layer 2', value: 'hidden2' }
          ]
        },
        {
          field: 'attnType',
          label: 'attn_type',
          component: 'Select',
          componentProps: { placeholder: '请选择' },
          options: [
            { label: 'MLA', value: 'mla' },
            { label: 'MOE', value: 'moe' }
          ]
        },
        {
          field: 'numBlocks',
          label: 'num_blocks',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'numQueryGroups',
          label: 'num_query_groups',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        }
      ]
    },
    {
      key: 'mlaExtended',
      title: 'MLA Extended Options',
      required: true,
      visible: () => formData[active.value].attnType === 'mla',
      fields: [
        {
          field: 'qLoraRank',
          label: 'q_lora_rank',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'qkRopeHeadDim',
          label: 'qk_rope_head_dim',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'qHeadDim',
          label: 'q_head_dim',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'kvLoraRank',
          label: 'kv_lora_rank',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'qkRopeHeadDim2',
          label: 'qk_rope_head_dim',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'vHeadDim',
          label: 'v_head_dim',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        }
      ]
    },
    {
      key: 'highLevel',
      title: 'High-Level Options',
      required: true,
      visible: () => showAdvancedConfig.value,
      fields: [
        {
          field: 'norm',
          label: 'norm',
          component: 'Select',
          componentProps: { placeholder: '请选择' },
          options: [
            { label: 'RMSNorm', value: 'rmsnorm' },
            { label: 'LayerNorm', value: 'layernorm' }
          ]
        },
        {
          field: 'hybridModelEnable',
          label: 'hybrid_model_enable',
          component: 'Switch'
        },
        {
          field: 'hybridDenseBlocksNum',
          label: 'hybrid_dense_blocks_num',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'embeddingOutputShare',
          label: 'embedding_output_share',
          component: 'Switch'
        },
        {
          field: 'embeddingSize',
          label: 'embedding_size',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'hybridMoeBlocksNum',
          label: 'hybrid_moe_blocks_num',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        },
        {
          field: 'mtpModuleNum',
          label: 'mtp_module_num',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '0' }
        }
      ]
    }
  ],
  // Step 1: Hardware Configuration
  [
    {
      key: 'handwareSelection',
      title: 'Handware Selection',
      required: true,
      fields: [
        {
          field: 'handwareSelection',
          label: 'Handware Selection',
          component: 'Select',
          componentProps: { placeholder: 'Select' },
          options: [
            { label: 'B20', value: 'B20' },
            { label: 'R20', value: 'R20' },
            { label: 'H20', value: 'H20' },
          ]
        }
      ]
    },
    {
      key: 'hardwareDetails',
      title: 'Hardware Details',
      required: true,
      fields: [
        {
          field: 'Type',
          label: 'GPU Type',
          component: 'Select',
          componentProps: { placeholder: 'Select GPU' },
          options: [
            { label: 'GPU', value: 'GPU' },
            { label: 'NPU', value: 'NPU' }
          ]
        },
        {
          field: 'processingMode',
          label: 'Processing Mode',
          component: 'Select',
          componentProps: { placeholder: 'Select' },
          options: [
            { label: 'roofline', value: 'roofline' },
            { label: 'no_overlap', value: 'no_overlap' }
          ]
        },
        {
          field: 'MatrixSize',
          label: 'Matrix(Float16 TFLOPS)',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '32' }
        },
        {
          field: 'VectorSize',
          label: 'Vector(Float16 TFLOPS)',
          component: 'InputNumber',
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
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '32' }
        },
        {
          field: 'maxSequenceLength',
          label: 'Max Sequence Length',
          component: 'InputNumber',
          componentProps: { controls: false, placeholder: '2048' }
        },
        {
          field: 'precision',
          label: 'Precision',
          component: 'Select',
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
          component: 'Select',
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
  if (active.value < allFormSections.length) {
    return allFormSections[active.value]
  }
  return []
})

// 过滤可见的sections (排除High-Level Options，因为它单独渲染)
const visibleSections = computed(() => {
  return currentStepSections.value.filter(section => {
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
const onGpuTypeChange = (gpuType: string) => {
  console.log('GPU type changed:', gpuType)
  // 根据GPU类型设置推荐配置
  switch (gpuType) {
    case 'a100':
      formData[active.value].memorySize = 80
      formData[active.value].cpuCores = 32
      break
    case 'h100':
      formData[active.value].memorySize = 80
      formData[active.value].cpuCores = 48
      break
    case 'v100':
      formData[active.value].memorySize = 32
      formData[active.value].cpuCores = 16
      break
  }
  emit('gpuTypeChange', gpuType)
}

// 表单验证规则
const validationRules = {
  0: ['modelSelection', 'structureType', 'attnType'], // Step 0 required fields
  1: [], // Step 1 required fields
  2: ['environment'] // Step 2 required fields
}

// 计算当前步骤是否可以继续
const canProceed = computed(() => {
  const requiredFields = validationRules[active.value] || []
  return requiredFields.every(field => {
    const value = formData[active.value][field]
    return value !== '' && value !== null && value !== undefined
  })
})

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
const onFieldChange = (field: string, value: any, oldValue: any) => {
  console.log(`Field changed: ${field}`, { value, oldValue })

  // 特殊字段变化处理
  if (field === 'modelSelection') {
    onModelSelectionChange(value)
  } else if (field === 'attnType') {
    onAttentionTypeChange(value)
  } else if (field === 'gpuType') {
    onGpuTypeChange(value)
  }

  // 清除该字段的验证错误
  if (validationErrors.value[field]) {
    delete validationErrors.value[field]
  }

  // 触发自定义事件
  emit('fieldChange', { field, value, oldValue })
}

// 区块切换事件
const onSectionToggle = (sectionKey: string, visible: boolean) => {
  console.log(`Section toggled: ${sectionKey}`, visible)
  emit('sectionToggle', { sectionKey, visible })
}

// 验证状态变化事件
const onValidationChange = (field: string, isValid: boolean, message?: string) => {
  if (isValid) {
    delete validationErrors.value[field]
  } else {
    validationErrors.value[field] = message || 'Validation failed'
  }
  emit('validationChange', { field, isValid, message })
}

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

// 模型选择变化处理
const onModelSelectionChange = (model: string) => {
  console.log('Model selection changed:', model)

  // 根据模型选择设置默认值
  switch (model) {
    case 'llama_3_70b':
      formData[active.value].attnHeads = 64
      formData[active.value].hidden = 'hidden1'
      break
    case 'llama_3_8b':
      formData[active.value].attnHeads = 32
      formData[active.value].hidden = 'hidden2'
      break
    case 'gpt_4':
      formData[active.value].attnHeads = 96
      formData[active.value].hidden = 'hidden1'
      break
  }

  ElMessage.success(`Model ${model} selected with default configurations`)
  emit('modelChange', model)
}

// 验证指定步骤
const validateStep = (step: number) => {
  const requiredFields = validationRules[step] || []
  const errors: string[] = []

  requiredFields.forEach(field => {
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
    await ElMessageBox.confirm(
      'This will reset all form data. Are you sure?',
      'Reset Form',
      {
        confirmButtonText: 'Yes, reset',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    // 重置表单数据
    Object.keys(formData).forEach(key => {
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
  await ElMessageBox.confirm(
    '确认取消模型创建吗?',
    '取消创建',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  ElMessage.success('取消创建模型')
  emit('cancel')
}

// 提交表单
const handleSubmit = async (taskName: string) => {
  isSubmitting.value = true
  try {
    // 模拟API调用
    console.log('Form submitted:', formData, 'Form value:', taskName)
    await new Promise(resolve => setTimeout(resolve, 2000))
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

const excuteFromData = () => {
  console.log("获取填写完成的表单");
}

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
          return h(ElSelect, {
            modelValue: value || '',
            'onUpdate:modelValue': handleUpdate,
            clearable: true,
            ...field.componentProps
          }, {
            default: () => field.options?.map(option =>
              h(ElOption, {
                key: option.value,
                label: option.label,
                value: option.value
              })
            )
          })

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

  console.log(newModelValue, 'newModelValue');

  // 特殊字段变化处理
  if (field === 'attnType') {
    onAttentionTypeChange(value)
  }
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
</style>
