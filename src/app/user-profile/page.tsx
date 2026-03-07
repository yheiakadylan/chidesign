"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Typography, Button, Upload, Spin, App } from "antd";
import { UserOutlined, EditOutlined, KeyOutlined } from "@ant-design/icons";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import EditProfileModal from "@/components/EditProfileModal";
import { getCurrentUser, updateUserAvatarAction } from "@/actions/auth.actions";

const { Title } = Typography;

export default function UserProfile() {
    const { message } = App.useApp();
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const fetchUser = async () => {
        setLoading(true);
        const u = await getCurrentUser();
        if (u) setUser(u);
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleEditSuccess = (updatedUser: any) => {
        setUser(updatedUser);
        setEditModalOpen(false);
        // Notify Layout to update header avatar
        window.dispatchEvent(new Event('user-updated'));
    };

    const handleAvatarUpload = async ({ file, onSuccess, onError }: any) => {
        if (!user) return;
        try {
            setUploadingAvatar(true);
            // 1. Get presigned URL
            const res = await fetch('/api/upload/presigned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream',
                    taskId: `avatar-${user.id}`
                })
            });

            if (!res.ok) throw new Error('Failed to get upload URL');
            const { uploadUrl, fileUrl, fileKey } = await res.json();

            // 2. Upload directly to S3
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type || 'application/octet-stream' }
            });

            if (!uploadRes.ok) throw new Error('Upload to storage failed');

            // 3. Link to User in DB
            const linkRes = await updateUserAvatarAction(user.id, {
                url: fileUrl,
                file_name: file.name,
                file_mime: file.type || 'unknown',
                key: fileKey
            });

            if (linkRes.success) {
                setUser(linkRes.user);
                message.success('Cập nhật ảnh đại diện thành công!');
                onSuccess('ok');
                // Notify Layout to update header avatar
                window.dispatchEvent(new Event('user-updated'));
            } else {
                throw new Error(linkRes.error || 'Failed to update user profile');
            }
        } catch (err: any) {
            console.error('Avatar Upload Error:', err);
            message.error(`Upload failed: ${err.message}`);
            onError(err);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const avatarUrl = user?.avatar?.url || "https://culturaltrust.org/wp-content/themes/oct/assets/img/no-img.png";

    return (
        <div className="user-profile__Container-sc-8f46372f-0 esnjeB p-24" style={{ backgroundColor: "#fff", borderRadius: 8, margin: 24 }}>
            <Spin spinning={loading || uploadingAvatar}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12} lg={10} xl={5}>
                        <div className="p-upload">
                            <Upload.Dragger
                                showUploadList={false}
                                customRequest={handleAvatarUpload}
                                accept=".jpg,.jpeg,.png,.webp,.gif"
                                disabled={loading || uploadingAvatar}
                                style={{ padding: 0, border: 'none', background: 'transparent' }}
                            >
                                <div style={{
                                    position: 'relative',
                                    height: 0,
                                    paddingBottom: '66%',
                                    backgroundImage: `url("${avatarUrl}")`,
                                    backgroundSize: 'contain',
                                    backgroundColor: '#fff',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center center',
                                    border: '1px dashed #ddd',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                }}>
                                    {!user?.avatar?.url && !uploadingAvatar && <UserOutlined style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 32, color: '#ccc' }} />}
                                    {uploadingAvatar && <Spin style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
                                </div>
                            </Upload.Dragger>
                        </div>
                    </Col>

                    <Col xs={24} md={12} lg={14} xl={19}>
                        <div style={{ marginLeft: 15 }}>
                            <Title level={2} style={{ marginBottom: 12 }}>{user?.full_name || "Guest"}</Title>

                            <div style={{ marginBottom: 20 }}>
                                <p style={{ margin: '4px 0' }}><strong>Email: </strong> {user?.email || "Chưa cập nhật"}</p>
                                <p style={{ margin: '4px 0' }}><strong>Phone: </strong> {user?.phone || user?.email || "Chưa cập nhật"}</p>
                                <p style={{ margin: '4px 0' }}><strong>Address: </strong> {user?.address || "Chưa cập nhật"}</p>
                            </div>

                            <div style={{ display: "flex", gap: 10 }}>
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => setEditModalOpen(true)}
                                    style={{ padding: 0 }}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    type="link"
                                    icon={<KeyOutlined />}
                                    onClick={() => setPasswordModalOpen(true)}
                                    style={{ padding: 0 }}
                                >
                                    Change password
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Spin>

            <EditProfileModal
                visible={isEditModalOpen}
                user={user}
                onCancel={() => setEditModalOpen(false)}
                onSuccess={handleEditSuccess}
            />

            <ChangePasswordModal
                open={isPasswordModalOpen}
                onCancel={() => setPasswordModalOpen(false)}
                onSave={() => setPasswordModalOpen(false)}
            />
        </div>
    );
}
