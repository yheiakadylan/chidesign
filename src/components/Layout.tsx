"use client";

import React, { useState, useEffect, createContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Space,
  ConfigProvider,
  Select,
  Badge,
  Typography,
  Dropdown,
  Switch,
} from "antd";
import {
  BulbOutlined,
  AppstoreOutlined,
  WalletOutlined,
  FileTextOutlined,
  ApiOutlined,
  BellOutlined,
  PlusOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Icon from "@ant-design/icons";
import TemplateModal from "./TemplateModal";
import ChangePasswordModal from "./ChangePasswordModal";

const EllipsisSvg = () => (
  <svg viewBox="64 64 896 896" focusable="false" data-icon="ellipsis" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"></path>
  </svg>
);

export const AppContext = createContext<{
  selectedBoardId: string;
  setSelectedBoardId: (id: string) => void;
}>({
  selectedBoardId: "all",
  setSelectedBoardId: () => { },
});

const { Header, Sider, Content } = AntLayout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const themeConfig = {
  token: {
    colorPrimary: "#3594D0",
    colorError: "#FF4D4F",
    colorBgLayout: "#F0F2F5",
    fontFamily:
      "'Shopify Sans Web', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Layout: {
      headerBg: "#F4F6F8",
      siderBg: "#F4F6F8",
    },
    Menu: {
      itemSelectedColor: "#3594D0",
      itemSelectedBg: "rgba(53, 148, 208, 0.1)",
      itemColor: "#454F5B",
    },
  },
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState("all");

  const pathname = usePathname();
  const router = useRouter();

  const isTasksPage = pathname === "/" || pathname === "/ideas";

  const userMenuItems = [
    {
      key: 'profile_info',
      label: (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#262626', minWidth: 200, padding: '4px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 8, paddingBottom: 12 }}>
          <Avatar size="large" style={{ backgroundColor: "#d9d9d9", color: "#454F5B" }}>LB</Avatar>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Lê Bảo Vi</span>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>Teeazm@gmail.com</span>
          </div>
        </div>
      )
    },
    { key: 'change_password', label: 'Change password', onClick: () => setIsChangePasswordOpen(true) },
    { key: 'profile', label: 'User profile', onClick: () => router.push('/user-profile') },
    { type: 'divider' },
    { key: 'logout', label: <span style={{ color: '#ff4d4f' }}>Sign out</span> },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeKey = pathname === "/" ? "ideas" : pathname.split("/")[1] || "ideas";

  const menuItems = [
    { key: "ideas", label: "Tasks", icon: <BulbOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/ideas') },
    { key: "boards", label: "Boards", icon: <AppstoreOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/boards') },
    { key: "balances", label: "Balances", icon: <WalletOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/balances') },
    { key: "billing", label: "Billing", icon: <DollarOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/billing') },
    { key: "board-reports", label: "Board Reports", icon: <FileTextOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/board-reports') },
    { key: "webhooks", label: "API Integration", icon: <ThunderboltOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/webhooks') },
  ];

  if (!mounted) return null;

  return (
    <ConfigProvider theme={themeConfig}>
      <AntLayout style={{ minHeight: "100vh" }}>
        {/* HEADER: Exactly matching PinkDesign, Full Width over Sider */}
        <Header
          style={{
            position: "fixed",
            zIndex: 10,
            width: "100%",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E4E8EB",
            height: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            <div style={{
              marginRight: 16,
              color: "#e91e63",
              fontFamily: "'Brush Script MT', cursive",
              fontSize: 24,
              fontWeight: "bold",
              transform: "translateY(-2px)"
            }}>
              PinkDesign<span style={{ fontSize: 14 }}>.io</span>
            </div>

            {isTasksPage && (
              <Select
                value={selectedBoardId}
                onChange={setSelectedBoardId}
                style={{ width: 140 }}
                options={[
                  { value: 'all', label: 'All boards' },
                  { value: 'Fulfill Vikcom', label: 'Fulfill Vikcom' }
                ]}
              />
            )}

            {isTasksPage && selectedBoardId !== "all" && (
              <>
                <Button>Quick edit</Button>

                <Avatar.Group max={{ count: 3, style: { color: '#f56a00', backgroundColor: '#fde3cf' } }} size="default">
                  <Avatar style={{ backgroundColor: "#A0AAB3" }}>LB</Avatar>
                  <Avatar style={{ backgroundColor: "#8C96A1" }}>VW</Avatar>
                  <Avatar style={{ backgroundColor: "#fde3cf", color: "#f56a00" }}>+13</Avatar>
                </Avatar.Group>
                <Button type="dashed" shape="circle" icon={<PlusOutlined />} />

                <Button onClick={() => setIsTemplateOpen(true)}>Template</Button>
                <Button>Read me</Button>
              </>
            )}
          </div>

          <Space size="middle">
            <Button type="primary" danger style={{ background: "#FF4D4F" }}>
              Documentation
            </Button>
            <Space.Compact>
              <Button type="primary" style={{ backgroundColor: "#3594D0", borderColor: "#3594D0" }}>
                2033.00 Pink
              </Button>
              <Button style={{ color: "#faad14", borderColor: "#3594D0", backgroundColor: "#3594D0" }}>
                0.00 Pink
              </Button>
              <Button icon={<Icon component={EllipsisSvg} />} style={{ color: "#fff", borderColor: "#3594D0", backgroundColor: "#3594D0" }} />
            </Space.Compact>

            <Badge count={0} size="small" showZero>
              <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems as any }} trigger={['click']} placement="bottomRight">
              <Avatar style={{ backgroundColor: "#d9d9d9", color: "#454F5B", fontWeight: 600, cursor: "pointer" }}>LB</Avatar>
            </Dropdown>
          </Space>
        </Header>

        <TemplateModal
          open={isTemplateOpen}
          onCancel={() => setIsTemplateOpen(false)}
          onSave={() => setIsTemplateOpen(false)}
        />

        <ChangePasswordModal
          open={isChangePasswordOpen}
          onCancel={() => setIsChangePasswordOpen(false)}
          onSave={() => setIsChangePasswordOpen(false)}
        />

        <AntLayout style={{ marginTop: 64 }}>
          {/* SIDER: Collapsible, under Header */}
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            width={200}
            collapsedWidth={60}
            theme="light"
            style={{
              borderRight: "1px solid #E4E8EB",
              height: 'calc(100vh - 64px)',
              position: 'fixed',
              left: 0,
              top: 64,
              bottom: 0
            }}
          >
            <Menu
              mode="vertical"
              selectedKeys={[activeKey]}
              items={menuItems}
              style={{ borderRight: 0, backgroundColor: "transparent", border: "none", paddingTop: 16 }}
            />
          </Sider>

          <Content style={{ backgroundColor: "#F4F6F8", marginLeft: collapsed ? 60 : 200, transition: 'all 0.2s', minHeight: 'calc(100vh - 64px)', padding: '15px 24px' }}>
            <AppContext.Provider value={{ selectedBoardId, setSelectedBoardId }}>
              {children}
            </AppContext.Provider>
          </Content>
        </AntLayout>
      </AntLayout>
    </ConfigProvider>
  );
}
