"use client";

import React, { useState } from "react";
import { Modal, Row, Col, Typography, Space, Button, Input, Select, DatePicker, Upload, Tabs, Timeline, Avatar, Divider } from "antd";
import {
    PaperClipOutlined,
    EditOutlined,
    CopyOutlined,
    UploadOutlined,
    FontSizeOutlined,
    FileTextOutlined,
    MessageOutlined,
    PushpinOutlined,
    UserOutlined,
    AppstoreOutlined,
    ControlOutlined,
    FieldNumberOutlined,
    CalendarOutlined,
    DollarOutlined,
} from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

interface TaskDetailModalProps {
    open: boolean;
    onCancel: () => void;
    taskId: string;
}

export default function TaskDetailModal({ open, onCancel, taskId }: TaskDetailModalProps) {
    const [activeTab, setActiveTab] = useState("comments");

    // Tabs structure
    const tabItems = [
        {
            key: "comments",
            label: "Comments",
            children: (
                <div style={{ padding: "8px 0" }}>
                    <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <Avatar style={{ backgroundColor: "#d9d9d9", color: "##454F5B" }}>L</Avatar>
                            <PaperClipOutlined style={{ fontSize: 16, color: "#8c8c8c", cursor: "pointer" }} />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                            <TextArea
                                placeholder="You can enter your comment here and also paste an image or image URL."
                                rows={3}
                                style={{ marginBottom: 8, resize: "none" }}
                            />
                            <Button disabled>Add Comment</Button>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 16 }}>
                        <Avatar style={{ backgroundColor: "#d9d9d9", color: "#454F5B" }}>D</Avatar>
                        <div style={{ flexGrow: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                                <Text strong>Designer</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>Feb 16 2026 03:22 pm</Text>
                            </div>
                            <div style={{ background: "#F4F6F8", padding: "8px 12px", borderRadius: 8 }}>
                                <Text>0UN2NW51FP Dạ trùng mã ạ</Text>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "activities",
            label: "Activities",
            children: (
                <div style={{ padding: "16px 0 8px 16px" }}>
                    <Timeline
                        items={[
                            {
                                color: "green",
                                children: (
                                    <>
                                        <div><Text strong>Update Status</Text> - <Text type="secondary">Feb 16 2026 03:22 pm</Text></div>
                                        <Text type="secondary">Status changed from <Text strong>Draft</Text> to <Text strong>Done</Text></Text>
                                    </>
                                ),
                            },
                            {
                                color: "blue",
                                children: (
                                    <>
                                        <div><Text strong>User Assigned</Text> - <Text type="secondary">Feb 15 2026 10:00 am</Text></div>
                                        <Text type="secondary">Assigned to <Text strong>Designer</Text></Text>
                                    </>
                                ),
                            },
                        ]}
                    />
                </div>
            ),
        },
    ];

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            width={900}
            footer={null} // No footer in this detail UI
            closable={true}
            styles={{ body: { padding: "24px 32px", maxHeight: "80vh", overflowY: "auto" } }}
        >
            <Row gutter={48}>
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
                            <div>{taskId || "3977115289"}</div>
                            <div>SKU: 04NARJQSYK</div>
                            <br />
                            <div>Size: 12" x 18"</div>
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
                                <Button type="link" size="small">Download all</Button>
                                <Button type="link" size="small">Add From Url</Button>
                            </Space>
                        </div>

                        <div style={{ marginLeft: 28, marginBottom: 16, display: "flex", gap: 16 }}>
                            <div style={{ width: 80, height: 80, background: "url(https://via.placeholder.com/300) center/cover", borderRadius: 4, border: "1px solid #d9d9d9" }}></div>
                            <div>
                                <div style={{ fontWeight: 500, marginBottom: 4 }}>image.png</div>
                                <Space size="small" style={{ fontSize: 12, marginBottom: 4 }}>
                                    <a style={{ color: "#454F5B", textDecoration: "underline" }}>Download</a> •
                                    <a style={{ color: "#454F5B", textDecoration: "underline" }}>Delete</a> •
                                    <a style={{ color: "#454F5B", textDecoration: "underline" }}>Edit</a>
                                </Space>
                                <div style={{ fontSize: 12, color: "#8c8c8c", display: "flex", alignItems: "center", gap: 4 }}>
                                    <UploadOutlined /> Make cover
                                </div>
                            </div>
                        </div>

                        <div style={{ marginLeft: 28 }}>
                            <Dragger style={{ background: "#FAFAFA", padding: 16 }}>
                                <p className="ant-upload-drag-icon" style={{ margin: 0, color: "#454F5B" }}>
                                    <UploadOutlined />
                                </p>
                                <p className="ant-upload-text" style={{ fontSize: 13, color: "#8c8c8c" }}>Drag & Drop to add an attachment</p>
                            </Dragger>
                        </div>
                    </div>

                    <Divider />

                    {/* Design Urls Section */}
                    <div style={{ marginBottom: 24 }}>
                        <Space style={{ marginBottom: 8 }}>
                            <FileTextOutlined style={{ fontSize: 18 }} />
                            <Text strong style={{ fontSize: 15 }}>Design Urls:</Text>
                            <CopyOutlined style={{ color: "#8c8c8c", cursor: "pointer" }} />
                        </Space>
                        <div style={{ marginLeft: 28, color: "#8c8c8c" }}>
                            Add design urls...
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

                {/* Right Column (Sidebar Configuration) */}
                <Col span={8}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <PushpinOutlined style={{ fontSize: 16, color: "#8c8c8c", width: 20 }} />
                            <Select defaultValue="Draft" style={{ width: "100%" }} options={[{ value: 'Draft', label: 'Draft' }]} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <UserOutlined style={{ fontSize: 16, color: "#8c8c8c", width: 20 }} />
                            <Select defaultValue="Lê Bảo Vi" style={{ width: "100%" }} options={[{ value: 'Lê Bảo Vi', label: 'Lê Bảo Vi' }]} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <AppstoreOutlined style={{ fontSize: 16, color: "#8c8c8c", width: 20 }} />
                            <Select defaultValue="T-shirt" style={{ width: "100%" }} options={[{ value: 'T-shirt', label: 'T-shirt' }]} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <ControlOutlined style={{ fontSize: 16, color: "#8c8c8c", width: 20 }} />
                            <Select defaultValue="Clone" style={{ width: "100%" }} options={[{ value: 'Clone', label: 'Clone' }]} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <FieldNumberOutlined style={{ fontSize: 16, color: "#8c8c8c", width: 20 }} />
                            <Input defaultValue="1" style={{ width: "100%" }} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <CalendarOutlined style={{ fontSize: 16, color: "#8c8c8c", width: 20 }} />
                            <DatePicker style={{ width: "100%" }} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <DollarOutlined style={{ fontSize: 16, color: "#8c8c8c", width: 20 }} />
                            <Input defaultValue="1" style={{ width: "100%" }} />
                        </div>
                    </div>
                </Col>
            </Row>
        </Modal>
    );
}
