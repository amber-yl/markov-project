<template>
  <div class="mt-2">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="auto" :size="size">
      <!-- 基础信息区块：name和type独占一行 -->
      <div class="form-section">
        <el-divider content-position="left" class="section-title">
          <span>基础信息</span>
          <span class="required">
            <Icon :icon="'vi-ant-design:star-filled'" />
          </span>
        </el-divider>
        <el-row :gutter="20">
          <!-- name字段 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" v-if="schema.properties.name">
            <el-form-item prop="name" :label-position="'left'">
              <template #label>
                <div class="flex items-center">
                  <el-tooltip effect="dark" :content="schema.properties.name.description" placement="top">
                    <Icon :icon="'vi-ant-design:question-circle-filled'" style="margin-right: 8px; flex-shrink: 0" />
                  </el-tooltip>
                  <span class="label-text">{{ schema.properties.name.title }}</span>
                </div>
              </template>
              <el-input v-model="formData.name" :placeholder="schema.properties.name.description" clearable
                @input="(value) => { handleFieldUpdate('name', value); handleSearch(value); }">
                <template #prefix>
                  <Icon icon="vi-ep:search" />
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <!-- type字段 -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" v-if="schema.properties.type">
            <el-form-item prop="type" :label-position="'left'">
              <template #label>
                <div class="flex items-center">
                  <el-tooltip effect="dark" :content="schema.properties.type.description" placement="top">
                    <Icon :icon="'vi-ant-design:question-circle-filled'" style="margin-right: 8px; flex-shrink: 0" />
                  </el-tooltip>
                  <span class="label-text">{{ schema.properties.type.title }}</span>
                </div>
              </template>
              <FormFieldRenderer :field="convertPropertyToField('type', schema.properties.type)"
                :value="getFieldValue('type')" @update="(value) => handleFieldUpdate('type', value)"
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 运行时详细参数区块 -->
      <div class="form-section"
        v-if="schema.properties.runtime_details && schema.properties.runtime_details.properties">
        <el-divider content-position="left" class="section-title">
          <span>{{ schema.properties.runtime_details.title || '运行时参数' }}</span>
          <span v-if="schema.required?.includes('runtime_details')" class="required">
            <Icon :icon="'vi-ant-design:star-filled'" />
          </span>
        </el-divider>

        <!-- 渲染runtime_details的所有字段 -->
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12"
            v-for="(fieldKey, index) in Object.keys(schema.properties.runtime_details.properties)" :key="fieldKey">
            <el-form-item :prop="`runtime_details.${fieldKey}`" :label-position="'left'">
              <template #label>
                <div class="flex items-center">
                  <el-tooltip effect="dark"
                    :content="schema.properties.runtime_details.properties[fieldKey].description" placement="top">
                    <Icon :icon="'vi-ant-design:question-circle-filled'" style="margin-right: 8px; flex-shrink: 0" />
                  </el-tooltip>
                  <span class="label-text">{{ schema.properties.runtime_details.properties[fieldKey].title || fieldKey
                  }}</span>
                  <span v-if="schema.properties.runtime_details.required?.includes(fieldKey)" class="required-star">
                    *
                  </span>
                </div>
              </template>

              <!-- 根据字段类型渲染不同组件 -->
              <template v-if="schema.properties.runtime_details.properties[fieldKey].type === 'array'">
                <ArrayFieldRenderer :field-key="`runtime_details.${fieldKey}`"
                  :field-schema="schema.properties.runtime_details.properties[fieldKey]"
                  :value="getFieldValue(`runtime_details.${fieldKey}`)"
                  @update="(value) => handleFieldUpdate(`runtime_details.${fieldKey}`, value)" />
              </template>

              <template v-else>
                <FormFieldRenderer
                  :field="convertPropertyToField(fieldKey, schema.properties.runtime_details.properties[fieldKey], 'runtime_details')"
                  :value="getFieldValue(`runtime_details.${fieldKey}`)"
                  @update="(value) => handleFieldUpdate(`runtime_details.${fieldKey}`, value)" style="width: 100%" />
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ElForm } from 'element-plus'
import FormFieldRenderer from './FormFieldRenderer.vue'
import ArrayFieldRenderer from './ArrayFieldRenderer.vue'

const { t } = useI18n()
interface Props {
  // schema: any
  modelValue: any
  labelWidth?: string
  size?: 'default' | 'small' | 'large'
  flattenContainers?: string[] // 需要展平的容器名称
}
const props = withDefaults(defineProps<Props>(), {
  labelWidth: '120px',
  size: 'default',
  flattenContainers: () => ['float16'],
})

const schema = {
  type: 'object',
  title: 'InferenceRuntimeConfigCreate',
  properties: {
    name: {
      description: '推理运行时名称',
      title: 'Runtime Selection',
      type: 'string',
      examples: ['example_configs']
    },
    type: {
      description: '运行时类型',
      enum: ['pd-split', 'pd-fusion'],
      title: 'Type',
      type: 'string'
    },
    runtime_details: {
      description: '运行时参数',
      title: 'RuntimeDetails',
      type: 'object',
      required: [
        'model_list',
        'sequence_length_list',
        'num_procs_list',
        'wac_bytes_list',
        'flops_type_list',
        'time_limit_list',
        'sys_list'
      ],
      properties: {
        model_list: {
          description: '指定model config文件，可设置多个',
          title: 'Model List',
          type: 'array',
          items: {
            type: 'string'
          }
        },
        sequence_length_list: {
          description: '负载输入输出长度，可设置多个',
          title: 'Sequence Length List',
          type: 'array',
          items: {
            type: 'object',
            required: ['input_seq_length', 'output_seq_length'],
            title: 'Sequence Length',
            properties: {
              input_seq_length: {
                description: '输入长度',
                type: 'integer',
                title: 'Input Seq Length'
              },
              output_seq_length: {
                description: '输出长度',
                type: 'integer',
                title: 'Output Seq Length'
              }
            }
          }
        },
        num_procs_list: {
          description: '总卡数，PD分离时为P卡+D卡',
          title: 'Num Procs List',
          items: {
            type: 'integer'
          },
          type: 'array'
        },
        wac_bytes_list: {
          description: '依次为[weight_quant, activation_quant, cache_quant, communication_quant]',
          title: 'Wac Bytes List',
          type: 'array',
          items: {
            type: 'object',
            required: ['weight_quant', 'activation_quant', 'cache_quant', 'communication_quant'],
            title: 'Wac Bytes',
            properties: {
              weight_quant: {
                description: '权重精度',
                type: 'integer',
                title: 'Weight Quant'
              },
              activation_quant: {
                description: '激活精度',
                type: 'integer',
                title: 'Activation Quant'
              },
              cache_quant: {
                description: '缓存精度',
                type: 'integer',
                title: 'Cache Quant'
              },
              communication_quant: {
                description: '通信精度',
                type: 'integer',
                title: 'Communication Quant'
              }
            }
          }
        },
        flops_type_list: {
          description: '依次为[matrix_flops_type, attn_flops_type, vector_flops_type]',
          anyOf: [],
          title: 'Flops Type List',
          type: 'array',
          items: {
            type: 'object',
            required: ['matrix_flops_type', 'attn_flops_type', 'vector_flops_type'],
            title: 'Flops Type',
            properties: {
              matrix_flops_type: {
                description: '矩阵运算精度',
                type: 'integer',
                title: 'Matrix Flops Type'
              },
              attn_flops_type: {
                description: '注意力运算精度',
                type: 'integer',
                title: 'Attn Flops Type'
              },
              vector_flops_type: {
                description: '向量运算精度',
                type: 'integer',
                title: 'Vector Flops Type'
              }
            }
          }
        },
        time_limit_list: {
          description: 'TTFT和TPOT约束，单位ms，无约束时可配置[null, null]',
          title: 'Time Limit List',
          type: 'array',
          items: {
            type: 'object',
            required: ['TTFT', 'TPOT'],
            title: 'Time Limit',
            properties: {
              TTFT: {
                description: 'TTFT约束',
                title: 'Ttft',
                anyOf: [
                  {
                    type: 'integer'
                  },
                  {
                    type: 'null'
                  }
                ]
              },
              TPOT: {
                description: 'TPOT约束',
                title: 'Tpot',
                anyOf: [
                  {
                    type: 'integer'
                  },
                  {
                    type: 'null'
                  }
                ]
              }
            }
          }
        },
        sys_list: {
          description: '芯片配置，PD分离时需分别配置P芯片和D芯片，PD融合时仅配置一个芯片',
          title: 'Sys List',
          type: 'array',
          items: {
            type: 'string'
          }
        },
        pd_num_procs_list: {
          description: '当PD分离的时候，可指定P/D各自的数目；缺省None，自动寻优最佳PD配置',
          title: 'Pd Num Procs List',
          default: null,
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'object',
                required: ['p_num_procs', 'd_num_procs'],
                title: 'pd_num_procs_list',
                properties: {
                  p_num_procs: {
                    description: 'P卡数目',
                    type: 'integer',
                    title: 'P Num Procs'
                  },
                  d_num_procs: {
                    description: 'D卡数目',
                    type: 'integer',
                    title: 'D Num Procs'
                  }
                }
              }
            },
            {
              type: null
            }
          ]
        },
        p_parallel_config: {
          description:
            '指定P阶段的运行时策略[DP,PP,TP]，当前pp未实现，默认1；MoE模型为Attn部分运行时策略',
          title: 'P Parallel Config',
          default: null,
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'object',
                title: 'P Parallel Config',
                required: ['DP', 'PP', 'TP'],
                properties: {
                  DP: {
                    description: 'P阶段DP策略',
                    type: 'integer',
                    title: 'Dp'
                  },
                  PP: {
                    description: 'P阶段PP策略',
                    type: 'integer',
                    title: 'Pp'
                  },
                  TP: {
                    description: 'P阶段TP策略',
                    type: 'integer',
                    title: 'Tp'
                  }
                }
              }
            },
            {
              type: null
            }
          ]
        },
        d_parallel_config: {
          description:
            '指定D阶段的运行时策略[DP,PP,TP]，当前pp未实现，默认1；MoE模型为Attn部分运行时策略',
          title: 'D Parallel Config',
          default: null,
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'object',
                title: 'D Parallel Config',
                required: ['DP', 'PP', 'TP'],
                properties: {
                  DP: {
                    description: 'D阶段DP策略',
                    type: 'integer',
                    title: 'Dp'
                  },
                  PP: {
                    description: 'D阶段PP策略',
                    type: 'integer',
                    title: 'Pp'
                  },
                  TP: {
                    description: 'D阶段TP策略',
                    type: 'integer',
                    title: 'Tp'
                  }
                }
              }
            }
          ]
        },
        p_moe_parallel_config: {
          description: '仅MoE模型生效，指定P阶段的MoE运行时策略[EP, Moe_TP, Moe_DP]',
          title: 'P MoE Parallel Config',
          default: null,
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'object',
                title: 'P MoE Parallel Config',
                required: ['EP', 'Moe_TP', 'Moe_DP'],
                properties: {
                  EP: {
                    description: 'P阶段EP策略',
                    type: 'integer',
                    title: 'Ep'
                  },
                  Moe_TP: {
                    description: 'P阶段Moe_TP策略',
                    type: 'integer',
                    title: 'Moe Tp'
                  },
                  Moe_DP: {
                    description: 'P阶段Moe_DP策略',
                    type: 'integer',
                    title: 'Moe Dp'
                  }
                }
              }
            },
            {
              type: null
            }
          ]
        },
        d_moe_parallel_config: {
          description: '仅MoE模型生效，指定D阶段的MoE运行时策略[EP, Moe_TP, Moe_DP]',
          title: 'D MoE Parallel Config',
          default: null,
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'object',
                title: 'D MoE Parallel Config',
                required: ['EP', 'Moe_TP', 'Moe_DP'],
                properties: {
                  EP: {
                    description: 'D阶段EP策略',
                    type: 'integer',
                    title: 'Ep'
                  },
                  Moe_TP: {
                    description: 'D阶段Moe_TP策略',
                    type: 'integer',
                    title: 'Moe Tp'
                  },
                  Moe_DP: {
                    description: 'D阶段Moe_DP策略',
                    type: 'integer',
                    title: 'Moe Dp'
                  }
                }
              }
            }
          ]
        },
        p_micro_batch_size: {
          description: 'P阶段batch_size设置[global_bs, num_bs, bs],建议默认[1,1,1]节省寻优时间',
          title: 'P Micro Batch Size',
          default: null,
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'object',
                title: 'P Micro Batch Size',
                required: ['global_bs', 'num_bs', 'bs'],
                properties: {
                  global_bs: {
                    description: '全局batch_size',
                    type: 'integer',
                    title: 'Global Bs'
                  },
                  num_bs: {
                    description: 'num_bs',
                    type: 'integer',
                    title: 'Num Bs'
                  },
                  bs: {
                    description: 'bs',
                    type: 'integer',
                    title: 'Bs'
                  }
                }
              }
            },
            {
              type: null
            }
          ]
        },
        d_micro_batch_size: {
          description: 'D阶段batch_size设置[global_bs, num_bs, bs],建议默认[32,1,32]',
          title: 'D Micro Batch Size',
          default: null,
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'object',
                title: 'D Micro Batch Size',
                required: ['global_bs', 'num_bs', 'bs'],
                properties: {
                  global_bs: {
                    description: '全局batch_size',
                    type: 'integer',
                    title: 'Global Bs'
                  },
                  num_bs: {
                    description: 'num_bs',
                    type: 'integer',
                    title: 'Num Bs'
                  },
                  bs: {
                    description: 'bs',
                    type: 'integer',
                    title: 'Bs'
                  }
                }
              }
            },
            {
              type: null
            }
          ]
        },
        num_redundant_expert_config: {
          description: '仅MoE模型decode生效，D阶段基于卡数寻优不同冗余专家个数时的运行时策略',
          title: 'Num Redundant Expert Config',
          default: null,
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'integer'
              }
            },
            {
              type: 'integer'
            },
            {
              type: 'null'
            }
          ]
        },
        deploy_shared_expert_config: {
          anyOf: [
            {
              type: 'boolean'
            },
            {
              type: 'null'
            }
          ],
          default: null,
          description: '仅MOE模型decode生效，指定True时，考虑decode阶段每卡运行时1个共享专家',
          title: 'Deploy Shared Expert Config'
        },
        seq_size: {
          anyOf: [
            {
              minimum: 1,
              type: 'integer'
            },
            {
              type: 'null'
            }
          ],
          default: null,
          description: '序列长度',
          title: 'Seq Size'
        },
        output_seq: {
          anyOf: [
            {
              type: 'integer'
            },
            {
              type: 'null'
            }
          ],
          default: null,
          description: '输出序列长度',
          title: 'Output Seq'
        },
        absorb_enabled: {
          anyOf: [
            {
              type: 'boolean'
            },
            {
              type: 'null'
            }
          ],
          default: null,
          description: '吸收启动',
          title: 'Absorb Enabled'
        },
        num_shared_experts: {
          anyOf: [
            {
              minimum: 1,
              type: 'integer'
            },
            {
              type: 'null'
            }
          ],
          default: null,
          description: '共享专家数量',
          title: 'Num Shared Experts'
        },
        num_redundant_experts: {
          anyOf: [
            {
              type: 'integer'
            },
            {
              type: 'null'
            }
          ],
          default: null,
          description: '冗余专家数量',
          title: 'Num Redundant Experts'
        },
        use_flash_attn: {
          anyOf: [
            {
              type: 'boolean'
            },
            {
              type: 'null'
            }
          ],
          default: true,
          description: '是否使用冗余专家',
          title: 'Use Flash Attention'
        }
      }
    }
  },
  required: ['name', 'type', 'runtime_details']
}

const emit = defineEmits<{
  'update:modelValue': [value: any]
  validate: [valid: boolean, fields?: any]
  search: [keyword: string]
}>()

const formData = ref<any>({})
const formRef = ref<InstanceType<typeof ElForm>>()

// 根据类型获取默认值
const getDefaultValueByType = (type: string, property: any = {}) => {
  if (property.default !== undefined) {
    return property.default
  }

  // 处理 anyOf 类型
  if (property.anyOf && Array.isArray(property.anyOf)) {
    const nonNullType = property.anyOf.find((item: any) => item.type !== 'null')
    if (nonNullType) {
      return getDefaultValueByType(nonNullType.type, nonNullType)
    }
    return null
  }

  switch (type) {
    case 'string':
      return ''
    case 'number':
      return undefined
    case 'integer':
      return undefined
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return null
  }
}

// 初始化表单数据
const initFormData = () => {
  const data: any = {}

  if (schema && schema.properties) {
    Object.keys(schema.properties).forEach((key) => {
      const property = schema.properties[key]
      data[key] = getDefaultValueByType(property.type, property)

      // 处理嵌套对象
      if (property.type === 'object' && property.properties) {
        data[key] = {}
        Object.keys(property.properties).forEach((subKey) => {
          const subProperty = property.properties[subKey]
          data[key][subKey] = getDefaultValueByType(subProperty.type, subProperty)
        })
      }

      // 处理 anyOf 中的对象类型
      if (property.anyOf) {
        const objectType = property.anyOf.find((item: any) => item.type === 'object')
        if (objectType && objectType.properties) {
          data[key] = {}
          Object.keys(objectType.properties).forEach((subKey) => {
            const subProperty = objectType.properties[subKey]
            data[key][subKey] = getDefaultValueByType(subProperty.type, subProperty)
          })
        }
      }
    })
  }

  return data
}

// 获取字段值
const getFieldValue = (fieldPath: string) => {
  const keys = fieldPath.split('.')
  let value = formData.value

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return undefined
    }
  }

  return value
}

// 设置嵌套值
const setNestedValue = (obj: any, path: string, value: any) => {
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  current[keys[keys.length - 1]] = value
}

// 处理字段更新
const handleFieldUpdate = (fieldPath: string, value: any) => {
  setNestedValue(formData.value, fieldPath, value)
  emit('update:modelValue', formData.value)
}

// 获取字段组件属性
const getFieldComponentProps = (field: FormField) => {
  let props: any = { placeholder: field.description }

  // 特殊字段的禁用逻辑
  if (field.field === 'advance_options.hybrid_moe_blocks_num') {
    props.disabled = formData.value.base_options?.structure_type !== 'moe'
  } else if (field.field === 'base_options.num_query_groups') {
    props.disabled = formData.value.base_options?.attn_type !== 'GQA'
  }

  return props
}

// 监听外部数据变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && JSON.stringify(newValue) !== JSON.stringify(formData.value)) {
      formData.value = { ...newValue }
    }
  },
  { deep: true, immediate: true }
)

// 监听schema变化，重新初始化表单
watch(
  () => schema,
  () => {
    if (!props.modelValue || Object.keys(props.modelValue).length === 0) {
      formData.value = initFormData()
      emit('update:modelValue', formData.value)
    }
  },
  { immediate: true }
)

// 生成表单验证规则
const formRules = computed(() => {
  const rules: any = {}

  // 传统基于properties的schema验证规则生成
  const generateRules = (properties: any, prefix = '') => {
    if (!properties) return

    Object.keys(properties).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const property = properties[key]

      if (property.type === 'object' && property.properties) {
        generateRules(property.properties, fullKey)
      } else if (property.anyOf) {
        // 处理anyOf中的对象类型
        const objectType = property.anyOf.find((item: any) => item.type === 'object')
        if (objectType && objectType.properties) {
          generateRules(objectType.properties, fullKey)
        }
      } else {
        const fieldRules: any[] = []

        // 处理 anyOf 类型字段
        let actualProperty = property
        if (property.anyOf && Array.isArray(property.anyOf)) {
          // 从 anyOf 中找到非 null 的类型定义
          const nonNullType = property.anyOf.find(
            (item: any) => item.type !== null && item.type !== 'null'
          )
          if (nonNullType) {
            actualProperty = { ...property, ...nonNullType }
          }
        }

        const fieldTitle = actualProperty.title || actualProperty.label || key

        // 必填验证
        if (isFieldRequired(fullKey)) {
          fieldRules.push({
            required: true,
            message: `请输入${fieldTitle}`,
            trigger: ['string', 'textarea'].includes(actualProperty.type) ? 'blur' : 'change'
          })
        }
        // 类型验证
        if (actualProperty.type === 'number' || actualProperty.type === 'integer') {
          // 数字类型验证
          if (actualProperty.type === 'integer') {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  !Number.isInteger(Number(value))
                ) {
                  callback(new Error(`${fieldTitle}必须是整数`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          } else {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
                  callback(new Error(`${fieldTitle}必须是数字`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          // 最小值验证
          if (actualProperty.exclusiveMinimum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  Number(value) <= actualProperty.exclusiveMinimum
                ) {
                  callback(new Error(`${fieldTitle}必须大于${actualProperty.exclusiveMinimum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          if (actualProperty.minimum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  Number(value) < actualProperty.minimum
                ) {
                  callback(new Error(`${fieldTitle}必须大于等于${actualProperty.minimum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          // 最大值验证
          if (actualProperty.exclusiveMaximum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  Number(value) >= actualProperty.exclusiveMaximum
                ) {
                  callback(new Error(`${fieldTitle}必须小于${actualProperty.exclusiveMaximum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          if (actualProperty.maximum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  Number(value) > actualProperty.maximum
                ) {
                  callback(new Error(`${fieldTitle}必须小于等于${actualProperty.maximum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }
        }

        // 字符串长度验证
        if (actualProperty.type === 'string') {
          if (actualProperty.maxLength !== undefined) {
            fieldRules.push({
              max: actualProperty.maxLength,
              message: `${fieldTitle}长度不能超过${actualProperty.maxLength}个字符`,
              trigger: 'blur'
            })
          }

          if (actualProperty.minLength !== undefined) {
            fieldRules.push({
              min: actualProperty.minLength,
              message: `${fieldTitle}长度不能少于${actualProperty.minLength}个字符`,
              trigger: 'blur'
            })
          }

          // 正则表达式验证
          if (actualProperty.pattern) {
            fieldRules.push({
              pattern: new RegExp(actualProperty.pattern),
              message: `${fieldTitle}格式不正确`,
              trigger: 'blur'
            })
          }
        }

        // 数组验证
        if (actualProperty.type === 'array') {
          if (actualProperty.minItems !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (Array.isArray(value) && value.length < actualProperty.minItems) {
                  callback(new Error(`${fieldTitle}至少需要${actualProperty.minItems}项`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          if (actualProperty.maxItems !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (Array.isArray(value) && value.length > actualProperty.maxItems) {
                  callback(new Error(`${fieldTitle}最多只能有${actualProperty.maxItems}项`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }
        }

        // 枚举值验证
        if (actualProperty.enum && Array.isArray(actualProperty.enum)) {
          fieldRules.push({
            validator: (rule: any, value: any, callback: any) => {
              if (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                !actualProperty.enum.includes(value)
              ) {
                callback(
                  new Error(`${fieldTitle}的值必须是${actualProperty.enum.join('、')}中的一个`)
                )
              } else {
                callback()
              }
            },
            trigger: 'change'
          })
        }

        if (fieldRules.length > 0) {
          rules[fullKey] = fieldRules
        }
      }
    })
  }

  if (schema?.properties) {
    generateRules(schema.properties)
  }
  return rules
})

// 检查字段是否必填
const isFieldRequired = (fieldPath: string): boolean => {
  const pathParts = fieldPath.split('.')
  let currentSchema = schema

  if (!currentSchema) return false

  // 检查根级别是否必填
  if (currentSchema.required?.includes(pathParts[0])) {
    // 如果根级别字段必填，需要进一步检查是否是嵌套对象的必填字段
    if (pathParts.length === 1) {
      return true
    }
  }

  // 遍历路径检查嵌套对象的必填字段
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i]

    if (currentSchema.properties?.[part]) {
      currentSchema = currentSchema.properties[part]

      // 检查当前对象的required字段
      if (currentSchema.type === 'object' && currentSchema.required) {
        const nextPart = pathParts[i + 1]
        if (nextPart && currentSchema.required.includes(nextPart)) {
          return true
        }
      }
    }
  }

  return false
}

// 字段类型定义
interface FormField {
  field: string
  label: string
  component: 'Select' | 'InputNumber' | 'Switch' | 'Input'
  componentProps?: Record<string, any>
  options?: Array<{ label: string; value: string | number }>
  required?: boolean
  validator?: (value: any) => boolean | string
  description?: string
  min?: number
  max?: number
  default?: any
  dataType?: string // 原始数据类型，用于区分integer和number
}

// 将schema属性转换为表单字段
const convertPropertyToField = (key: string, property: any, prefix = ''): FormField => {
  const fullKey = prefix ? `${prefix}.${key}` : key

  // 处理 anyOf 类型
  let actualProperty = property
  let dataType = property.type

  if (property.anyOf && Array.isArray(property.anyOf)) {
    const nonNullType = property.anyOf.find((item: any) => item.type !== 'null')
    if (nonNullType) {
      actualProperty = { ...property, ...nonNullType }
      dataType = nonNullType.type // 使用非null类型作为dataType
    }
  }

  const field: FormField = {
    field: fullKey,
    label: actualProperty.title || key,
    component: 'Input',
    description: actualProperty.description || actualProperty.title || key,
    required: isFieldRequired(fullKey),
    dataType: dataType
  }

  // 根据类型和枚举值确定组件
  if (actualProperty.enum && Array.isArray(actualProperty.enum)) {
    field.component = 'Select'
    field.options = actualProperty.enum.map((value: any) => ({
      label: value,
      value: value
    }))
  } else if (actualProperty.type === 'boolean') {
    field.component = 'Switch'
  } else if (actualProperty.type === 'number' || actualProperty.type === 'integer') {
    field.component = 'InputNumber'
    if (actualProperty.exclusiveMinimum !== undefined)
      field.min = actualProperty.exclusiveMinimum + 1
    if (actualProperty.exclusiveMaximum !== undefined)
      field.max = actualProperty.exclusiveMaximum - 1
    if (actualProperty.minimum !== undefined) field.min = actualProperty.minimum
    if (actualProperty.maximum !== undefined) field.max = actualProperty.maximum
  } else {
    field.component = 'Input'
  }

  return field
}

// 表单验证方法
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    emit('validate', true)
    return true
  } catch (error) {
    emit('validate', false, error)
    return false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  formData.value = initFormData()
  emit('update:modelValue', formData.value)
}

const handleSearch = (keyword: string) => {
  emit('search', keyword)
}

// 暴露方法给父组件
defineExpose({
  validate,
  resetForm,
  formRef,
})
</script>

<style lang="less" scoped>
.form-section {
  margin-bottom: 30px;

  :deep(.el-divider) {
    :deep(.el-divider__text .is-left) {
      left: 20px !important;
      transform: translateY(0) !important;
    }
  }

  /* 水平居中 */
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

.required-star {
  color: var(--el-color-danger);
  margin-left: 4px;
}

.label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}
</style>
