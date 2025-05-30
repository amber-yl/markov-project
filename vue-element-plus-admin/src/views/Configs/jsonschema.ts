export const userSchema = {
  type: 'object',
  title: 'SystemConfigCreate',
  $defs: {
    Type: {
      description: '硬件类型',
      enum: ['npu', 'gpu'],
      title: 'Type',
      type: 'string'
    },
    Matrix: {
      description: 'cube算力',
      title: 'Matrix',
      type: 'object',
      required: ['float16'],
      properties: {
        float16: {
          $ref: '#/$defs/Float16'
        }
      }
    },
    Matrix_Float16: {
      description: 'float16类型算力描述',
      title: 'Matrix_Float16',
      type: 'object',
      required: ['tflops', 'calibration_coefficient'],
      properties: {
        tflops: {
          description: 'Matrix_tflops',
          examples: [256],
          title: 'Tflops',
          exclusiveMinimum: 0,
          type: 'number'
        },
        calibration_coefficient: {
          description: '利用率',
          examples: [0.7],
          title: 'Tflops',
          exclusiveMinimum: 0,
          maximum: 1,
          title: 'Matrix Calibration Coefficient',
          type: 'number'
        }
      }
    },
    Vector_Float16: {
      description: 'float16类型算力描述',
      title: 'Vector_Float16',
      type: 'object',
      required: ['tflops', 'calibration_coefficient'],
      properties: {
        tflops: {
          description: 'Vector 理论算力(单位: tflops)',
          examples: [44],
          title: 'Vector_Tflops',
          exclusiveMinimum: 0,
          type: 'number'
        },
        calibration_coefficient: {
          description: 'Vector 利用率',
          examples: [0.7],
          exclusiveMinimum: 0,
          maximum: 1,
          title: 'Vector Calibration Coefficient',
          type: 'number'
        }
      }
    },
    Vector: {
      description: 'Vector 算力',
      title: 'Vector',
      type: 'object',
      required: ['float16'],
      properties: {
        float16: {
          $ref: '#/$defs/Vector_Float16'
        }
      }
    },
    Mem1: {
      description: '显存',
      title: 'Mem1',
      type: 'object',
      required: ['GiB', 'GBps'],
      properties: {
        GiB: {
          description: '显存容量(单位: GB)',
          examples: [64],
          title: 'Gib',
          exclusiveMinimum: 0,
          type: 'number'
        },
        GBps: {
          description: '显存带宽(单位: GB/s)',
          examples: [1600],
          title: 'Gbps',
          exclusiveMinimum: 0,
          type: 'number'
        },
        cube_calibration_coefficient: {
          description: 'cube算力利用率',
          examples: [0.6],
          title: 'Cube Calibration Coefficient',
          default: 0.6,
          anyOf: [
            {
              exclusiveMinimum: 0,
              maximum: 1,
              type: 'number'
            },
            {
              type: 'null'
            }
          ]
        },
        vector_calibration_coefficient: {
          description: 'cube算力利用率',
          examples: [0.3],
          title: 'Vector Calibration Coefficient',
          default: 0.3,
          anyOf: [
            {
              exclusiveMinimum: 0,
              maximum: 1,
              type: 'number'
            },
            {
              type: 'null'
            }
          ]
        }
      }
    },
    Mem2: {
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
          type: 'number'
        },
        GBps: {
          description: 'CPU内存带宽(单位: GB/s)',
          examples: [1600],
          title: 'Gbps',
          exclusiveMinimum: 0,
          type: 'number'
        }
      }
    },
    Network: {
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
          type: 'number'
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
    ProcessingMode: {
      description: '性能模型',
      enum: ['roofline', 'no_overlap'],
      title: 'Processing Mode',
      type: 'string'
    }
  },
  properties: {
    name: {
      description: '硬件名称',
      examples: ['910C'],
      title: 'Name',
      type: 'string'
    },
    type: {
      $ref: '#/$defs/Type',
      examples: ['npu']
    },
    matrix: {
      $ref: '#/$defs/Matrix'
    },
    vector: {
      $ref: '#/$defs/Vector'
    },
    mem1: {
      $ref: '#/$defs/Mem1'
    },
    mem2: {
      $ref: '#/$defs/Mem2'
    },
    networks: {
      description: '网络配置',
      title: 'Networks',
      type: 'array',
      items: {
        $ref: '#/$defs/Network'
      },
      minItems: 1
    },
    processing_mode: {
      $ref: '#/$defs/ProcessingMode',
      examples: ['roofline']
    }
  },
  required: ['name', 'type', 'matrix', 'vector', 'mem1', 'mem2', 'networks', 'processing_mode']
}