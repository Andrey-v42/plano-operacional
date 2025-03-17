import React, { useState, useEffect } from "react";
import { 
  Tabs, 
  notification 
} from "antd";

// Importar componentes de aba
import Dashboard from "./components/GestaoInventario/DashboardGestaoDeAtivos";
import GestaoAtivos from "./components/GestaoInventario/GestaoAtivos";
import CadastroAtivos from "./components/GestaoInventario/CadastroAtivos";
import MovimentacaoEstoque from "./components/GestaoInventario/MovimentacaoEstoque";

// Importar modal e outros componentes
import HistoryModal from "./components/GestaoInventario/HistoryModal";

const { TabPane } = Tabs;

const GestaoInventario = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState("1");
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Estados para modal de histórico
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);

  // Notificação
  const [api, contextHolder] = notification.useNotification();

  // Funções utilitárias de notificação
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

  // Função de fetch de ativos (pode ser movida para um serviço separado)
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
                // ... outros detalhes do ativo
              },
              // ... outros ativos
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

  // Funções auxiliares para o modal de histórico
  const showAssetHistory = (record) => {
    setCurrentAsset(record);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Efeito para carregar ativos inicialmente
  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {contextHolder}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        style={{ marginBottom: "20px" }}
      >
        <TabPane tab="Dashboard" key="1">
          <Dashboard 
            assets={assets} 
            filteredAssets={filteredAssets} 
          />
        </TabPane>

        <TabPane tab="Gestão de Ativos" key="2">
          <GestaoAtivos 
            assets={assets}
            filteredAssets={filteredAssets}
            setFilteredAssets={setFilteredAssets}
            loadingAssets={loadingAssets}
            showAssetHistory={showAssetHistory}
          />
        </TabPane>

        <TabPane tab="Cadastro de Ativos" key="3">
          <CadastroAtivos 
            openNotificationSucess={openNotificationSucess} 
          />
        </TabPane>

        <TabPane tab="Movimentação de Estoque" key="4">
          <MovimentacaoEstoque 
            assets={assets}
            openNotificationSucess={openNotificationSucess}
          />
        </TabPane>
      </Tabs>

      {/* Modal de histórico */}
      <HistoryModal 
        isModalVisible={isModalVisible}
        currentAsset={currentAsset}
        handleModalCancel={handleModalCancel}
      />
    </div>
  );
};

export default GestaoInventario;