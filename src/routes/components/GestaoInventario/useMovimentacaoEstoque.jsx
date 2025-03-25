import { useState, useEffect, useRef } from 'react';
import { notification } from 'antd';

export const useMovimentacaoEstoque = (assets, openNotificationSucess) => {
  // State declarations
  const [searchResults, setSearchResults] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [scannerMode, setScannerMode] = useState(false);
  const [allocatedAssets, setAllocatedAssets] = useState([]);
  const inputRef = useRef(null);
  const [pipeId, setPipeId] = useState('OS-2025-001');
  const [isMovementReasonModalVisible, setIsMovementReasonModalVisible] = useState(false);
  const [pendingMovement, setPendingMovement] = useState({
    type: null,
    keys: [],
    direction: null
  });

  // Initialize filtered assets
  useEffect(() => {
    setFilteredAssets(assets);
  }, [assets]);
  
  // Filter assets by category
  const handleAssetCategoryChange = (category) => {
    if (category === 'all') {
      setFilteredAssets(assets);
    } else {
      setFilteredAssets(assets.filter(asset => asset.categoria === category));
    }
  };
  
  // Filter assets by model
  const handleModeloChange = (modelo) => {
    if (modelo === 'all') {
      setFilteredAssets(assets);
    } else {
      setFilteredAssets(assets.filter(asset => asset.modelo === modelo));
    }
  };
  
  // Toggle scanner mode
  const toggleScannerMode = () => {
    setScannerMode(!scannerMode);
    if (!scannerMode) {
      // Focus input when scanner mode is activated
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  
  // Handle asset search
  const handleAssetSearch = (value) => {
    if (!value) return;
    
    const found = assets.find(asset => 
      asset.rfid === value || 
      asset.serialMaquina === value || 
      asset.serialN === value ||
      asset.deviceZ === value
    );
    
    if (found) {
      setSearchResults([found]);
      
      // Automatically allocate the asset
      if (!targetKeys.includes(found.id.toString())) {
        const newTargetKeys = [...targetKeys, found.id.toString()];
        setTargetKeys(newTargetKeys);
        openNotificationSucess(`Ativo ${found.modelo} (${found.rfid}) alocado automaticamente`);
      }
    } else {
      notification.error({
        message: 'Ativo não encontrado',
        description: `Não foi possível encontrar um ativo com o identificador ${value}`,
      });
    }
  };

  // Convert assets to tree data format
  const convertAssetsToTreeData = () => {
    return assets
      .filter(asset => targetKeys.includes(asset.id.toString()))
      .map(asset => ({
        key: asset.id.toString(),
        title: `${asset.modelo} - ${asset.serialMaquina} (${asset.rfid})`,
        description: asset.categoria
      }));
  };

  // Updated handleTransferChange to show movement reason modal
  const handleTransferChange = (nextTargetKeys) => {
    // Determine the movement direction and affected assets
    const movingToTarget = nextTargetKeys.filter(
      (key) => !targetKeys.includes(key)
    );
    const movingFromTarget = targetKeys.filter(
      (key) => !nextTargetKeys.includes(key)
    );

    // If there are assets moving, show the movement reason modal
    if (movingToTarget.length > 0 || movingFromTarget.length > 0) {
      setPendingMovement({
        type: movingToTarget.length > 0 ? 'transfer' : 'return',
        keys: movingToTarget.length > 0 ? movingToTarget : movingFromTarget,
        direction: movingToTarget.length > 0 ? 'to' : 'from'
      });
      setIsMovementReasonModalVisible(true);
    }
  };

  // Handle movement reason confirmation
  const handleMovementReasonConfirm = (movementData) => {
    // Close the modal
    setIsMovementReasonModalVisible(false);

    // Get the assets involved in the movement
    const movedAssets = assets.filter(asset => 
      pendingMovement.keys.includes(asset.id.toString())
    );

    // Update the target keys
    const nextTargetKeys = pendingMovement.direction === 'to' 
      ? [...targetKeys, ...pendingMovement.keys]
      : targetKeys.filter(key => !pendingMovement.keys.includes(key));
    
    setTargetKeys(nextTargetKeys);

    // Update history for each moved asset
    const updatedAssets = movedAssets.map(asset => {
      // Create a new history entry
      const newHistoryEntry = {
        data: movementData.timestamp,
        os: 'OS_ATUAL', // Replace with actual OS identifier
        destino: movementData.branch || 'Movimentação Interna',
        nomeDestino: movementData.branch || '',
        motivo: movementData.reason === 'os' ? 'Movido para o evento (OS)' :
                movementData.reason === 'maintenance' ? 'Manutenção na adquirente' :
                `Movido para filial: ${movementData.branch}`,
        responsavel: 'USUARIO_ATUAL', // Replace with actual user
        detalhes: movementData.details || ''
      };

      // Ensure historico array exists
      const updatedHistorico = asset.historico ? 
        [...asset.historico, newHistoryEntry] : 
        [newHistoryEntry];

      return {
        ...asset,
        historico: updatedHistorico,
        alocacao: movementData.branch || 'Movimentação Interna'
      };
    });

    // Simulate API update
    setTimeout(() => {
      if (pendingMovement.direction === 'to') {
        openNotificationSucess(
          `${pendingMovement.keys.length} ativo(s) alocado(s) para a OS ${pipeId}`
        );
      } else {
        openNotificationSucess(
          `${pendingMovement.keys.length} ativo(s) devolvido(s) ao estoque`
        );
      }

      // Update allocated assets
      const updatedAllocatedAssets = assets.filter((asset) =>
        nextTargetKeys.includes(asset.id.toString())
      );
      setAllocatedAssets(updatedAllocatedAssets);
    }, 1000);

    // Reset pending movement
    setPendingMovement({
      type: null,
      keys: [],
      direction: null
    });
  };

  // Cancel movement
  const handleMovementReasonCancel = () => {
    // Reset the transfer to its previous state
    setIsMovementReasonModalVisible(false);
    setPendingMovement({
      type: null,
      keys: [],
      direction: null
    });
  };

  return {
    // State values
    searchResults,
    targetKeys,
    filteredAssets,
    scannerMode,
    allocatedAssets,
    inputRef,
    pipeId,
    isMovementReasonModalVisible,
    pendingMovement,

    // Methods
    setSearchResults,
    setTargetKeys,
    setFilteredAssets,
    setScannerMode,
    setAllocatedAssets,
    setPipeId,
    setIsMovementReasonModalVisible,
    toggleScannerMode,
    handleAssetSearch,
    handleModeloChange,
    handleAssetCategoryChange,
    handleTransferChange,
    convertAssetsToTreeData,
    handleMovementReasonConfirm,
    handleMovementReasonCancel
  };
};

export default useMovimentacaoEstoque;