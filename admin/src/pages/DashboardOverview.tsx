import { useEffect, useState } from 'react';
import { Card, Col, Empty, Row, Space, Statistic, Table, Tag, Typography, message } from 'antd';
import { fetchDashboard } from '../services/api';
import type { AdminDashboard } from '../types';

export const DashboardOverview = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchDashboard()
      .then(setDashboard)
      .catch((err) => messageApi.error(err.message))
      .finally(() => setLoading(false));
  }, [messageApi]);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {contextHolder}
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="专题数量" value={dashboard?.stats.totalAlbums ?? 0} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="作品数量" value={dashboard?.stats.totalPhotos ?? 0} suffix="张" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="收录故事" value={dashboard?.stats.totalStories ?? 0} suffix="篇" />
          </Card>
        </Col>
      </Row>

      <Card title="最近上传" loading={loading}>
        {!dashboard?.recentUploads.length && !loading ? (
          <Empty description="暂无上传记录" />
        ) : (
          <Table
            rowKey="id"
            dataSource={dashboard?.recentUploads ?? []}
            pagination={false}
            columns={[
              { title: '标题', dataIndex: 'title' },
              { title: '拍摄时间', dataIndex: 'capturedAt', render: (value: string) => (value ? new Date(value).toLocaleString() : '—') },
              { title: '相机', dataIndex: 'camera' },
              { title: '地点', dataIndex: 'location' },
              {
                title: '标签',
                dataIndex: 'tags',
                render: (tags: string[]) => (
                  <Space wrap>
                    {(tags ?? []).map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                )
              }
            ]}
          />
        )}
      </Card>

      <Card title="焦点专题" loading={loading}>
        {!dashboard?.highlightedAlbums.length && !loading ? (
          <Empty description="暂无焦点专题" />
        ) : (
          <Table
            rowKey="slug"
            dataSource={dashboard?.highlightedAlbums ?? []}
            pagination={false}
            columns={[
              { title: '专题', dataIndex: 'name' },
              {
                title: '作品数量',
                render: (_, record) => record.stats?.totalPhotos ?? 0
              },
              {
                title: '精选作品',
                render: (_, record) => record.stats?.totalFavorites ?? 0
              }
            ]}
          />
        )}
      </Card>

      {dashboard && (
        <Typography.Text type="secondary">数据更新于：{new Date(dashboard.stats.updatedAt).toLocaleString()}</Typography.Text>
      )}
    </Space>
  );
};
