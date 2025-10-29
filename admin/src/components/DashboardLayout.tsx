import { useState } from 'react';
import { Layout, Menu, Typography, Input, Space, message, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  PictureOutlined,
  UploadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { setAdminToken, loginAsAdmin } from '../services/api';

const { Header, Sider, Content } = Layout;

const items = [
  { key: 'gallery', icon: <PictureOutlined />, label: '图库管理' },
  { key: 'upload', icon: <UploadOutlined />, label: '上传处理' },
  { key: 'logs', icon: <BarChartOutlined />, label: '访问日志' }
];

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [hasToken, setHasToken] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.localStorage.getItem('admin-token'));
  });
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = async () => {
    if (!password) {
      messageApi.warning('请输入管理员密码');
      return;
    }
    try {
      const { token } = await loginAsAdmin(password);
      setAdminToken(token);
      setHasToken(true);
      setPassword('');
      messageApi.success('管理员登录成功');
    } catch (error) {
      setAdminToken('');
      setHasToken(false);
      setPassword('');
      messageApi.error('管理员验证失败');
    }
  };

  const handleLogout = () => {
    setAdminToken('');
    setHasToken(false);
    messageApi.success('管理员已退出');
  };

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
            <Space>
              <Input.Password
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onPressEnter={handleLogin}
                placeholder="输入管理员密码"
                style={{ width: 240 }}
              />
              <Button type="primary" onClick={handleLogin}>
                登录
              </Button>
              {hasToken && (
                <Button onClick={handleLogout} danger>
                  退出
                </Button>
              )}
            </Space>
          </Space>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: 'rgba(15,23,42,0.65)', borderRadius: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
