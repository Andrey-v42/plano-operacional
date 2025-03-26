import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Divider, 
  Button, 
  Timeline,
  Empty,
  message
} from 'antd';
import { 
  HistoryOutlined,
  ImportOutlined,
  ApartmentOutlined,
  ToolOutlined,
  CarOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export const HistoryModal = ({ 
  isModalVisible, 
  currentAsset, 
  handleModalCancel 
}) => {
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const historyPageSize = 5;

  // Efeito para resetar a página quando um novo ativo é exibido
  useEffect(() => {
    if (isModalVisible) {
      setCurrentHistoryPage(1);
      
      // Log para debug - pode ser removido em produção
      if (currentAsset?.historico) {
        console.log('Histórico do ativo:', currentAsset.historico);
      } else {
        console.log('Ativo sem histórico:', currentAsset);
      }
    }
  }, [isModalVisible, currentAsset]);

  // Se não há ativo selecionado, não renderizar nada
  if (!currentAsset) return null;

  // Garantir que o histórico existe e está ordenado (mais recente primeiro)
  const historicoOrdenado = currentAsset.historico 
    ? [...currentAsset.historico].sort((a, b) => {
        // Tentar converter para objetos Date
        const dataA = new Date(a.data.replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$2/$1'));
        const dataB = new Date(b.data.replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$2/$1'));
        
        // Se as datas são válidas, ordenar por data (mais recente primeiro)
        if (!isNaN(dataA) && !isNaN(dataB)) {
          return dataB - dataA;
        }
        // Fallback: manter a ordem original
        return 0;
      })
    : [];

  // Paginar o histórico
  const start = (currentHistoryPage - 1) * historyPageSize;
  const end = start + historyPageSize;
  const paginatedHistory = historicoOrdenado.slice(start, end);
  const totalHistoryItems = historicoOrdenado.length;

  const handleHistoryPageChange = (page) => {
    setCurrentHistoryPage(page);
  };

  // Função para renderizar ícone apropriado baseado no tipo de operação
  const getTimelineIcon = (item) => {
    if (item.motivo?.toLowerCase().includes("cadastro")) {
      return <ImportOutlined style={{ color: '#1890ff' }} />;
    } else if (item.motivo?.toLowerCase().includes("manutenção")) {
      return <ToolOutlined style={{ color: '#faad14' }} />;
    } else if (item.motivo?.toLowerCase().includes("filial")) {
      return <ApartmentOutlined style={{ color: '#722ed1' }} />;
    } else if (item.motivo?.toLowerCase().includes("os") || item.motivo?.toLowerCase().includes("evento")) {
      return <CarOutlined style={{ color: '#eb2f96' }} />;
    } else {
      return <HistoryOutlined style={{ color: '#52c41a' }} />;
    }
  };

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

      <Divider orientation="left">Histórico de Movimentações</Divider>

      {paginatedHistory.length > 0 ? (
        <Timeline
          mode="left"
          items={paginatedHistory.map((item) => ({
            label: item.data,
            dot: getTimelineIcon(item),
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
                {item.detalhes && (
                  <p>
                    <strong>Detalhes:</strong> {item.detalhes}
                  </p>
                )}
              </Card>
            ),
          }))}
        />
      ) : (
        <Empty
          description="Nenhum histórico disponível para este ativo"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

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

export default HistoryModal;