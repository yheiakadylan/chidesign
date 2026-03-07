"use client";

import React, { useState } from "react";
import { App, Modal, Form, Input, Select, DatePicker, InputNumber, Upload, Button, Row, Col, Typography, Space, Image, Tag } from "antd";
import {
    InboxOutlined, PlusOutlined, DeleteOutlined, CopyOutlined, UploadOutlined,
    FontSizeOutlined, FontColorsOutlined, PaperClipOutlined, FileTextOutlined,
    FormatPainterOutlined, AppstoreOutlined, OneToOneOutlined, FieldNumberOutlined,
    CalendarOutlined, DollarOutlined
} from "@ant-design/icons";
import { createIdea } from "@/actions/board.actions";
import { addAttachment } from "@/actions/taskDetail.actions";
import { getFulfillmentTemplates } from "@/actions/template.actions";

const { TextArea } = Input;
const { Dragger } = Upload;
const { Text } = Typography;

interface AddTaskModalProps {
    open: boolean;
    onCancel: () => void;
    onSave: () => void;
    boardId?: string;
}

export default function AddTaskModal({ open, onCancel, onSave, boardId }: AddTaskModalProps) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [productTypeOptions, setProductTypeOptions] = useState<any[]>([]);
    const [selectedTemplateKeys, setSelectedTemplateKeys] = useState<string[]>([]);
    const [pendingAttachments, setPendingAttachments] = useState<Array<{ url: string; file_name: string; file_mime: string }>>([]);
    const [addUrlVisible, setAddUrlVisible] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [editingAttachmentIdx, setEditingAttachmentIdx] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    // Use the passed boardId or fall back to mock
    const effectiveBoardId = boardId || "cm7uwwc030006gqj41dxtv4j1";

    // Load templates and options when modal opens
    React.useEffect(() => {
        if (open) {
            if (effectiveBoardId && effectiveBoardId !== 'all') {
                getFulfillmentTemplates(effectiveBoardId).then(setTemplates);
            }
            import("@/actions/board.actions").then(m => m.getProductTypeOptions().then(setProductTypeOptions));
        }
    }, [open, effectiveBoardId]);

    /** Apply a template: pre-fill form fields */
    const handleApplyTemplate = (templateKey: string) => {
        const tpl = templates.find(t => t.key === templateKey);
        if (!tpl) return;
        form.setFieldsValue({
            productType: tpl.productTypeId || undefined,
            category: tpl.designType || undefined,
        });
        message.success(`Applied template: ${tpl.name}`);
    };

    /**
     * Custom upload handler for Dragger:
     * 1. Get a presigned URL from our API (needs a temp key since we don't have task ID yet)
     * 2. Upload file directly to S3
     * 3. Add to pending list to be linked after task creation
     */
    const handleDraggerUpload = async ({ file, onSuccess, onError }: any) => {
        try {
            const res = await fetch('/api/upload/presigned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream',
                    taskId: `draft-${Date.now()}` // temp ID for pending tasks
                })
            });

            if (!res.ok) throw new Error('Failed to get upload URL');

            const { uploadUrl, fileUrl } = await res.json();

            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type || 'application/octet-stream' }
            });

            if (!uploadRes.ok) throw new Error('Upload failed');

            setPendingAttachments(prev => [...prev, {
                url: fileUrl,
                file_name: file.name,
                file_mime: file.type || 'unknown'
            }]);

            onSuccess('ok');
        } catch (err: any) {
            message.error(`Upload failed: ${err.message}`);
            onError(err);
        }
    };

    const handleSubmit = async (status: string) => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Connect to server action
            const res = await createIdea({
                title: values.title,
                description: values.description,
                designType: values.category || "NEW",
                productTypeId: values.productType,
                quantity: values.quantity,
                kpi: values.kpi || 1.0,
                deadline: values.deadline?.toDate(),
                boardId: effectiveBoardId,
                status: status
            });

            if (res.error) {
                message.error(res.error);
            } else {
                // Link any pending attachments to the new task (using SKU)
                if (pendingAttachments.length > 0 && res.idea?.sku) {
                    await Promise.all(
                        pendingAttachments.map(att => addAttachment(res.idea!.sku, att))
                    );
                }
                message.success('Task created successfully');
                form.resetFields();
                setPendingAttachments([]);
                setAddUrlVisible(false);
                setUrlInput("");
                setSelectedTemplateKeys([]);
                onSave();
            }
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<div style={{ fontSize: 18, fontWeight: 600 }}>Add new task</div>}
            open={open}
            onCancel={onCancel}
            width={1000}
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 0' }}>
                    <Button key="cancel" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button key="draft" type="dashed" onClick={() => handleSubmit("DRAFT")} loading={loading}>
                        Save as draft
                    </Button>
                    <Button key="save" type="primary" onClick={() => handleSubmit("NEW")} loading={loading} style={{ backgroundColor: "#1890ff" }}>
                        Save
                    </Button>
                </div>
            }
        >
            <Form form={form} layout="vertical" className="form-add-new-idea">
                <Row gutter={15}>
                    {/* Left Column (span 16) */}
                    <Col span={16}>
                        {/* Title */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
                            <FontSizeOutlined style={{ fontSize: 20, color: '#595959', marginRight: 12, marginTop: 32 }} />
                            <Form.Item
                                name="title"
                                label={<span style={{ fontWeight: 500 }}>Task Title:</span>}
                                rules={[{ required: true, message: "Please enter a task title" }]}
                                style={{ flex: 1, marginBottom: 0 }}
                            >
                                <Input placeholder="Task title" />
                            </Form.Item>
                        </div>

                        {/* Description */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
                            <FontColorsOutlined style={{ fontSize: 20, color: '#595959', marginRight: 12, marginTop: 32 }} />
                            <Form.Item
                                name="description"
                                label={<span style={{ fontWeight: 500 }}>Description:</span>}
                                style={{ flex: 1, marginBottom: 0 }}
                            >
                                <TextArea placeholder="Task description" rows={4} style={{ resize: 'none' }} />
                            </Form.Item>
                        </div>

                        {/* Attachments */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
                            <PaperClipOutlined style={{ fontSize: 20, color: '#595959', marginRight: 12, marginTop: 6 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 500 }}>Attachment:</span>
                                    <Space size={4}>
                                        <Button type="link" size="small" disabled={pendingAttachments.length === 0} style={{ padding: 0 }}>Download all</Button>
                                        <Button type="link" size="small" onClick={() => setAddUrlVisible(!addUrlVisible)} style={{ padding: 0, paddingLeft: 10 }}>
                                            {addUrlVisible ? 'Cancel' : 'Add From Url'}
                                        </Button>
                                    </Space>
                                </div>

                                {/* Add from URL input */}
                                {addUrlVisible && (
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                        <Input
                                            placeholder="Add image from url"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            style={{ flexGrow: 1 }}
                                        />
                                        <Button
                                            type="primary"
                                            disabled={!urlInput.trim()}
                                            onClick={() => {
                                                if (!urlInput.trim()) return;
                                                const fileName = urlInput.split('/').pop() || 'image_from_url';
                                                setPendingAttachments(prev => [...prev, { url: urlInput, file_name: fileName, file_mime: 'image/jpeg' }]);
                                                setUrlInput("");
                                                setAddUrlVisible(false);
                                            }}
                                        >Add URL</Button>
                                    </div>
                                )}

                                {pendingAttachments.map((att, idx) => {
                                    const isEditing = editingAttachmentIdx === idx;
                                    return (
                                        <div key={idx} style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                                            <Image
                                                src={att.url}
                                                alt={att.file_name}
                                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #d9d9d9' }}
                                                preview={true}
                                            />
                                            <div style={{ flex: 1 }}>
                                                {isEditing ? (
                                                    <div style={{ marginBottom: 8 }}>
                                                        <Input
                                                            size="small"
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            onPressEnter={() => {
                                                                const newAtts = [...pendingAttachments];
                                                                newAtts[idx].file_name = editingName;
                                                                setPendingAttachments(newAtts);
                                                                setEditingAttachmentIdx(null);
                                                            }}
                                                            style={{ width: '100%', marginBottom: 4 }}
                                                        />
                                                        <Space size={8}>
                                                            <Button size="small" type="primary" onClick={() => {
                                                                const newAtts = [...pendingAttachments];
                                                                newAtts[idx].file_name = editingName;
                                                                setPendingAttachments(newAtts);
                                                                setEditingAttachmentIdx(null);
                                                            }}>Save</Button>
                                                            <Button size="small" onClick={() => setEditingAttachmentIdx(null)}>Cancel</Button>
                                                        </Space>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 13 }}>{att.file_name}</div>
                                                        <Space size="small" style={{ fontSize: 13, marginBottom: 4 }}>
                                                            <a href={att.url} download style={{ color: '#454F5B', textDecoration: 'underline' }}>Download</a> •
                                                            <a style={{ color: '#454F5B', textDecoration: 'underline', cursor: 'pointer' }}
                                                                onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))}>
                                                                Delete
                                                            </a> •
                                                            <a style={{ color: '#454F5B', textDecoration: 'underline', cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    setEditingAttachmentIdx(idx);
                                                                    setEditingName(att.file_name);
                                                                }}>
                                                                Edit
                                                            </a>
                                                        </Space>
                                                    </>
                                                )}
                                                <div style={{ fontSize: 12, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <UploadOutlined /> Make cover (after save)
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Drag & Drop area */}
                                <div style={{ height: 105 }}>
                                    <Dragger
                                        style={{ background: '#fafafa', padding: 8, height: '100%' }}
                                        showUploadList={false}
                                        customRequest={handleDraggerUpload}
                                        multiple
                                        accept="image/*"
                                        beforeUpload={(file) => {
                                            const isImage = file.type.startsWith('image/');
                                            if (!isImage) message.error(`${file.name} không phải là ảnh`);
                                            return isImage || Upload.LIST_IGNORE;
                                        }}
                                    >
                                        <p className="ant-upload-drag-icon" style={{ margin: 0, color: 'rgba(0,0,0,0.85)' }}>
                                            <UploadOutlined />
                                        </p>
                                        <p className="ant-upload-text" style={{ fontSize: 13, color: 'rgba(0,0,0,0.85)' }}>Drag & Drop to add an attachment</p>
                                    </Dragger>
                                </div>

                                {/* Add from URL input */}
                                {addUrlVisible && (
                                    <div style={{ display: 'flex', gap: 10, paddingTop: 15 }}>
                                        <Input
                                            placeholder="Add image from url"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            style={{ flexGrow: 1 }}
                                        />
                                        <Button
                                            type="primary"
                                            disabled={!urlInput.trim()}
                                            onClick={() => {
                                                if (!urlInput.trim()) return;
                                                const fileName = urlInput.split('/').pop() || 'image_from_url';
                                                setPendingAttachments(prev => [...prev, { url: urlInput, file_name: fileName, file_mime: 'image/jpeg' }]);
                                                setUrlInput("");
                                                setAddUrlVisible(false);
                                            }}
                                        >Add URL</Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Design Urls */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
                            <FileTextOutlined style={{ fontSize: 20, color: '#595959', marginRight: 12, marginTop: 32 }} />
                            <Form.Item
                                label={<span style={{ fontWeight: 500 }}>Design Urls: <CopyOutlined style={{ color: "gray", cursor: "pointer", marginLeft: 4 }} /></span>}
                                style={{ flex: 1, marginBottom: 0 }}
                            >
                                <TextArea placeholder="Add design urls..." rows={2} style={{ resize: 'none' }} />
                            </Form.Item>
                        </div>
                    </Col>

                    {/* Right Column: Configuration (span 8) */}
                    <Col span={8}>
                        {/* Templates */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
                            <FormatPainterOutlined style={{ fontSize: 20, color: '#454F5B', marginTop: 6, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Select
                                    mode="multiple"
                                    placeholder={templates.length === 0 ? 'No templates' : 'Select templates...'}
                                    style={{ width: '100%' }}
                                    value={selectedTemplateKeys}
                                    disabled={templates.length === 0}
                                    tagRender={({ label, value, onClose }) => {
                                        const tpl = templates.find(t => t.key === value);
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
                                        if (keys.length > selectedTemplateKeys.length) {
                                            const newlyAdded = keys[keys.length - 1];
                                            handleApplyTemplate(newlyAdded);
                                        }
                                        setSelectedTemplateKeys(keys);
                                    }}
                                    options={templates.map(t => ({ value: t.key, label: t.name }))}
                                />
                                {selectedTemplateKeys.length > 0 && (
                                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8c8c8c' }}>
                                        Click on template name to open it!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Product Type */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <AppstoreOutlined style={{ fontSize: 20, color: '#595959', marginRight: 12 }} />
                            <Form.Item name="productType" style={{ flex: 1, marginBottom: 0 }}>
                                <Select placeholder="Select product type" options={productTypeOptions} />
                            </Form.Item>
                        </div>

                        {/* Design Type (Clone, Redesign) */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <OneToOneOutlined style={{ fontSize: 20, color: '#595959', marginRight: 12 }} />
                            <Form.Item name="category" style={{ flex: 1, marginBottom: 0 }} initialValue="NEW">
                                <Select placeholder="Select category" options={[
                                    { value: "NEW", label: "New" },
                                    { value: "CLONE", label: "Clone" },
                                    { value: "REDESIGN", label: "Redesign" }
                                ]} />
                            </Form.Item>
                        </div>

                        {/* Quantity */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <FieldNumberOutlined style={{ fontSize: 20, color: '#595959', marginRight: 12 }} />
                            <Form.Item name="quantity" style={{ flex: 1, marginBottom: 0 }} initialValue={1}>
                                <InputNumber style={{ width: "100%" }} />
                            </Form.Item>
                        </div>

                        {/* Deadline */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <CalendarOutlined style={{ fontSize: 20, color: '#595959', marginRight: 12 }} />
                            <Form.Item name="deadline" style={{ flex: 1, marginBottom: 0 }}>
                                <DatePicker style={{ width: "100%" }} showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                        </div>

                        {/* Pink Value */}
                        <div className="item-form-add-ideas" style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <DollarOutlined style={{ fontSize: 20, color: '#595959', marginRight: 12 }} />
                            <Form.Item name="kpi" style={{ flex: 1, marginBottom: 0 }} initialValue={1}>
                                <InputNumber style={{ width: "100%" }} step={0.5} min={0} />
                            </Form.Item>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
