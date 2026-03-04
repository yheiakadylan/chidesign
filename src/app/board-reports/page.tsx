"use client";
import React from 'react';
import { Table, DatePicker, Typography, Space, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function BoardReportsPage() {
    const columns = [
        {
            title: 'Board Title',
            dataIndex: 'title',
            key: 'title',
            render: (t: string) => <a style={{ color: "#3594D0", fontWeight: 500 }}>{t}</a>,
            sorter: true
        },
        {
            title: 'Total Pink',
            dataIndex: 'totalPink',
            key: 'totalPink',
            sorter: true,
            render: (v: number) => <span style={{ color: "#FF4D4F", fontWeight: 500 }}>{v}</span>
        },
        {
            title: 'Total Card',
            dataIndex: 'totalCard',
            key: 'totalCard',
            sorter: true
        },
        {
            title: 'Total Amount (VND)',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            sorter: true
        },
    ];

    const data = [
        { key: '1', title: 'Valentine 2026 Collection', totalPink: 15.5, totalCard: 120, totalAmount: '341,000.00' },
        { key: '2', title: 'Summer T-Shirts', totalPink: 10, totalCard: 85, totalAmount: '220,000.00' },
        { key: '3', title: 'Q1 Merch Ideas', totalPink: 5, totalCard: 40, totalAmount: '110,000.00' },
    ];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
                <Title level={4} style={{ margin: 0 }}>Board Reports</Title>
                <Space size="middle">
                    <RangePicker style={{ width: 260 }} />
                    <Input prefix={<SearchOutlined />} placeholder="Search title..." style={{ width: 250 }} />
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 15 }}
                style={{ border: '1px solid #E4E8EB', borderRadius: 8, overflow: 'hidden' }}
            />
        </div>
    );
}
