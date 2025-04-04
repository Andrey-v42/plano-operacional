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

// Importar componentes de insumos
import GestaoInsumos from "./components/GestaoInventario/GestaoInsumos";
import CadastroInsumos from "./components/GestaoInventario/CadastroInsumos";
import CadastroMassaInsumos from "./components/GestaoInventario/CadastroMassaInsumos";
// Novo componente para cadastro com quantidade
import CadastroInsumoQuantidade from "./components/GestaoInventario/CadastroInsumoQuantidade";

// Importar modais e outros componentes
import HistoryModal from "./components/GestaoInventario/HistoryModal";
// Novos componentes para insumos em massa
import HistoricoInsumoMassa from "./components/GestaoInventario/HistoricoInsumoMassa";
import MovimentacaoInsumoMassa from "./components/GestaoInventario/MovimentacaoInsumoMassa";

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
  
  // Estados para insumos
  const [insumos, setInsumos] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [loadingInsumos, setLoadingInsumos] = useState(false);
  const [cadastroInsumoMode, setCadastroInsumoMode] = useState('individual');

  // Estados para modais
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInsumoMassaHistoricoVisible, setIsInsumoMassaHistoricoVisible] = useState(false);
  const [isMovimentacaoInsumoMassaVisible, setIsMovimentacaoInsumoMassaVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [currentInsumo, setCurrentInsumo] = useState(null);

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

  // Função para adicionar um insumo ao estado
  const addInsumoToState = (newInsumo) => {
    // Verificar se é em massa ou individual
    const docId = newInsumo.emMassa 
      ? `${newInsumo.tipo}_${newInsumo.modelo}_${newInsumo.alocacao}`.replace(/\s+/g, '_')
      : newInsumo.rfid;
    
    // Verificar se o insumo já existe (para itens em massa)
    if (newInsumo.emMassa) {
      const existingIndex = insumos.findIndex(item => 
        item.emMassa && 
        item.tipo === newInsumo.tipo && 
        item.modelo === newInsumo.modelo && 
        item.alocacao === newInsumo.alocacao
      );
      
      if (existingIndex !== -1) {
        // Se já existe, atualizar o item existente
        const updatedInsumos = [...insumos];
        const existingItem = {...updatedInsumos[existingIndex]};
        
        // Atualizar quantidade
        existingItem.quantidade = (existingItem.quantidade || 0) + (newInsumo.quantidade || 1);
        
        // Atualizar histórico
        existingItem.historico = [
          ...(newInsumo.historico || []),
          ...(existingItem.historico || [])
        ];
        
        // Atualizar valor total se aplicável
        if (existingItem.valorUnitario) {
          existingItem.valorTotal = existingItem.valorUnitario * existingItem.quantidade;
        }
        
        updatedInsumos[existingIndex] = existingItem;
        
        // Atualizar estado
        setInsumos(updatedInsumos);
        setFilteredInsumos(updatedInsumos);
        
        return 1;
      }
    }
    
    // Se não existe ou é individual, adicionar normalmente
    const insumoWithId = {
      ...newInsumo, 
      id: docId
    };
    
    setInsumos([...insumos, insumoWithId]);
    setFilteredInsumos([...filteredInsumos, insumoWithId]);
    
    return 1;
  };

  // Função para atualizar um insumo após movimentação
  const handleInsumoUpdated = (updatedInsumo) => {
    const docId = updatedInsumo.id || updatedInsumo.rfid || 
                  `${updatedInsumo.tipo}_${updatedInsumo.modelo}_${updatedInsumo.alocacao}`.replace(/\s+/g, '_');
    
    // Atualizar o estado local
    const updatedInsumos = insumos.map(item => {
      // Para itens em massa, comparar tipo, modelo e alocação
      if (updatedInsumo.emMassa && item.emMassa &&
          item.tipo === updatedInsumo.tipo &&
          item.modelo === updatedInsumo.modelo &&
          item.alocacao === updatedInsumo.alocacao) {
        return {...updatedInsumo, id: docId};
      }
      // Para itens individuais, comparar por ID
      else if (item.id === updatedInsumo.id || item.rfid === updatedInsumo.rfid) {
        return {...updatedInsumo, id: docId};
      }
      return item;
    });
    
    setInsumos(updatedInsumos);
    setFilteredInsumos(updatedInsumos.filter(item => 
      filteredInsumos.some(filteredItem => {
        if (item.emMassa && filteredItem.emMassa) {
          return filteredItem.tipo === item.tipo && 
                 filteredItem.modelo === item.modelo && 
                 filteredItem.alocacao === item.alocacao;
        }
        return filteredItem.id === item.id || filteredItem.rfid === item.rfid;
      })
    ));
  };

  // Funções auxiliares para o modal de histórico
  const showAssetHistory = (record) => {
    // Encontramos o ativo atualizado para garantir que temos o histórico mais recente
    const currentAssetData = assets.find(asset => asset.id === record.id) || record;
    setCurrentAsset(currentAssetData);
    setIsModalVisible(true);
  };
  
  // Função para mostrar histórico de um insumo
  const showInsumoHistory = (record) => {
    if (record.emMassa) {
      // Para insumos em massa, usar o modal específico
      setCurrentInsumo(record);
      setIsInsumoMassaHistoricoVisible(true);
    } else {
      // Para insumos individuais, usar o modal genérico
      setCurrentAsset(record);
      setIsModalVisible(true);
    }
  };

  // Função para mostrar o modal de movimentação de insumo em massa
  const showMovimentacaoInsumoMassa = (record) => {
    setCurrentInsumo(record);
    setIsMovimentacaoInsumoMassaVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleInsumoMassaHistoricoCancel = () => {
    setIsInsumoMassaHistoricoVisible(false);
  };

  const handleMovimentacaoInsumoMassaCancel = () => {
    setIsMovimentacaoInsumoMassaVisible(false);
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
  
  // Função para renderizar o componente de cadastro de insumo
  const renderCadastroInsumoComponent = () => {
    if (cadastroInsumoMode === 'individual') {
      return (
        <CadastroInsumos 
          openNotificationSucess={openNotificationSucess} 
          addInsumoToState={(newInsumo) => {
            const result = addInsumoToState(newInsumo);
            openNotificationSucess("Insumo cadastrado com sucesso!");
            setActiveTab("5"); // Switch to insumos management tab
            return result;
          }}
          pipeId={pipeId}
        />
      );
    } else if (cadastroInsumoMode === 'massa') {
      return (
        <CadastroMassaInsumos 
          openNotificationSucess={openNotificationSucess} 
          addInsumosToState={(newInsumos) => {
            let count = 0;
            newInsumos.forEach(insumo => {
              count += addInsumoToState(insumo);
            });
            openNotificationSucess(`${count} insumos cadastrados com sucesso!`);
            setActiveTab("5"); // Switch to insumos management tab
            return count;
          }}
          pipeId={pipeId}
        />
      );
    } else { // quantidade
      return (
        <CadastroInsumoQuantidade 
          openNotificationSucess={openNotificationSucess} 
          addInsumoToState={(newInsumo) => {
            const result = addInsumoToState(newInsumo);
            if (newInsumo.emMassa) {
              openNotificationSucess(`${newInsumo.quantidade} unidades de ${newInsumo.tipo} - ${newInsumo.modelo} cadastradas com sucesso!`);
            } else {
              openNotificationSucess("Insumo cadastrado com sucesso!");
            }
            setActiveTab("5"); // Switch to insumos management tab
            return result;
          }}
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
          setAssets={setAssets}
          filteredAssets={filteredAssets}
          setFilteredAssets={setFilteredAssets}
          loadingAssets={loadingAssets}
          setLoadingAssets={setLoadingAssets}
          showAssetHistory={showAssetHistory}
          pipeId={pipeId}
          openNotificationSucess={openNotificationSucess}
          openNotificationFailure={openNotificationFailure}
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
    },
    {
      key: "5",
      label: "Gestão de Insumos",
      children: (
        <GestaoInsumos 
          insumos={insumos}
          setInsumos={setInsumos}
          filteredInsumos={filteredInsumos}
          setFilteredInsumos={setFilteredInsumos}
          loadingInsumos={loadingInsumos}
          setLoadingInsumos={setLoadingInsumos}
          showInsumoHistory={showInsumoHistory}
          showMovimentacaoInsumoMassa={showMovimentacaoInsumoMassa}
          pipeId={pipeId}
          openNotificationSucess={openNotificationSucess}
          openNotificationFailure={openNotificationFailure}
        />
      )
    },
    {
      key: "6",
      label: "Cadastro de Insumos",
      children: (
        <div style={{ padding: "20px 0" }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>Selecione o modo de cadastro:</Title>
            <Radio.Group 
              value={cadastroInsumoMode} 
              onChange={(e) => setCadastroInsumoMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="individual">Cadastro Individual</Radio.Button>
              <Radio.Button value="massa">Importação em Massa</Radio.Button>
              <Radio.Button value="quantidade">Cadastro com Quantidade</Radio.Button>
            </Radio.Group>
            <Divider />
            {renderCadastroInsumoComponent()}
          </Space>
        </div>
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

      {/* Modal de histórico padrão */}
      <HistoryModal 
        isModalVisible={isModalVisible}
        currentAsset={currentAsset}
        handleModalCancel={handleModalCancel}
      />
      
      {/* Modal de histórico para insumos em massa */}
      <HistoricoInsumoMassa 
        insumo={currentInsumo}
        visible={isInsumoMassaHistoricoVisible}
        onClose={handleInsumoMassaHistoricoCancel}
      />
      
      {/* Modal de movimentação para insumos em massa */}
      <MovimentacaoInsumoMassa
        insumo={currentInsumo}
        visible={isMovimentacaoInsumoMassaVisible}
        onClose={handleMovimentacaoInsumoMassaCancel}
        openNotificationSucess={openNotificationSucess}
        onInsumoUpdated={handleInsumoUpdated}
      />
    </div>
  );
};

export default GestaoInventario;