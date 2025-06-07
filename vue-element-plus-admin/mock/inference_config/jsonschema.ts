// 扩展的JSON Schema
export const enhancedInferenceModelConfigSchema = {
  type: 'object',
  title: 'InferenceModelConfigs',
  properties: {
    name: {
      description: '推理模型名称',
      title: 'Name',
      type: 'string',
      examples: ['deepseeks']
    },
    base_options: {
      description: '基础配置',
      title: 'Base Options',
      type: 'object',
      required: [
        'structure_type',
        'hidden',
        'feedforward',
        'attn_heads',
        'attn_size',
        'attn_type',
        'num_blocks'
      ],
      properties: {
        structure_type: {
          description: '模型类型',
          enum: ['dense', 'moe'],
          title: 'Structure Type',
          type: 'string'
        },
        hidden: {
          description: '隐藏层纬度',
          examples: [1],
          title: 'Hidden',
          type: 'number',
          minimum: 1
        },
        feedforward: {
          description: '反馈层纬度',
          examples: [1],
          title: 'Feedforward',
          type: 'integer',
          minimum: 1
        },
        attn_heads: {
          description: '注意力头数',
          examples: [1],
          title: 'Attn Heads',
          type: 'integer',
          minimum: 1
        },
        attn_size: {
          description: '注意力大小',
          examples: [1],
          title: 'Attn Size',
          type: 'integer',
          minimum: 1
        },
        attn_type: {
          description: '注意力类型',
          enum: ['GQA', 'MHA', 'MLA'],
          title: 'Attn Type',
          type: 'string'
        },
        num_blocks: {
          description: '模型层数',
          examples: [1],
          title: 'Num Blocks',
          type: 'integer',
          minimum: 1
        },
        num_query_groups: {
          anyOf: [
            {
              type: 'integer',
              minimum: 1
            },
            {
              type: 'null'
            }
          ],
          default: null,
          description: '查询头组合数',
          examples: [1],
          title: 'Num Query Groups'
        }
      }
    },
    mla_extend_options: {
      anyOf: [
        {
          type: 'object',
          properties: {
            q_lora_rank: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              description: 'Q压缩纬度',
              examples: [1],
              title: 'Q LoRA Rank',
              default: null
            },
            kv_lora_rank: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              description: 'KV压缩纬度',
              examples: [1],
              title: 'KV LoRA Rank',
              default: null
            },
            qk_rope_head_dim: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              description: 'QK RoPE头纬度',
              examples: [1],
              title: 'QK RoPE Head Dim',
              default: null
            },
            qk_nope_head_dim: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              description: 'QK NoPE头纬度',
              examples: [1],
              title: 'QK NoPE Head Dim',
              default: null
            },
            q_head_dim: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              description: 'Q头纬度',
              examples: [1],
              title: 'Q Head Dim',
              default: null
            },
            v_head_dim: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              description: 'V头纬度',
              examples: [1],
              title: 'V Head Dim',
              default: null
            }
          },
          title: 'MLA Extend Options',
          description: 'MLA扩展配置'
        },
        {
          type: 'null'
        }
      ],
      description: 'MLA扩展配置',
      default: null
    },
    moe_base_options: {
      anyOf: [
        {
          type: 'object',
          properties: {
            num_experts: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              default: null, // 默认为null，表示可选，用户可以选择不设置该值，或者设置为null
              description: '专家数',
              examples: [1],
              title: 'Num Experts'
            },
            route_expert_hidden: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              default: null, // 默认为null，表示可选，用户可以选择不设置该值，或者设置为null
              description: '路由专家隐藏纬度',
              examples: [1],
              title: 'Route Expert Hidden'
            },
            num_shared_experts: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              default: null, // 默认为null，表示可选，用户可以选择不设置该值，或者设置为null
              description: '共享专家数',
              examples: [1],
              title: 'Num Shared Experts'
            },
            shared_expert_hidden: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              default: null, // 默认为null，表示可选，用户可以选择不设置该值，或者设置为null
              description: '共享专家隐藏纬度',
              examples: [1],
              title: 'Shared Expert Hidden'
            },
            top_experts_activation: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              default: null, // 默认为null，表示可选，用户可以选择不设置该值，或者设置为null
              description: 'Top Experts激活专家数',
              examples: [1],
              title: 'Top Experts Activation'
            },
            moe_capacity_factor: {
              anyOf: [
                {
                  type: 'number',
                  minimum: 1,
                  maximum: 10
                },
                {
                  type: 'null'
                }
              ],
              default: null, // 默认为null，表示可选，用户可以选择不设置该值，或者设置为null
              description: 'MOE容量因子',
              examples: [5.5],
              title: 'MOE Capacity Factor'
            },
            moe_block_interval: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              default: null, // 默认为null，表示可选，用户可以选择不设置该值，或者设置为null
              description: 'MOE块间隔',
              examples: [0],
              title: 'MOE Block Interval'
            }
          },
          title: 'MOE Base Options',
          description: 'MOE基础配置'
        },
        {
          type: 'null'
        }
      ],
      description: 'MOE基础配置',
      default: null
    },
    advance_options: {
      anyOf: [
        {
          type: 'object',
          properties: {
            hybrid_model_enable: {
              anyOf: [
                {
                  type: 'boolean'
                },
                {
                  type: 'null'
                }
              ],
              default: false,
              title: 'Hybrid Model Enable',
              description: '是否为异构模型'
            },
            hybrid_moe_blocks_num: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 0
                },
                {
                  type: 'null'
                }
              ],
              default: null,
              title: 'Hybrid MoE Blocks Num',
              description: '稀疏层数',
              examples: [0]
            },
            hybrid_dense_blocks_num: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 0
                },
                {
                  type: 'null'
                }
              ],
              default: null,
              title: 'Hybrid Dense Blocks Num',
              description: '稠密层数',
              examples: [0]
            },
            mtp_module_num: {
              anyOf: [
                {
                  type: 'integer',
                  minimum: 1
                },
                {
                  type: 'null'
                }
              ],
              default: null,
              title: 'MTP Module Num',
              description: 'MTP层数',
              examples: [1]
            },
            embedding_output_share: {
              anyOf: [
                {
                  type: 'boolean'
                },
                {
                  type: 'null'
                }
              ],
              default: true,
              title: 'Embedding Output Share',
              description: '是否共享Embedding输出'
            },
            norm: {
              anyOf: [
                {
                  type: 'string',
                  enum: ['RMSNorm', 'LayerNorm'],
                  title: 'Norm',
                  description: 'Norm类型'
                },
                {
                  type: 'null'
                }
              ],
              description: 'Norm类型',
              default: 'RMSNorm',
              title: 'Norm',
              examples: ['RMSNorm']
            },
            embedding_size: {
              anyOf: [
                {
                  type: 'integer',
                  exclusiveMinimum: 1 // 大于1
                },
                {
                  type: 'null'
                }
              ],
              default: 0,
              title: 'Embedding Size',
              description: '词表大小'
            }
          }
        }
      ],
      description: '模型高级配置',
      default: null // 默认为null，表示可选，用户可以选择不设置该值，或者设置为null
    }
  },
  required: ['name', 'base_options']
}
