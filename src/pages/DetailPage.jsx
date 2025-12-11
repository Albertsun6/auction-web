import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Typography, Space, Tag, Button, InputNumber, Divider, Card, Descriptions, message, Table } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import PageHeader from '../components/PageHeader'
import { DEFAULT_ITEMS, STORAGE_KEYS } from '../constants'
import { getStorage, setStorage } from '../utils/storage'
import { mergeBidToItem, formatBidValue, isBidValue } from '../utils/bidStatus'
import './DetailPage.css'

const { Header, Content } = Layout
const { Title, Text } = Typography

/**
 * 商品详情页组件
 * 展示商品的详细信息，不包含图片
 */
export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bidRecords, setBidRecords] = useState(() => getStorage(STORAGE_KEYS.BID_RECORDS, {}))
  const [bidAmount, setBidAmount] = useState(null)
  
  // 根据出价记录获取商品信息
  const item = useMemo(() => {
    const baseItem = DEFAULT_ITEMS.find((entry) => entry.id === Number(id))
    if (!baseItem) return null

    const merged = mergeBidToItem(baseItem, bidRecords)
    return {
      ...merged,
      currentBid: formatBidValue(merged.currentBid),
    }
  }, [id, bidRecords])

  // 生成模拟的 items 子项目数据
  const itemsList = useMemo(() => {
    if (!item) return []
    // 根据商品 qty 数量生成对应数量的子项目
    return Array.from({ length: item.qty }, (_, idx) => ({
      key: idx + 1,
      id: `${item.lotNo}-ITEM-${String(idx + 1).padStart(2, '0')}`,
      sku: `SKU-${item.brand?.substring(0, 3).toUpperCase() || 'UNK'}-${String(item.id).padStart(4, '0')}-${String(idx + 1).padStart(2, '0')}`,
      quantity: 1,
      referencePrice: `HK$${(Math.floor(Math.random() * 500) + 100).toLocaleString()}`,
    }))
  }, [item])

  // Items 列表表格列配置
  const itemsColumns = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: 180,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 200,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: '参考价格',
      dataIndex: 'referencePrice',
      key: 'referencePrice',
      width: 120,
      align: 'right',
    },
  ]

  const hasBid = item ? isBidValue(item.currentBid) : false

  // 如果商品不存在，显示错误信息
  if (!item) {
    return (
      <Layout className="page">
        <Header className="header">
          <PageHeader
            title="双标(BJ008XA)"
            onBack={() => navigate(-1)}
            onSearch={() => {}}
            onMore={() => {}}
          />
        </Header>
        <Content className="content">
          <div className="content-inner">
            <Card>
              <Text type="danger">商品不存在或已被删除</Text>
            </Card>
          </div>
        </Content>
      </Layout>
    )
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleConfirmBid = () => {
    if (!bidAmount || bidAmount <= 0 || bidAmount > 100000) {
      message.warning(bidAmount > 100000 ? '出价金额不能超过 HK$100,000' : '出价金额无效，请输入大于0的数字')
      setBidAmount(null) // 清空无效输入
      return
    }
    if (!item) return
    
    // 检查出价是否有变化
    const existingBid = bidRecords[item.id]
    if (existingBid === bidAmount) {
      message.info('出价金额未变化')
      return
    }
    
    // 保存出价记录
    const newBidRecords = {
      ...bidRecords,
      [item.id]: bidAmount,
    }
    setBidRecords(newBidRecords)
    setStorage(STORAGE_KEYS.BID_RECORDS, newBidRecords)
    // TODO: 调用API提交出价
    // 出价记录已保存到本地存储，等待对接后端API
    message.success('出价成功！')
    // 清空输入框
    setBidAmount(null)
  }

  const handleCancelBid = () => {
    if (!item) return
    
    // 从出价记录中删除
    const newBidRecords = { ...bidRecords }
    delete newBidRecords[item.id]
    setBidRecords(newBidRecords)
    setStorage(STORAGE_KEYS.BID_RECORDS, newBidRecords)
    // TODO: 调用API取消出价
    message.success('已取消出价')
    // 清空输入框
    setBidAmount(null)
  }

  return (
    <Layout className="page">
      <Header className="header">
        <PageHeader
          title="双标(BJ008XA)"
          onBack={handleBack}
          onSearch={() => {}}
          onMore={() => {}}
        />
      </Header>

      <Content className="content">
        <div className="content-inner detail-page">
          <div className="detail-header">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ marginBottom: 16 }}
            >
              返回列表
            </Button>
            <Title level={2} className="detail-title">
              {item.title}
            </Title>
          </div>

          <div className="detail-content">
            <Card className="detail-card" title="基本信息">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="行号">{item.rowNo}</Descriptions.Item>
                <Descriptions.Item label="标单号">{item.lotNo}</Descriptions.Item>
                <Descriptions.Item label="供应商">
                  <Tag color="blue">{item.supplier}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="品牌">{item.brand}</Descriptions.Item>
                <Descriptions.Item label="品类">{item.category}</Descriptions.Item>
                {item.grade && (
                  <Descriptions.Item label="成色">
                    <Tag>{item.grade}</Tag>
                  </Descriptions.Item>
                )}
                {item.issue && (
                  <Descriptions.Item label="问题">
                    <Text type="secondary">{item.issue}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="数量">{item.qty} pcs</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="detail-card" title="拍卖信息">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className="bid-info-item">
                  <Text type="secondary">当前出价</Text>
                  <Text strong style={{ fontSize: 20 }}>
                  {hasBid ? item.currentBid : '--'}
                  </Text>
                </div>

                <Divider />

                <div className="bid-input-section">
                  <Text strong style={{ marginBottom: 8, display: 'block' }}>
                    您的最高出价
                  </Text>
                  <Space.Compact style={{ width: '100%' }}>
                    <InputNumber
                      controls={false}
                      style={{ width: '50%' }}
                      placeholder="输入出价金额"
                      addonBefore="HK$"
                      value={bidAmount}
                      onChange={setBidAmount}
                    />
                    <Button type="primary" style={{ width: '25%' }} onClick={handleConfirmBid}>
                      确认出价
                    </Button>
                    <Button 
                      danger 
                      style={{ width: '25%', visibility: hasBid ? 'visible' : 'hidden' }} 
                      onClick={handleCancelBid}
                    >
                      取消出价
                    </Button>
                  </Space.Compact>
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                    请输入有效的出价金额
                  </Text>
                </div>

                <Divider />

                <div className="bid-info-item">
                  <Text type="secondary">参考价</Text>
                  <Text>{item.price}</Text>
                </div>

                <div className="bid-info-item">
                  <Text type="secondary">平均每件成本</Text>
                  <Text>
                    {item.price !== 'HK$--'
                      ? `HK$${(
                          parseFloat(item.price.replace('HK$', '').replace(',', '')) / item.qty
                        ).toFixed(2)}`
                      : '--'}
                  </Text>
                </div>

                <Divider />

                <div className="bid-info-item">
                  <Text type="secondary">剩余时间</Text>
                  <Text strong style={{ color: '#ff4d4f' }}>
                    {item.countdown}
                  </Text>
                </div>
              </Space>
            </Card>
          </div>

          {/* Items 列表 */}
          <Card className="detail-card items-card" title={`商品明细 (${itemsList.length} 件)`} style={{ marginTop: 24 }}>
            <Table
              columns={itemsColumns}
              dataSource={itemsList}
              pagination={false}
              size="middle"
              bordered
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  )
}

