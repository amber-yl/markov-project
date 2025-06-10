export const uiConfig = {
  form: {
    layout: {
      type: 'grid',
      columns: 2,
      gutter: 20
    }
  },
  table: {
    columns: [
      {
        prop: 'name',
        label: '硬件名称',
        minWidth: 120,
        sortable: false,
        filterable: false,
        filterType: 'text',
        defaultHidden: false
      },
      {
        prop: 'type',
        label: '硬件类型',
        minWidth: 120,
        sortable: false,
        filterable: true,
        filterType: 'select',
        formatter: 'tag',
        defaultHidden: false
      },
      {
        prop: 'created_at',
        label: '创建时间',
        minWidth: 160,
        sortable: true,
        filterable: false,
        formatter: 'datetime',
        defaultHidden: true
      },
      {
        prop: 'updated_at',
        label: '更新时间',
        minWidth: 160,
        sortable: true,
        filterable: false,
        formatter: 'datetime',
        defaultHidden: true
      },
      {
        prop: 'processing_mode',
        label: '性能模式',
        minWidth: 120,
        sortable: false,
        filterable: true,
        filterType: 'select',
        formatter: 'tag',
        defaultHidden: true
      },
      {
        prop: 'matrix.float16.tflops',
        label: 'Cube-理论算力',
        minWidth: 150,
        sortable: true,
        filterable: false,
        formatter: 'number',
        defaultHidden: true
      },
      {
        prop: 'matrix.float16.calibration_coefficient',
        label: 'Cube-利用率',
        minWidth: 150,
        sortable: true,
        filterable: false,
        formatter: 'percentage',
        defaultHidden: true
      },
      {
        prop: 'vector.float16.tflops',
        label: 'Vector-理论算力',
        minWidth: 150,
        sortable: true,
        filterable: false,
        formatter: 'number',
        defaultHidden: true
      },
      {
        prop: 'vector.float16.calibration_coefficient',
        label: 'Vector-利用率',
        minWidth: 150,
        sortable: true,
        filterable: false,
        formatter: 'percentage',
        defaultHidden: true
      },
      {
        prop: 'mem1.GiB',
        label: '显存容量',
        minWidth: 120,
        sortable: true,
        filterable: false,
        formatter: 'memory',
        defaultHidden: true
      },
      {
        prop: 'mem1.GBps',
        label: '显存带宽',
        minWidth: 120,
        sortable: true,
        filterable: false,
        formatter: 'bandwidth',
        defaultHidden: true
      },
      {
        prop: 'mem2.GiB',
        label: 'CPU内存容量',
        minWidth: 120,
        sortable: true,
        filterable: false,
        formatter: 'memory',
        defaultHidden: true
      },
      {
        prop: 'mem2.GBps',
        label: 'CPU内存带宽',
        minWidth: 120,
        sortable: true,
        filterable: false,
        formatter: 'bandwidth',
        defaultHidden: true
      },
      {
        prop: 'networks',
        label: '网络配置',
        minWidth: 180,
        sortable: false,
        filterable: false,
        // formatter: 'bandwidth',
        defaultHidden: false
      }
    ]
  }
}

export const defaultVisible = ['name', 'type', 'matrix.float16.tflops', 'processing_mode']