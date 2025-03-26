import { useState, useEffect, useRef } from 'react';
import { notification } from 'antd';

const useMovimentacaoEstoque = (assets, openNotificationSucess, updateAssets) => {
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
    
    // Find already allocated assets for this OS
    const initialAllocated = assets
      .filter(asset => asset.alocacao && asset.alocacao.includes(`OS: ${pipeId}`))
      .map(asset => asset.id.toString());
      
    if (initialAllocated.length > 0) {
      setTargetKeys(initialAllocated);
    }
  }, [assets, pipeId]);
  
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
      
      // Automatically allocate the asset if not already allocated
      if (!targetKeys.includes(found.id.toString())) {
        const newTargetKeys = [...targetKeys, found.id.toString()];
        setTargetKeys(newTargetKeys);
        
        // Automatically open movement reason modal for the found asset
        setPendingMovement({
          type: 'transfer',
          keys: [found.id.toString()],
          direction: 'to'
        });
        setIsMovementReasonModalVisible(true);
      } else {
        // Asset already allocated
        notification.info({
          message: 'Ativo já alocado',
          description: `O ativo ${found.modelo} (${found.rfid}) já está alocado nesta OS`
        });
      }
    } else {
      notification.error({
        message: 'Ativo não encontrado',
        description: `Não foi possível encontrar um ativo com o identificador ${value}`
      });
    }
  };

  // Convert assets to tree data format
  const convertAssetsToTreeData = () => {
    return assets
      .filter(asset => targetKeys.includes(asset.id.toString()))
      .map(asset => ({
        key: asset.id.toString(),
        title: `${asset.modelo} - ${asset.serialMaquina || 'N/A'} (${asset.rfid})`,
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

    // Format date for history
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    // Create deep copies of assets to update
    const assetsToUpdate = JSON.parse(JSON.stringify(assets));
    
    // Update history for each moved asset
    movedAssets.forEach(movedAsset => {
      // Find the asset in the copied array
      const assetToUpdate = assetsToUpdate.find(asset => asset.id === movedAsset.id);
      
      if (assetToUpdate) {
        // Get the appropriate reason label based on the reason code
        const reasonLabel = 
          movementData.reason === 'os' ? 'Movido para o evento (OS)' :
          movementData.reason === 'maintenance' ? 'Manutenção na adquirente' :
          movementData.reason === 'branch' ? `Movido para filial: ${movementData.branch}` :
          'Outro';
        
        // Create a new history entry
        const newHistoryEntry = {
          data: formattedDate,
          os: pendingMovement.direction === 'to' ? pipeId : 'N/A',
          destino: movementData.reason === 'branch' 
            ? movementData.branch 
            : (pendingMovement.direction === 'to' ? `OS: ${pipeId}` : 'Estoque'),
          nomeDestino: movementData.branch || '',
          motivo: reasonLabel,
          responsavel: 'Operador', // Would be replaced with actual user in a real app
          detalhes: movementData.details || ''
        };

        // Ensure historico array exists
        if (!assetToUpdate.historico) {
          assetToUpdate.historico = [];
        }
        
        // Add new entry to the beginning to show most recent first
        assetToUpdate.historico.unshift(newHistoryEntry);
        
        // Update allocation
        if (movementData.reason === 'branch') {
          assetToUpdate.alocacao = movementData.branch;
        } else if (pendingMovement.direction === 'to') {
          assetToUpdate.alocacao = `Em OS: ${pipeId}`;
        } else {
          assetToUpdate.alocacao = 'Estoque'; // Return to stock
        }
      }
    });

    // Here you would typically call an API to update the assets
    if (typeof updateAssets === 'function') {
      updateAssets(assetsToUpdate);
    }

    // Show success notification
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
      const updatedAllocatedAssets = assetsToUpdate.filter((asset) =>
        nextTargetKeys.includes(asset.id.toString())
      );
      setAllocatedAssets(updatedAllocatedAssets);
    }, 500);

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