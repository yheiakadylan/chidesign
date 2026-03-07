"use client";

import React, { useState, useEffect, createContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction, getCurrentUser } from "@/actions/auth.actions";
import { getBoardOptions, getBoardMembers } from "@/actions/board.actions";
import {
  App,
  Layout as AntLayout,
  Modal,
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
  Tooltip,
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
import UpdateTeamModal from "./UpdateTeamModal";
import EditBoardModal from "./EditBoardModal";
import NotificationDrawer from "./NotificationDrawer";

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
  const [user, setUser] = useState<any>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isUpdateTeamOpen, setIsUpdateTeamOpen] = useState(false);
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [isReadMeOpen, setIsReadMeOpen] = useState(false);
  const [boardReadMe, setBoardReadMe] = useState<string | null>(null);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState("all");
  const [boards, setBoards] = useState<{ value: string; label: string }[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const pathname = usePathname();
  const router = useRouter();

  const isTasksPage = pathname === "/" || pathname === "/ideas";

  const userMenuItems = [
    {
      key: 'profile_info',
      label: (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#262626', minWidth: 200, padding: '4px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 8, paddingBottom: 12 }}>
          <Avatar
            size="large"
            src={user?.avatar?.url}
            style={{ backgroundColor: "#3594D0", color: "#fff" }}
          >
            {!user?.avatar?.url && (user?.full_name?.substring(0, 2).toUpperCase() || "U")}
          </Avatar>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.full_name || "Guest"}</span>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>{user?.email || ""}</span>
          </div>
        </div>
      )
    },
    { key: 'change_password', label: 'Change password', onClick: () => setIsChangePasswordOpen(true) },
    { key: 'profile', label: 'User profile', onClick: () => router.push('/user-profile') },
    { type: 'divider' },
    { key: 'logout', label: <span style={{ color: '#ff4d4f' }}>Sign out</span>, onClick: () => logoutAction() },
  ];

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const u = await getCurrentUser();
      if (u) setUser(u);
    };
    const fetchBoards = async () => {
      const b = await getBoardOptions();
      setBoards([{ value: 'all', label: 'All boards' }, ...b]);
    };
    fetchUser();
    fetchBoards();

    // Listen for profile updates to refresh header avatar
    window.addEventListener('user-updated', fetchUser);
    return () => window.removeEventListener('user-updated', fetchUser);
  }, []);

  // Load board members and ReadMe when board selection changes
  useEffect(() => {
    if (selectedBoardId && selectedBoardId !== 'all') {
      getBoardMembers(selectedBoardId).then(res => {
        setBoardMembers(res.members || []);
      });
      import('@/actions/board.actions').then(m => m.getBoardDetail(selectedBoardId)).then(b => {
        setBoardReadMe(b?.readMe || null);
      });
    } else {
      setBoardMembers([]);
      setBoardReadMe(null);
    }
  }, [selectedBoardId]);

  const activeKey = pathname === "/" ? "ideas" : pathname.split("/")[1] || "ideas";

  const userRoles = user?.roles?.map((r: any) => r.name) || [];
  const isAdmin = user?.is_supper_admin || userRoles.includes('ADMIN');
  const isClientManager = userRoles.includes('CLIENT_MANAGER');
  const isClientUser = userRoles.includes('CLIENT_USER');
  const isDesigner = userRoles.includes('DESIGNER');

  const menuItems: any[] = [
    { key: "ideas", label: "Tasks", icon: <BulbOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/ideas') },
    { key: "boards", label: "Boards", icon: <AppstoreOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/boards') },
  ];

  // Balances & Billing only for Clients and Admins
  if (isAdmin || isClientManager || isClientUser) {
    menuItems.push(
      { key: "balances", label: "Balances", icon: <WalletOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/balances') },
      { key: "billing", label: "Billing", icon: <DollarOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/billing') }
    );
  }

  menuItems.push(
    { key: "board-reports", label: "Board Reports", icon: <FileTextOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/board-reports') }
  );

  if (isAdmin || isClientManager) {
    menuItems.push({ key: "settings", label: "Settings", icon: <SettingOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/settings') });
  }

  if (isAdmin) {
    menuItems.push(
      { key: "webhooks", label: "API Integration", icon: <ThunderboltOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/webhooks') },
      { key: "admin-users", label: "User Roles", icon: <TeamOutlined style={{ fontSize: 18 }} />, onClick: () => router.push('/admin/users') }
    );
  }

  if (isClientManager) {
    menuItems.push({
      key: "client-team",
      label: "My Team",
      icon: <TeamOutlined style={{ fontSize: 18 }} />,
      onClick: () => router.push('/client/team')
    });
  }

  if (!mounted) return null;

  if (pathname === '/login') {
    return (
      <ConfigProvider theme={themeConfig}>
        <App>
          {children}
        </App>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <App>
        <AntLayout style={{ minHeight: "100vh" }}>
          {/* HEADER: Exactly matching CheeseDesign, Full Width over Sider */}
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
                CheeseDesign<span style={{ fontSize: 14 }}>.io</span>
              </div>

              {isTasksPage && (
                <Select
                  value={selectedBoardId}
                  onChange={setSelectedBoardId}
                  style={{ width: 160 }}
                  options={boards}
                />
              )}

              {isTasksPage && selectedBoardId !== "all" && (
                <>
                  <Button onClick={() => setIsEditBoardOpen(true)}>Edit</Button>

                  <Avatar.Group max={{ count: 3, style: { color: '#f56a00', backgroundColor: '#fde3cf' } }} size="default">
                    {boardMembers.length > 0
                      ? boardMembers.map((m: any) => (
                        <Tooltip key={m.id} title={m.full_name || m.email}>
                          <Avatar style={{ backgroundColor: "#3594D0", color: "#fff" }}>
                            {(m.full_name || m.email).charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      ))
                      : (
                        <Avatar style={{ backgroundColor: "#A0AAB3" }}>?</Avatar>
                      )
                    }
                  </Avatar.Group>
                  <Button
                    type="dashed"
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={() => setIsUpdateTeamOpen(true)}
                    title="Add/remove members"
                  />

                  <Button onClick={() => setIsTemplateOpen(true)}>Template</Button>
                  <Button onClick={() => setIsReadMeOpen(true)}>Read me</Button>
                </>
              )}
            </div>

            <Space size="middle">
              <Button type="primary" danger style={{ background: "#FF4D4F" }}>
                Documentation
              </Button>
              <Space.Compact>
                <Button type="primary" style={{ backgroundColor: "#3594D0", borderColor: "#3594D0" }}>
                  {user ? user.normal_pink?.toFixed(2) : "0.00"} Pink
                </Button>
                <Button style={{ color: "#faad14", borderColor: "#3594D0", backgroundColor: "#3594D0" }}>
                  {user ? user.monthly_pink?.toFixed(2) : "0.00"} Pink
                </Button>
                <Button icon={<Icon component={EllipsisSvg} />} style={{ color: "#fff", borderColor: "#3594D0", backgroundColor: "#3594D0" }} />
              </Space.Compact>

              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ fontSize: 18 }} />}
                  onClick={() => setIsNotificationOpen(true)}
                />
              </Badge>

              <Dropdown menu={{ items: userMenuItems as any }} trigger={['click']} placement="bottomRight">
                <Avatar
                  src={user?.avatar?.url}
                  style={{ backgroundColor: "#3594D0", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                >
                  {!user?.avatar?.url && (user?.full_name?.substring(0, 2).toUpperCase() || "U")}
                </Avatar>
              </Dropdown>
            </Space>
          </Header>

          <TemplateModal
            boardId={selectedBoardId}
            open={isTemplateOpen}
            onCancel={() => setIsTemplateOpen(false)}
            onSave={() => setIsTemplateOpen(false)}
          />

          <EditBoardModal
            boardId={selectedBoardId}
            open={isEditBoardOpen}
            onCancel={() => setIsEditBoardOpen(false)}
            onSave={() => {
              setIsEditBoardOpen(false);
              // Refresh board options
              getBoardOptions().then(b => setBoards([{ value: 'all', label: 'All boards' }, ...b]));
              // Refresh ReadMe
              import('@/actions/board.actions').then(m => m.getBoardDetail(selectedBoardId)).then(b => {
                setBoardReadMe(b?.readMe || null);
              });
            }}
          />

          <Modal
            title="Board Read me"
            open={isReadMeOpen}
            onCancel={() => setIsReadMeOpen(false)}
            footer={[<Button key="close" onClick={() => setIsReadMeOpen(false)}>Close</Button>]}
            width={800}
          >
            <div style={{ minHeight: 200, whiteSpace: 'pre-wrap', color: '#454F5B', fontSize: 14, lineHeight: 1.6 }}>
              {boardReadMe || "No Read me instructions found for this board."}
            </div>
          </Modal>

          <ChangePasswordModal
            open={isChangePasswordOpen}
            onCancel={() => setIsChangePasswordOpen(false)}
            onSave={() => setIsChangePasswordOpen(false)}
          />

          {selectedBoardId && selectedBoardId !== 'all' && (
            <UpdateTeamModal
              open={isUpdateTeamOpen}
              onCancel={() => setIsUpdateTeamOpen(false)}
              onSave={() => {
                setIsUpdateTeamOpen(false);
                getBoardMembers(selectedBoardId).then(res => setBoardMembers(res.members || []));
              }}
              boardId={selectedBoardId}
            />
          )}

          <NotificationDrawer
            open={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />

          <AntLayout style={{ marginTop: 64 }}>
            {/* SIDER: Collapsible, under Header */}
            <Sider
              collapsible
              collapsed={collapsed}
              onCollapse={(value: boolean) => setCollapsed(value)}
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
      </App>
    </ConfigProvider>
  );
}
