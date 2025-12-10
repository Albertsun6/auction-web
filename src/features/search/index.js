// 搜索模块统一导出入口

// 组件
export { default as AdvancedSearch } from './components/AdvancedSearch'
export { default as ConditionRow } from './components/ConditionRow'
export { default as SavedSearchTags } from './components/SavedSearchTags'

// Hooks
export { useAdvancedSearch } from './hooks/useAdvancedSearch'

// 工具函数
export { filterItems, calculateTotalQty } from './utils/filter'
export { applyAdvancedFilter, hasValidConditions } from './utils/advancedFilter'

// 常量配置
export {
  SEARCH_FIELDS,
  OPERATORS,
  getOperatorsForField,
  getFieldConfig,
  generateConditionId,
  createDefaultCondition,
} from './constants/searchFields'

