import { useState, useCallback, useMemo, useEffect } from 'react'
import { createDefaultCondition } from '../constants/searchFields'
import { hasValidConditions } from '../utils/advancedFilter'
import { readSavedSearches, writeSavedSearches } from '../../../services/storageService'

/**
 * 生成已保存搜索的唯一 ID
 */
function generateSavedSearchId() {
  return `saved_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

/**
 * 高级搜索状态管理 Hook
 * @returns {Object} 高级搜索状态和方法
 */
export function useAdvancedSearch() {
  // 是否展开高级搜索面板
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 搜索条件列表
  const [conditions, setConditions] = useState([])

  // 已保存的搜索条件列表
  const [savedSearches, setSavedSearches] = useState(() => readSavedSearches())

  // 当前加载的已保存搜索 ID（用于高亮显示）
  const [activeSearchId, setActiveSearchId] = useState(null)

  // 原始条件（用于判断是否 dirty）
  const [originalConditions, setOriginalConditions] = useState(null)

  // 计算是否修改过
  const isDirty = useMemo(() => {
    // 1. 如果有 activeSearchId，比较当前 conditions 和 originalConditions
    if (activeSearchId && originalConditions) {
      return JSON.stringify(conditions) !== JSON.stringify(originalConditions)
    }
    // 2. 如果没有 activeSearchId（新建模式），只要有有效条件就视为 dirty
    if (!activeSearchId) {
      return hasValidConditions(conditions)
    }
    return false
  }, [conditions, originalConditions, activeSearchId])

  // 保存到本地存储
  useEffect(() => {
    writeSavedSearches(savedSearches)
  }, [savedSearches])

  // 初始化新建搜索
  const initNewSearch = useCallback(() => {
    setIsExpanded(true)
    setConditions([createDefaultCondition()])
    setActiveSearchId(null)
    setOriginalConditions(null)
  }, [])

  // 更新条件列表
  const updateConditions = useCallback((newConditions) => {
    setConditions(newConditions)
  }, [])

  // 清空条件并收起面板
  const clearAndClose = useCallback(() => {
    setConditions([])
    setIsExpanded(false)
    setActiveSearchId(null)
    setOriginalConditions(null)
  }, [])

  // 是否有有效条件
  const hasActiveConditions = useMemo(
    () => hasValidConditions(conditions),
    [conditions]
  )

  // 保存当前条件
  const saveCurrentSearch = useCallback((name, idToUpdate = null) => {
    if (!name.trim() || !hasActiveConditions) return false

    // 1. 如果指定了 ID 且存在，则更新
    if (idToUpdate) {
      const index = savedSearches.findIndex(s => s.id === idToUpdate)
      if (index !== -1) {
        const updatedSearch = {
          ...savedSearches[index],
          name: name.trim(),
          conditions: JSON.parse(JSON.stringify(conditions)),
          updatedAt: Date.now(),
        }
        setSavedSearches(prev => {
          const next = [...prev]
          next[index] = updatedSearch
          return next
        })
        // 更新原始条件，重置 dirty 状态
        setOriginalConditions(JSON.parse(JSON.stringify(conditions)))
        return true
      }
    }

    // 2. 否则新建
    const newSavedSearch = {
      id: generateSavedSearchId(),
      name: name.trim(),
      conditions: JSON.parse(JSON.stringify(conditions)), // 深拷贝
      createdAt: Date.now(),
    }

    setSavedSearches((prev) => [...prev, newSavedSearch])
    setActiveSearchId(newSavedSearch.id)
    setOriginalConditions(JSON.parse(JSON.stringify(conditions))) // 设置原始条件
    return true
  }, [conditions, hasActiveConditions, savedSearches])

  // 加载已保存的条件
  const loadSavedSearch = useCallback((id) => {
    const saved = savedSearches.find((s) => s.id === id)
    if (!saved) return false

    // 深拷贝条件，避免引用问题
    const loadedConditions = JSON.parse(JSON.stringify(saved.conditions))
    setConditions(loadedConditions)
    setIsExpanded(true)
    setActiveSearchId(id)
    // 设置原始条件用于比较
    setOriginalConditions(JSON.parse(JSON.stringify(loadedConditions)))
    return true
  }, [savedSearches])

  // 删除已保存的条件
  const deleteSavedSearch = useCallback((id) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id))
    // 如果删除的是当前激活的，清除激活状态
    if (activeSearchId === id) {
      setActiveSearchId(null)
      setOriginalConditions(null)
    }
  }, [activeSearchId])

  return {
    // 状态
    isExpanded,
    conditions,
    hasActiveConditions,
    savedSearches,
    activeSearchId,
    isDirty,
    
    // 方法
    initNewSearch,
    updateConditions,
    clearAndClose,
    saveCurrentSearch,
    loadSavedSearch,
    deleteSavedSearch,
  }
}
