import { memo } from 'react'
import { Typography, Tag } from 'antd'
import './SavedSearchTags.css'

const { Text } = Typography

/**
 * 已保存的搜索策略标签组件
 */
function SavedSearchTags({ savedSearches = [], activeSearchId, onLoad }) {
  if (!savedSearches.length) return null

  return (
    <div className="saved-searches-row">
      <Text type="secondary" className="saved-searches-label">高级搜索:</Text>
      <div className="saved-searches-tags">
        {savedSearches.map((saved) => (
          <Tag
            key={saved.id}
            className={`saved-search-tag ${activeSearchId === saved.id ? 'active' : ''}`}
            onClick={() => onLoad?.(saved.id)}
          >
            {saved.name}
          </Tag>
        ))}
      </div>
    </div>
  )
}

export default memo(SavedSearchTags)

