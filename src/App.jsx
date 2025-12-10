import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const ListPage = lazy(() => import('./pages/ListPage'))
const DetailPage = lazy(() => import('./pages/DetailPage'))

/**
 * 应用主入口组件
 * 配置路由系统
 */
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="page-loading">页面加载中...</div>}>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
