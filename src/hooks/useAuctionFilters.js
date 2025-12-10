import { useMemo } from 'react'
import { filterItems, calculateTotalQty, applyAdvancedFilter } from '../features/search'
import { isBidValue, parseBidValue } from '../utils/bidStatus'

/**
 * 处理拍卖列表的过滤与统计逻辑
 * @param {Object} params
 * @param {Array} params.itemsWithBids - 合并出价/关注后的数据
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.selectedSupplier
 * @param {string[]} params.selectedGrade
 * @param {string[]} params.selectedBidStatus
 * @param {boolean} params.followOnly
 * @param {Object} params.followedIds
 * @param {Object} params.followedIdsSnapshot - 只看关注模式下的快照（用于软删除效果）
 * @param {Array} params.advancedConditions - 高级搜索条件
 * @param {boolean} params.advancedSearchEnabled - 高级搜索是否启用
 */
export function useAuctionFilters({
  itemsWithBids,
  keyword,
  selectedSupplier,
  selectedGrade,
  selectedBidStatus,
  followOnly,
  followedIds,
  followedIdsSnapshot,
  advancedConditions = [],
  advancedSearchEnabled = false,
}) {
  // 快速搜索过滤（单关键词）
  const searchFiltered = useMemo(
    () => filterItems(itemsWithBids, keyword),
    [itemsWithBids, keyword]
  )

  // 高级搜索过滤
  const advancedFiltered = useMemo(() => {
    if (!advancedSearchEnabled || !advancedConditions.length) {
      return searchFiltered
    }
    return applyAdvancedFilter(searchFiltered, advancedConditions)
  }, [searchFiltered, advancedConditions, advancedSearchEnabled])

  // 供应商过滤
  const supplierFiltered = useMemo(() => {
    if (!selectedSupplier) return advancedFiltered
    return advancedFiltered.filter((item) => item.supplier === selectedSupplier)
  }, [advancedFiltered, selectedSupplier])

  // 成色过滤（多选，空=全部）
  const gradeFiltered = useMemo(() => {
    if (!selectedGrade.length) return supplierFiltered
    return supplierFiltered.filter((item) => item.grade && selectedGrade.includes(item.grade))
  }, [supplierFiltered, selectedGrade])

  // 出价状态过滤（多选，空=全部）
  const bidFiltered = useMemo(() => {
    if (!selectedBidStatus.length) return gradeFiltered
    return gradeFiltered.filter((item) => {
      const isBid = isBidValue(item.currentBid)
      const matchBid = isBid && selectedBidStatus.includes('bid')
      const matchNoBid = !isBid && selectedBidStatus.includes('no-bid')
      return matchBid || matchNoBid
    })
  }, [gradeFiltered, selectedBidStatus])

  // 只看关注（使用快照进行过滤，实现软删除效果）
  const followFilteredData = useMemo(() => {
    if (!followOnly) return bidFiltered
    // 使用快照过滤，如果没有快照则使用当前 followedIds
    const idsForFilter = followedIdsSnapshot || followedIds
    return bidFiltered.filter((item) => !!idsForFilter[item.id])
  }, [bidFiltered, followOnly, followedIds, followedIdsSnapshot])

  // 统计：基于快速搜索后的结果
  const supplierCounts = useMemo(() => {
    const counts = {}
    searchFiltered.forEach((item) => {
      counts[item.supplier] = (counts[item.supplier] || 0) + 1
    })
    return counts
  }, [searchFiltered])

  const supplierQtyCounts = useMemo(() => {
    const qtyCounts = {}
    searchFiltered.forEach((item) => {
      qtyCounts[item.supplier] = (qtyCounts[item.supplier] || 0) + (item.qty || 0)
    })
    return qtyCounts
  }, [searchFiltered])

  // 可用成色：基于高级搜索后的结果
  const availableGrades = useMemo(() => {
    const grades = new Set()
    advancedFiltered.forEach((item) => {
      if (item.grade) grades.add(item.grade)
    })
    return Array.from(grades).sort()
  }, [advancedFiltered])

  const gradeCounts = useMemo(() => {
    const counts = {}
    supplierFiltered.forEach((item) => {
      if (item.grade) counts[item.grade] = (counts[item.grade] || 0) + 1
    })
    return counts
  }, [supplierFiltered])

  const gradeQtyCounts = useMemo(() => {
    const counts = {}
    supplierFiltered.forEach((item) => {
      if (item.grade) counts[item.grade] = (counts[item.grade] || 0) + (item.qty || 0)
    })
    return counts
  }, [supplierFiltered])

  const bidStatusCounts = useMemo(() => {
    let bidCount = 0
    let noBidCount = 0
    gradeFiltered.forEach((item) => {
      const isBid = isBidValue(item.currentBid)
      if (isBid) bidCount++
      else noBidCount++
    })
    return {
      bid: bidCount,
      'no-bid': noBidCount,
      all: gradeFiltered.length,
    }
  }, [gradeFiltered])

  const bidStatusQtyCounts = useMemo(() => {
    let bidQty = 0
    let noBidQty = 0
    gradeFiltered.forEach((item) => {
      const parsed = parseBidValue(item.currentBid)
      if (parsed) bidQty += item.qty || 0
      else noBidQty += item.qty || 0
    })
    return {
      bid: bidQty,
      'no-bid': noBidQty,
      all: calculateTotalQty(gradeFiltered),
    }
  }, [gradeFiltered])

  return {
    searchFiltered,
    advancedFiltered,
    supplierFiltered,
    gradeFiltered,
    filteredData: bidFiltered,
    followFilteredData,
    availableGrades,
    supplierCounts,
    supplierQtyCounts,
    gradeCounts,
    gradeQtyCounts,
    bidStatusCounts,
    bidStatusQtyCounts,
  }
}
