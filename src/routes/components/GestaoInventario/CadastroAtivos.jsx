import React from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Form, Input, Select, Button, Row, Col, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

export const CadastroAtivos = ({ openNotificationSucess, addAssetToState }) => {
  const [searchParams] = useSearchParams();
  const pipeId = searchParams.get("pipeId");

  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    // Adicionar data atual e histórico inicial
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  
    // Criar objeto de ativo com histórico inicial
    const newAsset = {
      ...values,
      historico: [
        {
          data: formattedDate,
          destino: "Estoque",
          nomeDestino: "Entrada inicial no sistema",
          os: "N/A",
          motivo: "Cadastro inicial do ativo",
          responsavel: "Sistema",
        },
      ],
    };
  
    // Prepare data for API
    const requestData = {
      collectionURL: `/ativos`,
      docId: values.serialMaquina, // Using serialMaquina as the document ID
      formData: newAsset
    };
  
    // Call the API to save the asset
    fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Falha ao cadastrar ativo');
        }
        return response.text();
      })
      .then(data => {
        openNotificationSucess("Ativo cadastrado com sucesso!");
        form.resetFields();
        
        // Add to state if function exists
        if (addAssetToState) {
          addAssetToState(newAsset);
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        openNotificationSucess("Erro ao cadastrar ativo", "error");
      });
  };

  return (
    <Card title="Cadastrar Novo Ativo" style={{ width: "100%" }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Modelo"
              name="modelo"
              rules={[
                { required: true, message: "Por favor, informe o modelo!" },
              ]}
            >
              <Input placeholder="Modelo do ativo" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Categoria"
              name="categoria"
              rules={[
                {
                  required: true,
                  message: "Por favor, selecione a categoria!",
                },
              ]}
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
            <Form.Item label="RFID" name="rfid">
              <Input placeholder="RFID" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Serial da Máquina"
              name="serialMaquina"
              rules={[
                {
                  required: true,
                  message: "Por favor, informe o serial da máquina!",
                },
              ]}
            >
              <Input placeholder="Serial da máquina" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Serial N"
              name="serialN"
              rules={[
                { required: true, message: "Por favor, informe o Serial N!" },
              ]}
            >
              <Input placeholder="Serial N" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Device Z"
              name="deviceZ"
              rules={[
                { required: true, message: "Por favor, informe o Device Z!" },
              ]}
            >
              <Input placeholder="Device Z" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Situação"
              name="situacao"
              initialValue="Apto"
              rules={[
                { required: true, message: "Por favor, selecione a situação!" },
              ]}
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
              rules={[
                {
                  required: true,
                  message: "Por favor, informe o detalhamento!",
                },
              ]}
            >
              <Select placeholder="Selecione o detalhamento">
                <Option value="Em perfeito estado">Em perfeito estado</Option>
                <Option value="Tela quebrada">Tela quebrada</Option>
                <Option value="Bateria defeituosa">Bateria defeituosa</Option>
                <Option value="Tamper violado">Tamper violado</Option>
                <Option value="Problema de comunicação">
                  Problema de comunicação
                </Option>
                <Option value="Leitor de cartão danificado">
                  Leitor de cartão danificado
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Alocação"
              name="alocacao"
              rules={[
                { required: true, message: "Por favor, informe a alocação!" },
              ]}
            >
              <Select placeholder="Selecione a localização">
                <Option value="São Paulo - SP (Matriz)">
                  São Paulo - SP (Matriz)
                </Option>
                <Option value="Rio de Janeiro - RJ">Rio de Janeiro - RJ</Option>
                <Option value="Salvador - BA">Salvador - BA</Option>
                <Option value="Vitória - ES">Vitória - ES</Option>
                <Option value="Belém - PA">Belém - PA</Option>
                <Option value="Recife - PE">Recife - PE</Option>
                <Option value="Belo Horizonte - MG">Belo Horizonte - MG</Option>
                <Option value="Goiânia - GO">Goiânia - GO</Option>
                <Option value="Porto Alegre - RS">Porto Alegre - RS</Option>
                <Option value="Fortaleza - CE">Fortaleza - CE</Option>
                <Option value="Brasília - DF">Brasília - DF</Option>
                <Option value="Curitiba - PR">Curitiba - PR</Option>
                <Option value="Balneário Camboriú - SC">
                  Balneário Camboriú - SC
                </Option>
                <Option value="Floripa - SC">Floripa - SC</Option>
                <Option value="Ribeirão Preto - SP">Ribeirão Preto - SP</Option>
                <Option value="Uberlândia - MG">Uberlândia - MG</Option>
                <Option value="Campinas - SP">Campinas - SP</Option>
                <Option value="Campo Grande - MS">Campo Grande - MS</Option>
                <Option value="Caxias do Sul - RS">Caxias do Sul - RS</Option>
                <Option value="Cuiabá - MT">Cuiabá - MT</Option>
                <Option value="João Pessoa - PB">João Pessoa - PB</Option>
                <Option value="Londrina - PR">Londrina - PR</Option>
                <Option value="Manaus - AM">Manaus - AM</Option>
                <Option value="Natal - RN">Natal - RN</Option>
                <Option value="Porto Seguro - BA">Porto Seguro - BA</Option>
                <Option value="Santos - SP">Santos - SP</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={() => form.resetFields()}>Limpar</Button>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
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
