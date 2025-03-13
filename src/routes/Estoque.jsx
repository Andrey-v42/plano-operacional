import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, DatePicker, Select, Typography, Table, Tag, Input, Button, Form, Space, notification, Badge, Tabs, Modal, Timeline, Divider, Pagination } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusOutlined, ReloadOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SmileOutlined, HistoryOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { TabPane } = Tabs;

const GestaoInventario = () => {
  // Estado para as abas
  const [activeTab, setActiveTab] = useState('1');
  
  // Estados para o Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [historyPageSize] = useState(5);

  // =================== ATIVOS ===================
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [modeloFilter, setModeloFilter] = useState('all');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('all');
  
  // Compartilhado
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    fetchAssets();
  }, []);

  // =================== FUNÇÕES DE ATIVOS ===================
  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      // Mock API call
      const response = await new Promise(resolve => setTimeout(() => {
        resolve({
          data: [
            { 
              id: 1, 
              modelo: 'Gertec MP35', 
              categoria: 'POS', 
              rfid: 'RF7890123',
              serialMaquina: 'GT2023001', 
              serialN: 'SN12345678',
              deviceZ: 'DZ-001',
              situacao: 'Apto',
              detalhamento: 'Em perfeito estado',
              alocacao: 'Arena XYZ',
              // Histórico fictício para o modal
              historico: [
                { 
                  data: '2025-02-18 11:30', 
                  destino: 'Evento', 
                  nomeDestino: 'Festival de Música',
                  os: '11111',
                  motivo: 'Evento especial', 
                  local: 'Estádio Municipal', 
                  responsavel: 'Luiz Siqueira' 
                },
                { 
                  data: '2025-01-05 09:45', 
                  destino: 'Casa', 
                  nomeDestino: 'Manutenção Rotina',
                  os: '22222',
                  motivo: 'Verificação preventiva', 
                  local: 'Centro Técnico', 
                  responsavel: 'Técnico Ricardo' 
                },
                { 
                  data: '2024-12-15 14:30', 
                  destino: 'Evento', 
                  nomeDestino: 'Final de Ano',
                  os: '12345',
                  motivo: 'Envio antecipado para venda', 
                  local: 'Arena XYZ', 
                  responsavel: 'Ana Costa' 
                },
                { 
                  data: '2024-10-03 09:15', 
                  destino: 'PagSeguro', 
                  nomeDestino: '',
                  os: '98765',
                  motivo: 'Manutenção na adquirência', 
                  local: 'Centro Técnico', 
                  responsavel: 'Técnico Roberto' 
                },
                { 
                  data: '2024-07-22 16:45', 
                  destino: 'Evento', 
                  nomeDestino: 'Festival de Verão',
                  os: '45678',
                  motivo: 'Evento', 
                  local: 'Parque Municipal', 
                  responsavel: 'Carlos Mendes' 
                },
                { 
                  data: '2024-04-10 10:00', 
                  destino: 'Casa', 
                  nomeDestino: 'Almoxarifado',
                  os: '23456',
                  motivo: 'Aquisição', 
                  local: 'Almoxarifado Central', 
                  responsavel: 'Depto. Compras' 
                },
                { 
                  data: '2024-01-22 13:20', 
                  destino: 'Redecard', 
                  nomeDestino: '',
                  os: '54321',
                  motivo: 'Atualização de software', 
                  local: 'Centro de Distribuição', 
                  responsavel: 'Suporte Técnico' 
                }
              ]
            },
            { 
              id: 2, 
              modelo: 'Ingenico Move 5000', 
              categoria: 'POS', 
              rfid: 'RF1234567',
              serialMaquina: 'IG2023002', 
              serialN: 'SN87654321',
              deviceZ: 'DZ-002',
              situacao: 'Inapto',
              detalhamento: 'Tela quebrada',
              alocacao: 'Em manutenção',
              historico: [
                { 
                  data: '2025-02-01 11:30', 
                  destino: 'Casa', 
                  nomeDestino: 'Manutenção',
                  os: '34567',
                  motivo: 'Manutenção corretiva', 
                  local: 'Loja Central', 
                  responsavel: 'Supervisor José' 
                },
                { 
                  data: '2024-11-20 08:45', 
                  destino: 'Evento', 
                  nomeDestino: 'Black Friday',
                  os: '67890',
                  motivo: 'Evento', 
                  local: 'Shopping Plaza', 
                  responsavel: 'Equipe Vendas' 
                },
                { 
                  data: '2024-08-15 15:20', 
                  destino: 'Getnet', 
                  nomeDestino: '',
                  os: '78901',
                  motivo: 'Manutenção na adquirência', 
                  local: 'Assistência Técnica', 
                  responsavel: 'Técnico Felipe' 
                },
                { 
                  data: '2024-06-05 09:00', 
                  destino: 'Evento', 
                  nomeDestino: 'Feira Gastronômica',
                  os: '89012',
                  motivo: 'Evento', 
                  local: 'Centro de Convenções', 
                  responsavel: 'Mariana Santos' 
                },
                { 
                  data: '2024-03-22 14:15', 
                  destino: 'Casa', 
                  nomeDestino: 'Almoxarifado',
                  os: '90123',
                  motivo: 'Aquisição', 
                  local: 'Almoxarifado Central', 
                  responsavel: 'Depto. Compras' 
                }
              ]
            },
            { 
              id: 3, 
              modelo: 'PAX A920', 
              categoria: 'SmartPOS', 
              rfid: 'RF2468135',
              serialMaquina: 'PX2023003',
              serialN: 'SN11223344',
              deviceZ: 'DZ-003',
              situacao: 'Inapto',
              detalhamento: 'Bateria defeituosa',
              alocacao: 'Em reparo',
              historico: [
                { 
                  data: '2025-02-28 10:20', 
                  destino: 'Casa', 
                  nomeDestino: 'TI',
                  os: '33333',
                  motivo: 'Diagnóstico técnico', 
                  local: 'Laboratório de TI', 
                  responsavel: 'Eng. Sistemas Lucas' 
                },
                { 
                  data: '2025-01-15 10:45', 
                  destino: 'Casa', 
                  nomeDestino: 'Reparo',
                  os: '12378',
                  motivo: 'Manutenção corretiva', 
                  local: 'Evento Corporativo', 
                  responsavel: 'Coord. Paulo' 
                },
                { 
                  data: '2024-12-05 14:30', 
                  destino: 'Evento', 
                  nomeDestino: 'Feira de Natal',
                  os: '23489',
                  motivo: 'Evento', 
                  local: 'Pavilhão Norte', 
                  responsavel: 'Gerente Eventos' 
                },
                { 
                  data: '2024-09-18 09:20', 
                  destino: 'Casa', 
                  nomeDestino: 'TI',
                  os: '34590',
                  motivo: 'Atualização de Software', 
                  local: 'Centro de TI', 
                  responsavel: 'Equipe Suporte' 
                },
                { 
                  data: '2024-05-30 08:00', 
                  destino: 'Evento', 
                  nomeDestino: 'Congresso Nacional',
                  os: '45601',
                  motivo: 'Evento', 
                  local: 'Centro de Convenções', 
                  responsavel: 'Diretor Operações' 
                },
                { 
                  data: '2024-02-10 11:15', 
                  destino: 'Casa', 
                  nomeDestino: 'Almoxarifado',
                  os: '56712',
                  motivo: 'Aquisição', 
                  local: 'Almoxarifado Central', 
                  responsavel: 'Depto. Compras' 
                },
                { 
                  data: '2023-12-20 15:30', 
                  destino: 'Cielo', 
                  nomeDestino: '',
                  os: '67823',
                  motivo: 'Homologação', 
                  local: 'Centro de Certificação', 
                  responsavel: 'Equipe QA' 
                },
                { 
                  data: '2023-11-05 09:00', 
                  destino: 'Casa', 
                  nomeDestino: 'Estoque',
                  os: '78934',
                  motivo: 'Inventário', 
                  local: 'Depósito Central', 
                  responsavel: 'Coord. Logística' 
                }
              ]
            },
            {
              id: 4,
              modelo: 'Verifone V200c',
              categoria: 'POS',
              rfid: 'RF9876543',
              serialMaquina: 'VF2023004',
              serialN: 'SN55667788',
              deviceZ: 'DZ-004',
              situacao: 'Apto',
              detalhamento: 'Em perfeito estado',
              alocacao: 'Hotel Grandioso',
              historico: [
                { 
                  data: '2025-02-10 16:45', 
                  destino: 'Casa', 
                  nomeDestino: 'Manutenção',
                  os: '67823',
                  motivo: 'Verificação de Rotina', 
                  local: 'Centro de Manutenção', 
                  responsavel: 'Técnico Anderson' 
                },
                { 
                  data: '2024-11-25 09:30', 
                  destino: 'Evento', 
                  nomeDestino: 'Corporativo',
                  os: '78934',
                  motivo: 'Evento', 
                  local: 'Hotel Grandioso', 
                  responsavel: 'Coord. Eventos' 
                },
                { 
                  data: '2024-08-03 14:15', 
                  destino: 'Casa', 
                  nomeDestino: 'TI',
                  os: '89045',
                  motivo: 'Atualização de Firmware', 
                  local: 'Centro de TI', 
                  responsavel: 'Equipe Suporte' 
                },
                { 
                  data: '2024-05-12 10:00', 
                  destino: 'Casa', 
                  nomeDestino: 'Almoxarifado',
                  os: '90156',
                  motivo: 'Aquisição', 
                  local: 'Almoxarifado Central', 
                  responsavel: 'Depto. Compras' 
                }
              ]
            },
            {
              id: 5,
              modelo: 'Gertec MP35',
              categoria: 'POS',
              rfid: 'RF5566778',
              serialMaquina: 'GT2023005',
              serialN: 'SN22334455',
              deviceZ: 'DZ-005',
              situacao: 'Apto',
              detalhamento: 'Tamper violado',
              alocacao: 'Centro de Eventos',
              historico: [
                { 
                  data: '2025-03-01 08:15', 
                  destino: 'Evento', 
                  nomeDestino: 'Conferência Anual',
                  os: '44444',
                  motivo: 'Demonstração de produto', 
                  local: 'Centro de Convenções', 
                  responsavel: 'Gerente Marketing' 
                },
                { 
                  data: '2025-02-10 14:30', 
                  destino: 'Casa', 
                  nomeDestino: 'Laboratório',
                  os: '55555',
                  motivo: 'Teste de integração', 
                  local: 'Centro de Testes', 
                  responsavel: 'Analista de QA' 
                },
                { 
                  data: '2025-01-20 08:30', 
                  destino: 'Casa', 
                  nomeDestino: 'Manutenção',
                  os: '10267',
                  motivo: 'Manutenção Preventiva', 
                  local: 'Centro Técnico', 
                  responsavel: 'Técnico Márcio' 
                },
                { 
                  data: '2024-10-15 13:45', 
                  destino: 'Evento', 
                  nomeDestino: 'Congresso',
                  os: '20378',
                  motivo: 'Evento', 
                  local: 'Centro de Eventos', 
                  responsavel: 'Gerente Thiago' 
                },
                { 
                  data: '2024-07-05 09:15', 
                  destino: 'Casa', 
                  nomeDestino: 'Almoxarifado',
                  os: '30489',
                  motivo: 'Aquisição', 
                  local: 'Almoxarifado Central', 
                  responsavel: 'Depto. Compras' 
                },
                { 
                  data: '2024-04-18 11:30', 
                  destino: 'Stone', 
                  nomeDestino: '',
                  os: '40590',
                  motivo: 'Reprogramação', 
                  local: 'Centro de Operações', 
                  responsavel: 'Técnico Especializado' 
                }
              ]
            }
          ]
        });
      }, 1000));
      setAssets(response.data);
      setFilteredAssets(response.data);
    } catch (error) {
      openNotificationFailure('Erro ao carregar ativos');
    }
    setLoadingAssets(false);
  };

  const showAssetHistory = (record) => {
    setCurrentAsset(record);
    setCurrentHistoryPage(1);
    setIsModalVisible(true);
  };
  
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleHistoryPageChange = (page) => {
    setCurrentHistoryPage(page);
  };

  const assetsColumns = [
    {
      title: 'Modelo',
      dataIndex: 'modelo',
      key: 'modelo',
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
    },
    {
      title: 'RFID',
      dataIndex: 'rfid',
      key: 'rfid',
    },
    {
      title: 'Serial Máquina',
      dataIndex: 'serialMaquina',
      key: 'serialMaquina',
    },
    {
      title: 'Serial N',
      dataIndex: 'serialN',
      key: 'serialN',
    },
    {
      title: 'Device Z',
      dataIndex: 'deviceZ',
      key: 'deviceZ',
    },
    {
      title: 'Situação',
      dataIndex: 'situacao',
      key: 'situacao',
      render: (situacao) => {
        let color = 'green';
        if (situacao !== 'Apto') {
          color = 'red';
        }
        return (
          <Tag color={color}>
            {situacao}
          </Tag>
        );
      }
    },
    {
      title: 'Alocação',
      dataIndex: 'alocacao',
      key: 'alocacao',
    },
    {
      title: 'Histórico',
      key: 'historico',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<HistoryOutlined />}
          onClick={() => showAssetHistory(record)}
        >
          Ver Histórico
        </Button>
      ),
    },
  ];

  const calculateAssetMetrics = () => {
    const totalAssets = filteredAssets.length;
    const inaptosAssets = filteredAssets.filter(a => a.situacao === 'Inapto').length;
    const aptosAssets = filteredAssets.filter(a => a.situacao === 'Apto').length;
    
    const modelosCount = {};
    filteredAssets.forEach(asset => {
      modelosCount[asset.modelo] = (modelosCount[asset.modelo] || 0) + 1;
    });

    const modeloMaisComum = Object.keys(modelosCount).length > 0 ? 
      Object.keys(modelosCount).reduce((a, b) => modelosCount[a] > modelosCount[b] ? a : b, '') : 
      'N/A';

    return {
      totalAssets,
      inaptosAssets,
      aptosAssets,
      modeloMaisComum
    };
  };

  const prepareAssetChartData = () => {
    const modeloData = {};
    filteredAssets.forEach(asset => {
      if (!modeloData[asset.modelo]) {
        modeloData[asset.modelo] = {
          total: 0,
          inaptos: 0
        };
      }
      modeloData[asset.modelo].total += 1;
      if (asset.situacao === 'Inapto') {
        modeloData[asset.modelo].inaptos += 1;
      }
    });

    return Object.keys(modeloData).map(modelo => ({
      modelo,
      total: modeloData[modelo].total,
      inaptos: modeloData[modelo].inaptos,
      aptos: modeloData[modelo].total - modeloData[modelo].inaptos
    }));
  };

  const prepareCategoryChartData = () => {
    const categoryData = {};
    filteredAssets.forEach(asset => {
      if (!categoryData[asset.categoria]) {
        categoryData[asset.categoria] = 0;
      }
      categoryData[asset.categoria] += 1;
    });

    return Object.keys(categoryData).map(category => ({
      category,
      value: categoryData[category]
    }));
  };

  const handleAssetSearch = (value) => {
    const filtered = assets.filter(asset => 
      asset.modelo.toLowerCase().includes(value.toLowerCase()) ||
      asset.categoria.toLowerCase().includes(value.toLowerCase()) ||
      asset.serialMaquina.toLowerCase().includes(value.toLowerCase()) ||
      asset.serialN.toLowerCase().includes(value.toLowerCase()) ||
      asset.rfid.toLowerCase().includes(value.toLowerCase()) ||
      asset.deviceZ.toLowerCase().includes(value.toLowerCase()) ||
      asset.alocacao.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAssets(filtered);
  };

  const handleModeloChange = (value) => {
    setModeloFilter(value);
    if (assetCategoryFilter !== 'all') {
      const filtered = value === 'all' 
        ? assets.filter(asset => asset.categoria === assetCategoryFilter)
        : assets.filter(asset => asset.modelo === value && asset.categoria === assetCategoryFilter);
      setFilteredAssets(filtered);
    } else {
      const filtered = value === 'all' 
        ? assets 
        : assets.filter(asset => asset.modelo === value);
      setFilteredAssets(filtered);
    }
  };

  const handleAssetCategoryChange = (value) => {
    setAssetCategoryFilter(value);
    if (modeloFilter !== 'all') {
      const filtered = value === 'all' 
        ? assets.filter(asset => asset.modelo === modeloFilter)
        : assets.filter(asset => asset.categoria === value && asset.modelo === modeloFilter);
      setFilteredAssets(filtered);
    } else {
      const filtered = value === 'all' 
        ? assets 
        : assets.filter(asset => asset.categoria === value);
      setFilteredAssets(filtered);
    }
  };

  // =================== FUNÇÕES COMPARTILHADAS ===================
  const openNotificationSucess = (text) => {
    api.open({
      message: 'Sucesso',
      description: text,
      icon: <SmileOutlined style={{ color: '#52c41a' }} />,
    });
  };

  const openNotificationFailure = (text) => {
    api.open({
      message: 'Erro',
      description: text,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
    });
  };

  // =================== CÁLCULO DE MÉTRICAS E DADOS DE GRÁFICOS ===================
  const assetMetrics = calculateAssetMetrics();
  const assetChartData = prepareAssetChartData();
  const categoryChartData = prepareCategoryChartData();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Componente do Modal de Histórico
  const HistoryModal = () => {
    if (!currentAsset) return null;
    
    // Paginar o histórico
    const start = (currentHistoryPage - 1) * historyPageSize;
    const end = start + historyPageSize;
    const paginatedHistory = currentAsset.historico.slice(start, end);
    const totalHistoryItems = currentAsset.historico.length;
    
    return (
      <Modal
        title={`Histórico de Ativo - ${currentAsset.serialMaquina}`}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="close" onClick={handleModalCancel}>
            Fechar
          </Button>
        ]}
        width={700}
      >
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Modelo:</Text> {currentAsset.modelo}
            </Col>
            <Col span={12}>
              <Text strong>Categoria:</Text> {currentAsset.categoria}
            </Col>
            <Col span={12}>
              <Text strong>Serial N:</Text> {currentAsset.serialN}
            </Col>
            <Col span={12}>
              <Text strong>RFID:</Text> {currentAsset.rfid}
            </Col>
            <Col span={12}>
              <Text strong>Situação Atual: </Text> 
              <Tag color={currentAsset.situacao === 'Apto' ? 'green' : 'red'}>
                {currentAsset.situacao}
              </Tag>
            </Col>
            <Col span={12}>
              <Text strong>Detalhamento:</Text> {currentAsset.detalhamento}
            </Col>
            <Col span={12}>
              <Text strong>Alocação Atual:</Text> {currentAsset.alocacao}
            </Col>
          </Row>
        </Card>
        
        <Divider orientation="left">Histórico de Alocações</Divider>
        
        <Timeline
          mode="left"
          items={paginatedHistory.map(item => ({
            label: item.data,
            children: (
              <Card size="small" style={{ marginBottom: '10px' }}>
                <p><strong>Destino:</strong> {item.destino} {item.nomeDestino ? `- ${item.nomeDestino}` : ''}</p>
                <p><strong>OS:</strong> {item.os}</p>
                <p><strong>Motivo:</strong> {item.motivo}</p>
                <p><strong>Local:</strong> {item.local}</p>
                <p><strong>Responsável:</strong> {item.responsavel}</p>
              </Card>
            )
          }))}
        />
        
        {totalHistoryItems > historyPageSize && (
          <div style={{ textAlign: 'center', marginTop: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<span>&#8249;</span>} 
              disabled={currentHistoryPage === 1}
              onClick={() => handleHistoryPageChange(currentHistoryPage - 1)}
              style={{ fontSize: '18px' }}
            />
            <div style={{ 
              margin: '0 10px', 
              border: '1px solid #d9d9d9', 
              borderRadius: '2px', 
              padding: '4px 15px',
              minWidth: '32px',
              textAlign: 'center',
              color: '#1890ff'
            }}>
              {currentHistoryPage}
            </div>
            <Button 
              type="text" 
              icon={<span>&#8250;</span>} 
              disabled={currentHistoryPage === Math.ceil(totalHistoryItems / historyPageSize)}
              onClick={() => handleHistoryPageChange(currentHistoryPage + 1)}
              style={{ fontSize: '18px' }}
            />
          </div>
        )}
      </Modal>
    );
  };

  // =================== RENDERIZAÇÃO PRINCIPAL ===================
  return (
    <div style={{ padding: '20px' }}>
      {contextHolder}
      
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col span={24}>
          <Title level={4}>Sistema de Gestão de Ativos</Title>
          <Text type="secondary">Gerencie ativos em tempo real</Text>
        </Col>
      </Row>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        size="large"
        style={{ marginBottom: '20px' }}
      >
        <TabPane tab="Dashboard" key="1">
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col span={24}>
              <Title level={5}>Visão Geral dos Ativos</Title>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic title="Total de Ativos" value={assetMetrics.totalAssets} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Ativos Aptos" 
                  value={assetMetrics.aptosAssets}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Ativos Inaptos" 
                  value={assetMetrics.inaptosAssets} 
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Modelo Mais Comum" 
                  value={assetMetrics.modeloMaisComum}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col xs={24} md={12}>
              <Card title="Distribuição de Ativos por Categoria">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="category"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Estado dos Ativos por Modelo">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assetChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="modelo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aptos" fill="#52c41a" name="Aptos" />
                    <Bar dataKey="inaptos" fill="#ff4d4f" name="Inaptos" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Gestão de Ativos" key="2">
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col xs={24} md={8}>
              <Search
                placeholder="Buscar ativos"
                onSearch={handleAssetSearch}
                style={{ width: '100%' }}
                allowClear
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filtrar por categoria"
                onChange={handleAssetCategoryChange}
                defaultValue="all"
                options={[
                  { label: 'Todas', value: 'all' },
                  ...Array.from(new Set(assets.map(a => a.categoria)))
                    .map(cat => ({ label: cat, value: cat }))
                ]}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filtrar por modelo"
                onChange={handleModeloChange}
                defaultValue="all"
                options={[
                  { label: 'Todos', value: 'all' },
                  ...Array.from(new Set(assets.map(a => a.modelo)))
                    .map(modelo => ({ label: modelo, value: modelo }))
                ]}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic title="Total de Ativos" value={assetMetrics.totalAssets} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Ativos Aptos" 
                  value={assetMetrics.aptosAssets} 
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Ativos Inaptos" 
                  value={assetMetrics.inaptosAssets}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Modelo Mais Comum" 
                  value={assetMetrics.modeloMaisComum}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Lista de Ativos" style={{width: '100%'}}>
            <Table 
              columns={assetsColumns} 
              dataSource={filteredAssets}
              loading={loadingAssets}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Cadastro de Ativos" key="3">
          <Card title="Cadastrar Novo Ativo" style={{width: '100%'}}>
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => {
                console.log(values);
                openNotificationSucess('Ativo cadastrado com sucesso!');
                form.resetFields();
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Modelo"
                    name="modelo"
                    rules={[{ required: true, message: 'Por favor, informe o modelo!' }]}
                  >
                    <Input placeholder="Modelo do ativo" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Categoria"
                    name="categoria"
                    rules={[{ required: true, message: 'Por favor, selecione a categoria!' }]}
                  >
                    <Select placeholder="Selecione a categoria">
                      <Select.Option value="POS">POS</Select.Option>
                      <Select.Option value="SmartPOS">SmartPOS</Select.Option>
                      <Select.Option value="Mobile">Mobile</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="RFID"
                    name="rfid"
                    rules={[{ required: true, message: 'Por favor, informe o RFID!' }]}
                  >
                    <Input placeholder="RFID" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Serial da Máquina"
                    name="serialMaquina"
                    rules={[{ required: true, message: 'Por favor, informe o serial da máquina!' }]}
                  >
                    <Input placeholder="Serial da máquina" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Serial N"
                    name="serialN"
                    rules={[{ required: true, message: 'Por favor, informe o Serial N!' }]}
                  >
                    <Input placeholder="Serial N" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Device Z"
                    name="deviceZ"
                  >
                    <Input placeholder="Device Z" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Situação"
                    name="situacao"
                    initialValue="Apto"
                    rules={[{ required: true, message: 'Por favor, selecione a situação!' }]}
                  >
                    <Select placeholder="Selecione a situação">
                      <Select.Option value="Apto">Apto</Select.Option>
                      <Select.Option value="Inapto">Inapto</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Detalhamento"
                    name="detalhamento"
                    rules={[{ required: true, message: 'Por favor, informe o detalhamento!' }]}
                  >
                    <Select placeholder="Selecione o detalhamento">
                      <Select.Option value="Em perfeito estado">Em perfeito estado</Select.Option>
                      <Select.Option value="Tela quebrada">Tela quebrada</Select.Option>
                      <Select.Option value="Bateria defeituosa">Bateria defeituosa</Select.Option>
                      <Select.Option value="Tamper violado">Tamper violado</Select.Option>
                      <Select.Option value="Problema de comunicação">Problema de comunicação</Select.Option>
                      <Select.Option value="Leitor de cartão danificado">Leitor de cartão danificado</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Alocação"
                    name="alocacao"
                    rules={[{ required: true, message: 'Por favor, informe a alocação!' }]}
                  >
                    <Input placeholder="Local de alocação atual" />
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="end">
                <Col>
                  <Space>
                    <Button onClick={() => form.resetFields()}>Limpar</Button>
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                      Cadastrar
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
      
      {/* Modal de histórico - renderizado apenas quando visível */}
      <HistoryModal />
    </div>
  );
};

export default GestaoInventario;