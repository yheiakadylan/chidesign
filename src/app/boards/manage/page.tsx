"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Button, Table, Space, Tag, Modal, Form, Input, App, Avatar, Divider, Select } from "antd";
import {
    TeamOutlined,
    ArrowLeftOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined
} from "@ant-design/icons";
import { getClientBoards, createNewBoard, deleteBoard } from '@/actions/boardManagement.actions';
import { getAllDesigners, updateBoardDesigners } from '@/actions/admin.actions';
import { getCurrentUser } from '@/actions/auth.actions';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function BoardManagementPage() {
    const router = useRouter();
    const { message } = App.useApp();
    const [boards, setBoards] = useState<any[]>([]);
    const [filteredBoards, setFilteredBoards] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDesignerModalOpen, setIsDesignerModalOpen] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState<any>(null);
    const [allDesigners, setAllDesigners] = useState<any[]>([]);
    const [selectedDesignerIds, setSelectedDesignerIds] = useState<string[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        const [boardsData, designersRes, user] = await Promise.all([
            getClientBoards(),
            getAllDesigners(),
            getCurrentUser()
        ]);
        setBoards(boardsData || []);
        setFilteredBoards(boardsData || []);
        if (designersRes?.success) setAllDesigners(designersRes.designers || []);
        setCurrentUser(user);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = boards.filter(b =>
            b.title.toLowerCase().includes(searchText.toLowerCase()) ||
            b.client?.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            b.client?.email?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredBoards(filtered);
    }, [searchText, boards]);

    const handleCreate = async (values: any) => {
        setLoading(true);
        const res = await createNewBoard({
            title: values.title,
            isPublic: false, // Boards don't need public/private per user request
            defaultKpi: values.defaultKpi || 1.0
        });
        setLoading(false);

        if (res.error) {
            message.error(res.error);
        } else {
            message.success("Board created successfully");
            setIsModalOpen(false);
            form.resetFields();
            fetchData();
        }
    };

    const handleAssignDesigners = async () => {
        if (!selectedBoard) return;
        setLoading(true);
        const res = await updateBoardDesigners(selectedBoard.id, selectedDesignerIds);
        setLoading(false);
        if (res.success) {
            message.success("Designers assigned successfully");
            setIsDesignerModalOpen(false);
            fetchData();
        } else {
            message.error(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this board?',
            content: 'This action cannot be undone and will delete all tasks within this board.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                setLoading(true);
                const res = await deleteBoard(id);
                setLoading(false);
                if (res.success) {
                    message.success("Board deleted successfully");
                    fetchData();
                } else {
                    message.error(res.error);
                }
            }
        });
    };

    const userRoles = currentUser?.roles?.map((r: any) => r.name) || [];
    const isAdmin = currentUser?.is_supper_admin || userRoles.includes('ADMIN');

    const columns: any[] = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => (
                <Button type="link" style={{ padding: 0, fontWeight: 600, color: "#3594D0" }}>
                    {text}
                </Button>
            )
        },
        {
            title: 'Client',
            key: 'client',
            render: (record: any) => (
                <Space>
                    <Avatar
                        size={30}
                        style={{ backgroundColor: '#A0AAB3', color: '#fff' }}
                    >
                        {record.client?.full_name?.substring(0, 1).toUpperCase() || "L"}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.2 }}>{record.client?.full_name || "Lê Bảo Vi"}</div>
                        <Text type="secondary" italic style={{ fontSize: 12 }}>{record.client?.email || "Teeazm@gmail.com"}</Text>
                    </div>
                </Space>
            )
        }
    ];

    // Administrator columns for Designer Management
    if (isAdmin) {
        columns.push({
            title: 'Designers',
            key: 'designers',
            render: (record: any) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {record.designers?.length > 0 ? (
                        record.designers.map((d: any) => (
                            <Tag key={d.id} icon={<UserOutlined />} color="cyan" style={{ fontSize: 11 }}>
                                {d.full_name || d.email}
                            </Tag>
                        ))
                    ) : (
                        <Text type="secondary" italic style={{ fontSize: 11 }}>None assigned</Text>
                    )}
                </div>
            )
        });
    }

    columns.push({
        title: 'Action',
        key: 'actions',
        align: 'center' as const,
        render: (record: any) => (
            <Space>
                {isAdmin && (
                    <Button
                        size="small"
                        type="link"
                        icon={<TeamOutlined />}
                        onClick={() => {
                            setSelectedBoard(record);
                            setSelectedDesignerIds(record.designers?.map((d: any) => d.id) || []);
                            setIsDesignerModalOpen(true);
                        }}
                    >
                        Assign
                    </Button>
                )}
                <Button
                    type="link"
                    icon={<EditOutlined style={{ color: "#3594D0" }} />}
                />
                <Button
                    type="link"
                    icon={<DeleteOutlined style={{ color: "red" }} />}
                    onClick={() => handleDelete(record.id)}
                />
            </Space>
        )
    });

    return (
        <div style={{ height: "100%", overflow: "hidden auto" }}>
            <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 15 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => router.back()}
                            style={{ fontSize: 18, border: 0, background: 'transparent' }}
                        />
                        <Title level={4} style={{ margin: 0 }}>Boards</Title>
                        <div style={{ marginLeft: "auto" }}>
                            <Button
                                type="primary"
                                style={{ background: "#3594D0" }}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Add New
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="header-filter">
                    <div style={{ maxWidth: 600 }}>
                        <Input
                            placeholder="Search..."
                            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                            size="large"
                            style={{ borderRadius: 4 }}
                        />
                    </div>
                </div>

                <Divider style={{ margin: "20px 0" }} />

                <div className="BoardList__Container">
                    <Table
                        columns={columns}
                        dataSource={filteredBoards}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 20,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            position: ['bottomRight']
                        }}
                        size="middle"
                        rowSelection={{ type: 'checkbox' }}
                        style={{ border: "none" }}
                    />
                </div>
            </div>

            <Modal
                title="Create New Board"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Create Board"
                okButtonProps={{ style: { background: "#3594D0" } }}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 24 }}>
                    <Form.Item
                        name="title"
                        label="Board Name"
                        rules={[{ required: true, message: 'Please enter a board name' }]}
                    >
                        <Input placeholder="e.g. Fulfill Store A" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="defaultKpi"
                        label="Default KPI (PINK per task)"
                        initialValue={1.0}
                    >
                        <Input type="number" step="0.5" size="large" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={`Assign Designers: ${selectedBoard?.title}`}
                open={isDesignerModalOpen}
                onCancel={() => setIsDesignerModalOpen(false)}
                onOk={handleAssignDesigners}
                confirmLoading={loading}
            >
                <div style={{ marginTop: 16 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                        Select designers who will be able to see and work on tasks in this board.
                    </Text>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select designers..."
                        value={selectedDesignerIds}
                        onChange={setSelectedDesignerIds}
                        options={allDesigners.map(d => ({ value: d.id, label: d.full_name || d.email }))}
                    />
                </div>
            </Modal>
        </div>
    );
}
