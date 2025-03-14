import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Input, Button, List, Avatar, Typography, Spin, Divider, Empty, Alert } from 'antd';
import { SendOutlined, UserOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

const TicketChatDrawer = ({ visible, ticketId, currentRecord, pipeId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const messageListRef = useRef(null);
  const currentUser = localStorage.getItem('currentUser');
  const permission = localStorage.getItem('permission');
  const permissionEvento = localStorage.getItem('permissionEvento');

  // Fetch messages when drawer opens or ticketId changes
  useEffect(() => {
    if (visible && ticketId && pipeId) {
      fetchMessages();
    }

    // Cleanup on unmount
    return () => {
      setMessages([]);
    };
  }, [visible, ticketId, pipeId]);

  useEffect(() => {
    // Declare the interval variable
    let chatFetchInterval;

    if (visible === true) {
      chatFetchInterval = setInterval(() => {
        fetchMessages();
        console.log('Fetching messages...');
      }, 5000);
    }

    // This is the cleanup function that runs when the component unmounts
    // or before the effect runs again due to dependency changes
    return () => {
      clearInterval(chatFetchInterval);
      console.log('Chat fetch interval cleared.');
    };
  }, [visible]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!ticketId || !pipeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `pipe/pipeId_${pipeId}/chamados/${ticketId}/chat`
        })
      });

      const data = await response.json();

      if (data && data.docs) {
        const sortedMessages = data.docs
          .map(doc => ({
            id: doc.id,
            text: doc.data.text,
            sender: doc.data.sender,
            timestamp: doc.data.timestamp,
            isCurrentUser: doc.data.sender === currentUser
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        setMessages(sortedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Não foi possível carregar mensagens. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationSupport = async (message) => {
    const responseEvento = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'pipe', docId: `pipeId_${pipeId}` })
    });
    const dataEvento = await responseEvento.json();

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
    const dataUsersArray = dataUsers.docs.map(doc => ({ id: doc.id, permission: doc.data.permission, name: doc.data.username, tokens: doc.data.tokens || [] }));

    for (const user of dataUsersArray) {
      if (dataEvento.equipeEscalada.some(item => (item.funcao == 'Head' && item.nome === user.name) || (item.funcao == 'C-CCO' && item.nome === user.name) || (user.permission === 'admin'))) {
        if (user.tokens.length > 0) {
          try {
            await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: 'Mensagem no chat de suporte recebida',
                body: `${currentUser}: ${message}`,
                userId: user.id,
              }),
            });
          } catch (error) {
            console.error('Error:', error);
          }
        }
      }
    }
  };

  const sendNotificationSolicitante = async (message) => {
    const responseUsers = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'users',
      })
    });
    const dataUsers = await responseUsers.json();
    let dataUsersArray = dataUsers.docs.map((doc) => {
      if(currentUser === doc.data.username) {
        return { id: doc.id }
      }
    })
    const user = dataUsersArray.find(user => user !== undefined);
    console.log(user)
    if (user[0]) {
      try {
        const response = await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Mensagem no chat de suporte recebida',
            body: `${currentUser}: ${message}`,
            userId: user[0].id,
          }),
        });
        if(response.ok) {
          console.log('Notification sent successfully');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticketId || !pipeId) return;

    setSending(true);
    setError(null);

    try {
      const messageData = {
        text: newMessage,
        sender: currentUser,
        timestamp: new Date().getTime(),
        read: false
      };

      const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionURL: `pipe/pipeId_${pipeId}/chamados/${ticketId}/chat`,
          formData: messageData
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
        if(permissionEvento !== 'C-CCO' && permissionEvento !== 'Head' && permission !== 'admin') {
          await sendNotificationSupport(newMessage)
          console.log('Notificação enviada para o suporte')
        } else {
          console.log('Notificação enviada para o solicitante')
          await sendNotificationSolicitante(newMessage)
        }
      } else {
        setError('Não foi possível enviar a mensagem. Tente novamente.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erro ao enviar mensagem. Verifique sua conexão e tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Drawer
      title={<Title level={4}>Chat do Chamado #{ticketId}</Title>}
      placement="right"
      closable={true}
      onClose={onClose}
      open={visible}
      width={400}
      bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {error && (
        <Alert
          message="Erro"
          description={error}
          type="error"
          showIcon
          closable
          style={{ margin: '10px' }}
          onClose={() => setError(null)}
        />
      )}

      <div
        className="message-list"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          backgroundColor: '#f5f5f5'
        }}
        ref={messageListRef}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Spin size="large" tip="Carregando mensagens..." />
          </div>
        ) : messages.length === 0 ? (
          <Empty
            description="Nenhuma mensagem encontrada. Inicie a conversa!"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(message) => (
              <List.Item
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.isCurrentUser ? 'flex-end' : 'flex-start',
                  padding: '8px 0',
                }}
              >
                <div
                  style={{
                    backgroundColor: message.isCurrentUser ? '#1890ff' : '#fff',
                    color: message.isCurrentUser ? '#fff' : '#000',
                    padding: '10px 14px',
                    borderRadius: '18px',
                    maxWidth: '80%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    position: 'relative',
                  }}
                >
                  <div style={{ marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                    {message.sender}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.text}
                  </div>
                  <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.7, textAlign: 'right' }}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>

      <div style={{ padding: '10px', borderTop: '1px solid #e8e8e8', backgroundColor: '#fff' }}>
        <TextArea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem aqui..."
          autoSize={{ minRows: 2, maxRows: 6 }}
          onKeyPress={handleKeyPress}
          disabled={sending}
          style={{ marginBottom: '10px', borderRadius: '8px' }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={sending}
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          style={{ borderRadius: '8px', float: 'right' }}
        >
          Enviar
        </Button>
      </div>
    </Drawer>
  );
};

export default TicketChatDrawer;