/**
 * 数据过滤工具函数
 */

/**
 * 过滤商品数据
 * @param {Array} items - 商品列表
 * @param {string} keywordLeft - 左侧搜索关键词（标题/品牌/品类）
 * @param {string} keywordRight - 右侧搜索关键词（成色/问题/价格/数量）
 * @returns {Array} 过滤后的商品列表
 */
export const filterItems = (items, keywordLeft, keywordRight) => {
  const l = keywordLeft.trim().toLowerCase()
  const r = keywordRight.trim().toLowerCase()

  return items.filter((item) => {
    // 左侧搜索：标题、品牌、品类
    const leftHit =
      !l ||
      [item.title, item.brand, item.category, item.supplier]
        .join(' ')
        .toLowerCase()
        .includes(l)

    // 右侧搜索：成色、问题、价格、已出价、数量、倒计时
    const rightHit =
      !r ||
      [
        item.issue,
        item.grade,
        item.price,
        item.currentBid,
        `${item.qty}pcs`,
        item.countdown,
      ]
        .join(' ')
        .toLowerCase()
        .includes(r)

    return leftHit && rightHit
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
