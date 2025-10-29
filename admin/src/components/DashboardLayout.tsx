import { useState } from 'react';
import { Layout, Menu, Typography, Input, Space, message } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  PictureOutlined,
  UploadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { setAdminToken } from '../services/api';

const { Header, Sider, Content } = Layout;

const items = [
  { key: 'gallery', icon: <PictureOutlined />, label: '图库管理' },
  { key: 'upload', icon: <UploadOutlined />, label: '上传处理' },
  { key: 'logs', icon: <BarChartOutlined />, label: '访问日志' }
];

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>((): string => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('admin-token') ?? '';
  });
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Sider theme="dark" breakpoint="lg">
        <div style={{ padding: '1.5rem', color: 'white' }}>
          <Typography.Title level={4} style={{ color: 'white', marginBottom: 0 }}>
            后台控制台
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.split('/').pop() ?? 'gallery']}
          items={items}
          onClick={(info) => navigate(info.key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: 'rgba(15,23,42,0.85)', color: 'white', padding: '0 24px' }}>
          <Space size="large" align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Typography.Title level={3} style={{ color: 'white', margin: 0 }}>
              Serverless Photo Gallery
            </Typography.Title>
            <Input.Password
              value={token}
              onChange={(event) => setToken(event.target.value)}
              onPressEnter={() => {
                setAdminToken(token);
                messageApi.success(token ? '管理员令牌已更新' : '管理员令牌已清除');
              }}
              onBlur={() => {
                setAdminToken(token);
                messageApi.success(token ? '管理员令牌已更新' : '管理员令牌已清除');
              }}
              placeholder="输入管理员密码"
              style={{ width: 240 }}
            />
          </Space>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: 'rgba(15,23,42,0.65)', borderRadius: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
