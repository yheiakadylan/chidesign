"use client";

import React from "react";
import { Modal, Table, Button, Input, Select, Space } from "antd";
import { HolderOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

interface TemplateModalProps {
    open: boolean;
    onCancel: () => void;
    onSave: () => void;
}

const mockTemplates = [
    { key: "1", name: "Template 1", productType: "T-shirt", designType: "Clone", url: "https://example.com" },
];

export default function TemplateModal({ open, onCancel, onSave }: TemplateModalProps) {
    const columns = [
        {
            title: "",
            dataIndex: "drag",
            width: 40,
            render: () => <HolderOutlined style={{ cursor: "grab", color: "#8c8c8c" }} />,
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (text: string) => <Input defaultValue={text} placeholder="Template name" />
        },
        {
            title: "Product Type",
            dataIndex: "productType",
            render: (text: string) => (
                <Select defaultValue={text} style={{ width: "100%" }} options={[{ value: "T-shirt", label: "T-shirt" }]} />
            )
        },
        {
            title: "Design Type",
            dataIndex: "designType",
            render: (text: string) => (
                <Select defaultValue={text} style={{ width: "100%" }} options={[{ value: "Clone", label: "Clone" }]} />
            )
        },
        {
            title: "Url / Description",
            dataIndex: "url",
            render: (text: string) => <Input defaultValue={text} placeholder="Url or description" />
        },
        {
            title: "",
            dataIndex: "action",
            width: 60,
            render: () => <Button type="text" danger icon={<DeleteOutlined />} />,
        },
    ];

    return (
        <Modal
            title={<span style={{ fontWeight: 600, fontSize: 16 }}>Fulfillment Template</span>}
            open={open}
            onCancel={onCancel}
            width={1000}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={onSave} style={{ backgroundColor: "#1890ff" }}>
                    Save
                </Button>,
            ]}
        >
            <div style={{ paddingTop: 16 }}>
                <Table
                    dataSource={mockTemplates}
                    columns={columns}
                    pagination={false}
                    style={{ border: "1px solid #E4E8EB", borderRadius: 8, overflow: "hidden" }}
                />
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    style={{ width: "100%", marginTop: 16, borderColor: "#3594D0", color: "#3594D0" }}
                >
                    Add new template
                </Button>
            </div>
        </Modal>
    );
}
