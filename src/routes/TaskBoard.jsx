import React, { useState } from 'react';
import { Card, Table, Typography, Badge, Button, Collapse, Space, Tag, Form, Input, Tooltip, Col, Row } from 'antd';
import { DownOutlined, UpOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CommentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const TaskBoard = ({ dataChamados, fetchChamados, handleAnswerClick, changeStatus, handleCreateChatForTicket }) => {
  const [openPanels, setOpenPanels] = useState(['pending', 'analysis']); // Default open panels
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [answerForms, setAnswerForms] = useState({});
  const [buttonAnswerLoading, setButtonAnswerLoading] = useState({});

  // Group data by status
  const pendingTickets = dataChamados.filter(ticket => ticket.status === 'pending');
  const analysisTickets = dataChamados.filter(ticket => ticket.status === 'analysis');
  const closedTickets = dataChamados.filter(ticket => ticket.status === 'closed');

  const currentUser = localStorage.getItem('currentUser');
  const permission = localStorage.getItem('permission');
  const permissionEvento = localStorage.getItem('permissionEvento');

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

  const toggleAnswerForm = (recordId) => {
    setAnswerForms({
      ...answerForms,
      [recordId]: !answerForms[recordId]
    });

    // Make sure the row is expanded
    if (!expandedRowKeys.includes(recordId)) {
      setExpandedRowKeys([...expandedRowKeys, recordId]);
    }
  };

  const handleSubmitAnswer = (recordId, values) => {
    setButtonAnswerLoading({
      ...buttonAnswerLoading,
      [recordId]: true
    });

    // Call the original handleAnswerClick with the necessary data
    handleAnswerClick(recordId, values.resposta);

    // Reset the form state after submission is complete
    setTimeout(() => {
      setAnswerForms({
        ...answerForms,
        [recordId]: false
      });

      setButtonAnswerLoading({
        ...buttonAnswerLoading,
        [recordId]: false
      });
    }, 1000);
  };

  const handleRowClick = (record) => {
    setExpandedRowKeys((prevKeys) =>
      prevKeys.includes(record.key)
        ? prevKeys.filter((key) => key !== record.key)
        : [...prevKeys, record.key]
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
    // {
    //   title: 'PDV',
    //   dataIndex: 'ponto',
    //   key: 'ponto',
    // },
    {
      title: 'Atendente',
      dataIndex: 'atendente',
      key: 'atendente',
      render: (atendente) => (
        <div style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Tooltip title={atendente === null ? 'Não atribuído' : atendente}>
            {atendente === null ? 'Não atribuído' : atendente}
          </Tooltip>
        </div>
      )
    },
    {
      title: 'Ações',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc') && (
            <Button type="primary" size="small" onClick={() => changeStatus(record.id)}>
              Abrir Ticket
            </Button>
          )}
          {record.status === 'analysis' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc') && (
            <Button
              type="primary"
              size="small"
              onClick={() => toggleAnswerForm(record.id)}
            >
              Responder
            </Button>
          )}
          {record.status !== 'closed' && (currentUser === record.solicitante || permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc') && (
            <Button
              type="default"
              size="small"
              onClick={() => handleCreateChatForTicket(record.id)}
            >
              <CommentOutlined />Chat
            </Button>
          )}
        </Space>
      ),
    }
  ];

  const expandedRowRender = (record) => (
    <Card bordered={false} style={{ background: '#f5f5f5' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Space direction="vertical">
            <div>
              <Text strong>Descrição:</Text> {record.descricao}
            </div>

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
                  <Text strong>Resposta:</Text> {record.resposta}
                </div>
                <div>
                  <Text strong>Fechado em:</Text> {new Date(record.timestampResposta).toLocaleString()}
                </div>
              </>
            )}

            {/* Answer form inside expanded row */}
            {record.status === 'analysis' && answerForms[record.id] && (
              <Card
                title="Responder Chamado"
                style={{ marginTop: 20, borderRadius: '8px' }}
              >
                <Form
                  layout='vertical'
                  onFinish={(values) => handleSubmitAnswer(record.id, values)}
                >
                  <Form.Item
                    label={<Text strong>Resposta</Text>}
                    name='resposta'
                    rules={[{ required: true, message: 'Campo obrigatório' }]}
                  >
                    <TextArea
                      placeholder='Digite a resposta do chamado'
                      rows={4}
                      style={{ borderRadius: '4px' }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button
                        loading={buttonAnswerLoading[record.id]}
                        htmlType='submit'
                        type="primary"
                        style={{ borderRadius: '4px' }}
                      >
                        Enviar Resposta
                      </Button>
                      <Button
                        onClick={() => toggleAnswerForm(record.id)}
                        style={{ borderRadius: '4px' }}
                      >
                        Cancelar
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            )}
          </Space>
        </Col>
        <Col span={12}  >
          <Space direction='vertical'>
            {record.setor && (
              <div>
                <Text strong>Setor:</Text> {record.setor}
              </div>
            )}

            {record.ponto && (
              <div>
                <Text strong>PDV:</Text> {record.ponto}
              </div>
            )}

            {record.modelo && (
              <div>
                <Text strong>Modelo do Terminal:</Text> {record.modelo}
              </div>
            )}
          </Space>
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }} gutter={16}>
        <Space style={{ marginLeft: 'auto' }}>
          {record.status === 'pending' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc') && (
            <Button type="primary" size="small" onClick={() => changeStatus(record.id)}>
              Abrir Ticket
            </Button>
          )}
          {record.status === 'analysis' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc') && (
            <Button
              type="primary"
              size="small"
              onClick={() => toggleAnswerForm(record.id)}
            >
              Responder
            </Button>
          )}
          {record.status !== 'closed' && (currentUser === record.solicitante || permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc') && (
            <Button
              type="default"
              size="small"
              onClick={() => handleCreateChatForTicket(record.id)}
            >
              <CommentOutlined />Chat
            </Button>
          )}
        </Space>
      </Row>

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
            expandedRowKeys: expandedRowKeys,
            onExpand: (expanded, record) => {
              if (expanded) {
                setExpandedRowKeys([...expandedRowKeys, record.id]);
              } else {
                setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.id));
              }
            }
          }}
          size="middle"
          rowClassName={(record) => record.urgencia === 'Urgente' ? 'urgent-row' : ''}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
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