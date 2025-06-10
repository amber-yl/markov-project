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
      }
    ]
  }
}

export const defaultVisible = ['name', 'type']