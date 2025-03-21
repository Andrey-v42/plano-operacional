import React, { useState } from 'react';
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
  Empty
} from 'antd';
import { 
  HistoryOutlined,
  ImportOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export const HistoryModal = ({ 
  isModalVisible, 
  currentAsset, 
  handleModalCancel 
}) => {
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const historyPageSize = 5;

  // Se não há ativo selecionado, não renderizar nada
  if (!currentAsset) return null;

  // Paginar o histórico
  const start = (currentHistoryPage - 1) * historyPageSize;
  const end = start + historyPageSize;
  const paginatedHistory = currentAsset.historico 
    ? currentAsset.historico.slice(start, end) 
    : [];
  const totalHistoryItems = currentAsset.historico 
    ? currentAsset.historico.length 
    : 0;

  const handleHistoryPageChange = (page) => {
    setCurrentHistoryPage(page);
  };

  // Função para renderizar ícone apropriado baseado no tipo de operação
  const getTimelineIcon = (item) => {
    if (item.motivo?.includes("Cadastro")) {
      return <ImportOutlined style={{ color: '#1890ff' }} />;
    }
    return <HistoryOutlined style={{ color: '#52c41a' }} />;
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