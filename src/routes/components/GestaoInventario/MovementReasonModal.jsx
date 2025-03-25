import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, Space, Typography, Alert } from 'antd';

// Import the localizacoes directly
const LOCALIZACOES = [
    'São Paulo - SP (Matriz)',
    'Rio de Janeiro - RJ',
    'Salvador - BA',
    'Vitória - ES',
    'Belém - PA',
    'Recife - PE',
    'Belo Horizonte - MG',
    'Goiânia - GO',
    'Porto Alegre - RS',
    'Fortaleza - CE',
    'Brasília - DF',
    'Curitiba - PR',
    'Balneário Camboriú - SC',
    'Floripa - SC',
    'Ribeirão Preto - SP',
    'Uberlândia - MG',
    'Campinas - SP',
    'Campo Grande - MS',
    'Caxias do Sul - RS',
    'Cuiabá - MT',
    'João Pessoa - PB',
    'Londrina - PR',
    'Manaus - AM',
    'Natal - RN',
    'Porto Seguro - BA',
    'Santos - SP'
];

const { TextArea } = Input;
const { Title, Text } = Typography;

const MovementReasonModal = ({ 
  visible, 
  onOk, 
  onCancel, 
  assets,
  movementType 
}) => {
  const [reason, setReason] = useState('');
  const [branch, setBranch] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  // Definir opções de motivo baseado no tipo de movimento
  const getReasonOptions = () => {
    const baseOptions = [
      { value: 'os', label: 'Movido para o evento (OS)' },
      { value: 'maintenance', label: 'Manutenção na adquirente' }
    ];

    if (movementType === 'transfer') {
      baseOptions.push({
        value: 'branch',
        label: 'Movido para a filial'
      });
    }

    return baseOptions;
  };

  const handleOk = () => {
    // Validate
    if (!reason) {
      setError('Por favor, selecione um motivo para a movimentação');
      return;
    }

    if (reason === 'branch' && !branch) {
      setError('Por favor, selecione a filial de destino');
      return;
    }

    // Preparar dados do movimento
    const movementData = {
      reason,
      details,
      branch: reason === 'branch' ? branch : null,
      assets, // Passar os ativos movidos
      timestamp: new Date().toISOString()
    };

    // Chamar função de callback com os dados do movimento
    onOk(movementData);

    // Limpar estados
    form.resetFields();
    setReason('');
    setBranch('');
    setDetails('');
    setError('');
  };

  const handleCancel = () => {
    // Reset form and states
    form.resetFields();
    setReason('');
    setBranch('');
    setDetails('');
    setError('');
    onCancel();
  };

  return (
    <Modal
      title="Motivo da Movimentação"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose={true}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        {/* Motivo da Movimentação */}
        <Form.Item 
          label="Motivo da Movimentação *" 
          required
          validateStatus={!reason && error ? "error" : ""}
          help={!reason && error ? error : ""}
        >
          <Select
            placeholder="Selecione o motivo"
            value={reason}
            onChange={(value) => {
              setReason(value);
              setError('');
            }}
            options={getReasonOptions()}
          />
        </Form.Item>

        {/* Filial (se o motivo for transferência de filial) */}
        {reason === 'branch' && (
          <Form.Item
            label="Filial de Destino *"
            required
            validateStatus={reason === 'branch' && !branch && error ? "error" : ""}
            help={reason === 'branch' && !branch && error ? error : ""}
          >
            <Select
              placeholder="Selecione a filial"
              value={branch}
              onChange={(value) => {
                setBranch(value);
                setError('');
              }}
              options={LOCALIZACOES.map(loc => ({
                label: loc,
                value: loc
              }))}
            />
          </Form.Item>
        )}

        {/* Detalhes Adicionais */}
        <Form.Item label="Detalhes Adicionais (Opcional)">
          <TextArea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Informações adicionais sobre a movimentação"
          />
        </Form.Item>

        {/* Footer buttons */}
        <Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="primary" onClick={handleOk}>
              Confirmar Movimentação
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MovementReasonModal;