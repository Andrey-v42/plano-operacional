import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, Table, Select, Upload, notification, Descriptions, Flex } from 'antd';
import { ExclamationCircleOutlined, SmileOutlined, UploadOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { render } from 'react-dom';
import Dashboard from './Dashboard'
const { TextArea } = Input;
const { TabPane } = Tabs;

const Suporte = () => {
    const [optionsPontos, setOptionsPontos] = useState(null)
    const [fileList, setFileList] = useState([]);
    const [buttonChamadoLoading, setButtonChamadoLoading] = useState(false)
    const [dataChamados, setDataChamados] = useState([])
    const [answerFormVisible, setAnswerFormVisible] = useState(false)
    const [buttonAnswerLoading, setButtonAnswerLoading] = useState(false)

    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');

    const [formChamado] = Form.useForm();
    const [formAnswer] = Form.useForm();
    const [api, contextHolder] = notification.useNotification()

    const columnsChamados = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Solicitante',
            dataIndex: 'solicitante',
            key: 'solicitante',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'pending') {
                    return <span style={{ color: 'red' }}>Aberto</span>
                } else if (status === 'closed') {
                    return <span style={{ color: 'green' }}>Fechado</span>
                } else {
                    return <span style={{ color: 'blue' }}>Em análise</span>
                }
            }
        },
        {
            title: 'Data',
            dataIndex: 'timestampAberto',
            key: 'timestampAberto',
            render: (timestampAberto) => new Date(timestampAberto).toLocaleString()
        },
        {
            title: 'Categoria',
            dataIndex: 'categoria',
            key: 'categoria',
        },
        {
            title: 'Nível de urgência',
            dataIndex: 'urgencia',
            key: 'urgencia',
        },
    ];

    const optionsCategoria = [
        { "label": "Acesso Dashboard", "value": "Acesso Dashboard" },
        { "label": "Acesso Backoffice", "value": "Acesso Backoffice" },
        { "label": "Alter. de Cardápio", "value": "Alter. de Cardápio" },
        { "label": "Alter. de funcionalidades/Admin", "value": "Alter. de funcionalidades/Admin" },
        { "label": "Alter. de funcionalidades/Cargo", "value": "Alter. de funcionalidades/Cargo" },
        { "label": "Alter. de funcionalidades/Dash-Extranet", "value": "Alter. de funcionalidades/Dash-Extranet" },
        { "label": "Alter. de PDV", "value": "Alter. de PDV" },
        { "label": "Análise Relatorial", "value": "Análise Relatorial" },
        { "label": "Aprovação de Place", "value": "Aprovação de Place" },
        { "label": "Associar Cardapio a operador", "value": "Associar Cardapio a operador" },
        { "label": "Associar Device", "value": "Associar Device" },
        { "label": "Avaria", "value": "Avaria" },
        { "label": "Bug - Report", "value": "Bug - Report" },
        { "label": "Cobrança duplicada", "value": "Cobrança duplicada" },
        { "label": "Config SubAdquirente", "value": "Config SubAdquirente" },
        { "label": "Criação de operador", "value": "Criação de operador" },
        { "label": "Criação PDV + Cardápio", "value": "Criação PDV + Cardápio" },
        { "label": "Duplicação de Saldo", "value": "Duplicação de Saldo" },
        { "label": "Dúvida - Processo / Produto", "value": "Dúvida - Processo / Produto" },
        { "label": "Entradas", "value": "Entradas" },
        { "label": "Envio de Material", "value": "Envio de Material" },
        { "label": "Erro ao bater ponto digital", "value": "Erro ao bater ponto digital" },
        { "label": "Erro de Impressão", "value": "Erro de Impressão" },
        { "label": "Erro de leitura na TAG", "value": "Erro de leitura na TAG" },
        { "label": "Erro de Login", "value": "Erro de Login" },
        { "label": "Erro estorno adquirência", "value": "Erro estorno adquirência" },
        { "label": "Erro msg adquirência", "value": "Erro msg adquirência" },
        { "label": "Erro Operacional", "value": "Erro Operacional" },
        { "label": "Estoque Z", "value": "Estoque Z" },
        { "label": "Falha de impressão", "value": "Falha de impressão" },
        { "label": "Falha de Sincronia", "value": "Falha de Sincronia" },
        { "label": "Fech. de comanda Pós Paga", "value": "Fech. de comanda Pós Paga" },
        { "label": "Impressora", "value": "Impressora" },
        { "label": "Inclusão de entrada", "value": "Inclusão de entrada" },
        { "label": "Inclusão de produto", "value": "Inclusão de produto" },
        { "label": "Limite não integrado", "value": "Limite não integrado" },
        { "label": "Logo de Ficha", "value": "Logo de Ficha" },
        { "label": "Mapeamento de relatório", "value": "Mapeamento de relatório" },
        { "label": "Multiplos pagamentos", "value": "Multiplos pagamentos" },
        { "label": "Problemas de conexão", "value": "Problemas de conexão" },
        { "label": "Produtos de Devolução", "value": "Produtos de Devolução" },
        { "label": "Prot. de entrega de terminais", "value": "Prot. de entrega de terminais" },
        { "label": "Pix não funcionando", "value": "Pix não funcionando" },
        { "label": "Queda de Adquirência", "value": "Queda de Adquirência" },
        { "label": "Reaproveitamento de Valores", "value": "Reaproveitamento de Valores" },
        { "label": "Recargas expiradas", "value": "Recargas expiradas" },
        { "label": "Renomear operadores", "value": "Renomear operadores" },
        { "label": "Transação Apartada", "value": "Transação Apartada" },
        { "label": "Transações off", "value": "Transações off" },
        { "label": "Venda Apartada", "value": "Venda Apartada" },
        { "label": "Vincular bar a operador", "value": "Vincular bar a operador" },
        { "label": "Vincular bar a vendor", "value": "Vincular bar a vendor" },
        { "label": "Zig Tag Cheio", "value": "Zig Tag Cheio" },
        { "label": "Alter. data de térm. vendas - Evento Ativo", "value": "Alter. data de térm. vendas - Evento Ativo" },
        { "label": "Alter. data de término - Evento encerrado", "value": "Alter. data de término - Evento encerrado" },
        { "label": "Alter. do nome do evento", "value": "Alter. do nome do evento" },
        { "label": "Aplicativo de venda de ingresso - PDV", "value": "Aplicativo de venda de ingresso - PDV" },
        { "label": "Ativação de Token", "value": "Ativação de Token" },
        { "label": "Atraso/falha no envio do repasse", "value": "Atraso/falha no envio do repasse" },
        { "label": "BUG - APP validação de Ingressos", "value": "BUG - APP validação de Ingressos" },
        { "label": "BUG - APP venda de Ingresso", "value": "BUG - APP venda de Ingresso" },
        { "label": "BUG - Marketplace (site de vendas)", "value": "BUG - Marketplace (site de vendas)" },
        { "label": "BUG - Painel", "value": "BUG - Painel" },
        { "label": "Cancelamento do estorno", "value": "Cancelamento do estorno" },
        { "label": "Cancelamento do evento", "value": "Cancelamento do evento" },
        { "label": "Cancelar ingresso", "value": "Cancelar ingresso" },
        { "label": "Compras analisadas pelo time de Risco", "value": "Compras analisadas pelo time de Risco" },
        { "label": "Dúvida - Códigos e promoters", "value": "Dúvida - Códigos e promoters" },
        { "label": "Dúvida - Conferência de relatórios", "value": "Dúvida - Conferência de relatórios" },
        { "label": "Dúvida - Config de ingressos e grupos", "value": "Dúvida - Config de ingressos e grupos" },
        { "label": "Solicit. Troca lote ingressos", "value": "Solicit. Troca lote ingressos" },
        { "label": "Transferência de ingresso", "value": "Transferência de ingresso" },
        { "label": "Transferência de valor (antecipação)", "value": "Transferência de valor (antecipação)" }
    ]

    const optionsTerminal = [
        { label: 'Pag A930', value: 'Pag A930' },
        { label: 'Pag P2', value: 'Pag P2' },
        { label: 'Pag Moderninha X', value: 'Pag Moderninha X' },
        { label: 'Safra P2', value: 'Safra P2' },
        { label: 'Safra L300', value: 'Safra L300' },
        { label: 'Getnet P2', value: 'Getnet P2' },
        { label: 'Pinbank P2', value: 'Pinbank P2' },
        { label: 'Mercado Pago A910', value: 'Mercado Pago A910' },
        { label: 'Cielo L300', value: 'Cielo L300' },
        { label: 'Rede L400', value: 'Rede L400' },
        { label: 'PDV (Celular)', value: 'PDV (Celular)' },
    ]

    const sendNotification = async (values) => {
        const responseEvento = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: 'pipe', docId: `pipeId_${pipeId}` })
        })
        const dataEvento = await responseEvento.json()
        console.log(dataEvento)
        const responseUsers = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: 'users',
            })
        })
        let dataUsers = await responseUsers.json()
        const dataUsersArray = dataUsers.docs.map(doc => ({ id: doc.id, permission: doc.data.permission, name: doc.data.username, tokens: doc.data.tokens || [] }))

        for (const user of dataUsersArray) {
            if (dataEvento.equipeEscalada.some(item => (item.funcao == 'Head' && item.nome === user.name) || (item.funcao == 'C-CCO' && item.nome === user.name) || (user.permission === 'admin'))) {
                console.log(user)
                if (user.tokens.length > 0) {
                    try {
                        const response = await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                title: 'Novo ticket de suporte pendente',
                                body: `Olá, ${user.name}. Um novo chamado foi aberto por ${localStorage.getItem('currentUser')}. Nível de urgência: ${values.urgencia}`,
                                userId: user.id,
                            }),
                        })
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
            }
        }
    }

    const sendNotificationAnalysis = async (userId, ticketId) => {
        const response = await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Seu chamado está em análise',
                body: `Olá, seu ticket de ID ${ticketId} está em análise.`,
                userId: userId,
            }),
        })
    }

    const sendNotificationClosed = async (userId, ticketId) => {
        const response = await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Seu chamado foi respondido',
                body: `Olá, seu ticket de ID ${ticketId} foi respondido.`,
                userId: userId,
            }),
        })
    }

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        console.log(newFileList)
    };

    const enviarChamado = async (values) => {
        if (values.categoria && values.urgencia && values.ponto && values.modelo && values.descricao) {
            setButtonChamadoLoading(true)
            try {
                const responseUsers = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: 'users',
                    })
                })
                let dataUsers = await responseUsers.json()
                const dataUsersArray = dataUsers.docs.map(doc => ({ id: doc.id, name: doc.data.username }))
                let userId;
                for (const dataUser of dataUsersArray) {
                    if (dataUser.name === localStorage.getItem('currentUser')) {
                        userId = dataUser.id
                    }
                }

                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        collectionURL: `pipe/pipeId_${pipeId}/chamados`,
                        formData: { timestampAberto: new Date().getTime(), status: 'pending', solicitante: localStorage.getItem('currentUser'), userId: userId, ...values }
                    })
                });

                if (response.ok) {
                    openNotificationSucess('Chamado aberto com sucesso!');
                    await sendNotification(values)
                    formChamado.resetFields();
                    setButtonChamadoLoading(false)
                    try {
                        const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                url: `pipe/pipeId_${pipeId}/chamados`
                            })
                        })
                        let data = await response.json()
                        data = data.docs
                        const chamados = data.map((doc) => {
                            return {
                                key: doc.id,
                                id: doc.id,
                                solicitante: doc.data.solicitante,
                                categoria: doc.data.categoria,
                                status: doc.data.status,
                                timestampAberto: doc.data.timestampAberto,
                                urgencia: doc.data.urgencia,
                                ponto: doc.data.ponto,
                                modelo: doc.data.modelo,
                                descricao: doc.data.descricao,
                                resposta: doc.data.resposta || '',
                                anexos: doc.data.anexos || [],
                                atendente: doc.data.atendente || '',
                                timestampResposta: doc.data.timestampResposta || '',
                                timestampAnalise: doc.data.timestampAnalise || '',
                                userId: doc.data.userId || '',
                            }
                        })
                        setDataChamados(chamados)
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    setButtonChamadoLoading(false)
                    openNotificationFailure('Erro ao abrir chamado. Tente novamente ou entre em contato com o suporte por outros canais de atendimento.');
                }

            } catch (error) {
                setButtonChamadoLoading(false)
                console.error('Error:', error);
                openNotificationFailure('Erro ao abrir chamado. Tente novamente ou entre em contato com o suporte por outros canais de atendimento.');
            }
        } else {
            setButtonChamadoLoading(false)
            openNotificationFailure('Por favor, preencha todos os campos obrigatórios.');
        }
    };

    const changeStatus = async (id) => {
        try {
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDocMerge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe`, docId: `pipeId_${pipeId}/chamados/${id}`, data: { timestampAnalise: new Date().getTime(), status: 'analysis' } })
            });

            try {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: `pipe/pipeId_${pipeId}/chamados`
                    })
                })
                let data = await response.json()
                data = data.docs
                const chamados = data.map((doc) => {
                    return {
                        key: doc.id,
                        id: doc.id,
                        solicitante: doc.data.solicitante,
                        categoria: doc.data.categoria,
                        status: doc.data.status,
                        timestampAberto: doc.data.timestampAberto,
                        urgencia: doc.data.urgencia,
                        ponto: doc.data.ponto,
                        modelo: doc.data.modelo,
                        descricao: doc.data.descricao,
                        resposta: doc.data.resposta || '',
                        anexos: doc.data.anexos || [],
                        atendente: doc.data.atendente || '',
                        timestampResposta: doc.data.timestampResposta || '',
                        timestampAnalise: doc.data.timestampAnalise || '',
                        userId: doc.data.userId || '',
                    }
                })
                setDataChamados(chamados)
                const currentTicket = chamados.find((chamado) => chamado.id === id);
                sendNotificationAnalysis(currentTicket.userId, id)
            } catch (error) {
                console.log(error)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const answerTicket = async (id, values) => {
        try {
            setButtonAnswerLoading(true)
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDocMerge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe`, docId: `pipeId_${pipeId}/chamados/${id}`, data: { timestampResposta: new Date().getTime(), status: 'closed', atendente: localStorage.getItem('currentUser'), ...values } })
            });

            try {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: `pipe/pipeId_${pipeId}/chamados`
                    })
                })
                let data = await response.json()
                data = data.docs
                const chamados = data.map((doc) => {
                    return {
                        key: doc.id,
                        id: doc.id,
                        solicitante: doc.data.solicitante,
                        categoria: doc.data.categoria,
                        status: doc.data.status,
                        timestampAberto: doc.data.timestampAberto,
                        urgencia: doc.data.urgencia,
                        ponto: doc.data.ponto,
                        modelo: doc.data.modelo,
                        descricao: doc.data.descricao,
                        resposta: doc.data.resposta || '',
                        anexos: doc.data.anexos || [],
                        atendente: doc.data.atendente || '',
                        timestampResposta: doc.data.timestampResposta || '',
                        timestampAnalise: doc.data.timestampAnalise || '',
                        userId: doc.data.userId || '',
                    }
                })
                setDataChamados(chamados)
                const currentTicket = chamados.find((chamado) => chamado.id === id);
                sendNotificationClosed(currentTicket.userId, id)
                setButtonAnswerLoading(false)
                setAnswerFormVisible(false)
            } catch (error) {
                console.log(error)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const openNotificationSucess = (text) => {
        api.open({
            message: 'Notificação',
            description: text,
            icon: (
                <SmileOutlined
                    style={{
                        color: '#108ee9',
                    }}
                />
            ),
        });
    };

    const openNotificationFailure = (text) => {
        api.open({
            message: 'Erro',
            description: text,
            icon: (
                <ExclamationCircleOutlined
                    style={{
                        color: '#108ee9',
                    }}
                />
            ),
        });
    };

    const tabsItems = [
        {
            label: 'Solicitação',
            key: '1',
            children: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Form onFinish={enviarChamado} form={formChamado} layout="vertical">
                            <Form.Item label="Categoria" name='categoria'>
                                <Select placeholder="Selecione a categoria do chamado" showSearch options={optionsCategoria} />
                            </Form.Item>
                            <Form.Item label='Nível de Urgência' name='urgencia'>
                                <Select placeholder='Selecione o nível de urgência' options={[{ value: 'Urgente', label: 'Urgente' }, { value: 'Sem Urgência', label: 'Sem Urgência' }]}></Select>
                            </Form.Item>
                            <Form.Item label="Ponto de Venda" name='ponto'>
                                <Select showSearch={true} options={optionsPontos} placeholder="Selecione o ponto de venda" />
                            </Form.Item>
                            <Form.Item label="Modelo do Terminal" name='modelo'>
                                <Select options={optionsTerminal} placeholder='Selecione o modelo do terminal' />
                            </Form.Item>
                            <Form.Item label="Descrição" name='descricao'>
                                <TextArea placeholder="Digite a descrição do chamado" />
                            </Form.Item>
                            <Form.Item label='Anexos/Evidências (Opcional)'>
                                <Upload fileList={fileList} beforeUpload={Upload.LIST_IGNORE} onChange={handleFileChange} accept="image/*,.pdf" multiple name='file'>
                                    <Button icon={<UploadOutlined />}>Selecionar arquivo</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item>
                                <Button loading={buttonChamadoLoading} htmlType='submit' type="primary">Abrir chamado</Button>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={12}>
                        {/* Empty space for now */}
                    </Col>
                </Row>
            )
        },
        {
            label: 'Chamados',
            key: '2',
            children: (
                <Table columns={columnsChamados} dataSource={dataChamados} expandable={{
                    expandedRowRender: (record) => (
                        <Descriptions title='Informações adicionais:' bordered layout='vertical'
                            extra={
                                <>
                                    <Flex justify='flex-end'>
                                        {record.status == 'pending' && <Button type='primary' onClick={() => { changeStatus(record.id) }} style={{ marginRight: '0.5vw' }}>Mudar status para Em Análise</Button>}
                                        {record.status == 'analysis' && answerFormVisible == false && <Button type='primary' onClick={() => { setAnswerFormVisible(true) }}>Responder chamado</Button>}
                                    </Flex>
                                    {answerFormVisible == true && record.status != 'closed' && <Flex>
                                        <Form form={formAnswer} onFinish={(values) => { answerTicket(record.id, values) }} layout='vertical'>
                                            <Form.Item label='Resposta' name='resposta'>
                                                <TextArea placeholder='Digite a resposta do chamado' />
                                            </Form.Item>
                                            <Form.Item>
                                                <Button loading={buttonAnswerLoading} htmlType='submit' type="primary">Responder chamado</Button>
                                            </Form.Item>
                                        </Form>
                                    </Flex>}
                                </>
                            }>
                            <Descriptions.Item style={{ padding: '2vh' }} label="Ponto de Venda">
                                {record.ponto}
                            </Descriptions.Item>
                            <Descriptions.Item style={{ padding: '2vh' }} label="Modelo do Terminal">
                                {record.modelo}
                            </Descriptions.Item>
                            <Descriptions.Item style={{ padding: '2vh' }} label="Descrição">
                                {record.descricao}
                            </Descriptions.Item>
                            {
                                record.anexos && record.anexos.length > 0 ? (
                                    <Descriptions.Item style={{ padding: '2vh' }} label="Anexos">
                                        <ul>
                                            {record.anexos.map((anexo, index) => (
                                                <li key={index}>
                                                    <a href={anexo} target="_blank" rel="noopener noreferrer">
                                                        {anexo}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </Descriptions.Item>
                                ) : null
                            }
                            {
                                record.status === 'analysis' || record.status === 'closed' ? (
                                    <Descriptions.Item style={{ padding: '2vh' }} label="Data de Início da Análise">
                                        {new Date(record.timestampAnalise).toLocaleString()}
                                    </Descriptions.Item>
                                ) : null
                            }
                            {
                                record.resposta ? (
                                    <>
                                        <Descriptions.Item style={{ padding: '2vh' }} label="Atendente">
                                            {record.atendente}
                                        </Descriptions.Item>
                                        <Descriptions.Item style={{ padding: '2vh' }} label="Data da Resposta">
                                            {new Date(record.timestampResposta).toLocaleString()}
                                        </Descriptions.Item>
                                        <Descriptions.Item style={{ padding: '2vh' }} label="Resposta do Suporte">
                                            {record.resposta}
                                        </Descriptions.Item>
                                    </>
                                ) : null
                            }
                        </Descriptions>
                    )

                }} />
            )
        },
        {
            label: 'Dashboard',
            key: '3',
            children: (
                <Dashboard dataChamados={dataChamados} />
            )
        }
    ]

    useEffect(() => {
        const fetchPontos = async () => {
            try {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: `pipe/pipeId_${pipeId}/planoOperacional`
                    })
                })
                let data = await response.json()

                data = data.docs
                const pontos = data.map((doc) => {
                    return {
                        label: doc.id,
                        value: doc.id
                    }
                })
                setOptionsPontos(pontos)
            } catch (error) {
                console.log(error)
            }
        }

        const fetchChamados = async () => {
            try {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: `pipe/pipeId_${pipeId}/chamados`
                    })
                })
                let data = await response.json()
                data = data.docs
                const chamados = data.map((doc) => {
                    return {
                        key: doc.id,
                        id: doc.id,
                        solicitante: doc.data.solicitante,
                        categoria: doc.data.categoria,
                        status: doc.data.status,
                        timestampAberto: doc.data.timestampAberto,
                        urgencia: doc.data.urgencia,
                        ponto: doc.data.ponto,
                        modelo: doc.data.modelo,
                        descricao: doc.data.descricao,
                        resposta: doc.data.resposta || '',
                        anexos: doc.data.anexos || [],
                        atendente: doc.data.atendente || '',
                        timestampResposta: doc.data.timestampResposta || '',
                        timestampAnalise: doc.data.timestampAnalise || '',
                        userId: doc.data.userId || '',
                    }
                })
                setDataChamados(chamados)
            } catch (error) {
                console.log(error)
            }
        }

        if (pipeId) {
            fetchPontos()
            fetchChamados()
        }
    }, [pipeId])

    return (
        <>
            {contextHolder}
            <Tabs items={tabsItems} style={{ width: '95%', height: '100%', margin: 'auto' }} defaultActiveKey="1" />
        </>
    );
};

export default Suporte;