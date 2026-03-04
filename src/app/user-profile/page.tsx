"use client";

import React, { useState } from "react";
import { Row, Col, Typography, Button, Upload } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ChangePasswordModal from "../../components/ChangePasswordModal";

const { Title, Text, Link } = Typography;

export default function UserProfile() {
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

    return (
        <div style={{ padding: "40px", maxWidth: 1000, margin: "0 auto", backgroundColor: "#fff", minHeight: "calc(100vh - 64px)", marginTop: 24, borderRadius: 8 }}>
            <Row gutter={48}>
                {/* Left Column: Avatar */}
                <Col span={8}>
                    <Upload
                        name="avatar"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                        style={{
                            width: "100%",
                            aspectRatio: "1",
                            border: "1px dashed #d9d9d9",
                            borderRadius: 8,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                            background: "#FAFAFA"
                        }}
                    >
                        <div style={{ textAlign: "center", color: "#8c8c8c" }}>
                            <UserOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                            <div style={{ marginTop: 8 }}>Tải lên hình ảnh...</div>
                        </div>
                    </Upload>
                </Col>

                {/* Right Column: User Info */}
                <Col span={16}>
                    <div style={{ marginBottom: 32 }}>
                        <Title level={2} style={{ marginBottom: 24, fontWeight: 600 }}>Lê Bảo Vi</Title>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15 }}>
                            <Row>
                                <Col span={6}><Text type="secondary">Email:</Text></Col>
                                <Col span={18}><Text strong>Teeazm@gmail.com</Text></Col>
                            </Row>

                            <Row>
                                <Col span={6}><Text type="secondary">Phone:</Text></Col>
                                <Col span={18}><Text strong></Text></Col>
                            </Row>

                            <Row>
                                <Col span={6}><Text type="secondary">Address:</Text></Col>
                                <Col span={18}><Text strong></Text></Col>
                            </Row>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 24 }}>
                        <Link style={{ fontSize: 15, color: "#3594D0" }}>Edit Profile</Link>
                        <Link
                            style={{ fontSize: 15, color: "#3594D0" }}
                            onClick={() => setPasswordModalOpen(true)}
                        >
                            Change password
                        </Link>
                    </div>
                </Col>
            </Row>

            <ChangePasswordModal
                open={isPasswordModalOpen}
                onCancel={() => setPasswordModalOpen(false)}
                onSave={() => setPasswordModalOpen(false)}
            />
        </div>
    );
}
