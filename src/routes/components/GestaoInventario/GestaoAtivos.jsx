import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Table, 
  Tag, 
  Select, 
  Input 
} from 'antd';
import { 
  HistoryOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

// Função de cálculo de métricas (pode ser movida para utils)
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

export const GestaoAtivos = ({ 
  assets, 
  filteredAssets, 
  setFilteredAssets, 
  loadingAssets, 
  showAssetHistory 
}) => {
  const [modeloFilter, setModeloFilter] = useState("all");
  const [assetCategoryFilter, setAssetCategoryFilter] = useState("all");

  // Definição das colunas da tabela
  const assetsColumns = [
    {
      title: "Modelo",
      dataIndex: "modelo",
      key: "modelo",
    },
    {
      title: "Categoria",
      dataIndex: "categoria",
      key: "categoria",
    },
    {
      title: "RFID",
      dataIndex: "rfid",
      key: "rfid",
    },
    {
      title: "Serial Máquina",
      dataIndex: "serialMaquina",
      key: "serialMaquina",
    },
    {
      title: "Serial N",
      dataIndex: "serialN",
      key: "serialN",
    },
    {
      title: "Device Z",
      dataIndex: "deviceZ",
      key: "deviceZ",
    },
    {
      title: "Situação",
      dataIndex: "situacao",
      key: "situacao",
      render: (situacao) => {
        let color = "green";
        if (situacao !== "Apto") {
          color = "red";
        }
        return <Tag color={color}>{situacao}</Tag>;
      },
    },
    {
      title: "Alocação",
      dataIndex: "alocacao",
      key: "alocacao",
    },
    {
      title: "Histórico",
      key: "historico",
      render: (_, record) => (
        <a 
          onClick={() => showAssetHistory(record)}
          style={{ color: '#1890ff' }}
        >
          <HistoryOutlined /> Ver Histórico
        </a>
      ),
    },
  ];

  // Lógica de filtro
  const handleAssetSearch = (value) => {
    const filtered = assets.filter(
      (asset) =>
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
    if (assetCategoryFilter !== "all") {
      const filtered =
        value === "all"
          ? assets.filter((asset) => asset.categoria === assetCategoryFilter)
          : assets.filter(
              (asset) =>
                asset.modelo === value &&
                asset.categoria === assetCategoryFilter
            );
      setFilteredAssets(filtered);
    } else {
      const filtered =
        value === "all"
          ? assets
          : assets.filter((asset) => asset.modelo === value);
      setFilteredAssets(filtered);
    }
  };

  const handleAssetCategoryChange = (value) => {
    setAssetCategoryFilter(value);
    if (modeloFilter !== "all") {
      const filtered =
        value === "all"
          ? assets.filter((asset) => asset.modelo === modeloFilter)
          : assets.filter(
              (asset) =>
                asset.categoria === value && asset.modelo === modeloFilter
            );
      setFilteredAssets(filtered);
    } else {
      const filtered =
        value === "all"
          ? assets
          : assets.filter((asset) => asset.categoria === value);
      setFilteredAssets(filtered);
    }
  };

  // Calcular métricas
  const assetMetrics = calculateAssetMetrics(filteredAssets);

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
        <Col xs={24} md={8}>
          <Search
            placeholder="Buscar ativos"
            onSearch={handleAssetSearch}
            style={{ width: "100%" }}
            allowClear
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            style={{ width: "100%" }}
            placeholder="Filtrar por categoria"
            onChange={handleAssetCategoryChange}
            value={assetCategoryFilter}
            options={[
              { label: "Todas", value: "all" },
              ...Array.from(new Set(assets.map(a => a.categoria)))
                .map(cat => ({ label: cat, value: cat }))
            ]}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            style={{ width: "100%" }}
            placeholder="Filtrar por modelo"
            onChange={handleModeloChange}
            value={modeloFilter}
            options={[
              { label: "Todos", value: "all" },
              ...Array.from(new Set(assets.map(a => a.modelo)))
                .map(modelo => ({ label: modelo, value: modelo }))
            ]}
          />
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

      <Card title="Lista de Ativos" style={{ width: "100%" }}>
        <Table 
          columns={assetsColumns} 
          dataSource={filteredAssets}
          loading={loadingAssets}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>
    </>
  );
};

export default GestaoAtivos;