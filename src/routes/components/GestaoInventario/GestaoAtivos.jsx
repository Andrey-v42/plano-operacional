import React, { useState, useEffect } from 'react';
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

  return {
    totalAssets,
    inaptosAssets,
    aptosAssets,
    modeloMaisComum,
    tipoMaisComum
  };
};

export const GestaoAtivos = ({ 
  assets,
  setAssets, // This is causing the error when not passed
  filteredAssets, 
  setFilteredAssets, 
  loadingAssets,
  setLoadingAssets, // This may also cause an error if not passed
  showAssetHistory,
  pipeId
}) => {
  const handleSetAssets = setAssets || (() => {
    console.warn('setAssets not provided to GestaoAtivos component');
  });

  const handleSetLoadingAssets = setLoadingAssets || (() => {
    console.warn('setLoadingAssets not provided to GestaoAtivos component');
  });

  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [modeloFilter, setModeloFilter] = useState("all");
  const [adquirenciaFilter, setAdquirenciaFilter] = useState("all");

  // Definição das colunas da tabela
  const assetsColumns = [
    {
      title: "Categoria",
      dataIndex: "categoria",
      key: "categoria",
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
    },
    {
      title: "Modelo",
      dataIndex: "modelo",
      key: "modelo",
    },
    {
      title: "Adquirência",
      dataIndex: "adquirencia",
      key: "adquirencia",
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

  const fetchAssets = () => {
    handleSetLoadingAssets(true);
    
    const requestData = {
      url: `/ativos`
    };

    fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Falha ao buscar ativos');
        }
        return response.json();
      })
      .then(data => {
        // Transform the data to match component's expected structure
        const assetsData = data.docs.map(doc => ({
          id: doc.id,
          ...doc.data
        }));
        
        handleSetAssets(assetsData);
        setFilteredAssets(assetsData);
        handleSetLoadingAssets(false);
      })
      .catch(error => {
        console.error('Erro ao buscar ativos:', error);
        handleSetLoadingAssets(false);
      });
  };

  useEffect(() => {
    fetchAssets();
  }, [pipeId]);

  // Lógica de filtro
  const handleAssetSearch = (value) => {
    const filtered = assets.filter(
      (asset) =>
        asset.categoria.toLowerCase().includes(value.toLowerCase()) ||
        (asset.tipo && asset.tipo.toLowerCase().includes(value.toLowerCase())) ||
        asset.modelo.toLowerCase().includes(value.toLowerCase()) ||
        (asset.adquirencia && asset.adquirencia.toLowerCase().includes(value.toLowerCase())) ||
        asset.serialMaquina.toLowerCase().includes(value.toLowerCase()) ||
        asset.serialN.toLowerCase().includes(value.toLowerCase()) ||
        asset.rfid.toLowerCase().includes(value.toLowerCase()) ||
        asset.deviceZ.toLowerCase().includes(value.toLowerCase()) ||
        asset.alocacao.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAssets(filtered);
  };

  const applyFilters = () => {
    let filtered = [...assets];
    
    // Aplicar filtro de categoria
    if (categoriaFilter !== "all") {
      filtered = filtered.filter(asset => asset.categoria === categoriaFilter);
    }
    
    // Aplicar filtro de tipo
    if (tipoFilter !== "all") {
      filtered = filtered.filter(asset => asset.tipo === tipoFilter);
    }
    
    // Aplicar filtro de modelo
    if (modeloFilter !== "all") {
      filtered = filtered.filter(asset => asset.modelo === modeloFilter);
    }
    
    // Aplicar filtro de adquirência
    if (adquirenciaFilter !== "all") {
      filtered = filtered.filter(asset => asset.adquirencia === adquirenciaFilter);
    }
    
    setFilteredAssets(filtered);
  };

  const handleCategoriaChange = (value) => {
    setCategoriaFilter(value);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };
  
  const handleTipoChange = (value) => {
    setTipoFilter(value);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const handleModeloChange = (value) => {
    setModeloFilter(value);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const handleAdquirenciaChange = (value) => {
    setAdquirenciaFilter(value);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  useEffect(() => {
    applyFilters();
  }, [categoriaFilter, tipoFilter, modeloFilter, adquirenciaFilter]);

  // Calcular métricas
  const assetMetrics = calculateAssetMetrics(filteredAssets);

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
        <Col xs={24} md={6}>
          <Search
            placeholder="Buscar ativos"
            onSearch={handleAssetSearch}
            style={{ width: "100%" }}
            allowClear
          />
        </Col>
        <Col xs={24} md={18}>
          <Row gutter={[8, 8]}>
            <Col xs={24} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filtrar por categoria"
                onChange={handleCategoriaChange}
                value={categoriaFilter}
                options={[
                  { label: "Todas", value: "all" },
                  ...Array.from(new Set(assets.map(a => a.categoria)))
                    .filter(Boolean)
                    .map(cat => ({ label: cat, value: cat }))
                ]}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filtrar por tipo"
                onChange={handleTipoChange}
                value={tipoFilter}
                options={[
                  { label: "Todos", value: "all" },
                  ...Array.from(new Set(assets.map(a => a.tipo)))
                    .filter(Boolean)
                    .map(tipo => ({ label: tipo, value: tipo }))
                ]}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filtrar por modelo"
                onChange={handleModeloChange}
                value={modeloFilter}
                options={[
                  { label: "Todos", value: "all" },
                  ...Array.from(new Set(assets.map(a => a.modelo)))
                    .filter(Boolean)
                    .map(modelo => ({ label: modelo, value: modelo }))
                ]}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filtrar por adquirência"
                onChange={handleAdquirenciaChange}
                value={adquirenciaFilter}
                options={[
                  { label: "Todas", value: "all" },
                  ...Array.from(new Set(assets.map(a => a.adquirencia)))
                    .filter(Boolean)
                    .map(adq => ({ label: adq, value: adq }))
                ]}
              />
            </Col>
          </Row>
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
              title="Tipo Mais Comum" 
              value={assetMetrics.tipoMaisComum}
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