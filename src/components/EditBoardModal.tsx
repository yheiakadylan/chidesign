"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, App, Space } from "antd";
import { getBoardDetail, updateBoard, getProductTypeOptions } from "@/actions/board.actions";

interface EditBoardModalProps {
    boardId: string;
    open: boolean;
    onCancel: () => void;
    onSave: () => void;
}

export default function EditBoardModal({ boardId, open, onCancel, onSave }: EditBoardModalProps) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [productTypeOptions, setProductTypeOptions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        if (open && boardId && boardId !== "all") {
            const fetchData = async () => {
                const [board, ptOptions] = await Promise.all([
                    getBoardDetail(boardId),
                    getProductTypeOptions()
                ]);

                if (board) {
                    form.setFieldsValue({
                        title: board.title,
                        productTypeIds: board.productTypes.map((pt: any) => pt.id),
                        defaultDesignType: board.defaultDesignType || "clone",
                        readMe: board.readMe || "",
                    });
                }
                setProductTypeOptions(ptOptions);
            };
            fetchData();
        }
    }, [open, boardId, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const res = await updateBoard(boardId, values);

            if (res.error) {
                message.error(res.error);
            } else {
                message.success("Board updated successfully");
                onSave();
            }
        } catch (err) {
            console.error("Validation failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Board"
            open={open}
            onCancel={onCancel}
            width={700}
            footer={
                <Space style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" loading={loading} onClick={handleSave}>
                        Save
                    </Button>
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                id="boardForm"
                initialValues={{ defaultDesignType: "clone" }}
            >
                <Form.Item
                    name="title"
                    label={<span style={{ fontWeight: 500 }}>Title</span>}
                    rules={[{ required: true, message: "Please enter a title" }]}
                    style={{ marginBottom: 10 }}
                >
                    <Input placeholder="Enter board title" />
                </Form.Item>

                <Form.Item
                    name="productTypeIds"
                    label={<span style={{ fontWeight: 500 }}>Product Types</span>}
                    extra={<div style={{ color: '#52c41a', fontSize: 12 }}>Drag to reorder items</div>}
                    style={{ marginBottom: 10 }}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select product type"
                        options={productTypeOptions}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    name="defaultDesignType"
                    label={<span style={{ fontWeight: 500 }}>Default Design Type</span>}
                    style={{ marginBottom: 10 }}
                >
                    <Select
                        placeholder="Select design type"
                        options={[
                            { value: "clone", label: "Clone" },
                            { value: "redesign", label: "Redesign" },
                            { value: "new", label: "New" }
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="readMe"
                    label={<span style={{ fontWeight: 500 }}>Read Me (Instructions)</span>}
                    style={{ marginBottom: 10 }}
                >
                    <Input.TextArea
                        rows={6}
                        placeholder="Add board specific instructions, links, etc. (Markdown supported in spirit)"
                        style={{ resize: 'vertical' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
