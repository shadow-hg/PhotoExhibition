import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Form, Input, List, Modal, Space, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminConfig } from '../hooks/useAdminConfig';
import type { GalleryGroup, PhotoMetadata } from '../types';

interface GroupEditorProps {
  group: GalleryGroup;
  onChange: (group: GalleryGroup) => void;
}

const GroupEditor = ({ group, onChange }: GroupEditorProps) => {
  const [form] = Form.useForm<GalleryGroup>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(group);
    }
  }, [visible, group, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onChange({ ...group, ...values });
      setVisible(false);
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <>
      <Button onClick={() => setVisible(true)} type="text">
        编辑
      </Button>
      <Modal
        title="编辑分组"
        open={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={group}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Slug" name="slug">
            <Input placeholder="gallery-2024" />
          </Form.Item>
          <Form.Item label="封面" name="cover">
            <Input placeholder="https://example.com/cover.jpg" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export const GalleryManager = () => {
  const { config, loading, error, save, setConfig } = useAdminConfig();
  const [messageApi, contextHolder] = message.useMessage();

  const groups = useMemo(() => config?.gallery ?? [], [config]);

  const handleSave = async () => {
    if (!config) return;
    try {
      await save({ ...config, updatedAt: new Date().toISOString() });
      messageApi.success('配置已保存');
    } catch (err) {
      messageApi.error((err as Error).message);
    }
  };

  const handleAddGroup = () => {
    if (!config) return;
    const next: GalleryGroup = {
      name: `未命名分组${config.gallery.length + 1}`,
      slug: `group-${Date.now()}`,
      photos: []
    };
    setConfig({ ...config, gallery: [...config.gallery, next] });
  };

  if (loading) {
    return <Card loading title="加载配置" />;
  }

  if (error) {
    return <Card title="错误">{error}</Card>;
  }

  if (!config) {
    return <Empty description="暂无配置" />;
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {contextHolder}
      <Card
        title="站点信息"
        extra={
          <Button type="primary" onClick={handleSave}>
            保存配置
          </Button>
        }
      >
        <Form
          layout="vertical"
          initialValues={config}
          onValuesChange={(_, values) => setConfig({ ...config, ...values })}
        >
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="副标题" name="subtitle">
            <Input />
          </Form.Item>
          <Form.Item label="下载配置" name={['actions', 'download']}>
            <Input placeholder="oss://bucket/path/to/archive.zip 或 https://" />
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="分组列表"
        extra={
          <Button icon={<PlusOutlined />} onClick={handleAddGroup}>
            新增分组
          </Button>
        }
      >
        <List
          dataSource={groups}
          grid={{ gutter: 16, column: 2 }}
          renderItem={(group, index) => (
            <List.Item>
              <Card
                title={group.name}
                extra={
                  <GroupEditor
                    group={group}
                    onChange={(next) => {
                      const updated = [...config.gallery];
                      updated.splice(index, 1, next);
                      setConfig({ ...config, gallery: updated });
                    }}
                  />
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>Slug:</strong> {group.slug ?? '未设置'}
                  </div>
                  <div>
                    <strong>描述:</strong> {group.description ?? '—'}
                  </div>
                  <Space wrap>
                    {group.photos.map((photo: PhotoMetadata) => (
                      <Tag key={photo.id}>{photo.title}</Tag>
                    ))}
                  </Space>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
};
