import { memo, useCallback, useState, useEffect } from 'react'
import { Space, Button, Typography, Modal, Input, message } from 'antd'
import { PlusOutlined, ClearOutlined, SaveOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import ConditionRow from './ConditionRow'
import { createDefaultCondition } from '../constants/searchFields'
import './AdvancedSearch.css'

const { Text } = Typography

/**
 * 高级搜索面板组件
 * @param {Object} props
 * @param {Array} props.conditions - 条件列表
 * @param {Function} props.onConditionsChange - 条件变化回调
 * @param {Array} props.availableGrades - 可用的成色选项（动态）
 * @param {number} props.matchCount - 当前匹配的数量
 * @param {boolean} props.hasActiveConditions - 是否有有效的条件
 * @param {Function} props.onSaveCurrentSearch - 保存当前搜索条件回调
 * @param {Function} props.onClose - 关闭高级搜索回调
 * @param {string} props.activeSearchId - 当前激活的搜索策略ID
 * @param {Array} props.savedSearches - 已保存的搜索策略列表
 * @param {boolean} props.isDirty - 是否已修改
 * @param {Function} props.onDeleteSavedSearch - 删除已保存的搜索策略
 */
function AdvancedSearch({ 
  conditions, 
  onConditionsChange, 
  availableGrades = [], 
  matchCount,
  hasActiveConditions = false,
  onSaveCurrentSearch,
  onClose,
  activeSearchId,
  savedSearches = [],
  isDirty = false,
  onDeleteSavedSearch,
}) {
  // 弹窗状态
  const [saveModalVisible, setSaveModalVisible] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [closeConfirmVisible, setCloseConfirmVisible] = useState(false)

  // 编辑模式下的策略名称
  const [editingName, setEditingName] = useState('')
  
  // 当 activeSearchId 变化时，同步 editingName
  useEffect(() => {
    const name = activeSearchId 
      ? savedSearches.find(s => s.id === activeSearchId)?.name || ''
      : ''
    setEditingName(name)
  }, [activeSearchId, savedSearches])

  // 添加条件
  const handleAddCondition = useCallback(() => {
    onConditionsChange([...conditions, createDefaultCondition()])
  }, [conditions, onConditionsChange])

  // 更新单个条件
  const handleConditionChange = useCallback(
    (index, newCondition) => {
      const newConditions = [...conditions]
      newConditions[index] = newCondition
      onConditionsChange(newConditions)
    },
    [conditions, onConditionsChange]
  )

  // 删除单个条件
  const handleRemoveCondition = useCallback(
    (index) => {
      const newConditions = conditions.filter((_, i) => i !== index)
      onConditionsChange(newConditions)
    },
    [conditions, onConditionsChange]
  )

  // 清空所有条件
  const handleClearAll = useCallback(() => {
    onConditionsChange([])
  }, [onConditionsChange])

  // 获取当前策略名称和检查名称是否修改
  const currentSearchName = activeSearchId 
    ? savedSearches.find(s => s.id === activeSearchId)?.name 
    : ''
  const isNameChanged = activeSearchId && editingName !== currentSearchName

  // 统一保存逻辑
  const doSave = useCallback((name, id, closeAfter = false) => {
    if (!name?.trim()) {
      message.warning('请输入策略名称')
      return false
    }
    const result = onSaveCurrentSearch?.(name.trim(), id)
    
    // 处理返回结果
    if (result?.error === 'empty_value') {
      message.warning('请填写所有条件的值')
      return false
    }
    if (result?.error === 'duplicate') {
      message.error('策略名称已存在，请使用其他名称')
      return false
    }
    if (result?.success) {
      message.success(id ? '搜索策略已更新' : (activeSearchId ? '已另存为新策略' : '搜索策略保存成功'))
      if (closeAfter) onClose?.()
      return true
    }
    message.error('保存失败')
    return false
  }, [onSaveCurrentSearch, onClose, activeSearchId])

  // 保存按钮点击
  const handleSaveClick = useCallback(() => {
    if (activeSearchId) {
      doSave(editingName, activeSearchId)
    } else {
      setSaveName('')
      setSaveModalVisible(true)
    }
  }, [activeSearchId, editingName, doSave])

  // 弹窗确认保存
  const handleConfirmSave = useCallback(() => {
    if (doSave(saveName, null)) {
      setSaveModalVisible(false)
      setSaveName('')
    }
  }, [saveName, doSave])

  // 关闭按钮点击
  const handleCloseClick = useCallback(() => {
    if (isDirty || isNameChanged) {
      setCloseConfirmVisible(true)
    } else {
      onClose?.()
    }
  }, [isDirty, isNameChanged, onClose])

  // 保存并关闭
  const handleSaveAndClose = useCallback(() => {
    setCloseConfirmVisible(false)
    if (activeSearchId) {
      doSave(editingName, activeSearchId, true)
    } else {
      setSaveName('')
      setSaveModalVisible(true)
    }
  }, [activeSearchId, editingName, doSave])

  return (
    <div className="advanced-search-panel">
      <div className="advanced-search-header">
        <Space>
          {activeSearchId ? (
            <>
              <Text type="secondary" style={{ fontSize: 14 }}>名称</Text>
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                style={{ width: 150, fontWeight: 500 }}
                size="small"
                maxLength={20}
              />
            </>
          ) : (
            <Text strong style={{ fontSize: 15 }}>新建策略</Text>
          )}
          <Text type="secondary" className="advanced-search-hint" style={{ marginLeft: 8, fontSize: 13 }}>
            需同时满足所有条件
          </Text>
        </Space>
        <div className="advanced-search-header-right">
          {matchCount !== undefined && (
            <Text type="secondary" className="advanced-search-count">
              匹配 <Text strong style={{ color: '#1677ff' }}>{matchCount}</Text> 条
            </Text>
          )}
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleCloseClick}
            className="advanced-search-close-btn"
          >
            关闭
          </Button>
        </div>
      </div>

      <div className="advanced-search-conditions">
        {conditions.map((condition, index) => (
          <ConditionRow
            key={condition.id}
            condition={condition}
            onChange={(newCond) => handleConditionChange(index, newCond)}
            onRemove={() => handleRemoveCondition(index)}
            availableGrades={availableGrades}
            canRemove={conditions.length > 1}
          />
        ))}
      </div>

      <div className="advanced-search-actions">
        <Space size={12}>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddCondition}
            size="small"
          >
            添加条件
          </Button>
          {conditions.length > 0 && (
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={handleClearAll}
              size="small"
              danger={!activeSearchId} // 编辑已有策略时，清空不是危险操作
            >
              清空
            </Button>
          )}
        </Space>
        
        <Space size={12}>
          <Button
            type="primary"
            ghost
            icon={<SaveOutlined />}
            onClick={handleSaveClick}
            size="small"
            disabled={!hasActiveConditions || (activeSearchId && !isDirty && !isNameChanged)}
          >
            {activeSearchId ? '保存修改' : '保存'}
          </Button>
          {activeSearchId && (
            <Button
              type="default"
              size="small"
              onClick={() => {
                setSaveName('')
                setSaveModalVisible(true)
              }}
              disabled={!hasActiveConditions}
            >
              另存为
            </Button>
          )}

          {activeSearchId && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '删除搜索策略',
                  content: `确认删除策略 "${currentSearchName}" 吗？此操作无法撤销。`,
                  okText: '删除',
                  okType: 'danger',
                  cancelText: '取消',
                  onOk: () => {
                    onDeleteSavedSearch?.(activeSearchId)
                    // 删除后关闭高级搜索面板
                    onClose?.()
                  }
                })
              }}
              size="small"
            >
              删除
            </Button>
          )}
        </Space>
      </div>

      {/* 保存弹窗（新建或另存为） */}
      <Modal
        title={activeSearchId ? "另存为新策略" : "保存新策略"}
        open={saveModalVisible}
        onOk={handleConfirmSave}
        onCancel={() => { setSaveModalVisible(false); setSaveName('') }}
        okText="保存"
        cancelText="取消"
        width={400}
      >
        <div style={{ padding: '12px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            为策略命名，方便下次快速使用：
          </Text>
          <Input
            placeholder="例如：高价苹果设备、A级手机"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onPressEnter={handleConfirmSave}
            maxLength={20}
            showCount
            autoFocus
          />
        </div>
      </Modal>

      {/* 关闭确认弹窗 */}
      <Modal
        title={activeSearchId ? "关闭编辑" : "关闭新建"}
        open={closeConfirmVisible}
        onCancel={() => setCloseConfirmVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCloseConfirmVisible(false)}>
            取消
          </Button>,
          <Button key="discard" onClick={() => { setCloseConfirmVisible(false); onClose?.() }}>
            不保存
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveAndClose}>
            {activeSearchId ? "保存修改" : "保存策略"}
          </Button>,
        ]}
        width={400}
      >
        <div style={{ padding: '12px 0' }}>
          <Text>
            {activeSearchId 
              ? `策略 "${currentSearchName}" 有未保存的修改，是否保存？`
              : '当前有未保存的新建策略，是否保存？'}
          </Text>
        </div>
      </Modal>
    </div>
  )
}

export default memo(AdvancedSearch)
