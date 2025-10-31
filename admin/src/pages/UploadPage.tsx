import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Space, Table, Tag, message } from 'antd';
import { triggerUploadProcessing } from '../services/api';
import type { PhotoAsset } from '../types';

export const UploadPage = () => {
  const [form] = Form.useForm();
  const [records, setRecords] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleProcess = async () => {
    try {
      const { objectKey } = await form.validateFields();
      setLoading(true);
      const metadata = await triggerUploadProcessing(objectKey);
      setRecords((prev) => [metadata, ...prev]);
      messageApi.success('处理完成，缩略图与 EXIF 信息已生成');
      form.resetFields();
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {contextHolder}
      <Card title="上传处理" extra={<Tag color="blue">OSS / 本地</Tag>}>
        <Alert
          type="info"
          message="将原图上传至 photos/ 目录后，输入 objectKey 触发缩略图生成，可在本地或云端运行。"
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="inline" onFinish={handleProcess}>
          <Form.Item
            label="对象路径"
            name="objectKey"
            rules={[{ required: true, message: '请提供 objectKey，例如 photos/2024/IMG_0001.CR3' }]}
            style={{ flex: 1 }}
          >
            <Input style={{ minWidth: 360 }} placeholder="photos/2024/IMG_0001.CR3" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              生成缩略图
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="处理记录">
        <Table
          rowKey="id"
          dataSource={records}
          columns={[
            { title: '标题', dataIndex: 'title', key: 'title' },
            { title: '尺寸', key: 'size', render: (_, record) => `${record.width}×${record.height}` },
            { title: '相机', dataIndex: 'camera', key: 'camera' },
            { title: '镜头', dataIndex: 'lens', key: 'lens' },
            { title: 'ISO', dataIndex: 'iso', key: 'iso' },
            { title: '光圈', dataIndex: 'aperture', key: 'aperture' },
            { title: '快门', dataIndex: 'shutter', key: 'shutter' },
            {
              title: '标签',
              key: 'tags',
              render: (_, record) => (
                <Space wrap>
                  {(record.tags ?? []).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              )
            }
          ]}
        />
      </Card>
    </Space>
  );
};
