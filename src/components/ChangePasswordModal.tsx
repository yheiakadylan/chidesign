"use client";

import React from "react";
import { Modal, Form, Input, Checkbox, Button, Typography, Space } from "antd";

const { Text, Link } = Typography;

interface ChangePasswordModalProps {
    open: boolean;
    onCancel: () => void;
    onSave: () => void;
}

export default function ChangePasswordModal({ open, onCancel, onSave }: ChangePasswordModalProps) {
    const [form] = Form.useForm();

    const handleRandomPassword = () => {
        const randomPass = Math.random().toString(36).slice(-10) + "A1!";
        form.setFieldsValue({
            newPassword: randomPass,
            confirmPassword: randomPass,
        });
    };

    return (
        <Modal
            title={<span style={{ fontWeight: 600, fontSize: 16 }}>Change Password</span>}
            open={open}
            onCancel={onCancel}
            width={480}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={onSave} style={{ backgroundColor: "#3594D0" }}>
                    Save
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                <Form.Item
                    label="Current password"
                    name="currentPassword"
                    rules={[{ required: true, message: 'Please input your current password!' }]}
                >
                    <Input.Password placeholder="Current password" size="large" />
                </Form.Item>

                <Form.Item
                    label="New password"
                    name="newPassword"
                    rules={[{ required: true, message: 'Please input your new password!' }]}
                    style={{ marginBottom: 4 }}
                >
                    <Input.Password placeholder="New password" size="large" />
                </Form.Item>
                <div style={{ marginBottom: 20 }}>
                    <Link onClick={handleRandomPassword} style={{ color: "#3594D0", fontSize: 13 }}>
                        Random Password
                    </Link>
                </div>

                <Form.Item
                    label="Confirm password"
                    name="confirmPassword"
                    rules={[{ required: true, message: 'Please confirm your new password!' }]}
                >
                    <Input.Password placeholder="Confirm password" size="large" />
                </Form.Item>

                <Form.Item name="logoutOtherDevices" valuePropName="checked" initialValue={true}>
                    <Checkbox>Logout from all other devices after changing password</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
}
