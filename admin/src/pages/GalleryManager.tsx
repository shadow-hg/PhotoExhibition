import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Space,
  Tag,
  message,
  Typography,
  Divider
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminConfig } from '../hooks/useAdminConfig';
import type { Album, SiteManifest } from '../types';

const TagsInput = ({ value, onChange, placeholder }: { value?: string[]; onChange?: (value: string[]) => void; placeholder?: string }) => (
  <Input
    value={(value ?? []).join(', ')}
    onChange={(event) => onChange?.(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
    placeholder={placeholder}
  />
);

interface AlbumEditorProps {
  album: Album;
  onChange: (album: Album) => void;
}

const AlbumEditor = ({ album, onChange }: AlbumEditorProps) => {
  const [form] = Form.useForm<Album>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...album,
        tags: album.tags ?? [],
        cameras: album.cameras ?? [],
        lenses: album.lenses ?? []
      });
    }
  }, [visible, album, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onChange({ ...album, ...values });
      setVisible(false);
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <>
      <Button onClick={() => setVisible(true)} type="link">
        编辑
      </Button>
      <Modal title={`编辑专题：${album.name}`} open={visible} onOk={handleOk} onCancel={() => setVisible(false)} width={720} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={album}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入专题名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Slug" name="slug" rules={[{ required: true, message: '请输入 slug' }]}>
            <Input placeholder="urban-poetry" />
          </Form.Item>
          <Form.Item label="副标题" name="subtitle">
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="拍摄地点" name="location">
            <Input />
          </Form.Item>
          <Form.Item label="封面图片" name={['cover', 'image']} rules={[{ required: true, message: '请输入封面图片地址' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="主题标签" name="tags">
            <TagsInput placeholder="以逗号分隔，例：city, night" />
          </Form.Item>
          <Form.Item label="使用设备" name="cameras">
            <TagsInput placeholder="Leica Q3, Sony A7" />
          </Form.Item>
          <Form.Item label="镜头信息" name="lenses">
            <TagsInput placeholder="24-70mm f/2.8" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const TimelineEditor = ({
  manifest,
  onChange
}: {
  manifest: SiteManifest;
  onChange: (timeline: NonNullable<SiteManifest['timeline']>) => void;
}) => {
  const [form] = Form.useForm<{ index?: number; entry: NonNullable<SiteManifest['timeline']>[number] }>();
  const [visible, setVisible] = useState(false);

  const handleEdit = (index?: number) => {
    if (typeof index === 'number' && manifest.timeline) {
      form.setFieldsValue({ index, entry: manifest.timeline[index] });
    } else {
      form.resetFields();
    }
    setVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const entry = values.entry;
      const next = [...(manifest.timeline ?? [])];
      if (typeof values.index === 'number') {
        next.splice(values.index, 1, entry);
      } else {
        next.push({ ...entry, id: entry.id || `timeline-${Date.now()}` });
      }
      onChange(next);
      setVisible(false);
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <Card
      title="项目年表"
      extra={
        <Button icon={<PlusOutlined />} onClick={() => handleEdit()}>
          新增事件
        </Button>
      }
    >
      <List
        dataSource={manifest.timeline ?? []}
        locale={{ emptyText: '暂无年表记录' }}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <Button key="edit" type="link" onClick={() => handleEdit(index)}>
                编辑
              </Button>,
              <Button
                key="remove"
                danger
                type="link"
                onClick={() => {
                  const next = [...(manifest.timeline ?? [])];
                  next.splice(index, 1);
                  onChange(next);
                }}
              >
                删除
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <Space direction="vertical">
                  <Typography.Text strong>{item.title}</Typography.Text>
                  <Typography.Text type="secondary">{new Date(item.date).toLocaleDateString()}</Typography.Text>
                </Space>
              }
              description={
                <Space direction="vertical">
                  {item.album && <Tag color="blue">关联专题：{item.album}</Tag>}
                  <Typography.Paragraph type="secondary">{item.description}</Typography.Paragraph>
                </Space>
              }
            />
          </List.Item>
        )}
      />
      <Modal title="编辑年表事件" open={visible} onOk={handleSubmit} onCancel={() => setVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ entry: { id: '', title: '', date: new Date().toISOString() } }}>
          <Form.Item name="index" hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item label="事件 ID" name={['entry', 'id']} rules={[{ required: true, message: '请输入事件 ID' }]}>
            <Input placeholder="2024-exhibition" />
          </Form.Item>
          <Form.Item label="标题" name={['entry', 'title']} rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="发生时间" name={['entry', 'date']} rules={[{ required: true, message: '请输入日期' }]}>
            <Input placeholder="2024-04-12" />
          </Form.Item>
          <Form.Item label="描述" name={['entry', 'description']}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="关联专题 slug" name={['entry', 'album']}>
            <Input placeholder="urban-poetry" />
          </Form.Item>
          <Form.Item label="封面图片" name={['entry', 'cover']}>
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export const GalleryManager = () => {
  const { manifest, loading, error, save, setManifest } = useAdminConfig();
  const [messageApi, contextHolder] = message.useMessage();

  const albums = useMemo(() => manifest?.albums ?? [], [manifest]);

  const handleSave = async () => {
    if (!manifest) return;
    try {
      await save({ ...manifest, updatedAt: new Date().toISOString() });
      messageApi.success('配置已保存');
    } catch (err) {
      messageApi.error((err as Error).message);
    }
  };

  const handleAddAlbum = () => {
    if (!manifest) return;
    const next: Album = {
      slug: `album-${Date.now()}`,
      name: '未命名专题',
      cover: { image: '' },
      photos: []
    };
    setManifest({ ...manifest, albums: [...manifest.albums, next] });
  };

  if (loading) {
    return <Card loading title="加载配置" />;
  }

  if (error) {
    return <Card title="错误">{error}</Card>;
  }

  if (!manifest) {
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
          initialValues={manifest.site}
          onValuesChange={(_, values) =>
            setManifest({
              ...manifest,
              site: { ...manifest.site, ...values }
            })
          }
        >
          <Form.Item label="站点标题" name="title" rules={[{ required: true, message: '请输入站点标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="副标题" name="subtitle">
            <Input />
          </Form.Item>
          <Form.Item label="站点简介" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Divider orientation="left">首页横幅</Divider>
          <Form.Item label="主标题" name={['hero', 'title']} rules={[{ required: true, message: '请输入主标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Tagline" name={['hero', 'tagline']}>
            <Input />
          </Form.Item>
          <Form.Item label="横幅描述" name={['hero', 'description']}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="背景图片" name={['hero', 'backgroundImage']} rules={[{ required: true, message: '请输入背景图片地址' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="亮点文案" name={['hero', 'highlight']}>
            <Input />
          </Form.Item>
        </Form>
      </Card>

      <Card title="站点动作">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form
            layout="vertical"
            initialValues={manifest.actions}
            onValuesChange={(_, values) =>
              setManifest({
                ...manifest,
                actions: { ...manifest.actions, ...values }
              })
            }
          >
            <Divider orientation="left">主要行动按钮</Divider>
            <Form.Item label="按钮文本" name={['primary', 'label']}>
              <Input placeholder="预约线下观展" />
            </Form.Item>
            <Form.Item label="链接" name={['primary', 'href']}>
              <Input placeholder="https://" />
            </Form.Item>
            <Divider orientation="left">辅助行动</Divider>
            <Form.Item label="按钮文本" name={['secondary', 'label']}>
              <Input />
            </Form.Item>
            <Form.Item label="链接" name={['secondary', 'href']}>
              <Input />
            </Form.Item>
            <Divider orientation="left">下载入口</Divider>
            <Form.Item label="按钮文本" name={['download', 'label']}>
              <Input />
            </Form.Item>
            <Form.Item label="下载地址" name={['download', 'href']}>
              <Input placeholder="oss:// 或 https://" />
            </Form.Item>
            <Form.Item label="描述" name={['download', 'description']}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        </Space>
      </Card>

      <Card
        title="专题列表"
        extra={
          <Button icon={<PlusOutlined />} onClick={handleAddAlbum}>
            新增专题
          </Button>
        }
      >
        <List
          dataSource={albums}
          grid={{ gutter: 16, column: 2 }}
          renderItem={(album, index) => (
            <List.Item>
              <Card
                title={album.name}
                extra={
                  <AlbumEditor
                    album={album}
                    onChange={(next) => {
                      const updated = [...manifest.albums];
                      updated.splice(index, 1, next);
                      setManifest({ ...manifest, albums: updated });
                    }}
                  />
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Typography.Text type="secondary">Slug：{album.slug}</Typography.Text>
                  <Typography.Paragraph ellipsis={{ rows: 3 }}>{album.description || '暂无描述'}</Typography.Paragraph>
                  <Space wrap>
                    {(album.tags ?? []).map((tag) => (
                      <Tag key={tag}>#{tag}</Tag>
                    ))}
                  </Space>
                  <Typography.Text type="secondary">作品数量：{album.photos.length}</Typography.Text>
                  <Space>
                    <Button
                      danger
                      type="link"
                      onClick={() => {
                        const updated = [...manifest.albums];
                        updated.splice(index, 1);
                        setManifest({ ...manifest, albums: updated });
                      }}
                    >
                      删除专题
                    </Button>
                  </Space>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <TimelineEditor
        manifest={manifest}
        onChange={(timeline) => setManifest({ ...manifest, timeline })}
      />
    </Space>
  );
};
