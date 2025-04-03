import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography,
  Select,
  Space,
  Tag,
  Empty,
  Switch,
  Button,
  Tooltip
} from 'antd';
import { 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  Cell,
  Line,
  ComposedChart
} from 'recharts';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';

// Constantes de localização (definidas localmente para evitar problemas de importação)
const LOCALIZACOES = [
  'São Paulo - SP (Matriz)',
  'Rio de Janeiro - RJ',
  'Salvador - BA',
  'Vitória - ES',
  'Belém - PA',
  'Recife - PE',
  'Belo Horizonte - MG',
  'Goiânia - GO',
  'Porto Alegre - RS',
  'Fortaleza - CE',
  'Brasília - DF',
  'Curitiba - PR',
  'Balneário Camboriú - SC',
  'Floripa - SC',
  'Ribeirão Preto - SP',
  'Uberlândia - MG',
  'Campinas - SP',
  'Campo Grande - MS',
  'Caxias do Sul - RS',
  'Cuiabá - MT',
  'João Pessoa - PB',
  'Londrina - PR',
  'Manaus - AM',
  'Natal - RN',
  'Porto Seguro - BA',
  'Santos - SP'
];

const { Title, Text } = Typography;
const { Option } = Select;

// Funções de preparação de dados para os gráficos
const prepareAssetChartData = (filteredAssets) => {
  const modeloData = {};
  filteredAssets.forEach((asset) => {
    if (!modeloData[asset.modelo]) {
      modeloData[asset.modelo] = {
        total: 0,
        inaptos: 0,
      };
    }
    modeloData[asset.modelo].total += 1;
    if (asset.situacao === "Inapto") {
      modeloData[asset.modelo].inaptos += 1;
    }
  });

  return Object.keys(modeloData).map((modelo) => ({
    modelo,
    total: modeloData[modelo].total,
    inaptos: modeloData[modelo].inaptos,
    aptos: modeloData[modelo].total - modeloData[modelo].inaptos,
  }));
};

const prepareCategoryChartData = (filteredAssets) => {
  const categoryData = {};
  filteredAssets.forEach((asset) => {
    if (!categoryData[asset.categoria]) {
      categoryData[asset.categoria] = 0;
    }
    categoryData[asset.categoria] += 1;
  });

  return Object.keys(categoryData).map((category) => ({
    category,
    value: categoryData[category],
  }));
};

const prepareTipoChartData = (filteredAssets) => {
  const tipoData = {};
  filteredAssets.forEach((asset) => {
    if (asset.tipo) {
      if (!tipoData[asset.tipo]) {
        tipoData[asset.tipo] = {
          total: 0,
          inaptos: 0,
        };
      }
      tipoData[asset.tipo].total += 1;
      if (asset.situacao === "Inapto") {
        tipoData[asset.tipo].inaptos += 1;
      }
    }
  });

  return Object.keys(tipoData).map((tipo) => ({
    tipo,
    total: tipoData[tipo].total,
    inaptos: tipoData[tipo].inaptos,
    aptos: tipoData[tipo].total - tipoData[tipo].inaptos,
  }));
};

const prepareAdquirenciaChartData = (filteredAssets) => {
  const adquirenciaData = {};
  filteredAssets.forEach((asset) => {
    if (asset.adquirencia) {
      if (!adquirenciaData[asset.adquirencia]) {
        adquirenciaData[asset.adquirencia] = {
          total: 0,
          inaptos: 0,
        };
      }
      adquirenciaData[asset.adquirencia].total += 1;
      if (asset.situacao === "Inapto") {
        adquirenciaData[asset.adquirencia].inaptos += 1;
      }
    }
  });

  return Object.keys(adquirenciaData).map((adquirencia) => ({
    adquirencia,
    total: adquirenciaData[adquirencia].total,
    inaptos: adquirenciaData[adquirencia].inaptos,
    aptos: adquirenciaData[adquirencia].total - adquirenciaData[adquirencia].inaptos,
  }));
};

const prepareLocationChartData = (filteredAssets) => {
  const locationData = {};
  filteredAssets.forEach((asset) => {
    if (!locationData[asset.alocacao]) {
      locationData[asset.alocacao] = {
        total: 0,
        aptos: 0,
        inaptos: 0
      };
    }
    locationData[asset.alocacao].total += 1;
    if (asset.situacao === "Apto") {
      locationData[asset.alocacao].aptos += 1;
    } else {
      locationData[asset.alocacao].inaptos += 1;
    }
  });

  return Object.keys(locationData).map((location) => ({
    location,
    total: locationData[location].total,
    aptos: locationData[location].aptos,
    inaptos: locationData[location].inaptos,
  }));
};

// Função para preparar dados do gráfico de Pareto de detalhamentos
const prepareDetalhamentoChartData = (filteredAssets) => {
  // Coletar dados de detalhamento
  const detalhamentoData = {};
  
  filteredAssets.forEach((asset) => {
    if (asset.detalhamento) {
      detalhamentoData[asset.detalhamento] = (detalhamentoData[asset.detalhamento] || 0) + 1;
    }
  });
  
  // Transformar em array e ordenar do maior para o menor
  const sortedData = Object.entries(detalhamentoData)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  // Calcular valores acumulados e percentuais para o gráfico de Pareto
  const total = sortedData.reduce((sum, item) => sum + item.count, 0);
  let accumulated = 0;
  
  return sortedData.map(item => {
    accumulated += item.count;
    const percentage = (item.count / total) * 100;
    const accumulatedPercentage = (accumulated / total) * 100;
    
    return {
      name: item.name,
      count: item.count,
      percentage: percentage.toFixed(1),
      accumulatedPercentage: accumulatedPercentage.toFixed(1)
    };
  });
};

// Função de cálculo de métricas (podem ser movidas para um arquivo utils)
const calculateAssetMetrics = (filteredAssets) => {
  const totalAssets = filteredAssets.length;
  const inaptosAssets = filteredAssets.filter(a => a.situacao === "Inapto").length;
  const aptosAssets = filteredAssets.filter(a => a.situacao === "Apto").length;

  // Contar modelos
  const modelosCount = {};
  filteredAssets.forEach((asset) => {
    modelosCount[asset.modelo] = (modelosCount[asset.modelo] || 0) + 1;
  });

  const modeloMaisComum = Object.keys(modelosCount).length > 0
    ? Object.keys(modelosCount).reduce((a, b) => 
        modelosCount[a] > modelosCount[b] ? a : b, '')
    : "N/A";
  
  // Contar tipos
  const tiposCount = {};
  filteredAssets.forEach((asset) => {
    if (asset.tipo) {
      tiposCount[asset.tipo] = (tiposCount[asset.tipo] || 0) + 1;
    }
  });
  
  const tipoMaisComum = Object.keys(tiposCount).length > 0
    ? Object.keys(tiposCount).reduce((a, b) => 
        tiposCount[a] > tiposCount[b] ? a : b, '')
    : "N/A";
    
  // Contar adquirências
  const adquirenciasCount = {};
  filteredAssets.forEach((asset) => {
    if (asset.adquirencia) {
      adquirenciasCount[asset.adquirencia] = (adquirenciasCount[asset.adquirencia] || 0) + 1;
    }
  });
  
  const adquirenciaMaisComum = Object.keys(adquirenciasCount).length > 0
    ? Object.keys(adquirenciasCount).reduce((a, b) => 
        adquirenciasCount[a] > adquirenciasCount[b] ? a : b, '')
    : "N/A";

  // Calcular localizações mais comuns
  const locacoesCount = {};
  filteredAssets.forEach((asset) => {
    locacoesCount[asset.alocacao] = (locacoesCount[asset.alocacao] || 0) + 1;
  });

  // Calcular detalhamentos mais comuns
  const detalhamentoCount = {};
  filteredAssets.forEach((asset) => {
    if (asset.detalhamento) {
      detalhamentoCount[asset.detalhamento] = (detalhamentoCount[asset.detalhamento] || 0) + 1;
    }
  });

  // Top 3 localizações
  const topLocations = Object.entries(locacoesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  return {
    totalAssets,
    inaptosAssets,
    aptosAssets,
    modeloMaisComum,
    tipoMaisComum,
    adquirenciaMaisComum,
    topLocations,
    detalhamentoCount
  };
};

// Componente principal
const DashboardGestaoDeAtivos = ({ assets, filteredAssets: initialFilteredAssets }) => {
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [dashboardAssets, setDashboardAssets] = useState(initialFilteredAssets);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#4A90E2"];
  
  // Novo estado para controlar o modo interativo
  const [interactiveMode, setInteractiveMode] = useState(false);
  
  // Estados para os filtros interativos
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [selectedModelo, setSelectedModelo] = useState(null);
  const [selectedAdquirencia, setSelectedAdquirencia] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDetalhamento, setSelectedDetalhamento] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  // Efeito para filtrar assets com base nas localizações selecionadas no filtro principal
  useEffect(() => {
    let filtered = initialFilteredAssets;
    
    // Aplicar filtro de localizações selecionadas
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(asset =>
        selectedLocations.includes(asset.alocacao)
      );
    }
    
    // Aplicar filtros interativos se estiver no modo interativo
    if (interactiveMode) {
      if (selectedCategory) {
        filtered = filtered.filter(asset => asset.categoria === selectedCategory);
      }
      
      if (selectedTipo) {
        filtered = filtered.filter(asset => asset.tipo === selectedTipo);
      }
      
      if (selectedModelo) {
        filtered = filtered.filter(asset => asset.modelo === selectedModelo);
      }
      
      if (selectedAdquirencia) {
        filtered = filtered.filter(asset => asset.adquirencia === selectedAdquirencia);
      }
      
      if (selectedLocation) {
        filtered = filtered.filter(asset => asset.alocacao === selectedLocation);
      }
      
      if (selectedDetalhamento) {
        filtered = filtered.filter(asset => asset.detalhamento === selectedDetalhamento);
      }
    }
    
    setDashboardAssets(filtered);
    
    // Atualizar lista de filtros ativos para exibição
    const newActiveFilters = [];
    if (selectedCategory) newActiveFilters.push(`Categoria: ${selectedCategory}`);
    if (selectedTipo) newActiveFilters.push(`Tipo: ${selectedTipo}`);
    if (selectedModelo) newActiveFilters.push(`Modelo: ${selectedModelo}`);
    if (selectedAdquirencia) newActiveFilters.push(`Adquirência: ${selectedAdquirencia}`);
    if (selectedLocation) newActiveFilters.push(`Localização: ${selectedLocation}`);
    if (selectedDetalhamento) newActiveFilters.push(`Detalhamento: ${selectedDetalhamento}`);
    setActiveFilters(newActiveFilters);
    
  }, [selectedLocations, initialFilteredAssets, selectedCategory, selectedTipo, selectedModelo, selectedAdquirencia, selectedLocation, selectedDetalhamento, interactiveMode]);

  // Calcular métricas para os assets filtrados
  const assetMetrics = calculateAssetMetrics(dashboardAssets);
  const assetChartData = prepareAssetChartData(dashboardAssets);
  const categoryChartData = prepareCategoryChartData(dashboardAssets);
  const tipoChartData = prepareTipoChartData(dashboardAssets);
  const adquirenciaChartData = prepareAdquirenciaChartData(dashboardAssets);
  const locationChartData = prepareLocationChartData(dashboardAssets);
  const detalhamentoChartData = prepareDetalhamentoChartData(dashboardAssets);

  // Ordenar gráficos para melhor visualização
  const sortedLocationChartData = [...locationChartData].sort((a, b) => b.total - a.total);
  const sortedTipoChartData = [...tipoChartData].sort((a, b) => b.total - a.total);
  const sortedAdquirenciaChartData = [...adquirenciaChartData].sort((a, b) => b.total - a.total);

  // Manipulador para alterar seleção de localização
  const handleLocationChange = (values) => {
    setSelectedLocations(values);
  };
  
  // Handlers para os cliques nos gráficos (modo interativo)
  const handleCategoryClick = (data) => {
    if (!interactiveMode) return;
    
    if (selectedCategory === data.category) {
      setSelectedCategory(null); // Desselecionar se clicar no mesmo
    } else {
      setSelectedCategory(data.category);
    }
  };
  
  const handleTipoClick = (data) => {
    if (!interactiveMode) return;
    
    if (selectedTipo === data.tipo) {
      setSelectedTipo(null); // Desselecionar se clicar no mesmo
    } else {
      setSelectedTipo(data.tipo);
    }
  };
  
  const handleModeloClick = (data) => {
    if (!interactiveMode) return;
    
    if (selectedModelo === data.modelo) {
      setSelectedModelo(null); // Desselecionar se clicar no mesmo
    } else {
      setSelectedModelo(data.modelo);
    }
  };
  
  const handleAdquirenciaClick = (data) => {
    if (!interactiveMode) return;
    
    if (selectedAdquirencia === data.adquirencia) {
      setSelectedAdquirencia(null); // Desselecionar se clicar no mesmo
    } else {
      setSelectedAdquirencia(data.adquirencia);
    }
  };
  
  const handleLocationClick = (data) => {
    if (!interactiveMode) return;
    
    if (selectedLocation === data.location) {
      setSelectedLocation(null); // Desselecionar se clicar no mesmo
    } else {
      setSelectedLocation(data.location);
    }
  };
  
  // Limpar todos os filtros interativos
  const clearAllInteractiveFilters = () => {
    setSelectedCategory(null);
    setSelectedTipo(null);
    setSelectedModelo(null);
    setSelectedAdquirencia(null);
    setSelectedLocation(null);
    setSelectedDetalhamento(null);
  };
  
  // Handler para clique no gráfico de detalhamento
  const handleDetalhamentoClick = (data) => {
    if (!interactiveMode) return;
    
    if (selectedDetalhamento === data.name) {
      setSelectedDetalhamento(null); // Desselecionar se clicar no mesmo
    } else {
      setSelectedDetalhamento(data.name);
    }
  };

  // Estilo para elementos clicáveis
  const getClickableStyle = (interactiveMode) => ({
    cursor: interactiveMode ? 'pointer' : 'default',
  });
  
  // Renderização condicional para elementos selecionados nos gráficos
  const getCategoryFill = (entry, index) => {
    if (interactiveMode && selectedCategory === entry.category) {
      return '#ff7300'; // Cor de destaque para item selecionado
    }
    return COLORS[index % COLORS.length];
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
        <Col span={24}>
          <Card>
            <Row gutter={[16, 8]} align="middle">
              <Col xs={24} md={14}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Title level={5}>Filtrar por Localização</Title>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Selecione as localizações"
                    onChange={handleLocationChange}
                    maxTagCount={5}
                    value={selectedLocations}
                  >
                    {LOCALIZACOES.map(location => (
                      <Option key={location} value={location}>{location}</Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              <Col xs={24} md={10}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
                  <Space>
                    <Tooltip title="Limpar filtros interativos">
                      <Button 
                        icon={<ClearOutlined />} 
                        onClick={clearAllInteractiveFilters}
                        disabled={!interactiveMode || (!selectedCategory && !selectedTipo && !selectedModelo && !selectedAdquirencia && !selectedLocation && !selectedDetalhamento)}
                      />
                    </Tooltip>
                    <Space>
                      <Text>Modo Interativo</Text>
                      <Switch 
                        checked={interactiveMode} 
                        onChange={setInteractiveMode}
                        checkedChildren={<FilterOutlined />}
                      />
                    </Space>
                  </Space>
                </div>
              </Col>
            </Row>
            
            {(selectedLocations.length > 0 || activeFilters.length > 0) && (
              <div style={{ marginTop: 8 }}>
                {selectedLocations.length > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">Filtros de localização: </Text>
                    {selectedLocations.map(loc => (
                      <Tag key={loc} color="blue" style={{ marginRight: 4 }}>{loc}</Tag>
                    ))}
                  </div>
                )}
                
                {interactiveMode && activeFilters.length > 0 && (
                  <div>
                    <Text type="secondary">Filtros interativos: </Text>
                    {activeFilters.map(filter => (
                      <Tag key={filter} color="orange" style={{ marginRight: 4 }}>{filter}</Tag>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
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
              title="Tipo Principal" 
              value={assetMetrics.tipoMaisComum}
              valueStyle={{ fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
        <Col xs={24} md={12}>
          <Card title={
            <Space>
              <span>Distribuição de Ativos por Categoria</span>
              {interactiveMode && <Tag color="orange">Clicável</Tag>}
            </Space>
          }>
            {categoryChartData.length > 0 ? (
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
                    onClick={interactiveMode ? (data) => handleCategoryClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getCategoryFill(entry, index)}
                        stroke={selectedCategory === entry.category ? '#333' : '#fff'}
                        strokeWidth={selectedCategory === entry.category ? 2 : 1}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend 
                    onClick={interactiveMode ? (data) => handleCategoryClick({category: data.value}) : null}
                    style={getClickableStyle(interactiveMode)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Nenhum dado disponível para as localizações selecionadas" 
                style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={
            <Space>
              <span>Estado dos Ativos por Tipo</span>
              {interactiveMode && <Tag color="orange">Clicável</Tag>}
            </Space>
          }>
            {sortedTipoChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedTipoChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend onClick={interactiveMode ? (data) => handleTipoClick({tipo: data.value}) : null} />
                  <Bar 
                    dataKey="aptos" 
                    fill="#52c41a" 
                    name="Aptos" 
                    onClick={interactiveMode ? (data) => handleTipoClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {sortedTipoChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-aptos-tipo-${index}`} 
                        fill={selectedTipo === entry.tipo ? '#2a9d8f' : '#52c41a'}
                        stroke={selectedTipo === entry.tipo ? '#333' : '#fff'}
                        strokeWidth={selectedTipo === entry.tipo ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="inaptos" 
                    fill="#ff4d4f" 
                    name="Inaptos" 
                    onClick={interactiveMode ? (data) => handleTipoClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {sortedTipoChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-inaptos-tipo-${index}`} 
                        fill={selectedTipo === entry.tipo ? '#e76f51' : '#ff4d4f'}
                        stroke={selectedTipo === entry.tipo ? '#333' : '#fff'}
                        strokeWidth={selectedTipo === entry.tipo ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Nenhum dado disponível para as localizações selecionadas" 
                style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              />
            )}
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
        <Col xs={24} md={12}>
          <Card title={
            <Space>
              <span>Estado dos Ativos por Modelo</span>
              {interactiveMode && <Tag color="orange">Clicável</Tag>}
            </Space>
          }>
            {assetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assetChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="modelo" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend onClick={interactiveMode ? (data) => handleModeloClick({modelo: data.value}) : null} />
                  <Bar 
                    dataKey="aptos" 
                    fill="#52c41a" 
                    name="Aptos" 
                    onClick={interactiveMode ? (data) => handleModeloClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {assetChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-aptos-${index}`} 
                        fill={selectedModelo === entry.modelo ? '#2a9d8f' : '#52c41a'}
                        stroke={selectedModelo === entry.modelo ? '#333' : '#fff'}
                        strokeWidth={selectedModelo === entry.modelo ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="inaptos" 
                    fill="#ff4d4f" 
                    name="Inaptos" 
                    onClick={interactiveMode ? (data) => handleModeloClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {assetChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-inaptos-${index}`} 
                        fill={selectedModelo === entry.modelo ? '#e76f51' : '#ff4d4f'}
                        stroke={selectedModelo === entry.modelo ? '#333' : '#fff'}
                        strokeWidth={selectedModelo === entry.modelo ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Nenhum dado disponível para as localizações selecionadas" 
                style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title={
            <Space>
              <span>Estado dos Ativos por Adquirência</span>
              {interactiveMode && <Tag color="orange">Clicável</Tag>}
            </Space>
          }>
            {sortedAdquirenciaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedAdquirenciaChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="adquirencia" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend onClick={interactiveMode ? (data) => handleAdquirenciaClick({adquirencia: data.value}) : null} />
                  <Bar 
                    dataKey="aptos" 
                    fill="#52c41a" 
                    name="Aptos" 
                    onClick={interactiveMode ? (data) => handleAdquirenciaClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {sortedAdquirenciaChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-aptos-adq-${index}`} 
                        fill={selectedAdquirencia === entry.adquirencia ? '#2a9d8f' : '#52c41a'}
                        stroke={selectedAdquirencia === entry.adquirencia ? '#333' : '#fff'}
                        strokeWidth={selectedAdquirencia === entry.adquirencia ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="inaptos" 
                    fill="#ff4d4f" 
                    name="Inaptos" 
                    onClick={interactiveMode ? (data) => handleAdquirenciaClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {sortedAdquirenciaChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-inaptos-adq-${index}`} 
                        fill={selectedAdquirencia === entry.adquirencia ? '#e76f51' : '#ff4d4f'}
                        stroke={selectedAdquirencia === entry.adquirencia ? '#333' : '#fff'}
                        strokeWidth={selectedAdquirencia === entry.adquirencia ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Nenhum dado disponível para as localizações selecionadas" 
                style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={
            <Space>
              <span>Distribuição de Ativos por Localização</span>
              {interactiveMode && <Tag color="orange">Clicável</Tag>}
            </Space>
          }>
            {locationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={sortedLocationChartData}
                  layout="horizontal"
                  margin={{ top: 40, right: 30, left: 30, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="location" 
                    type="category"
                    tick={{ 
                      angle: -45,
                      textAnchor: 'end',
                      fill: (entry) => selectedLocation === entry ? '#ff7300' : '#666'
                    }}
                    height={80}
                  />
                  <YAxis type="number" />
                  <RechartsTooltip />
                  <Legend 
                    onClick={interactiveMode ? (data) => handleLocationClick({location: data.value}) : null} 
                    verticalAlign="top"
                    height={36}
                  />
                  <Bar 
                    dataKey="aptos" 
                    stackId="a" 
                    fill="#52c41a" 
                    name="Aptos" 
                    onClick={interactiveMode ? (data) => handleLocationClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {sortedLocationChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-aptos-loc-${index}`} 
                        fill={selectedLocation === entry.location ? '#2a9d8f' : '#52c41a'}
                        stroke={selectedLocation === entry.location ? '#333' : '#fff'}
                        strokeWidth={selectedLocation === entry.location ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="inaptos" 
                    stackId="a" 
                    fill="#ff4d4f" 
                    name="Inaptos"
                    onClick={interactiveMode ? (data) => handleLocationClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {sortedLocationChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-inaptos-loc-${index}`} 
                        fill={selectedLocation === entry.location ? '#e76f51' : '#ff4d4f'}
                        stroke={selectedLocation === entry.location ? '#333' : '#fff'}
                        strokeWidth={selectedLocation === entry.location ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Nenhum dado disponível para as localizações selecionadas" 
                style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {assetMetrics.topLocations.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: '1rem' }}>
          <Col span={24}>
            <Card title="Top Localizações" size="small">
              <Row gutter={[16, 16]}>
                {assetMetrics.topLocations.map((location, index) => (
                  <Col key={location.name} xs={24} md={8}>
                    <Card 
                      hoverable={interactiveMode}
                      onClick={interactiveMode ? () => handleLocationClick({location: location.name}) : null}
                      style={{ 
                        borderColor: interactiveMode && selectedLocation === location.name ? '#ff7300' : undefined,
                        cursor: interactiveMode ? 'pointer' : 'default'
                      }}
                    >
                      <Statistic 
                        title={location.name} 
                        value={location.count} 
                        valueStyle={{ 
                          color: interactiveMode && selectedLocation === location.name 
                            ? '#ff7300' 
                            : COLORS[index % COLORS.length]
                        }}
                        suffix={`ativos (${((location.count / assetMetrics.totalAssets) * 100).toFixed(1)}%)`}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: '1rem' }}>
        <Col span={24}>
          <Card title={
            <Space>
              <span>Diagrama de Pareto: Detalhamento dos Problemas</span>
              {interactiveMode && <Tag color="orange">Clicável</Tag>}
            </Space>
          }>
            {detalhamentoChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart 
                  data={detalhamentoChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ 
                      angle: -45, 
                      textAnchor: 'end',
                      fill: (entry) => selectedDetalhamento === entry ? '#ff7300' : '#666'
                    }}
                    height={80}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke="#0088FE"
                    label={{ value: 'Frequência', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#FF8042" 
                    domain={[0, 100]}
                    label={{ value: 'Acumulado (%)', angle: 90, position: 'insideRight' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <RechartsTooltip formatter={(value, name) => name === '% Acumulada' ? `${value}%` : value} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    payload={[
                      { value: 'Frequência', type: 'rect', color: '#0088FE' },
                      { value: 'Acumulado', type: 'line', color: '#FF8042' }
                    ]}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#0088FE" 
                    name="Frequência" 
                    yAxisId="left"
                    onClick={interactiveMode ? (data) => handleDetalhamentoClick(data) : null}
                    style={getClickableStyle(interactiveMode)}
                  >
                    {detalhamentoChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-count-${index}`} 
                        fill={selectedDetalhamento === entry.name ? '#4A90E2' : '#0088FE'}
                        stroke={selectedDetalhamento === entry.name ? '#333' : '#fff'}
                        strokeWidth={selectedDetalhamento === entry.name ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="accumulatedPercentage"
                    stroke="#FF8042"
                    strokeWidth={2}
                    name="% Acumulada"
                    yAxisId="right"
                    dot={{ fill: '#FF8042', r: 4 }}
                    activeDot={{ r: 6, fill: '#FF8042' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Nenhum dado de detalhamento disponível" 
                style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DashboardGestaoDeAtivos;