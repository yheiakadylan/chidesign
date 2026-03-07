"use client";
import React, { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Table, Spin, Button, Space } from "antd";
import { PieChartOutlined, LineChartOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { getBoardReports } from '@/actions/reports.actions';

const { Title, Text } = Typography;

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const data = await getBoardReports();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, []);

    const columns = [
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Count',
            dataIndex: 'count',
            key: 'count',
            render: (count: number) => <Text>{count}</Text>
        }
    ];

    const dataSource = stats ? Object.entries(stats.statusCounts).map(([k, v]) => ({
        key: k,
        status: k,
        count: v
    })) : [];

    return (
        <div style={{ padding: "20px 0" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <Button type="text" icon={<ArrowLeftOutlined />} style={{ fontSize: 18 }} />
                <Title level={4} style={{ margin: 0 }}>Board Analytics & Reports</Title>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}><Spin size="large" /></div>
            ) : (
                <>
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={12}>
                            <Card variant="outlined" style={{ borderRadius: 8, borderColor: "#E4E8EB" }}>
                                <Statistic
                                    title="Total Tasks Created"
                                    value={stats?.totalTasks || 0}
                                    prefix={<PieChartOutlined />}
                                    valueStyle={{ color: '#3594D0' }}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card variant="outlined" style={{ borderRadius: 8, borderColor: "#E4E8EB" }}>
                                <Statistic
                                    title="Total PINK Consumed/Estimated"
                                    value={stats?.totalPink || 0}
                                    precision={2}
                                    prefix={<LineChartOutlined />}
                                    valueStyle={{ color: '#FF4D4F' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Task Distribution by Status" styles={{ body: { padding: 0 } }} style={{ border: "1px solid #E4E8EB" }}>
                        <Table
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                        />
                    </Card>
                </>
            )}
        </div>
    );
}
