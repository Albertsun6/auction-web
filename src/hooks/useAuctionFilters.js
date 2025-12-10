import { useMemo } from 'react'
import { filterItems, calculateTotalQty } from '../utils/filter'
import { isBidValue, parseBidValue } from '../utils/bidStatus'

/**
 * 处理拍卖列表的过滤与统计逻辑
 * @param {Object} params
 * @param {Array} params.itemsWithBids - 合并出价/关注后的数据
 * @param {string} params.keywordLeft
 * @param {string} params.keywordRight
 * @param {string} params.selectedSupplier
 * @param {string[]} params.selectedGrade
 * @param {string[]} params.selectedBidStatus
 * @param {boolean} params.followOnly
 * @param {Object} params.followedIds
 * @param {Object} params.followedIdsSnapshot - 只看关注模式下的快照（用于软删除效果）
 */
export function useAuctionFilters({
  itemsWithBids,
  keywordLeft,
  keywordRight,
  selectedSupplier,
  selectedGrade,
  selectedBidStatus,
  followOnly,
  followedIds,
  followedIdsSnapshot,
}) {
  // 搜索过滤
  const searchFiltered = useMemo(
    () => filterItems(itemsWithBids, keywordLeft, keywordRight),
    [itemsWithBids, keywordLeft, keywordRight]
  )

  // 供应商过滤
  const supplierFiltered = useMemo(() => {
    if (!selectedSupplier) return searchFiltered
    return searchFiltered.filter((item) => item.supplier === selectedSupplier)
  }, [searchFiltered, selectedSupplier])

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

  // 统计
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

  const availableGrades = useMemo(() => {
    const grades = new Set()
    searchFiltered.forEach((item) => {
      if (item.grade) grades.add(item.grade)
    })
    return Array.from(grades).sort()
  }, [searchFiltered])

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
