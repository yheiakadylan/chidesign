"use client";

import React from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Upload, Button, Row, Col, Typography } from "antd";
import { InboxOutlined, PlusOutlined, DeleteOutlined, CopyOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Dragger } = Upload;
const { Text } = Typography;

interface AddTaskModalProps {
    open: boolean;
    onCancel: () => void;
    onSave: () => void;
}

export default function AddTaskModal({ open, onCancel, onSave }: AddTaskModalProps) {
    const [form] = Form.useForm();

    return (
        <Modal
            title={<div style={{ fontSize: 18, fontWeight: 600 }}>Add new task</div>}
            open={open}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="draft" type="dashed">
                    Save as draft
                </Button>,
                <Button key="save" type="primary" onClick={onSave} style={{ backgroundColor: "#1890ff" }}>
                    Save
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    {/* Left Column: Main Info */}
                    <Col span={14}>
                        <Form.Item
                            name="title"
                            label={<span style={{ fontWeight: 500 }}>Task Title</span>}
                            rules={[{ required: true, message: "Please enter a task title" }]}
                        >
                            <Input placeholder="Task title" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label={<span style={{ fontWeight: 500 }}>Description</span>}
                        >
                            <TextArea placeholder="Task description" rows={3} />
                        </Form.Item>

                        <Form.Item label={<span style={{ fontWeight: 500 }}>Attachment</span>}>
                            <Dragger>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">Drag & Drop to add an attachment</p>
                            </Dragger>
                        </Form.Item>

                        <Form.Item label={<span style={{ fontWeight: 500 }}>Add image from URL</span>}>
                            <div style={{ display: "flex", gap: 8 }}>
                                <Input placeholder="https://..." />
                                <Button>Add URL</Button>
                            </div>
                        </Form.Item>

                        <Form.Item label={
                            <Space>
                                <span style={{ fontWeight: 500 }}>Design Urls</span>
                                <CopyOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
                            </Space>
                        }>
                            <TextArea placeholder="Add design urls..." rows={2} />
                        </Form.Item>
                    </Col>

                    {/* Right Column: Configuration */}
                    <Col span={10}>
                        <Form.Item label={<span style={{ fontWeight: 500 }}>Template Tags</span>}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {/* Mock tag for UI */}
                                <div style={{ padding: "4px 8px", background: "#f0f2f5", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                    <Text>ornament</Text>
                                    <DeleteOutlined style={{ cursor: "pointer", color: "#8c8c8c" }} />
                                </div>
                                <Button type="dashed" size="small" icon={<PlusOutlined />}>Add</Button>
                            </div>
                        </Form.Item>

                        <Form.Item label={<span style={{ fontWeight: 500 }}>Product Type</span>} name="productType">
                            <Select placeholder="Select product type" options={[{ value: "tshirt", label: "T-shirt" }]} />
                        </Form.Item>

                        <Form.Item label={<span style={{ fontWeight: 500 }}>Category/Process</span>} name="category">
                            <Select placeholder="Select category" options={[{ value: "clone", label: "Clone" }]} />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label={<span style={{ fontWeight: 500 }}>Quantity (№)</span>} name="quantity">
                                    <InputNumber style={{ width: "100%" }} placeholder="0" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={<span style={{ fontWeight: 500 }}>KPI/Value</span>} name="kpi">
                                    <InputNumber style={{ width: "100%" }} placeholder="1.00" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label={<span style={{ fontWeight: 500 }}>Deadline</span>} name="deadline">
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}

// Ensure Space imported for the label
import { Space } from "antd";
