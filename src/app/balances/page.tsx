"use client";
import React from 'react';
import { Table, Button, Input, Space, Card, Typography, Row, Col, DatePicker, Select, Tag } from "antd";
import { SearchOutlined, ArrowLeftOutlined, BarsOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function BalancesPage() {
    const statCards = [
        { title: "Account Balance (PINK)", value: "2,037.00" },
        { title: "Deposited Pink", value: "0.00" },
        { title: "Fulfilled Pink", value: "355.5" },
        { title: "Expired Pink", value: "0" },
    ];

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => (
                <Space>
                    <div style={{ width: 40, height: 40, background: "#e4e8eb", borderRadius: 4 }}></div>
                    <a style={{ color: "#3594D0" }}>{text}</a>
                </Space>
            )
        },
        { title: 'Pink', dataIndex: 'pink', key: 'pink' },
        { title: 'Amount (VND)', dataIndex: 'amount', key: 'amount' },
        { title: 'Rate (VND)', dataIndex: 'rate', key: 'rate' },
        {
            title: 'Package',
            dataIndex: 'package',
            key: 'package',
            render: (pkg: string) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: 12 }}>CUSTOM</Text>
                    <Tag color="blue">{pkg}</Tag>
                </div>
            )
        },
        { title: 'Transaction ID', dataIndex: 'transId', key: 'transId' },
        { title: 'Created at', dataIndex: 'createdAt', key: 'createdAt', render: (text: string) => <Text type="secondary" style={{ fontSize: 12 }}>{text}</Text> },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <Text>{status}</Text> },
        { title: 'Action', dataIndex: 'action', key: 'action', render: (action: string) => <Text>{action}</Text> },
        { title: 'Note', dataIndex: 'note', key: 'note' },
    ];

    const data = [
        { key: '1', title: 'Team Duyên - Flower Tea Pot Holo Wh', pink: 1, amount: '22,000.00', rate: '22,000.00', package: 'Normal', transId: 'P9DI6OMC66', createdAt: 'Mar 04, 2026 at 11:02:08 AM', status: 'Charged', action: 'fulfilled', note: '' },
        { key: '2', title: 'Team Duyên - Greenhouse Garden Fund Piggy...', pink: 1.5, amount: '33,000.00', rate: '22,000.00', package: 'Normal', transId: 'OD2VLOWBBA', createdAt: 'Mar 04, 2026 at 11:00:56 AM', status: 'Charged', action: 'fulfilled', note: '' },
        { key: '3', title: 'TEAM KHÁI - WOODEN BLOCK', pink: 1, amount: '22,000.00', rate: '22,000.00', package: 'Normal', transId: 'BG28JOV7EY', createdAt: 'Mar 04, 2026 at 10:59:30 AM', status: 'Charged', action: 'fulfilled', note: '' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <Button type="text" icon={<ArrowLeftOutlined />} style={{ fontSize: 18 }} />
                <Title level={4} style={{ margin: 0 }}>Balances</Title>
                <Button type="primary" style={{ backgroundColor: "#3594D0" }}>Make deposit</Button>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                {statCards.map((stat, idx) => (
                    <Col span={6} key={idx}>
                        <Card variant="outlined" style={{ borderRadius: 8, borderColor: "#E4E8EB" }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>{stat.title}</Text>
                            <div style={{ fontSize: 24, fontWeight: 500, color: "#454F5B", marginTop: 8 }}>{stat.value}</div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <Select defaultValue="all" style={{ width: 120 }} options={[{ value: 'all', label: 'All' }]} />
                <RangePicker />
                <Button icon={<BarsOutlined />} />
                <Input prefix={<SearchOutlined />} placeholder="transaction ID" style={{ width: 250 }} />
            </div>

            <Card styles={{ body: { padding: 0 } }} variant="borderless" style={{ border: '1px solid #E4E8EB', overflow: 'hidden' }}>
                <Table columns={columns} dataSource={data} pagination={false} />
            </Card>
        </div>
    );
}
