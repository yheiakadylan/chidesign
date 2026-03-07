"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, App, Checkbox, Typography, Card, Breadcrumb, InputNumber, Modal } from "antd";
import { UserOutlined, SafetyCertificateOutlined, HomeOutlined, DollarOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { getAllUsers, getAllRoles, updateUserRoles, toggleSuperAdmin, addPinkBalance } from "@/actions/admin.actions";

const { Title, Text } = Typography;

export default function UserManagementPage() {
    const { message } = App.useApp();
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
    const [topupAmount, setTopupAmount] = useState(0);
    const [topupType, setTopupType] = useState<'normal' | 'monthly'>('normal');

    const fetchData = async () => {
        setLoading(true);
        const [usersRes, rolesRes] = await Promise.all([getAllUsers(), getAllRoles()]);

        if (usersRes.success) setUsers(usersRes.users);
        if (rolesRes.success) setRoles(rolesRes.roles);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEditRoles = (user: any) => {
        setSelectedUser(user);
        setSelectedRoles(user.roles.map((r: any) => r.name));
        setIsModalOpen(true);
    };

    const handleSaveRoles = async () => {
        if (!selectedUser) return;

        setLoading(true);
        const res = await updateUserRoles(selectedUser.id, selectedRoles);
        setLoading(false);

        if (res.success) {
            message.success(`Updated roles for ${selectedUser.full_name}`);
            setIsModalOpen(false);
            fetchData();
        } else {
            message.error(res.error || "Failed to update roles");
        }
    };

    const handleToggleAdmin = async (user: any) => {
        const res = await toggleSuperAdmin(user.id, !user.is_supper_admin);
        if (res.success) {
            message.success(`${user.is_supper_admin ? 'Removed' : 'Added'} Super Admin status`);
            fetchData();
        } else {
            message.error(res.error);
        }
    };

    const handleTopup = async () => {
        if (!selectedUser || topupAmount <= 0) return;
        setLoading(true);
        const res = await addPinkBalance(selectedUser.id, topupAmount, topupType);
        setLoading(false);
        if (res.success) {
            message.success(`Added ${topupAmount} PINK to ${selectedUser.full_name}`);
            setIsTopupModalOpen(false);
            setTopupAmount(0);
            fetchData();
        } else {
            message.error(res.error);
        }
    };

    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (user: any) => (
                <Space>
                    <UserOutlined style={{ fontSize: 24, color: '#1890ff', padding: 8, background: '#e6f7ff', borderRadius: '50%' }} />
                    <div>
                        <div style={{ fontWeight: 600 }}>{user.full_name || 'Anonymous'}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Roles',
            key: 'roles',
            dataIndex: 'roles',
            render: (roles: any[]) => (
                <>
                    {roles.map(role => {
                        let color = 'blue';
                        if (role.name === 'ADMIN') color = 'volcano';
                        if (role.name === 'CLIENT_MANAGER') color = 'purple';
                        if (role.name === 'CLIENT_USER') color = 'cyan';
                        if (role.name === 'DESIGNER') color = 'green';
                        return <Tag color={color} key={role.id}>{role.name}</Tag>;
                    })}
                    {roles.length === 0 && <Text type="secondary" italic>No roles assigned</Text>}
                </>
            ),
        },
        {
            title: 'Permissions',
            key: 'permissions',
            render: (user: any) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {user.is_supper_admin && <Tag icon={<SafetyCertificateOutlined />} color="gold">Super Admin</Tag>}
                    <Space size={4}>
                        <Tag color="magenta" icon={<DollarOutlined />}>{user.normal_pink?.toFixed(2)} N</Tag>
                        <Tag color="orange" icon={<DollarOutlined />}>{user.monthly_pink?.toFixed(2)} M</Tag>
                    </Space>
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right' as const,
            render: (user: any) => (
                <Space>
                    <Button size="small" onClick={() => handleEditRoles(user)}>Roles</Button>
                    <Button
                        size="small"
                        icon={<PlusCircleOutlined />}
                        onClick={() => {
                            setSelectedUser(user);
                            setIsTopupModalOpen(true);
                        }}
                    >
                        Top-up
                    </Button>
                    <Button
                        size="small"
                        danger={user.is_supper_admin}
                        type={user.is_supper_admin ? "default" : "dashed"}
                        onClick={() => handleToggleAdmin(user)}
                    >
                        {user.is_supper_admin ? "Revoke Super" : "Make Super"}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            <Breadcrumb
                style={{ marginBottom: 16 }}
                items={[
                    { title: <HomeOutlined />, href: '/' },
                    { title: 'Admin' },
                    { title: 'Users' }
                ]}
            />

            <Card variant="borderless" style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>User Management</Title>
                    <Text type="secondary">Manage access roles for POD workflow</Text>
                </div>

                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={`Manage Roles: ${selectedUser?.full_name}`}
                open={isModalOpen}
                onOk={handleSaveRoles}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
                width={400}
            >
                <div style={{ padding: '10px 0' }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                        Select the roles this user should have in the POD workflow:
                    </Text>
                    <Checkbox.Group
                        options={roles.map(r => ({ label: r.name, value: r.name }))}
                        value={selectedRoles}
                        onChange={(values) => setSelectedRoles(values as string[])}
                        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                    />
                </div>
            </Modal>

            <Modal
                title={`Top-up PINK: ${selectedUser?.full_name}`}
                open={isTopupModalOpen}
                onOk={handleTopup}
                onCancel={() => setIsTopupModalOpen(false)}
                confirmLoading={loading}
                width={300}
            >
                <div style={{ padding: '10px 0' }}>
                    <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">Amount to add:</Text>
                        <InputNumber
                            min={0}
                            style={{ width: '100%', marginTop: 8 }}
                            value={topupAmount}
                            onChange={(v) => setTopupAmount(v || 0)}
                            placeholder="Amount..."
                            autoFocus
                        />
                    </div>
                    <div>
                        <Text type="secondary">Balance Type:</Text>
                        <div style={{ marginTop: 8 }}>
                            <Checkbox
                                checked={topupType === 'normal'}
                                onChange={() => setTopupType('normal')}
                            >
                                Normal Pink
                            </Checkbox>
                            <Checkbox
                                checked={topupType === 'monthly'}
                                onChange={() => setTopupType('monthly')}
                            >
                                Monthly Pink
                            </Checkbox>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
