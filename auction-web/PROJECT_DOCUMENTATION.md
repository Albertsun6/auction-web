# 拍卖系统前端 - 完整项目文档

## 📋 项目概述
- **项目名称**: 拍卖系统前端 (Auction Web)
- **技术栈**: React 19.2.0 + Vite 6.4.1 + Ant Design 6.1.0 + React Router 7.10.1
- **数据来源**: 前端生成 100 条本地示例数据（`src/constants/index.js`）
- **状态**: 仅前端演示版，未对接后端 API

## 🎯 功能概览

### 列表页 (`/`)
- 表格列：行号、标单号、供应商、商品、品类/品牌、成色/问题、数量、已出价、参考价、倒计时、出价(单价)
- 双栏搜索：左（标题/品牌/品类/供应商），右（成色/问题/价格/已出价/数量/倒计时），为“与”关系
- 三级筛选：供应商（单选可清空） → 成色（多选，空=全部） → 出价状态（多选，空=全部），分别展示标单数与数量（pcs）
- 列配置：商品列必选；标单号默认隐藏；全选/清空；配置持久化到 `localStorage`
- 关注：行内星标关注/取消；表格多选 + 工具栏按钮支持批量关注/取消；“只看关注”开关；批量完成后清空选中
- 规则：出价后自动关注；已出价的行不可取消关注（需先取消出价）
- 出价交互：placeholder 显示历史出价；Enter/按钮提交；>10000 弹确认；成功后自动聚焦下一行；取消出价带确认框
- 快捷键：↑/↓ 切换出价框（不改数值）；Escape 清空当前输入
- 统计：顶部标单数量；筛选器内显示标单数与数量
- 分页：10/20/50 每页，可切换页码；筛选变更会重置到第一页
- 视觉：已出价行左侧绿色竖条，未出价透明竖条

### 详情页 (`/detail/:id`)
- 展示行号、标单号、供应商、品牌、品类、成色/问题、数量
- 拍卖信息：当前出价（HK$0 视为 `--`）、参考价、平均每件成本、剩余时间
- 出价/取消：同列表逻辑，写入 `localStorage`，列表页读取同一记录
- 返回：按钮与头部返回均使用 `navigate(-1)`

### 路由
- `App.jsx` 使用 React Router 7.10.1 配置
- `/` 列表页，`/detail/:id` 详情页

## 📁 目录结构（核心）
```
src/
├── components/
│   ├── PageHeader.{jsx,css}
│   ├── TableToolbar.{jsx,css}
│   └── ResizableTable.{jsx,css}
├── pages/
│   ├── ListPage.jsx
│   ├── DetailPage.jsx
│   └── DetailPage.css
├── constants/index.js       # 默认数据、可见列、存储键名
├── utils/
│   ├── storage.js           # localStorage 封装
│   ├── filter.js            # 搜索与台数统计
│   └── itemFinder.js        # 单条查找（当前页面未引用）
├── App.jsx / App.css
├── main.jsx / index.css
└── vite.config.js
```

## 🛠️ 技术细节
- **依赖**：react 19.2.0、react-router-dom 7.10.1、antd 6.1.0、@ant-design/icons 6.1.0
- **构建**：Vite 6.4.1，手动分包（react-vendor / antd-vendor），esbuild 压缩，cssCodeSplit 开启，drop console/debugger
- **状态与性能**：useMemo/useCallback 缓存过滤、列定义、事件；分页与筛选组合使用
- **存储**：`auction_visible_keys`（列可见性），`auction_bid_records`（出价记录 `{ [id]: number }`），`auction_followed_ids`（关注 `{ [id]: true }`）
- **数据处理**：
  - 搜索 → 供应商筛选 → 成色筛选 → 出价状态筛选 的级联链路
  - “只看关注”在上述筛选后再过滤
  - 出价状态判定：`currentBid` 去掉 “HK$”/逗号后，非空且不为 0/`--` 视为已出价
  - `HK$0` 在列表与详情页均视为未出价时显示 `--`
- **键盘交互**：↑/↓ 切换出价框且清除当前未提交输入；Escape 清空并 blur；Enter 提交当前行

## 🎨 样式要点
- 主色 `#0f6ad8`，背景 `#f5f7fa`，内容背景 `#eef1f5`
- 已出价行左侧 4px 绿色竖条（`#10b981`），未出价透明竖条
- 最大内容宽度 1600px，表格水平滚动；768px/992px 断点调整布局

## 🔧 关键流程
```
出价输入 → 验证金额 → （大额弹窗） → 保存 bidRecords →
itemsWithBids 重算 → 过滤链路更新 → 表格与统计刷新 →
清空输入 → 自动聚焦下一行输入框
```

## 📊 构建与交付
- 仓库未包含 `dist/`，需自行运行 `npm run build`
- 手动分包命名：`assets/js/react-vendor-*.js`、`assets/js/antd-vendor-*.js`

## 🐛 已知问题
1. 出价仅存本地，未对接后端 API
2. 倒计时为静态文案，未实时更新
3. 列宽不可拖拽，未做列宽持久化
4. 数据为前端生成示例，未接真实数据源
5. 预留批量出价/批量取消能力尚未实现（当前仅关注批量）

## 🔮 后续计划
- 对接后端 API：列表数据、出价提交/取消
- 实时倒计时与数据刷新
- 按需引入 Ant Design 以降低体积
- 权限/认证与错误边界
- 导出/批量操作与测试（单测 + E2E）

## 📄 许可证
MIT License
