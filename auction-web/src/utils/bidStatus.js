/**
 * 判定出价值是否为有效出价
 * @param {string|number|null|undefined} value
 * @returns {boolean}
 */
export function parseBidValue(value) {
  if (value === null || value === undefined) return null
  const parsed = Number(String(value).replace(/HK\$/g, '').replace(/,/g, '').trim())
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

export function isBidValue(value) {
  return parseBidValue(value) !== null
}

/**
 * 将出价值统一格式化为显示文本
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function formatBidValue(value) {
  const parsed = parseBidValue(value)
  if (parsed === null) return '--'
  return `HK$${parsed}`
}

/**
 * 判断某行是否已出价（合并本地记录与默认数据）
 * @param {number} id
 * @param {Object} bidRecords
 * @param {Array} defaultItems
 * @returns {boolean}
 */
export function hasActiveBid(id, bidRecords, defaultItems) {
  const localBid = bidRecords[id]
  if (isBidValue(localBid)) return true
  const baseItem = defaultItems.find((item) => item.id === Number(id))
  if (!baseItem || !baseItem.currentBid) return false
  return isBidValue(baseItem.currentBid)
}

/**
 * 将本地出价合并回单个商品，返回可直接渲染的数据
 * @param {Object} item
 * @param {Object} bidRecords
 * @returns {Object}
 */
export function mergeBidToItem(item, bidRecords) {
  const bidAmount = parseBidValue(bidRecords[item.id] ?? item.currentBid)
  const currentBid = bidAmount ? `HK$${bidAmount}` : '--'
  return {
    ...item,
    currentBid,
  }
}
