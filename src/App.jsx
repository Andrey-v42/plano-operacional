import React, { useState, useEffect } from 'react';

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    ShakeOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Flex } from 'antd';
const { Header, Sider, Content } = Layout;
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import Ponto from './routes/Ponto';
import Plano from './routes/Plano';
import Cartao from './routes/Cartao';
import Fechamento from './routes/Fechamento';
import Chat from './routes/Chat';
import Login from './routes/Login';
import Cronometro from './routes/Cronometro';

function NotFound() {
    return <div>Page not found</div>;
}

const App = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState(['1'])
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        const getAuthentication = async () => {
            const authStatus = JSON.parse(localStorage.getItem('isAuthenticated'));

            if (!authStatus || !authStatus.value || !authStatus.expirationDate) {
                navigate(`/login?pipeId=${pipeId}`);
                return;
            }
    
            const isValid = authStatus.value === 'true' && authStatus.expirationDate >= new Date().getTime();
    
            if (isValid) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('isAuthenticated');
                navigate(`/login?pipeId=${pipeId}`);
            }
        }
        
        getAuthentication()
    }, [navigate])

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
                                setCollapsed(true)
                            }
                        },
                        {
                            key: '2',
                            icon: <ClockCircleOutlined />,
                            label: 'Controle de Ponto',
                            onClick: () => {
                                setSelectedKey(['2'])
                                navigate(`/ponto?pipeId=${pipeId}`);
                                setCollapsed(true)
                            }
                        },
                        {
                            key: '3',
                            icon: <CreditCardOutlined />,
                            label: 'Protocolo de Cartões',
                            onClick: () => {
                                setSelectedKey(['3'])
                                navigate(`/cartao?pipeId=${pipeId}`);
                                setCollapsed(true)
                            }
                        },
                        {
                            key: '4',
                            icon: <UploadOutlined />,
                            label: 'Fechamento Operacional',
                            onClick: () => {
                                setSelectedKey(['4'])
                                navigate(`/fechamento?pipeId=${pipeId}`);
                                setCollapsed(true)
                            }
                        },
                        {
                            key: '5',
                            icon: <MessageOutlined />,
                            label: 'GPT-Z',
                            onClick: () => {
                                setSelectedKey(['5'])
                                setCollapsed(true)
                            }
                        },
                        {
                            key: '6',
                            icon: <ClockCircleOutlined />,
                            label: 'Cronômetro Config',
                            onClick: () => {
                                setSelectedKey(['6'])
                                navigate(`/cronometro?pipeId=${pipeId}`);
                                setCollapsed(true)
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
                >   <Flex>
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

                    {localStorage.getItem('isAuthenticated') && <p style={{ margin: '0 5% 0 auto' }}><b>Sessão válida até: {new Date(JSON.parse(localStorage.getItem('isAuthenticated')).expirationDate).toLocaleTimeString()}</b></p> }
                    </Flex>


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
                        <Route path="/login" element={<Login />} />
                        <Route path="/cronometro" element={<Cronometro />} />
                        <Route path="/" element={<Login />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};
export default App;