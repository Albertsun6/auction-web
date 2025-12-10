/**
 * 高级搜索过滤工具函数
 */

/**
 * 解析数字（处理 HK$100 这类格式）
 * @param {*} val - 要解析的值
 * @returns {number}
 */
function parseNumber(val) {
  if (typeof val === 'number') return val
  if (val === null || val === undefined) return 0
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''))
  return isNaN(num) ? 0 : num
}

/**
 * 单条件匹配
 * @param {Object} item - 商品对象
 * @param {Object} condition - 条件对象 { field, operator, value }
 * @returns {boolean}
 */
function matchCondition(item, condition) {
  const { field, operator, value } = condition

  // 如果值为空，跳过该条件（相当于不过滤）
  if (value === '' || value === null || value === undefined) {
    return true
  }

  const itemValue = item[field]

  switch (operator) {
    // 文本操作符
    case 'contains':
      return String(itemValue || '').toLowerCase().includes(String(value).toLowerCase())
    case 'notContains':
      return !String(itemValue || '').toLowerCase().includes(String(value).toLowerCase())
    case 'equals':
      return String(itemValue || '').toLowerCase() === String(value).toLowerCase()
    case 'startsWith':
      return String(itemValue || '').toLowerCase().startsWith(String(value).toLowerCase())
    
    // 数字操作符
    case 'gt':
      return parseNumber(itemValue) > parseNumber(value)
    case 'gte':
      return parseNumber(itemValue) >= parseNumber(value)
    case 'lt':
      return parseNumber(itemValue) < parseNumber(value)
    case 'lte':
      return parseNumber(itemValue) <= parseNumber(value)
    
    // 选择类型操作符
    case 'notEquals':
      return String(itemValue || '').toLowerCase() !== String(value).toLowerCase()
    
    default:
      return true
  }
}

/**
 * 应用高级搜索过滤（纯 AND 逻辑）
 * @param {Array} items - 商品列表
 * @param {Array} conditions - 条件列表
 * @returns {Array} 过滤后的商品列表
 */
export function applyAdvancedFilter(items, conditions) {
  // 如果没有条件，返回原列表
  if (!conditions || !conditions.length) {
    return items
  }

  // 过滤掉空值条件
  const validConditions = conditions.filter(
    (cond) => cond.value !== '' && cond.value !== null && cond.value !== undefined
  )

  // 如果没有有效条件，返回原列表
  if (!validConditions.length) {
    return items
  }

  return items.filter((item) => {
    // 所有条件必须同时满足（AND 逻辑）
    return validConditions.every((cond) => matchCondition(item, cond))
  })
}

/**
 * 检查条件列表是否有有效条件
 * @param {Array} conditions - 条件列表
 * @returns {boolean}
 */
export function hasValidConditions(conditions) {
  if (!conditions || !conditions.length) return false
  return conditions.some(
    (cond) => cond.value !== '' && cond.value !== null && cond.value !== undefined
  )
}

