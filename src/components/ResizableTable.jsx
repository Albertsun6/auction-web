import { memo } from 'react'
import { Table } from 'antd'
import './ResizableTable.css'

/**
 * 表格组件（列宽自动适配）
 * @param {Object} props
 * @param {Array} props.columns - 列配置
 * @param {Array} props.dataSource - 数据源
 * @param {Function} props.onRowClick - 行点击事件
 * @param {Object} props.rowSelection - 表格多选配置
 * @param {Function} props.getRowClassName - 获取行类名的函数
 */
function ResizableTable({
  columns,
  dataSource,
  onRowClick,
  rowSelection,
  getRowClassName,
}) {
  return (
    <Table
      className="resizable-table"
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      rowSelection={rowSelection || undefined}
      pagination={false}
      size="middle"
      tableLayout="fixed"
      sticky
      virtual
      scroll={{ x: 1200, y: 600 }}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        style: { cursor: onRowClick ? 'pointer' : 'default' },
        className: getRowClassName ? getRowClassName(record) : '',
      })}
    />
  )
}

export default memo(ResizableTable)

