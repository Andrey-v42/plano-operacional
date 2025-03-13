import React, { useState } from 'react';
import { Card, Table, Typography, Badge, Button, Collapse, Space, Tag } from 'antd';
import { DownOutlined, UpOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const TaskBoard = ({ dataChamados, fetchChamados, handleAnswerClick, changeStatus, handleCreateChatForTicket }) => {
  const [openPanels, setOpenPanels] = useState(['pending', 'analysis']); // Default open panels

  // Group data by status
  const pendingTickets = dataChamados.filter(ticket => ticket.status === 'pending');
  const analysisTickets = dataChamados.filter(ticket => ticket.status === 'analysis');
  const closedTickets = dataChamados.filter(ticket => ticket.status === 'closed');

  const togglePanel = (key) => {
    if (openPanels.includes(key)) {
      setOpenPanels(openPanels.filter(panel => panel !== key));
    } else {
      setOpenPanels([...openPanels, key]);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'pending') {
      return <Badge status="error" text={<Text strong style={{ color: '#ff4d4f' }}>Aberto</Text>} />;
    } else if (status === 'closed') {
      return <Badge status="success" text={<Text strong style={{ color: '#52c41a' }}>Fechado</Text>} />;
    } else {
      return <Badge status="processing" text={<Text strong style={{ color: '#1890ff' }}>Andamento</Text>} />;
    }
  };

  const getUrgencyTag = (urgencia) => {
    return (
      <Tag color={urgencia === 'Urgente' ? 'red' : 'green'}>
        {urgencia}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Solicitante',
      dataIndex: 'solicitante',
      key: 'solicitante',
      width: '15%',
    },
    {
      title: 'Data',
      dataIndex: 'timestampAberto',
      key: 'timestampAberto',
      width: '15%',
      render: (timestampAberto) => new Date(timestampAberto).toLocaleString()
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
      width: '20%',
    },
    {
      title: 'Nível de urgência',
      dataIndex: 'urgencia',
      key: 'urgencia',
      width: '15%',
      render: (urgencia) => getUrgencyTag(urgencia)
    },
    {
      title: 'PDV',
      dataIndex: 'ponto',
      key: 'ponto',
      width: '15%',
    },
    {
      title: 'Ações',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button type="primary" size="small" onClick={() => changeStatus(record.id)}>
              Abrir Ticket
            </Button>
          )}
          {record.status === 'analysis' && (
            <Button type="primary" size="small" onClick={() => handleAnswerClick(record.id)}>
              Responder
            </Button>
          )}
          {record.status !== 'closed' && (
            <Button
              type="default"
              size="small"
              onClick={() => handleCreateChatForTicket(record.id)}
            >
              Chat
            </Button>
          )}
        </Space>
      ),
    }
  ];

  const expandedRowRender = (record) => (
    <Card bordered={false} style={{ background: '#f5f5f5' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Descrição:</Text>
          <p>{record.descricao}</p>
        </div>
        
        {record.modelo && (
          <div>
            <Text strong>Modelo do Terminal:</Text> {record.modelo}
          </div>
        )}
        
        {record.status === 'analysis' && record.timestampAnalise && (
          <div>
            <Text strong>Em análise desde:</Text> {new Date(record.timestampAnalise).toLocaleString()}
          </div>
        )}
        
        {record.status === 'closed' && record.resposta && (
          <>
            <div>
              <Text strong>Atendente:</Text> {record.atendente}
            </div>
            <div>
              <Text strong>Resposta:</Text>
              <p>{record.resposta}</p>
            </div>
            <div>
              <Text strong>Fechado em:</Text> {new Date(record.timestampResposta).toLocaleString()}
            </div>
          </>
        )}
      </Space>
    </Card>
  );

  const renderTableSection = (title, data, status, icon) => {
    const isOpen = openPanels.includes(status);
    
    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={isOpen ? <UpOutlined /> : <DownOutlined />}
              onClick={() => togglePanel(status)}
            />
            <Space style={{ marginLeft: 8 }}>
              {icon}
              <Title level={5} style={{ margin: 0 }}>{title} ({data.length})</Title>
            </Space>
          </div>
        }
        style={{ marginBottom: 16, borderRadius: 8 }}
        bodyStyle={{ padding: isOpen ? 16 : 0, display: isOpen ? 'block' : 'none' }}
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          expandable={{
            expandedRowRender: expandedRowRender,
          }}
          size="middle"
          rowClassName={(record) => record.urgencia === 'Urgente' ? 'urgent-row' : ''}
        />
      </Card>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={fetchChamados}>
          Atualizar
        </Button>
      </div>
      
      {renderTableSection(
        'Chamados Abertos', 
        pendingTickets, 
        'pending',
        <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
      )}
      
      {renderTableSection(
        'Chamados em Andamento', 
        analysisTickets, 
        'analysis',
        <SyncOutlined style={{ color: '#1890ff' }} />
      )}
      
      {renderTableSection(
        'Chamados Fechados', 
        closedTickets, 
        'closed',
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
      )}
    </div>
  );
};

export default TaskBoard;