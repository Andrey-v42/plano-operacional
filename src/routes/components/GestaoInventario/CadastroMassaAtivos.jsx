import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Form,
  Upload,
  Button,
  Row,
  Col,
  Space,
  Table,
  Typography,
  Steps,
  Divider,
  Alert,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;
const { Step } = Steps;

export const CadastroMassaAtivos = ({
  openNotificationSucess,
  addAssetsToState,
}) => {
  const [searchParams] = useSearchParams();
  const pipeId = searchParams.get("pipeId");

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  // Função para baixar o modelo Excel
  const downloadTemplate = () => {
    // Array com os cabeçalhos do modelo Excel
    const headers = [
      "Categoria",
      "Tipo",
      "Modelo",
      "Adquirencia",
      "RFID",
      "SerialMaquina",
      "SerialN",
      "DeviceZ",
      "Situacao",
      "Detalhamento",
      "Alocacao",
    ];

    // Criar um novo workbook
    const wb = XLSX.utils.book_new();
    // Criar uma nova worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers]);

    // Adicionar algumas linhas de exemplo
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          "Máquina",
          "SMARTPOS",
          "POS A30",
          "Cielo",
          "123456789",
          "SM12345",
          "SN12345",
          "DZ12345",
          "Apto",
          "Em perfeito estado",
          "São Paulo - SP (Matriz)",
        ],
        [
          "Insumo",
          "POS",
          "SmartPOS D195",
          "Stone",
          "987654321",
          "SM67890",
          "SN67890",
          "DZ67890",
          "Apto",
          "Em perfeito estado",
          "Rio de Janeiro - RJ",
        ],
      ],
      { origin: "A2" }
    );

    // Adicionar validação para as colunas
    ws["!validations"] = [
      {
        sqref: "A2:A1000",
        formulas: ['"Máquina,Insumo"'],
      },
      {
        sqref: "B2:B1000",
        formulas: ['"SMARTPOS,POS,TOTEM,MOBILE,OUTROS"'],
      },
      {
        sqref: "D2:D1000",
        formulas: ['"Cielo,Stone,PagSeguro,Rede,GetNet,Safra"'],
      },
      {
        sqref: "I2:I1000",
        formulas: ['"Apto,Inapto"'],
      },
    ];

    // Ajustar largura das colunas
    ws["!cols"] = [
      { width: 12 }, // Categoria
      { width: 12 }, // Tipo
      { width: 15 }, // Modelo
      { width: 12 }, // Adquirência
      { width: 12 }, // RFID
      { width: 15 }, // SerialMaquina
      { width: 12 }, // SerialN
      { width: 12 }, // DeviceZ
      { width: 10 }, // Situacao
      { width: 25 }, // Detalhamento
      { width: 25 }, // Alocacao
    ];

    // Adicionar a worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Ativos");

    // Converter para blob e baixar
    XLSX.writeFile(wb, "modelo_cadastro_ativos.xlsx");
  };

  // Função para processar o arquivo Excel
  const processFile = (file) => {
    setUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Validar os dados
        const errors = [];
        const processedData = json.map((row, index) => {
          const rowNumber = index + 2; // +2 porque a primeira linha é o cabeçalho e o Excel começa em 1

          // Verificar campos obrigatórios
          const requiredFields = [
            "Categoria",
            "Tipo",
            "Modelo",
            "Adquirencia",
            "SerialMaquina",
            "SerialN",
            "DeviceZ",
            "Situacao",
            "Detalhamento",
            "Alocacao",
          ];
          for (const field of requiredFields) {
            if (!row[field]) {
              errors.push({
                row: rowNumber,
                field,
                message: `Campo obrigatório não preenchido`,
              });
            }
          }

          // Verificar valores válidos para categoria
          const categoriasValidas = ["Máquina", "Insumo"];
          if (row.Categoria && !categoriasValidas.includes(row.Categoria)) {
            errors.push({
              row: rowNumber,
              field: "Categoria",
              message: `Valor inválido. Use: ${categoriasValidas.join(", ")}`,
            });
          }
          
          // Verificar valores válidos para tipo
          const tiposValidos = ["SMARTPOS", "POS", "TOTEM", "MOBILE", "OUTROS"];
          if (row.Tipo && !tiposValidos.includes(row.Tipo)) {
            errors.push({
              row: rowNumber,
              field: "Tipo",
              message: `Valor inválido. Use: ${tiposValidos.join(", ")}`,
            });
          }
          
          // Verificar valores válidos para adquirência
          const adquirenciasValidas = ["Cielo", "Stone", "PagSeguro", "Pinbank", "Rede", "GetNet", "Safra"];
          if (row.Adquirencia && !adquirenciasValidas.includes(row.Adquirencia)) {
            errors.push({
              row: rowNumber,
              field: "Adquirencia",
              message: `Valor inválido. Use: ${adquirenciasValidas.join(", ")}`,
            });
          }

          // Verificar valores válidos para situação
          const situacoesValidas = ["Apto", "Inapto"];
          if (row.Situacao && !situacoesValidas.includes(row.Situacao)) {
            errors.push({
              row: rowNumber,
              field: "Situacao",
              message: `Valor inválido. Use: ${situacoesValidas.join(", ")}`,
            });
          }

          // Verificar valores válidos para alocação
          const alocacoesValidas = [
            "São Paulo - SP (Matriz)",
            "Rio de Janeiro - RJ",
            "Salvador - BA",
            "Vitória - ES",
            "Belém - PA",
            "Recife - PE",
            "Belo Horizonte - MG",
            "Goiânia - GO",
            "Porto Alegre - RS",
            "Fortaleza - CE",
            "Brasília - DF",
            "Curitiba - PR",
            "Balneário Camboriú - SC",
            "Floripa - SC",
            "Ribeirão Preto - SP",
            "Uberlândia - MG",
            "Campinas - SP",
            "Campo Grande - MS",
            "Caxias do Sul - RS",
            "Cuiabá - MT",
            "João Pessoa - PB",
            "Londrina - PR",
            "Manaus - AM",
            "Natal - RN",
            "Porto Seguro - BA",
            "Santos - SP",
          ];

          if (row.Alocacao && !alocacoesValidas.includes(row.Alocacao)) {
            errors.push({
              row: rowNumber,
              field: "Alocacao",
              message: `Valor inválido. Utilize uma localização válida.`,
            });
          }

          // Retorna a linha com um ID para a tabela React
          return {
            key: `row-${rowNumber}`,
            ...row,
            rowNumber,
          };
        });

        setData(processedData);
        setValidationErrors(errors);

        if (errors.length === 0) {
          setCurrentStep(1); // Avançar para o próximo passo se não houver erros
        }

        setUploading(false);
      } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        setUploading(false);
      }
    };

    reader.readAsBinaryString(file);
    return false; // Impedir o upload automático do componente Upload
  };

  // Props para o componente Upload
  const uploadProps = {
    onRemove: (file) => {
      setFileList([]);
      setData([]);
      setValidationErrors([]);
      setCurrentStep(0);
    },
    beforeUpload: (file) => {
      // Verificar se o arquivo é Excel
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";
      if (!isExcel) {
        openNotificationSucess(
          "Por favor, envie apenas arquivos Excel!",
          "error"
        );
        return false;
      }

      setFileList([file]);
      processFile(file);
      return false;
    },
    fileList,
  };

  // Colunas para a tabela de dados
  const columns = [
    { title: "Linha", dataIndex: "rowNumber", key: "rowNumber" },
    { title: "Categoria", dataIndex: "Categoria", key: "categoria" },
    { title: "Tipo", dataIndex: "Tipo", key: "tipo" },
    { title: "Modelo", dataIndex: "Modelo", key: "modelo" },
    { title: "Adquirência", dataIndex: "Adquirencia", key: "adquirencia" },
    { title: "RFID", dataIndex: "RFID", key: "rfid" },
    {
      title: "Serial da Máquina",
      dataIndex: "SerialMaquina",
      key: "serialMaquina",
    },
    { title: "Serial N", dataIndex: "SerialN", key: "serialN" },
    { title: "Device Z", dataIndex: "DeviceZ", key: "deviceZ" },
    { title: "Situação", dataIndex: "Situacao", key: "situacao" },
    { title: "Detalhamento", dataIndex: "Detalhamento", key: "detalhamento" },
    { title: "Alocação", dataIndex: "Alocacao", key: "alocacao" },
  ];

  // Colunas para a tabela de erros
  const errorColumns = [
    { title: "Linha", dataIndex: "row", key: "row" },
    { title: "Campo", dataIndex: "field", key: "field" },
    { title: "Erro", dataIndex: "message", key: "message" },
  ];

  // Função para enviar os dados para o backend e atualizar a tabela de ativos
  const handleSubmit = () => {
    setUploading(true);

    // Obter data e hora atual para o histórico
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    // Converter dados para o formato esperado
    const formattedData = data.map((row) => ({
      categoria: row.Categoria,
      tipo: row.Tipo,
      modelo: row.Modelo,
      adquirencia: row.Adquirencia,
      rfid: row.RFID || "",
      serialMaquina: row.SerialMaquina,
      serialN: row.SerialN,
      deviceZ: row.DeviceZ,
      situacao: row.Situacao,
      detalhamento: row.Detalhamento,
      alocacao: row.Alocacao,
      // Adicionar histórico inicial
      historico: [
        {
          data: formattedDate,
          destino: "Estoque",
          nomeDestino: "Entrada inicial no sistema",
          os: "N/A",
          motivo: "Cadastro em massa",
          responsavel: "Sistema",
        },
      ],
    }));

    // Usar Promise.all para enviar cada ativo
    const promises = formattedData.map((asset) => {
      const requestData = {
        collectionURL: `/ativos`,
        docId: asset.serialMaquina, // Using serialMaquina as the document ID
        formData: asset,
      };

      return fetch(
        "https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );
    });

    // Process all promises
    Promise.all(promises)
      .then((responses) => {
        // Check if all responses are OK
        const allOk = responses.every((response) => response.ok);
        if (!allOk) {
          throw new Error("Alguns ativos não puderam ser cadastrados");
        }

        // Add assets to state and get count
        const addedCount = addAssetsToState(formattedData);

        // Notify user
        openNotificationSucess(`${addedCount} ativos cadastrados com sucesso!`);

        // Clear form
        setUploading(false);
        setFileList([]);
        setData([]);
        setValidationErrors([]);
        setCurrentStep(0);
      })
      .catch((error) => {
        console.error("Erro:", error);
        openNotificationSucess("Erro ao cadastrar ativos", "error");
        setUploading(false);
      });
  };

  // Renderizar diferentes etapas baseadas no currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Alert
                  message="Instruções"
                  description={
                    <>
                      <p>1. Baixe o modelo Excel clicando no botão abaixo.</p>
                      <p>
                        2. Preencha os dados dos ativos no arquivo, seguindo o
                        formato do modelo.
                      </p>
                      <p>
                        3. Faça o upload do arquivo preenchido para cadastrar os
                        ativos em massa.
                      </p>
                      <p>
                        4. Campos obrigatórios: Categoria, Tipo, Modelo, Adquirência, 
                        Serial da Máquina, Serial N, Device Z, Situação, 
                        Detalhamento e Alocação.
                      </p>
                    </>
                  }
                  type="info"
                  showIcon
                />
              </Col>
              <Col span={24}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={downloadTemplate}
                    type="primary"
                    ghost
                  >
                    Baixar Modelo Excel
                  </Button>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} loading={uploading}>
                      Selecionar Arquivo Excel
                    </Button>
                  </Upload>
                </Space>
              </Col>
            </Row>

            {validationErrors.length > 0 && (
              <>
                <Divider />
                <Alert
                  message="Erros encontrados no arquivo"
                  description="Corrija os erros abaixo e faça o upload novamente."
                  type="error"
                  showIcon
                />
                <Table
                  columns={errorColumns}
                  dataSource={validationErrors}
                  pagination={{ pageSize: 5 }}
                  style={{ marginTop: 16 }}
                />
              </>
            )}
          </>
        );

      case 1:
        return (
          <>
            <Alert
              message="Confira os dados antes de confirmar o cadastro"
              description="Verifique se todos os dados estão corretos antes de salvar. Serão cadastrados todos os ativos listados abaixo."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={columns}
              dataSource={data}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
            <Row justify="end" style={{ marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(0)}>Voltar</Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={uploading}
                  icon={<SaveOutlined />}
                >
                  Cadastrar {data.length} Ativos
                </Button>
              </Space>
            </Row>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card title="Cadastro em Massa de Ativos" style={{ width: "100%" }}>
      <Steps
        current={currentStep}
        style={{ marginBottom: 24 }}
        items={[
          {
            title: "Upload do Arquivo",
            icon: <UploadOutlined />,
          },
          {
            title: "Confirmação",
            icon:
              currentStep === 1 ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              ),
          },
        ]}
      />

      {renderStep()}
    </Card>
  );
};

export default CadastroMassaAtivos;