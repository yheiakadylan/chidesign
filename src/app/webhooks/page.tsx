"use client";
import React, { useState } from 'react';
import { Table, Button, Typography, Space, Tag, Tabs, message } from "antd";
import { PlusOutlined, KeyOutlined, ApiOutlined, CopyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
export default function WebhooksPage() {
    const [apiKey, setApiKey] = useState("pk_test_************************");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateKey = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setApiKey("pk_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
            setIsGenerating(false);
            message.success("New API Key generated successfully!");
        }, 800);
    };
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

    const renderWebhooks = () => (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16 }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: 4 }}>Registered Webhooks</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>Endpoints receiving events from your boards.</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} style={{ background: "#3594D0", height: 38, padding: "0 24px" }}>Add Webhook</Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                style={{ border: '1px solid #E4E8EB', borderRadius: 8, overflow: 'hidden' }}
            />
        </>
    );

    const renderApiKeys = () => (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16 }}>
                <div>
                    <Title level={4} style={{ margin: 0, marginBottom: 4 }}>Secret API Keys</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>Use these keys to authenticate your application's requests to the CheeseDesign API.</Text>
                </div>
                <Button
                    type="primary"
                    icon={<KeyOutlined />}
                    style={{ background: "#3594D0", height: 38, padding: "0 24px" }}
                    onClick={handleGenerateKey}
                    loading={isGenerating}
                >
                    Generate New Key
                </Button>
            </div>

            <div style={{ background: "#F4F6F8", padding: 24, borderRadius: 8, border: "1px solid #E4E8EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>Active Production Key</Text>
                    <Text strong style={{ fontSize: 20, fontFamily: "monospace", color: "#454F5B" }}>{apiKey}</Text>
                </div>
                <Button icon={<CopyOutlined />} size="large" onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    message.success("API Key copied to clipboard!");
                }}>Copy</Button>
            </div>

            <div style={{ marginTop: 24 }}>
                <Text type="warning" strong>Security Warning:</Text>
                <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                    Do not share your API key in publicly accessible areas such as GitHub, client-side code, and so forth.
                </Text>
            </div>
        </>
    );

    return (
        <div style={{ padding: "20px 0" }}>
            <div style={{ marginBottom: 32 }}>
                <Title level={3} style={{ marginBottom: 8 }}>Developer Settings</Title>
                <Text type="secondary">Manage your Webhooks and API keys for system integrations.</Text>
            </div>

            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: <span><ApiOutlined /> Webhooks</span>,
                        children: renderWebhooks(),
                    },
                    {
                        key: '2',
                        label: <span><KeyOutlined /> API Keys</span>,
                        children: renderApiKeys(),
                    }
                ]}
            />
        </div>
    );
}
