import { Typography, Space } from 'antd'
import './PageHeader.css'

const { Text } = Typography

/**
 * 页面头部组件
 * @param {Object} props
 * @param {number} props.totalLots - 标单数量
 * @param {string} props.selectedSupplier - 选中的供应商
 * @param {Object} props.selectedLogo - 供应商logo配置 { bg, color, text }
 */
export default function PageHeader({ totalLots, selectedSupplier, selectedLogo }) {
  return (
    <div className="page-header">
      <Text className="page-header-title">银河投标</Text>
      <div className="page-header-right">
        <Space size={24}>
          <Text strong style={{ color: '#fff' }}>可用额度: HK$0</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>标单数量: {totalLots}</Text>
        </Space>
        {selectedLogo && (
          <div className="supplier-logo-box" aria-label={`供应商 ${selectedSupplier}`}>
            <span
              className="supplier-logo-mark"
              style={{
                backgroundColor: selectedLogo.bg,
                color: selectedLogo.color,
              }}
            >
              {selectedLogo.text}
            </span>
            <span className="supplier-logo-text">{selectedSupplier}</span>
          </div>
        )}
      </div>
    </div>
  )
}

