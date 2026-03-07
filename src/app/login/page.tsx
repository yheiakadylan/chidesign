"use client";

import React, { useState } from 'react';
import { App, Card, Row, Col, Typography, Button, Divider, Form, Input } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/actions/auth.actions';
import { signIn } from 'next-auth/react';

const { Title, Link } = Typography;

export default function Login() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { message } = App.useApp();

    const onFinish = async (values: any) => {
        setLoading(true);
        // Create FormData from values
        const formData = new FormData();
        formData.append('email', values.email);
        formData.append('password', values.password);

        const result = await loginAction(formData);

        if (result?.error) {
            message.error(result.error);
            setLoading(false);
        } else if (result?.success) {
            message.success('Login successful!');
            router.push('/');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' }}>
            <Card
                styles={{ body: { padding: 0 } }}
                style={{ width: 900, height: 500, overflow: 'hidden', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e4e8eb' }}
            >
                <Row style={{ height: '100%' }}>
                    {/* Left side Image */}
                    <Col span={12} style={{ height: '100%', position: 'relative', backgroundColor: '#e4e8eb' }}>
                        {/* Using standard img tag instead of next/image since we don't have next.config.js configured for external domains */}
                        <img
                            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"
                            alt="Cosmetics"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Col>

                    {/* Right side Login Form */}
                    <Col span={12} style={{ padding: '0 70px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
                        <Title level={4} style={{ textAlign: 'center', marginBottom: 16, fontWeight: 500, color: '#454F5B' }}>Login</Title>

                        <Button
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: 8, transform: 'translateY(2px)' }}>
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            }
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            style={{ width: '100%', marginBottom: 16, height: 40, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', color: '#595959', borderColor: '#d9d9d9' }}
                        >
                            Sign in with Google
                        </Button>

                        <Divider style={{ margin: '12px 0', color: '#8c8c8c', fontSize: 13, borderColor: '#e8e8e8' }} plain>OR</Divider>

                        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
                            <Form.Item
                                label={<span><span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>Email</span>}
                                name="email"
                                style={{ marginBottom: 16 }}
                            >
                                <Input
                                    placeholder="Teeazm@gmail.com"
                                    size="large"
                                    style={{ backgroundColor: '#EDF2F7', border: '1px solid #d9d9d9', borderRadius: 4 }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span><span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>Password</span>}
                                name="password"
                                style={{ marginBottom: 24 }}
                            >
                                <Input.Password
                                    size="large"
                                    style={{ backgroundColor: '#EDF2F7', border: '1px solid #d9d9d9', borderRadius: 4 }}
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ width: '100%', backgroundColor: '#3594D0', height: 40, fontSize: 14, borderRadius: 4, margin: '0 0 16px 0' }}
                            >
                                Login
                            </Button>

                            <div style={{ textAlign: 'center' }}>
                                <Link href="#" style={{ color: '#3594D0', fontSize: 13 }}>Forgot password?</Link>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
