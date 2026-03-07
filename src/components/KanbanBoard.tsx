"use client";

import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { App, Card, Typography, Checkbox, Dropdown, Popconfirm, Button, Tag, Avatar, Tooltip, Space } from "antd";
import {
    DownOutlined,
    DeleteOutlined,
    MessageOutlined,
    ThunderboltFilled,
    GlobalOutlined,
    UserOutlined
} from "@ant-design/icons";
import { useKanbanStore, canMoveTask, UserRole } from "@/store/boardStore";

const { Text } = Typography;

const KANBAN_COLUMNS = [
    { id: "DRAFT", title: "Draft" },
    { id: "NEW", title: "New" },
    { id: "TODO", title: "Todo" },
    { id: "DOING", title: "Doing" },
    { id: "CHECK", title: "Check" },
    { id: "IN_REVIEW", title: "In Review" },
    { id: "NEED_FIX", title: "Need Fix" },
    { id: "DONE", title: "Done" },
    { id: "ARCHIVED", title: "Archived" },
];

interface KanbanBoardProps {
    initialItems: any[];
    onStatusChange: (sku: string, newStatus: string) => Promise<void>;
    onDelete: (sku: string, e: React.MouseEvent) => void;
    onCardClick: (sku: string) => void;
}

export default function KanbanBoard({ initialItems, onStatusChange, onDelete, onCardClick }: KanbanBoardProps) {
    const { message } = App.useApp();
    const { ideas, setIdeas, moveIdea, role, setRole } = useKanbanStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setIdeas(initialItems);
    }, [initialItems, setIdeas]);

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const fromStatus = source.droppableId;
        const toStatus = destination.droppableId;

        // Role Validation
        if (!canMoveTask(role, fromStatus, toStatus)) {
            message.error(`Your role (${role}) is not allowed to move task from ${fromStatus} to ${toStatus}.`);
            return;
        }

        // Optimistic UI Update
        moveIdea(draggableId, toStatus);

        // Server update
        try {
            await onStatusChange(draggableId, toStatus);
        } catch (e) {
            message.error("Failed to move task.");
            setIdeas(initialItems);
        }
    };

    if (!isClient) return null;

    return (
        <div style={{ paddingBottom: 16 }}>
            {/* Quick Role Switcher for Debugging */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Text strong>Simulate Role:</Text>
                {['SUPER_ADMIN', 'CLIENT_MANAGER', 'CLIENT_USER', 'DESIGN_MANAGER', 'DESIGNER'].map(r => (
                    <Button
                        key={r}
                        size="small"
                        type={role === r ? "primary" : "default"}
                        onClick={() => setRole(r as UserRole)}
                    >
                        {r}
                    </Button>
                ))}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, minHeight: 'calc(100vh - 350px)' }}>
                    {KANBAN_COLUMNS.map(column => {
                        const columnIdeas = ideas.filter(idea => idea.status === column.id);

                        return (
                            <Droppable droppableId={column.id} key={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                            background: snapshot.isDraggingOver ? "#e6f7ff" : "#F4F6F8",
                                            padding: 12,
                                            width: 300,
                                            minWidth: 300,
                                            borderRadius: 8,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 12,
                                            border: "1px solid #E4E8EB"
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, color: "#454F5B", display: 'flex', justifyContent: 'space-between' }}>
                                            {column.title}
                                            <Tag style={{ borderRadius: 12, border: "none", background: "#E4E8EB", color: "#454F5B" }}>{columnIdeas.length}</Tag>
                                        </div>

                                        {columnIdeas.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            opacity: snapshot.isDragging ? 0.8 : 1,
                                                        }}
                                                    >
                                                        <Card
                                                            hoverable
                                                            onClick={() => onCardClick(item.id)}
                                                            className={item.is_urgent ? "urgent-card-glow" : ""}
                                                            style={{
                                                                borderRadius: 8,
                                                                border: item.is_urgent ? "1px solid #ff4d4f" : "1px solid #E4E8EB",
                                                                padding: 0,
                                                                position: "relative",
                                                                boxShadow: snapshot.isDragging ? "0 8px 20px rgba(0,0,0,0.15)" : "none",
                                                                overflow: "hidden"
                                                            }}
                                                            styles={{ body: { padding: 12 } }}
                                                        >
                                                            {/* Board Tag */}
                                                            <div style={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}>
                                                                <Tag color="blue" style={{ margin: 0, fontSize: 10, background: 'rgba(230, 247, 255, 0.9)' }}>
                                                                    {item.boardTitle || "No Board"}
                                                                </Tag>
                                                            </div>

                                                            {/* Urgent / Public Badges */}
                                                            <div style={{ position: "absolute", top: 8, right: 30, zIndex: 2, display: 'flex', gap: 4 }}>
                                                                {item.is_urgent && (
                                                                    <Tooltip title="Urgent Design">
                                                                        <ThunderboltFilled style={{ color: '#ff4d4f', fontSize: 16 }} />
                                                                    </Tooltip>
                                                                )}
                                                                {item.is_public && (
                                                                    <Tooltip title="Public Design">
                                                                        <GlobalOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                                                                    </Tooltip>
                                                                )}
                                                            </div>

                                                            <Checkbox
                                                                style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />

                                                            {/* Image Wrapper */}
                                                            <div
                                                                style={{
                                                                    width: "100%",
                                                                    aspectRatio: "1.4",
                                                                    background: `url(${item.image}) center/cover no-repeat`,
                                                                    backgroundColor: "#f5f5f5",
                                                                    borderRadius: 6,
                                                                    marginBottom: 10,
                                                                    pointerEvents: "none",
                                                                    borderBottom: '1px solid #f0f0f0'
                                                                }}
                                                            />

                                                            {/* Content Info */}
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                                                    <Text ellipsis title={item.title} style={{ color: "#262626", fontSize: 13, fontWeight: 600 }}>
                                                                        {item.title || item.id}
                                                                    </Text>
                                                                    <Text style={{ color: "#3594D0", fontSize: 11, fontWeight: 500, marginTop: -2 }}>
                                                                        {item.id}
                                                                    </Text>
                                                                </div>
                                                                <Popconfirm title="Delete this task?" onConfirm={(e: any) => onDelete(item.id, e)} onCancel={(e: any) => e.stopPropagation()}>
                                                                    <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 14 }} />} style={{ padding: 0, height: "auto" }} onClick={(e) => e.stopPropagation()} />
                                                                </Popconfirm>
                                                            </div>

                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                                                                <Space size={8}>
                                                                    {item.commentCount > 0 && (
                                                                        <Space size={2}>
                                                                            <MessageOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                                                                            <Text type="secondary" style={{ fontSize: 12 }}>{item.commentCount}</Text>
                                                                        </Space>
                                                                    )}
                                                                    {role !== 'DESIGNER' && item.kpi > 0 && (
                                                                        <Tag color="orange" style={{ margin: 0, fontSize: 10, border: 'none' }}>
                                                                            {item.kpi.toFixed(2)} PINK
                                                                        </Tag>
                                                                    )}
                                                                </Space>

                                                                {item.designer ? (
                                                                    <Tooltip title={`Designer: ${item.designer.full_name}`}>
                                                                        <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                                                                            {item.designer.full_name?.charAt(0) || 'D'}
                                                                        </Avatar>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Tooltip title="Unassigned">
                                                                        <Avatar size="small" icon={<UserOutlined />} style={{ background: '#f5f5f5', color: '#bfbfbf' }} />
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}
