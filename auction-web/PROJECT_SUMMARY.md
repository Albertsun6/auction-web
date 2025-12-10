# 项目总结

## 项目信息
- **项目名称**: 拍卖系统前端 (Auction Web)
- **技术栈**: React 19.2.0 + Vite 6.4.1 + Ant Design 6.1.0 + React Router 7.10.1
- **构建状态**: 未包含 `dist/`，需本地 `npm run build`
- **代码质量**: 未执行 Lint（可运行 `npm run lint`）

## 项目结构
```
auction-web/
├── src/
│   ├── components/ (PageHeader, TableToolbar, ResizableTable)
│   ├── pages/ (ListPage, DetailPage, DetailPage.css)
│   ├── constants/index.js
│   ├── utils/ (storage, filter, itemFinder)
│   ├── App.jsx / App.css / main.jsx / index.css
│   └── vite.config.js
├── public/
├── package.json
└── 文档（README, PROJECT_DOCUMENTATION, OPTIMIZATION, CODE_OPTIMIZATION）
```

## 核心功能
- 表格展示 100 条示例数据（11 列，列宽自适应）
- 双栏搜索（左：标题/品牌/品类/供应商；右：成色/问题/价格/已出价/数量/倒计时）
- 三级筛选（供应商单选可清空 → 成色多选空=全部 → 出价状态多选空=全部），显示标单数与数量
- 列配置：商品列必选；标单号默认隐藏；全选/清空；配置持久化
- 关注：行内星标关注/取消，表格多选支持批量关注/取消，“只看关注”过滤
- 规则：出价后自动关注；已出价的行不可取消关注（需先取消出价）
- 出价交互：placeholder 显示历史出价；Enter/按钮提交；>10000 弹确认；自动聚焦下一行；取消出价带确认
- 快捷键：↑/↓ 切换出价框，Escape 清空当前输入
- 分页：10/20/50 每页，筛选变更重置页码
- 行点击跳转 `/detail/:id`；详情页可查看并提交/取消出价

## 技术特性
- Hooks 优化：useMemo/useCallback 缓存过滤、列定义与事件
- 本地存储：`auction_visible_keys`、`auction_bid_records`、`auction_followed_ids`
- 响应式：最大内容宽度 1600px，常用断点适配
- 构建：Vite 手动分包（react-vendor / antd-vendor），esbuild 压缩，cssCodeSplit 开启

## 依赖包
- 生产：react, react-dom, react-router-dom, antd, @ant-design/icons
- 开发：vite, @vitejs/plugin-react, eslint 9.x, @types/react, @types/react-dom, eslint 插件集

## 构建与运行
- 开发：`npm run dev`（默认 5173）
- 构建：`npm run build`
- 预览：`npm run preview`
- Lint：`npm run lint`

## 文档
- README.md - 使用说明与功能概览
- PROJECT_DOCUMENTATION.md - 详细功能与实现说明
- OPTIMIZATION.md - 优化/重构摘要
- CODE_OPTIMIZATION.md - 优化记录与数据

## 待完成功能
- 对接后端 API（数据获取、出价提交/取消）
- 倒计时实时更新与数据刷新
- 按需引入 Ant Design 以降低体积
- 导出/批量操作
- 测试（单测 + E2E）与错误边界；预留的批量出价/批量取消尚未实现

## 已知问题
- 当前无构建产物，需本地构建
- 出价仅存本地，未接后端
- 倒计时为静态文案
- 列宽不可拖拽或持久化

## 总结
项目完成前端演示版：列表/详情、搜索筛选、列配置与本地出价持久化均可用。下一步需接入后端、完善实时数据与测试，并优化包体积与交互。