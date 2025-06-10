export enum Type {
  pdSplit = 'pd-split',
  pdFusion = 'pd-fusion'
}

export interface InferenceRuntimeConfigCreate {
  id?: string;
  /** 推理运行时名称 */
  name: string;

  /** 运行时类型 */
  type: Type;

  /** 运行时参数 */
  runtime_details: RuntimeDetails;
}

export interface RuntimeDetails {
  /** 指定 model config 文件，可设置多个 */
  model_list: string[];

  /** 负载输入输出长度，可设置多个 */
  sequence_length_list: SequenceLength[];

  /** 总卡数，PD分离时为P卡+D卡 */
  num_procs_list: number[];

  /** 依次为[weight_quant, activation_quant, cache_quant, communication_quant] */
  wac_bytes_list: WacBytes[];

  /** 依次为[matrix_flops_type, attn_flops_type, vector_flops_type] */
  flops_type_list: FlopsType[];

  /** TTFT和TPOT约束，单位ms，无约束时可配置[null, null] */
  time_limit_list: TimeLimit[];

  /** 芯片配置，PD分离时需分别配置P芯片和D芯片，PD融合时仅配置一个芯片 */
  sys_list: string[];

  /** 当PD分离的时候，可指定P/D各自的数目；缺省None，自动寻优最佳PD配置 */
  pd_num_procs_list?: (PdNumProcs | null)[] | null;

  /** 指定P阶段的运行时策略[DP,PP,TP]，当前pp未实现，默认1；MoE模型为Attn部分运行时策略 */
  p_parallel_config?: (PParallelConfig | null)[] | null;

  /** 指定D阶段的运行时策略[DP,PP,TP]，当前pp未实现，默认1；MoE模型为Attn部分运行时策略 */
  d_parallel_config?: DParallelConfig[] | null; // 注意：原结构中d_parallel_config的anyOf包含null，但required中无，故用可选

  /** 仅MoE模型生效，指定P阶段的MoE运行时策略[EP, Moe_TP, Moe_DP] */
  p_moe_parallel_config?: (PMoeParallelConfig | null)[] | null;

  /** 仅MoE模型生效，指定D阶段的MoE运行时策略[EP, Moe_TP, Moe_DP] */
  d_moe_parallel_config?: DMoEParallelConfig[] | null; // 注意：原结构中d_moe_parallel_config的anyOf包含null，但required中无，故用可选

  /** P阶段batch_size设置[global_bs, num_bs, bs],建议默认[1,1,1]节省寻优时间 */
  p_micro_batch_size?: (PMicroBatchSize | null)[] | null;

  /** D阶段batch_size设置[global_bs, num_bs, bs],建议默认[32,1,32] */
  d_micro_batch_size?: (DMicroBatchSize | null)[] | null;

  /** 仅MoE模型decode生效，D阶段基于卡数寻优不同冗余专家个数时的运行时策略 */
  num_redundant_expert_config?: number[] | number | null;

  /** 仅MOE模型decode生效，指定True时，考虑decode阶段每卡运行时1个共享专家 */
  deploy_shared_expert_config?: boolean | null;

  /** 序列长度 */
  seq_size?: number | null;

  /** 输出序列长度 */
  output_seq?: number | null;

  /** 吸收启动 */
  absorb_enabled?: boolean | null;

  /** 共享专家数量 */
  num_shared_experts?: number | null;

  /** 冗余专家数量 */
  num_redundant_experts?: number | null;

  /** 是否使用冗余专家（原注释可能有误，应为是否使用Flash Attention） */
  use_flash_attn?: boolean | null;
}

interface SequenceLength {
  /** 输入长度 */
  input_seq_length: number;
  /** 输出长度 */
  output_seq_length: number;
}

interface WacBytes {
  /** 权重精度 */
  weight_quant: number;
  /** 激活精度 */
  activation_quant: number;
  /** 缓存精度 */
  cache_quant: number;
  /** 通信精度 */
  communication_quant: number;
}

interface FlopsType {
  /** 矩阵运算精度 */
  matrix_flops_type: number;
  /** 注意力运算精度 */
  attn_flops_type: number;
  /** 向量运算精度 */
  vector_flops_type: number;
}

interface TimeLimit {
  /** TTFT约束 */
  TTFT: number | null;
  /** TPOT约束 */
  TPOT: number | null;
}

interface PdNumProcs {
  /** P卡数目 */
  p_num_procs: number;
  /** D卡数目 */
  d_num_procs: number;
}

interface PParallelConfig {
  /** P阶段DP策略 */
  DP: number;
  /** P阶段PP策略 */
  PP: number;
  /** P阶段TP策略 */
  TP: number;
}

interface DParallelConfig {
  /** D阶段DP策略 */
  DP: number;
  /** D阶段PP策略 */
  PP: number;
  /** D阶段TP策略 */
  TP: number;
}

interface PMoeParallelConfig {
  /** P阶段EP策略 */
  EP: number;
  /** P阶段Moe_TP策略 */
  Moe_TP: number;
  /** P阶段Moe_DP策略 */
  Moe_DP: number;
}

interface DMoEParallelConfig {
  /** D阶段EP策略 */
  EP: number;
  /** D阶段Moe_TP策略 */
  Moe_TP: number;
  /** D阶段Moe_DP策略 */
  Moe_DP: number;
}

interface PMicroBatchSize {
  /** 全局batch_size */
  global_bs: number;
  /** num_bs */
  num_bs: number;
  /** bs */
  bs: number;
}

interface DMicroBatchSize {
  /** 全局batch_size */
  global_bs: number;
  /** num_bs */
  num_bs: number;
  /** bs */
  bs: number;
}