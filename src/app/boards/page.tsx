"use client";
import React from 'react';
import { Table, Button, Input, Space, Avatar, Typography } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function BoardsPage() {
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <a style={{ color: "#3594D0", fontWeight: 500 }}>{text}</a>,
        },
        {
            title: 'Client',
            dataIndex: 'client',
            key: 'client',
            render: (client: { name: string; email: string }) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text>{client.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{client.email}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Space size="middle">
                    <Button type="text" style={{ color: "#1890ff" }} icon={<EditOutlined />} />
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Space>
            ),
        },
    ];

    const data = [
        { key: '1', title: 'Q1 Campaign Boards', client: { name: 'Vikcom', email: 'admin@vikcom.io' } },
        { key: '2', title: 'Summer Sale Assets', client: { name: 'PinkTeam', email: 'contact@pink.io' } },
        { key: '3', title: 'Mug Design Contest', client: { name: 'Duyen', email: 'team@pink.io' } },
    ];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Boards</Title>
                <Space>
                    <Input prefix={<SearchOutlined />} placeholder="Search boards..." style={{ width: 250 }} />
                    <Button type="primary" icon={<PlusOutlined />} style={{ background: "#FF4D4F" }}>Add New</Button>
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                rowSelection={{ type: 'checkbox' }}
                pagination={{ pageSize: 10 }}
                style={{ border: '1px solid #E4E8EB', borderRadius: 8, overflow: 'hidden' }}
            />
        </div>
    );
}
