import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Table,
  Tag,
  Select,
  Input,
  Button,
  Space,
  Tooltip,
  Modal,
  Form,
  Popconfirm,
  message,
  ConfigProvider // Adicione esta importação
} from "antd";
import { 
  HistoryOutlined,
  DeleteOutlined,
  EditOutlined,
  ImportOutlined,
  ExportOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import * as XLSX from "xlsx";

// Component destructuring
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

// Helper functions
const safeString = (value) => {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : String(value);
};

const calculateAssetMetrics = (filteredAssets) => {
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

  const tiposCount = {};
  filteredAssets.forEach((asset) => {
    if (asset.tipo) {
      tiposCount[asset.tipo] = (tiposCount[asset.tipo] || 0) + 1;
    }
  });

  const tipoMaisComum =
    Object.keys(tiposCount).length > 0
      ? Object.keys(tiposCount).reduce(
          (a, b) => (tiposCount[a] > tiposCount[b] ? a : b),
          ""
        )
      : "N/A";

  return {
    totalAssets,
    inaptosAssets,
    aptosAssets,
    modeloMaisComum,
    tipoMaisComum,
  };
};

// Main component
export const GestaoAtivos = ({
  assets,
  setAssets,
  filteredAssets,
  setFilteredAssets,
  loadingAssets,
  setLoadingAssets,
  showAssetHistory,
  pipeId,
  openNotificationSucess,
  openNotificationFailure,
}) => {
  // Default handlers for optional props
  const handleSetAssets =
    setAssets ||
    (() => {
      console.warn("setAssets not provided to GestaoAtivos component");
    });

  const handleSetLoadingAssets =
    setLoadingAssets ||
    (() => {
      console.warn("setLoadingAssets not provided to GestaoAtivos component");
    });

  const showSuccessNotification =
    openNotificationSucess || ((msg) => message.success(msg));
  const showErrorNotification =
    openNotificationFailure || ((msg) => message.error(msg));

  // State management
  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [modeloFilter, setModeloFilter] = useState("all");
  const [adquirenciaFilter, setAdquirenciaFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentEditAsset, setCurrentEditAsset] = useState(null);
  const [editForm] = Form.useForm();

  // Data fetching
  const fetchAssets = () => {
    handleSetLoadingAssets(true);

    const requestData = {
      url: `/ativos`,
    };

    fetch(
      "https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha ao buscar ativos");
        }
        return response.json();
      })
      .then((data) => {
        const assetsData = data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data,
        }));

        handleSetAssets(assetsData);
        setFilteredAssets(assetsData);
        handleSetLoadingAssets(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar ativos:", error);
        handleSetLoadingAssets(false);
        showErrorNotification("Erro ao carregar ativos");
      });
  };

  useEffect(() => {
    fetchAssets();
  }, [pipeId]);

  // Filtering logic
  const applyAllFilters = () => {
    if (!assets || !assets.length) return;

    let filtered = [...assets];

    // Apply text search filter
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          safeString(asset.categoria).toLowerCase().includes(lowerSearchText) ||
          safeString(asset.tipo).toLowerCase().includes(lowerSearchText) ||
          safeString(asset.modelo).toLowerCase().includes(lowerSearchText) ||
          safeString(asset.adquirencia)
            .toLowerCase()
            .includes(lowerSearchText) ||
          safeString(asset.serialMaquina)
            .toLowerCase()
            .includes(lowerSearchText) ||
          safeString(asset.serialN).toLowerCase().includes(lowerSearchText) ||
          safeString(asset.rfid).toLowerCase().includes(lowerSearchText) ||
          safeString(asset.deviceZ).toLowerCase().includes(lowerSearchText) ||
          safeString(asset.alocacao).toLowerCase().includes(lowerSearchText)
      );
    }

    // Apply category filter
    if (categoriaFilter !== "all") {
      filtered = filtered.filter(
        (asset) => asset.categoria === categoriaFilter
      );
    }

    // Apply type filter
    if (tipoFilter !== "all") {
      filtered = filtered.filter((asset) => asset.tipo === tipoFilter);
    }

    // Apply model filter
    if (modeloFilter !== "all") {
      filtered = filtered.filter((asset) => asset.modelo === modeloFilter);
    }

    // Apply acquisition filter
    if (adquirenciaFilter !== "all") {
      filtered = filtered.filter(
        (asset) => asset.adquirencia === adquirenciaFilter
      );
    }

    // Clear selections when filters change
    setSelectedRowKeys([]);
    setSelectedRows([]);

    setFilteredAssets(filtered);
  };

  useEffect(() => {
    if (assets && assets.length > 0) {
      applyAllFilters();
    }
  }, [
    searchText,
    categoriaFilter,
    tipoFilter,
    modeloFilter,
    adquirenciaFilter,
    assets,
  ]);

  // Event handlers
  const handleAssetSearch = (value) => {
    setSearchText(value);
  };

  const handleCategoriaChange = (value) => {
    setCategoriaFilter(value);
  };

  const handleTipoChange = (value) => {
    setTipoFilter(value);
  };

  const handleModeloChange = (value) => {
    setModeloFilter(value);
  };

  const handleAdquirenciaChange = (value) => {
    setAdquirenciaFilter(value);
  };

  const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "select-aptos",
        text: "Selecionar Todos Aptos",
        onSelect: () => {
          const aptosKeys = filteredAssets
            .filter((asset) => asset.situacao === "Apto")
            .map((asset) => asset.id);
          setSelectedRowKeys(aptosKeys);
          setSelectedRows(
            filteredAssets.filter((asset) => asset.situacao === "Apto")
          );
        },
      },
      {
        key: "select-inaptos",
        text: "Selecionar Todos Inaptos",
        onSelect: () => {
          const inaptosKeys = filteredAssets
            .filter((asset) => asset.situacao === "Inapto")
            .map((asset) => asset.id);
          setSelectedRowKeys(inaptosKeys);
          setSelectedRows(
            filteredAssets.filter((asset) => asset.situacao === "Inapto")
          );
        },
      },
    ],
  };

  // Asset operations
  const handleExportSelected = () => {
    // Create Excel spreadsheet for export
    const exportData = selectedRows.map((asset) => ({
      Categoria: asset.categoria || "",
      Tipo: asset.tipo || "",
      Modelo: asset.modelo || "",
      Adquirência: asset.adquirencia || "",
      RFID: asset.rfid || "",
      "Serial Máquina": asset.serialMaquina || "",
      "Serial N": asset.serialN || "",
      "Device Z": asset.deviceZ || "",
      Situação: asset.situacao || "",
      Detalhamento: asset.detalhamento || "",
      Alocação: asset.alocacao || "",
    }));

    // Create workbook and add data
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Adjust column widths
    ws["!cols"] = [
      { width: 12 }, // Categoria
      { width: 12 }, // Tipo
      { width: 15 }, // Modelo
      { width: 12 }, // Adquirência
      { width: 12 }, // RFID
      { width: 15 }, // Serial Máquina
      { width: 12 }, // Serial N
      { width: 12 }, // Device Z
      { width: 10 }, // Situação
      { width: 25 }, // Detalhamento
      { width: 25 }, // Alocação
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Ativos");

    // Generate and download the file
    XLSX.writeFile(wb, "ativos_exportados.xlsx");

    showSuccessNotification(
      `${selectedRows.length} ativos exportados com sucesso!`
    );
  };

  const handleMoveSelected = () => {
    Modal.info({
      title: "Movimentação de Ativos",
      content: (
        <div>
          <p>Movendo {selectedRows.length} ativos selecionados.</p>
          <p>
            Esta funcionalidade seria implementada no componente de movimentação
            de estoque.
          </p>
        </div>
      ),
    });
  };

  const handleDeleteAsset = (asset) => {
    confirm({
      title: "Tem certeza que deseja excluir este ativo?",
      icon: <ExclamationCircleOutlined />,
      content: `Você está prestes a excluir o ativo com serial ${asset.serialN || asset.serialMaquina || "desconhecido"}. Esta ação não pode ser desfeita.`,
      okText: "Sim",
      okType: "danger",
      cancelText: "Não",
      onOk() {
        // Iniciar o loading
        handleSetLoadingAssets(true);
        
        // Verificar se temos um ID válido
        const docId = asset.id || asset.serialMaquina;
        
        if (!docId) {
          showErrorNotification("Erro: ID do ativo não encontrado");
          handleSetLoadingAssets(false);
          return;
        }
  
        const requestData = {
          collectionURL: `/ativos`,
          docId: docId,
        };
  
        console.log("Enviando requisição para excluir ativo:", requestData);
  
        // Adicionar um timeout para a requisição
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
  
        fetch(
          "https://southamerica-east1-zops-mobile.cloudfunctions.net/deleteDoc",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Adicionar headers de autenticação se necessário
              // "Authorization": "Bearer YOUR_TOKEN"
            },
            body: JSON.stringify(requestData),
            signal: controller.signal,
            // Adicionar opções de CORS se necessário
            mode: "cors",
            credentials: "include"
          }
        )
          .then((response) => {
            clearTimeout(timeoutId);
            
            console.log("Resposta recebida:", response);
            
            if (!response.ok) {
              return response.text().then(text => {
                throw new Error(`Falha ao excluir ativo: ${response.status} ${response.statusText} - ${text}`);
              });
            }
            
            return response.json();
          })
          .then((data) => {
            console.log("Ativo excluído com sucesso:", data);
            
            // Atualizar o estado local removendo o ativo
            const updatedAssets = assets.filter((item) => item.id !== asset.id);
            handleSetAssets(updatedAssets);
            
            // Atualizar os ativos filtrados
            setFilteredAssets(
              filteredAssets.filter((item) => item.id !== asset.id)
            );
  
            handleSetLoadingAssets(false);
            showSuccessNotification("Ativo excluído com sucesso!");
          })
          .catch((error) => {
            console.error("Erro ao excluir ativo:", error);
            
            // Fallback para o caso de problema com o servidor:
            // Você pode decidir atualizar a UI mesmo com o erro
            if (window.confirm("Falha na comunicação com o servidor. Deseja remover o item da lista mesmo assim?")) {
              const updatedAssets = assets.filter((item) => item.id !== asset.id);
              handleSetAssets(updatedAssets);
              setFilteredAssets(
                filteredAssets.filter((item) => item.id !== asset.id)
              );
              showSuccessNotification("Ativo removido da lista local");
            } else {
              showErrorNotification(`Erro ao excluir ativo: ${error.message}`);
            }
            
            handleSetLoadingAssets(false);
          });
      },
      onCancel() {
        console.log("Exclusão cancelada pelo usuário");
      },
    });
  };

  const handleEditAsset = (asset) => {
    setCurrentEditAsset(asset);
    editForm.setFieldsValue({
      categoria: asset.categoria,
      tipo: asset.tipo,
      modelo: asset.modelo,
      adquirencia: asset.adquirencia,
      rfid: asset.rfid,
      serialN: asset.serialN,
      deviceZ: asset.deviceZ,
      situacao: asset.situacao,
      detalhamento: asset.detalhamento,
      alocacao: asset.alocacao,
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleEditSubmit = (values) => {
    if (!currentEditAsset) return;

    // Get current date for history
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    // Generate change description
    const changesDescription = Object.keys(values)
      .filter(
        (key) =>
          values[key] !== currentEditAsset[key] && key !== "serialMaquina"
      )
      .map((key) => `${key}: ${currentEditAsset[key]} → ${values[key]}`)
      .join(", ");

    // Prepare updated history
    const historicoAtualizado = [
      {
        data: formattedDate,
        destino: "Sistema",
        nomeDestino: "Edição de dados",
        os: "N/A",
        motivo: "Atualização de informações",
        responsavel: "Usuário",
        detalhes: `Campos alterados: ${changesDescription}`,
      },
      ...(currentEditAsset.historico || []),
    ];

    // Prepare updated object
    const updatedAsset = {
      ...currentEditAsset,
      ...values,
      historico: historicoAtualizado,
    };

    // Prepare API data
    const requestData = {
      collectionURL: `/ativos`,
      docId: currentEditAsset.serialMaquina,
      formData: updatedAsset,
    };

    // Call API to update the asset
    fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha ao atualizar ativo");
        }

        // Update local state
        const newAssets = assets.map((item) =>
          item.id === currentEditAsset.id ? updatedAsset : item
        );

        handleSetAssets(newAssets);
        setFilteredAssets(
          newAssets.filter((item) =>
            filteredAssets.some((filteredAsset) => filteredAsset.id === item.id)
          )
        );

        setIsEditModalVisible(false);
        showSuccessNotification("Ativo atualizado com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao atualizar ativo:", error);
        showErrorNotification("Erro ao atualizar ativo");
      });
  };

  // Table columns definition
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
      title: "Ações",
      key: "acoes",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver Histórico">
            <Button
              type="link"
              icon={<HistoryOutlined />}
              onClick={() => showAssetHistory(record)}
              style={{ padding: 0 }}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditAsset(record)}
              style={{ padding: 0 }}
            />
          </Tooltip>
          <Tooltip title="Excluir">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteAsset(record)}
              style={{ padding: 0 }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate metrics
  const assetMetrics = calculateAssetMetrics(filteredAssets || []);

// Component rendering
return (
  <ConfigProvider locale={{
    locale: 'pt-BR',
    Table: {
      filterTitle: 'Filtro',
      filterConfirm: 'OK',
      filterReset: 'Resetar',
      filterEmptyText: 'Sem filtros',
      emptyText: 'Sem dados',
      selectAll: 'Selecionar página atual',
      selectInvert: 'Inverter seleção',
      selectNone: 'Limpar seleção',
      selectionAll: 'Selecionar todos',
      sortTitle: 'Ordenar',
      expand: 'Expandir linha',
      collapse: 'Colapsar linha',
    },
    Modal: {
      okText: 'OK',
      cancelText: 'Cancelar',
      justOkText: 'OK',
    },
    Popconfirm: {
      okText: 'OK',
      cancelText: 'Cancelar',
    },
    Transfer: {
      titles: ['', ''],
      searchPlaceholder: 'Buscar',
      itemUnit: 'item',
      itemsUnit: 'itens',
    },
    Upload: {
      uploading: 'Enviando...',
      removeFile: 'Remover arquivo',
      uploadError: 'Erro no envio',
      previewFile: 'Visualizar arquivo',
      downloadFile: 'Baixar arquivo',
    },
    Empty: {
      description: 'Não há dados',
    },
    Form: {
      optional: '(opcional)',
      defaultValidateMessages: {
        default: 'Erro de validação para o campo ${label}',
        required: '${label} é obrigatório',
        enum: '${label} deve ser um dos seguintes [${enum}]',
        whitespace: '${label} não pode ser um espaço em branco',
        date: {
          format: '${label} formato de data inválido',
          parse: '${label} não pode ser convertido para uma data',
          invalid: '${label} é uma data inválida',
        },
        types: {
          string: '${label} não é um ${type} válido',
          method: '${label} não é um ${type} válido',
          array: '${label} não é um ${type} válido',
          object: '${label} não é um ${type} válido',
          number: '${label} não é um ${type} válido',
          date: '${label} não é um ${type} válido',
          boolean: '${label} não é um ${type} válido',
          integer: '${label} não é um ${type} válido',
          float: '${label} não é um ${type} válido',
          regexp: '${label} não é um ${type} válido',
          email: '${label} não é um ${type} válido',
          url: '${label} não é um ${type} válido',
          hex: '${label} não é um ${type} válido',
        },
        string: {
          len: '${label} deve ter ${len} caracteres',
          min: '${label} deve ter pelo menos ${min} caracteres',
          max: '${label} deve ter no máximo ${max} caracteres',
          range: '${label} deve ter entre ${min} e ${max} caracteres',
        },
        number: {
          len: '${label} deve ser igual a ${len}',
          min: '${label} deve ser no mínimo ${min}',
          max: '${label} deve ser no máximo ${max}',
          range: '${label} deve estar entre ${min} e ${max}',
        },
        array: {
          len: '${label} deve ter ${len} itens',
          min: '${label} deve ter pelo menos ${min} itens',
          max: '${label} deve ter no máximo ${max} itens',
          range: '${label} deve ter entre ${min} e ${max} itens',
        },
        pattern: {
          mismatch: '${label} não corresponde ao padrão ${pattern}',
        },
      },
    },
    Pagination: {
      items_per_page: 'itens / página',
      jump_to: 'Ir para',
      jump_to_confirm: 'confirmar',
      page: 'Página',
      prev_page: 'Página anterior',
      next_page: 'Próxima página',
      prev_5: '5 páginas anteriores',
      next_5: '5 próximas páginas',
      prev_3: '3 páginas anteriores',
      next_3: '3 próximas páginas',
    },
  }}>
    {/* Search and filter section */}
    <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
      <Col xs={24} md={6}>
        <Search
          placeholder="Buscar ativos"
          onSearch={handleAssetSearch}
          onChange={(e) => handleAssetSearch(e.target.value)}
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
                ...Array.from(new Set((assets || []).map((a) => a.categoria)))
                  .filter(Boolean)
                  .map((cat) => ({ label: cat, value: cat })),
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
                ...Array.from(new Set((assets || []).map((a) => a.tipo)))
                  .filter(Boolean)
                  .map((tipo) => ({ label: tipo, value: tipo })),
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
                ...Array.from(new Set((assets || []).map((a) => a.modelo)))
                  .filter(Boolean)
                  .map((modelo) => ({ label: modelo, value: modelo })),
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
                ...Array.from(
                  new Set((assets || []).map((a) => a.adquirencia))
                )
                  .filter(Boolean)
                  .map((adq) => ({ label: adq, value: adq })),
              ]}
            />
          </Col>
        </Row>
      </Col>
    </Row>

    {/* Statistics cards */}
    <Row gutter={[16, 16]} style={{ marginBottom: "1rem" }}>
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
            title="Ativos Aptos"
            value={assetMetrics.aptosAssets}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Ativos Inaptos"
            value={assetMetrics.inaptosAssets}
            valueStyle={{ color: "#ff4d4f" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Tipo Mais Comum"
            value={assetMetrics.tipoMaisComum}
            valueStyle={{ fontSize: "18px" }}
          />
        </Card>
      </Col>
    </Row>

    {/* Assets table */}
    <Card
      title="Lista de Ativos"
      style={{ width: "100%" }}
      extra={
        <Space>
          <span>{selectedRowKeys.length} itens selecionados</span>
          <Tooltip title="Exportar Selecionados">
            <Button
              icon={<ExportOutlined />}
              onClick={handleExportSelected}
              disabled={selectedRowKeys.length === 0}
            >
              Exportar
            </Button>
          </Tooltip>
          <Tooltip title="Mover Selecionados">
            <Button
              icon={<ImportOutlined />}
              onClick={handleMoveSelected}
              type="primary"
              disabled={selectedRowKeys.length === 0}
            >
              Mover
            </Button>
          </Tooltip>
        </Space>
      }
    >
      <Table
        rowSelection={rowSelection}
        columns={assetsColumns}
        dataSource={filteredAssets || []}
        loading={loadingAssets}
        rowKey="id"
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} itens`,
          onShowSizeChange: (current, size) => {
            setPageSize(size);
          },
          onChange: (page, size) => {
            if (size !== pageSize) {
              setPageSize(size);
            }
          },
          locale: {
            items_per_page: "itens",
          },
        }}
        scroll={{ x: true }}
      />
    </Card>

    {/* Edit Modal */}
    <Modal
      title="Editar Ativo"
      open={isEditModalVisible}
      onCancel={handleEditModalCancel}
      footer={null}
      width={800}
    >
      <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Categoria"
              name="categoria"
              rules={[
                {
                  required: true,
                  message: "Por favor, selecione a categoria!",
                },
              ]}
            >
              <Select placeholder="Selecione a categoria">
                <Option value="Insumo">Insumo</Option>
                <Option value="Máquina">Máquina</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Detalhamento"
              name="detalhamento"
              rules={[
                {
                  required: true,
                  message: "Por favor, informe o detalhamento!",
                },
              ]}
            >
              <Select placeholder="Selecione o detalhamento">
                <Option value="Em perfeito estado">Em perfeito estado</Option>
                <Option value="Tela quebrada">Tela quebrada</Option>
                <Option value="Bateria defeituosa">Bateria defeituosa</Option>
                <Option value="Tamper violado">Tamper violado</Option>
                <Option value="Problema de comunicação">
                  Problema de comunicação
                </Option>
                <Option value="Leitor de cartão danificado">
                  Leitor de cartão danificado
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Tipo"
              name="tipo"
              rules={[
                { required: true, message: "Por favor, selecione o tipo!" },
              ]}
            >
              <Select placeholder="Selecione o tipo">
                <Option value="SMARTPOS">SMARTPOS</Option>
                <Option value="POS">POS</Option>
                <Option value="TOTEM">TOTEM</Option>
                <Option value="MOBILE">MOBILE</Option>
                <Option value="OUTROS">OUTROS</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Modelo"
              name="modelo"
              rules={[
                { required: true, message: "Por favor, informe o modelo!" },
              ]}
            >
              <Select placeholder="Selecione o modelo">
                <Option value="PAGP2">PAGP2</Option>
                <Option value="PINP2">PINP2</Option>
                <Option value="SAFRAP2">SAFRAP2</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Adquirência"
              name="adquirencia"
              rules={[
                {
                  required: true,
                  message: "Por favor, selecione a adquirência!",
                },
              ]}
            >
              <Select placeholder="Selecione a adquirência">
                <Option value="Cielo">Cielo</Option>
                <Option value="Stone">Stone</Option>
                <Option value="PagSeguro">PagSeguro</Option>
                <Option value="Rede">Rede</Option>
                <Option value="GetNet">GetNet</Option>
                <Option value="Safra">Safra</Option>
                <Option value="Pinbank">Pinbank</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="RFID" name="rfid">
              <Input placeholder="RFID" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Serial N"
              name="serialN"
              rules={[
                { required: true, message: "Por favor, informe o Serial N!" },
              ]}
            >
              <Input placeholder="Serial N" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Device Z"
              name="deviceZ"
              rules={[
                { required: true, message: "Por favor, informe o Device Z!" },
              ]}
            >
              <Input placeholder="Device Z" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Situação"
              name="situacao"
              rules={[
                {
                  required: true,
                  message: "Por favor, selecione a situação!",
                },
              ]}
            >
              <Select placeholder="Selecione a situação">
                <Option value="Apto">Apto</Option>
                <Option value="Inapto">Inapto</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Alocação"
              name="alocacao"
              rules={[
                { required: true, message: "Por favor, informe a alocação!" },
              ]}
            >
              <Select placeholder="Selecione a localização">
                <Option value="São Paulo - SP (Matriz)">
                  São Paulo - SP (Matriz)
                </Option>
                <Option value="Rio de Janeiro - RJ">
                  Rio de Janeiro - RJ
                </Option>
                <Option value="Salvador - BA">Salvador - BA</Option>
                <Option value="Vitória - ES">Vitória - ES</Option>
                <Option value="Belém - PA">Belém - PA</Option>
                <Option value="Recife - PE">Recife - PE</Option>
                <Option value="Belo Horizonte - MG">
                  Belo Horizonte - MG
                </Option>
                <Option value="Goiânia - GO">Goiânia - GO</Option>
                <Option value="Porto Alegre - RS">Porto Alegre - RS</Option>
                <Option value="Fortaleza - CE">Fortaleza - CE</Option>
                <Option value="Brasília - DF">Brasília - DF</Option>
                <Option value="Curitiba - PR">Curitiba - PR</Option>
                <Option value="Balneário Camboriú - SC">
                  Balneário Camboriú - SC
                </Option>
                <Option value="Floripa - SC">Floripa - SC</Option>
                <Option value="Ribeirão Preto - SP">
                  Ribeirão Preto - SP
                </Option>
                <Option value="Uberlândia - MG">Uberlândia - MG</Option>
                <Option value="Campinas - SP">Campinas - SP</Option>
                <Option value="Campo Grande - MS">Campo Grande - MS</Option>
                <Option value="Caxias do Sul - RS">Caxias do Sul - RS</Option>
                <Option value="Cuiabá - MT">Cuiabá - MT</Option>
                <Option value="João Pessoa - PB">João Pessoa - PB</Option>
                <Option value="Londrina - PR">Londrina - PR</Option>
                <Option value="Manaus - AM">Manaus - AM</Option>
                <Option value="Natal - RN">Natal - RN</Option>
                <Option value="Porto Seguro - BA">Porto Seguro - BA</Option>
                <Option value="Santos - SP">Santos - SP</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={handleEditModalCancel}>Cancelar</Button>
              <Button type="primary" htmlType="submit">
                Salvar Alterações
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  </ConfigProvider>
);
};
export default GestaoAtivos;