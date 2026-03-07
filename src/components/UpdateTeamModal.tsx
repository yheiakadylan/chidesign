"use client";

import React, { useState, useEffect, useRef } from "react";
import { App, Modal, Select, Avatar, Space, Typography, Spin, Tag } from "antd";
import { getBoardMembers, searchUsersByEmail, updateBoardMembers } from "@/actions/board.actions";

const { Text } = Typography;

interface UpdateTeamModalProps {
    open: boolean;
    onCancel: () => void;
    onSave: () => void;
    boardId: string;
}

interface Member {
    id: string;
    full_name: string | null;
    email: string;
}

/** Validate basic email format */
function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function UpdateTeamModal({ open, onCancel, onSave, boardId }: UpdateTeamModalProps) {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // selectedEmails stores email strings (NOT IDs)
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
    const [searchOptions, setSearchOptions] = useState<{ value: string; label: React.ReactNode }[]>([]);
    const [fetching, setFetching] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load current members when modal opens
    useEffect(() => {
        if (open && boardId) {
            loadCurrentMembers();
        }
    }, [open, boardId]);

    const loadCurrentMembers = async () => {
        setLoading(true);
        const res = await getBoardMembers(boardId);
        const members = res.members as Member[];
        setCurrentMembers(members);
        // Pre-populate with current member emails
        setSelectedEmails(members.map(m => m.email));
        setLoading(false);
    };

    // Debounced search for existing users
    const handleSearch = (query: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!query || query.length < 2) {
            setSearchOptions([]);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            setFetching(true);
            const users = await searchUsersByEmail(query) as Member[];

            const opts = users.map(u => ({
                value: u.email,
                label: (
                    <Space>
                        <Avatar size="small" style={{ backgroundColor: "#3594D0", flexShrink: 0 }}>
                            {(u.full_name || u.email).charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{u.full_name || "—"}</div>
                            <div style={{ fontSize: 11, color: "#8c8c8c" }}>{u.email}</div>
                        </div>
                    </Space>
                )
            }));

            // If query looks like a new email, add "Invite new" option
            if (isValidEmail(query) && !users.some(u => u.email === query)) {
                opts.push({
                    value: query,
                    label: (
                        <Space>
                            <Avatar size="small" style={{ backgroundColor: "#52c41a" }}>+</Avatar>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>Invite: <strong>{query}</strong></div>
                                <div style={{ fontSize: 11, color: "#8c8c8c" }}>Will create a new account</div>
                            </div>
                        </Space>
                    )
                });
            }

            setSearchOptions(opts);
            setFetching(false);
        }, 350);
    };

    /** When user types and presses Enter on a valid email, add it directly */
    const handleChange = (values: string[]) => {
        const valid = values.filter(v => isValidEmail(v));
        if (valid.length < values.length) {
            message.warning("Please enter a valid email address");
        }
        setSelectedEmails(valid);
    };

    const handleUpdate = async () => {
        if (selectedEmails.length === 0) {
            message.warning("Please add at least one member");
            return;
        }
        setSubmitting(true);
        const res = await updateBoardMembers(boardId, selectedEmails);
        setSubmitting(false);
        if (res.error) {
            message.error(res.error);
        } else {
            message.success(`Board updated with ${selectedEmails.length} member(s)!`);
            onSave();
        }
    };

    const handleCancel = () => {
        setSearchOptions([]);
        onCancel();
    };

    return (
        <Modal
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Update team member</span>}
            open={open}
            onCancel={handleCancel}
            onOk={handleUpdate}
            okText="Update"
            cancelText="Cancel"
            width={520}
            confirmLoading={submitting}
        >
            <Spin spinning={loading}>
                {/* Current members preview */}
                {currentMembers.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
                            Current team ({currentMembers.length}):
                        </Text>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {currentMembers.map(m => (
                                <Tag key={m.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px" }}>
                                    <Avatar size={16} style={{ backgroundColor: "#3594D0", fontSize: 10 }}>
                                        {(m.full_name || m.email).charAt(0).toUpperCase()}
                                    </Avatar>
                                    <span style={{ fontSize: 12 }}>{m.full_name || m.email}</span>
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}

                {/* Email select — supports search + free-type email */}
                <Select
                    mode="tags"
                    style={{ width: "100%" }}
                    placeholder="Search by email or type new email..."
                    filterOption={false}
                    showSearch
                    value={selectedEmails}
                    onChange={handleChange}
                    onSearch={handleSearch}
                    options={searchOptions}
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    size="large"
                    tokenSeparators={[',', ' ']}
                    allowClear
                />

                <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: "block" }}>
                    💡 Search existing users by email, or type a new email to invite them.
                    New emails will create a placeholder account automatically.
                </Text>
            </Spin>
        </Modal>
    );
}
