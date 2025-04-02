import React, { useState } from 'react';
import { Card, Typography, Badge, Button, Space, Tag, Form, Input, Tooltip, Col, Row, Select, Empty } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SyncOutlined, 
  CommentOutlined, 
  QuestionCircleOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const KanbanBoard = ({ 
  dataChamados, 
  fetchChamados, 
  handleAnswerClick, 
  changeStatus, 
  reopenTicket, 
  handleCreateChatForTicket 
}) => {
  const [answerForms, setAnswerForms] = useState({});
  const [buttonAnswerLoading, setButtonAnswerLoading] = useState({});
  const [reopenForm, setReopenForm] = useState({});
  const [buttonReopenLoading, setButtonReopenLoading] = useState({});
  const [expandedCards, setExpandedCards] = useState([]);

  const pendingTickets = dataChamados.filter(ticket => ticket.status === 'pending');
  const analysisTickets = dataChamados.filter(ticket => ticket.status === 'analysis');
  const validationTickets = dataChamados.filter(ticket => ticket.status === 'validation');
  const reopenedTickets = dataChamados.filter(ticket => ticket.status === 'reopened');
  const closedTickets = dataChamados.filter(ticket => ticket.status === 'closed');

  const currentUser = localStorage.getItem('currentUser');
  const permission = localStorage.getItem('permission');
  const permissionEvento = localStorage.getItem('permissionEvento');

  const toggleAnswerForm = (recordId) => {
    setAnswerForms({
      ...answerForms,
      [recordId]: !answerForms[recordId]
    });
  };

  const toggleReopenForm = (recordId) => {
    setReopenForm({
      ...reopenForm,
      [recordId]: !reopenForm[recordId]
    });
  };

  const toggleExpandCard = (recordId) => {
    setExpandedCards(prevExpanded => 
      prevExpanded.includes(recordId)
        ? prevExpanded.filter(id => id !== recordId)
        : [...prevExpanded, recordId]
    );
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

  // Render individual ticket card
  const renderTicketCard = (ticket) => {
    const isExpanded = expandedCards.includes(ticket.id);
    const cardStyle = {
      marginBottom: '10px',
      borderLeft: ticket.urgencia === 'Urgente' ? '3px solid #ff4d4f' : '1px solid #f0f0f0',
      cursor: 'pointer',
      transition: 'all 0.3s'
    };
    
    const cardClassName = `kanban-card ${ticket.urgencia === 'Urgente' ? 'urgent-kanban-card' : ''}`;

    return (
      <Card 
        key={ticket.id}
        size="small"
        style={cardStyle}
        className={cardClassName}
        onClick={() => toggleExpandCard(ticket.id)}
      >
        <div style={{ padding: '0px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <Text strong style={{ fontSize: '14px' }}>{ticket.ponto}</Text>
            {getUrgencyTag(ticket.urgencia)}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <Text style={{ fontSize: '13px' }}>
              <Tooltip title={ticket.solicitante}>
                <span>{ticket.solicitante}</span>
              </Tooltip>
            </Text>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {new Date(ticket.timestampAberto).toLocaleString()}
            </Text>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <Tag color="blue">
              {ticket.categoria}
            </Tag>
          </div>
          
          {!isExpanded && (
            <div style={{ 
              width: '100%', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              marginBottom: '8px'
            }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {ticket.descricao}
              </Text>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="kanban-card-expanded" style={{ marginTop: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
            <div className="kanban-card-content expanded" style={{ background: '#f7f7f7', padding: '12px', borderRadius: '4px', marginBottom: '12px' }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ maxWidth: '100%', wordBreak: 'break-word' }}>
                      <Text strong>Descrição:</Text> {ticket.descricao}
                    </div>

                    {ticket.anexos && ticket.anexos.length > 0 && (
                      <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                        <Text strong>Anexos:</Text>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                          {ticket.anexos.map((anexo, index) => (
                            <li key={index}>
                              <a href={anexo} target="_blank" rel="noopener noreferrer">
                                <img loading='lazy' src={anexo} style={{ width: '90%', height: 'auto' }} alt={`Anexo ${index + 1}`} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ticket.status === 'analysis' && ticket.timestampAnalise && (
                      <div>
                        <Text strong>Em análise desde:</Text> {new Date(ticket.timestampAnalise).toLocaleString()}
                      </div>
                    )}

                    {ticket.status === 'reopened' && ticket.timestampReaberto && (
                      <div>
                        <Text strong>Reaberto em:</Text> {new Date(ticket.timestampReaberto).toLocaleString()}
                        {ticket.motivoReabertura && (
                          <div>
                            <Text strong>Motivo da reabertura:</Text> {ticket.motivoReabertura}
                          </div>
                        )}
                      </div>
                    )}

                    {ticket.status === 'closed' && ticket.resposta && (
                      <>
                        <div>
                          <Text strong>Atendente:</Text> {ticket.atendente}
                        </div>
                        <div>
                          <Text strong>Resposta:</Text> {ticket.resposta}
                        </div>
                        <div>
                          <Text strong>Fechado em:</Text> {new Date(ticket.timestampResposta).toLocaleString()}
                        </div>
                      </>
                    )}

                    {ticket.setor && (
                      <div>
                        <Text strong>Setor:</Text> {ticket.setor}
                      </div>
                    )}

                    {ticket.ponto && (
                      <div>
                        <Text strong>PDV:</Text> {ticket.ponto}
                      </div>
                    )}

                    {ticket.modelo && (
                      <div>
                        <Text strong>Modelo do Terminal:</Text> {ticket.modelo}
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
            </div>

            <Space style={{ marginBottom: '12px' }}>
              {ticket.status === 'pending' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission === 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
                <Button type="primary" size="small" onClick={(e) => { e.stopPropagation(); changeStatus(ticket.id); }}>
                  Abrir Ticket
                </Button>
              )}
              {ticket.status === 'analysis' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission === 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
                <Button
                  type="primary"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); changeStatus(ticket.id, 'validation'); }}
                >
                  Enviar para Validação
                </Button>
              )}
              {ticket.status === 'reopened' && (permission === 'admin' || permissionEvento === 'C-CCO' || permission === 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
                <Button
                  type="primary"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); changeStatus(ticket.id); }}
                >
                  Iniciar Análise
                </Button>
              )}
              {(ticket.status === 'validation' || ticket.status === 'analysis' || ticket.status === 'reopened') && (permission === 'admin' || permissionEvento === 'C-CCO' || permission === 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
                <Button
                  type="primary"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); toggleAnswerForm(ticket.id); }}
                >
                  Responder
                </Button>
              )}
              {ticket.status === 'closed' && (currentUser === ticket.solicitante || permission === 'admin') && (
                <Button
                  type="primary"
                  danger
                  size="small"
                  onClick={(e) => { e.stopPropagation(); toggleReopenForm(ticket.id); }}
                >
                  Reabrir Chamado
                </Button>
              )}
              {ticket.status !== 'closed' && (currentUser === ticket.solicitante || permission === 'admin' || permissionEvento === 'C-CCO' || permission === 'ecc' || permission == 'planner' || permissionEvento === 'Controle Supervisores') && (
                <Button
                  type="default"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleCreateChatForTicket(ticket.id); }}
                >
                  <CommentOutlined />Chat
                </Button>
              )}
            </Space>

            {(ticket.status === 'analysis' || ticket.status === 'validation' || ticket.status === 'reopened') && answerForms[ticket.id] && (
              <Card
                title="Responder Chamado"
                style={{ marginTop: 20, borderRadius: '8px', width: '100%' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Form
                  layout='vertical'
                  onFinish={(values) => handleSubmitAnswer(ticket.id, values)}
                >
                  <Form.Item
                    label={<Text strong>Resposta</Text>}
                    name='resposta'
                    rules={[{ required: false, message: 'Campo obrigatório' }]}
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
                      options={optionsClassificacao[ticket.categoria]}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button
                        loading={buttonAnswerLoading[ticket.id]}
                        htmlType='submit'
                        type="primary"
                        style={{ borderRadius: '4px' }}
                      >
                        Enviar Resposta
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); toggleAnswerForm(ticket.id); }}
                        style={{ borderRadius: '4px' }}
                      >
                        Cancelar
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            )}
            
            {ticket.status === 'closed' && reopenForm[ticket.id] && (
              <Card
                title="Reabrir Chamado"
                style={{ marginTop: 20, borderRadius: '8px', width: '100%' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Form
                  layout='vertical'
                  onFinish={(values) => handleReopenSubmit(ticket.id, values)}
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
                        loading={buttonReopenLoading[ticket.id]}
                        htmlType='submit'
                        type="primary"
                        danger
                        style={{ borderRadius: '4px' }}
                      >
                        Confirmar Reabertura
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); toggleReopenForm(ticket.id); }}
                        style={{ borderRadius: '4px' }}
                      >
                        Cancelar
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            )}
          </div>
        )}
      </Card>
    );
  };

  // Render Kanban column
  const renderColumn = (title, tickets, icon, color) => {
    return (
      <div className="kanban-column" style={{ minWidth: '300px', width: '300px', flexShrink: 0, marginRight: '16px' }}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }} className="kanban-column-header">
              {icon}
              <Text strong style={{ marginLeft: 8, color }}>
                {title} ({tickets.length})
              </Text>
            </div>
          }
          bodyStyle={{ 
            padding: '8px', 
            height: 'calc(100vh - 245px)', 
            overflowY: 'auto' 
          }}
          style={{ 
            height: '100%',
            backgroundColor: '#fafafa',
          }}
          headStyle={{ backgroundColor: '#f0f0f0' }}
        >
          {tickets.length > 0 ? (
            tickets.map(ticket => renderTicketCard(ticket))
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum chamado" />
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="kanban-container" style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        padding: '0 12px',
        minWidth: '100%'
      }}>
        {renderColumn('Abertos', pendingTickets, <ClockCircleOutlined style={{ color: '#ff4d4f' }} />, '#ff4d4f')}
        {renderColumn('Reabertos', reopenedTickets, <SyncOutlined style={{ color: '#722ed1' }} />, '#722ed1')}
        {renderColumn('Em Andamento', analysisTickets, <SyncOutlined style={{ color: '#1890ff' }} />, '#1890ff')}
        {renderColumn('Em Validação', validationTickets, <QuestionCircleOutlined style={{ color: '#faad14' }} />, '#faad14')}
        {renderColumn('Fechados', closedTickets, <CheckCircleOutlined style={{ color: '#52c41a' }} />, '#52c41a')}
      </div>
    </div>
  );
};

export default KanbanBoard;