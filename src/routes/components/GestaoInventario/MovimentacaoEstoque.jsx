import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Input, 
  Button, 
  Table, 
  Tag, 
  Alert, 
  Card, 
  Transfer,
  notification 
} from 'antd';
import { 
  SearchOutlined 
} from '@ant-design/icons';

const { Search } = Input;

// Componente de TreeTransfer customizado
const TreeTransfer = ({ dataSource, targetKeys, onChange, titles }) => {
  const [localTargetKeys, setLocalTargetKeys] = useState(targetKeys);

  const handleChange = (newTargetKeys) => {
    setLocalTargetKeys(newTargetKeys);
    if (onChange) {
      onChange(newTargetKeys);
    }
  };

  return (
    <Transfer
      targetKeys={localTargetKeys}
      dataSource={dataSource}
      render={(item) => item.title}
      onChange={handleChange}
      titles={titles}
      listStyle={{
        width: '45%',
        height: 400,
      }}
    />
  );
};

const MovimentacaoEstoque = ({ 
  assets, 
  openNotificationSucess 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [allocatedAssets, setAllocatedAssets] = useState([]);

  // Simular ID da OS (geralmente vindo de rota ou contexto)
  const pipeId = 'teste1234';

  // Colunas para os resultados de busca
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

  // Buscar ativos alocados ao carregar
  useEffect(() => {
    fetchAllocatedAssets();
  }, []);

  // Simular busca de ativos alocados
  const fetchAllocatedAssets = async () => {
    try {
      // Simular API call para buscar ativos já alocados
      if (pipeId === 'teste1234') {
        const allocatedAssetsData = assets.filter(asset => asset.id === 1);
        setAllocatedAssets(allocatedAssetsData);
        
        // Atualizar targetKeys com os IDs dos ativos já alocados
        const allocatedKeys = allocatedAssetsData.map((asset) => asset.id.toString());
        setTargetKeys(allocatedKeys);
      }
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Erro ao carregar ativos alocados',
      });
    }
  };

  // Buscar ativos
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
          asset.serialMaquina.toLowerCase().includes(searchValue.toLowerCase()) ||
          asset.serialN.toLowerCase().includes(searchValue.toLowerCase()) ||
          asset.deviceZ.toLowerCase().includes(searchValue.toLowerCase())
      );

      setSearchResults(results);
      setIsSearching(false);

      if (results.length === 0) {
        notification.info({
          message: 'Busca',
          description: 'Nenhum ativo encontrado com os parâmetros informados.',
        });
      }
    }, 800);
  };

  // Selecionar ativo
  const handleAssetSelect = (asset) => {
    // Verificar se o ativo já está selecionado
    if (!selectedAssets.some((item) => item.id === asset.id)) {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  // Remover ativo selecionado
  const handleAssetDeselect = (assetId) => {
    setSelectedAssets(selectedAssets.filter((asset) => asset.id !== assetId));
  };

  // Converter ativos para formato de árvore
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

  // Mudança na transferência de ativos
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

  // Dados da árvore de transferência
  const treeData = convertAssetsToTreeData();

  return (
    <>
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
            <h5>Resultados da Busca</h5>
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
                <h5>Ativos Selecionados para Movimentação</h5>
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
            <p>
              Nenhum ativo selecionado ou já alocado nesta OS. 
              Utilize a busca acima para encontrar e selecionar ativos.
            </p>
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
    </>
  );
};

export default MovimentacaoEstoque;