"use client";

import React, { useState, useContext } from "react";
import { AppContext } from "./Layout";
import {
    Tabs,
    Input,
    Button,
    Space,
    Card,
    Tag,
    Typography,
    Checkbox,
    Pagination,
    Select,
    Popconfirm,
    Dropdown,
    MenuProps,
    App,
    Row,
    Col,
    Drawer,
    Collapse,
    DatePicker,
    Form
} from "antd";
import {
    SearchOutlined,
    AppstoreOutlined,
    BarsOutlined,
    DeleteOutlined,
    InboxOutlined,
    MoreOutlined,
    DownOutlined,
    CopyOutlined,
    InfoCircleOutlined,
    FileTextOutlined,
    FilterOutlined,
    OneToOneOutlined,
    CalendarOutlined,
    RightOutlined,
    EyeOutlined
} from "@ant-design/icons";
import Icon from "@ant-design/icons";
import AddTaskModal from "./AddTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import { getIdeasByBoard, deleteIdea, updateIdea, getProductTypeOptions } from "@/actions/board.actions";

const EllipsisSvg = () => (
    <svg viewBox="64 64 896 896" focusable="false" data-icon="ellipsis" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"></path>
    </svg>
);

const { Text } = Typography;

const STATUSES = [
    { label: "Draft" },
    { label: "New" },
    { label: "Todo" },
    { label: "Doing" },
    { label: "In Review" },
    { label: "Need Fix" },
    { label: "Done" },
    { label: "Archived" },
    { label: "All" },
];

const STATUS_COLORS: Record<string, string> = {
    'Draft': '#8c8c8c',
    'New': '#13c2c2',
    'Todo': '#1890ff',
    'Doing': '#faad14',
    'In Review': '#722ed1',
    'Need Fix': '#ff4d4f',
    'Done': '#52c41a',
    'Archived': '#bfbfbf',
    'All': '#595959',
};

const STATUS_BG_COLORS: Record<string, string> = {
    'Draft': '#f5f5f5',
    'New': '#e6fffb',
    'Todo': '#e6f4ff',
    'Doing': '#fffbe6',
    'In Review': '#f9f0ff',
    'Need Fix': '#fff1f0',
    'Done': '#f6ffed',
    'Archived': '#f5f5f5',
    'All': '#f0f0f0',
};

export default function Board() {
    const { selectedBoardId } = useContext(AppContext);
    const { message } = App.useApp();

    const [isKanban, setIsKanban] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState("");
    const [activeTab, setActiveTab] = useState("Draft");

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterForm] = Form.useForm();
    const [filterValues, setFilterValues] = useState<any>({});

    const [productTypeOptions, setProductTypeOptions] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchOptions = async () => {
            const ptOptions = await getProductTypeOptions();
            setProductTypeOptions(ptOptions.map((pt: any) => ({ value: pt.id, label: pt.title })));
        };
        fetchOptions();
    }, []);

    const fetchIdeas = async () => {
        setLoading(true);
        const data = await getIdeasByBoard(selectedBoardId);
        setItems(data);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchIdeas();
    }, [selectedBoardId]);

    const handleDelete = async (sku: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const res = await deleteIdea(sku);
        if (res.error) {
            message.error(res.error);
        } else {
            message.success('Task deleted');
            fetchIdeas(); // Reload data
        }
    };

    const handleUpdateStatus = async (sku: string, label: string) => {
        const mappedStatus = label.toUpperCase().replace(/\s+/g, '_');
        const res = await updateIdea(sku, { status: mappedStatus });
        if (res.error) {
            message.error(res.error);
        } else {
            message.success(`Status updated to ${label}`);
            fetchIdeas(); // Reload data
        }
    };

    const tabItems = STATUSES.map((status) => {
        let count = 0;
        if (status.label === 'All') count = items.length;
        else {
            const statusKey = status.label.toUpperCase().replace(/\s+/g, '_');
            count = items.filter(i => i.status === statusKey).length;
        }

        const color = STATUS_COLORS[status.label] || '#595959';
        const bgColor = STATUS_BG_COLORS[status.label] || '#f0f0f0';
        const isActive = activeTab === status.label;

        return {
            key: status.label,
            label: (
                <Space size="small">
                    <span style={{ color: color, fontWeight: isActive ? 600 : 400 }}>{status.label}</span>
                    <Tag style={{ borderRadius: 12, border: isActive ? `1px solid ${color}` : "none", background: bgColor, color: color, margin: 0, padding: '0 8px', fontSize: 12 }}>{count}</Tag>
                </Space>
            ),
        };
    });

    const activeColor = STATUS_COLORS[activeTab] || '#1890ff';

    // Filter items based on all criteria
    const filteredItems = items.filter(item => {
        if (activeTab !== 'All') {
            const statusKey = activeTab.toUpperCase().replace(/\s+/g, '_');
            if (item.status !== statusKey) return false;
        }

        // Search term filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const matches = item.title?.toLowerCase().includes(search) || item.id?.toLowerCase().includes(search);
            if (!matches) return false;
        }

        // Drawer filters
        if (filterValues.designTypes?.length > 0) {
            if (!filterValues.designTypes.includes(item.designType?.toLowerCase())) return false;
        }

        if (filterValues.productTypeIds?.length > 0) {
            if (!filterValues.productTypeIds.includes(item.productTypeId)) return false;
        }

        if (filterValues.createdAt) {
            const [start, end] = filterValues.createdAt;
            const itemDate = new Date(item.createdAt);
            if (itemDate < start.startOf('day').toDate() || itemDate > end.endOf('day').toDate()) return false;
        }

        if (filterValues.updatedAt) {
            const [start, end] = filterValues.updatedAt;
            const itemDate = new Date(item.updatedAt);
            if (itemDate < start.startOf('day').toDate() || itemDate > end.endOf('day').toDate()) return false;
        }

        return true;
    });

    const kanbanItems = activeTab === 'All' ? items : filteredItems;

    return (
        <div>
            {/* Top Toolbar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    gap: 16
                }}
            >
                {selectedBoardId !== "all" ? (
                    <Space.Compact style={{ flexShrink: 0 }}>
                        <Button type="primary" style={{ backgroundColor: "#3594D0" }} onClick={() => setIsModalOpen(true)}>
                            Add Task
                        </Button>
                        <Button type="primary" icon={<Icon component={EllipsisSvg} />} style={{ backgroundColor: "#3594D0" }} />
                    </Space.Compact>
                ) : (
                    <div style={{ flexShrink: 0 }}></div>
                )}

                <Input
                    prefix={<SearchOutlined style={{ color: "#A0AAB3" }} />}
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flexGrow: 1, borderRadius: 6, height: 36 }}
                />
                <Button
                    style={{ height: 36, display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => setIsFilterOpen(true)}
                >
                    <FilterOutlined /> More filters
                </Button>
            </div>

            <AddTaskModal
                open={isModalOpen}
                boardId={selectedBoardId}
                onCancel={() => setIsModalOpen(false)}
                onSave={() => {
                    setIsModalOpen(false);
                    fetchIdeas();
                }}
            />

            <TaskDetailModal
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                onUpdate={fetchIdeas}
                taskId={selectedTaskId}
            />

            <style>{`
                .tabs-pink .ant-tabs-ink-bar {
                    background: ${activeColor} !important;
                }
                .tabs-pink .ant-tabs-nav::before {
                    border-bottom: none !important;
                }
            `}</style>

            {/* Tabs Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #E4E8EB" }}>
                <Tabs
                    className="tabs-pink"
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    style={{ marginBottom: -1 }}
                />
                <Space>
                    <Checkbox>All</Checkbox>
                    <Button disabled style={{ backgroundColor: "#f5f5f5", color: "#bfbfbf", border: "1px solid #d9d9d9" }}>0 selected</Button>
                    <Button icon={<MoreOutlined />} />
                </Space>
            </div>

            {/* Pagination Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <Space>
                    <div style={{ border: "1px solid #E4E8EB", padding: "4px 12px", borderRadius: 6, background: "#fff", display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: 16 }}>{filteredItems.length > 0 ? `1-${filteredItems.length} of ${filteredItems.length} items` : '0 items'}</span>
                        <Pagination simple defaultCurrent={1} total={filteredItems.length} style={{ display: "inline-block" }} />
                    </div>
                    <Select defaultValue="50 / page" style={{ width: 120 }} options={[{ value: '50', label: '50 / page' }]} />
                </Space>

                <Space>
                    <Button
                        type="text"
                        icon={<AppstoreOutlined style={{ fontSize: 20, color: isKanban ? "#1890ff" : "#8c8c8c" }} />}
                        onClick={() => setIsKanban(true)}
                    />
                    <Button
                        type="text"
                        icon={<BarsOutlined style={{ fontSize: 20, color: !isKanban ? "#1890ff" : "#8c8c8c" }} />}
                        onClick={() => setIsKanban(false)}
                    />
                </Space>
            </div>

            {/* Grid View vs List View */}
            {isKanban ? (
                /* Grid View */
                <Row gutter={[16, 16]} style={{ paddingBottom: 40 }}>
                    {filteredItems.map((item: any, index: number) => {
                        const itemStatusLabel = STATUSES.find(s => {
                            if (s.label === 'All') return false;
                            const statusKey = s.label === 'In Review' ? 'IN_REVIEW' : s.label === 'Need Fix' ? 'NEED_FIX' : s.label.toUpperCase();
                            return statusKey === item.status;
                        })?.label || 'Draft';
                        const cardColor = STATUS_COLORS[itemStatusLabel] || '#8c8c8c';

                        return (
                            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={index}>
                                <Card
                                    hoverable
                                    style={{ borderRadius: 4, overflow: 'hidden', border: `1px solid ${item.status === 'DRAFT' ? '#d9d9d9' : cardColor}`, borderBottomWidth: 1 }}
                                    styles={{ body: { padding: '12px' } }}
                                    cover={
                                        <div style={{ backgroundColor: item.status === 'DRAFT' ? '#fff' : cardColor, padding: '4px', borderTopLeftRadius: 4, borderTopRightRadius: 4, cursor: 'pointer' }} onClick={() => { setSelectedTaskId(item.id); setIsDetailOpen(true); }}>
                                            <div style={{ position: 'relative', height: 200, backgroundColor: '#f0f2f5', borderRadius: 2, overflow: 'hidden', border: item.status === 'DRAFT' ? '1px dashed #d9d9d9' : 'none' }}>
                                                {/* Urgent Tag - Matching PinkDesign Style */}
                                                {item.is_urgent && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        left: 8,
                                                        background: '#D92D20',
                                                        color: '#fff',
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        padding: '2px 8px',
                                                        zIndex: 10,
                                                        borderRadius: 4,
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}>Urgent</div>
                                                )}

                                                <Checkbox style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }} onClick={(e) => e.stopPropagation()} />
                                                {item.image ? (
                                                    <img
                                                        alt="Cover"
                                                        src={item.image}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', padding: 12, textAlign: 'center' }}>
                                                        <InboxOutlined style={{ fontSize: 32, marginBottom: 8, color: '#1890ff' }} />
                                                        <span style={{ fontSize: 12 }}>Click or drag images to create cards</span>
                                                    </div>
                                                )}
                                                <div style={{ position: 'absolute', bottom: 4, left: 4, zIndex: 10 }}>
                                                    {item.tags?.filter(Boolean).map((tag: string) => (
                                                        <Tag key={tag} style={{ border: "none", color: item.status === 'DRAFT' ? '#52c41a' : cardColor, background: "#fff", margin: 0, padding: '0 6px', fontSize: 10 }}>{tag}</Tag>
                                                    ))}
                                                    {(!item.tags || item.tags.length === 0) && item.status !== 'DRAFT' && (
                                                        <Tag style={{ border: "none", color: cardColor, background: "#fff", margin: 0, padding: '0 6px', fontSize: 10 }}>Fulfill Vikcom</Tag>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div style={{ marginBottom: 4 }}>
                                        <Text strong style={{ color: "#454F5B", cursor: 'text' }}>{item.id}</Text>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                                        <Text strong style={{ fontSize: 13, color: '#faad14' }}>KPI: {item.kpi.toFixed(2)}</Text>
                                        <div style={{ display: "flex", gap: 12, color: "#8c8c8c", fontSize: 12 }}>
                                            <Space size={4}><FileTextOutlined /> {item.designType || 'NEW'}</Space>
                                            <Space size={4}><InfoCircleOutlined /> {item.productType || 'T-shirt'}</Space>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#8c8c8c' }}>
                                        <Space size={4}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.status === 'DRAFT' ? '#bfbfbf' : cardColor }} />
                                            {new Date(item.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "2-digit" })}
                                        </Space>
                                        <Space size={4}>
                                            {new Date(item.updatedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "2-digit" })}
                                        </Space>
                                    </div>
                                    <Popconfirm title="Delete task?" onConfirm={(e: any) => handleDelete(item.sku, e)} onCancel={(e: any) => e.stopPropagation()}>
                                        <Button type="text" danger icon={<DeleteOutlined />} size="small" style={{ position: 'absolute', bottom: 8, right: 8 }} onClick={(e) => e.stopPropagation()} />
                                    </Popconfirm>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                /* List View (Row format) */
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 40 }}>
                    {/* Header row */}
                    <div style={{ display: "flex", padding: "12px 16px", borderBottom: "1px solid #E4E8EB", fontWeight: 500, color: "#454F5B", alignItems: 'center' }}>
                        <div style={{ width: 16, marginRight: 16 }}></div>
                        <div style={{ width: 160, marginRight: 24 }}>Mockup</div>
                        <div style={{ flexGrow: 1 }}>Task Details</div>
                        <div style={{ width: 220 }}>Timeline</div>
                        <div style={{ width: 100, textAlign: "right" }}>Actions</div>
                    </div>
                    {/* List items */}
                    {filteredItems.map((item: any, index: number) => {
                        const itemStatusLabel = STATUSES.find(s => {
                            if (s.label === 'All') return false;
                            const statusKey = s.label === 'In Review' ? 'IN_REVIEW' : s.label === 'Need Fix' ? 'NEED_FIX' : s.label.toUpperCase();
                            return statusKey === item.status;
                        })?.label || 'Draft';
                        const cardColor = STATUS_COLORS[itemStatusLabel] || '#8c8c8c';

                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "24px 16px",
                                    borderBottom: "1px solid #E4E8EB",
                                    cursor: "pointer",
                                    minHeight: 190,
                                    backgroundColor: '#fff',
                                    transition: 'all 0.3s'
                                }}
                                className="board-list-item"
                                onClick={() => { setSelectedTaskId(item.id); setIsDetailOpen(true); }}
                            >
                                <Checkbox style={{ marginRight: 16 }} onClick={(e) => e.stopPropagation()} />

                                {/* Mockup Column */}
                                <div
                                    style={{
                                        width: 160,
                                        height: 160,
                                        backgroundColor: "#f9f9f9",
                                        borderRadius: 4,
                                        marginRight: 24,
                                        flexShrink: 0,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: '1px solid #f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {item.image ? (
                                        <img
                                            alt="Cover"
                                            src={item.image}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <InboxOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
                                    )}
                                    {item.is_urgent && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 4,
                                            left: 4,
                                            background: '#D92D20',
                                            color: '#fff',
                                            fontSize: 9,
                                            fontWeight: 600,
                                            padding: '1px 6px',
                                            zIndex: 10,
                                            borderRadius: 2
                                        }}>Urgent</div>
                                    )}
                                </div>

                                {/* Title & Info Column */}
                                <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 10, paddingRight: 16 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Text style={{ color: "#D92D20", fontWeight: 600, fontSize: 16 }}>{item.id}</Text>
                                        {item.title && <Text strong style={{ color: "#454F5B", fontSize: 14 }}>{item.title}</Text>}
                                    </div>

                                    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: 'wrap' }}>
                                        <Text strong style={{ fontSize: 14, color: '#faad14' }}>KPI: {item.kpi.toFixed(2)}</Text>
                                        <Space size={4} style={{ color: "#8c8c8c", fontSize: 13 }}><FileTextOutlined /> {item.designType || 'NEW'}</Space>
                                        <Space size={4} style={{ color: "#8c8c8c", fontSize: 13 }}><InfoCircleOutlined /> {item.productType || 'T-shirt'}</Space>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Dropdown
                                                trigger={['click']}
                                                menu={{
                                                    items: STATUSES.filter(s => s.label !== 'All').map(s => ({
                                                        key: s.label,
                                                        label: s.label,
                                                        onClick: () => handleUpdateStatus(item.sku, s.label)
                                                    }))
                                                }}
                                            >
                                                <Button size="small" style={{ fontSize: 12, display: 'flex', alignItems: 'center', color: cardColor, borderColor: cardColor, background: '#fff', borderRadius: 12 }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cardColor, marginRight: 6 }} />
                                                    {itemStatusLabel} <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
                                                </Button>
                                            </Dropdown>
                                        </div>
                                        <Tag style={{ borderRadius: 4, border: "1px solid #CFE6FA", color: "#3594D0", background: "#f0f7ff", margin: 0, padding: '0 8px' }}>Fulfill Vikcom</Tag>
                                    </div>
                                </div>

                                {/* Timeline Column */}
                                <div style={{ width: 220, color: "#8c8c8c", fontSize: 13, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 500, color: '#595959', fontSize: 12, marginBottom: 2 }}>Created At:</div>
                                        <div style={{ color: '#8c8c8c' }}>
                                            {new Date(item.createdAt).toLocaleString('en-US', {
                                                month: 'short', day: '2-digit', year: 'numeric'
                                            }) + ' ' + new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500, color: '#595959', fontSize: 12, marginBottom: 2 }}>Updated At:</div>
                                        <div style={{ color: '#8c8c8c' }}>
                                            {new Date(item.updatedAt).toLocaleString('en-US', {
                                                month: 'short', day: '2-digit', year: 'numeric'
                                            }) + ' ' + new Date(item.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Column */}
                                <div style={{ width: 100, textAlign: "right", display: 'flex', justifyContent: 'flex-end', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        type="text"
                                        icon={<EyeOutlined style={{ color: '#3594D0', fontSize: 18 }} />}
                                        onClick={() => { setSelectedTaskId(item.id); setIsDetailOpen(true); }}
                                    />
                                    <Popconfirm
                                        title="Delete the task"
                                        description="Are you sure to delete this task?"
                                        onConfirm={(e: any) => handleDelete(item.sku, e)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                                        />
                                    </Popconfirm>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <Drawer
                title="More Filters"
                placement="right"
                onClose={() => setIsFilterOpen(false)}
                open={isFilterOpen}
                styles={{
                    body: { padding: '6px' },
                    wrapper: { width: 400 }
                }}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={() => setIsFilterOpen(false)}>Close</Button>
                        <Button onClick={() => {
                            filterForm.resetFields();
                            setFilterValues({});
                        }}>Clear all</Button>
                    </div>
                }
            >
                <Form
                    form={filterForm}
                    layout="vertical"
                    onValuesChange={(_, allValues) => setFilterValues(allValues)}
                >
                    <Collapse
                        ghost
                        expandIconPlacement="end"
                        expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
                        style={{ background: '#fff' }}
                        items={[
                            {
                                key: 'design',
                                label: (
                                    <Space>
                                        <OneToOneOutlined />
                                        <span>Design types</span>
                                    </Space>
                                ),
                                children: (
                                    <Form.Item name="designTypes" style={{ marginBottom: 0 }}>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select design types"
                                            options={[
                                                { value: 'clone', label: 'Clone' },
                                                { value: 'redesign', label: 'Redesign' },
                                                { value: 'new', label: 'New' },
                                            ]}
                                        />
                                    </Form.Item>
                                ),
                            },
                            {
                                key: 'product',
                                label: (
                                    <Space>
                                        <AppstoreOutlined />
                                        <span>Product types</span>
                                    </Space>
                                ),
                                children: (
                                    <Form.Item name="productTypeIds" style={{ marginBottom: 0 }}>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select product types"
                                            options={productTypeOptions}
                                        />
                                    </Form.Item>
                                ),
                            },
                            {
                                key: 'createdAt',
                                label: (
                                    <Space>
                                        <CalendarOutlined />
                                        <span>Created At</span>
                                    </Space>
                                ),
                                children: (
                                    <Form.Item name="createdAt" style={{ marginBottom: 0 }}>
                                        <DatePicker.RangePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                ),
                            },
                            {
                                key: 'updatedAt',
                                label: (
                                    <Space>
                                        <CalendarOutlined />
                                        <span>Updated At</span>
                                    </Space>
                                ),
                                children: (
                                    <Form.Item name="updatedAt" style={{ marginBottom: 0 }}>
                                        <DatePicker.RangePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                ),
                            },
                        ]}
                    />
                </Form>
            </Drawer>
        </div>
    );
}
