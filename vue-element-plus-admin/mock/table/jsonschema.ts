// 扩展的JSON Schema，包含UI配置信息
export const enhancedSystemConfigSchema = {
  type: 'object',
  title: 'SystemConfigCreate',
  // UI配置
  // uiConfig: {
  //   form: {
  //     layout: {
  //       type: 'grid',
  //       columns: 2,
  //       gutter: 20
  //     },
  //     groups: [
  //       {
  //         title: '基本信息',
  //         fields: ['name', 'type', 'processing_mode']
  //       },
  //       {
  //         title: '算力配置',
  //         fields: ['matrix.float16.tflops', 'matrix.float16.calibration_coefficient', 'vector.float16.tflops', 'vector.float16.calibration_coefficient']
  //       },
  //       {
  //         title: '内存配置',
  //         fields: ['mem1.GiB', 'mem1.GBps', 'mem1.cube_calibration_coefficient', 'mem1.vector_calibration_coefficient', 'mem2.GiB', 'mem2.GBps']
  //       },
  //       {
  //         title: '网络配置',
  //         fields: ['networks']
  //       }
  //     ]
  //   },
  //   table: {
  //     columns: [
  //       {
  //         prop: 'name',
  //         label: '硬件名称',
  //         minWidth: 150,
  //         sortable: true,
  //         filterable: false,
  //         filterType: 'text'
  //       },
  //       {
  //         prop: 'type',
  //         label: '硬件类型',
  //         minWidth: 120,
  //         sortable: false,
  //         filterable: true,
  //         filterType: 'select',
  //         formatter: 'tag'
  //       },
  //       {
  //         prop: 'created_at',
  //         label: '创建时间',
  //         minWidth: 160,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'datetime'
  //       },
  //       {
  //         prop: 'updated_at',
  //         label: '更新时间',
  //         minWidth: 160,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'datetime',
  //         defaultHidden: true
  //       },
  //       {
  //         prop: 'processing_mode',
  //         label: '性能模式',
  //         minWidth: 120,
  //         sortable: false,
  //         filterable: true,
  //         filterType: 'select',
  //         formatter: 'tag'
  //       },
  //       {
  //         prop: 'matrix.float16.tflops',
  //         label: 'Cube-理论算力',
  //         minWidth: 150,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'number'
  //       },
  //       {
  //         prop: 'matrix.float16.calibration_coefficient',
  //         label: 'Cube-利用率',
  //         minWidth: 150,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'percentage',
  //         defaultHidden: true
  //       },
  //       {
  //         prop: 'vector.float16.tflops',
  //         label: 'Vector-理论算力',
  //         minWidth: 150,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'number',
  //         defaultHidden: true
  //       },
  //       {
  //         prop: 'vector.float16.calibration_coefficient',
  //         label: 'Vector-利用率',
  //         minWidth: 150,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'percentage',
  //         defaultHidden: true
  //       },
  //       {
  //         prop: 'mem1.GiB',
  //         label: '显存容量',
  //         minWidth: 120,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'memory',
  //         defaultHidden: true
  //       },
  //       {
  //         prop: 'mem1.GBps',
  //         label: '显存带宽',
  //         minWidth: 120,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'bandwidth',
  //         defaultHidden: true
  //       },
  //       {
  //         prop: 'mem2.GiB',
  //         label: 'CPU内存容量',
  //         minWidth: 120,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'memory',
  //         defaultHidden: true
  //       },
  //       {
  //         prop: 'mem2.GBps',
  //         label: 'CPU内存带宽',
  //         minWidth: 120,
  //         sortable: true,
  //         filterable: false,
  //         formatter: 'bandwidth',
  //         defaultHidden: true
  //       }
  //     ]
  //   }
  // },
  properties: {
    name: {
      description: '硬件名称',
      examples: ['910C'],
      title: 'Name',
      type: 'string',
    },
    type: {
      description: '硬件类型',
      enum: ['npu', 'gpu'],
      title: 'Type',
      type: 'string',
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
              type: 'number',
            },
            calibration_coefficient: {
              description: '利用率',
              examples: [0.7],
              exclusiveMinimum: 0,
              maximum: 1,
              title: 'Calibration Coefficient',
              type: 'number',
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
              type: 'number',
            },
            calibration_coefficient: {
              description: 'Vector 利用率',
              examples: [0.7],
              exclusiveMinimum: 0,
              maximum: 1,
              title: 'Calibration Coefficient',
              type: 'number',
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
          type: 'integer',
        },
        GBps: {
          description: '显存带宽(单位: GB/s)',
          examples: [1600],
          title: 'GBps',
          exclusiveMinimum: 0,
          type: 'number',
        },
        cube_calibration_coefficient: {
          description: 'cube算力利用率',
          examples: [0.6],
          title: 'Cube Calibration Coefficient',
          anyOf: [
            {
              type: 'number',
              exclusiveMinimum: 0,
              maximum: 1,
            },
            {
              type: null
            }
          ],
          default: null,
        },
        vector_calibration_coefficient: {
          description: 'vector算力利用率',
          examples: [0.3],
          title: 'Vector Calibration Coefficient',
          anyOf: [
            {
              type: 'number',
              exclusiveMinimum: 0,
              maximum: 1,
            },
            {
              type: null
            }
          ],
          default: null,
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
          type: 'integer',
        },
        GBps: {
          description: 'CPU内存带宽(单位: GB/s)',
          examples: [47.6],
          title: 'Gbps',
          exclusiveMinimum: 0,
          type: 'number',
        }
      }
    },

    processing_mode: {
      description: '性能模型',
      enum: ['roofline', 'no_overlap'],
      title: 'Processing Mode',
      type: 'string',
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
            type: 'number',
          },
          efficiency: {
            description: '利用率',
            examples: [0.8],
            title: 'Efficiency',
            exclusiveMinimum: 0,
            maximum: 1,
            type: 'number',
          },
          size: {
            description: '互联网节点数',
            examples: [16],
            title: 'Size',
            exclusiveMinimum: 0,
            type: 'integer',
          },
          latency: {
            description: '延迟(单位: ms)',
            examples: [5e-6],
            title: 'Latency',
            exclusiveMinimum: 0,
            type: 'number',
          }
        }
      },
      minItems: 2,
    }
  },
  required: ['name', 'type', 'matrix', 'vector', 'mem1', 'mem2', 'networks', 'processing_mode']
}
