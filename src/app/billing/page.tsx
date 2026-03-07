"use client";
import React, { useEffect, useState } from 'react';
import {
    Typography, Row, Col, Card, Button, Tabs, Space, Table, Tag, Avatar,
    Input, Divider, Form, Breadcrumb
} from "antd";
import {
    ArrowLeftOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    EllipsisOutlined,
    HomeOutlined
} from "@ant-design/icons";
import { getPackages } from '@/actions/billing.actions';
import { getPinkTransactionLogs } from "@/actions/finance.actions";
import dayjs from "dayjs";
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function BillingPage() {
    const router = useRouter();
    const [packages, setPackages] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("normal");
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [pkgData, logRes] = await Promise.all([
                getPackages(),
                getPinkTransactionLogs()
            ]);
            setPackages(pkgData);
            if (logRes?.success) setLogs(logRes.logs || []);

            // Default selected package
            const normalPkgs = pkgData.filter((p: any) => p.type?.toLowerCase() === 'normal');
            if (normalPkgs.length > 0) setSelectedPackage(normalPkgs[0]);

            setLoading(false);
        };
        fetchData();
    }, []);

    const historyColumns = [
        {
            title: 'Client',
            key: 'client',
            render: (record: any) => (
                <Space>
                    <Avatar size={30} style={{ backgroundColor: "#3594D0" }}>
                        {record.user?.full_name?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    <Text>{record.user?.full_name || "System"}</Text>
                </Space>
            )
        },
        {
            title: 'Pink',
            key: 'pink',
            align: 'right' as const,
            render: (record: any) => (
                <Text strong>{record.message?.match(/\d+/)?.[0] || '10'}</Text>
            )
        },
        {
            title: 'Amount (VND)',
            key: 'amount',
            align: 'right' as const,
            render: (record: any) => (
                <Text>{(record.amount || 200000).toLocaleString()}.00</Text>
            )
        },
        {
            title: 'Rate (VND)',
            key: 'rate',
            align: 'right' as const,
            render: (record: any) => (
                <Text>{(record.rate || 20000).toLocaleString()}.00</Text>
            )
        },
        {
            title: 'Package',
            key: 'package',
            render: (record: any) => (
                <Space orientation="vertical" size={2}>
                    <Text style={{ fontSize: 13 }}>{record.message2 || "CUSTOM"}</Text>
                    <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>Normal</Tag>
                </Space>
            )
        },
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: string) => <Text style={{ fontSize: 13 }}>{id.substring(0, 12).toUpperCase()}</Text>
        },
        {
            title: 'Created at',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: any) => dayjs(date).format('MMM DD, YYYY [at] hh:mm:ss A')
        },
        {
            title: 'Status',
            key: 'status',
            render: () => (
                <Tag color="success" icon={<CheckCircleOutlined />}>Approved</Tag>
            )
        },
        {
            title: 'Note',
            dataIndex: 'message',
            key: 'note',
            render: (msg: string) => <Text type="secondary" style={{ fontSize: 12 }}>{msg}</Text>
        }
    ];

    return (
        <div style={{ padding: "0 15px 40px" }}>
            <style>{`
                .pink-card {
                    border-radius: 8px;
                    border: 1px solid #f0f0f0;
                    overflow: hidden;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
                }
                .pink-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                
                /* Border logic: active (selected) or featured */
                .pink-card.active {
                    border: 2px solid #3594D0;
                }
                .pink-card.featured {
                    border: 1px solid #FF4D8F;
                }
                .pink-card.featured.active {
                    border: 2px solid #FF4D8F;
                }

                /* Header background logic */
                .pink-card .ant-card-head {
                    border-bottom: none;
                    padding: 8px 12px;
                    min-height: unset;
                    background: #AEDEF4; /* Default light blue header */
                }
                .pink-card.featured .ant-card-head {
                    background: #FF4D8F !important;
                }
                
                /* Title logic */
                .pink-card .ant-card-head-title {
                    font-size: 13px;
                    font-weight: 700;
                    line-height: 1.2;
                    padding: 0;
                    color: #454F5B;
                    text-align: center;
                }
                .pink-card.featured .ant-card-head-title span {
                    color: #ffffff !important;
                }
                
                .pink-card .ant-card-body {
                    padding: 16px 12px 18px;
                    text-align: center;
                }

                /* Corner Ribbon (Best Badge) */
                .best-ribbon {
                    position: absolute;
                    top: 10px;
                    right: -25px;
                    background: #FF4D8F;
                    color: #fff;
                    padding: 1px 25px;
                    transform: rotate(45deg);
                    font-size: 10px;
                    font-weight: 800;
                    z-index: 10;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                    text-transform: uppercase;
                    pointer-events: none;
                }

                .billing-tabs .ant-tabs-nav {
                    margin-bottom: 15px;
                }
                .billing-tabs .ant-tabs-tab {
                    padding: 8px 0;
                    margin-right: 32px;
                }
                .billing-tabs .ant-tabs-tab-btn {
                    font-weight: 500;
                }
                .billing-tabs .ant-tabs-ink-bar {
                    height: 2px;
                }
            `}</style>

            <div style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    style={{ fontSize: 18 }}
                />
                <Title level={4} style={{ margin: 0 }}>Billing</Title>
            </div>

            <Text style={{ marginBottom: 20, display: "block", fontSize: 16, color: "#454F5B" }}>
                Select one of the packages below.
            </Text>

            <Form layout="vertical">
                <Row gutter={[30, 30]}>
                    {/* Main Content - Package Tabs */}
                    <Col xs={24} md={18}>
                        <Card variant="outlined" styles={{ body: { padding: "1px 15px" } }}>
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                className="billing-tabs"
                                items={[
                                    {
                                        key: 'normal',
                                        label: 'Normal Packages',
                                        children: (
                                            <Row gutter={[10, 10]} style={{ marginBottom: 15 }}>
                                                {packages
                                                    .filter(p => p.type?.toLowerCase() === 'normal')
                                                    .sort((a, b) => (a.position || 0) - (b.position || 0))
                                                    .map((pkg, idx) => {
                                                        const isActive = selectedPackage?.id === pkg.id;
                                                        const rate = pkg.amount / pkg.qty;
                                                        return (
                                                            <Col xs={24} sm={8} md={6} key={idx}>
                                                                <Card
                                                                    hoverable
                                                                    className={`pink-card ${isActive ? 'active' : ''} ${pkg.isFeatured ? 'featured' : ''}`}
                                                                    onClick={() => setSelectedPackage(pkg)}
                                                                    title={<span>PACKAGE<br />{pkg.qty} PINK</span>}
                                                                >
                                                                    {pkg.isFeatured && (
                                                                        <div className="best-ribbon">Best</div>
                                                                    )}
                                                                    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                                                                        <div style={{ width: '100%' }}>
                                                                            <Text type="secondary" style={{ display: 'block' }}>{rate.toLocaleString()} VND/1 PINK</Text>
                                                                            <Title level={4} style={{ margin: "2px 0", fontWeight: 700 }}>{pkg.amount.toLocaleString()} VND</Title>
                                                                            <Text type="secondary" italic style={{ fontSize: 13 }}>
                                                                                (Save {(pkg.qty * 35000 - pkg.amount).toLocaleString()} VND)
                                                                            </Text>
                                                                        </div>
                                                                        <Button
                                                                            type="primary"
                                                                            size="small"
                                                                            style={{ marginTop: 5, background: "#3594D0" }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedPackage(pkg);
                                                                            }}
                                                                        >
                                                                            Select
                                                                        </Button>
                                                                    </Space>
                                                                </Card>
                                                            </Col>
                                                        );
                                                    })}
                                            </Row>
                                        )
                                    },
                                    {
                                        key: 'monthly',
                                        label: 'Monthly Packages',
                                        children: (
                                            <Row gutter={[10, 10]} style={{ marginBottom: 15 }}>
                                                {packages
                                                    .filter(p => p.type?.toLowerCase() === 'monthly')
                                                    .sort((a, b) => (a.position || 0) - (b.position || 0))
                                                    .map((pkg, idx) => {
                                                        const isActive = selectedPackage?.id === pkg.id;
                                                        const rate = pkg.amount / pkg.qty;
                                                        return (
                                                            <Col xs={24} sm={8} md={6} key={idx}>
                                                                <Card
                                                                    hoverable
                                                                    className={`pink-card ${isActive ? 'active' : ''} ${pkg.isFeatured ? 'featured' : ''}`}
                                                                    onClick={() => setSelectedPackage(pkg)}
                                                                    title={<span>PACKAGE<br />{pkg.qty} PINK</span>}
                                                                >
                                                                    {pkg.isFeatured && (
                                                                        <div className="best-ribbon">Best</div>
                                                                    )}
                                                                    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
                                                                        <div style={{ width: '100%' }}>
                                                                            <Text type="secondary" style={{ display: 'block' }}>{rate.toLocaleString()} VND/1 PINK</Text>
                                                                            <Title level={4} style={{ margin: "2px 0", fontWeight: 700 }}>{pkg.amount.toLocaleString()} VND</Title>
                                                                            <Text type="secondary" italic style={{ fontSize: 13 }}>
                                                                                (Save {(pkg.qty * 35000 - pkg.amount).toLocaleString()} VND)
                                                                            </Text>
                                                                        </div>
                                                                        <Button
                                                                            type="primary"
                                                                            size="small"
                                                                            style={{ marginTop: 5, background: "#3594D0" }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedPackage(pkg);
                                                                            }}
                                                                        >
                                                                            Select
                                                                        </Button>
                                                                    </Space>
                                                                </Card>
                                                            </Col>
                                                        );
                                                    })}
                                            </Row>
                                        )
                                    }
                                ]}
                            />
                        </Card>
                    </Col>

                    {/* Sidebar - Selection Summary */}
                    <Col xs={24} md={6}>
                        <Card variant="outlined" styles={{ body: { padding: 20 } }}>
                            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>Selected Package</Text>
                                    <Text strong type="secondary">{selectedPackage ? `${selectedPackage.qty} PINK` : "-"}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>Status</Text>
                                    <Text strong type="secondary" style={{ textTransform: 'capitalize' }}>pending</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>Rate</Text>
                                    <Text strong type="success">{selectedPackage ? `${(selectedPackage.amount / selectedPackage.qty).toLocaleString()} VND` : "-"}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>Amount</Text>
                                    <Text strong type="warning">{selectedPackage ? `${selectedPackage.amount.toLocaleString()} VND` : "-"}</Text>
                                </div>

                                <Divider style={{ margin: "4px 0" }} />

                                <Form.Item label={<Text strong>Note</Text>} name="note" style={{ marginBottom: 0 }}>
                                    <TextArea rows={3} placeholder="Add a note..." />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    style={{ marginTop: 15, background: "#3594D0", fontWeight: 600 }}
                                    disabled={!selectedPackage}
                                >
                                    Confirm Order
                                </Button>
                            </Space>
                        </Card>
                    </Col>

                    {/* Full Width Bottom - Purchase History */}
                    <Col span={24}>
                        <Card title={<Text strong style={{ fontSize: 16 }}>Purchase History</Text>} variant="outlined">
                            <Table
                                columns={historyColumns}
                                dataSource={logs}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                                }}
                                scroll={{ x: 1000 }}
                            />
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}

