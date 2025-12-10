---
name: 高级搜索条件保存功能
overview: 为高级搜索增加保存功能，用户可以将当前搜索条件命名保存，并从已保存的条件列表中快速加载使用。
todos:
  - id: extend-storage
    content: 扩展存储服务，添加 SAVED_SEARCHES 键名和读写方法
    status: completed
  - id: extend-hook
    content: 扩展 useAdvancedSearch Hook，添加保存/加载/删除逻辑
    status: completed
  - id: update-toolbar
    content: 修改 TableToolbar，在搜索框下方显示已保存条件标签
    status: in_progress
  - id: update-advanced-search
    content: 修改 AdvancedSearch 组件，添加保存按钮
    status: pending
  - id: update-listpage
    content: 修改 ListPage 传递新 props
    status: pending
---

# 高级搜索条件保存功能

## 功能设计

### 1. 数据结构

```javascript
// 单个已保存的搜索条件
const savedSearch = {
  id: 'saved_1234567890_abc',  // 唯一标识
  name: '高价苹果设备',          // 用户命名
  conditions: [...],           // 条件列表
  createdAt: 1702234567890     // 创建时间戳
}
```

### 2. UI 布局

已保存的条件以标签形式直接显示在搜索框下方，点击即可加载：

```
┌─────────────────────────────────────────────────────────────┐
│ [搜索关键词...]                              [高级搜索 ▼]   │
│                                                             │
│ 已保存: [高价苹果 ×] [A级设备 ×] [未出价 ×]    <- 标签列表  │
├─────────────────────────────────────────────────────────────┤
│ ┌─ 高级搜索条件 ──────────────────────────────────────────┐ │
│ │  需同时满足所有条件                       匹配 25 条    │ │
│ │                                                          │ │
│ │  [品牌 ▼] [包含 ▼] [Apple        ] [×]                  │ │
│ │  [价格 ▼] [大于 ▼] [5000         ] [×]                  │ │
│ │                                                          │ │
│ │  [+ 添加条件]  [清空]                    [保存当前条件]  │ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**交互说明：**

- **已保存标签**：显示在搜索框下方，始终可见（不受高级搜索展开/收起影响）
- **点击标签**：立即加载该条件并展开高级搜索面板
- **标签上的 × 按钮**：删除该已保存条件（带确认提示）
- **保存当前条件**：点击后弹出对话框输入名称，保存成功后在标签列表中显示

---

## 修改文件

### 1. `src/constants/index.js`

添加存储键名：

```javascript
STORAGE_KEYS: {
  ...
  SAVED_SEARCHES: 'auction_saved_searches',
}
```

### 2. `src/services/storageService.js`

添加读写方法：

```javascript
export const readSavedSearches = () => 
  getStorage(STORAGE_KEYS.SAVED_SEARCHES, [])

export const writeSavedSearches = (value) => 
  setStorage(STORAGE_KEYS.SAVED_SEARCHES, value)
```

### 3. `src/hooks/useAdvancedSearch.js`

扩展 Hook，添加保存/加载功能：

- `savedSearches` - 已保存的搜索条件列表
- `saveCurrentSearch(name)` - 保存当前条件
- `loadSavedSearch(id)` - 加载已保存的条件（同时展开面板）
- `deleteSavedSearch(id)` - 删除已保存的条件

### 4. `src/components/TableToolbar.jsx`

在搜索框下方添加已保存条件的标签列表：

- 使用 Ant Design Tag 组件展示
- 点击标签加载条件
- Tag 的 closable 属性支持删除

### 5. `src/components/TableToolbar.css`

添加已保存标签的样式

### 6. `src/components/AdvancedSearch.jsx`

添加"保存当前条件"按钮 + Modal 输入名称

### 7. `src/components/AdvancedSearch.css`

添加保存按钮相关样式

### 8. `src/pages/ListPage.jsx`

传递新增的 props 给 TableToolbar 和 AdvancedSearch 组件

---

## 实现步骤

1. 扩展存储服务，添加保存搜索条件的读写方法
2. 扩展 useAdvancedSearch Hook，添加保存/加载/删除逻辑
3. 修改 TableToolbar 组件，在搜索框下方显示已保存条件标签
4. 修改 AdvancedSearch 组件，添加保存按钮
5. 修改 ListPage 传递新 props