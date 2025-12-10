const SUPPLIERS = ['V版', 'Ecoatm', 'Hyla']
const ISSUES = ['', 'Cracked Glass', 'Functional Issue']
const GRADES = ['A', 'B', 'C', 'D']
const BRANDS = ['Apple', 'Google']
const CATEGORIES = {
  Apple: 'iPad',
  Google: 'Pixel',
}

// 生成 100 条示例数据
export const DEFAULT_ITEMS = Array.from({ length: 100 }, (_, idx) => {
  const i = idx + 1
  const supplier = SUPPLIERS[idx % SUPPLIERS.length]
  const issue = ISSUES[idx % ISSUES.length]
  const grade = issue ? '' : GRADES[idx % GRADES.length]
  const brand = BRANDS[idx % BRANDS.length]
  const category = CATEGORIES[brand]
  const productName = brand === 'Apple' 
    ? `Apple iPad ${10 - (idx % 2)}th·${idx % 2 === 0 ? '64GB' : '32GB'}·FMIP Off`
    : `Google Pixel ${7 + (idx % 2)}·${idx % 2 === 0 ? '128GB' : '256GB'}·Unlocked`
  return {
    rowNo: i,
    lotNo: `BJ008XA-${String(i).padStart(3, '0')}`,
    supplier,
    id: i,
    title: productName,
    brand,
    category,
    grade,
    issue,
    qty: (idx % 3) + 1,
    price: 'HK$--',
    countdown: '3h :35m',
    followed: false,
    currentBid: 'HK$0',
  }
})

// 默认列配置（标单号默认不显示）
export const DEFAULT_VISIBLE_KEYS = [
  'rowNo',
  'supplier',
  'title',
  'category',
  'brand',
  'issue',
  'currentBid',
  'price',
  'qty',
  'countdown',
  'action',
]

// 本地存储键名
export const STORAGE_KEYS = {
  VISIBLE_KEYS: 'auction_visible_keys',
  BID_RECORDS: 'auction_bid_records',
  FOLLOWED_IDS: 'auction_followed_ids',
  SAVED_SEARCHES: 'auction_saved_searches',
}

