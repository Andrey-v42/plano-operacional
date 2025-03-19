import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, Table, Select, Upload, notification, Descriptions, Flex, Card, Badge, Typography, Space, Divider, Statistic, Checkbox } from 'antd';
import { ExclamationCircleOutlined, SmileOutlined, UploadOutlined, FileOutlined, ClockCircleOutlined, CheckCircleOutlined, CommentOutlined, QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import { useSearchParams } from 'react-router-dom';
import Dashboard from './Dashboard';
import ChatSuporte from './ChatSuporte';
import TaskBoard from './TaskBoard';
import TicketChatDrawer from './components/TicketChatDrawer';
const { TextArea } = Input;
const { Title, Text } = Typography;

const Suporte = () => {
    const [optionsPontos, setOptionsPontos] = useState(null);
    const [optionsSetores, setOptionsSetores] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [buttonChamadoLoading, setButtonChamadoLoading] = useState(false);
    const [dataChamados, setDataChamados] = useState([]);
    const [answerFormVisible, setAnswerFormVisible] = useState(false);
    const [buttonAnswerLoading, setButtonAnswerLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [chatTicketId, setChatTicketId] = useState(null);
    const [autoCreateChat, setAutoCreateChat] = useState(false);
    const [closedTicketsHidden, setClosedTicketsHidden] = useState(false);
    const [messages, setMessages] = useState([]);

    const [chatDrawerVisible, setChatDrawerVisible] = useState(false);
    const [currentChatTicketId, setCurrentChatTicketId] = useState(null);
    const [currentRecord, setCurrentRecord] = useState(null);

    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const permission = localStorage.getItem('permission');
    const permissionEvento = localStorage.getItem('permissionEvento');
    const currentUser = localStorage.getItem('currentUser');

    const [formChamado] = Form.useForm();
    const [formAnswer] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();

    const handleTabChange = (key) => {
        setActiveTab(key);
        if (key === '2') {
            fetchChamados();
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'pending') {
            return <Badge status="error" text={<Text strong style={{ color: '#ff4d4f' }}>Aberto</Text>} />;
        } else if (status === 'closed') {
            return <Badge status="success" text={<Text strong style={{ color: '#52c41a' }}>Fechado</Text>} />;
        } else {
            return <Badge status="processing" text={<Text strong style={{ color: '#1890ff' }}>Andamento</Text>} />;
        }
    };

    const fetchMessages = async (ticketId) => {
        if (!ticketId || !pipeId) return;

        try {
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `pipe/pipeId_${pipeId}/chamados/${ticketId}/chat`
                })
            });

            const data = await response.json();

            if (data && data.docs) {
                const sortedMessages = data.docs
                    .map(doc => ({
                        id: doc.id,
                        text: doc.data.text,
                        sender: doc.data.sender,
                        timestamp: doc.data.timestamp,
                        isCurrentUser: doc.data.sender === currentUser
                    }))
                    .sort((a, b) => a.timestamp - b.timestamp);

                setMessages(sortedMessages);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleCreateChatForTicket = async (ticketId) => {
        setCurrentChatTicketId(ticketId);
        await fetchMessages(ticketId);
        setChatDrawerVisible(true);
    };

    const handleUrgencia = (value) => {
        switch (value) {
            case "Alteração de funcionalidades":
            case "Transação Apartada":
            case "Cobrança indevida":
            case "Estorno adquirência":
            case "Erro mensagem adquirência":
            case "Falha de Sincronia":
            case "Multiplos pagamentos":
            case "Pix não funcionando":
            case "Recargas expiradas":
                return "Urgente";
            default:
                return "Sem Urgência";
        }
    };

    const optionsCategoria = [
        { value: 'Alteração de Cardápio', label: 'Alteração de Cardápio' },
        { value: 'Substituição de equipamento', label: 'Substituição de equipamento' },
        { value: 'Erro de login', label: 'Erro de login' },
        { value: 'Alteração de funcionalidades', label: 'Alteração de funcionalidades' },
        { value: 'Acesso', label: 'Acesso' },
        { value: 'Alteração quantidade de terminais', label: 'Alteração quantidade de terminais' },
        { value: 'Fechamento manual de ambulante', label: 'Fechamento manual de ambulante' },
        { value: 'Transação Apartada', label: 'Transação Apartada' },
        { value: 'Envio de Insumos', label: 'Envio de Insumos' },
        { value: 'Análise Relatorial', label: 'Análise Relatorial' },
        { value: 'Problemas de conexão', label: 'Problemas de conexão' },
        { value: 'Erro de Impressão', label: 'Erro de Impressão' },
        { value: 'Erro de leitura na TAG', label: 'Erro de leitura na TAG' },
        { value: 'Cobrança indevida', label: 'Cobrança indevida' },
        { value: 'Ponto de venda', label: 'Ponto de venda' },
        { value: 'Duplicação de Saldo', label: 'Duplicação de Saldo' },
        { value: 'Entradas', label: 'Entradas' },
        { value: 'Registro de check in', label: 'Registro de check in' },
        { value: 'Estorno adquirência', label: 'Estorno adquirência' },
        { value: 'Erro mensagem adquirência', label: 'Erro mensagem adquirência' },
        { value: 'Estoque Z', label: 'Estoque Z' },
        { value: 'Falha de Sincronia', label: 'Falha de Sincronia' },
        { value: 'Fechamento de comanda Pós Paga', label: 'Fechamento de comanda Pós Paga' },
        { value: 'Impressora remota', label: 'Impressora remota' },
        { value: 'Limite não integrado', label: 'Limite não integrado' },
        { value: 'Logo de Ficha', label: 'Logo de Ficha' },
        { value: 'Multiplos pagamentos', label: 'Multiplos pagamentos' },
        { value: 'Produtos de Devolução', label: 'Produtos de Devolução' },
        { value: 'Protocolo de equipamentos', label: 'Protocolo de equipamentos' },
        { value: 'Pix não funcionando', label: 'Pix não funcionando' },
        { value: 'Transferência de saldo', label: 'Transferência de saldo' },
        { value: 'Recargas expiradas', label: 'Recargas expiradas' },
        { value: 'Zig Tag Cheio', label: 'Zig Tag Cheio' },
        { value: 'Queima de Ficha', label: 'Queima de Ficha' },
        { value: 'Dúvida de processo ou produto', label: 'Dúvida de processo ou produto' }
    ];

    const columnsChamados = [
        {
            title: 'Solicitante',
            dataIndex: 'solicitante',
            key: 'solicitante',
            width: '15%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '12%',
            render: (status) => getStatusBadge(status)
        },
        {
            title: 'Data',
            dataIndex: 'timestampAberto',
            key: 'timestampAberto',
            width: '15%',
            render: (timestampAberto) => new Date(timestampAberto).toLocaleString()
        },
        {
            title: 'Categoria',
            dataIndex: 'categoria',
            key: 'categoria',
            width: '20%',
        },
        {
            title: 'Nível de urgência',
            dataIndex: 'urgencia',
            key: 'urgencia',
            width: '15%',
            render: (urgencia) => {
                const color = urgencia === 'Urgente' ? 'red' : 'green';
                return <Text style={{ color }}>{urgencia}</Text>;
            }
        },
        {
            title: 'Ações',
            key: 'action',
            width: '15%',
            render: (_, record) => (
                <Space>
                    {record.status === 'pending' && (
                        <Button type="primary" size="small" onClick={() => changeStatus(record.id)}>
                            Abrir Ticket
                        </Button>
                    )}
                    {record.status === 'analysis' && (
                        <Button type="primary" size="small" onClick={() => handleAnswerClick(record.id)}>
                            Responder
                        </Button>
                    )}
                    <Button
                        type="default"
                        size="small"
                        icon={<CommentOutlined />}
                        onClick={() => {
                            handleCreateChatForTicket(record.id)
                            setCurrentRecord(record);
                        }}
                    >
                        Chat
                    </Button>
                </Space>
            ),
        }
    ];

    const optionsTerminal = [
        { label: 'N/A', value: 'N/A' },
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

    ];

    const sendNotification = async (values) => {
        const responseEvento = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: 'pipe', docId: `pipeId_${pipeId}` })
        });
        const dataEvento = await responseEvento.json();

        const responseUsers = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: 'users',
            })
        });
        let dataUsers = await responseUsers.json();
        const dataUsersArray = dataUsers.docs.map(doc => ({ id: doc.id, permission: doc.data.permission, name: doc.data.username, tokens: doc.data.tokens || [] }));

        for (const user of dataUsersArray) {
            if (dataEvento.equipeEscalada.some(item => (item.funcao == 'Head' && item.nome === user.name) || (item.funcao == 'C-CCO' && item.nome === user.name) || (user.permission === 'admin'))) {
                if (user.tokens.length > 0) {
                    try {
                        await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                title: 'Novo ticket de suporte pendente',
                                body: `Olá, ${user.name}. Um novo chamado foi aberto por ${localStorage.getItem('currentUser')}. Nível de urgência: ${values.urgencia}`,
                                userId: user.id,
                            }),
                        });
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
            }
        }
    };

    const sendNotificationAnalysis = async (userId, ticketId) => {
        await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Seu chamado está em análise',
                body: `Olá, seu ticket de ID ${ticketId} está em análise.`,
                userId: userId,
            }),
        });
    };

    const sendNotificationProducao = async (userId, ticketId) => {
        await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Seu chamado está em validação com a produção',
                body: `Olá, seu ticket de ID ${ticketId} está em validação com a produção.`,
                userId: userId,
            }),
        });
    };

    const sendNotificationClosed = async (userId, ticketId) => {
        await fetch('https://us-central1-zops-mobile.cloudfunctions.net/sendNotification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Seu chamado foi respondido',
                body: `Olá, seu ticket de ID ${ticketId} foi respondido.`,
                userId: userId,
            }),
        });
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleAnswerClick = async (recordId, resposta) => {
        try {
            setButtonAnswerLoading(true);

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDocMerge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `pipe`,
                    docId: `pipeId_${pipeId}/chamados/${recordId}`,
                    data: {
                        timestampResposta: new Date().getTime(),
                        status: 'closed',
                        atendente: localStorage.getItem('currentUser'),
                        resposta: resposta
                    }
                })
            });

            await fetchChamados();
            const currentTicket = dataChamados.find((chamado) => chamado.id === recordId);
            await sendNotificationClosed(currentTicket.userId, recordId);
            setButtonAnswerLoading(false);
            openNotificationSucess('Chamado respondido com sucesso!');
        } catch (error) {
            console.error('Error:', error);
            setButtonAnswerLoading(false);
            openNotificationFailure('Erro ao responder chamado. Tente novamente.');
        }
    };

    const enviarChamado = async (values) => {
        if (values.categoria && values.ponto && values.modelo && values.descricao && values.setor) {
            setButtonChamadoLoading(true);
            try {
                values.urgencia = handleUrgencia(values.categoria)
                const responseUsers = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: 'users',
                    })
                });
                let dataUsers = await responseUsers.json();
                const dataUsersArray = dataUsers.docs.map(doc => ({ id: doc.id, name: doc.data.username }));
                let userId;
                for (const dataUser of dataUsersArray) {
                    if (dataUser.name === localStorage.getItem('currentUser')) {
                        userId = dataUser.id;
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
                    await sendNotification(values);
                    formChamado.resetFields();
                    setFileList([]);
                    setButtonChamadoLoading(false);
                    fetchChamados();
                } else {
                    setButtonChamadoLoading(false);
                    openNotificationFailure('Erro ao abrir chamado. Tente novamente ou entre em contato com o suporte por outros canais de atendimento.');
                }

            } catch (error) {
                setButtonChamadoLoading(false);
                console.error('Error:', error);
                openNotificationFailure('Erro ao abrir chamado. Tente novamente ou entre em contato com o suporte por outros canais de atendimento.');
            }
        } else {
            setButtonChamadoLoading(false);
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

            await fetchChamados();
            const currentTicket = dataChamados.find((chamado) => chamado.id === id);
            sendNotificationAnalysis(currentTicket.userId, id);
        } catch (error) {
            console.error('Error:', error);
            openNotificationFailure('Erro ao atualizar status. Tente novamente.');
        }
    };

    const answerTicket = async (values) => {
        try {
            setButtonAnswerLoading(true);
            const id = values.recordId;
            delete values.recordId; // Remove recordId before sending to API

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDocMerge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `pipe`,
                    docId: `pipeId_${pipeId}/chamados/${id}`,
                    data: {
                        timestampResposta: new Date().getTime(),
                        status: 'closed',
                        atendente: localStorage.getItem('currentUser'),
                        resposta: values.resposta
                    }
                })
            });

            await fetchChamados();
            const currentTicket = dataChamados.find((chamado) => chamado.id === id);
            await sendNotificationClosed(currentTicket.userId, id);
            setButtonAnswerLoading(false);
            setAnswerFormVisible(false);
            formAnswer.resetFields();
            openNotificationSucess('Chamado respondido com sucesso!');
        } catch (error) {
            console.error('Error:', error);
            setButtonAnswerLoading(false);
            openNotificationFailure('Erro ao responder chamado. Tente novamente.');
        }
    };

    const openNotificationSucess = (text) => {
        api.open({
            message: 'Notificação',
            description: text,
            icon: (
                <SmileOutlined
                    style={{
                        color: '#52c41a',
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
                        color: '#ff4d4f',
                    }}
                />
            ),
        });
    };

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
            });
            let data = await response.json();
            data = data.docs;
            let chamados = data.map((doc) => {
                if (currentUser !== doc.data.solicitante && permission !== 'admin' && permission !== 'ecc' && permissionEvento !== 'C-CCO' && permissionEvento !== 'Head') {
                    return null;
                } else {
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
                        setor: doc.data.setor || '',
                        atendente: doc.data.atendente || null,
                    }
                }
            });
            chamados = chamados.filter((chamado) => chamado !== null);
            setDataChamados(chamados);
        } catch (error) {
            console.log(error);
            openNotificationFailure('Erro ao carregar chamados.');
        }
    };

    const tabsItems = [
        {
            label: (
                <span>
                    <FileOutlined /> Solicitação
                </span>
            ),
            key: '1',
            children: (
                <Row gutter={24}>
                    <Col span={24}>
                        <Card
                            title={<Title level={4}>Abrir Chamado de Suporte</Title>}
                            bordered={false}
                            className="card-with-shadow"
                            style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', width: '85vw' }}
                        >
                            <Form onFinish={enviarChamado} form={formChamado} layout="vertical">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label={<Text strong>Categoria</Text>}
                                            name='categoria'
                                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                                        >
                                            <Select
                                                placeholder="Selecione a categoria do chamado"
                                                showSearch
                                                options={optionsCategoria}
                                                style={{ borderRadius: '4px' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={<Text strong>Setor</Text>}
                                            name='setor'
                                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                                        >
                                            <Select
                                                placeholder='Selecione o setor'
                                                options={optionsSetores}
                                                style={{ borderRadius: '4px' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label={<Text strong>Ponto de Venda</Text>}
                                            name='ponto'
                                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                                        >
                                            <Select
                                                showSearch={true}
                                                options={optionsPontos}
                                                placeholder="Selecione o ponto de venda"
                                                style={{ borderRadius: '4px' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={<Text strong>Modelo do Terminal</Text>}
                                            name='modelo'
                                            rules={[{ required: true, message: 'Campo obrigatório' }]}
                                        >
                                            <Select
                                                options={optionsTerminal}
                                                placeholder='Selecione o modelo do terminal'
                                                style={{ borderRadius: '4px' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item
                                    label={<Text strong>Descrição</Text>}
                                    name='descricao'
                                    rules={[{ required: true, message: 'Campo obrigatório' }]}
                                >
                                    <TextArea
                                        placeholder="Digite a descrição do chamado"
                                        rows={4}
                                        style={{ borderRadius: '4px' }}
                                    />
                                </Form.Item>

                                <Form.Item label={<Text strong>Anexos/Evidências (Opcional)</Text>}>
                                    <Upload
                                        fileList={fileList}
                                        beforeUpload={Upload.LIST_IGNORE}
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf"
                                        multiple
                                        name='file'
                                        style={{ borderRadius: '4px' }}
                                    >
                                        <Button icon={<UploadOutlined />}>Selecionar arquivo</Button>
                                    </Upload>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        loading={buttonChamadoLoading}
                                        htmlType='submit'
                                        type="primary"
                                        size="large"
                                        style={{ borderRadius: '4px' }}
                                    >
                                        Abrir chamado
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                    <Col span={8}>
                        {/* <Card
                            // title={<Title level={4}>Informações</Title>}
                            bordered={false}
                            style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', height: '100%' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Card type="inner" title="Níveis de Urgência">
                                    <p><strong>Urgente:</strong> Problemas que afetam criticamente a operação.</p>
                                    <p><strong>Sem Urgência:</strong> Problemas que não impactam diretamente a operação.</p>
                                </Card>
                                <Card type="inner" title="Tempo de Resposta">
                                    <p><ClockCircleOutlined /> Chamados urgentes: até 15 minutos</p>
                                    <p><ClockCircleOutlined /> Chamados sem urgência: até 45 minutos</p>
                                </Card>
                                <Card type="inner" title="Dicas">
                                    <p>Descreva o problema detalhadamente para agilizar a resolução.</p>
                                    <p>Anexe prints ou evidências sempre que possível.</p>
                                </Card>
                            </Space>
                        </Card> */}
                    </Col>
                </Row>
            )
        },
        {
            label: (
                <span>
                    <CheckCircleOutlined /> Chamados
                </span>
            ),
            key: '2',
            children: (
                <div style={{ minWidth: '80vw' }}>
                    <Card
                        bordered={false}
                        style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', marginBottom: '16px' }}
                    >
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title={<Text strong>Total de Chamados</Text>}
                                    value={dataChamados.length}
                                    prefix={<FileOutlined />}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title={<Text strong>Chamados Abertos</Text>}
                                    value={dataChamados.filter(c => c.status === 'pending').length}
                                    valueStyle={{ color: '#ff4d4f' }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title={<Text strong>Chamados Em Análise</Text>}
                                    value={dataChamados.filter(c => c.status === 'analysis').length}
                                    valueStyle={{ color: '#1890ff' }}
                                    prefix={<SyncOutlined spin={true} />}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title={<Text strong>Chamados Resolvidos</Text>}
                                    value={dataChamados.filter(c => c.status === 'closed').length}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Col>
                        </Row>
                    </Card>

                    <Card
                        title={<Title level={4}>Lista de Chamados</Title>}
                        bordered={false}
                        style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}
                    >
                        <TaskBoard
                            dataChamados={dataChamados}
                            fetchChamados={fetchChamados}
                            handleAnswerClick={handleAnswerClick}
                            changeStatus={changeStatus}
                            handleCreateChatForTicket={handleCreateChatForTicket}
                        />

                        {answerFormVisible && (
                            <Card
                                title="Responder Chamado"
                                style={{ marginTop: 20, borderRadius: '8px' }}
                            >
                                <Form form={formAnswer} onFinish={answerTicket} layout='vertical'>
                                    <Form.Item name="recordId" hidden>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label={<Text strong>Resposta</Text>}
                                        name='resposta'
                                        rules={[{ required: true, message: 'Campo obrigatório' }]}
                                    >
                                        <TextArea
                                            placeholder='Digite a resposta do chamado'
                                            rows={4}
                                            style={{ borderRadius: '4px' }}
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Space>
                                            <Button
                                                loading={buttonAnswerLoading}
                                                htmlType='submit'
                                                type="primary"
                                                style={{ borderRadius: '4px' }}
                                            >
                                                Enviar Resposta
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setAnswerFormVisible(false);
                                                    formAnswer.resetFields();
                                                }}
                                                style={{ borderRadius: '4px' }}
                                            >
                                                Cancelar
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            </Card>
                        )}
                    </Card>
                </div>
            )
        },
        {
            label: (
                <span>
                    <CheckCircleOutlined /> Dashboard
                </span>
            ),
            key: '3',
            children: (
                <Card
                    bordered={false}
                    style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}
                >
                    <Dashboard dataChamados={dataChamados} pipeId={pipeId} />
                </Card>
            )
        }
    ];

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
                });
                let data = await response.json();

                data = data.docs;
                const pontos = data.map((doc) => {
                    return {
                        label: doc.id,
                        value: doc.id
                    }
                });

                let setores = data.map((doc) => {
                    return {
                        label: doc.data.SETOR,
                        value: doc.data.SETOR
                    }
                });
                setores = setores.filter((item, index, self) =>
                    index === self.findIndex(obj => JSON.stringify(obj) === JSON.stringify(item))
                );

                setOptionsPontos([{ label: 'N/A', value: 'N/A' }, ...pontos]);
                setOptionsSetores([{ label: 'N/A', value: 'N/A' }, ...setores]);
            } catch (error) {
                console.log(error);
                openNotificationFailure('Erro ao carregar pontos de venda.');
            }
        };

        if (pipeId) {
            fetchPontos();
            fetchChamados();
        }
    }, [pipeId]);

    useEffect(() => {
        const storedPreference = localStorage.getItem('closedTicketsHidden');
        if (storedPreference !== null) {
            const isHidden = storedPreference === 'true';
            setClosedTicketsHidden(isHidden);

            if (isHidden && dataChamados.length > 0) {
                setDataChamados(dataChamados.filter(chamado => chamado.status !== 'closed'));
            }
        }
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            {contextHolder}
            <Tabs
                items={tabsItems}
                defaultActiveKey={activeTab}
                activeKey={activeTab}
                onChange={handleTabChange}
                type="card"
                style={{
                    background: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                }}
            />

            <style jsx global>{`
                .card-with-shadow {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
                    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
                }
                .card-with-shadow:hover {
                    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
                }
                .urgent-row {
                    background-color: rgba(255, 77, 79, 0.05);
                }
                .ant-table-expanded-row > td {
                    background-color: #fafafa !important;
                    padding: 16px !important;
                }
                .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
                    background-color: #f5f5f5;
                    border-radius: 8px 8px 0 0 !important;
                    transition: all 0.3s;
                }
                .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
                    background-color: #1890ff;
                    border-color: #1890ff;
                }
                .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: white;
                }
                .ant-descriptions-bordered .ant-descriptions-item-label {
                    background-color: #fafafa;
                    font-weight: 500;
                }
                .ant-badge-status-dot {
                    width: 10px;
                    height: 10px;
                }
                .ant-card-head {
                    border-bottom: 1px solid #f0f0f0;
                    padding: 16px 24px;
                    background-color: #fafafa;
                    border-radius: 8px 8px 0 0;
                }
                .ant-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .ant-btn-primary {
                    background: linear-gradient(135deg, #1890ff 0%, #0050b3 100%);
                    border: none;
                    box-shadow: 0 2px 5px rgba(24, 144, 255, 0.2);
                }
                .ant-btn-primary:hover {
                    background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
                    box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
                }
                .ant-form-item-label > label {
                    font-weight: 500;
                    color: #333;
                }
                .ant-input, .ant-select-selector {
                    transition: all 0.3s;
                    border-radius: 6px !important;
                }
                .ant-input:hover, .ant-select-selector:hover {
                    border-color: #40a9ff;
                }
                .ant-input:focus, .ant-select-selector:focus, .ant-select-focused .ant-select-selector {
                    border-color: #1890ff;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
                }
                .ant-table {
                    border-radius: 8px;
                    overflow: hidden;
                }
                .ant-table-thead > tr > th {
                    background-color: #f5f5f5;
                    font-weight: 600;
                }
                .ant-table-row:hover > td {
                    background-color: rgba(24, 144, 255, 0.05) !important;
                }
                .ant-card-type-inner .ant-card-head {
                    background-color: #f5f5f5;
                }
                .ant-notification-notice {
                    border-radius: 8px;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
                }
                .ant-statistic-title {
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                .ant-statistic-content {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1890ff;
                }
                .ant-space {
                    display: flex;
                    flex-wrap: wrap;
                }
                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .ant-col-xs-24 {
                        flex: 0 0 100%;
                        max-width: 100%;
                    }
                    .ant-table {
                        font-size: 12px;
                    }
                    .ant-card-head-title {
                        font-size: 16px;
                    }
                }
            `}</style>

            <TicketChatDrawer
                visible={chatDrawerVisible}
                ticketId={currentChatTicketId}
                messages={messages}
                fetchMessages={fetchMessages}
                currentRecord={currentRecord}
                pipeId={pipeId}
                onClose={() => setChatDrawerVisible(false)}
            />
        </div>
    );
};

export default Suporte;