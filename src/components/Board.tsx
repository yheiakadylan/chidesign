"use client";

import React, { useState, useContext } from "react";
import { AppContext } from "./Layout";
import {
    Tabs,
    Input,
    Button,
    Space,
    Card,
    Tag,
    Typography,
    Checkbox,
    Pagination,
    Select,
} from "antd";
import {
    SearchOutlined,
    AppstoreOutlined,
    BarsOutlined,
    DeleteOutlined,
    InboxOutlined,
    MoreOutlined
} from "@ant-design/icons";
import Icon from "@ant-design/icons";
import AddTaskModal from "./AddTaskModal";
import TaskDetailModal from "./TaskDetailModal";

const EllipsisSvg = () => (
    <svg viewBox="64 64 896 896" focusable="false" data-icon="ellipsis" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"></path>
    </svg>
);

const { Text } = Typography;

const STATUSES = [
    { label: "Draft", count: 17 },
    { label: "New", count: 0 },
    { label: "Todo", count: 0 },
    { label: "Doing", count: 0 },
    { label: "Check", count: 0 },
    { label: "In Review", count: 12 },
    { label: "Need Fix", count: 0 },
    { label: "Done", count: 4839 },
    { label: "Archived", count: 13 },
    { label: "All", count: 4881 },
];

const mockItems = [
    { id: "3977115289", image: "https://via.placeholder.com/300?text=Flag+1", kpi: 1.0, tags: ["Clone", "T-shirt"] },
    { id: "3977554079", image: "https://via.placeholder.com/300?text=Flag+2", kpi: 1.0, tags: ["Clone", "T-shirt"] },
    { id: "3974981242", image: "https://via.placeholder.com/300?text=Gift+Msg", kpi: 1.0, tags: ["Clone", "T-shirt"] },
    { id: "3978253311", image: "https://via.placeholder.com/300?text=Be+Mine", kpi: 1.0, tags: ["Clone", "T-shirt"] },
    { id: "3975553442", image: "https://via.placeholder.com/300?text=Blanket", kpi: 1.0, tags: ["Clone", "T-shirt"] },
];

export default function Board() {
    const { selectedBoardId } = useContext(AppContext);

    const [isKanban, setIsKanban] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState("");

    const tabItems = STATUSES.map((status) => ({
        key: status.label,
        label: (
            <Space size="small">
                <span>{status.label}</span>
                <Tag style={{ borderRadius: 12, border: "none", background: "#E4E8EB" }}>{status.count}</Tag>
            </Space>
        ),
    }));

    return (
        <div>
            {/* Top Toolbar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    gap: 16
                }}
            >
                {selectedBoardId !== "all" ? (
                    <Space.Compact style={{ flexShrink: 0 }}>
                        <Button type="primary" style={{ backgroundColor: "#3594D0" }} onClick={() => setIsModalOpen(true)}>
                            Add Task
                        </Button>
                        <Button type="primary" icon={<Icon component={EllipsisSvg} />} style={{ backgroundColor: "#3594D0" }} />
                    </Space.Compact>
                ) : (
                    <div style={{ flexShrink: 0 }}></div>
                )}

                <Input
                    prefix={<SearchOutlined style={{ color: "#A0AAB3" }} />}
                    placeholder="Search..."
                    style={{ flexGrow: 1, borderRadius: 6, height: 36 }}
                />
                <Button style={{ height: 36 }}>More filters</Button>
            </div>

            <AddTaskModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={() => setIsModalOpen(false)}
            />

            <TaskDetailModal
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                taskId={selectedTaskId}
            />

            {/* Tabs Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #E4E8EB" }}>
                <Tabs defaultActiveKey="Draft" items={tabItems} style={{ marginBottom: -1 }} />
                <Space>
                    <Checkbox>All</Checkbox>
                    <Button disabled style={{ backgroundColor: "#f5f5f5", color: "#bfbfbf", border: "1px solid #d9d9d9" }}>0 selected</Button>
                    <Button icon={<MoreOutlined />} />
                </Space>
            </div>

            {/* Pagination Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <Space>
                    <div style={{ border: "1px solid #E4E8EB", padding: "4px 12px", borderRadius: 6, background: "#fff", display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: 16 }}>1-17 of 17 items</span>
                        <Pagination simple defaultCurrent={1} total={17} style={{ display: "inline-block" }} />
                    </div>
                    <Select defaultValue="50 / page" style={{ width: 120 }} options={[{ value: '50', label: '50 / page' }]} />
                </Space>

                <Space>
                    <Button
                        type="text"
                        icon={<AppstoreOutlined style={{ fontSize: 20, color: isKanban ? "#1890ff" : "#8c8c8c" }} />}
                        onClick={() => setIsKanban(true)}
                    />
                    <Button
                        type="text"
                        icon={<BarsOutlined style={{ fontSize: 20, color: !isKanban ? "#1890ff" : "#8c8c8c" }} />}
                        onClick={() => setIsKanban(false)}
                    />
                </Space>
            </div>

            {/* Grid View vs List View */}
            {isKanban ? (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 16,
                        paddingBottom: 40,
                    }}
                >
                    {/* Placeholder Card */}
                    <Card
                        hoverable
                        style={{
                            borderRadius: 6,
                            border: "1px dashed #d9d9d9",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 280
                        }}
                        styles={{ body: { padding: 12, textAlign: "center", width: "100%" } }}
                    >
                        <div style={{ color: "#3594D0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                            <InboxOutlined style={{ fontSize: 48 }} />
                            <Text style={{ color: "#5c6b77" }}>Click or drag images to create cards</Text>
                        </div>
                    </Card>

                    {/* Real Cards */}
                    {mockItems.map((item, index) => (
                        <Card
                            key={index}
                            hoverable
                            onClick={() => { setSelectedTaskId(item.id); setIsDetailOpen(true); }}
                            style={{
                                borderRadius: 6,
                                border: "1px solid #E4E8EB",
                                padding: 0,
                                position: "relative",
                            }}
                            styles={{ body: { padding: 12 } }}
                        >
                            {/* Absolute Tags & Checkbox */}
                            <div style={{ position: "absolute", top: 8, left: 8, zIndex: 2, background: "#fff", borderRadius: 4, padding: "2px 6px", border: "1px solid #b7eb8f", color: "#52c41a", fontSize: 11 }}>
                                Fulfill Vikcom
                            </div>
                            <Checkbox
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    zIndex: 2,
                                    transform: "scale(1.2)"
                                }}
                            />

                            {/* Image Wrapper */}
                            <div
                                style={{
                                    width: "100%",
                                    aspectRatio: "1",
                                    background: `url(${item.image}) center/cover no-repeat`,
                                    backgroundColor: "#E4E8EB",
                                    borderRadius: 4,
                                    marginBottom: 12,
                                }}
                            />

                            {/* Content Info */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Text style={{ color: "#3594D0", fontSize: 13, fontWeight: 500 }}>
                                    {item.id}
                                </Text>
                                <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 16 }} />} style={{ padding: 0, height: "auto" }} />
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 8, flexWrap: "wrap" }}>
                                <Text type="warning" style={{ color: "#faad14", fontWeight: 500, fontSize: 12 }}>
                                    KPI: {item.kpi.toFixed(2)}
                                </Text>
                                {item.tags.map(t => (
                                    <Text type="secondary" style={{ fontSize: 12 }} key={t}>{t}</Text>
                                ))}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8c8c8c" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8c8c8c" }}></div>
                                    Mar 04, 26 10:12
                                </div>
                                <span>Mar 04, 26 10:12</span>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                /* List View */
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 40 }}>
                    {/* Header row */}
                    <div style={{ display: "flex", padding: "12px 16px", borderBottom: "1px solid #E4E8EB", fontWeight: 500, color: "#454F5B" }}>
                        <Checkbox style={{ marginRight: 16 }} />
                        <div style={{ width: 60, marginRight: 16 }}>Mockup</div>
                        <div style={{ flexGrow: 1 }}>Title</div>
                        <div style={{ width: 140 }}>Update At</div>
                        <div style={{ width: 80, textAlign: "right" }}>Actions</div>
                    </div>
                    {/* List items */}
                    {mockItems.map((item, index) => (
                        <div
                            key={index}
                            style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #E4E8EB", cursor: "pointer" }}
                            onClick={() => { setSelectedTaskId(item.id); setIsDetailOpen(true); }}
                        >
                            <Checkbox style={{ marginRight: 16 }} onClick={(e) => e.stopPropagation()} />
                            <div
                                style={{
                                    width: 60,
                                    height: 60,
                                    background: `url(${item.image}) center/cover no-repeat`,
                                    backgroundColor: "#E4E8EB",
                                    borderRadius: 4,
                                    marginRight: 16,
                                    flexShrink: 0
                                }}
                            />
                            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                                <Text style={{ color: "#3594D0", fontWeight: 500 }}>{item.id}</Text>
                                <div style={{ display: "flex", gap: 12, color: "#8c8c8c", fontSize: 13 }}>
                                    <Text type="warning" style={{ color: "#faad14" }}>KPI: {item.kpi.toFixed(2)}</Text>
                                    {item.tags.map(t => <span key={t}>{t}</span>)}
                                </div>
                                <div><Tag style={{ borderRadius: 12, border: "1px solid #b7eb8f", color: "#52c41a", background: "#fff" }}>Fulfill Vikcom</Tag></div>
                            </div>
                            <div style={{ width: 140, color: "#8c8c8c", fontSize: 13 }}>
                                <div>Created At:<br />Feb 16, 2026</div>
                                <div style={{ marginTop: 4 }}>Updated At:<br />Mar 04, 2026</div>
                            </div>
                            <div style={{ width: 80, textAlign: "right" }}>
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
