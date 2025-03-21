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
  Empty
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
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';

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

// Funções de cálculo de métricas (podem ser movidas para um arquivo utils)
const calculateAssetMetrics = (filteredAssets) => {
  const totalAssets = filteredAssets.length;
  const inaptosAssets = filteredAssets.filter(a => a.situacao === "Inapto").length;
  const aptosAssets = filteredAssets.filter(a => a.situacao === "Apto").length;

  const modelosCount = {};
  filteredAssets.forEach((asset) => {
    modelosCount[asset.modelo] = (modelosCount[asset.modelo] || 0) + 1;
  });

  const modeloMaisComum = Object.keys(modelosCount).length > 0
    ? Object.keys(modelosCount).reduce((a, b) => 
        modelosCount[a] > modelosCount[b] ? a : b, '')
    : "N/A";

  // Calcular localizações mais comuns
  const locacoesCount = {};
  filteredAssets.forEach((asset) => {
    locacoesCount[asset.alocacao] = (locacoesCount[asset.alocacao] || 0) + 1;
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
    topLocations
  };
};

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

const DashboardGestaoDeAtivos = ({ assets, filteredAssets: initialFilteredAssets }) => {
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [dashboardAssets, setDashboardAssets] = useState(initialFilteredAssets);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#4A90E2"];

  // Efeito para filtrar assets com base nas localizações selecionadas
  useEffect(() => {
    if (selectedLocations.length === 0) {
      // Se nenhuma localização selecionada, mostrar todos os assets
      setDashboardAssets(initialFilteredAssets);
    } else {
      // Filtrar assets com base nas localizações selecionadas
      const filtered = initialFilteredAssets.filter(asset =>
        selectedLocations.includes(asset.alocacao)
      );
      setDashboardAssets(filtered);
    }
  }, [selectedLocations, initialFilteredAssets]);

  // Calcular métricas para os assets filtrados
  const assetMetrics = calculateAssetMetrics(dashboardAssets);
  const assetChartData = prepareAssetChartData(dashboardAssets);
  const categoryChartData = prepareCategoryChartData(dashboardAssets);
  const locationChartData = prepareLocationChartData(dashboardAssets);

  // Ordenar gráfico de localizações para melhor visualização
  const sortedLocationChartData = [...locationChartData].sort((a, b) => b.total - a.total);

  // Manipulador para alterar seleção de localização
  const handleLocationChange = (values) => {
    setSelectedLocations(values);
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
        <Col span={24}>
          <Card>
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
              {selectedLocations.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Filtrando por: </Text>
                  {selectedLocations.map(loc => (
                    <Tag key={loc} color="blue" style={{ marginRight: 4 }}>{loc}</Tag>
                  ))}
                </div>
              )}
            </Space>
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
              title="Modelo Mais Comum" 
              value={assetMetrics.modeloMaisComum}
              valueStyle={{ fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
        <Col xs={24} md={12}>
          <Card title="Distribuição de Ativos por Categoria">
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
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
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
          <Card title="Estado dos Ativos por Modelo">
            {assetChartData.length > 0 ? (
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
          <Card title="Distribuição de Ativos por Localização">
            {locationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={sortedLocationChartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="location" width={145} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="aptos" stackId="a" fill="#52c41a" name="Aptos" />
                  <Bar dataKey="inaptos" stackId="a" fill="#ff4d4f" name="Inaptos" />
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
                    <Card>
                      <Statistic 
                        title={location.name} 
                        value={location.count} 
                        valueStyle={{ color: COLORS[index % COLORS.length] }}
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
    </>
  );
};

export default DashboardGestaoDeAtivos;