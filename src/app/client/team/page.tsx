"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, App, Input, Typography, Card, Breadcrumb, Form, Modal } from "antd";
import { UserOutlined, HomeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { getClientTeam, inviteTeamMember, removeTeamMember } from "@/actions/client.actions";

const { Title, Text } = Typography;

export default function ClientTeamPage() {
    const { message, modal } = App.useApp();
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        const res = await getClientTeam();
        if (res.success) setTeam(res.team || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInvite = async (values: any) => {
        setLoading(true);
        const res = await inviteTeamMember(values.email, values.full_name);
        setLoading(false);

        if (res.success) {
            message.success(`Invited ${values.email} to your team`);
            setIsModalOpen(false);
            form.resetFields();
            fetchData();
        } else {
            message.error(res.error || "Failed to invite");
        }
    };

    const handleRemove = async (userId: string) => {
        modal.confirm({
            title: 'Remove team member?',
            content: 'This user will no longer be part of your team.',
            onOk: async () => {
                const res = await removeTeamMember(userId);
                if (res.success) {
                    message.success('Member removed');
                    fetchData();
                } else {
                    message.error(res.error);
                }
            }
        });
    };

    const columns = [
        {
            title: 'Member',
            key: 'member',
            render: (user: any) => (
                <Space>
                    <UserOutlined style={{ fontSize: 24, color: '#e91e63', padding: 8, background: '#fff0f6', borderRadius: '50%' }} />
                    <div>
                        <div style={{ fontWeight: 600 }}>{user.full_name || 'Anonymous'}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: any) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right' as const,
            render: (user: any) => (
                <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(user.id)}
                >
                    Remove
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
            <Breadcrumb
                style={{ marginBottom: 16 }}
                items={[
                    { title: <HomeOutlined />, href: '/' },
                    { title: 'Client' },
                    { title: 'My Team' },
                ]}
            />

            <Card variant="borderless" style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>My Team</Title>
                        <Text type="secondary">Manage your staff and researchers who can create tasks</Text>
                    </div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Invite Member
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={team}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Modal
                title="Invite Team Member"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" onFinish={handleInvite} style={{ marginTop: 16 }}>
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[{ required: true, type: 'email' }]}
                    >
                        <Input placeholder="coworker@company.com" />
                    </Form.Item>
                    <Form.Item
                        name="full_name"
                        label="Full Name"
                    >
                        <Input placeholder="John Doe" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
