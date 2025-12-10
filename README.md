# 拍卖系统前端

基于 React + Vite + Ant Design 构建的拍卖列表示例，内置 100 条本地数据，支持搜索、筛选、列配置与出价交互。

## ✨ 功能特性

### 核心功能
- 📊 **数据表格**：Ant Design Table 展示 11 列，列宽自适应内容
- 🔍 **双栏搜索**：左（标题/品牌/品类/供应商）+ 右（成色/问题/价格/已出价/数量/倒计时），为“与”关系
- 🎯 **多级筛选**：供应商 → 成色 → 出价状态，展示标单/数量统计
- ⚙️ **列配置**：纵向配置面板，商品列必选，标单号默认隐藏，支持全选/清空，配置持久化
- 💰 **出价交互**：placeholder 显示历史出价；Enter 或按钮提交；>10000 弹确认；成功后自动聚焦下一行
- ⌨️ **快捷键**：↑/↓ 切换出价框（不改数值），Escape 清空当前输入
- 📈 **统计**：顶部显示标单数量；筛选器显示标单数与台数
- ⭐ **关注**：行内星标关注/取消，工具栏支持批量关注/取消，支持“只看关注”过滤
- 📌 **规则**：出价后自动关注；已出价的行不可取消关注（需先取消出价）
- 🔗 **详情页**：点击行跳转 `/detail/:id`，详情页可查看并提交/取消出价
- 🎨 **视觉区分**：已出价行左侧绿色竖条，未出价为透明竖条
- ❌ **取消出价**：带确认框，清除本地记录

### 技术特性
- ⚡ useMemo/useCallback 优化过滤和事件
- 💾 列可见性与出价记录保存到 `localStorage`
- 🎨 响应式布局，最大内容宽度 1600px
- 📦 组件化拆分（列表页、详情页、工具栏、表格、头部）
- 🧩 Vite 手动分包（react-vendor、antd-vendor）

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
启动后访问 `http://localhost:5173`

### 构建生产版本
```bash
npm run build
```
产物位于 `dist/`

### 预览生产构建
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

## 📁 项目结构
```
auction-web/
├── public/
├── src/
│   ├── components/
│   │   ├── PageHeader.{jsx,css}
│   │   ├── TableToolbar.{jsx,css}
│   │   └── ResizableTable.{jsx,css}
│   ├── pages/
│   │   ├── ListPage.jsx
│   │   ├── DetailPage.jsx
│   │   └── DetailPage.css
│   ├── hooks/useAuctionFilters.js # 筛选与统计逻辑
│   ├── constants/index.js       # 默认数据、可见列、存储键名
│   ├── constants/filters.js     # 筛选常量（供应商/出价状态）
│   ├── services/storageService.js # 针对性存储读写封装
│   ├── utils/
│   │   ├── storage.js           # localStorage 封装
│   │   ├── filter.js            # 搜索与台数统计
│   │   └── itemFinder.js        # 单条查找（未在当前页面使用）
│   │   └── bidStatus.js         # 出价状态判定
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── vite.config.js
├── package.json
└── README.md
```

## 🛠️ 技术栈
- React 19.2.0
- Vite 6.4.1（@vitejs/plugin-react 4.7.0）
- React Router 7.10.1
- Ant Design 6.1.0 + @ant-design/icons 6.1.0
- ESLint 9.x（JS + JSDoc 类型提示）

## 🧭 架构与约定
- 筛选链路：搜索 → 供应商(单选可清空) → 成色(多选，空=全部) → 出价状态(多选，空=全部) → 只看关注
- 逻辑拆分：`useAuctionFilters` 处理过滤与统计；`filters.js` 管理筛选常量；`bidStatus.js` 判定出价有效性；`storageService` 管理可见列/出价/关注存储
- 出价规则：出价自动关注；已出价不可取消关注，需先取消出价
- UI 约定：商品列和关注列固定显示；标单号默认隐藏可手动打开
- 存储键名：`auction_visible_keys` / `auction_bid_records` / `auction_followed_ids`

## 📖 使用说明

### 搜索
- 左搜索：标题 / 品牌 / 品类 / 供应商
- 右搜索：成色 / 问题 / 价格 / 已出价 / 数量 / 倒计时
- 两个搜索框同时匹配才显示结果

### 筛选
1. 供应商：V版、Ecoatm、Hyla（基于搜索结果，单选，可清空=全部）
2. 成色：从搜索结果提取实际存在的成色，多选复选；无选择=全部
3. 出价状态：已出价 / 未出价，多选复选；无选择=全部
4. 每个筛选器显示标单数与数量（pcs）

### 列配置
1. 点击工具栏“列配置”
2. 商品列固定显示；标单号默认隐藏可开启
3. 全选/清空快速切换可见列
4. 配置持久化到 `localStorage`

### 关注与批量操作
1. 行内星标可关注/取消，不触发行跳转
2. 选中多行后可“批量关注”或“批量取消关注”
3. “只看关注”开关可过滤仅关注的行
4. 批量操作完成后自动清空已选行

### 出价
1. placeholder 为历史出价；输入框值仅显示当前输入
2. Enter 或按钮提交；金额<=0 会提示并清空
3. 出价未变化会提示并跳到下一行
4. 出价 >10000 会弹出确认框
5. 成功后自动聚焦下一行输入框
6. “取消出价”带确认框，删除本地记录

### 快捷键
| 快捷键 | 功能 |
|--------|------|
| ↑/↓ | 在出价框间切换（不调整数值） |
| Enter | 提交出价并跳转下一行 |
| Escape | 清空当前输入 |

### 查看详情
- 点击表格行跳转 `/detail/:id`
- 详情页展示基本信息、当前出价（HK$0 视为未出价时显示 `--`）、参考价、平均成本、剩余时间
- 详情页的出价/取消操作写入本地存储，列表页读取同一记录

## 🔧 配置说明

### 本地存储键名
- `auction_visible_keys`: 可见列配置
- `auction_bid_records`: 出价记录 `{ [id]: bidAmount }`
- `auction_followed_ids`: 关注记录 `{ [id]: true }`

### 默认列配置（标单号默认隐藏）
- 行号、供应商、商品（必选）、品类/品牌、成色/问题、数量、已出价、参考价、倒计时、出价(单价)

### 示例数据
- 由 `src/constants/index.js` 生成 100 条本地数据，品牌/品类固定为 Apple iPad，倒计时为静态文本。

## 🎨 样式与响应
- 主色 `#0f6ad8`，背景 `#f5f7fa`，内容背景 `#eef1f5`
- 已出价行左侧 4px 绿色竖条（`#10b981`），未出价透明竖条
- 最大内容宽度 1600px，表格支持水平滚动

## 📊 构建信息
- 仓库未包含构建产物，需运行 `npm run build` 生成 `dist/`
- Vite 已配置手动分包（react-vendor / antd-vendor）、esbuild 压缩与 cssCodeSplit

## 🐛 已知问题
- 出价仅保存在本地存储，未对接后端 API
- 倒计时为静态文案，未实时更新
- 数据为前端生成示例，未接入真实数据源

## 🔮 未来计划
- 对接后端 API 获取列表、提交/取消出价
- 实时倒计时与数据更新
- 权限/认证、导出与批量操作
- 单元测试与 E2E 覆盖核心流程

## 📚 更多文档
- [完整项目文档](./PROJECT_DOCUMENTATION.md)
- [代码优化记录](./CODE_OPTIMIZATION.md)

## 📄 许可证
MIT License
