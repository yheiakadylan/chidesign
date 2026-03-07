"use client";

import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Typography, Space, Button, Input, Select, DatePicker, Upload, Tabs, Timeline, Avatar, Divider, Spin, Tag, Image, App, Switch } from "antd";
import { getTaskDetails, addComment, editComment, deleteComment, updateTaskFields, getDesignerOptions, getProductTypeOptions, addAttachment, deleteTaskAttachment, renameAttachment } from "@/actions/taskDetail.actions";
import { getFulfillmentTemplates } from "@/actions/template.actions";
import {
    PaperClipOutlined,
    EditOutlined,
    CopyOutlined,
    UploadOutlined,
    FontSizeOutlined,
    FileTextOutlined,
    MessageOutlined,
    PushpinOutlined,
    UserAddOutlined,
    AppstoreOutlined,
    OneToOneOutlined,
    FieldNumberOutlined,
    CalendarOutlined,
    DollarOutlined,
    CloseOutlined,
    PlusOutlined,
    DeleteOutlined,
    CheckOutlined,
    FormatPainterOutlined,
    EyeOutlined,
} from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

interface TaskDetailModalProps {
    open: boolean;
    onCancel: () => void;
    onUpdate?: () => void;
    taskId: string;
}

export default function TaskDetailModal({ open, onCancel, onUpdate, taskId }: TaskDetailModalProps) {
    const { message } = App.useApp();
    const [activeTab, setActiveTab] = useState("comments");
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [designers, setDesigners] = useState<any[]>([]);
    const [productTypes, setProductTypes] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [boardTemplates, setBoardTemplates] = useState<any[]>([]);
    const [selectedTemplateKeys, setSelectedTemplateKeys] = useState<string[]>([]);

    const STATUS_COLORS: Record<string, string> = {
        'DRAFT': '#8c8c8c',
        'NEW': '#13c2c2',
        'TODO': '#1890ff',
        'DOING': '#faad14',
        'IN_REVIEW': '#722ed1',
        'NEED_FIX': '#ff4d4f',
        'DONE': '#52c41a',
        'ARCHIVED': '#bfbfbf',
    };

    const statusColor = task?.status ? STATUS_COLORS[task.status] || "#3594D0" : "#8c8c8c";
    const taskStatusLabel = task?.status ? task.status.replace(/_/g, ' ').split(' ').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ') : "Draft";

    const userRoles = currentUser?.roles?.map((r: any) => r.name) || [];
    const isAdmin = currentUser?.is_supper_admin || userRoles.includes('ADMIN');
    const isDesigner = userRoles.includes('DESIGNER');
    const isClient = userRoles.includes('CLIENT_MANAGER') || userRoles.includes('CLIENT_USER');

    // Attachment states
    const [showAddUrlForm, setShowAddUrlForm] = useState(false);
    const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
    const [editingAttachmentId, setEditingAttachmentId] = useState<string | null>(null);
    const [editingAttachmentName, setEditingAttachmentName] = useState("");

    useEffect(() => {
        if (open && taskId) {
            fetchTask();
            fetchOptions();
            fetchCurrentUser();
        }
    }, [open, taskId]);

    // Load board templates for this task's board
    useEffect(() => {
        if (open && task?.boardId) {
            getFulfillmentTemplates(task.boardId).then(setBoardTemplates);
        }
    }, [open, task?.boardId]);

    const fetchCurrentUser = async () => {
        const { getCurrentUser } = await import('@/actions/auth.actions');
        const u = await getCurrentUser();
        setCurrentUser(u);
    };

    const fetchOptions = async () => {
        const [dOptions, pOptions] = await Promise.all([
            getDesignerOptions(),
            getProductTypeOptions()
        ]);
        setDesigners(dOptions.map((d: any) => ({ value: d.id, label: d.full_name || d.email })));
        setProductTypes(pOptions.map((p: any) => ({ value: p.id, label: p.title })));
    };

    const fetchTask = async () => {
        setLoading(true);
        const data = await getTaskDetails(taskId);
        setTask(data);
        // Load previously saved template selections
        if (data?.fulfillmentTemplate) {
            try {
                const saved = JSON.parse(data.fulfillmentTemplate);
                setSelectedTemplateKeys(Array.isArray(saved) ? saved : []);
            } catch {
                setSelectedTemplateKeys([]);
            }
        } else {
            setSelectedTemplateKeys([]);
        }
        setLoading(false);
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        const res = await addComment(taskId, commentText);
        if (res.error) {
            message.error(res.error);
        } else {
            setCommentText("");
            fetchTask();
        }
    };

    const handleDeleteComment = async (activityId: string) => {
        setDeletingCommentId(activityId);
        const res = await deleteComment(activityId);
        setDeletingCommentId(null);
        if (res.error) {
            message.error(res.error);
        } else {
            fetchTask();
        }
    };

    const handleEditComment = async (activityId: string) => {
        if (!editingText.trim()) return;
        const res = await editComment(activityId, editingText);
        if (res.error) {
            message.error(res.error);
        } else {
            setEditingCommentId(null);
            setEditingText("");
            fetchTask();
        }
    };

    const handleUpdateField = async (field: string, value: any) => {
        setLoading(true);
        const res = await updateTaskFields(taskId, { [field]: value });
        if (res.error) {
            message.error(res.error);
        } else {
            message.success("Task updated");
            fetchTask();
            if (onUpdate) onUpdate();
        }
        setLoading(false);
    };

    const handleAddAttachmentFromUrl = async () => {
        if (!newAttachmentUrl.trim()) return;
        setLoading(true);
        const fileName = newAttachmentUrl.split('/').pop() || 'image_from_url';

        try {
            const res = await addAttachment(taskId, {
                url: newAttachmentUrl,
                file_name: fileName,
                file_mime: 'image/jpeg'
            });

            if (res.error) {
                message.error(res.error);
            } else {
                message.success("Image added from URL");
                setShowAddUrlForm(false);
                setNewAttachmentUrl("");
                fetchTask(); // Refresh the list
            }
        } catch (e) {
            message.error("Failed to add image");
        }
        setLoading(false);
    };

    const handleRenameAttachment = async (fileId: string) => {
        if (!editingAttachmentName.trim()) return;
        setLoading(true);
        const res = await renameAttachment(fileId, editingAttachmentName);
        if (res.error) {
            message.error(res.error);
        } else {
            message.success("Attachment renamed");
            setEditingAttachmentId(null);
            fetchTask();
        }
        setLoading(false);
    };

    const handleDeleteAttachment = async (fileId: string) => {
        setLoading(true);
        const res = await deleteTaskAttachment(taskId, fileId);
        if (res.error) {
            message.error(res.error);
        } else {
            message.success("Attachment deleted");

            // If the deleted attachment was the cover, remove coverId too
            if (task.coverId === fileId) {
                await updateTaskFields(taskId, { coverId: null });
            } else {
                fetchTask(); // otherwise just refresh
            }
        }
        setLoading(false);
    };

    const handleUploadFile = async ({ file, onSuccess, onError, onProgress }: any) => {
        try {
            // 1. Get presigned URL from our API
            const res = await fetch('/api/upload/presigned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream',
                    taskId: taskId
                })
            });

            if (!res.ok) {
                throw new Error('Failed to get presigned URL');
            }

            const { uploadUrl, fileKey, fileUrl } = await res.json();

            // 2. Upload file directly to S3
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type || 'application/octet-stream'
                }
            });

            if (!uploadRes.ok) {
                throw new Error('Failed to upload file to S3');
            }

            // 3. Save attachment info to database
            const addRes = await addAttachment(taskId, {
                url: fileUrl,
                file_name: file.name,
                file_mime: file.type || 'unknown',
                key: fileKey
            });

            if (addRes.error) {
                throw new Error(addRes.error);
            }

            message.success(`${file.name} uploaded successfully.`);
            onSuccess("Ok");
            fetchTask(); // Refresh task details to show new attachment

            // Autocover if it is the first file and we have no cover
            if (!task.coverId && file.type?.startsWith('image/')) {
                await updateTaskFields(taskId, { coverId: addRes.file?.id });
                fetchTask();
            }

        } catch (error: any) {
            console.error('Upload Error:', error);
            message.error(`${file.name} file upload failed: ${error.message}`);
            onError({ error });
        }
    };

    const comments = task?.activities?.filter((a: any) => a.type === 'comment') || [];
    const logs = task?.activities?.filter((a: any) => a.type !== 'comment') || [];

    // Tabs structure
    const tabItems = [
        {
            key: "comments",
            label: "Comments",
            children: (
                <div style={{ padding: "8px 0" }}>
                    {/* Input area */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                        <Avatar style={{ backgroundColor: "#3594D0", color: "#fff", flexShrink: 0 }}>
                            {currentUser?.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </Avatar>
                        <div style={{ flexGrow: 1 }}>
                            <TextArea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment(); }}
                                placeholder="You can enter your comment here... (Ctrl+Enter to send)"
                                rows={3}
                                style={{ marginBottom: 8, resize: "none" }}
                            />
                            <Button type="primary" onClick={handleAddComment} disabled={!commentText.trim()}
                                style={{ backgroundColor: "#3594D0" }}>Add Comment</Button>
                        </div>
                    </div>

                    {comments.length === 0 && (
                        <div style={{ color: "#8c8c8c", textAlign: "center", padding: "24px 0", fontSize: 13 }}>
                            No comments yet. Be the first to comment!
                        </div>
                    )}

                    {comments.map((comment: any) => {
                        const isOwner = currentUser?.id === comment.userId;
                        const isEditing = editingCommentId === comment.id;
                        const isDeleting = deletingCommentId === comment.id;
                        return (
                            <div key={comment.id} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                                <Avatar style={{ backgroundColor: isOwner ? "#3594D0" : "#8c8c8c", color: "#fff", flexShrink: 0 }}>
                                    {comment.user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                                </Avatar>
                                <div style={{ flexGrow: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                        <Space size={8}>
                                            <Text strong style={{ fontSize: 13 }}>{comment.user?.full_name || "Unknown"}</Text>
                                            {isOwner && <Tag color="blue" style={{ fontSize: 11, padding: "0 4px", lineHeight: "18px" }}>You</Tag>}
                                        </Space>
                                        <Space size={4}>
                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                {new Date(comment.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                            </Text>
                                            {isOwner && !isEditing && (
                                                <>
                                                    <Button type="text" size="small" icon={<EditOutlined />} style={{ color: "#8c8c8c" }}
                                                        onClick={() => { setEditingCommentId(comment.id); setEditingText(comment.message || ""); }} />
                                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} loading={isDeleting}
                                                        onClick={() => handleDeleteComment(comment.id)} />
                                                </>
                                            )}
                                        </Space>
                                    </div>
                                    {isEditing ? (
                                        <div>
                                            <TextArea value={editingText} onChange={(e) => setEditingText(e.target.value)}
                                                rows={3} style={{ marginBottom: 8, resize: "none" }} autoFocus />
                                            <Space>
                                                <Button type="primary" size="small" icon={<CheckOutlined />}
                                                    onClick={() => handleEditComment(comment.id)} disabled={!editingText.trim()}>Save</Button>
                                                <Button size="small" icon={<CloseOutlined />}
                                                    onClick={() => { setEditingCommentId(null); setEditingText(""); }}>Cancel</Button>
                                            </Space>
                                        </div>
                                    ) : (
                                        <div style={{
                                            background: isOwner ? "#E6F0FF" : "#F4F6F8",
                                            padding: "10px 14px",
                                            borderRadius: isOwner ? "12px 12px 4px 12px" : "4px 12px 12px 12px",
                                            fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word"
                                        }}>
                                            {comment.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ),
        },
        {
            key: "activities",
            label: "Activities",
            children: (
                <div style={{ padding: "16px 0 8px 16px" }}>
                    <Timeline
                        items={logs.length > 0 ? logs.map((log: any) => ({
                            color: log.type === 'status_change' ? 'green' : 'blue',
                            content: (
                                <>
                                    <div><Text strong>{log.message}</Text> - <Text type="secondary">{new Date(log.createdAt).toLocaleString()}</Text></div>
                                    <Text type="secondary">By <Text strong>{log.user?.full_name || 'System'}</Text></Text>
                                </>
                            )
                        })) : [{
                            color: "gray",
                            content: <Text type="secondary">No activities yet.</Text>
                        }]}
                    />
                </div>
            ),
        },
    ];

    const renderActionButtons = () => {
        const status = task?.status || 'DRAFT';

        switch (status) {
            case 'DRAFT':
                return (
                    <Space style={{ position: "absolute", bottom: 15, left: 15, zIndex: 999 }}>
                        <Button
                            type="primary"
                            style={{
                                backgroundColor: task?.is_urgent ? "#ff4d4f" : "#3594D0",
                            }}
                            icon={task?.is_urgent ? <CheckOutlined /> : <PlusOutlined />}
                            onClick={() => handleUpdateField('is_urgent', !task?.is_urgent)}
                            loading={loading}
                        >
                            {task?.is_urgent ? "Urgent Marked" : "Mark Urgent"}
                        </Button>
                        <Button type="primary" style={{ backgroundColor: "#10779C", borderColor: "#10779C" }} onClick={() => handleUpdateField('status', 'NEW')}>Send to Board (New)</Button>
                    </Space>
                );
            case 'NEW':
                return (
                    <Space style={{ position: "absolute", bottom: 15, left: 15, zIndex: 999 }}>
                        <Button type="primary" style={{ backgroundColor: "#1890FF" }} onClick={() => handleUpdateField('status', 'TODO')}>Ready to Work (Todo)</Button>
                    </Space>
                );
            case 'TODO':
                return (
                    <Space style={{ position: "absolute", bottom: 15, left: 15, zIndex: 999 }}>
                        <Button type="primary" style={{ backgroundColor: "#faad14", borderColor: "#faad14" }} onClick={() => handleUpdateField('status', 'DOING')}>Start Designing (Doing)</Button>
                    </Space>
                );
            case 'DOING':
                return (
                    <Space style={{ position: "absolute", bottom: 15, left: 15, zIndex: 999 }}>
                        <Button type="primary" style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }} onClick={() => handleUpdateField('status', 'IN_REVIEW')}>Send to Review</Button>
                    </Space>
                );
            case 'IN_REVIEW':
                return (
                    <Space style={{ position: "absolute", bottom: 15, right: 40, zIndex: 999 }}>
                        <Button type="primary" danger onClick={() => handleUpdateField('status', 'NEED_FIX')}>Need Fix</Button>
                        <Button type="primary" style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }} onClick={() => handleUpdateField('status', 'DONE')}>Approve (Done)</Button>
                    </Space>
                );
            case 'NEED_FIX':
                return (
                    <Space style={{ position: "absolute", bottom: 15, left: 15, zIndex: 999 }}>
                        <Button type="primary" style={{ backgroundColor: "#faad14", borderColor: "#faad14" }} onClick={() => handleUpdateField('status', 'DOING')}>Fix Finished (Back to Doing)</Button>
                    </Space>
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            width={950}
            footer={null} // No footer in this detail UI
            closable={false} // Custom close icon in header
            styles={{ body: { padding: 0, maxHeight: "90vh", overflowY: "auto", overflowX: "hidden" } }}
        >
            <Spin spinning={loading}>
                {/* Custom Header Banner */}
                <div className="header-update-idea" style={{
                    position: "relative",
                    width: "100%",
                    height: 260,
                    backgroundColor: statusColor,
                    display: "flex",
                    justifyContent: "center",
                    padding: "20px"
                }}>
                    {/* Status Tag */}
                    <Tag style={{
                        backgroundColor: "white",
                        color: statusColor,
                        position: "absolute",
                        top: 15,
                        left: 15,
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "4px 12px",
                        border: `1px solid ${statusColor}`,
                        borderRadius: "20px",
                        zIndex: 999,
                        textTransform: "capitalize"
                    }}>
                        {taskStatusLabel}
                    </Tag>

                    {/* Top Right Controls & Close */}
                    <Space style={{ position: "absolute", top: 15, right: 15, zIndex: 999, alignItems: "center" }}>
                        <Tag color="#FF5500" style={{ margin: 0, padding: "4px 8px", fontSize: 13 }}>{task?.pink?.toFixed(2) || "1.00"} Pink</Tag>
                        <div style={{ backgroundColor: "white", padding: "4px 8px", borderRadius: 4, display: "flex", gap: 8, alignItems: "center", border: "1px solid #d9d9d9" }}>
                            <span style={{ fontFamily: "monospace" }}>{task?.sku || taskId}</span>
                            <CopyOutlined style={{ cursor: "pointer", color: "#8c8c8c" }} onClick={() => { navigator.clipboard.writeText(task?.sku || taskId); message.success('Copied ID'); }} />
                        </div>
                        <Button type="text" icon={<CloseOutlined style={{ fontSize: 18, color: "#595959" }} />} onClick={onCancel} />
                    </Space>

                    {/* Image Preview - Matching PinkDesign: contain with padding */}
                    <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {task?.cover?.url ? (
                            <Image
                                src={task?.cover?.url}
                                alt="Idea Preview"
                                preview={true}
                                style={{
                                    height: 220,
                                    width: "auto",
                                    objectFit: "contain",
                                    display: "block",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    borderRadius: 4
                                }}
                            />
                        ) : (
                            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, fontWeight: 500 }}>No cover image</div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {renderActionButtons()}
                </div>

                <div style={{ padding: "24px 32px" }}>
                    <Row gutter={64}>
                        {/* Left Column (Main Info) */}
                        <Col span={16}>
                            {/* Description Section */}
                            <div style={{ marginBottom: 24 }}>
                                <Space style={{ marginBottom: 8 }}>
                                    <FontSizeOutlined style={{ fontSize: 18 }} />
                                    <Text strong style={{ fontSize: 15 }}>Description:</Text>
                                    <EditOutlined style={{ color: "#8c8c8c", cursor: "pointer" }} />
                                </Space>
                                <div style={{ marginLeft: 28, color: "#454F5B" }}>
                                    <div>{task?.title || "No Title"}</div>
                                    <div>SKU: {task?.sku || taskId}</div>
                                    <br />
                                    <div>Size: Default</div>
                                </div>
                            </div>

                            <Divider />

                            {/* Attachments Section */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                    <Space>
                                        <PaperClipOutlined style={{ fontSize: 18 }} />
                                        <Text strong style={{ fontSize: 15 }}>Attachments:</Text>
                                    </Space>
                                    <Space>
                                        <Button type="link" size="small" disabled={!task?.attachments?.length}>Download all</Button>
                                        <Button type="link" size="small" onClick={() => setShowAddUrlForm(!showAddUrlForm)}>
                                            {showAddUrlForm ? "Cancel" : "Add From Url"}
                                        </Button>
                                    </Space>
                                </div>

                                {showAddUrlForm && (
                                    <div style={{ marginLeft: 28, marginBottom: 16, display: "flex", gap: 8 }}>
                                        <Input
                                            placeholder="Add image from url"
                                            value={newAttachmentUrl}
                                            onChange={(e) => setNewAttachmentUrl(e.target.value)}
                                            style={{ flexGrow: 1 }}
                                        />
                                        <Button type="primary" onClick={handleAddAttachmentFromUrl} disabled={!newAttachmentUrl.trim()}>
                                            Add URL
                                        </Button>
                                    </div>
                                )}

                                {task?.attachments?.length > 0 && task.attachments.map((file: any) => (
                                    <div key={file.id} style={{ marginLeft: 28, marginBottom: 16, display: "flex", gap: 16 }}>
                                        <Image
                                            src={file.url}
                                            alt={file.file_name}
                                            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4, border: "1px solid #d9d9d9" }}
                                            preview={true}
                                        />
                                        <div style={{ flex: 1 }}>
                                            {editingAttachmentId === file.id ? (
                                                <div style={{ marginBottom: 8 }}>
                                                    <Input
                                                        size="small"
                                                        value={editingAttachmentName}
                                                        onChange={(e) => setEditingAttachmentName(e.target.value)}
                                                        onPressEnter={() => handleRenameAttachment(file.id)}
                                                        style={{ width: '100%', marginBottom: 4 }}
                                                        autoFocus
                                                    />
                                                    <Space size={8}>
                                                        <Button size="small" type="primary" onClick={() => handleRenameAttachment(file.id)}>Save</Button>
                                                        <Button size="small" onClick={() => setEditingAttachmentId(null)}>Cancel</Button>
                                                    </Space>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 15 }}>{file.file_name || "image.png"}</div>
                                                    <Space size="small" style={{ fontSize: 13, marginBottom: 4 }}>
                                                        <a href={file.url} download style={{ color: "#454F5B", textDecoration: "underline" }}>Download</a> •
                                                        <a style={{ color: "#454F5B", textDecoration: "underline", cursor: "pointer" }} onClick={() => handleDeleteAttachment(file.id)}>Delete</a> •
                                                        <a style={{ color: "#454F5B", textDecoration: "underline", cursor: "pointer" }}
                                                            onClick={() => {
                                                                setEditingAttachmentId(file.id);
                                                                setEditingAttachmentName(file.file_name || "");
                                                            }}>
                                                            Edit
                                                        </a>
                                                    </Space>
                                                </>
                                            )}
                                            <div
                                                style={{ fontSize: 13, color: task?.coverId === file.id ? "#3594D0" : "#8c8c8c", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
                                                onClick={() => handleUpdateField("coverId", file.id)}
                                            >
                                                <UploadOutlined /> Make cover
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ marginLeft: 28 }}>
                                    <Dragger
                                        style={{ background: "#FAFAFA", padding: 16 }}
                                        customRequest={handleUploadFile}
                                        showUploadList={false}
                                        accept="image/*"
                                        beforeUpload={(file) => {
                                            const isImage = file.type.startsWith('image/');
                                            if (!isImage) message.error(`${file.name} is not an image file`);
                                            return isImage || Upload.LIST_IGNORE;
                                        }}
                                    >
                                        <p className="ant-upload-drag-icon" style={{ margin: 0, color: "#454F5B" }}>
                                            <UploadOutlined />
                                        </p>
                                        <p className="ant-upload-text" style={{ fontSize: 13, color: "#8c8c8c" }}>Drag & Drop images here</p>
                                        <p className="ant-upload-hint" style={{ fontSize: 11, color: "#bfbfbf" }}>Supported: JPG, PNG, GIF, WEBP, SVG</p>
                                    </Dragger>
                                </div>
                            </div>

                            <Divider />

                            {/* Delivery Notice / Policy */}
                            {task?.status === 'DONE' && (
                                <div style={{
                                    marginBottom: 20,
                                    padding: '12px',
                                    backgroundColor: '#FFF1F0',
                                    border: '1px solid #FFA39E',
                                    borderRadius: 8
                                }}>
                                    <Space direction="vertical" size={4}>
                                        <Text strong style={{ color: '#CF1322', fontSize: 13 }}>⚠️ Policy Confirmation Required</Text>
                                        <Text style={{ fontSize: 12, color: '#595959' }}>
                                            Seller <strong>must</strong> check the design before fulfilling. Pink Design is not responsible for errors if not checked before printing.
                                        </Text>
                                    </Space>
                                </div>
                            )}

                            {/* Design Urls Section */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <Space>
                                        <FileTextOutlined style={{ fontSize: 18 }} />
                                        <Text strong style={{ fontSize: 15 }}>Design Urls:</Text>
                                    </Space>
                                    <CopyOutlined
                                        style={{ color: "#8c8c8c", cursor: "pointer" }}
                                        onClick={() => {
                                            if (task?.design_urls) {
                                                navigator.clipboard.writeText(task.design_urls);
                                                message.success("Copied to clipboard");
                                            }
                                        }}
                                    />
                                </div>
                                <div style={{ marginLeft: 28 }}>
                                    {isAdmin || isDesigner ? (
                                        <TextArea
                                            placeholder="Designer: Paste design links here (one per line)..."
                                            value={task?.design_urls || ""}
                                            autoSize={{ minRows: 2, maxRows: 6 }}
                                            onChange={(e) => setTask({ ...task, design_urls: e.target.value })}
                                            onBlur={() => handleUpdateField('design_urls', task?.design_urls)}
                                            style={{ backgroundColor: "#F9FAFB", borderRadius: 4 }}
                                        />
                                    ) : (
                                        <div style={{ padding: '8px 12px', background: '#F9FAFB', borderRadius: 4, minHeight: 40 }}>
                                            {task?.design_urls ? (
                                                task.design_urls.split('\n').map((url: string, i: number) => {
                                                    const trimmed = url.trim();
                                                    if (!trimmed) return null;
                                                    return (
                                                        <div key={i} style={{ marginBottom: 4 }}>
                                                            <a href={trimmed.startsWith('http') ? trimmed : `https://${trimmed}`} target="_blank" rel="noreferrer" style={{ color: "#3594D0", textDecoration: "underline" }}>
                                                                {trimmed}
                                                            </a>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <Text type="secondary" italic>No design links provided yet.</Text>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Divider />

                            {/* Activities Section */}
                            <div>
                                <Space style={{ marginBottom: 16 }}>
                                    <MessageOutlined style={{ fontSize: 18 }} />
                                    <Text strong style={{ fontSize: 15 }}>Activities:</Text>
                                </Space>
                                <div style={{ marginLeft: 28 }}>
                                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
                                </div>
                            </div>
                        </Col>

                        {/* Right Column (Sidebar Configuration) — PinkDesign style */}
                        <Col span={8}>
                            <div className="idea-sidebar" style={{ paddingTop: 20 }}>

                                {/* Template Tags — item-form-add-ideas style */}
                                <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                                    <FormatPainterOutlined style={{ fontSize: 20, color: '#454F5B', marginTop: 6, flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Select
                                            mode="multiple"
                                            placeholder={boardTemplates.length === 0 ? 'No templates' : 'Select templates...'}
                                            style={{ width: '100%' }}
                                            value={selectedTemplateKeys}
                                            disabled={boardTemplates.length === 0}
                                            tagRender={({ label, value, onClose }) => {
                                                const tpl = boardTemplates.find(t => t.key === value);
                                                return (
                                                    <Tag
                                                        closable
                                                        onClose={onClose}
                                                        onClick={() => tpl?.url && window.open(tpl.url, '_blank')}
                                                        style={{
                                                            marginRight: 3, fontSize: 14,
                                                            cursor: tpl?.url ? 'pointer' : 'default',
                                                            backgroundColor: '#f5f5f5',
                                                            borderColor: '#d9d9d9', color: '#262626'
                                                        }}
                                                    >
                                                        {label}
                                                    </Tag>
                                                );
                                            }}
                                            onChange={(keys) => {
                                                setSelectedTemplateKeys(keys);
                                                handleUpdateField('fulfillmentTemplate', JSON.stringify(keys));
                                            }}
                                            options={boardTemplates.map(t => ({ value: t.key, label: t.name }))}
                                        />
                                        {selectedTemplateKeys.length > 0 && (
                                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8c8c8c' }}>
                                                Click on template name to open it!
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <PushpinOutlined style={{ fontSize: 20, color: '#454F5B', flexShrink: 0 }} />
                                    <Select
                                        value={task?.status}
                                        onChange={(v) => handleUpdateField('status', v)}
                                        style={{ width: '100%' }}
                                        options={[
                                            { value: 'DRAFT', label: 'Draft' },
                                            { value: 'NEW', label: 'New' },
                                            { value: 'TODO', label: 'Todo' },
                                            { value: 'DOING', label: 'Doing' },
                                            { value: 'IN_REVIEW', label: 'In Review' },
                                            { value: 'NEED_FIX', label: 'Need Fix' },
                                            { value: 'DONE', label: 'Done' },
                                            { value: 'ARCHIVED', label: 'Archived' },
                                        ]}
                                    />
                                </div>

                                {/* Urgent & Public Toggle */}
                                <div style={{ marginBottom: 16, padding: '12px', background: '#FFF7E6', borderRadius: 8, border: '1px solid #FFE7BA' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Space>
                                            <PushpinOutlined style={{ color: '#FA8C16' }} />
                                            <Text strong style={{ fontSize: 13 }}>Mark Urgent</Text>
                                        </Space>
                                        <Switch
                                            size="small"
                                            checked={task?.is_urgent}
                                            onChange={(v) => handleUpdateField('is_urgent', v)}
                                            style={{ backgroundColor: task?.is_urgent ? '#FA8C16' : undefined }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Space>
                                            <EyeOutlined style={{ color: '#3594D0' }} />
                                            <Text strong style={{ fontSize: 13 }}>Public Design</Text>
                                        </Space>
                                        <Switch
                                            size="small"
                                            checked={task?.is_public}
                                            onChange={(v) => handleUpdateField('is_public', v)}
                                        />
                                    </div>
                                    <p style={{ margin: '8px 0 0', fontSize: 11, color: '#8c8c8c', lineHeight: 1.3 }}>
                                        💡 Turn on Public Design for urgent needs or holidays so all designers can help!
                                    </p>
                                </div>

                                {/* Designer */}
                                <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <UserAddOutlined style={{ fontSize: 20, color: '#454F5B', flexShrink: 0 }} />
                                    <Select
                                        value={task?.designerId}
                                        onChange={(v) => handleUpdateField('designerId', v)}
                                        placeholder="Assign Designer..."
                                        style={{ width: '100%' }}
                                        showSearch
                                        optionFilterProp="label"
                                        disabled={isClient}
                                        options={designers}
                                        optionRender={(opt: any) => (
                                            <div style={{ lineHeight: 1.3 }}>
                                                <div style={{ fontWeight: 500 }}>{opt.label}</div>
                                                <em style={{ fontSize: 11, color: '#8c8c8c' }}>{opt.data?.email || ''}</em>
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Product Type */}
                                <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <AppstoreOutlined style={{ fontSize: 20, color: '#454F5B', flexShrink: 0 }} />
                                    <Select
                                        value={task?.productTypeId}
                                        onChange={(v) => handleUpdateField('productTypeId', v)}
                                        placeholder="Select Product Type..."
                                        style={{ width: '100%' }}
                                        showSearch
                                        optionFilterProp="label"
                                        options={productTypes}
                                    />
                                </div>

                                {/* Design Type */}
                                <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <OneToOneOutlined style={{ fontSize: 20, color: '#454F5B', flexShrink: 0 }} />
                                    <Select
                                        value={task?.designType}
                                        onChange={(v) => handleUpdateField('designType', v)}
                                        style={{ width: '100%' }}
                                        options={[
                                            { value: 'NEW', label: 'New' },
                                            { value: 'CLONE', label: 'Clone' },
                                            { value: 'REDESIGN', label: 'Redesign' }
                                        ]}
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <FieldNumberOutlined style={{ fontSize: 20, color: '#454F5B', flexShrink: 0 }} />
                                    <Input
                                        id="qty"
                                        value={task?.qty || 1}
                                        onChange={(e) => handleUpdateField('qty', parseInt(e.target.value) || 1)}
                                        type="number"
                                        min={1}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                {/* Deadline */}
                                <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <CalendarOutlined style={{ fontSize: 20, color: '#454F5B', flexShrink: 0 }} />
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={task?.deadline ? require('dayjs')(task.deadline) : null}
                                        onChange={(date) => handleUpdateField('deadline', date?.toISOString() || null)}
                                    />
                                </div>

                                {/* Pink value */}
                                <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <DollarOutlined style={{ fontSize: 20, color: '#454F5B', flexShrink: 0 }} />
                                    <Input
                                        id="pink"
                                        value={task?.pink || 0}
                                        onChange={(e) => handleUpdateField('pink', parseFloat(e.target.value) || 0)}
                                        type="number"
                                        min={0}
                                        step={0.5}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                            </div>
                        </Col>
                    </Row>
                </div>
            </Spin>
        </Modal>
    );
}
