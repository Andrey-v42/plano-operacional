import React from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography,
  PieChart, 
  BarChart,
  LineChart,
  ResponsiveContainer 
} from 'antd';
import { 
  Pie, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';

const { Title } = Typography;

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

  return {
    totalAssets,
    inaptosAssets,
    aptosAssets,
    modeloMaisComum,
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

const Dashboard = ({ assets, filteredAssets }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const assetMetrics = calculateAssetMetrics(filteredAssets);
  const assetChartData = prepareAssetChartData(filteredAssets);
  const categoryChartData = prepareCategoryChartData(filteredAssets);

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
        <Col span={24}>
          <Title level={5}>Visão Geral dos Ativos</Title>
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
    </>
  );
};

export default Dashboard;