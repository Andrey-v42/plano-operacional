import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, DatePicker, Select, Typography, Table, Tag, Input, Button, Form, Space, notification, Badge, Tabs, Modal, Timeline, Divider } from 'antd';
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

  // =================== ESTOQUE ===================
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
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
    fetchProducts();
    fetchAssets();
  }, []);

  // =================== FUNÇÕES DE ESTOQUE ===================
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      // Mock API call
      const response = await new Promise(resolve => setTimeout(() => {
        resolve({
          data: [
            { 
              id: 1, 
              item: 'Produto A', 
              quantidade: 150, 
              categoria: 'Bebidas', 
              equipamento: 'Refrigerador', 
              polo: 'Norte', 
              origem: 'Almoxarifado Central', 
              codOrigem: 'AC-123', 
              destino: 'Loja 1', 
              codDestino: 'L1-456', 
              motivo: 'Reposição', 
              tipoEstoque: 'Regular', 
              casaEvento: 'Casa', 
              criadoPor: 'João Silva', 
              criadoEm: new Date().getTime() 
            },
            { 
              id: 2, 
              item: 'Produto B', 
              quantidade: 30, 
              categoria: 'Alimentos', 
              equipamento: 'Estante', 
              polo: 'Sul', 
              origem: 'Fornecedor', 
              codOrigem: 'FOR-789', 
              destino: 'Depósito', 
              codDestino: 'DEP-101', 
              motivo: 'Compra', 
              tipoEstoque: 'Emergência', 
              casaEvento: 'Evento', 
              criadoPor: 'Maria Oliveira', 
              criadoEm: new Date().getTime() 
            },
            { 
              id: 3, 
              item: 'Produto C', 
              quantidade: 200, 
              categoria: 'Bebidas', 
              equipamento: 'Freezer', 
              polo: 'Leste', 
              origem: 'Loja 2', 
              codOrigem: 'L2-222', 
              destino: 'Loja 3', 
              codDestino: 'L3-333', 
              motivo: 'Transferência', 
              tipoEstoque: 'Regular', 
              casaEvento: 'Casa', 
              criadoPor: 'Pedro Santos', 
              criadoEm: new Date().getTime() 
            },
          ]
        });
      }, 1000));
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      openNotificationFailure('Erro ao carregar produtos');
    }
    setLoadingProducts(false);
  };

  const productsColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '5%',
    },
    {
      title: 'Item',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade',
      key: 'quantidade',
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
    },
    {
      title: 'Equipamento',
      dataIndex: 'equipamento',
      key: 'equipamento',
    },
    {
      title: 'Polo',
      dataIndex: 'polo',
      key: 'polo',
    },
    {
      title: 'Origem',
      dataIndex: 'origem',
      key: 'origem',
    },
    {
      title: 'Cód Origem',
      dataIndex: 'codOrigem',
      key: 'codOrigem',
    },
    {
      title: 'Destino',
      dataIndex: 'destino',
      key: 'destino',
    },
    {
      title: 'Cód Destino',
      dataIndex: 'codDestino',
      key: 'codDestino',
    },
    {
      title: 'Motivo da movimentação',
      dataIndex: 'motivo',
      key: 'motivo',
    },
    {
      title: 'Tipo estoque',
      dataIndex: 'tipoEstoque',
      key: 'tipoEstoque',
    },
    {
      title: 'Casa/Evento',
      dataIndex: 'casaEvento',
      key: 'casaEvento',
    },
    {
      title: 'Criado por',
      dataIndex: 'criadoPor',
      key: 'criadoPor',
    },
    {
      title: 'Criado em',
      dataIndex: 'criadoEm',
      key: 'criadoEm',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
  ];

  const calculateProductMetrics = () => {
    const totalProducts = filteredProducts.length;
    const lowStock = filteredProducts.filter(p => p.quantidade < 50).length;
    const totalItems = filteredProducts.reduce((sum, p) => sum + p.quantidade, 0);
    const averageStock = totalProducts > 0 ? totalItems / totalProducts : 0;

    return {
      totalProducts,
      lowStock,
      totalItems,
      averageStock: averageStock.toFixed(0)
    };
  };

  const prepareProductChartData = () => {
    const categoryData = {};
    filteredProducts.forEach(product => {
      if (!categoryData[product.categoria]) {
        categoryData[product.categoria] = {
          quantity: 0,
          value: 0
        };
      }
      categoryData[product.categoria].quantity += product.quantidade;
      // Para cálculo de valor, estamos usando a quantidade como um espaço reservado
      categoryData[product.categoria].value += product.quantidade * 10; // Assumindo um valor fixo para visualização
    });

    return Object.keys(categoryData).map(category => ({
      category,
      quantity: categoryData[category].quantity,
      value: categoryData[category].value
    }));
  };

  const handleProductSearch = (value) => {
    const filtered = products.filter(product => 
      product.item.toLowerCase().includes(value.toLowerCase()) ||
      product.categoria.toLowerCase().includes(value.toLowerCase()) ||
      product.polo.toLowerCase().includes(value.toLowerCase()) ||
      product.origem.toLowerCase().includes(value.toLowerCase()) ||
      product.destino.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    const filtered = value === 'all' 
      ? products 
      : products.filter(product => product.categoria === value);
    setFilteredProducts(filtered);
  };

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
              // Histórico fictício para o modal
              historico: [
                { data: '2024-12-15', evento: 'Alocado para Evento Final de Ano', local: 'Arena XYZ', responsavel: 'Ana Costa' },
                { data: '2024-10-03', evento: 'Manutenção Preventiva', local: 'Centro Técnico', responsavel: 'Técnico Roberto' },
                { data: '2024-07-22', evento: 'Alocado para Festival de Verão', local: 'Parque Municipal', responsavel: 'Carlos Mendes' },
                { data: '2024-04-10', evento: 'Aquisição', local: 'Almoxarifado Central', responsavel: 'Depto. Compras' }
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
              historico: [
                { data: '2025-02-01', evento: 'Relatório de Avaria - Tela Quebrada', local: 'Loja Central', responsavel: 'Supervisor José' },
                { data: '2024-11-20', evento: 'Alocado para Black Friday', local: 'Shopping Plaza', responsavel: 'Equipe Vendas' },
                { data: '2024-08-15', evento: 'Manutenção Corretiva', local: 'Assistência Técnica', responsavel: 'Técnico Felipe' },
                { data: '2024-06-05', evento: 'Alocado para Feira Gastronômica', local: 'Centro de Convenções', responsavel: 'Mariana Santos' },
                { data: '2024-03-22', evento: 'Aquisição', local: 'Almoxarifado Central', responsavel: 'Depto. Compras' }
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
              historico: [
                { data: '2025-01-15', evento: 'Relatório de Avaria - Bateria Defeituosa', local: 'Evento Corporativo', responsavel: 'Coord. Paulo' },
                { data: '2024-12-05', evento: 'Alocado para Feira de Natal', local: 'Pavilhão Norte', responsavel: 'Gerente Eventos' },
                { data: '2024-09-18', evento: 'Atualização de Software', local: 'Centro de TI', responsavel: 'Equipe Suporte' },
                { data: '2024-05-30', evento: 'Alocado para Congresso Nacional', local: 'Centro de Convenções', responsavel: 'Diretor Operações' },
                { data: '2024-02-10', evento: 'Aquisição', local: 'Almoxarifado Central', responsavel: 'Depto. Compras' }
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
              historico: [
                { data: '2025-02-10', evento: 'Verificação de Rotina', local: 'Centro de Manutenção', responsavel: 'Técnico Anderson' },
                { data: '2024-11-25', evento: 'Alocado para Evento Corporativo', local: 'Hotel Grandioso', responsavel: 'Coord. Eventos' },
                { data: '2024-08-03', evento: 'Atualização de Firmware', local: 'Centro de TI', responsavel: 'Equipe Suporte' },
                { data: '2024-05-12', evento: 'Aquisição', local: 'Almoxarifado Central', responsavel: 'Depto. Compras' }
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
              historico: [
                { data: '2025-01-20', evento: 'Manutenção Preventiva', local: 'Centro Técnico', responsavel: 'Técnico Márcio' },
                { data: '2024-10-15', evento: 'Alocado para Congresso', local: 'Centro de Eventos', responsavel: 'Gerente Thiago' },
                { data: '2024-07-05', evento: 'Aquisição', local: 'Almoxarifado Central', responsavel: 'Depto. Compras' }
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
    setIsModalVisible(true);
  };
  
  const handleModalCancel = () => {
    setIsModalVisible(false);
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
      asset.deviceZ.toLowerCase().includes(value.toLowerCase())
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
  const productMetrics = calculateProductMetrics();
  const productChartData = prepareProductChartData();
  
  const assetMetrics = calculateAssetMetrics();
  const assetChartData = prepareAssetChartData();
  const categoryChartData = prepareCategoryChartData();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Componente do Modal de Histórico
  const HistoryModal = () => {
    if (!currentAsset) return null;
    
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
              <Text strong>Situação Atual:</Text> 
              <Tag color={currentAsset.situacao === 'Apto' ? 'green' : 'red'}>
                {currentAsset.situacao}
              </Tag>
            </Col>
          </Row>
        </Card>
        
        <Divider orientation="left">Histórico de Alocações</Divider>
        
        <Timeline
          mode="left"
          items={currentAsset.historico.map(item => ({
            label: item.data,
            children: (
              <Card size="small" style={{ marginBottom: '10px' }}>
                <p><strong>Evento:</strong> {item.evento}</p>
                <p><strong>Local:</strong> {item.local}</p>
                <p><strong>Responsável:</strong> {item.responsavel}</p>
              </Card>
            )
          }))}
        />
      </Modal>
    );
  };

  // =================== RENDERIZAÇÃO PRINCIPAL ===================
  return (
    <div style={{ padding: '20px' }}>
      {contextHolder}
      
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col span={24}>
          <Title level={4}>Sistema de Gestão de Inventário</Title>
          <Text type="secondary">Gerencie estoque e equipamentos em tempo real</Text>
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
          {/* NOVA ABA DE DASHBOARD */}
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col span={24}>
              <Title level={5}>Visão Geral do Inventário</Title>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic title="Total de Produtos" value={productMetrics.totalProducts} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Produtos em Baixa" 
                  value={productMetrics.lowStock} 
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Total de Ativos" 
                  value={assetMetrics.totalAssets}
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
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col xs={24} md={12}>
              <Card title="Distribuição de Produtos por Categoria">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="quantity"
                      nameKey="category"
                    >
                      {productChartData.map((entry, index) => (
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
              <Card title="Quantidade de Produtos por Categoria">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#1890ff" name="Quantidade Total" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col xs={24} md={12}>
              <Card title="Distribuição de Ativos por Modelo">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="modelo"
                    >
                      {assetChartData.map((entry, index) => (
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
        
        <TabPane tab="Gestão de Estoque" key="2">
          {/* CONTEÚDO DA ABA DE ESTOQUE */}
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col xs={24} md={12}>
              <Search
                placeholder="Buscar produtos"
                onSearch={handleProductSearch}
                style={{ width: '100%' }}
                placeholder1="Filtrar por categoria"
                onChange={handleCategoryChange}
                defaultValue="all"
                options={[
                  { label: 'Todas', value: 'all' },
                  ...Array.from(new Set(products.map(p => p.categoria)))
                    .map(cat => ({ label: cat, value: cat }))
                ]}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic title="Total de Produtos" value={productMetrics.totalProducts} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Produtos em Baixa" 
                  value={productMetrics.lowStock} 
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Total de Itens" 
                  value={productMetrics.totalItems}
                  precision={0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic 
                  title="Média de Itens" 
                  value={productMetrics.averageStock}
                  precision={0}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Lista de Produtos" style={{width: '100%'}}>
            <Table 
              columns={productsColumns} 
              dataSource={filteredProducts}
              loading={loadingProducts}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Gestão de Ativos" key="3">
          {/* CONTEÚDO DA ABA DE ATIVOS UNIFICADA */}
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

        <TabPane tab="Cadastro de Movimentações" key="4">
          {/* CONTEÚDO DA ABA DE CADASTRO */}
          <Card title="Cadastrar Nova Movimentação de Estoque" style={{width: '100%'}}>
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => {
                console.log(values);
                openNotificationSucess('Movimentação cadastrada com sucesso!');
                form.resetFields();
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Item"
                    name="item"
                    rules={[{ required: true, message: 'Por favor, informe o item!' }]}
                  >
                    <Input placeholder="Nome do item" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Quantidade"
                    name="quantidade"
                    rules={[{ required: true, message: 'Por favor, informe a quantidade!' }]}
                  >
                    <Input type="number" min={1} placeholder="Quantidade" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Categoria"
                    name="categoria"
                    rules={[{ required: true, message: 'Por favor, selecione a categoria!' }]}
                  >
                    <Select placeholder="Selecione a categoria">
                      <Select.Option value="Bebidas">Bebidas</Select.Option>
                      <Select.Option value="Alimentos">Alimentos</Select.Option>
                      <Select.Option value="Materiais">Materiais</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Equipamento"
                    name="equipamento"
                  >
                    <Input placeholder="Equipamento relacionado" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Polo"
                    name="polo"
                    rules={[{ required: true, message: 'Por favor, selecione o polo!' }]}
                  >
                    <Select placeholder="Selecione o polo">
                      <Select.Option value="Norte">Norte</Select.Option>
                      <Select.Option value="Sul">Sul</Select.Option>
                      <Select.Option value="Leste">Leste</Select.Option>
                      <Select.Option value="Oeste">Oeste</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Tipo de Estoque"
                    name="tipoEstoque"
                    rules={[{ required: true, message: 'Por favor, selecione o tipo de estoque!' }]}
                  >
                    <Select placeholder="Selecione o tipo de estoque">
                      <Select.Option value="Regular">Regular</Select.Option>
                      <Select.Option value="Emergência">Emergência</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Origem"
                    name="origem"
                    rules={[{ required: true, message: 'Por favor, informe a origem!' }]}
                  >
                    <Input placeholder="Local de origem" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Código de Origem"
                    name="codOrigem"
                  >
                    <Input placeholder="Código do local de origem" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Destino"
                    name="destino"
                    rules={[{ required: true, message: 'Por favor, informe o destino!' }]}
                  >
                    <Input placeholder="Local de destino" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Código de Destino"
                    name="codDestino"
                  >
                    <Input placeholder="Código do local de destino" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Motivo da Movimentação"
                    name="motivo"
                    rules={[{ required: true, message: 'Por favor, informe o motivo!' }]}
                  >
                    <Select placeholder="Selecione o motivo">
                      <Select.Option value="Compra">Compra</Select.Option>
                      <Select.Option value="Transferência">Transferência</Select.Option>
                      <Select.Option value="Reposição">Reposição</Select.Option>
                      <Select.Option value="Baixa">Baixa</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Casa/Evento"
                    name="casaEvento"
                    rules={[{ required: true, message: 'Por favor, informe se é para Casa ou Evento!' }]}
                  >
                    <Select placeholder="Casa ou Evento">
                      <Select.Option value="Casa">Casa</Select.Option>
                      <Select.Option value="Evento">Evento</Select.Option>
                    </Select>
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

        <TabPane tab="Cadastro de Ativos" key="5">
          {/* CONTEÚDO DA ABA DE CADASTRO DE ATIVOS */}
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