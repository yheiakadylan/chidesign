'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateUserProfileAction } from '@/actions/auth.actions';

interface EditProfileModalProps {
    visible: boolean;
    user: any;
    onCancel: () => void;
    onSuccess: (updatedUser: any) => void;
}

export default function EditProfileModal({ visible, user, onCancel, onSuccess }: EditProfileModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (visible && user) {
            form.setFieldsValue({
                full_name: user.full_name,
                email: user.email,
                phone: user.phone
            });
        }
    }, [visible, user, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const result = await updateUserProfileAction(user.id, values);

            if (result.success) {
                message.success('Cập nhật thông tin thành công!');
                onSuccess(result.user);
            } else {
                message.error(result.error || 'Có lỗi xảy ra!');
            }
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa thông tin cá nhân"
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Lưu thay đổi"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="full_name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                    <Input placeholder="Nhập họ tên" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                >
                    <Input placeholder="example@gmail.com" />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
