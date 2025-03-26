import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import MovementReasonModal from "./components/GestaoInventario/MovementReasonModal";

// Importar modal e outros componentes
import HistoryModal from "./components/GestaoInventario/HistoryModal";

const { Title } = Typography;

const GestaoInventario = () => {
  const [searchParams] = useSearchParams();
  const pipeId = searchParams.get("pipeId");

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

  // Função para atualizar os assets globalmente
  const updateAssets = (updatedAsset) => {
    // If updatedAsset is a single asset, handle update for that asset
    if (updatedAsset && !Array.isArray(updatedAsset)) {
      const requestData = {
        collectionURL: `/ativos`,
        docId: updatedAsset.serialMaquina,
        formData: updatedAsset
      };

      fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update asset');
          }
          
          // Update local state
          const updatedAssets = assets.map(asset => 
            asset.id === updatedAsset.id ? updatedAsset : asset
          );
          
          setAssets(updatedAssets);
          setFilteredAssets(updatedAssets.filter(asset => 
            filteredAssets.some(filteredAsset => filteredAsset.id === asset.id)
          ));
          
          openNotificationSucess("Ativo atualizado com sucesso!");
        })
        .catch(error => {
          console.error('Error updating asset:', error);
          openNotificationFailure("Erro ao atualizar ativo");
        });
    } else {
      // If it's a full refresh request, fetch all assets again
      fetchAssets();
    }
  };

  // Função de fetch de ativos (pode ser movida para um serviço separado)
  const fetchAssets = async () => {
    setLoadingAssets(true);
    
    const requestData = {
      url: `/ativos`
    };

    try {
      const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      
      // Transform data to match expected structure
      const assetsData = data.docs.map(doc => ({
        id: doc.id,
        ...doc.data
      }));
      
      setAssets(assetsData);
      setFilteredAssets(assetsData);
    } catch (error) {
      console.error('Error fetching assets:', error);
      openNotificationFailure("Erro ao carregar ativos");
    } finally {
      setLoadingAssets(false);
    }
  };
  
  // Função para adicionar novos ativos ao estado
  const addAssetsToState = (newAssets) => {
    setLoadingAssets(true);
    
    // Create array of promises for each asset
    const promises = newAssets.map(asset => {
      const requestData = {
        collectionURL: `/ativos`,
        docId: asset.serialMaquina, // Use serialMaquina as document ID
        formData: asset
      };

      return fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
    });

    // Process all promises
    Promise.all(promises)
      .then(responses => {
        // Check if all responses are OK
        const failedResponses = responses.filter(response => !response.ok).length;
        
        if (failedResponses > 0) {
          openNotificationFailure(`${failedResponses} ativos não puderam ser cadastrados`);
        }
        
        // Refresh asset list from server to get latest data
        fetchAssets();
        
        // Show success notification
        openNotificationSucess(`${responses.length - failedResponses} ativos cadastrados com sucesso!`);
        
        // Switch to assets management tab
        setActiveTab("2");
        
        setLoadingAssets(false);
        
        return responses.length - failedResponses; // Return count of successfully added assets
      })
      .catch(error => {
        console.error('Error adding assets:', error);
        openNotificationFailure("Erro ao cadastrar ativos");
        setLoadingAssets(false);
        return 0;
      });
  };
  
  // Função para adicionar um único ativo ao estado
  const addAssetToState = (newAsset) => {
    // Use the serialMaquina as the document ID
    const docId = newAsset.serialMaquina;
    
    const requestData = {
      collectionURL: `/ativos`,
      docId: docId,
      formData: newAsset
    };

    fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add asset');
        }
        return response.text();
      })
      .then(() => {
        // Add to local state with the docId as the id
        const assetWithId = {
          ...newAsset,
          id: docId
        };
        
        const updatedAssets = [...assets, assetWithId];
        setAssets(updatedAssets);
        setFilteredAssets(updatedAssets);
        
        // Show success notification
        openNotificationSucess("Ativo cadastrado com sucesso!");
        
        // Switch to assets management tab
        setActiveTab("2");
        
        return 1; // Return count of added assets
      })
      .catch(error => {
        console.error('Error adding asset:', error);
        openNotificationFailure("Erro ao cadastrar ativo");
        return 0;
      });
  };

  // Funções auxiliares para o modal de histórico
  const showAssetHistory = (record) => {
    // Encontramos o ativo atualizado para garantir que temos o histórico mais recente
    const currentAssetData = assets.find(asset => asset.id === record.id) || record;
    setCurrentAsset(currentAssetData);
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
          pipeId={pipeId}
        />
      );
    } else {
      return (
        <CadastroMassaAtivos 
          openNotificationSucess={openNotificationSucess} 
          addAssetsToState={addAssetsToState}
          pipeId={pipeId}
        />
      );
    }
  };

  // Efeito para carregar ativos inicialmente
  useEffect(() => {
    fetchAssets();
  }, []);

  // Tabs items configuration
  const tabItems = [
    {
      key: "1",
      label: "Dashboard",
      children: (
        <Dashboard 
          assets={assets} 
          filteredAssets={filteredAssets} 
        />
      )
    },
    {
      key: "2",
      label: "Gestão de Ativos",
      children: (
        <GestaoAtivos 
          assets={assets}
          setAssets={setAssets} // Add this line to pass the setter function
          filteredAssets={filteredAssets}
          setFilteredAssets={setFilteredAssets}
          loadingAssets={loadingAssets}
          setLoadingAssets={setLoadingAssets} // Add this line too
          showAssetHistory={showAssetHistory}
          pipeId={pipeId}
        />
      )
    },
    {
      key: "3",
      label: "Cadastro de Ativos",
      children: (
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
      )
    },
    {
      key: "4",
      label: "Movimentação de Estoque",
      children: (
        <MovimentacaoEstoque 
          assets={assets}
          openNotificationSucess={openNotificationSucess}
          showAssetHistory={showAssetHistory}
          updateAssets={updateAssets}
        />
      )
    }
  ];

  return (
    <div style={{ padding: "20px", width: "100%" }}>
      {contextHolder}

      <Tabs
        defaultActiveKey="1"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginBottom: "20px" }}
      />

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