import { DEFAULT_ITEMS, STORAGE_KEYS } from '../constants'
import { getStorage } from './storage'

/**
 * 根据 ID 查找商品
 * @param {number} id - 商品 ID
 * @returns {Object|null} 商品对象，如果不存在则返回 null
 */
export function findItemById(id) {
  const item = DEFAULT_ITEMS.find((item) => item.id === Number(id))
  if (!item) return null

  // 合并出价记录
  const bidRecords = getStorage(STORAGE_KEYS.BID_RECORDS, {})
  const bidAmount = bidRecords[item.id]
  if (bidAmount) {
    return {
      ...item,
      currentBid: `HK$${bidAmount}`,
    }
  }

  return item
}

