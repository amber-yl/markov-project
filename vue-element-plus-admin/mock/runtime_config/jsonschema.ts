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
              type: null
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
