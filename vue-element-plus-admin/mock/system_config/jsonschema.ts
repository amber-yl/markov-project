// 扩展的JSON Schema，包含UI配置信息
export const enhancedSystemConfigSchema = {
  type: 'object',
  title: 'SystemConfigCreate',
  properties: {
    name: {
      description: '硬件名称',
      examples: ['910C'],
      title: 'Name',
      type: 'string'
    },
    type: {
      description: '硬件类型',
      enum: ['npu', 'gpu'],
      title: 'Type',
      type: 'string'
    },
    matrix: {
      description: 'cube算力',
      title: 'Matrix',
      type: 'object',
      required: ['float16'],
      properties: {
        float16: {
          description: 'float16类型算力描述',
          title: 'Matrix_Float16',
          type: 'object',
          required: ['tflops', 'calibration_coefficient'],
          properties: {
            tflops: {
              description: '理论算力(单位: Tflops)',
              examples: [256],
              title: 'Tflops',
              exclusiveMinimum: 0,
              type: 'number'
            },
            calibration_coefficient: {
              description: '利用率',
              examples: [0.7],
              exclusiveMinimum: 0,
              maximum: 1,
              title: 'Calibration Coefficient',
              type: 'number'
            }
          }
        }
      }
    },
    vector: {
      description: 'Vector 算力',
      title: 'Vector',
      type: 'object',
      required: ['float16'],
      properties: {
        float16: {
          description: 'float16类型算力描述',
          title: 'Float161',
          type: 'object',
          required: ['tflops', 'calibration_coefficient'],
          properties: {
            tflops: {
              description: 'Vector 理论算力(单位: tflops)',
              examples: [44],
              title: 'Tflops',
              exclusiveMinimum: 0,
              type: 'number'
            },
            calibration_coefficient: {
              description: 'Vector 利用率',
              examples: [0.7],
              exclusiveMinimum: 0,
              maximum: 1,
              title: 'Calibration Coefficient',
              type: 'number'
            }
          }
        }
      }
    },
    mem1: {
      description: '显存',
      title: 'Mem1',
      type: 'object',
      required: ['GiB', 'GBps'],
      properties: {
        GiB: {
          description: '显存容量(单位: GB)',
          examples: [64],
          title: 'GiB',
          exclusiveMinimum: 0,
          type: 'integer'
        },
        GBps: {
          description: '显存带宽(单位: GB/s)',
          examples: [1600],
          title: 'GBps',
          exclusiveMinimum: 0,
          type: 'number'
        },
        cube_calibration_coefficient: {
          description: 'cube算力利用率',
          examples: [0.6],
          title: 'Cube Calibration Coefficient',
          anyOf: [
            {
              type: 'number',
              exclusiveMinimum: 0,
              maximum: 1
            },
            {
              type: null
            }
          ],
          default: null
        },
        vector_calibration_coefficient: {
          description: 'vector算力利用率',
          examples: [0.3],
          title: 'Vector Calibration Coefficient',
          anyOf: [
            {
              type: 'number',
              exclusiveMinimum: 0,
              maximum: 1
            },
            {
              type: null
            }
          ],
          default: null
        }
      }
    },
    mem2: {
      description: 'CPU内存',
      title: 'Mem2',
      type: 'object',
      required: ['GiB', 'GBps'],
      properties: {
        GiB: {
          description: 'CPU内存容量(单位: GB)',
          examples: [64],
          title: 'Gib',
          exclusiveMinimum: 0,
          type: 'integer'
        },
        GBps: {
          description: 'CPU内存带宽(单位: GB/s)',
          examples: [47.6],
          title: 'Gbps',
          exclusiveMinimum: 0,
          type: 'number'
        }
      }
    },

    processing_mode: {
      description: '性能模型',
      enum: ['roofline', 'no_overlap'],
      title: 'Processing Mode',
      type: 'string'
    },
    networks: {
      description: '网络配置',
      title: 'Networks',
      type: 'array',
      items: {
        title: 'Network',
        type: 'object',
        required: ['bandWidth', 'efficiency', 'size', 'latency'],
        properties: {
          bandWidth: {
            description: '带宽(单位: Gbps)',
            examples: [1600],
            title: 'BandWidth',
            exclusiveMinimum: 0,
            type: 'number'
          },
          efficiency: {
            description: '利用率',
            examples: [0.8],
            title: 'Efficiency',
            exclusiveMinimum: 0,
            maximum: 1,
            type: 'number'
          },
          size: {
            description: '互联网节点数',
            examples: [16],
            title: 'Size',
            exclusiveMinimum: 0,
            type: 'integer'
          },
          latency: {
            description: '延迟(单位: ms)',
            examples: [5e-6],
            title: 'Latency',
            exclusiveMinimum: 0,
            type: 'number'
          }
        }
      },
      minItems: 2
    }
  },
  required: ['name', 'type', 'matrix', 'vector', 'mem1', 'mem2', 'networks', 'processing_mode']
}
