"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Table, DatePicker, Typography, Space, Input, Avatar, Tooltip, Empty, Spin, Button } from "antd";
import { SearchOutlined, FolderOutlined, UserOutlined, MenuOutlined, SwapRightOutlined } from "@ant-design/icons";
import { getBoardReports } from '@/actions/finance.actions';
import dayjs from 'dayjs';
import type { MenuProps } from 'antd';
import { Dropdown, Row, Col } from 'antd';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

export default function BoardReportsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    // UI Local State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
        dayjs().startOf('month'),
        dayjs()
    ]);
    const [dateRangeKey, setDateRangeKey] = useState<string | null>(null);

    // Initialize state from URL params
    useEffect(() => {
        const offset = parseInt(searchParams.get('offset') || '0');
        const limit = parseInt(searchParams.get('limit') || '15');
        const q = searchParams.get('q') || '';
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const drKey = searchParams.get('dateRange');

        setPage(Math.floor(offset / limit) + 1);
        setSearch(q);

        if (drKey) {
            setDateRangeKey(drKey);
            applyQuickSelect(drKey);
        } else if (from && to) {
            setDateRange([dayjs(from), dayjs(to)]);
            setDateRangeKey(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.replace(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const fetchReports = async () => {
        setLoading(true);
        const startDate = dateRange[0]?.startOf('day').toISOString();
        const endDate = dateRange[1]?.endOf('day').toISOString();

        const res = await getBoardReports(page, 15, search, startDate, endDate);
        if (res.success) {
            setReports(res.hits || []);
            setTotal(res.count || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();

        // Update URL
        const offset = (page - 1) * 15;
        updateUrl({
            offset: offset > 0 ? offset.toString() : null,
            limit: '15',
            q: search || null,
            from: dateRangeKey ? null : dateRange[0]?.format('YYYY-MM-DD') || null,
            to: dateRangeKey ? null : dateRange[1]?.format('YYYY-MM-DD') || null,
            dateRange: dateRangeKey || null
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, dateRange]);

    const applyQuickSelect = (key: string) => {
        const now = dayjs();
        let range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [null, null];
        switch (key) {
            case 'today':
                range = [now.startOf('day'), now.endOf('day')];
                break;
            case 'yesterday':
                range = [now.subtract(1, 'day').startOf('day'), now.subtract(1, 'day').endOf('day')];
                break;
            case 'last7days':
                range = [now.subtract(7, 'days').startOf('day'), now.endOf('day')];
                break;
            case 'last30days':
                range = [now.subtract(30, 'days').startOf('day'), now.endOf('day')];
                break;
            case 'thisWeek':
                range = [now.startOf('week'), now];
                break;
            case 'thisMonth':
                range = [now.startOf('month'), now];
                break;
            case 'lastMonth':
                range = [now.subtract(1, 'month').startOf('month'), now.subtract(1, 'month').endOf('month')];
                break;
            case 'last3month':
                range = [now.subtract(3, 'months').startOf('month'), now.subtract(1, 'month').endOf('month')];
                break;
            case 'thisYear':
                range = [now.startOf('year'), now];
                break;
            case 'lastYear':
                range = [now.subtract(1, 'year').startOf('year'), now.subtract(1, 'year').endOf('year')];
                break;
        }
        if (range[0]) {
            setDateRange(range);
        }
    };

    const handleQuickSelect = (key: string) => {
        setDateRangeKey(key);
        applyQuickSelect(key);
    };

    const dateMenu: MenuProps['items'] = [
        { key: 'today', label: 'Today', onClick: () => handleQuickSelect('today') },
        { key: 'yesterday', label: 'Yesterday', onClick: () => handleQuickSelect('yesterday') },
        { key: 'last7days', label: 'Last 7 days', onClick: () => handleQuickSelect('last7days') },
        { key: 'last30days', label: 'Last 30 days', onClick: () => handleQuickSelect('last30days') },
        { key: 'thisWeek', label: 'This week', onClick: () => handleQuickSelect('thisWeek') },
        { key: 'thisMonth', label: 'This month', onClick: () => handleQuickSelect('thisMonth') },
        { key: 'lastMonth', label: 'Last month', onClick: () => handleQuickSelect('lastMonth') },
        { key: 'last3month', label: 'Last 3 month', onClick: () => handleQuickSelect('last3month') },
        { key: 'thisYear', label: 'This year', onClick: () => handleQuickSelect('thisYear') },
        { key: 'lastYear', label: 'Last year', onClick: () => handleQuickSelect('lastYear') },
    ];

    const columns = [
        {
            title: 'Board Title',
            key: 'board',
            render: (_: any, record: any) => (
                <Button type="link" style={{ padding: 0 }}>
                    {record.board.title}
                </Button>
            ),
            sorter: (a: any, b: any) => a.board.title.localeCompare(b.board.title)
        },
        {
            title: 'Total Pink',
            dataIndex: 'total_pink',
            key: 'total_pink',
            align: 'right' as const,
            sorter: (a: any, b: any) => a.total_pink - b.total_pink,
            render: (v: number) => (
                <Text>{v.toFixed(2).toLocaleString()}</Text>
            )
        },
        {
            title: 'Total Card',
            dataIndex: 'total_card',
            key: 'total_card',
            align: 'right' as const,
            sorter: (a: any, b: any) => a.total_card - b.total_card,
            render: (v: number) => (
                <Text>{v.toLocaleString()}</Text>
            )
        },
        {
            title: 'Total Amount (VND)',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right' as const,
            sorter: (a: any, b: any) => a.total_amount - b.total_amount,
            render: (v: number) => (
                <Text>{v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            )
        },
    ];

    return (
        <div style={{ padding: '0 24px 24px' }}>
            <div style={{ padding: '20px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Board Balance Reports</Title>
                <Text type="secondary">Detailed summary of PINK usage and card counts across boards.</Text>
            </div>

            <div className="header-filter" style={{ marginBottom: 16 }}>
                <Row gutter={[8, 8]}>
                    <Col xs={24} md={18}>
                        <Search
                            placeholder="Search by board title..."
                            allowClear
                            onSearch={val => {
                                setSearch(val);
                                setPage(1);
                            }}
                            onChange={e => {
                                if (!e.target.value) {
                                    setSearch('');
                                    setPage(1);
                                }
                            }}
                            style={{ width: '100%' }}
                            enterButton
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <div style={{ display: 'flex' }}>
                            <RangePicker
                                style={{ width: '100%', borderRadius: '4px 0 0 4px' }}
                                value={dateRange}
                                onChange={(dates) => {
                                    setDateRange(dates as any);
                                    setDateRangeKey(null);
                                    setPage(1);
                                }}
                                format="MMM DD, YYYY"
                                separator={<SwapRightOutlined />}
                            />
                            <Dropdown menu={{ items: dateMenu }} trigger={['click']}>
                                <Button
                                    icon={<MenuOutlined />}
                                    style={{ borderRadius: '0 4px 4px 0', borderLeft: 'none' }}
                                />
                            </Dropdown>
                        </div>
                    </Col>
                </Row>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Spin size="large" description="Loading reports..." />
                </div>
            ) : reports.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={reports}
                    rowKey="board_id"
                    pagination={{
                        current: page,
                        total: total,
                        pageSize: 15,
                        onChange: (p) => setPage(p),
                        showSizeChanger: false,
                        showTotal: (total) => `Total ${total} boards`
                    }}
                    style={{
                        background: '#fff',
                        borderRadius: 8,
                        overflow: 'hidden',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                    }}
                />
            ) : (
                <Empty description="No reports found" style={{ padding: '100px 0' }} />
            )}

            <style jsx global>{`
                .ant-table-thead > tr > th {
                    background: #fafafa !important;
                    font-weight: 600 !important;
                    color: #454F5B !important;
                }
                .ant-table-row:hover {
                    background: #fdfdfd !important;
                }
                .ant-input-search-button {
                    background-color: #3594D0 !important;
                    border-color: #3594D0 !important;
                }
            `}</style>
        </div>
    );
}
