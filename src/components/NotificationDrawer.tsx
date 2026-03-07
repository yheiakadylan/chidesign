"use client";

import React, { useEffect, useState } from "react";
import { Drawer, List, Avatar, Typography, Badge, Button, Space, Tag, Spin, Empty } from "antd";
import { MessageOutlined, SyncOutlined, DollarOutlined, BellOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { getNotifications, markAsRead } from "@/actions/notification.actions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

export default function NotificationDrawer({ open, onClose }: { open: boolean, onClose: () => void }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        const res = await getNotifications();
        if (res.success) setNotifications(res.notifications || []);
        setLoading(false);
    };

    useEffect(() => {
        if (open) fetchNotifications();
    }, [open]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'comment': return <MessageOutlined style={{ color: '#1890ff' }} />;
            case 'status_change': return <SyncOutlined style={{ color: '#faad14' }} />;
            case 'charged_pink': return <DollarOutlined style={{ color: '#f5222d' }} />;
            case 'topup_pink': return <DollarOutlined style={{ color: '#52c41a' }} />;
            default: return <BellOutlined />;
        }
    };

    const handleMarkRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <Drawer
            title={
                <Space>
                    <BellOutlined />
                    <span>Notifications</span>
                </Space>
            }
            placement="right"
            onClose={onClose}
            open={open}
            size="default"
            extra={
                <Button type="link" onClick={fetchNotifications}>Refresh</Button>
            }
        >
            {loading && notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notifications.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                backgroundColor: item.read ? 'transparent' : '#f0faff',
                                cursor: 'pointer',
                                transition: '0.3s',
                                padding: '12px 16px',
                                borderRadius: 8,
                                border: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12
                            }}
                            onClick={() => handleMarkRead(item.id)}
                        >
                            <Avatar
                                icon={getIcon(item.type)}
                                style={{ backgroundColor: item.read ? '#f5f5f5' : '#e6f7ff', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <Text strong={!item.read} style={{ fontSize: 13 }}>
                                        {item.type.replace('_', ' ').toUpperCase()}
                                    </Text>
                                    <Space size={8}>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {dayjs(item.createdAt).fromNow()}
                                        </Text>
                                        {!item.read && <Badge status="processing" />}
                                    </Space>
                                </div>
                                <div style={{ color: '#262626', fontSize: 13, marginBottom: 4 }}>
                                    {item.message}
                                </div>
                                {item.idea && (
                                    <Tag color="blue" style={{ fontSize: 10 }}>
                                        {item.idea.sku}
                                    </Tag>
                                )}
                                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                                    by {item.user?.full_name || 'System'}
                                </Text>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && <Empty description="No notifications" />}
                </div>
            )}
        </Drawer>
    );
}
