"use client";
import React from 'react';
import { Table, Button, Typography, Space, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function WebhooksPage() {
    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name', render: (n: string) => <span style={{ fontWeight: 500, color: "#454F5B" }}>{n}</span> },
        { title: 'Endpoint URL', dataIndex: 'url', key: 'url', render: (url: string) => <Text copyable style={{ color: "#3594D0" }}>{url}</Text> },
        { title: 'Secret', dataIndex: 'secret', key: 'secret', render: (secret: string) => <Text copyable={{ text: secret }} type="secondary" style={{ fontFamily: "monospace" }}>••••••••</Text> },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Active' ? 'success' : 'default'} style={{ borderRadius: 12 }}>{s}</Tag> },
        { title: 'Action', key: 'action', render: () => <Button type="link" danger style={{ color: "#FF4D4F" }}>Delete</Button> }
    ];

    const data = [
        { key: '1', name: 'Order Sync Merchize', url: 'https://api.vikcom.io/webhooks/receive', secret: 'sec_12345', status: 'Active' },
        { key: '2', name: 'Slack Alerts', url: 'https://hooks.slack.com/services/...', secret: 'sec_000', status: 'Inactive' },
        { key: '3', name: 'Zalo OA Notification', url: 'https://pink-zalo.io/hook', secret: 'sec_abc', status: 'Active' },
    ];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #E4E8EB" }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: 4 }}>API Providers / Webhooks</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>Manage your integrations and developer endpoints to automate POD orders.</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} style={{ background: "#3594D0", height: 38, padding: "0 24px" }}>Add Webhook</Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                style={{ border: '1px solid #E4E8EB', borderRadius: 8, overflow: 'hidden' }}
            />
        </div>
    );
}
