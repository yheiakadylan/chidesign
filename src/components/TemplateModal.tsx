"use client";

import React from "react";
import { Modal, Table, Button, Input, Select, Space } from "antd";
import { HolderOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { getFulfillmentTemplates, saveFulfillmentTemplates } from "@/actions/template.actions";

interface TemplateModalProps {
    boardId: string;
    open: boolean;
    onCancel: () => void;
    onSave: () => void;
}

export default function TemplateModal({ boardId, open, onCancel, onSave }: TemplateModalProps) {
    const [templates, setTemplates] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (open && boardId) {
            fetchTemplates();
        }
    }, [open, boardId]);

    const fetchTemplates = async () => {
        setLoading(true);
        const data = await getFulfillmentTemplates(boardId);
        setTemplates(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        setLoading(true);
        const res = await saveFulfillmentTemplates(boardId, templates);
        setLoading(false);
        if (res.error) {
            // handle error if needed
        } else {
            onSave();
        }
    };

    const updateTemplate = (key: string, field: string, value: string) => {
        setTemplates(prev => prev.map(t => t.key === key ? { ...t, [field]: value } : t));
    };

    const removeTemplate = (key: string) => {
        setTemplates(prev => prev.filter(t => t.key !== key));
    };

    const addTemplate = () => {
        const newKey = Math.random().toString(36).substring(7);
        setTemplates(prev => [...prev, { key: newKey, name: "", productType: "T-shirt", designType: "Clone", url: "" }]);
    };

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
            render: (text: string, record: any) => (
                <Input value={text} onChange={(e) => updateTemplate(record.key, "name", e.target.value)} placeholder="Template name" />
            )
        },
        {
            title: "Product Type",
            dataIndex: "productType",
            render: (text: string, record: any) => (
                <Select value={text} onChange={(val) => updateTemplate(record.key, "productType", val)} style={{ width: "100%" }} options={[{ value: "T-shirt", label: "T-shirt" }]} />
            )
        },
        {
            title: "Design Type",
            dataIndex: "designType",
            render: (text: string, record: any) => (
                <Select value={text} onChange={(val) => updateTemplate(record.key, "designType", val)} style={{ width: "100%" }} options={[{ value: "Clone", label: "Clone" }]} />
            )
        },
        {
            title: "Url / Description",
            dataIndex: "url",
            render: (text: string, record: any) => (
                <Input value={text} onChange={(e) => updateTemplate(record.key, "url", e.target.value)} placeholder="Url or description" />
            )
        },
        {
            title: "",
            dataIndex: "action",
            width: 60,
            render: (_: any, record: any) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeTemplate(record.key)} />,
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
                <Button key="save" type="primary" onClick={handleSave} loading={loading} style={{ backgroundColor: "#1890ff" }}>
                    Save
                </Button>,
            ]}
        >
            <div style={{ paddingTop: 16 }}>
                <Table
                    dataSource={templates}
                    columns={columns}
                    pagination={false}
                    loading={loading}
                    style={{ border: "1px solid #E4E8EB", borderRadius: 8, overflow: "hidden" }}
                />
                <Button
                    type="dashed"
                    onClick={addTemplate}
                    icon={<PlusOutlined />}
                    style={{ width: "100%", marginTop: 16, borderColor: "#3594D0", color: "#3594D0" }}
                >
                    Add new template
                </Button>
            </div>
        </Modal>
    );
}
