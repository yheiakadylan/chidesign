"use client";
import React from 'react';
import { Table, Button, Input, Space, Card, Typography, Row, Col, DatePicker, Select, Tag, Spin } from "antd";
import { SearchOutlined, ArrowLeftOutlined, BarsOutlined } from "@ant-design/icons";
import { getBalanceHistory } from '@/actions/balances.actions';
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function BalancesPage() {
    const [balanceData, setBalanceData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await getBalanceHistory();
            setBalanceData(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const statCards = [
        { title: "Normal Pink Balance", value: balanceData ? balanceData.balances.normal.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "..." },
        { title: "Monthly Pink Balance", value: balanceData ? balanceData.balances.monthly.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "..." },
        { title: "Total Pink", value: balanceData ? (balanceData.balances.normal + balanceData.balances.monthly).toLocaleString('en-US', { minimumFractionDigits: 2 }) : "..." },
    ];

    const columns = [
        {
            title: 'Package / Activity',
            dataIndex: 'message',
            key: 'message',
            render: (text: string) => (
                <Space>
                    <div style={{ width: 40, height: 40, background: "#f0f5ff", borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3594D0', fontWeight: 'bold' }}>P</div>
                    <Text style={{ color: "#3594D0", fontWeight: 500 }}>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Type',
            dataIndex: 'message2',
            key: 'message2',
            render: (type: string) => (
                <Tag color={type === 'Monthly' ? 'volcano' : 'blue'}>{type || 'Normal'}</Tag>
            )
        },
        {
            title: 'Transaction Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: any) => <Text type="secondary">{dayjs(date).format('MMM DD, YYYY HH:mm')}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'type',
            key: 'status',
            render: () => <Tag color="success">Completed</Tag>
        },
    ];

    // Data is fetched via Server Action

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
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={balanceData?.history || []}
                        rowKey="id"
                        pagination={{ pageSize: 15 }}
                    />
                </Spin>
            </Card>
        </div>
    );
}
