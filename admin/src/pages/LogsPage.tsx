import { useEffect, useState } from 'react';
import { Card, Empty, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { fetchLogs } from '../services/api';
import type { LogEntry } from '../types';

export const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchLogs()
      .then(setLogs)
      .catch((err) => messageApi.error(err.message))
      .finally(() => setLoading(false));
  }, [messageApi]);

  return (
    <>
      {contextHolder}
      <Card title="访问日志" loading={loading}>
        {logs.length === 0 && !loading ? (
          <Empty description="暂无访问记录" />
        ) : (
          <Table
            rowKey={(record) => `${record.timestamp}-${record.ip ?? 'unknown'}`}
            dataSource={logs}
            pagination={{ pageSize: 20 }}
            columns={[
              {
                title: '时间',
                dataIndex: 'timestamp',
                render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
              {
                title: '页面',
                dataIndex: 'page',
                render: (value: string) => <Tag color="blue">{value}</Tag>
              },
              {
                title: 'IP',
                dataIndex: 'ip',
                render: (value: string) => value ?? '未知'
              },
              {
                title: 'User-Agent',
                dataIndex: 'userAgent',
                render: (value: string) => (
                  <Typography.Paragraph style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                    {value}
                  </Typography.Paragraph>
                )
              }
            ]}
          />
        )}
      </Card>
    </>
  );
};
