import React, { useState, useEffect } from 'react';

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    ShakeOutlined,
    ClockCircleOutlined,
    CreditCardOutlined,
    MessageOutlined,
    QuestionCircleOutlined,
    CustomerServiceFilled,
    SettingOutlined,
    BarChartOutlined,
    DropboxOutlined,
    TeamOutlined,
    OpenAIOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Flex } from 'antd';
const { Header, Sider, Content } = Layout;
import { HashRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import Ponto from './routes/Ponto';
import Plano from './routes/Plano';
import Cartao from './routes/Cartao';
import Fechamento from './routes/Fechamento';
import Chat from './routes/Chat';
import Login from './routes/Login';
import Cronometro from './routes/Cronometro';
import Suporte from './routes/Suporte';
import Estoque from './routes/Estoque';
import { messaging, generateToken } from '../firebaseConfig';
import { onMessage } from 'firebase/messaging';
import Analytics from './routes/Analytics';

function NotFound() {
    return <div>Page not found</div>;
}

const App = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState(() => {
        return localStorage.getItem("selectedKey") || "1";
    })
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [permissionRequested, setPermissionRequested] = useState(false)

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        onMessage(messaging, (payload) => {
            console.log(payload);
        });
    }, [])

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

        const saveToken = async (token) => {
            try {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/saveToken', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        collectionName: `users`,
                        docId: localStorage.getItem('userId'),
                        token: token
                    })
                })

                if (response.ok) {
                    console.log('Token saved succesfully')
                }
            } catch (error) {
                console.error('Error saving token:', error)
            }
        }

        const registerServiceWorker = async () => {
            if ("serviceWorker" in navigator) {
              try {
                const swPath = `/firebase-messaging-sw.js`;
                const registration = await navigator.serviceWorker.register(swPath);
                console.log("Service Worker registered at:", swPath);
              } catch (error) {
                console.error("Error registering Service Worker:", error);
              }
            }
          };

        const requestPermission = async () => {
            const token = await generateToken()
            await saveToken(token)
        }

        getAuthentication()
        if(isAuthenticated == true && permissionRequested == false) {
            requestPermission()
            registerServiceWorker()
            setPermissionRequested(true)
        }
    }, [navigate])

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{

                    zIndex: 9999,
                    top: 0,
                    // boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)"
                }}
            >
                <div className="demo-logo-vertical" />
                <Menu
                    theme="dark"
                    mode="vertical"
                    style={{ position: 'sticky' }}
                    defaultSelectedKeys={selectedKey}

                    items={[
                        {
                            key: '1',
                            icon: <ShakeOutlined />,
                            label: 'Plano Operacional',
                            onClick: () => {
                                setSelectedKey(['1'])
                                localStorage.setItem("selectedKey", "1")
                                navigate(`/plano?pipeId=${pipeId}`);
                                setCollapsed(true)
                            }
                        },
                        {
                            key: '2',
                            icon: <TeamOutlined />,
                            label: 'Controle de Ponto',
                            onClick: () => {
                                setSelectedKey(['2'])
                                localStorage.setItem("selectedKey", "2")
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
                                localStorage.setItem("selectedKey", "3")
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
                                localStorage.setItem("selectedKey", "4")
                                navigate(`/fechamento?pipeId=${pipeId}`);
                                setCollapsed(true)
                            }
                        },
                        {
                            key: '5',
                            icon: <OpenAIOutlined />,
                            label: 'GPT-Z',
                            onClick: () => {
                                setSelectedKey(['5'])
                                localStorage.setItem("selectedKey", "5")
                                setCollapsed(true)
                            }
                        },
                        {
                            key: '6',
                            icon: <CustomerServiceFilled />,
                            label: 'Central de Suporte',
                            onClick: () => {
                                setSelectedKey(['6'])
                                localStorage.setItem("selectedKey", "6")
                                navigate(`/suporte?pipeId=${pipeId}`);
                                setCollapsed(true)
                            }
                        },
                        {
                            key: '7',
                            icon: <ClockCircleOutlined />,
                            label: 'Cronômetro Config',
                            onClick: () => {
                                setSelectedKey(['7'])
                                localStorage.setItem("selectedKey", "7")
                                navigate(`/cronometro?pipeId=${pipeId}`);
                                setCollapsed(true)
                            },
                            disabled: localStorage.getItem('permission') !== 'config' && localStorage.getItem('permission') !== 'admin' && localStorage.getItem('permissionEvento') !== 'Controle Supervisores' && localStorage.getItem('permissionEvento') !== 'Controle Técnicos',
                            hidden: localStorage.getItem('permission') !== 'config' && localStorage.getItem('permission') !== 'admin'
                        }, 
                        {
                            key: '8',
                            icon: <DropboxOutlined />,
                            label: 'Estoque',
                            onClick: () => {
                                setSelectedKey(['8'])
                                localStorage.setItem("selectedKey", "8")
                                navigate(`/estoque?pipeId=${pipeId}`);
                                setCollapsed(true)
                            },

                        },
                        {
                            key: '9',
                            icon: <BarChartOutlined />,
                            label: 'Analytics',
                            onClick: () => {
                                setSelectedKey(['9'])
                                localStorage.setItem("selectedKey", "9")
                                navigate(`/analytics?pipeId=${pipeId}`);
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

                        {localStorage.getItem('isAuthenticated') && <p style={{ margin: '0 5% 0 auto' }}><b>Sessão válida até: {new Date(JSON.parse(localStorage.getItem('isAuthenticated')).expirationDate).toLocaleTimeString()}</b></p>}
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
                        <Route path="/suporte" element={<Suporte />} />
                        <Route path="/estoque" element={<Estoque />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/" element={<Login />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>

                </Content>
            </Layout>
        </Layout>
    );
};
export default App;