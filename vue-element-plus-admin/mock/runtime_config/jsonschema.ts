// 扩展的JSON Schema
export const enhancedInferenceModelConfigSchema = {
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
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'integer'
              }
            },
            {
              type: 'null'
            }
          ]
        }
      }
    }
  },
  required: ['name', 'type', 'runtime_details']
}
