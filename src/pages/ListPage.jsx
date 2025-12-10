import { useMemo, useState, useCallback, useEffect, useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, Space, Typography, Tag, InputNumber, Button, message, Popconfirm, Modal, FloatButton } from 'antd'
import { StarOutlined, StarFilled } from '@ant-design/icons'
import PageHeader from '../components/PageHeader'
import TableToolbar from '../components/TableToolbar'
import ResizableTable from '../components/ResizableTable'
import { DEFAULT_ITEMS, DEFAULT_VISIBLE_KEYS } from '../constants'
import { SUPPLIERS, SUPPLIER_LOGO, BID_STATUS_OPTIONS } from '../constants/filters'
import { readVisibleKeys, writeVisibleKeys, readBidRecords, writeBidRecords, readFollowedIds, writeFollowedIds } from '../services/storageService'
import { calculateTotalQty, useAdvancedSearch } from '../features/search'
import { hasActiveBid as checkActiveBid, isBidValue, parseBidValue, mergeBidToItem } from '../utils/bidStatus'
import { useAuctionFilters } from '../hooks/useAuctionFilters'
import '../App.css'

const { Header, Content } = Layout
const { Text } = Typography

function ListPage() {
  // 搜索关键词（单个搜索框）
  const [keyword, setKeyword] = useState('')
  const deferredKeyword = useDeferredValue(keyword)
  
  // 高级搜索
  const {
    isExpanded: advancedSearchExpanded,
    conditions: advancedConditions,
    hasActiveConditions,
    savedSearches,
    activeSearchId,
    isDirty: isAdvancedSearchDirty,
    initNewSearch,
    updateConditions: setAdvancedConditions,
    saveCurrentSearch,
    loadSavedSearch,
    deleteSavedSearch,
    clearAndClose: closeAdvancedSearch,
  } = useAdvancedSearch()

  const [bidInputs, setBidInputs] = useState({})
  const [followOnly, setFollowOnly] = useState(false)
  const [bidRecords, setBidRecords] = useState(() => readBidRecords()) // { id: bidAmount }
  const [followedIds, setFollowedIds] = useState(() => readFollowedIds()) // { id: true }
  // 只看关注模式下的快照，用于软删除效果
  const [followedIdsSnapshot, setFollowedIdsSnapshot] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(SUPPLIERS[0])
  const [selectedBidStatus, setSelectedBidStatus] = useState([]) // [] 表示全部，支持多选
  const [selectedGrade, setSelectedGrade] = useState([]) // [] 表示全部，支持多选
  const [visibleKeys, setVisibleKeys] = useState(() => {
    const stored = readVisibleKeys(DEFAULT_VISIBLE_KEYS)
    // 迁移：移除旧配置中的 lotNo（标单号默认不显示）
    if (stored.includes('lotNo')) {
      const updated = stored.filter(key => key !== 'lotNo')
      writeVisibleKeys(updated)
      return updated
    }
    return stored
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const resetSelection = useCallback(() => {
    setSelectedRowKeys([])
  }, [])

  const handleKeywordChange = useCallback((value) => {
    setKeyword(value)
    resetSelection()
  }, [resetSelection])

  // 初始化新建高级搜索
  const handleInitNewSearch = useCallback(() => {
    setKeyword('')
    initNewSearch()
    resetSelection()
  }, [initNewSearch, resetSelection])
  
  // 加载已保存搜索时也要清空普通搜索
  const handleLoadSavedSearch = useCallback((id) => {
    setKeyword('')
    loadSavedSearch(id)
    resetSelection()
  }, [loadSavedSearch, resetSelection])

  const handleVisibleKeysChange = useCallback((keys) => {
    setVisibleKeys(keys)
    resetSelection()
  }, [resetSelection])

  const handleFollowOnlyChange = useCallback((checked) => {
    setFollowOnly(checked)
    // 开启只看关注时，保存当前关注列表的快照
    if (checked) {
      setFollowedIdsSnapshot({ ...followedIds })
    } else {
      // 关闭时清除快照
      setFollowedIdsSnapshot(null)
    }
    resetSelection()
  }, [resetSelection, followedIds])

  // 刷新关注列表（更新快照为当前状态）
  const handleRefreshFollowList = useCallback(() => {
    if (followOnly) {
      setFollowedIdsSnapshot({ ...followedIds })
      message.success('列表已刷新')
    }
  }, [followOnly, followedIds])

  const handleSupplierChange = useCallback((supplier) => {
    setSelectedSupplier((prev) => (prev === supplier ? '' : supplier))
    resetSelection()
  }, [resetSelection])

  const handleGradeToggle = useCallback((grade) => {
    setSelectedGrade((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    )
    resetSelection()
  }, [resetSelection])

  const handleBidStatusToggle = useCallback((statusKey) => {
    setSelectedBidStatus((prev) =>
      prev.includes(statusKey) ? prev.filter((s) => s !== statusKey) : [...prev, statusKey]
    )
    resetSelection()
  }, [resetSelection])

  // 保存配置到本地存储
  useEffect(() => {
    writeVisibleKeys(visibleKeys)
  }, [visibleKeys])

  useEffect(() => {
    writeBidRecords(bidRecords)
  }, [bidRecords])

  useEffect(() => {
    writeFollowedIds(followedIds)
  }, [followedIds])

  const navigate = useNavigate()

  const hasActiveBid = useCallback(
    (id) => checkActiveBid(id, bidRecords, DEFAULT_ITEMS),
    [bidRecords]
  )

  const toggleFollow = useCallback((id) => {
    const followed = !!followedIds[id]
    if (followed && hasActiveBid(id)) {
      message.info('已出价的行不可取消关注')
      return
    }
    setFollowedIds((prev) => {
      const next = { ...prev }
      if (followed) {
        delete next[id]
      } else {
        next[id] = true
      }
      return next
    })
  }, [followedIds, hasActiveBid])

  const handleBatchFollow = useCallback(() => {
    if (!selectedRowKeys.length) {
      message.info('请先选择要关注的行')
      return
    }
    setFollowedIds((prev) => {
      const next = { ...prev }
      selectedRowKeys.forEach((id) => {
        next[id] = true
      })
      return next
    })
    message.success(`已关注 ${selectedRowKeys.length} 条`)
    setSelectedRowKeys([])
  }, [selectedRowKeys])

  const handleBatchUnfollow = useCallback(() => {
    if (!selectedRowKeys.length) {
      message.info('请先选择要取消关注的行')
      return
    }
    const allowed = selectedRowKeys.filter((id) => !hasActiveBid(id))
    const blocked = selectedRowKeys.length - allowed.length
    if (!allowed.length) {
      message.info('已出价的行不可取消关注')
      return
    }
    setFollowedIds((prev) => {
      const next = { ...prev }
      allowed.forEach((id) => {
        delete next[id]
      })
      return next
    })
    if (blocked > 0) {
      message.warning(`有 ${blocked} 条已出价，未取消关注`)
    }
    message.success(`已取消关注 ${allowed.length} 条`)
    setSelectedRowKeys([])
  }, [selectedRowKeys, hasActiveBid])

  // 执行出价保存
  const doSaveBid = useCallback((id, bidAmount, currentIndex) => {
    // 保存出价记录
    setBidRecords((prev) => ({
      ...prev,
      [id]: bidAmount,
    }))
    // 自动关注
    setFollowedIds((prev) => ({
      ...prev,
      [id]: true,
    }))
    // TODO: 调用API提交出价
    message.success(`出价成功！已出价 HK$${bidAmount}`)
    // 清空输入框
    setBidInputs((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    
    // 自动聚焦到下一个输入框
    if (currentIndex !== undefined) {
      setTimeout(() => {
        const allInputs = Array.from(document.querySelectorAll('input[data-bid-input-id]'))
        const currentIdx = allInputs.findIndex(input => input.dataset.bidInputId === String(id))
        if (currentIdx !== -1 && currentIdx < allInputs.length - 1) {
          const nextInput = allInputs[currentIdx + 1]
          nextInput.focus()
          nextInput.select()
        }
      }, 100)
    }
  }, [])

  // 确认出价
  const handleConfirmBid = useCallback(
    (id, bidAmount, currentIndex) => {
      if (!bidAmount || bidAmount <= 0 || bidAmount > 100000) {
        message.warning(bidAmount > 100000 ? '出价金额不能超过 HK$100,000' : '出价金额无效，请输入大于0的数字')
        // 清空无效输入
        setBidInputs((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        return
      }
      // 检查出价是否有变化
      const existingBid = bidRecords[id]
      if (existingBid === bidAmount) {
        message.info('出价金额未变化')
        // 清空输入框并跳转到下一个
        setBidInputs((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        // 跳转到下一个输入框
        if (currentIndex !== undefined) {
          setTimeout(() => {
            const allInputs = Array.from(document.querySelectorAll('input[data-bid-input-id]'))
            const currentIdx = allInputs.findIndex(input => input.dataset.bidInputId === String(id))
            if (currentIdx !== -1 && currentIdx < allInputs.length - 1) {
              const nextInput = allInputs[currentIdx + 1]
              nextInput.focus()
              nextInput.select()
            }
          }, 100)
        }
        return
      }
      
      // 出价超过10000时弹出确认框
      if (bidAmount > 10000) {
        Modal.confirm({
          title: '出价金额较高',
          content: `您的出价为 HK$${bidAmount}，确认提交吗？`,
          okText: '确认出价',
          cancelText: '取消',
          onOk: () => {
            doSaveBid(id, bidAmount, currentIndex)
          },
        })
        return
      }
      
      // 正常保存
      doSaveBid(id, bidAmount, currentIndex)
    },
    [bidRecords, doSaveBid]
  )

  // 取消出价
  const handleCancelBid = useCallback(
    (id) => {
      // 从出价记录中删除
      setBidRecords((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      // 清空输入框
      setBidInputs((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      // TODO: 调用API取消出价
      message.success('已取消出价')
    },
    []
  )

  // 列定义
  const baseColumns = useMemo(
    () => [
      {
        title: '',
        dataIndex: 'follow',
        key: 'follow',
        width: 36,
        align: 'center',
        className: 'follow-column',
        render: (_, record) => {
          const followed = !!followedIds[record.id]
          return (
            <div
              className="follow-btn-wrapper"
              style={{ 
                cursor: 'pointer', 
                fontSize: 16, 
                lineHeight: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%',
                height: '100%'
              }}
              onClick={(e) => {
                e.stopPropagation()
                toggleFollow(record.id)
              }}
            >
              {followed ? (
                <StarFilled style={{ color: '#f59e0b' }} />
              ) : (
                <StarOutlined style={{ color: '#d1d5db' }} />
              )}
            </div>
          )
        },
      },
      {
        title: '行号',
        dataIndex: 'rowNo',
        key: 'rowNo',
        width: 55,
        align: 'center',
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ maxWidth: '100%', display: 'inline-block' }}>
            {text}
          </Text>
        ),
      },
      {
        title: '标单号',
        dataIndex: 'lotNo',
        key: 'lotNo',
        width: 105,
        ellipsis: true,
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ maxWidth: '100%', display: 'inline-block' }}>
            {text}
          </Text>
        ),
      },
      {
        title: '供应商',
        dataIndex: 'supplier',
        key: 'supplier',
        width: 65,
        ellipsis: true,
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ maxWidth: '100%', display: 'inline-block' }}>
            {text}
          </Text>
        ),
      },
      {
        title: '商品',
        dataIndex: 'title',
        key: 'title',
        width: 200,
        ellipsis: true,
        render: (text) => (
          <Space direction="vertical" size={4}>
            <Text
              strong
              ellipsis={{ tooltip: text }}
              style={{ maxWidth: '100%', display: 'inline-block' }}
            >
              {text}
            </Text>
          </Space>
        ),
      },
      {
        title: '品类',
        dataIndex: 'category',
        key: 'category',
        width: 60,
        ellipsis: true,
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ maxWidth: '100%', display: 'inline-block' }}>
            {text}
          </Text>
        ),
      },
      {
        title: '品牌',
        dataIndex: 'brand',
        key: 'brand',
        width: 60,
        ellipsis: true,
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ maxWidth: '100%', display: 'inline-block' }}>
            {text}
          </Text>
        ),
      },
      {
        title: '成色 / 问题',
        dataIndex: 'issue',
        key: 'issue',
        width: 85,
        ellipsis: true,
        render: (_, record) => (
          <Space size="small" wrap>
            {record.grade && <Tag>{record.grade}</Tag>}
            {record.issue && (
              <Text
                type="secondary"
                ellipsis={{ tooltip: record.issue }}
                style={{ maxWidth: '100%', display: 'inline-block' }}
              >
                {record.issue}
              </Text>
            )}
          </Space>
        ),
      },
      {
        title: '数量',
        dataIndex: 'qty',
        key: 'qty',
        width: 55,
        align: 'center',
        render: (qty) => (
          <Text ellipsis={{ tooltip: `${qty}pcs` }} style={{ maxWidth: '100%', display: 'inline-block' }}>
            {qty}pcs
          </Text>
        ),
      },
      {
        title: '已出价',
        dataIndex: 'currentBid',
        key: 'currentBid',
        width: 75,
        align: 'center',
        render: (text) => {
          // 如果出价是 'HK$0'，显示为 '--'
          const displayText = text === 'HK$0' ? '--' : text
          return (
            <Text ellipsis={{ tooltip: displayText }} style={{ maxWidth: '100%', display: 'inline-block' }}>
              {displayText}
            </Text>
          )
        },
      },
      {
        title: '参考价',
        dataIndex: 'price',
        key: 'price',
        width: 70,
        align: 'center',
        render: (text) => (
          <Text ellipsis={{ tooltip: text }} style={{ maxWidth: '100%', display: 'inline-block' }}>
            {text}
          </Text>
        ),
      },
      {
        title: '倒计时',
        dataIndex: 'countdown',
        key: 'countdown',
        width: 65,
        align: 'center',
        render: (text) => (
          <Text
            strong
            ellipsis={{ tooltip: text }}
            style={{ maxWidth: '100%', display: 'inline-block' }}
          >
            {text}
          </Text>
        ),
      },
      {
        title: '出价(单价)',
        key: 'action',
        width: 200,
        fixed: 'right',
        align: 'center',
        render: (_, record, index) => {
          // 获取已出价的值
          const existingBid = bidRecords[record.id]
          const parsedBidFromRecord = parseBidValue(existingBid ?? record.currentBid)

          // 输入框的值：只显示用户本次输入的值
          const inputValue = bidInputs[record.id]

          // 判断是否已出价（必须是有效的正数）
          const hasBid = Boolean(parsedBidFromRecord)
          
          // placeholder：显示历史出价或默认提示
          const placeholderText = hasBid ? String(parsedBidFromRecord) : '输入出价'

          return (
            <Space size={8} style={{ width: '100%', justifyContent: 'center' }}>
              <InputNumber
                size="small"
                controls={false}
                style={{ width: 80 }}
                placeholder={placeholderText}
                value={inputValue}
                data-bid-input-id={record.id}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => {
                  e.stopPropagation()
                }}
                onChange={(val) =>
                  setBidInputs((prev) => ({ ...prev, [record.id]: val }))
                }
                onKeyDown={(e) => {
                  // 上下键在出价框之间快速移动
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    e.stopPropagation()
                    // 清空当前输入框的未提交内容
                    setBidInputs((prev) => {
                      const next = { ...prev }
                      delete next[record.id]
                      return next
                    })
                    const allInputs = Array.from(document.querySelectorAll('input[data-bid-input-id]'))
                    const currentIdx = allInputs.findIndex(input => input.dataset.bidInputId === String(record.id))
                    const targetIdx = e.key === 'ArrowUp' ? currentIdx - 1 : currentIdx + 1
                    if (targetIdx >= 0 && targetIdx < allInputs.length) {
                      const targetInput = allInputs[targetIdx]
                      targetInput.focus()
                      setTimeout(() => targetInput.select?.(), 0)
                    }
                  }
                  // Escape键取消编辑，清空输入框
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    e.stopPropagation()
                    setBidInputs((prev) => {
                      const next = { ...prev }
                      delete next[record.id]
                      return next
                    })
                    e.target.blur()
                  }
                }}
                onPressEnter={(e) => {
                  e.stopPropagation()
                  const value = bidInputs[record.id]
                  if (value === undefined || value === null) {
                    message.warning('请输入出价金额')
                    return
                  }
                  if (value <= 0) {
                    message.warning('出价金额无效，请输入大于0的数字')
                    // 清空无效输入
                    setBidInputs((prev) => {
                      const next = { ...prev }
                      delete next[record.id]
                      return next
                    })
                    return
                  }
                  handleConfirmBid(record.id, value, index)
                }}
                autoFocus={false}
              />
              <Button
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  const value = bidInputs[record.id]
                  if (value === undefined || value === null) {
                    message.warning('请输入出价金额')
                    return
                  }
                  handleConfirmBid(record.id, value, index)
                }}
              >
                确认
              </Button>
              <Popconfirm
                title="确认取消出价？"
                description="取消后可重新输入出价"
                onConfirm={(e) => {
                  e?.stopPropagation()
                  handleCancelBid(record.id)
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText="确认"
                cancelText="放弃"
                disabled={!hasBid}
              >
                <Button
                  size="small"
                  style={{ 
                    color: '#666',
                    borderColor: '#d9d9d9',
                    visibility: hasBid ? 'visible' : 'hidden',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  取消
                </Button>
              </Popconfirm>
            </Space>
          )
        },
      },
    ],
    [bidInputs, bidRecords, handleConfirmBid, handleCancelBid, followedIds, toggleFollow]
  )

  // 合并出价记录到商品数据
  const itemsWithBids = useMemo(() => {
    return DEFAULT_ITEMS.map((item) => {
      const merged = mergeBidToItem(item, bidRecords)
      return {
        ...merged,
        currentBid: merged.currentBid,
        followed: !!followedIds[item.id],
      }
    })
  }, [bidRecords, followedIds])

  const {
    searchFiltered,
    advancedFiltered,
    supplierFiltered,
    filteredData,
    followFilteredData,
    availableGrades,
    supplierCounts,
    supplierQtyCounts,
    gradeCounts,
    gradeQtyCounts,
    bidStatusCounts,
    bidStatusQtyCounts,
  } = useAuctionFilters({
    itemsWithBids,
    keyword: deferredKeyword,
    selectedSupplier,
    selectedGrade,
    selectedBidStatus,
    followOnly,
    followedIds,
    followedIdsSnapshot,
    advancedConditions,
    advancedSearchEnabled: advancedSearchExpanded,
  })

  // 计算统计数据
  const totalLots = followOnly ? followFilteredData.length : filteredData.length
  const selectedLogo = selectedSupplier ? SUPPLIER_LOGO[selectedSupplier] : null

  // 行点击处理
  const handleRowClick = useCallback(
    (record) => {
      navigate(`/detail/${record.id}`)
    },
    [navigate]
  )

  // 列配置选项
  const columnOptions = useMemo(
    () =>
      baseColumns
        .filter((c) => c.key !== 'follow')
        .map((c) => ({ label: c.title, value: c.key })),
    [baseColumns]
  )

  // 过滤后的列配置
  const columns = useMemo(
    () =>
      baseColumns.filter((c) => {
        if (c.key === 'title' || c.key === 'follow') return true // 商品列必选，关注列固定显示
        return visibleKeys.includes(c.key)
      }),
    [baseColumns, visibleKeys]
  )

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: setSelectedRowKeys,
      columnWidth: 36,
    }),
    [selectedRowKeys],
  )

  // 获取行的类名，用于区分已出价和未出价，以及已取消关注的行
  const getRowClassName = useCallback((record) => {
    const bidClass = isBidValue(record.currentBid) ? 'row-bid' : 'row-no-bid'
    // 在只看关注模式下，检查是否已取消关注（在快照中但不在当前 followedIds 中）
    if (followOnly && followedIdsSnapshot && followedIdsSnapshot[record.id] && !followedIds[record.id]) {
      return `${bidClass} row-unfollowed`
    }
    return bidClass
  }, [followOnly, followedIdsSnapshot, followedIds])

  return (
    <Layout className="page">
      <Header className="header">
        <PageHeader
          totalLots={totalLots}
          selectedSupplier={selectedSupplier}
          selectedLogo={selectedLogo}
        />
      </Header>

      <Content className="content">
        <div className="content-inner">
          <div className="layout-body">
            <div className="filter-panel">
              <div className="filter-group">
                <Text className="filter-group-title">
                  供应商
                  <Text type="secondary" style={{ marginLeft: 10, fontWeight: 'normal', fontSize: '13px' }}>
                    <span style={{ color: '#0f6ad8', fontWeight: 600 }}>{searchFiltered.length}</span>
                    <span style={{ margin: '0 4px', color: '#9ca3af' }}>/</span>
                    <span style={{ color: '#0f6ad8', fontWeight: 600 }}>{calculateTotalQty(searchFiltered)}</span>
                    <span style={{ marginLeft: 2, color: '#6b7280' }}>pcs</span>
                  </Text>
                </Text>
                <div className="filter-options">
                  {SUPPLIERS.map((supplier) => (
                    <div
                      key={supplier}
                      className={`filter-option ${selectedSupplier === supplier ? 'active' : ''}`}
                      onClick={() => handleSupplierChange(supplier)}
                    >
                      <span className="filter-option-label">{supplier}</span>
                      <span className="filter-option-count">
                        <span style={{ fontWeight: 600 }}>{supplierCounts[supplier] || 0}</span>
                        <span style={{ margin: '0 4px', opacity: 0.5 }}>/</span>
                        <span style={{ fontWeight: 600 }}>{supplierQtyCounts[supplier] || 0}</span>
                        <span style={{ marginLeft: 4 }}>pcs</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="filter-group" style={{ marginTop: 24 }}>
                <Text className="filter-group-title">
                  成色
                  <Text type="secondary" style={{ marginLeft: 10, fontWeight: 'normal', fontSize: '13px' }}>
                    <span style={{ color: '#0f6ad8', fontWeight: 600 }}>{supplierFiltered.length}</span>
                    <span style={{ margin: '0 4px', color: '#9ca3af' }}>/</span>
                    <span style={{ color: '#0f6ad8', fontWeight: 600 }}>{calculateTotalQty(supplierFiltered)}</span>
                    <span style={{ marginLeft: 2, color: '#6b7280' }}>pcs</span>
                  </Text>
                </Text>
                <div className="filter-options">
                  {availableGrades.map((grade) => (
                    <div
                      key={grade}
                      className={`filter-option ${selectedGrade.includes(grade) ? 'active' : ''}`}
                      onClick={() => handleGradeToggle(grade)}
                    >
                      <span className="filter-option-label">{grade}</span>
                      <span className="filter-option-count">
                        <span style={{ fontWeight: 600 }}>{gradeCounts[grade] || 0}</span>
                        <span style={{ margin: '0 4px', opacity: 0.5 }}>/</span>
                        <span style={{ fontWeight: 600 }}>{gradeQtyCounts[grade] || 0}</span>
                        <span style={{ marginLeft: 4 }}>pcs</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="filter-group" style={{ marginTop: 24 }}>
                <Text className="filter-group-title">
                  出价状态
                  <Text type="secondary" style={{ marginLeft: 10, fontWeight: 'normal', fontSize: '13px' }}>
                    <span style={{ color: '#0f6ad8', fontWeight: 600 }}>{bidStatusCounts.all}</span>
                    <span style={{ margin: '0 4px', color: '#9ca3af' }}>/</span>
                    <span style={{ color: '#0f6ad8', fontWeight: 600 }}>{bidStatusQtyCounts.all}</span>
                    <span style={{ marginLeft: 2, color: '#6b7280' }}>pcs</span>
                  </Text>
                </Text>
                <div className="filter-options">
                  {BID_STATUS_OPTIONS.map((status) => (
                    <div
                      key={status.key}
                      className={`filter-option ${selectedBidStatus.includes(status.key) ? 'active' : ''}`}
                      onClick={() => handleBidStatusToggle(status.key)}
                    >
                      <span className="filter-option-label">{status.label}</span>
                      <span className="filter-option-count">
                        <span style={{ fontWeight: 600 }}>{bidStatusCounts[status.key] || 0}</span>
                        <span style={{ margin: '0 4px', opacity: 0.5 }}>/</span>
                        <span style={{ fontWeight: 600 }}>{bidStatusQtyCounts[status.key] || 0}</span>
                        <span style={{ marginLeft: 4 }}>pcs</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="table-panel">
              <TableToolbar
                keyword={keyword}
                onKeywordChange={handleKeywordChange}
                visibleKeys={visibleKeys}
                onVisibleKeysChange={handleVisibleKeysChange}
                columnOptions={columnOptions}
                selectedCount={selectedRowKeys.length}
                onBatchFollow={handleBatchFollow}
                onBatchUnfollow={handleBatchUnfollow}
                followOnly={followOnly}
                onFollowOnlyChange={handleFollowOnlyChange}
                followCount={followFilteredData.length}
                onRefreshFollowList={handleRefreshFollowList}
                hasUnfollowedItems={followOnly && followedIdsSnapshot && 
                  Object.keys(followedIdsSnapshot).some(id => followedIdsSnapshot[id] && !followedIds[id])}
                advancedSearchExpanded={advancedSearchExpanded}
                advancedConditions={advancedConditions}
                onAdvancedConditionsChange={setAdvancedConditions}
                availableGrades={availableGrades}
                advancedMatchCount={advancedSearchExpanded ? advancedFiltered.length : undefined}
                hasActiveConditions={hasActiveConditions}
                savedSearches={savedSearches}
                activeSearchId={activeSearchId}
                onLoadSavedSearch={handleLoadSavedSearch}
                onDeleteSavedSearch={deleteSavedSearch}
                onSaveCurrentSearch={saveCurrentSearch}
                onAdvancedSearchClose={closeAdvancedSearch}
                onInitNewSearch={handleInitNewSearch}
                isAdvancedSearchDirty={isAdvancedSearchDirty}
              />

              <ResizableTable
                columns={columns}
                dataSource={followFilteredData}
                onRowClick={handleRowClick}
                rowSelection={rowSelection}
                getRowClassName={getRowClassName}
              />
            </div>
          </div>
        </div>
      </Content>
      <FloatButton.BackTop 
        visibilityHeight={300}
        style={{ right: 24, bottom: 24 }}
      />
    </Layout>
  )
}

export default ListPage
