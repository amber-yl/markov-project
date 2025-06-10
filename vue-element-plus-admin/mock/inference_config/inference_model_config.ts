export interface InferenceModelConfigs {
  id?: string
  /** 推理模型名称 */
  name: string;

  /** 基础配置 */
  base_options: BaseOptions;

  /** MLA扩展配置（可选，默认为null） */
  mla_extend_options?: MlaExtendOptions | null;

  /** MOE基础配置（可选，默认为null） */
  moe_base_options?: MoeBaseOptions | null;

  /** 模型高级配置（可选，默认为null） */
  advance_options?: AdvanceOptions | null;
}

export enum STRUCTUR_TYPE {
  dense = "dense",
  moe = "moe"
}

export enum ATTN_TYPE {
  GQA = "GQA",
  MHA = "MHA",
  MLA = "MLA"
}

export enum NORM_TYPE {
  RMSNorm = "RMSNorm",
  LayerNorm = "LayerNorm",
}


interface BaseOptions {
  /** 模型类型 */
  structure_type: STRUCTUR_TYPE;

  /** 隐藏层纬度（最小值1） */
  hidden: number; // 注意：原JSON中examples为[1]，但type是number，可能允许浮点数，需根据实际业务调整是否限制为整数

  /** 反馈层纬度（整数，最小值1） */
  feedforward: number; // 原JSON中type为integer，但TS中用number表示整数（需确认是否需严格整数，可改为`integer`类型别名）

  /** 注意力头数（整数，最小值1） */
  attn_heads: number;

  /** 注意力大小（整数，最小值1） */
  attn_size: number;

  /** 注意力类型 */
  attn_type: ATTN_TYPE;

  /** 模型层数（整数，最小值1） */
  num_blocks: number;

  /** 查询头组合数（可选，默认null） */
  num_query_groups?: number | null;
}

interface MlaExtendOptions {
  /** Q压缩纬度（可选，默认null） */
  q_lora_rank?: number | null;

  /** KV压缩纬度（可选，默认null） */
  kv_lora_rank?: number | null;

  /** QK RoPE头纬度（可选，默认null） */
  qk_rope_head_dim?: number | null;

  /** QK NoPE头纬度（可选，默认null） */
  qk_nope_head_dim?: number | null;

  /** Q头纬度（可选，默认null） */
  q_head_dim?: number | null;

  /** V头纬度（可选，默认null） */
  v_head_dim?: number | null;
}

interface MoeBaseOptions {
  /** 专家数（可选，默认null） */
  num_experts?: number | null;

  /** 路由专家隐藏纬度（可选，默认null） */
  route_expert_hidden?: number | null;

  /** 共享专家数（可选，默认null） */
  num_shared_experts?: number | null;

  /** 共享专家隐藏纬度（可选，默认null） */
  shared_expert_hidden?: number | null;

  /** Top Experts激活专家数（可选，默认null） */
  top_experts_activation?: number | null;

  /** MOE容量因子（可选，范围1-10，默认null） */
  moe_capacity_factor?: number | null;

  /** MOE块间隔（可选，默认null） */
  moe_block_interval?: number | null;
}

interface AdvanceOptions {
  /** 是否为异构模型（默认false） */
  hybrid_model_enable?: boolean | null;

  /** 稀疏层数（可选，默认null） */
  hybrid_moe_blocks_num?: number | null;

  /** 稠密层数（可选，默认null） */
  hybrid_dense_blocks_num?: number | null;

  /** MTP层数（可选，默认null） */
  mtp_module_num?: number | null;

  /** 是否共享Embedding输出（默认true） */
  embedding_output_share?: boolean | null;

  /** Norm类型（默认'RMSNorm'） */
  norm?: NORM_TYPE | null;

  /** 词表大小（可选，默认0，需大于1） */
  embedding_size?: number | null;
}