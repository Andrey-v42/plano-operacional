import React, { useState, useEffect } from "react";
import { 
  Tabs, 
  notification,
  Radio,
  Space,
  Divider,
  Typography
} from "antd";
import {
  SmileOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

// Importar componentes de aba
import Dashboard from "./components/GestaoInventario/DashboardGestaoDeAtivos";
import GestaoAtivos from "./components/GestaoInventario/GestaoAtivos";
import CadastroAtivos from "./components/GestaoInventario/CadastroAtivos";
import CadastroMassaAtivos from "./components/GestaoInventario/CadastroMassaAtivos";
import MovimentacaoEstoque from "./components/GestaoInventario/MovimentacaoEstoque";

// Importar modal e outros componentes
import HistoryModal from "./components/GestaoInventario/HistoryModal";

const { TabPane } = Tabs;
const { Title } = Typography;

const GestaoInventario = () => {
  // Estados principais
  const [activeTab, setActiveTab] = useState("1");
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [cadastroMode, setCadastroMode] = useState('individual');

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
                rfid: "RF00123456",
                serialMaquina: "SM12345",
                serialN: "SN98765",
                deviceZ: "DZ54321",
                situacao: "Apto",
                detalhamento: "Em perfeito estado",
                alocacao: "São Paulo - SP (Matriz)",
                historico: [
                  {
                    data: "20/03/2025 10:30:45",
                    destino: "Estoque",
                    nomeDestino: "Entrada inicial no sistema",
                    os: "N/A",
                    motivo: "Cadastro inicial do ativo",
                    responsavel: "Sistema"
                  }
                ]
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
  
  // Função para adicionar novos ativos ao estado
  const addAssetsToState = (newAssets) => {
    // Gerar IDs únicos para os novos ativos
    const assetsWithIds = newAssets.map((asset, index) => ({
      ...asset,
      id: assets.length > 0 ? Math.max(...assets.map(a => a.id)) + index + 1 : index + 1
    }));
    
    // Atualizar o estado com os novos ativos
    const updatedAssets = [...assets, ...assetsWithIds];
    setAssets(updatedAssets);
    setFilteredAssets(updatedAssets);
    
    // Mudar para a aba de Gestão de Ativos após adicionar
    setActiveTab("2");
    
    return assetsWithIds.length; // Retornar quantidade de ativos adicionados
  };
  
  // Função para adicionar um único ativo ao estado
  const addAssetToState = (newAsset) => {
    // Gerar ID único para o novo ativo
    const newId = assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1;
    const assetWithId = {
      ...newAsset,
      id: newId
    };
    
    // Atualizar o estado com o novo ativo
    const updatedAssets = [...assets, assetWithId];
    setAssets(updatedAssets);
    setFilteredAssets(updatedAssets);
    
    // Mudar para a aba de Gestão de Ativos após adicionar
    setActiveTab("2");
    
    return 1; // Retornar quantidade de ativos adicionados (sempre 1 neste caso)
  };

  // Funções auxiliares para o modal de histórico
  const showAssetHistory = (record) => {
    setCurrentAsset(record);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Função para renderizar o componente de cadastro correto
  const renderCadastroComponent = () => {
    if (cadastroMode === 'individual') {
      return (
        <CadastroAtivos 
          openNotificationSucess={openNotificationSucess} 
          addAssetToState={addAssetToState}
        />
      );
    } else {
      return (
        <CadastroMassaAtivos 
          openNotificationSucess={openNotificationSucess} 
          addAssetsToState={addAssetsToState}
        />
      );
    }
  };

  // Efeito para carregar ativos inicialmente
  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div style={{ padding: "20px", width: "100%" }}>
      {contextHolder}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ marginBottom: "20px"}}
      >
        <TabPane tab="Dashboard" key="1" style={{ padding: "20px", }}>
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
          <div style={{ padding: "20px 0" }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>Selecione o modo de cadastro:</Title>
              <Radio.Group 
                value={cadastroMode} 
                onChange={(e) => setCadastroMode(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="individual">Cadastro Individual</Radio.Button>
                <Radio.Button value="massa">Cadastro em Massa</Radio.Button>
              </Radio.Group>
              <Divider />
              {renderCadastroComponent()}
            </Space>
          </div>
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