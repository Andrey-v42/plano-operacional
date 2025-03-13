import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Avatar, Badge, Typography, Space, Divider, Empty, Spin } from 'antd';
import { SendOutlined, UserOutlined, CommentOutlined, CustomerServiceOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';

const { Text, Title } = Typography;
const { TextArea } = Input;

const ChatTab = ({ pipeId }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [currentChats, setCurrentChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const messagesEndRef = useRef(null);
    
    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `pipe/pipeId_${pipeId}/chats`
                })
            });
            let data = await response.json();
            data = data.docs;
            
            const chats = data.map((doc) => ({
                id: doc.id,
                title: doc.data.title || `Chat ${doc.id}`,
                lastMessage: doc.data.lastMessage || 'Sem mensagens',
                timestamp: doc.data.lastTimestamp || Date.now(),
                unread: doc.data.unread || 0,
                participants: doc.data.participants || []
            }));
            
            setCurrentChats(chats);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching chats:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId) => {
        if (!chatId) return;
        
        try {
            setLoading(true);
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `pipe/pipeId_${pipeId}/chats/${chatId}/messages`
                })
            });
            let data = await response.json();
            data = data.docs;
            
            const chatMessages = data.map((doc) => ({
                id: doc.id,
                text: doc.data.text,
                sender: doc.data.sender,
                timestamp: doc.data.timestamp,
                read: doc.data.read || false
            })).sort((a, b) => a.timestamp - b.timestamp);
            
            setMessages(chatMessages);
            
            // Mark messages as read
            if (chatMessages.some(msg => !msg.read && msg.sender !== localStorage.getItem('currentUser'))) {
                await updateReadStatus(chatId);
                
                // Update the unread count in the chat list
                setCurrentChats(prevChats => 
                    prevChats.map(chat => 
                        chat.id === chatId ? { ...chat, unread: 0 } : chat
                    )
                );
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const updateReadStatus = async (chatId) => {
        try {
            const unreadMessages = messages.filter(msg => 
                !msg.read && msg.sender !== localStorage.getItem('currentUser')
            );
            
            for (const msg of unreadMessages) {
                await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDocMerge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: 'pipe',
                        docId: `pipeId_${pipeId}/chats/${chatId}/messages/${msg.id}`,
                        data: { read: true }
                    })
                });
            }
        } catch (error) {
            console.error('Error updating read status:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || !selectedChat) return;
        
        const currentUser = localStorage.getItem('currentUser');
        const newMessage = {
            text: inputValue.trim(),
            sender: currentUser,
            timestamp: Date.now(),
            read: false
        };
        
        try {
            // Add message to firestore
            await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    collectionURL: `pipe/pipeId_${pipeId}/chats/${selectedChat}/messages`,
                    formData: newMessage
                })
            });
            
            // Update last message in chat
            await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDocMerge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: 'pipe',
                    docId: `pipeId_${pipeId}/chats/${selectedChat}`,
                    data: { 
                        lastMessage: newMessage.text,
                        lastTimestamp: newMessage.timestamp,
                        lastSender: currentUser
                    }
                })
            });
            
            // Add message to local state
            setMessages(prev => [...prev, newMessage]);
            setInputValue('');
            
            // Update chat list
            setCurrentChats(prevChats => 
                prevChats.map(chat => 
                    chat.id === selectedChat 
                        ? { 
                            ...chat, 
                            lastMessage: newMessage.text,
                            timestamp: newMessage.timestamp 
                        } 
                        : chat
                )
            );
            
            // Send notifications to other participants
            await sendChatNotifications(selectedChat, newMessage.text);
            
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const sendChatNotifications = async (chatId, messageText) => {
        try {
            const chat = currentChats.find(c => c.id === chatId);
            if (!chat || !chat.participants) return;
            
            const currentUser = localStorage.getItem('currentUser');
            const recipients = chat.participants.filter(p => p !== currentUser);
            
            const responseUsers = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: 'users',
                })
            });
            
            let dataUsers = await responseUsers.json();
            const dataUsersArray = dataUsers.docs.map(doc => ({ 
                id: doc.id, 
                name: doc.data.username, 
                tokens: doc.data.tokens || [] 
            }));
            
            for (const recipient of recipients) {
                const user = dataUsersArray.find(u => u.name === recipient);
                if (user && user.tokens.length > 0) {
                    try {
                        await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                title: 'Nova mensagem',
                                body: `${currentUser}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
                                userId: user.id,
                            }),
                        });
                        
                        // Update unread count for recipient
                        await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDocMerge', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                url: 'pipe',
                                docId: `pipeId_${pipeId}/chats/${chatId}`,
                                data: { 
                                    unread: (chat.unread || 0) + 1
                                }
                            })
                        });
                    } catch (err) {
                        console.error('Error sending notification:', err);
                    }
                }
            }
        } catch (error) {
            console.error('Error in chat notifications:', error);
        }
    };

    const createNewChat = async () => {
        try {
            setLoading(true);
            
            const currentUser = localStorage.getItem('currentUser');
            const newChat = {
                title: `Novo chat - ${new Date().toLocaleString()}`,
                participants: [currentUser, 'Suporte'],
                created: Date.now(),
                lastTimestamp: Date.now(),
                lastMessage: 'Chat iniciado',
                lastSender: currentUser,
                unread: 0
            };
            
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    collectionURL: `pipe/pipeId_${pipeId}/chats`,
                    formData: newChat
                })
            });
            
            const data = await response.json();
            if (data.id) {
                // Add initial message
                await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        collectionURL: `pipe/pipeId_${pipeId}/chats/${data.id}/messages`,
                        formData: {
                            text: 'Chat iniciado. Como podemos ajudar?',
                            sender: 'Sistema',
                            timestamp: Date.now(),
                            read: false
                        }
                    })
                });
                
                await fetchChats();
                setSelectedChat(data.id);
                fetchMessages(data.id);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error creating chat:', error);
            setLoading(false);
        }
    };

    const handleChatSelect = (chatId) => {
        setSelectedChat(chatId);
        fetchMessages(chatId);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Initial load
    useEffect(() => {
        if (pipeId) {
            fetchChats();
        }
    }, [pipeId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Set up polling for new messages
    useEffect(() => {
        if (!selectedChat) return;
        
        const interval = setInterval(() => {
            fetchMessages(selectedChat);
        }, 10000); // Check for new messages every 10 seconds
        
        return () => clearInterval(interval);
    }, [selectedChat, pipeId]);

    return (
        <div className="chat-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navigation Header */}
            <div className="chat-header" style={{ 
                padding: '12px 20px', 
                borderBottom: '1px solid #e8e8e8', 
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Title level={4} style={{ margin: 0 }}>Chat de Suporte</Title>
                    <Button 
                        type="primary" 
                        onClick={createNewChat}
                        icon={<CommentOutlined />}
                    >
                        Novo Chat
                    </Button>
                </div>
            </div>
            
            {/* Main Chat Area */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Chat List Sidebar */}
                <div className="chat-sidebar" style={{ 
                    width: '300px', 
                    borderRight: '1px solid #e8e8e8', 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#f9f9f9'
                }}>
                    <div style={{ padding: '15px 15px 10px', borderBottom: '1px solid #eee' }}>
                        <Input 
                            placeholder="Buscar conversas..." 
                            prefix={<SearchOutlined />} 
                            style={{ borderRadius: '20px' }}
                        />
                    </div>
                    
                    <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                        {loading && !currentChats.length ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Spin />
                            </div>
                        ) : currentChats.length === 0 ? (
                            <Empty 
                                description="Nenhuma conversa encontrada" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                style={{ margin: '40px 0' }}
                            />
                        ) : (
                            <List
                                dataSource={currentChats}
                                renderItem={item => (
                                    <List.Item 
                                        onClick={() => handleChatSelect(item.id)}
                                        className={selectedChat === item.id ? 'selected-chat-item' : ''}
                                        style={{ 
                                            cursor: 'pointer', 
                                            padding: '12px 15px',
                                            borderRadius: '8px',
                                            margin: '4px 0',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', width: '100%' }}>
                                            <Avatar 
                                                style={{ 
                                                    backgroundColor: '#1890ff',
                                                    marginRight: '12px'
                                                }}
                                                icon={<UserOutlined />}
                                            />
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center' 
                                                }}>
                                                    <Text strong ellipsis style={{ maxWidth: '140px' }}>
                                                        {item.title}
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </Text>
                                                </div>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    marginTop: '4px'
                                                }}>
                                                    <Text type="secondary" ellipsis style={{ maxWidth: '160px', fontSize: '13px' }}>
                                                        {item.lastMessage}
                                                    </Text>
                                                    {item.unread > 0 && (
                                                        <Badge 
                                                            count={item.unread} 
                                                            style={{ 
                                                                backgroundColor: '#1890ff',
                                                                fontSize: '11px',
                                                                minWidth: '18px',
                                                                height: '18px',
                                                                lineHeight: '18px'
                                                            }} 
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        )}
                    </div>
                </div>
                
                {/* Conversation Area */}
                <div className="conversation-area" style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    backgroundColor: '#fff'
                }}>
                    {/* Chat Header */}
                    {selectedChat && (
                        <div style={{ 
                            padding: '15px 20px', 
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <Avatar 
                                style={{ 
                                    backgroundColor: '#722ed1', 
                                    marginRight: '12px'
                                }}
                                icon={<CustomerServiceOutlined />}
                            />
                            <div style={{ flex: 1 }}>
                                <Text strong style={{ fontSize: '16px' }}>
                                    {currentChats.find(c => c.id === selectedChat)?.title || 'Chat'}
                                </Text>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        {currentChats.find(c => c.id === selectedChat)?.participants.join(', ')}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Messages Area */}
                    <div style={{ 
                        flex: 1, 
                        overflow: 'auto', 
                        padding: '20px',
                        backgroundColor: '#f5f5f5'
                    }}>
                        {!selectedChat ? (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                height: '100%',
                                textAlign: 'center',
                                padding: '40px'
                            }}>
                                <CommentOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
                                <Text style={{ fontSize: '16px', marginBottom: '24px' }}>
                                    Selecione uma conversa existente ou crie um novo chat para começar
                                </Text>
                                <Button 
                                    type="primary" 
                                    onClick={createNewChat} 
                                    size="large"
                                    icon={<CommentOutlined />}
                                >
                                    Iniciar novo chat
                                </Button>
                            </div>
                        ) : loading && !messages.length ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Spin size="large" />
                            </div>
                        ) : messages.length === 0 ? (
                            <Empty description="Nenhuma mensagem nesta conversa" />
                        ) : (
                            <div>
                                {messages.map((msg, index) => {
                                    const isCurrentUser = msg.sender === localStorage.getItem('currentUser');
                                    const isSupportUser = msg.sender === 'Suporte';
                                    const isSystem = msg.sender === 'Sistema';
                                    
                                    return (
                                        <div 
                                            key={msg.id || index} 
                                            style={{ 
                                                display: 'flex',
                                                flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                                                marginBottom: '16px'
                                            }}
                                        >
                                            {!isCurrentUser && (
                                                <Avatar 
                                                    style={{ 
                                                        marginRight: isCurrentUser ? 0 : '12px',
                                                        marginLeft: isCurrentUser ? '12px' : 0, 
                                                        marginTop: '4px',
                                                        backgroundColor: isSystem ? '#52c41a' : 
                                                                       isSupportUser ? '#722ed1' : '#1890ff'
                                                    }}
                                                    icon={
                                                        isSystem ? <InfoCircleOutlined /> : 
                                                        isSupportUser ? <CustomerServiceOutlined /> : <UserOutlined />
                                                    }
                                                />
                                            )}
                                            <div
                                                style={{
                                                    maxWidth: '70%',
                                                    padding: '12px 16px',
                                                    borderRadius: '18px',
                                                    backgroundColor: isCurrentUser ? '#1890ff' : '#fff',
                                                    color: isCurrentUser ? 'white' : 'black',
                                                    marginLeft: isCurrentUser ? '0' : '4px',
                                                    marginRight: isCurrentUser ? '4px' : '0',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {msg.sender !== 'Sistema' && (
                                                    <div style={{ 
                                                        fontWeight: '600', 
                                                        marginBottom: '6px', 
                                                        fontSize: '14px',
                                                        color: isCurrentUser ? 'rgba(255,255,255,0.9)' : '#333'
                                                    }}>
                                                        {msg.sender}
                                                    </div>
                                                )}
                                                <div style={{ 
                                                    wordBreak: 'break-word',
                                                    fontSize: '15px',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {msg.text}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '12px', 
                                                    marginTop: '6px',
                                                    textAlign: 'right',
                                                    opacity: 0.7
                                                }}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                            {isCurrentUser && (
                                                <Avatar 
                                                    style={{ 
                                                        marginLeft: '12px', 
                                                        marginTop: '4px',
                                                        backgroundColor: '#fa8c16'
                                                    }}
                                                    icon={<UserOutlined />}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                    
                    {/* Input Area */}
                    {selectedChat && (
                        <div style={{ 
                            padding: '16px 20px', 
                            borderTop: '1px solid #eee',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <TextArea
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                onPressEnter={e => {
                                    if (!e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                style={{ 
                                    borderRadius: '20px', 
                                    flex: 1,
                                    padding: '10px 15px',
                                    resize: 'none'
                                }}
                            />
                            <Button 
                                type="primary" 
                                shape="circle" 
                                icon={<SendOutlined />} 
                                onClick={sendMessage}
                                style={{ 
                                    marginLeft: '12px'
                                }}
                                size="large"
                            />
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx global>{`
                .selected-chat-item {
                    background-color: rgba(24, 144, 255, 0.1);
                }
                .selected-chat-item:hover {
                    background-color: rgba(24, 144, 255, 0.15) !important;
                }
                .ant-list-item:hover {
                    background-color: rgba(0, 0, 0, 0.03);
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                .chat-container .ant-input:focus, .chat-container .ant-input-focused {
                    box-shadow: none;
                    border-color: #d9d9d9;
                }
            `}</style>
        </div>
    );
};

export default ChatTab;