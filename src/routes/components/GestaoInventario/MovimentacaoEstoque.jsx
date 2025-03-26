import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Input, 
  Button, 
  Table, 
  Tag, 
  Alert, 
  Card, 
  notification,
  Select
} from 'antd';
import { 
  SearchOutlined,
  BarcodeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import TreeTransfer from './TreeTransfer';
import MovementReasonModal from './MovementReasonModal';
import HistoryModal from './HistoryModal';
import useMovimentacaoEstoque from './useMovimentacaoEstoque';

const { Search } = Input;

const MovimentacaoEstoque = ({ 
  assets, 
  openNotificationSucess,
  updateAssets
}) => {
  // State for asset history modal
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);

  const {
    // Using hook to manage states and logic
    searchResults,
    targetKeys,
    filteredAssets,
    scannerMode,
    inputRef,
    pipeId,
    isMovementReasonModalVisible,
    pendingMovement,

    // Methods from hook
    toggleScannerMode,
    handleAssetSearch,
    handleModeloChange,
    handleAssetCategoryChange,
    handleTransferChange,
    convertAssetsToTreeData,
    handleMovementReasonConfirm,
    handleMovementReasonCancel
  } = useMovimentacaoEstoque(assets, openNotificationSucess, updateAssets);

  // Method to show asset history
  const showAssetHistory = (asset) => {
    setCurrentAsset(asset);
    setIsHistoryModalVisible(true);
  };

  // Method to close asset history modal
  const handleHistoryModalCancel = () => {
    setIsHistoryModalVisible(false);
    setCurrentAsset(null);
  };

  // Method to prepare data for transfer
  const convertFilteredToTransferData = () => {
    return filteredAssets
      .filter(asset => !targetKeys.includes(asset.id.toString())) // Exclude already allocated
      .map(asset => ({
        key: asset.id.toString(),
        title: `${asset.modelo} - ${asset.serialMaquina || 'N/A'} (${asset.rfid})`,
        description: asset.categoria,
        disabled: asset.situacao !== "Apto" // Disable ineligible assets
      }));
  };

  // Render moved assets to determine which will be passed to modal
  const getMovedAssets = () => {
    return assets.filter(asset => 
      pendingMovement.keys.includes(asset.id.toString())
    );
  };

  // Columns for search results
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

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col span={24}>
          <Alert
            message={`Movimentação de Estoque - OS: ${pipeId}`}
            description="Utilize este módulo para alocar ou devolver ativos para a OS atual. Busque os ativos pelo RFID, Serial da Máquina, Serial N ou Device Z para alocação automática."
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        </Col>
      </Row>
      
      <Card title="Buscar Ativos" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Search
              ref={inputRef}
              placeholder="Digite RFID, Serial da Máquina, Serial N ou Device Z" 
              onSearch={handleAssetSearch}
              style={{ width: '100%' }}
              allowClear
              suffix={
                scannerMode ? <BarcodeOutlined style={{ color: '#1890ff' }} /> : null
              }
            />
          </Col>
          <Col xs={24} md={8}>
            <Button 
              type={scannerMode ? "primary" : "default"}
              icon={<BarcodeOutlined />} 
              onClick={toggleScannerMode}
              style={{ width: '100%' }}
              danger={scannerMode}
            >
              {scannerMode ? "Desativar Scanner" : "Ativar Scanner"}
            </Button>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} md={12}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filtrar por categoria"
              onChange={handleAssetCategoryChange}
              options={[
                { label: "Todas", value: "all" },
                ...Array.from(new Set(assets.map(a => a.categoria)))
                  .map(cat => ({ label: cat, value: cat }))
              ]}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filtrar por modelo"
              onChange={handleModeloChange}
              options={[
                { label: "Todos", value: "all" },
                ...Array.from(new Set(assets.map(a => a.modelo)))
                  .map(modelo => ({ label: modelo, value: modelo }))
              ]}
            />
          </Col>
        </Row>
        
        {searchResults && searchResults.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Resultados da Busca</h4>
            <Table 
              dataSource={searchResults}
              columns={assetsColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Card>
      
      <Card 
        title={`Movimentação de Ativos - OS: ${pipeId}`}
      >
        <Alert
          message="Instruções de Uso"
          description={
            <div>
              <p>• Lado <strong>esquerdo:</strong> ativos disponíveis para alocação na OS.</p>
              <p>• Lado <strong>direito:</strong> ativos já alocados na OS.</p>
              <p>• Use as setas para mover os ativos entre as listas.</p>
              <p>• As mudanças são registradas no histórico do ativo.</p>
              <p>• <strong>Busca de ativos:</strong> Os ativos encontrados são automaticamente alocados para a OS.</p>
              {scannerMode && <p>• <strong>Modo Scanner Ativado:</strong> Escaneie um código de barras para alocar automaticamente o ativo à OS.</p>}
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        
        {(filteredAssets && (convertFilteredToTransferData().length > 0 || convertAssetsToTreeData().length > 0)) ? (
          <TreeTransfer
            dataSource={convertFilteredToTransferData()}
            targetKeys={targetKeys}
            onChange={handleTransferChange}
            titles={['Ativos Disponíveis', `Ativos Alocados na OS ${pipeId}`]}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>
              Nenhum ativo disponível ou já alocado nesta OS.
              Utilize a busca acima para encontrar ativos para alocar.
            </p>
          </div>
        )}
        
        {/* Movement Reason Modal */}
        <MovementReasonModal
          visible={isMovementReasonModalVisible}
          onOk={handleMovementReasonConfirm}
          onCancel={handleMovementReasonCancel}
          assets={getMovedAssets()}
          movementType={pendingMovement.type}
        />
        
        {/* History Modal */}
        <HistoryModal
          isModalVisible={isHistoryModalVisible}
          currentAsset={currentAsset}
          handleModalCancel={handleHistoryModalCancel}
        />

        {targetKeys && targetKeys.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <Alert
              message={`${targetKeys.length} ativo(s) alocado(s) na OS ${pipeId}`}
              type="success"
              showIcon
            />
          </div>
        )}
      </Card>
    </>
  );
};

export default MovimentacaoEstoque;