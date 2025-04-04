import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Badge, Button, Space, Tag, Form, Input, Tooltip, Col, Row, Select } from 'antd';
import { DownOutlined, UpOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CommentOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TaskBoard = ({ dataChamados, fetchChamados, handleAnswerClick, changeStatus, reopenTicket, handleCreateChatForTicket }) => {
  const [openPanels, setOpenPanels] = useState(['pending', 'analysis', 'validation', 'reopened']);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [answerForms, setAnswerForms] = useState({});
  const [buttonAnswerLoading, setButtonAnswerLoading] = useState({});
  const [reopenForm, setReopenForm] = useState({});
  const [buttonReopenLoading, setButtonReopenLoading] = useState({});
  const [filterSectors, setFilterSectors] = useState([]);
  const [filtersCategories, setFiltersCategories] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState(
    JSON.parse(localStorage.getItem('taskboardFilters')) || {}
  );
  const [cannedResponses, setCannedResponses] = useState('');

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

  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    localStorage.setItem('taskboardFilters', JSON.stringify(filters));
  };

  const handleCannedResponsesChange = (value) => {
    setCannedResponses(value);
  };

  const clearAllFilters = () => {
    setFilteredInfo({});
    localStorage.removeItem('taskboardFilters');
  };

  const optionsClassificacao = {
    "Alteração de Cardápio": [
      { value: 'Criação de produto', label: 'Criação de produto' },
      { value: 'Inclusão de produto', label: 'Inclusão de produto' },
      { value: 'Associar cardápio a operador', label: 'Associar cardápio a operador' },
      { value: 'Alteração de valor', label: 'Alteração de valor' },
      { value: 'Associar produto a bar', label: 'Associar produto a bar' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Substituição de equipamento": [
      { value: 'Perda', label: 'Perda' },
      { value: 'Perda de Bateria', label: 'Perda de Bateria' },
      { value: 'Perda de Chip', label: 'Perda de Chip' },
      { value: 'Display ou Teclado Danificado', label: 'Display ou Teclado Danificado' },
      { value: 'Tamper', label: 'Tamper' },
      { value: 'Tampa Traseira', label: 'Tampa Traseira' },
      { value: 'Impressora', label: 'Impressora' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Erro de login": [
      { value: 'Cardápio não associado', label: 'Cardápio não associado' },
      { value: 'Senha', label: 'Senha' },
      { value: 'Chave de ativação errada', label: 'Chave de ativação errada' },
      { value: 'Terminal não associado', label: 'Terminal não associado' },
      { value: 'Data da sessão não configurada', label: 'Data da sessão não configurada' },
      { value: 'Operador não ativo', label: 'Operador não ativo' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Alteração de funcionalidades": [
      { value: 'Alteração de funcionalidades', label: 'Alteração de funcionalidades' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Acesso": [
      { value: 'Criação acesso gerencial', label: 'Criação acesso gerencial' },
      { value: 'Criação operadores', label: 'Criação operadores' },
      { value: 'Alteração nos operadores', label: 'Alteração nos operadores' },
      { value: 'Vincular place ao acesso', label: 'Vincular place ao acesso' },
      { value: 'Alteração de senha', label: 'Alteração de senha' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Alteração quantidade de terminais": [
      { value: 'Aumento na quantidade de terminais', label: 'Aumento na quantidade de terminais' },
      { value: 'Redução na quantidade de terminais', label: 'Redução na quantidade de terminais' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Fechamento manual de ambulante": [
      { value: 'Tamper', label: 'Tamper' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Transação Apartada": [
      // { value: 'GetNet', label: 'GetNet' },
      // { value: 'Paybird', label: 'Paybird' },
      // { value: 'Pagseguro', label: 'Pagseguro' },
      // { value: 'SafraPay', label: 'SafraPay' },
      // { value: 'MercadoPago', label: 'MercadoPago' },
      // { value: 'Pinbank', label: 'Pinbank' },
      // { value: 'Rede', label: 'Rede' },
      { value: 'Cielo', label: 'Cielo' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Envio de Insumos": [
      // { value: 'No site', label: 'No site' },
      { value: 'Capa/Suporte', label: 'Capa/Suporte' },
      { value: 'Bobina', label: 'Bobina' },
      { value: 'Gerentes de Senha', label: 'Gerentes de Senha' },
      { value: 'Cartões Cashless', label: 'Cartões Cashless' },
      { value: 'Pirulito/Costeira', label: 'Pirulito/Costeira' },
      { value: 'Bateria', label: 'Bateria' },
      { value: 'Filtro de Linha', label: 'Filtro de Linha' },
      { value: 'Capa de Chuva', label: 'Capa de Chuva' },
      { value: 'Powerbank', label: 'Powerbank' },
      { value: 'Papel Filme', label: 'Papel Filme' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Análise Relatorial": [
      { value: 'Análise Relatorial', label: 'Análise Relatorial' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Problemas de conexão com internet": [
      { value: 'Chip', label: 'Chip' },
      { value: 'Conexão Wi-Fi', label: 'Conexão Wi-Fi' },
      { value: 'Área sem cobertura', label: 'Área sem cobertura' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Erro de Impressão": [
      { value: 'Configuração', label: 'Configuração' },
      { value: 'Avaria', label: 'Avaria' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Erro de leitura na TAG": [
      { value: 'Tag avariada', label: 'Tag avariada' },
      { value: 'Tag não cadastrada', label: 'Tag não cadastrada' },
      { value: 'Incompatibilidade', label: 'Incompatibilidade' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Cobrança indevida": [
      { value: 'Valor incorreto', label: 'Valor incorreto' },
      { value: 'Duplicidade na cobrança', label: 'Duplicidade na cobrança' },
      { value: 'Integração', label: 'Integração' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Ponto de venda": [
      { value: 'Criação ponto de venda', label: 'Criação ponto de venda' },
      { value: 'Alteração ponto de venda', label: 'Alteração ponto de venda' },
      { value: 'Vinculação de operadores', label: 'Vinculação de operadores' },
      { value: 'Desativar ponto de venda', label: 'Desativar ponto de venda' },
      { value: 'Desativar operador', label: 'Desativar operador' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Duplicação de Saldo": [
      { value: 'Bug', label: 'Bug' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Entradas": [
      { value: 'Criação de entrada', label: 'Criação de entrada' },
      { value: 'Alteração de valor', label: 'Alteração de valor' },
      { value: 'Criação de setor', label: 'Criação de setor' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Registro de check in": [
      { value: 'Técnico não associado ao projeto', label: 'Técnico não associado ao projeto' },
      { value: 'Técnico sem cadastro', label: 'Técnico sem cadastro' },
      { value: 'Pendência na aprovação de cadastro', label: 'Pendência na aprovação de cadastro' },
      { value: 'Pendência na abertura do check in', label: 'Pendência na abertura do check in' },
      { value: 'Erro operacional', label: 'Erro operacional' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Estorno adquirência": [
      { value: 'Senha de estorno', label: 'Senha de estorno' },
      { value: 'Data divergente', label: 'Data divergente' },
      { value: 'Bug', label: 'Bug' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Erro mensagem adquirência": [
      { value: 'Contrato com CPF', label: 'Contrato com CPF' },
      { value: 'Queda de EC', label: 'Queda de EC' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Estoque Z": [
      { value: 'Criação', label: 'Criação' },
      { value: 'Cadastro base', label: 'Cadastro base' },
      { value: 'Quantidade', label: 'Quantidade' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Falha de Sincronia": [
      { value: 'Conexão', label: 'Conexão' },
      { value: 'Bug', label: 'Bug' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Fechamento de comanda Pós Paga": [
      { value: 'Erro operacional', label: 'Erro operacional' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Impressora remota": [
      { value: 'IP', label: 'IP' },
      { value: 'Seleção de bar', label: 'Seleção de bar' },
      { value: 'Redes diferentes', label: 'Redes diferentes' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Limite não integrado": [
      { value: 'Criação', label: 'Criação' },
      { value: 'Alteração', label: 'Alteração' },
      { value: 'Permissão gerencial', label: 'Permissão gerencial' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Logo de Ficha": [
      { value: 'Criação', label: 'Criação' },
      { value: 'Alteração', label: 'Alteração' },
      { value: 'Exclusão', label: 'Exclusão' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Múltiplos pagamentos": [
      { value: 'Múltiplos pagamentos', label: 'Múltiplos pagamentos' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Produtos de Devolução": [
      { value: 'Configuração', label: 'Configuração' },
      { value: 'Tag', label: 'Tag' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Protocolo de equipamentos": [
      { value: 'Erro operacional', label: 'Erro operacional' },
      { value: 'Múltiplas assinaturas', label: 'Múltiplas assinaturas' },
      { value: 'Sincronia das informações', label: 'Sincronia das informações' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Pix não funcionando": [
      { value: 'Configuração', label: 'Configuração' },
      { value: 'Internet', label: 'Internet' },
      { value: 'Conta', label: 'Conta' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Transferência de saldo": [
      { value: 'Tag Diferente', label: 'Tag Diferente' },
      { value: 'Transação apartada', label: 'Transação apartada' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Recargas expiradas": [
      { value: 'Período', label: 'Período' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "ZigTag Cheio": [
      { value: 'Recarga', label: 'Recarga' },
      { value: 'Consumo', label: 'Consumo' },
      { value: 'Memória', label: 'Memória' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Queima de Ficha": [
      { value: 'Configuração do bar', label: 'Configuração do bar' },
      { value: 'Internet', label: 'Internet' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Dúvida de processo ou produto": [
      { value: 'Dúvida de processo ou produto', label: 'Dúvida de processo ou produto' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
    ],
    "Cartão de senhas": [
      { value: 'Criação de cartão de senha', label: 'Criação de cartão de senhas' },
      { value: 'Report aberto ao time de Tech', label: 'Report aberto ao time de Tech' },
      { value: 'Improcedente', label: 'Improcedente' }
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
      filteredValue: filteredInfo.categoria || null,
      onFilter: (value, record) => record.categoria.includes(value),
    },
    {
      title: 'Setor',
      dataIndex: 'setor',
      key: 'setor',
      width: '15%',
      filters: filterSectors,
      filteredValue: filteredInfo.setor || null,
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
            <div>
              <Text strong>ID:</Text> {record.id}
            </div>

            <div>
              <Text strong>Versão Cielo Mobile:</Text> {record.versao}
            </div>

            <div style={{ maxWidth: '400px', wordBreak: 'anywhere', }}>
              <Text strong>Descrição:</Text> {record.descricao}
            </div>

            {record.anexos && record.anexos.length > 0 && (
              <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                <Text strong>Anexos:</Text>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {record.anexos.map((anexo, index) => (
                    <li key={index}>
                      <a href={anexo} target="_blank" rel="noopener noreferrer">
                        <img loading='lazy' src={anexo} style={{ width: '90%', height: 'auto' }} alt={`Anexo ${index + 1}`} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
          {record.status === 'pending' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
            <Button type="primary" size="small" onClick={() => changeStatus(record.id)}>
              Abrir Ticket
            </Button>
          )}
          {record.status === 'analysis' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
            <Button
              type="primary"
              size="small"
              onClick={() => changeStatus(record.id, 'validation')}
            >
              Enviar para Validação
            </Button>
          )}
          {record.status === 'reopened' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
            <Button
              type="primary"
              size="small"
              onClick={() => changeStatus(record.id)}
            >
              Iniciar Análise
            </Button>
          )}
          {(record.status === 'validation' || record.status === 'analysis' || record.status === 'reopened') && (permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
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
          {record.status !== 'closed' && (currentUser === record.solicitante || permission === 'admin' || permissionEvento === 'C-CCO' || permission == 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
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

      <Row style={{ marginTop: 16, width: '100%' }} gutter={16}>
        {(record.status === 'analysis' || record.status === 'validation' || record.status === 'reopened') && answerForms[record.id] && (
          <Card
            title="Responder Chamado"
            style={{ marginTop: 20, borderRadius: '8px', width: '100%' }}
          >
            <Select 
              style={{ width: '100%', marginBottom: 16 }}
              placeholder={'Respostas prontas'}
              options={[
                { value: 'Feito', label: 'Feito' },
                { value: 'Feito. Gentiliza atualizar cardápios.', label: 'Feito. Gentiliza atualizar cardápios.' },
                { value: 'Feito. Gentilizar reautenticar terminal.'}
              ]}
              onChange={handleCannedResponsesChange}
            />
            <Form
              layout='vertical'
              onFinish={(values) => handleSubmitAnswer(record.id, values)}
            >
              <Form.Item
                label={<Text strong>Resposta</Text>}
                name='resposta'
                rules={[{ required: false, message: 'Campo obrigatório' }]}
              >
                <TextArea
                  placeholder={cannedResponses}
                  rows={4}
                  value={cannedResponses}
                  
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
          onChange={handleTableChange}
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
        {/* <Button type="primary" onClick={fetchChamados}>
          Atualizar
        </Button> */}

        <Button type='primary' onClick={clearAllFilters} style={{ marginLeft: '10px' }}>Limpar Filtros</Button>
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