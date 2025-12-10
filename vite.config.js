import { env } from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()]

  if (env.ANALYZE === '1' || mode === 'analyze') {
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      })
    )
  }

  return {
    plugins,
    build: {
      // 代码分割优化
      rollupOptions: {
        output: {
          // 手动代码分割
          manualChunks: {
            // 将 React 相关库单独打包
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // 将 Ant Design 相关库单独打包
            'antd-vendor': ['antd', '@ant-design/icons'],
          },
          // 优化 chunk 文件命名
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // 压缩优化（使用 esbuild，更快）
      minify: 'esbuild',
      // 移除 console 和 debugger
      esbuild: {
        drop: ['console', 'debugger'],
      },
      // 启用 CSS 代码分割
      cssCodeSplit: true,
      // 优化构建大小
      chunkSizeWarningLimit: 1000,
      // 启用源映射（生产环境可选）
      sourcemap: false,
    },
  }
})
