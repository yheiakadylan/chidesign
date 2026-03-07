"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Typography, Switch, message, Tabs, Tag, Space, Input } from "antd";
import { TeamOutlined, SettingOutlined, UserAddOutlined } from "@ant-design/icons";
import { getSystemUsers, getSystemSettings, toggleUserStatus } from "@/actions/settings.actions";

const { Title, Text } = Typography;

export default function SettingsPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [uData, sData] = await Promise.all([
            getSystemUsers(),
            getSystemSettings()
        ]);
        setUsers(uData);
        setSettings(sData);
        setLoading(false);
    };

    const handleToggleUser = async (id: string, currentStatus: boolean) => {
        const res = await toggleUserStatus(id, currentStatus);
        if (res.error) {
            message.error(res.error);
        } else {
            message.success("User status updated");
            fetchData();
        }
    };

    const userColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            render: (roles: string[]) => (
                <Space size={[0, 4]} wrap>
                    {roles.length > 0 ? roles.map(r => <Tag color="blue" key={r}>{r}</Tag>) : <Text type="secondary">No roles</Text>}
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: boolean, record: any) => (
                <Switch
                    checked={status}
                    onChange={() => handleToggleUser(record.id, status)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            )
        },
    ];

    const settingColumns = [
        { title: 'Feature', dataIndex: 'title' },
        { title: 'Key', dataIndex: 'key', render: (k: string) => <Text code>{k}</Text> },
        {
            title: 'Enabled',
            dataIndex: 'settings',
            render: (enabled: boolean) => <Switch checked={enabled} />
        }
    ];

    const renderUsersTab = () => (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: 4 }}>System Users</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>Manage all users, their roles, and access rights across the platform.</Text>
                </div>
                <Button type="primary" icon={<UserAddOutlined />} style={{ background: "#3594D0", height: 38, padding: "0 24px" }}>Invite User</Button>
            </div>
            <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                style={{ border: '1px solid #E4E8EB', borderRadius: 8, overflow: 'hidden' }}
            />
        </>
    );

    const renderSettingsTab = () => (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: 4 }}>Application Settings</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>Global toggles and feature flags for the platform.</Text>
                </div>
            </div>
            <Table
                columns={settingColumns}
                dataSource={settings}
                rowKey="id"
                loading={loading}
                pagination={false}
                style={{ border: '1px solid #E4E8EB', borderRadius: 8, overflow: 'hidden' }}
            />
        </>
    );

    return (
        <div style={{ padding: "20px 0" }}>
            <div style={{ marginBottom: 32 }}>
                <Title level={3} style={{ marginBottom: 8 }}>Global Configuration</Title>
                <Text type="secondary">Admin panel to manage users and global features.</Text>
            </div>

            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: <span><TeamOutlined /> Users Management</span>,
                        children: renderUsersTab(),
                    },
                    {
                        key: '2',
                        label: <span><SettingOutlined /> System Settings</span>,
                        children: renderSettingsTab(),
                    }
                ]}
            />
        </div>
    );
}
