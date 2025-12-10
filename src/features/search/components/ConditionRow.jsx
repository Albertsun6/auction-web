import { memo, useMemo } from 'react'
import { Space, Select, Input, InputNumber, Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { SEARCH_FIELDS, getOperatorsForField, getFieldConfig } from '../constants/searchFields'

/**
 * 单个搜索条件行组件
 * @param {Object} props
 * @param {Object} props.condition - 条件对象 { id, field, operator, value }
 * @param {Function} props.onChange - 条件变化回调
 * @param {Function} props.onRemove - 删除条件回调
 * @param {Array} props.availableGrades - 可用的成色选项（动态）
 * @param {boolean} props.canRemove - 是否可以删除（至少保留一个条件）
 */
function ConditionRow({ condition, onChange, onRemove, availableGrades = [], canRemove = true }) {
  // 字段选项
  const fieldOptions = useMemo(
    () => SEARCH_FIELDS.map((f) => ({ label: f.label, value: f.key })),
    []
  )

  // 当前字段的操作符选项
  const operatorOptions = useMemo(() => {
    const operators = getOperatorsForField(condition.field)
    return operators.map((op) => ({ label: op.label, value: op.key }))
  }, [condition.field])

  // 当前字段配置
  const fieldConfig = useMemo(() => getFieldConfig(condition.field), [condition.field])

  // 获取 select 类型字段的选项
  const selectOptions = useMemo(() => {
    if (!fieldConfig || fieldConfig.type !== 'select') return []
    // 成色字段使用动态选项
    if (condition.field === 'grade') {
      return availableGrades.map((g) => ({ label: g, value: g }))
    }
    return (fieldConfig.options || []).map((opt) => ({ label: opt, value: opt }))
  }, [fieldConfig, condition.field, availableGrades])

  // 字段变化时，重置操作符和值
  const handleFieldChange = (field) => {
    const newFieldConfig = getFieldConfig(field)
    const newOperators = getOperatorsForField(field)
    onChange({
      ...condition,
      field,
      operator: newOperators[0]?.key || 'contains',
      value: newFieldConfig?.type === 'number' ? null : '',
    })
  }

  // 操作符变化
  const handleOperatorChange = (operator) => {
    onChange({ ...condition, operator })
  }

  // 值变化
  const handleValueChange = (value) => {
    onChange({ ...condition, value })
  }

  // 渲染值输入组件
  const renderValueInput = () => {
    if (!fieldConfig) {
      return (
        <Input
          placeholder="输入值"
          value={condition.value}
          onChange={(e) => handleValueChange(e.target.value)}
          style={{ width: 150 }}
          allowClear
        />
      )
    }

    switch (fieldConfig.type) {
      case 'number':
        return (
          <InputNumber
            placeholder="输入数值"
            value={condition.value}
            onChange={handleValueChange}
            style={{ width: 150 }}
            controls={false}
          />
        )
      case 'select':
        return (
          <Select
            placeholder="选择值"
            value={condition.value || undefined}
            onChange={handleValueChange}
            options={selectOptions}
            style={{ width: 150 }}
            allowClear
          />
        )
      default:
        return (
          <Input
            placeholder="输入值"
            value={condition.value}
            onChange={(e) => handleValueChange(e.target.value)}
            style={{ width: 150 }}
            allowClear
          />
        )
    }
  }

  return (
    <Space size={8} className="condition-row">
      <Select
        value={condition.field}
        onChange={handleFieldChange}
        options={fieldOptions}
        style={{ width: 100 }}
      />
      <Select
        value={condition.operator}
        onChange={handleOperatorChange}
        options={operatorOptions}
        style={{ width: 100 }}
      />
      {renderValueInput()}
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={onRemove}
        disabled={!canRemove}
        className="condition-remove-btn"
      />
    </Space>
  )
}

export default memo(ConditionRow)

