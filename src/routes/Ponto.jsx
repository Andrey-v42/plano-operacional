import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import './css/Ponto.css';
import ModalPonto from '../components/ponto/ModalPonto';
import { Table, Button, Flex, Drawer, Breadcrumb, notification, Form, Select } from 'antd';
import { SmileOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const Ponto = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const [docs, setDocs] = useState([]);
    const [modalPonto, setModalPonto] = useState(false);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false)
    const [filtersName, setFiltersName] = useState([])
    const [filtersFunction, setFiltersFunction] = useState([])
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [pontoValues, setPontoValues] = useState({})
    const [buttonLoading, setButtonLoading] = useState(false)

    const [api, contextHolder] = notification.useNotification()
    const permission = localStorage.getItem('permission')
    const permissionEvento = localStorage.getItem('permissionEvento')

    const getLatestTimestamp = (doc) => {
        const timestamps = [];

        // Extract all available timestamps
        if (doc.devolucao && doc.devolucao !== '-' && doc.devolucao !== '+') {
            timestamps.push(new Date(doc.devolucao.split(' ')[0].split('/').reverse().join('-') + ' ' + doc.devolucao.split(' ')[1]));
        }
        if (doc.saida && doc.saida !== '-' && doc.saida !== '+') {
            timestamps.push(new Date(doc.saida.split(' ')[0].split('/').reverse().join('-') + ' ' + doc.saida.split(' ')[1]));
        }
        if (doc.entrada && doc.entrada !== '-' && doc.entrada !== '+') {
            timestamps.push(new Date(doc.entrada.split(' ')[0].split('/').reverse().join('-') + ' ' + doc.entrada.split(' ')[1]));
        }
        if (doc.retirada && doc.retirada !== '-' && doc.retirada !== '+') {
            timestamps.push(new Date(doc.retirada.split(' ')[0].split('/').reverse().join('-') + ' ' + doc.retirada.split(' ')[1]));
        }

        // Return the most recent timestamp or a very old date if no timestamps
        return timestamps.length > 0 ? Math.max(...timestamps.map(d => d.getTime())) : new Date(0).getTime();
    };

    const mapAndSortPontoData = (result) => {
        let dataPonto = result.docs.map((doc) => {
            const data = doc.data;
            if (
                localStorage.getItem('currentUser') == data.nome &&
                permissionEvento != 'planner' &&
                permissionEvento != 'controle' &&
                permissionEvento != 'get' &&
                permission != 'admin' &&
                permissionEvento != 'ecc'
            ) {
                return {
                    key: doc.id,
                    nome: data.nome,
                    funcao: data.funcao.charAt(0).toUpperCase() + data.funcao.slice(1),
                    retirada: !data.retirada ? '-' : data.retirada,
                    entrada: !data.entrada ? '+' : data.entrada,
                    saida: !data.saida && data.entrada ? '+' : !data.saida && !data.entrada ? '-' : data.saida,
                    devolucao: !data.devolucao && data.saida ? '+' : !data.devolucao && !data.saida ? '-' : data.devolucao
                };
            } else if (
                permissionEvento == 'planner' ||
                permissionEvento == 'get' ||
                permissionEvento == 'controle' ||
                permission == 'admin' ||
                permissionEvento == 'ecc'
            ) {
                return {
                    key: doc.id,
                    nome: data.nome,
                    funcao: data.funcao.charAt(0).toUpperCase() + data.funcao.slice(1),
                    retirada: !data.retirada ? '-' : data.retirada,
                    entrada: !data.entrada ? '+' : data.entrada,
                    saida: !data.saida && data.entrada ? '+' : !data.saida && !data.entrada ? '-' : data.saida,
                    devolucao: !data.devolucao && data.saida ? '+' : !data.devolucao && !data.saida ? '-' : data.devolucao
                };
            } else {
                return {};
            }
        });

        // Filter out empty objects
        dataPonto = dataPonto.filter(item => Object.keys(item).length > 0);

        // Sort data by most recent timestamp (descending order)
        dataPonto.sort((a, b) => {
            const timestampA = getLatestTimestamp(a);
            const timestampB = getLatestTimestamp(b);
            return timestampB - timestampA; // Descending order
        });

        return dataPonto;
    };

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
            filters: filtersName,
            onFilter: (value, record) => record.nome.includes(value),
        },
        {
            title: 'Função',
            dataIndex: 'funcao',
            key: 'funcao',
            filters: filtersFunction,
            onFilter: (value, record) => record.funcao.includes(value),
        },
        {
            title: 'Retirada de Equipamentos',
            dataIndex: 'retirada',
            key: 'retirada',
        },
        {
            title: 'Entrada',
            dataIndex: 'entrada',
            key: 'entrada',
            onCell: (record) => ({
                id: `entrada_${record.key}`,
                style: {
                    cursor: record.entrada == '+' ? 'pointer' : ''
                },
                onClick: (e) => {
                    record.entrada == '+' ? adicionarPonto(e.currentTarget.id) : ''
                }
            })
        },
        {
            title: 'Saída',
            dataIndex: 'saida',
            key: 'saida',
            onCell: (record) => ({
                id: `saida_${record.key}`,
                style: {
                    cursor: record.saida == '+' ? 'pointer' : '',
                },
                onClick: (e) => {
                    record.saida == '+' ? adicionarPonto(e.currentTarget.id) : ''
                }
            })
        },
        {
            title: 'Devolução',
            dataIndex: 'devolucao',
            key: 'devolucao',
            onCell: (record) => ({
                id: `devolucao_${record.key}`,
                style: {
                    cursor: record.devolucao == '+' ? 'pointer' : '',
                },
                onClick: (e) => {
                    record.devolucao == '+' ? adicionarPonto(e.currentTarget.id) : ''
                }
            })
        }
    ]

    const optionsFuncao = [
        { value: "Técnico", label: "Técnico" },
        { value: "Supervisor", label: "Supervisor" },
        { value: "C-CCO", label: "C-CCO" },
        { value: "Coordenador de RH", label: "Coordenador de RH" },
        { value: "Técnico de RH", label: "Técnico de RH" },
        { value: "Estoque", label: "Estoque" },
        { value: "Coordenador de Controle", label: "Coordenador de Controle" },
        { value: "Head", label: "Head" }
    ];

    const optionsOperacao = [
        { value: "retirada", label: "Retirada de Equipamentos" },
        { value: "entrada", label: "Chegada no Evento" }
    ]

    useEffect(() => {
        const getLocation = () => {
            if (true == true) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ latitude, longitude });
                        sessionStorage.setItem(
                            'userLocation',
                            JSON.stringify({ latitude, longitude })
                        );
                    },
                    (error) => {
                        console.error(`Error getting location: ${error.message}`);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 300000,
                    }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
            }
        };

        const cachedLocation = sessionStorage.getItem('userLocation');
        if (cachedLocation) {
            setLocation(JSON.parse(cachedLocation));
        } else {
            getLocation();
        }
    }, []);

    const toggleModalPonto = () => {
        setModalPonto(!modalPonto ? true : false);
    }

    const openNotificationSucess = () => {
        api.open({
            message: 'Notificação',
            description:
                'Ponto registrado com sucesso!',
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

    const adicionarPonto = async (id) => {
        if (window.confirm('Confirma o registro do ponto?')) {
            setTableLoading(true)
            const idArray = id.split('_');
            const docId = idArray[1];
            const operacao = idArray[0];

            const now = new Date();
            let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            const currentTimeString = now.toLocaleDateString('pt-BR', options) + ' ' + now.toLocaleTimeString('pt-BR');

            const collectionPath = 'controlePonto';
            const data = {
                [operacao]: currentTimeString,
                [`localizacao_${operacao}`]: [location.latitude, location.longitude],
                [`acao_usuario_${operacao}`]: localStorage.getItem('currentUser')
            };

            try {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDoc', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ pipeId, docId, collectionPath, data }),
                });

                if (response.ok) {
                    const responsePonto = await fetch(
                        'https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/controlePonto` }),
                        }
                    );

                    const result = await responsePonto.json();

                    const dataPonto = mapAndSortPontoData(result)

                    setDocs(dataPonto)

                    setTableLoading(false)
                    openNotificationSucess()
                } else {
                    alert('Erro ao processar requisição.');
                }
            } catch (error) {
                alert('Erro ao processar requisição: ' + error);
            }
        }
    };

    const registrarPonto = async (values) => {
        if (location === null) {
            openNotificationFailure('Erro ao registrar local. Por favor, ative o serviço de localização do dispositivo ou permita o acesso.')
            return;
        }
    
        try {
            setButtonLoading(true);
            
            // First, check if the user has any existing records and if the last one has a registered exit
            const currentUser = localStorage.getItem('currentUser');
            const checkResponse = await fetch(
                'https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/controlePonto` }),
                }
            );
    
            const checkResult = await checkResponse.json();
            
            // Filter records for the current user
            const userRecords = checkResult.docs
                .filter(doc => doc.data.nome === currentUser)
                .map(doc => ({
                    id: doc.id,
                    ...doc.data
                }));
            
            // Sort by most recent first (using the same sorting logic as in mapAndSortPontoData)
            userRecords.sort((a, b) => {
                const timestampA = getLatestTimestamp(a);
                const timestampB = getLatestTimestamp(b);
                return timestampB - timestampA; // Descending order
            });
            
            // Check if the user has records and if the last one doesn't have a registered exit
            if (userRecords.length > 0) {
                const lastRecord = userRecords[0];
                
                // Check if the last record doesn't have a saida (exit) value or if it's a placeholder
                if (!lastRecord.saida || lastRecord.saida === '+' || lastRecord.saida === '-') {
                    setButtonLoading(false);
                    openNotificationFailure('Você precisa registrar sua saída no último ponto antes de criar um novo registro.');
                    return;
                }
            }
            
            // If we get here, the user can create a new record
            let formData = {};
            if (location === null) {
                formData = {
                    nome: currentUser,
                    [`localizacao_${values.operacao}`]: [0, 0],
                    funcao: values.funcao
                };
            } else {
                formData = {
                    nome: currentUser,
                    [`localizacao_${values.operacao}`]: [location.latitude, location.longitude],
                    funcao: values.funcao
                };
            }
    
            const now = new Date();
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            const currentTimeString = now.toLocaleDateString('pt-BR', options) + ' ' + now.toLocaleTimeString('pt-BR');
    
            if (values.operacao == 'retirada') {
                formData.retirada = currentTimeString;
            } else {
                formData.entrada = currentTimeString;
            }
    
            const responseRegistro = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionURL: `pipe/pipeId_${pipeId}/controlePonto`, formData }),
            });
    
            if (responseRegistro.ok) {
                openNotificationSucess('Ponto registrado com sucesso!');
                setDrawerVisible(false);
                setTableLoading(true);
                
                // Refresh the data
                const response = await fetch(
                    'https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/controlePonto` }),
                    }
                );
    
                const result = await response.json();
                const dataPonto = mapAndSortPontoData(result);
    
                setButtonLoading(false);
                setDocs(dataPonto);
                setTableLoading(false);
            }
        } catch (error) {
            setButtonLoading(false);
            openNotificationFailure('Erro ao registrar ponto: ' + error);
        }
    }

    const onFinishFailed = () => {

    }

    useEffect(() => {
        const fetchDataPonto = async () => {
            try {
                setTableLoading(true)
                const response = await fetch(
                    'https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/controlePonto` }),
                    }
                );

                const result = await response.json();

                const dataPonto = mapAndSortPontoData(result)

                const nomes = [
                    ...new Set(result.docs.map((doc) => doc.data.nome))
                ].map((nome) => ({
                    text: nome,
                    value: nome
                }));

                const funcoes = [
                    ...new Set(result.docs.map((doc) => doc.data.funcao))
                ].map((funcao) => ({
                    text: funcao,
                    value: funcao
                }))

                setFiltersFunction(funcoes)
                setFiltersName(nomes)
                setDocs(dataPonto);
                setTableLoading(false)
            } catch (error) {
                console.error(error);
            }
        };

        if (pipeId) {
            fetchDataPonto();
        }
    }, [pipeId]);

    const start = () => {
        setLoading(true);

        setModalPonto(true)

        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <>
            {contextHolder}
            <Drawer title='Abrir novo ponto' open={drawerVisible} onClose={() => setDrawerVisible(false)}>
                <Form
                    onFinish={registrarPonto}
                    onFinishFailed={onFinishFailed}
                    layout='vertical'>
                    <Form.Item label='Função' name='funcao' rules={[{ required: true, message: "Selecione sua função!" }]}>
                        <Select options={optionsFuncao}></Select>
                    </Form.Item>
                    <Form.Item label='Operação' name='operacao' rules={[{ required: true, message: "Selecione o horário de entrada!" }]}>
                        <Select options={optionsOperacao}></Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' loading={buttonLoading} htmlType='submit'>Registrar ponto</Button>
                    </Form.Item>
                </Form>
            </Drawer>
            <div style={{ backgroundColor: "#FFFD", width: '100%', margin: '0 auto auto auto', padding: '15px' }}>
                <Flex gap="middle" vertical style={{ marginTop: "2vh" }}>
                    <Flex>
                        <Breadcrumb items={[{ title: 'Field Zigger' }, { title: 'Controle de Ponto' }]} />
                    </Flex>

                    <Flex align="center" gap="middle">
                        <Button loading={loading} onClick={setDrawerVisible} type="primary">
                            Abrir novo ponto
                        </Button>
                    </Flex>
                    <Table style={{ width: "100%" }} loading={tableLoading} columns={columns} dataSource={docs} scroll={{ x: "max-content" }} bordered />
                </Flex>
                {modalPonto ? <ModalPonto toggleModal={toggleModalPonto}></ModalPonto> : ''}
            </div>
        </>
    );
};

export default Ponto;
