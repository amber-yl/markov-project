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
      title: '硬件名称',
      type: 'string',
      // uiType: 'input',
      uiProps: {
        placeholder: '请输入硬件名称',
        maxLength: 50
      }
    },
    type: {
      description: '硬件类型',
      enum: ['npu', 'gpu'],
      title: 'Type',
      type: 'string',
      // uiType: 'radio',
      uiProps: {
        options: [
          { label: 'NPU', value: 'npu' },
          { label: 'GPU', value: 'gpu' }
        ]
      }
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
              description: 'Matrix_tflops',
              examples: [256],
              title: 'Cube算力(TFLOPS)',
              exclusiveMinimum: 0,
              type: 'number',
              // uiType: 'number',
              uiProps: {
                min: 0,
                step: 1,
                placeholder: '请输入Cube算力'
              }
            },
            calibration_coefficient: {
              description: '利用率',
              examples: [0.7],
              exclusiveMinimum: 0,
              maximum: 1,
              title: 'Cube利用率',
              type: 'number',
              // uiType: 'number',
              uiProps: {
                min: 0,
                max: 1,
                step: 0.01,
                placeholder: '请输入利用率(0-1)'
              }
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
          title: 'Vector_Float16',
          type: 'object',
          required: ['tflops', 'calibration_coefficient'],
          properties: {
            tflops: {
              description: 'Vector 理论算力(单位: tflops)',
              examples: [44],
              title: 'Vector算力(TFLOPS)',
              exclusiveMinimum: 0,
              type: 'number',
              // uiType: 'number',
              uiProps: {
                min: 0,
                step: 1,
                placeholder: '请输入Vector算力'
              }
            },
            calibration_coefficient: {
              description: 'Vector 利用率',
              examples: [0.7],
              exclusiveMinimum: 0,
              maximum: 1,
              title: 'Vector利用率',
              type: 'number',
              // uiType: 'number',
              uiProps: {
                min: 0,
                max: 1,
                step: 0.01,
                placeholder: '请输入利用率(0-1)'
              }
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
          title: '显存容量(GB)',
          exclusiveMinimum: 0,
          type: 'number',
          // uiType: 'number',
          uiProps: {
            min: 0,
            step: 1,
            placeholder: '请输入显存容量'
          }
        },
        GBps: {
          description: '显存带宽(单位: GB/s)',
          examples: [1600],
          title: '显存带宽(GB/s)',
          exclusiveMinimum: 0,
          type: 'number',
          // uiType: 'number',
          uiProps: {
            min: 0,
            step: 1,
            placeholder: '请输入显存带宽'
          }
        },
        cube_calibration_coefficient: {
          description: 'cube算力利用率',
          examples: [0.6],
          title: 'Cube算力利用率',
          type: 'number',
          exclusiveMinimum: 0,
          maximum: 1,
          // uiType: 'number',
          uiProps: {
            min: 0,
            max: 1,
            step: 0.01,
            placeholder: '请输入Cube算力利用率'
          }
        },
        vector_calibration_coefficient: {
          description: 'vector算力利用率',
          examples: [0.3],
          title: 'Vector算力利用率',
          type: 'number',
          exclusiveMinimum: 0,
          maximum: 1,
          // uiType: 'number',
          uiProps: {
            min: 0,
            max: 1,
            step: 0.01,
            placeholder: '请输入Vector算力利用率'
          }
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
          title: 'CPU内存容量(GB)',
          exclusiveMinimum: 0,
          type: 'number',
          // uiType: 'number',
          uiProps: {
            min: 0,
            step: 1,
            placeholder: '请输入CPU内存容量'
          }
        },
        GBps: {
          description: 'CPU内存带宽(单位: GB/s)',
          examples: [1600],
          title: 'CPU内存带宽(GB/s)',
          exclusiveMinimum: 0,
          type: 'number',
          // uiType: 'number',
          uiProps: {
            min: 0,
            step: 1,
            placeholder: '请输入CPU内存带宽'
          }
        }
      }
    },
    networks: {
      description: '网络配置',
      title: '网络配置',
      type: 'array',
      items: {
        title: 'Network',
        type: 'object',
        required: ['bandWidth', 'efficiency', 'size', 'latency'],
        properties: {
          bandWidth: {
            description: '带宽(单位: Gbps)',
            examples: [1600],
            title: '带宽(Gbps)',
            exclusiveMinimum: 0,
            type: 'number',
            // uiType: 'number',
            uiProps: {
              min: 0,
              step: 1,
              placeholder: '请输入带宽'
            }
          },
          efficiency: {
            description: '利用率',
            examples: [0.8],
            title: '网络利用率',
            exclusiveMinimum: 0,
            maximum: 1,
            type: 'number',
            // uiType: 'number',
            uiProps: {
              min: 0,
              max: 1,
              step: 0.01,
              placeholder: '请输入网络利用率'
            }
          },
          size: {
            description: '互联网节点数',
            examples: [16],
            title: '节点数',
            exclusiveMinimum: 0,
            type: 'number',
            // uiType: 'number',
            uiProps: {
              min: 0,
              step: 1,
              placeholder: '请输入节点数'
            }
          },
          latency: {
            description: '延迟(单位: ms)',
            examples: [5e-6],
            title: '延迟(ms)',
            exclusiveMinimum: 0,
            type: 'number',
            // uiType: 'number',
            uiProps: {
              min: 0,
              step: 0.000001,
              precision: 6,
              placeholder: '请输入延迟'
            }
          }
        }
      },
      minItems: 1,
      // uiType: 'array',
      uiProps: {
        addButtonText: '添加网络配置',
        removeButtonText: '删除'
      }
    },
    processing_mode: {
      description: '性能模型',
      enum: ['roofline', 'no_overlap'],
      title: 'Processing Mode',
      type: 'string',
      // uiType: 'radio',
      uiProps: {
        options: [
          { label: 'Roofline模型', value: 'roofline' },
          { label: 'No Overlap模型', value: 'no_overlap' }
        ]
      }
    }
  },
  required: ['name', 'type', 'matrix', 'vector', 'mem1', 'mem2', 'networks', 'processing_mode']
}

// 保持原有的schema以兼容现有代码
// export const userSchema = {
//   type: 'object',
//   title: 'SystemConfigCreate',
//   $defs: {
//     Type: {
//       description: '硬件类型',
//       enum: ['npu', 'gpu'],
//       title: 'Type',
//       type: 'string'
//     },
//     Matrix: {
//       description: 'cube算力',
//       title: 'Matrix',
//       type: 'object',
//       required: ['float16'],
//       properties: {
//         float16: {
//           $ref: '#/$defs/Float16'
//         }
//       }
//     },
//     Matrix_Float16: {
//       description: 'float16类型算力描述',
//       title: 'Matrix_Float16',
//       type: 'object',
//       required: ['tflops', 'calibration_coefficient'],
//       properties: {
//         tflops: {
//           description: 'Matrix_tflops',
//           examples: [256],
//           title: 'Tflops',
//           exclusiveMinimum: 0,
//           type: 'number'
//         },
//         calibration_coefficient: {
//           description: '利用率',
//           examples: [0.7],
//           exclusiveMinimum: 0,
//           maximum: 1,
//           title: 'Matrix Calibration Coefficient',
//           type: 'number'
//         }
//       }
//     },
//     Vector_Float16: {
//       description: 'float16类型算力描述',
//       title: 'Vector_Float16',
//       type: 'object',
//       required: ['tflops', 'calibration_coefficient'],
//       properties: {
//         tflops: {
//           description: 'Vector 理论算力(单位: tflops)',
//           examples: [44],
//           title: 'Vector_Tflops',
//           exclusiveMinimum: 0,
//           type: 'number'
//         },
//         calibration_coefficient: {
//           description: 'Vector 利用率',
//           examples: [0.7],
//           exclusiveMinimum: 0,
//           maximum: 1,
//           title: 'Vector Calibration Coefficient',
//           type: 'number'
//         }
//       }
//     },
//     Vector: {
//       description: 'Vector 算力',
//       title: 'Vector',
//       type: 'object',
//       required: ['float16'],
//       properties: {
//         float16: {
//           $ref: '#/$defs/Vector_Float16'
//         }
//       }
//     },
//     Mem1: {
//       description: '显存',
//       title: 'Mem1',
//       type: 'object',
//       required: ['GiB', 'GBps'],
//       properties: {
//         GiB: {
//           description: '显存容量(单位: GB)',
//           examples: [64],
//           title: 'Gib',
//           exclusiveMinimum: 0,
//           type: 'number'
//         },
//         GBps: {
//           description: '显存带宽(单位: GB/s)',
//           examples: [1600],
//           title: 'Gbps',
//           exclusiveMinimum: 0,
//           type: 'number'
//         },
//         cube_calibration_coefficient: {
//           description: 'cube算力利用率',
//           examples: [0.6],
//           title: 'Cube Calibration Coefficient',
//           default: 0.6,
//           anyOf: [
//             {
//               exclusiveMinimum: 0,
//               maximum: 1,
//               type: 'number'
//             },
//             {
//               type: 'null'
//             }
//           ]
//         },
//         vector_calibration_coefficient: {
//           description: 'cube算力利用率',
//           examples: [0.3],
//           title: 'Vector Calibration Coefficient',
//           default: 0.3,
//           anyOf: [
//             {
//               exclusiveMinimum: 0,
//               maximum: 1,
//               type: 'number'
//             },
//             {
//               type: 'null'
//             }
//           ]
//         }
//       }
//     },
//     Mem2: {
//       description: 'CPU内存',
//       title: 'Mem2',
//       type: 'object',
//       required: ['GiB', 'GBps'],
//       properties: {
//         GiB: {
//           description: 'CPU内存容量(单位: GB)',
//           examples: [64],
//           title: 'Gib',
//           exclusiveMinimum: 0,
//           type: 'number'
//         },
//         GBps: {
//           description: 'CPU内存带宽(单位: GB/s)',
//           examples: [1600],
//           title: 'Gbps',
//           exclusiveMinimum: 0,
//           type: 'number'
//         }
//       }
//     },
//     Network: {
//       title: 'Network',
//       type: 'object',
//       required: ['bandWidth', 'efficiency', 'size', 'latency'],
//       properties: {
//         bandWidth: {
//           description: '带宽(单位: Gbps)',
//           examples: [1600],
//           title: 'BandWidth',
//           exclusiveMinimum: 0,
//           type: 'number'
//         },
//         efficiency: {
//           description: '利用率',
//           examples: [0.8],
//           title: 'Efficiency',
//           exclusiveMinimum: 0,
//           maximum: 1,
//           type: 'number'
//         },
//         size: {
//           description: '互联网节点数',
//           examples: [16],
//           title: 'Size',
//           exclusiveMinimum: 0,
//           type: 'number'
//         },
//         latency: {
//           description: '延迟(单位: ms)',
//           examples: [5e-6],
//           title: 'Latency',
//           exclusiveMinimum: 0,
//           type: 'number'
//         }
//       }
//     },
//     ProcessingMode: {
//       description: '性能模型',
//       enum: ['roofline', 'no_overlap'],
//       title: 'Processing Mode',
//       type: 'string'
//     }
//   },
//   properties: {
//     name: {
//       description: '硬件名称',
//       examples: ['910C'],
//       title: 'Name',
//       type: 'string'
//     },
//     type: {
//       $ref: '#/$defs/Type',
//       examples: ['npu']
//     },
//     matrix: {
//       $ref: '#/$defs/Matrix'
//     },
//     vector: {
//       $ref: '#/$defs/Vector'
//     },
//     mem1: {
//       $ref: '#/$defs/Mem1'
//     },
//     mem2: {
//       $ref: '#/$defs/Mem2'
//     },
//     networks: {
//       description: '网络配置',
//       title: 'Networks',
//       type: 'array',
//       items: [
//         {
//           title: 'Network',
//           type: 'object',
//           required: ['bandWidth', 'efficiency', 'size', 'latency'],
//           properties: {
//             bandWidth: {
//               description: '带宽(单位: Gbps)',
//               examples: [1600],
//               title: 'BandWidth',
//               exclusiveMinimum: 0,
//               type: 'number'
//             },
//             efficiency: {
//               description: '利用率',
//               examples: [0.8],
//               title: 'Efficiency',
//               exclusiveMinimum: 0,
//               maximum: 1,
//               type: 'number'
//             },
//             size: {
//               description: '互联网节点数',
//               examples: [16],
//               title: 'Size',
//               exclusiveMinimum: 0,
//               type: 'number'
//             },
//             latency: {
//               description: '延迟(单位: ms)',
//               examples: [5e-6],
//               title: 'Latency',
//               exclusiveMinimum: 0,
//               type: 'number'
//             }
//           }
//         }
//       ],
//       minItems: 1
//     },
//     processing_mode: {
//       $ref: '#/$defs/ProcessingMode',
//       examples: ['roofline']
//     }
//   },
//   required: ['name', 'type', 'matrix', 'vector', 'mem1', 'mem2', 'networks', 'processing_mode']
// }
