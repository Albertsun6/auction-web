// 高级搜索字段和操作符配置

import { SUPPLIERS } from '../../../constants/filters'

/**
 * 可搜索字段配置
 * type: 'text' | 'number' | 'select'
 */
export const SEARCH_FIELDS = [
  { key: 'title', label: '商品名称', type: 'text' },
  { key: 'brand', label: '品牌', type: 'text' },
  { key: 'category', label: '品类', type: 'text' },
  { key: 'supplier', label: '供应商', type: 'select', options: SUPPLIERS },
  { key: 'grade', label: '成色', type: 'select', options: [] }, // 动态获取
  { key: 'issue', label: '问题', type: 'text' },
  { key: 'price', label: '参考价', type: 'number' },
  { key: 'qty', label: '数量', type: 'number' },
  { key: 'currentBid', label: '已出价', type: 'number' },
]

/**
 * 操作符配置（按字段类型分组）
 */
export const OPERATORS = {
  text: [
    { key: 'contains', label: '包含' },
    { key: 'notContains', label: '不包含' },
    { key: 'equals', label: '等于' },
    { key: 'startsWith', label: '开头是' },
  ],
  number: [
    { key: 'equals', label: '等于' },
    { key: 'gt', label: '大于' },
    { key: 'gte', label: '大于等于' },
    { key: 'lt', label: '小于' },
    { key: 'lte', label: '小于等于' },
  ],
  select: [
    { key: 'equals', label: '等于' },
    { key: 'notEquals', label: '不等于' },
  ],
}

/**
 * 获取字段的操作符列表
 * @param {string} fieldKey - 字段 key
 * @returns {Array} 操作符列表
 */
export function getOperatorsForField(fieldKey) {
  const field = SEARCH_FIELDS.find((f) => f.key === fieldKey)
  if (!field) return OPERATORS.text
  return OPERATORS[field.type] || OPERATORS.text
}

/**
 * 获取字段配置
 * @param {string} fieldKey - 字段 key
 * @returns {Object|undefined} 字段配置
 */
export function getFieldConfig(fieldKey) {
  return SEARCH_FIELDS.find((f) => f.key === fieldKey)
}

/**
 * 生成唯一条件 ID
 * @returns {string}
 */
export function generateConditionId() {
  return `cond_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

/**
 * 创建默认条件
 * @returns {Object}
 */
export function createDefaultCondition() {
  return {
    id: generateConditionId(),
    field: 'title',
    operator: 'contains',
    value: '',
  }
}

