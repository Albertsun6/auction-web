import { memo, useCallback } from 'react'
import { Space, Input, Button, Dropdown, Checkbox, Divider, Typography, Switch } from 'antd'
import { SettingOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons'
import { AdvancedSearch, SavedSearchTags } from '../features/search'
import './TableToolbar.css'

const { Text } = Typography

/**
 * 表格工具栏组件
 * @param {Object} props
 * @param {string} props.keyword - 搜索关键词
 * @param {Function} props.onKeywordChange - 搜索关键词变化回调
 * @param {Array} props.visibleKeys - 可见列键名数组
 * @param {Function} props.onVisibleKeysChange - 可见列变化回调
 * @param {Array} props.columnOptions - 列选项数组
 * @param {number} props.selectedCount - 已选中行数
 * @param {Function} props.onBatchFollow - 批量关注回调
 * @param {Function} props.onBatchUnfollow - 批量取消关注回调
 * @param {boolean} props.followOnly - 是否只看关注
 * @param {Function} props.onFollowOnlyChange - 切换只看关注
 * @param {number} props.followCount - 只看关注时的行数
 * @param {Function} props.onRefreshFollowList - 刷新关注列表回调
 * @param {boolean} props.hasUnfollowedItems - 是否有待移除的已取消关注项
 * @param {boolean} props.advancedSearchExpanded - 高级搜索是否展开
 * @param {Array} props.advancedConditions - 高级搜索条件列表
 * @param {Function} props.onAdvancedConditionsChange - 高级搜索条件变化回调
 * @param {Array} props.availableGrades - 可用的成色选项
 * @param {number} props.advancedMatchCount - 高级搜索匹配数量
 * @param {boolean} props.hasActiveConditions - 是否有有效的高级搜索条件
 * @param {Array} props.savedSearches - 已保存的搜索条件列表
 * @param {string} props.activeSearchId - 当前激活的已保存搜索 ID
 * @param {Function} props.onLoadSavedSearch - 加载已保存的搜索条件
 * @param {Function} props.onDeleteSavedSearch - 删除已保存的搜索条件
 * @param {Function} props.onSaveCurrentSearch - 保存当前搜索条件
 * @param {Function} props.onAdvancedSearchClose - 关闭高级搜索回调
 * @param {Function} props.onInitNewSearch - 初始化新建高级搜索
 * @param {boolean} props.isAdvancedSearchDirty - 高级搜索是否已修改
 */
function TableToolbar({
  keyword,
  onKeywordChange,
  visibleKeys,
  onVisibleKeysChange,
  columnOptions,
  selectedCount = 0,
  onBatchFollow,
  onBatchUnfollow,
  followOnly = false,
  onFollowOnlyChange,
  followCount = 0,
  onRefreshFollowList,
  hasUnfollowedItems = false,
  advancedSearchExpanded = false,
  advancedConditions = [],
  onAdvancedConditionsChange,
  availableGrades = [],
  advancedMatchCount,
  hasActiveConditions = false,
  savedSearches = [],
  activeSearchId,
  onLoadSavedSearch,
  onDeleteSavedSearch,
  onSaveCurrentSearch,
  onAdvancedSearchClose,
  onInitNewSearch,
  isAdvancedSearchDirty = false,
}) {
  const handleSelectAll = useCallback(() => {
    onVisibleKeysChange(columnOptions.map((o) => o.value))
  }, [columnOptions, onVisibleKeysChange])

  const handleClearAll = useCallback(() => {
    onVisibleKeysChange([])
  }, [onVisibleKeysChange])

  return (
    <div className="table-toolbar-wrapper">
      <div className="table-toolbar">
        <Space wrap size={12} className="table-toolbar-search">
          <Input.Search
            allowClear
            placeholder={advancedSearchExpanded ? "高级搜索已开启，请关闭后使用" : "搜索关键词（标题/品牌/品类/成色/问题等）"}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            style={{ width: 360 }}
            disabled={advancedSearchExpanded}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={onInitNewSearch}
            disabled={advancedSearchExpanded}
          >
            新建高级搜索
          </Button>
        </Space>

        <div className="table-toolbar-actions">
          <Space size={12} wrap align="center">
            <Space size={6} align="center">
              <Switch
                size="small"
                checked={followOnly}
                onChange={onFollowOnlyChange}
              />
              <Text type="secondary" className="follow-only-text">
                只看关注
              </Text>
              <Text 
                type="secondary" 
                className="follow-only-count"
                style={{ visibility: followOnly ? 'visible' : 'hidden' }}
              >
                {followCount} 条
              </Text>
              {followOnly && (
                <Button
                  type={hasUnfollowedItems ? 'primary' : 'default'}
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={onRefreshFollowList}
                  title="刷新列表，移除已取消关注的项"
                >
                  刷新
                </Button>
              )}
            </Space>

            <Button
              disabled={!selectedCount}
              onClick={onBatchFollow}
            >
              批量关注
            </Button>
            <Button
              disabled={!selectedCount}
              onClick={onBatchUnfollow}
            >
              批量取消关注
            </Button>
            <Text 
              type="secondary"
              style={{ visibility: selectedCount > 0 ? 'visible' : 'hidden' }}
            >
              已选 {selectedCount || 0} 条
            </Text>

            <Dropdown
              trigger={['click']}
              dropdownRender={() => (
                <div className="column-dropdown column-dropdown-vertical">
                  <div className="column-dropdown-header">
                    <Text strong>列显示</Text>
                    <Space size={8}>
                      <Button size="small" type="link" onClick={handleSelectAll}>
                        全选
                      </Button>
                      <Button size="small" type="link" onClick={handleClearAll}>
                        清空
                      </Button>
                    </Space>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div className="column-checkbox-vertical">
                    <Checkbox checked disabled className="column-checkbox-item required">
                      商品（必选）
                    </Checkbox>
                    <Checkbox.Group
                      value={visibleKeys}
                      onChange={onVisibleKeysChange}
                      options={columnOptions.filter((c) => c.value !== 'title')}
                    />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                    提示：列宽将根据内容自动适配
                  </Text>
                </div>
              )}
            >
              <Button icon={<SettingOutlined />}>列配置</Button>
            </Dropdown>
          </Space>
        </div>
      </div>

      {/* 已保存的搜索条件标签 */}
      <SavedSearchTags
        savedSearches={savedSearches}
        activeSearchId={activeSearchId}
        onLoad={onLoadSavedSearch}
        onDelete={onDeleteSavedSearch}
      />

      {/* 高级搜索面板 */}
      {advancedSearchExpanded && (
        <AdvancedSearch
          conditions={advancedConditions}
          onConditionsChange={onAdvancedConditionsChange}
          availableGrades={availableGrades}
          matchCount={advancedMatchCount}
          hasActiveConditions={hasActiveConditions}
          onSaveCurrentSearch={onSaveCurrentSearch}
          onClose={onAdvancedSearchClose}
          activeSearchId={activeSearchId}
          savedSearches={savedSearches}
          isDirty={isAdvancedSearchDirty}
          onDeleteSavedSearch={onDeleteSavedSearch}
        />
      )}
    </div>
  )
}

export default memo(TableToolbar)
