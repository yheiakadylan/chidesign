"use client";
import React from 'react';
import { Typography, Row, Col, Card, Button, Badge } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function BillingPage() {
    const packages = [
        { title: "Starter", price: "$0", features: ["1 Workspace", "Basic Ideas Board", "Community Support"], isDefault: true },
        { title: "Pro", price: "$49/mo", features: ["5 Workspaces", "Advanced Kanban", "Priority Support", "API Access"], isBest: true },
        { title: "Enterprise", price: "Custom", features: ["Unlimited Workspaces", "Custom Workflows", "Dedicated AM", "99.9% Uptime"], isDefault: false },
    ];

    return (
        <div>
            <div style={{ marginBottom: 40, textAlign: 'center', marginTop: 20 }}>
                <Title level={3} style={{ marginBottom: 8 }}>Choose your Plan</Title>
                <Text type="secondary" style={{ fontSize: 16 }}>Scale your POD workflow with PinkDesign OS</Text>
            </div>

            <Row gutter={24} justify="center" style={{ maxWidth: 1000, margin: "0 auto" }}>
                {packages.map((pkg, idx) => (
                    <Col span={8} key={idx}>
                        {pkg.isBest ? (
                            <Badge.Ribbon text="Best Value" color="#FF4D4F" style={{ top: -10 }}>
                                <Card style={{ height: '100%', border: '2px solid #FF4D4F', borderRadius: 8, padding: 8 }}>
                                    <Title level={4}>{pkg.title}</Title>
                                    <Title level={2} style={{ color: "#FF4D4F", margin: "16px 0" }}>{pkg.price}</Title>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '24px 0 32px 0' }}>
                                        {pkg.features.map((f, i) => <Text key={i}><CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />{f}</Text>)}
                                    </div>
                                    <Button type="primary" block style={{ background: "#FF4D4F", height: 44, fontWeight: 600 }}>Upgrade to Pro</Button>
                                </Card>
                            </Badge.Ribbon>
                        ) : (
                            <Card style={{ height: '100%', border: '1px solid #E4E8EB', borderRadius: 8, padding: 8 }}>
                                <Title level={4}>{pkg.title}</Title>
                                <Title level={2} style={{ margin: "16px 0" }}>{pkg.price}</Title>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '24px 0 32px 0' }}>
                                    {pkg.features.map((f, i) => <Text key={i}><CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />{f}</Text>)}
                                </div>
                                <Button block style={{ height: 44, fontWeight: 600 }}>{pkg.isDefault ? "Current Plan" : "Contact Sales"}</Button>
                            </Card>
                        )}
                    </Col>
                ))}
            </Row>
        </div>
    );
}
