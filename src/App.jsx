import React, { useState } from 'react';

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    ShakeOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import Ponto from './routes/Ponto';
import Plano from './routes/Plano';
import Cartao from './routes/Cartao';
import Fechamento from './routes/Fechamento';
import Chat from './routes/Chat';

function NotFound() {
    return <div>Page not found</div>;
}

const App = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState(['1'])

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <div className="demo-logo-vertical" />
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={selectedKey}
                    items={[
                        {
                            icon: <img src='./logos/logo_zig_blue.png' style={{ width: '40px', marginLeft: '-10px' }} />,
                            label: 'Field Zigger'
                        },
                        {
                            key: '1',
                            icon: <ShakeOutlined />,
                            label: 'Plano Operacional',
                            onClick: () => {
                                setSelectedKey(['1'])
                                navigate(`/plano?pipeId=${pipeId}`);
                            }
                        },
                        {
                            key: '2',
                            icon: <ClockCircleOutlined />,
                            label: 'Controle de Ponto',
                            onClick: () => {
                                setSelectedKey(['2'])
                                navigate(`/ponto?pipeId=${pipeId}`);
                            }
                        },
                        {
                            key: '3',
                            icon: <CreditCardOutlined />,
                            label: 'Protocolo de Cartões',
                            onClick: () => {
                                setSelectedKey(['3'])
                                navigate(`/cartao?pipeId=${pipeId}`);
                            }
                        },
                        {
                            key: '4',
                            icon: <UploadOutlined />,
                            label: 'Fechamento Operacional',
                            onClick: () => {
                                setSelectedKey(['4'])
                                navigate(`/fechamento?pipeId=${pipeId}`);
                            }
                        },
                        {
                            key: '5',
                            icon: <MessageOutlined />,
                            label: 'GPT-Z',
                            onClick: () => {
                                setSelectedKey(['5'])
                            }
                        }
                    ]}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        position: 'sticky',
                        top: 0,
                        zIndex: '999'
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />



                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 0,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        display: 'flex'
                    }}
                >
                    <Routes>
                        <Route path="/layout" element={<Layout />} />
                        <Route path="/ponto" element={<Ponto />} />
                        <Route path="/plano" element={<Plano />} />
                        <Route path="/cartao" element={<Cartao />} />
                        <Route path="/fechamento" element={<Fechamento />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/" element={<Plano />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};
export default App;