/**
 * 数据过滤工具函数
 */

/**
 * 过滤商品数据（单关键词全字段搜索）
 * @param {Array} items - 商品列表
 * @param {string} keyword - 搜索关键词
 * @returns {Array} 过滤后的商品列表
 */
export const filterItems = (items, keyword) => {
  const k = keyword.trim().toLowerCase()

  if (!k) return items

  return items.filter((item) => {
    // 全字段搜索：标题、品牌、品类、供应商、成色、问题、价格、已出价、数量、倒计时
    const searchText = [
      item.title,
      item.brand,
      item.category,
      item.supplier,
      item.grade,
      item.issue,
      item.price,
      item.currentBid,
      `${item.qty}pcs`,
      item.countdown,
    ]
      .join(' ')
      .toLowerCase()

    return searchText.includes(k)
  })
}

/**
 * 计算总台数
 * @param {Array} items - 商品列表
 * @returns {number} 总台数
 */
export const calculateTotalQty = (items) => {
  return items.reduce((sum, item) => sum + (item.qty || 0), 0)
}
