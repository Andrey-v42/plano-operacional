import React from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Space 
} from 'antd';
import { 
  PlusOutlined 
} from '@ant-design/icons';

const { Option } = Select;

export const CadastroAtivos = ({ openNotificationSucess }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('Valores do formulário:', values);
    
    // Simular envio para backend
    setTimeout(() => {
      openNotificationSucess('Ativo cadastrado com sucesso!');
      form.resetFields();
    }, 500);
  };

  return (
    <Card title="Cadastrar Novo Ativo" style={{ width: "100%" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Modelo"
              name="modelo"
              rules={[{ required: true, message: 'Por favor, informe o modelo!' }]}
            >
              <Input placeholder="Modelo do ativo" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Categoria"
              name="categoria"
              rules={[{ required: true, message: 'Por favor, selecione a categoria!' }]}
            >
              <Select placeholder="Selecione a categoria">
                <Option value="POS">POS</Option>
                <Option value="SmartPOS">SmartPOS</Option>
                <Option value="Mobile">Mobile</Option>
                <Option value="Máquina">Máquina</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="RFID"
              name="rfid"
              rules={[{ required: true, message: 'Por favor, informe o RFID!' }]}
            >
              <Input placeholder="RFID" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Serial da Máquina"
              name="serialMaquina"
              rules={[{ required: true, message: 'Por favor, informe o serial da máquina!' }]}
            >
              <Input placeholder="Serial da máquina" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Serial N"
              name="serialN"
              rules={[{ required: true, message: 'Por favor, informe o Serial N!' }]}
            >
              <Input placeholder="Serial N" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Device Z"
              name="deviceZ"
            >
              <Input placeholder="Device Z" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Situação"
              name="situacao"
              initialValue="Apto"
              rules={[{ required: true, message: 'Por favor, selecione a situação!' }]}
            >
              <Select placeholder="Selecione a situação">
                <Option value="Apto">Apto</Option>
                <Option value="Inapto">Inapto</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Detalhamento"
              name="detalhamento"
              rules={[{ required: true, message: 'Por favor, informe o detalhamento!' }]}
            >
              <Select placeholder="Selecione o detalhamento">
                <Option value="Em perfeito estado">Em perfeito estado</Option>
                <Option value="Tela quebrada">Tela quebrada</Option>
                <Option value="Bateria defeituosa">Bateria defeituosa</Option>
                <Option value="Tamper violado">Tamper violado</Option>
                <Option value="Problema de comunicação">Problema de comunicação</Option>
                <Option value="Leitor de cartão danificado">Leitor de cartão danificado</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Alocação"
              name="alocacao"
              rules={[{ required: true, message: 'Por favor, informe a alocação!' }]}
            >
              <Input placeholder="Local de alocação atual" />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={() => form.resetFields()}>Limpar</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />}
              >
                Cadastrar
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default CadastroAtivos;