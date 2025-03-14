import React, { useState, useEffect } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  DatePicker,
  Select,
  Typography,
  Table,
  Tag,
  Input,
  Button,
  Form,
  Space,
  notification,
  Badge,
  Tabs,
  Modal,
  Timeline,
  Divider,
  Pagination,
  Transfer,
  Tree,
  theme,
  Alert,
} from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  PlusOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SmileOutlined,
  HistoryOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { TabPane } = Tabs;
// Componente de TreeTransfer customizado
const isChecked = (selectedKeys, eventKey) => selectedKeys.includes(eventKey);

const generateTree = (treeNodes = [], checkedKeys = []) =>
  treeNodes.map(({ children, ...props }) => ({
    ...props,
    disabled: checkedKeys.includes(props.key),
    children: generateTree(children, checkedKeys),
  }));

const TreeTransfer = ({ dataSource, targetKeys = [], ...restProps }) => {
  const { token } = theme.useToken();
  const transferDataSource = [];

  function flatten(list = []) {
    list.forEach((item) => {
      transferDataSource.push(item);
      flatten(item.children);
    });
  }

  flatten(dataSource);

  return (
    <Transfer
      {...restProps}
      targetKeys={targetKeys}
      dataSource={transferDataSource}
      className="tree-transfer"
      render={(item) => item.title}
      showSelectAll={false}
      listStyle={{
        width: "45%",
        height: 400,
      }}
    >
      {({ direction, onItemSelect, selectedKeys }) => {
        if (direction === "left") {
          const checkedKeys = [...selectedKeys, ...targetKeys];
          return (
            <div style={{ padding: token.paddingXS }}>
              <Tree
                blockNode
                checkable
                checkStrictly
                defaultExpandAll
                checkedKeys={checkedKeys}
                treeData={generateTree(dataSource, targetKeys)}
                onCheck={(_, { node: { key } }) => {
                  onItemSelect(key, !isChecked(checkedKeys, key));
                }}
                onSelect={(_, { node: { key } }) => {
                  onItemSelect(key, !isChecked(checkedKeys, key));
                }}
              />
            </div>
          );
        }
        // Renderizar os itens do lado direito em formato de lista
        return null;
      }}
    </Transfer>
  );
};
const GestaoInventario = () => {
  // Estado para as abas
  const [activeTab, setActiveTab] = useState("1");

  // Estados para o Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [historyPageSize] = useState(5);

  // =================== ATIVOS ===================
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [modeloFilter, setModeloFilter] = useState("all");
  const [assetCategoryFilter, setAssetCategoryFilter] = useState("all");

  // =================== MOVIMENTAÇÃO DE ESTOQUE ===================
  const [searchParams] = useSearchParams();
  const pipeId = searchParams.get("pipeId") || "sem-os";
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [allocatedAssets, setAllocatedAssets] = useState([]);
  const [loadingAllocated, setLoadingAllocated] = useState(false);

  // Compartilhado
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    fetchAssets();
    fetchAllocatedAssets();
  }, []);
  // =================== FUNÇÕES DE ATIVOS ===================
  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      // Mock API call
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            data: [
              {
                id: 1,
                modelo: "Pag P2",
                categoria: "Máquina",
                rfid: "RF7890123",
                serialMaquina: "GT2023001",
                serialN: "SN12345678",
                deviceZ: "DZ-001",
                situacao: "Apto",
                detalhamento: "Em perfeito estado",
                alocacao: "Matriz",
                // Histórico fictício para o modal
                historico: [
                  {
                    data: "2025-02-18 11:30",
                    destino: "Evento",
                    nomeDestino: "Festival de Música",
                    os: "11111",
                    motivo: "Evento especial",
                    responsavel: "Luiz Siqueira",
                  },
                  // ... outros itens de histórico
                ],
              },
              // ... outros assets
            ],
          });
        }, 1000)
      );
      setAssets(response.data);
      setFilteredAssets(response.data);
    } catch (error) {
      openNotificationFailure("Erro ao carregar ativos");
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
    const inaptosAssets = filteredAssets.filter(
      (a) => a.situacao === "Inapto"
    ).length;
    const aptosAssets = filteredAssets.filter(
      (a) => a.situacao === "Apto"
    ).length;

    const modelosCount = {};
    filteredAssets.forEach((asset) => {
      modelosCount[asset.modelo] = (modelosCount[asset.modelo] || 0) + 1;
    });

    const modeloMaisComum =
      Object.keys(modelosCount).length > 0
        ? Object.keys(modelosCount).reduce(
            (a, b) => (modelosCount[a] > modelosCount[b] ? a : b),
            ""
          )
        : "N/A";

    return {
      totalAssets,
      inaptosAssets,
      aptosAssets,
      modeloMaisComum,
    };
  };

  const prepareAssetChartData = () => {
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

  const prepareCategoryChartData = () => {
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
  // =================== FUNÇÕES DE MOVIMENTAÇÃO DE ESTOQUE ===================
  const fetchAllocatedAssets = async () => {
    setLoadingAllocated(true);
    try {
      // Mock API call para buscar ativos já alocados neste pipeId
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          // Simulando que o ativo com ID 1 está alocado para este pipeId
          if (pipeId === "teste1234") {
            resolve({
              data: [
                {
                  id: 1,
                  modelo: "Gertec MP35",
                  categoria: "POS",
                  rfid: "RF7890123",
                  serialMaquina: "GT2023001",
                  serialN: "SN12345678",
                  deviceZ: "DZ-001",
                  situacao: "Apto",
                  detalhamento: "Em perfeito estado",
                  alocacao: pipeId,
                },
              ],
            });
          } else {
            resolve({ data: [] });
          }
        }, 1000)
      );

      setAllocatedAssets(response.data);

      // Atualizar targetKeys com os IDs dos ativos já alocados
      const allocatedKeys = response.data.map((asset) => asset.id.toString());
      setTargetKeys(allocatedKeys);
    } catch (error) {
      openNotificationFailure("Erro ao carregar ativos alocados");
    }
    setLoadingAllocated(false);
  };

  const handleSearch = () => {
    if (!searchValue.trim()) {
      return;
    }

    setIsSearching(true);

    // Simulação de busca
    setTimeout(() => {
      const results = assets.filter(
        (asset) =>
          asset.rfid.toLowerCase().includes(searchValue.toLowerCase()) ||
          asset.serialMaquina
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          asset.serialN.toLowerCase().includes(searchValue.toLowerCase()) ||
          asset.deviceZ.toLowerCase().includes(searchValue.toLowerCase())
      );

      setSearchResults(results);
      setIsSearching(false);

      if (results.length === 0) {
        api.info({
          message: "Busca",
          description: "Nenhum ativo encontrado com os parâmetros informados.",
        });
      }
    }, 800);
  };

  const handleAssetSelect = (asset) => {
    // Verificar se o ativo já está selecionado
    if (!selectedAssets.some((item) => item.id === asset.id)) {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  const handleAssetDeselect = (assetId) => {
    setSelectedAssets(selectedAssets.filter((asset) => asset.id !== assetId));
  };

  const handleTransferChange = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);

    // Simulação de salvamento na API
    setTimeout(() => {
      const movingToTarget = nextTargetKeys.filter(
        (key) => !targetKeys.includes(key)
      );
      const movingFromTarget = targetKeys.filter(
        (key) => !nextTargetKeys.includes(key)
      );

      if (movingToTarget.length > 0) {
        openNotificationSucess(
          `${movingToTarget.length} ativo(s) alocado(s) para a OS ${pipeId}`
        );
      }

      if (movingFromTarget.length > 0) {
        openNotificationSucess(
          `${movingFromTarget.length} ativo(s) devolvido(s) ao estoque`
        );
      }

      // Atualizar os ativos alocados
      const updatedAllocatedAssets = assets.filter((asset) =>
        nextTargetKeys.includes(asset.id.toString())
      );
      setAllocatedAssets(updatedAllocatedAssets);
    }, 1000);
  };
  // Converter os ativos para o formato esperado pelo TreeTransfer
  const convertAssetsToTreeData = () => {
    // Agrupar por categoria
    const categoriesMap = {};

    // Considerar tanto os ativos selecionados manualmente quanto os já alocados
    const assetsToShow = [...selectedAssets];

    // Adicionar os ativos alocados apenas se não estiverem já nos selecionados
    allocatedAssets.forEach((allocatedAsset) => {
      if (!assetsToShow.some((asset) => asset.id === allocatedAsset.id)) {
        assetsToShow.push(allocatedAsset);
      }
    });

    assetsToShow.forEach((asset) => {
      if (!categoriesMap[asset.categoria]) {
        categoriesMap[asset.categoria] = {
          key: `cat-${asset.categoria}`,
          title: asset.categoria,
          children: [],
        };
      }

      categoriesMap[asset.categoria].children.push({
        key: asset.id.toString(),
        title: `${asset.modelo} - ${asset.serialMaquina} (${asset.rfid})`,
        asset: asset,
      });
    });

    return Object.values(categoriesMap);
  };
  const treeData = convertAssetsToTreeData();

  // Colunas para os resultados de busca da movimentação de estoque
  const searchResultsColumns = [
    {
      title: "Modelo",
      dataIndex: "modelo",
      key: "modelo",
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
      title: "Ação",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleAssetSelect(record)}
          disabled={
            selectedAssets.some((asset) => asset.id === record.id) ||
            targetKeys.includes(record.id.toString())
          }
        >
          {selectedAssets.some((asset) => asset.id === record.id)
            ? "Selecionado"
            : targetKeys.includes(record.id.toString())
            ? "Já Alocado"
            : "Selecionar"}
        </Button>
      ),
    },
  ];
  // =================== FUNÇÕES COMPARTILHADAS ===================
  const openNotificationSucess = (text) => {
    api.open({
      message: "Sucesso",
      description: text,
      icon: <SmileOutlined style={{ color: "#52c41a" }} />,
    });
  };

  const openNotificationFailure = (text) => {
    api.open({
      message: "Erro",
      description: text,
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
    });
  };

  // =================== CÁLCULO DE MÉTRICAS E DADOS DE GRÁFICOS ===================
  const assetMetrics = calculateAssetMetrics();
  const assetChartData = prepareAssetChartData();
  const categoryChartData = prepareCategoryChartData();

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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
          </Button>,
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
              <Tag color={currentAsset.situacao === "Apto" ? "green" : "red"}>
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
          items={paginatedHistory.map((item) => ({
            label: item.data,
            children: (
              <Card size="small" style={{ marginBottom: "10px" }}>
                <p>
                  <strong>Destino:</strong> {item.destino}{" "}
                  {item.nomeDestino ? `- ${item.nomeDestino}` : ""}
                </p>
                <p>
                  <strong>OS:</strong> {item.os}
                </p>
                <p>
                  <strong>Motivo:</strong> {item.motivo}
                </p>
                <p>
                  <strong>Responsável:</strong> {item.responsavel}
                </p>
              </Card>
            ),
          }))}
        />

        {totalHistoryItems > historyPageSize && (
          <div
            style={{
              textAlign: "center",
              marginTop: "15px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              type="text"
              icon={<span>&#8249;</span>}
              disabled={currentHistoryPage === 1}
              onClick={() => handleHistoryPageChange(currentHistoryPage - 1)}
              style={{ fontSize: "18px" }}
            />
            <div
              style={{
                margin: "0 10px",
                border: "1px solid #d9d9d9",
                borderRadius: "2px",
                padding: "4px 15px",
                minWidth: "32px",
                textAlign: "center",
                color: "#1890ff",
              }}
            >
              {currentHistoryPage}
            </div>
            <Button
              type="text"
              icon={<span>&#8250;</span>}
              disabled={
                currentHistoryPage ===
                Math.ceil(totalHistoryItems / historyPageSize)
              }
              onClick={() => handleHistoryPageChange(currentHistoryPage + 1)}
              style={{ fontSize: "18px" }}
            />
          </div>
        )}
      </Modal>
    );
  };
  // =================== RENDERIZAÇÃO PRINCIPAL ===================
  return (
    <div style={{ padding: "20px" }}>
      {contextHolder}
  
      <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
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
        style={{ marginBottom: "20px" }}
      >
        <TabPane tab="Dashboard" key="1">
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
        </TabPane>
  
        <TabPane tab="Gestão de Ativos" key="2">
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
                defaultValue="all"
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
                defaultValue="all"
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
        </TabPane>
  
        <TabPane tab="Cadastro de Ativos" key="3">
          <Card title="Cadastrar Novo Ativo" style={{ width: "100%" }}>
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
  
        <TabPane tab="Movimentação de Estoque" key="4">
          <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
            <Col span={24}>
              <Alert
                message={`Movimentação de Estoque - OS: ${pipeId}`}
                description="Utilize este módulo para alocar ou devolver ativos para a OS atual. Busque os ativos pelo RFID, Serial da Máquina, Serial N ou Device Z."
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            </Col>
          </Row>
          
          <Card title="Buscar Ativos" style={{ marginBottom: '20px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={16}>
                <Input 
                  placeholder="Digite RFID, Serial da Máquina, Serial N ou Device Z" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onPressEnter={handleSearch}
                />
              </Col>
              <Col xs={24} md={8}>
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />} 
                  onClick={handleSearch}
                  loading={isSearching}
                  style={{ width: '100%' }}
                >
                  Buscar
                </Button>
              </Col>
            </Row>
            
            {searchResults.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <Title level={5}>Resultados da Busca</Title>
                <Table 
                  dataSource={searchResults}
                  columns={searchResultsColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </div>
            )}
            
            {selectedAssets.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <Row justify="space-between">
                  <Col>
                    <Title level={5}>Ativos Selecionados para Movimentação</Title>
                  </Col>
                  <Col>
                    <Button 
                      danger 
                      onClick={() => setSelectedAssets([])}
                    >
                      Limpar Seleção
                    </Button>
                  </Col>
                </Row>
                <Table 
                  dataSource={selectedAssets}
                  columns={[
                    ...searchResultsColumns.slice(0, searchResultsColumns.length - 1),
                    {
                      title: 'Ação',
                      key: 'action',
                      render: (_, record) => (
                        <Button 
                          danger 
                          onClick={() => handleAssetDeselect(record.id)}
                        >
                          Remover
                        </Button>
                      ),
                    }
                  ]}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </Card>
          
          <Card 
            title={`Movimentação de Ativos - OS: ${pipeId}`}
            loading={loadingAllocated}
          >
            <Alert
              message="Instruções de Uso"
              description={
                <div>
                  <p>• Lado <strong>esquerdo:</strong> ativos disponíveis para alocação na OS.</p>
                  <p>• Lado <strong>direito:</strong> ativos já alocados na OS.</p>
      <p>• Use as setas para mover os ativos entre as listas.</p>
                  <p>• As mudanças são salvas automaticamente.</p>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            
            {treeData.length > 0 ? (
              <TreeTransfer
                dataSource={treeData}
                targetKeys={targetKeys}
                onChange={handleTransferChange}
                titles={['Ativos Disponíveis', `Ativos Alocados na OS ${pipeId}`]}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">
                  Nenhum ativo selecionado ou já alocado nesta OS. 
                  Utilize a busca acima para encontrar e selecionar ativos.
                </Text>
              </div>
            )}
            
            {targetKeys.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <Alert
                  message={`${targetKeys.length} ativo(s) alocado(s) na OS ${pipeId}`}
                  type="success"
                  showIcon
                />
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
  
      {/* Modal de histórico - renderizado apenas quando visível */}
      <HistoryModal />
    </div>
  );
}

export default GestaoInventario;