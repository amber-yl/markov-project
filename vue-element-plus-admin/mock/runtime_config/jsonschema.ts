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
          type: 'array'
        },
        flops_type_list: {
          description: '依次为[matrix_flops_type, attn_flops_type, vector_flops_type]',
          anyOf: [],
          title: 'Flops Type List',
          type: 'array'
        },
        time_limit_list: {
          description: 'TTFT和TPOT约束，单位ms，无约束时可配置[null, null]',
          title: 'Time Limit List',
          type: 'array'
        },
        sys_list: {
          description: '芯片配置，PD分离时需分别配置P芯片和D芯片，PD融合时仅配置一个芯片',
          title: 'Sys List',
          type: 'array'
        },
        pd_num_procs_list: {
          description: '当PD分离的时候，可指定P/D各自的数目；缺省None，自动寻优最佳PD配置',
          title: 'Pd Num Procs List',
          type: 'array'
        },
        p_parallel_config: {
          description:
            '指定P阶段的运行时策略[DP,PP,TP]，当前pp未实现，默认1；MoE模型为Attn部分运行时策略',
          title: 'P Parallel Config',
          type: 'object'
        },
        d_parallel_config: {
          description:
            '指定D阶段的运行时策略[DP,PP,TP]，当前pp未实现，默认1；MoE模型为Attn部分运行时策略',
          title: 'D Parallel Config',
          type: 'object'
        },
        p_moe_parallel_config: {
          description: '仅MoE模型生效，指定P阶段的MoE运行时策略[EP, Moe_TP, Moe_DP]',
          title: 'P MoE Parallel Config',
          type: 'object'
        },
        d_moe_parallel_config: {
          description: '仅MoE模型生效，指定D阶段的MoE运行时策略[EP, Moe_TP, Moe_DP]',
          title: 'D MoE Parallel Config',
          type: 'object'
        },
        p_micro_batch_size: {
          description: 'P阶段batch_size设置[global_bs, num_bs, bs],建议默认[1,1,1]节省寻优时间',
          title: 'P Micro Batch Size',
          type: 'integer'
        },
        d_micro_batch_size: {
          description: 'D阶段batch_size设置[global_bs, num_bs, bs],建议默认[32,1,32]',
          title: 'D Micro Batch Size',
          type: 'integer'
        },
        num_redundant_expert_config: {
          description: '仅MoE模型decode生效，D阶段基于卡数寻优不同冗余专家个数时的运行时策略',
          title: 'Num Redundant Expert Config',
          type: 'integer'
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
