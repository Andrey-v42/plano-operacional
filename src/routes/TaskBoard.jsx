import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Badge, Button, Collapse, Space, Tag, Form, Input, Tooltip, Col, Row, Select } from 'antd';
import { DownOutlined, UpOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CommentOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { data } from 'react-router-dom';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

// The issue is likely in the renderTableSection function
// Let's rewrite this function to make sure it doesn't call itself recursively

const TaskBoard = ({ dataChamados, fetchChamados, handleAnswerClick, changeStatus, reopenTicket, handleCreateChatForTicket }) => {
  const [openPanels, setOpenPanels] = useState(['pending', 'analysis', 'validation', 'reopened']);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [answerForms, setAnswerForms] = useState({});
  const [buttonAnswerLoading, setButtonAnswerLoading] = useState({});
  const [reopenForm, setReopenForm] = useState({});
  const [buttonReopenLoading, setButtonReopenLoading] = useState({});
  const [filterSectors, setFilterSectors] = useState([]);
  const [filtersCategories, setFiltersCategories] = useState([]);

  // Group data by status
  const pendingTickets = dataChamados.filter(ticket => ticket.status === 'pending');
  const analysisTickets = dataChamados.filter(ticket => ticket.status === 'analysis');
  const validationTickets = dataChamados.filter(ticket => ticket.status === 'validation');
  const reopenedTickets = dataChamados.filter(ticket => ticket.status === 'reopened');
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
    } else if (status === 'validation') {
      return <Badge status="warning" text={<Text strong style={{ color: '#faad14' }}>Validação</Text>} />;
    } else if (status === 'reopened') {
      return <Badge status="processing" text={<Text strong style={{ color: '#722ed1' }}>Reaberto</Text>} />;
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

  const toggleReopenForm = (recordId) => {
    setReopenForm({
      ...reopenForm,
      [recordId]: !reopenForm[recordId]
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
    handleAnswerClick(recordId, values.resposta, values.classificacao);

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

  const handleReopenSubmit = (recordId, values) => {
    setButtonReopenLoading({
      ...buttonReopenLoading,
      [recordId]: true
    });

    // Call the reopenTicket function with the motivoReabertura
    reopenTicket(recordId, values.motivoReabertura);

    // Reset the form state after submission is complete
    setTimeout(() => {
      setReopenForm({
        ...reopenForm,
        [recordId]: false
      });

      setButtonReopenLoading({
        ...buttonReopenLoading,
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

  const optionsClassificacao = {
    "Alteração de Cardápio": [
      { value: 'Criação de produto', label: 'Criação de produto' },
      { value: 'Inclusão de produto', label: 'Inclusão de produto' },
      { value: 'Associar cardápio a operador', label: 'Associar cardápio a operador' },
      { value: 'Alteração de valor', label: 'Alteração de valor' },
      { value: 'Associar produto a bar', label: 'Associar produto a bar' },
    ],
    "Substituição de equipamento": [
      { value: 'Perda', label: 'Perda' },
      { value: 'Perda de Bateria', label: 'Perda de Bateria' },
      { value: 'Perda de Chip', label: 'Perda de Chip' },
      { value: 'Display ou Teclado Danificado', label: 'Display ou Teclado Danificado' },
      { value: 'Tamper', label: 'Tamper' },
      { value: 'Tampa Traseira', label: 'Tampa Traseira' },
      { value: 'Impressora', label: 'Impressora' },
    ],
    "Erro de login": [
      { value: 'Cardápio não associado', label: 'Cardápio não associado' },
      { value: 'Senha', label: 'Senha' },
      { value: 'Chave de ativação errada', label: 'Chave de ativação errada' },
      { value: 'Terminal não associado', label: 'Terminal não associado' },
      { value: 'Data da sessão não configurada', label: 'Data da sessão não configurada' },
      { value: 'Operador não ativo', label: 'Operador não ativo' }
    ],
    "Alteração de funcionalidades": [
      { value: 'N/A', label: 'N/A' }
    ],
    "Acesso": [
      { value: 'Criação acesso gerencial', label: 'Criação acesso gerencial' },
      { value: 'Criação operadores', label: 'Criação operadores' },
      { value: 'Alteração nos operadores', label: 'Alteração nos operadores' },
      { value: 'Vincular place ao acesso', label: 'Vincular place ao acesso' },
      { value: 'Alteração de senha', label: 'Alteração de senha' }
    ],
    "Alteração quantidade de terminais": [
      { value: 'Aumento', label: 'Aumento' },
      { value: 'Redução', label: 'Redução' },
    ],
    "Fechamento manual de ambulante": [
      { value: 'Tamper', label: 'Tamper' },
    ],
    "Transação Apartada": [
      { value: 'GetNet', label: 'GetNet' },
      { value: 'Paybird', label: 'Paybird' },
      { value: 'Pagseguro', label: 'Pagseguro' },
      { value: 'SafraPay', label: 'SafraPay' },
      { value: 'MercadoPago', label: 'MercadoPago' },
      { value: 'Pinbank', label: 'Pinbank' },
      { value: 'Rede', label: 'Rede' },
      { value: 'Cielo', label: 'Cielo' }
    ],
    "Envio de Insumos": [
      { value: 'No site', label: 'No site' },
      { value: 'Para o site', label: 'Para o site' },
    ],
    "Análise Relatorial": [
      { value: 'Interpretativo', label: 'Interpretativo' },
    ],
    "Problemas de conexão": [
      { value: 'Chip', label: 'Chip' },
      { value: 'Conexão Wi-Fi', label: 'Conexão Wi-Fi' },
      { value: 'Área sem cobertura', label: 'Área sem cobertura' }
    ],
    "Erro de Impressão": [
      { value: 'Configuração', label: 'Configuração' },
      { value: 'Avaria', label: 'Avaria' }
    ],
    "Erro de leitura na TAG": [
      { value: 'Tag avariada', label: 'Tag avariada' },
      { value: 'Tag não cadastrada', label: 'Tag não cadastrada' },
      { value: 'Incompatibilidade', label: 'Incompatibilidade' }
    ],
    "Cobrança indevida": [
      { value: 'Valor incorreto', label: 'Valor incorreto' },
      { value: 'Duplicidade na cobrança', label: 'Duplicidade na cobrança' },
      { value: 'Integração', label: 'Integração' }
    ],
    "Ponto de venda": [
      { value: 'Criação ponto de venda', label: 'Criação ponto de venda' },
      { value: 'Alteração ponto de venda', label: 'Alteração ponto de venda' },
      { value: 'Vinculação de operadores', label: 'Vinculação de operadores' }
    ],
    "Duplicação de Saldo": [
      { value: 'Bug', label: 'Bug' },
    ],
    "Entradas": [
      { value: 'Criação de entrada', label: 'Criação de entrada' },
      { value: 'Alteração de valor', label: 'Alteração de valor' },
      { value: 'Criação de setor', label: 'Criação de setor' }
    ],
    "Registro de check in": [
      { value: 'Técnico não associado ao projeto', label: 'Técnico não associado ao projeto' },
      { value: 'Técnico sem cadastro', label: 'Técnico sem cadastro' },
      { value: 'Pendência na aprovação de cadastro', label: 'Pendência na aprovação de cadastro' },
      { value: 'Pendência na abertura do check in', label: 'Pendência na abertura do check in' },
      { value: 'Erro operacional', label: 'Erro operacional' }
    ],
    "Estorno adquirência": [
      { value: 'Data divergente', label: 'Data divergente' },
      { value: 'Bug', label: 'Bug' }
    ],
    "Erro mensagem adquirência": [
      { value: 'Contrato com CPF', label: 'Contrato com CPF' },
      { value: 'Queda de EC', label: 'Queda de EC' }
    ],
    "Estoque Z": [
      { value: 'Criação', label: 'Criação' },
      { value: 'Cadastro base', label: 'Cadastro base' },
      { value: 'Quantidade', label: 'Quantidade' }
    ],
    "Falha de Sincronia": [
      { value: 'Conexão', label: 'Conexão' },
      { value: 'Bug', label: 'Bug' }
    ],
    "Fechamento de comanda Pós Paga": [
      { value: 'Erro operacional', label: 'Erro operacional' }
    ],
    "Impressora remota": [
      { value: 'IP', label: 'IP' },
      { value: 'Seleção de bar', label: 'Seleção de bar' },
      { value: 'Redes diferentes', label: 'Redes diferentes' }
    ],
    "Limite não integrado": [
      { value: 'Criação', label: 'Criação' },
      { value: 'Alteração', label: 'Alteração' },
      { value: 'Permissão gerencial', label: 'Permissão gerencial' }
    ],
    "Logo de Ficha": [
      { value: 'Criação', label: 'Criação' },
      { value: 'Alteração', label: 'Alteração' },
      { value: 'Exclusão', label: 'Exclusão' },
    ],
    "Múltiplos pagamentos": [
      { value: 'N/A', label: 'N/A' }
    ],
    "Produtos de Devolução": [
      { value: 'N/A', label: 'N/A' }
    ],
    "Protocolo de equipamentos": [
      { value: 'Erro operacional', label: 'Erro operacional' },
      { value: 'Múltiplas assinaturas', label: 'Múltiplas assinaturas' },
      { value: 'Sincronia das informações', label: 'Sincronia das informações' },
    ],
    "Pix não funcionando": [
      { value: 'N/A', label: 'N/A' }
    ],
    "Transferência de saldo": [
      { value: 'N/A', label: 'N/A' }
    ],
    "Recargas expiradas": [
      { value: 'N/A', label: 'N/A' }
    ],
    "ZigTag Cheio": [
      { value: 'N/A', label: 'N/A' }
    ],
    "Queima de Ficha": [
      { value: 'N/A', label: 'N/A' }
    ],
    "Dúvida de processo ou produto": [
      { value: 'N/A', label: 'N/A' }
    ]
  }

  const columns = [
    {
      title: 'Solicitante',
      dataIndex: 'solicitante',
      key: 'solicitante',
      width: '150px',
      render: (solicitante) => (
        <div style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Tooltip title={solicitante}>
            {solicitante}
          </Tooltip>
        </div>
      )
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
      filters: filtersCategories,
      onFilter: (value, record) => record.categoria.includes(value),
    },
    {
      title: 'Setor',
      dataIndex: 'setor',
      key: 'setor',
      width: '15%',
      filters: filterSectors,
      onFilter: (value, record) => record.setor.includes(value),
      render: (setor) => (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Tooltip title={setor}>
            {setor || 'N/A'}
          </Tooltip>
        </div>
      )
    },
    {
      title: 'Nível de urgência',
      dataIndex: 'urgencia',
      key: 'urgencia',
      width: '15%',
      render: (urgencia) => getUrgencyTag(urgencia)
    },
    {
      title: 'Atendente',
      dataIndex: 'atendente',
      key: 'atendente',
      render: (atendente) => (
        <div style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Tooltip title={atendente === null ? 'Não atribuído' : atendente}>
            {atendente === null ? 'Não atribuído' : atendente}
          </Tooltip>
        </div>
      )
    },
  ];

  const expandedRowRender = (record) => (
    <Card bordered={false} style={{ background: '#f5f5f5' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Space direction="vertical">
            <div style={{ maxWidth: '400px', wordBreak: 'anywhere', }}>
              <Text strong>Descrição:</Text> {record.descricao}
            </div>

            {record.status === 'analysis' && record.timestampAnalise && (
              <div>
                <Text strong>Em análise desde:</Text> {new Date(record.timestampAnalise).toLocaleString()}
              </div>
            )}

            {record.status === 'reopened' && record.timestampReaberto && (
              <div>
                <Text strong>Reaberto em:</Text> {new Date(record.timestampReaberto).toLocaleString()}
                {record.motivoReabertura && (
                  <div>
                    <Text strong>Motivo da reabertura:</Text> {record.motivoReabertura}
                  </div>
                )}
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
      <Row style={{ marginTop: 64 }} gutter={16}>
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
              onClick={() => changeStatus(record.id, 'validation')}
            >
              Enviar para Validação
            </Button>
          )}
          {record.status === 'reopened' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc') && (
            <Button
              type="primary"
              size="small"
              onClick={() => changeStatus(record.id)}
            >
              Iniciar Análise
            </Button>
          )}
          {(record.status === 'validation' || record.status === 'analysis' || record.status === 'reopened') && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc') && (
            <Button
              type="primary"
              size="small"
              onClick={() => toggleAnswerForm(record.id)}
            >
              Responder
            </Button>
          )}
          {record.status === 'closed' && (currentUser === record.solicitante || permission === 'admin') && (
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => toggleReopenForm(record.id)}
            >
              Reabrir Chamado
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
      
      {/* Answer form inside expanded row */}
      <Row style={{ marginTop: 16, width: '100%' }} gutter={16}>
        {(record.status === 'analysis' || record.status === 'validation' || record.status === 'reopened') && answerForms[record.id] && (
          <Card
            title="Responder Chamado"
            style={{ marginTop: 20, borderRadius: '8px', width: '100%' }}
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
              <Form.Item
                label={<Text strong>Classificação ECC</Text>}
                name='classificacao'
                rules={[{ required: true, message: 'Campo obrigatório' }]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Selecione a(s) classificação(ões) do chamado"
                  options={optionsClassificacao[record.categoria]}
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
        
        {/* Reopen form inside expanded row */}
        {record.status === 'closed' && reopenForm[record.id] && (
          <Card
            title="Reabrir Chamado"
            style={{ marginTop: 20, borderRadius: '8px', width: '100%' }}
          >
            <Form
              layout='vertical'
              onFinish={(values) => handleReopenSubmit(record.id, values)}
            >
              <Form.Item
                label={<Text strong>Motivo da Reabertura</Text>}
                name='motivoReabertura'
                rules={[{ required: true, message: 'Por favor, informe o motivo da reabertura' }]}
              >
                <TextArea
                  placeholder='Descreva o motivo para reabrir este chamado'
                  rows={4}
                  style={{ borderRadius: '4px' }}
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button
                    loading={buttonReopenLoading[record.id]}
                    htmlType='submit'
                    type="primary"
                    danger
                    style={{ borderRadius: '4px' }}
                  >
                    Confirmar Reabertura
                  </Button>
                  <Button
                    onClick={() => toggleReopenForm(record.id)}
                    style={{ borderRadius: '4px' }}
                  >
                    Cancelar
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}
      </Row>
    </Card>
  );

  const renderTableSection = (title, data, statusKey, icon) => {
    const isOpen = openPanels.includes(statusKey);

    return (
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={isOpen ? <UpOutlined /> : <DownOutlined />}
              onClick={() => togglePanel(statusKey)}
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
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    );
  };

  useEffect(() => {
    let filterSectors = dataChamados.map(ticket => {
      return {
        value: ticket.setor,
        label: ticket.setor,
      }
    });

    filterSectors = [...new Set(filterSectors.map(item => item.value))].map(value => {
      return {
        value: value,
        text: value,
      }
    });

    let filtersCategories = dataChamados.map(ticket => {
      return {
        value: ticket.categoria,
        label: ticket.categoria,
      }
    });

    filtersCategories = [...new Set(filtersCategories.map(item => item.value))].map(value => {
      return {
        value: value,
        text: value,
      }
    });

    setFiltersCategories(filtersCategories);
    setFilterSectors(filterSectors);
  }, [dataChamados]);

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
        'Chamados Reabertos',
        reopenedTickets,
        'reopened',
        <SyncOutlined style={{ color: '#722ed1' }} />
      )}

      {renderTableSection(
        'Chamados em Andamento',
        analysisTickets,
        'analysis',
        <SyncOutlined style={{ color: '#1890ff' }} />
      )}

      {renderTableSection(
        'Chamados em Validação',
        validationTickets,
        'validation',
        <QuestionCircleOutlined style={{ color: '#faad14' }} />
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