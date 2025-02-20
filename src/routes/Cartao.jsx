import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExclamationCircleOutlined, SmileOutlined } from '@ant-design/icons';
import { Table, Button, Flex, Breadcrumb, Drawer, Card, InputNumber, notification, Tabs, Form, Input } from 'antd'
import './css/Plano.css';
import Canvas from '../components/plano/Canvas'

const Cartao = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');

    const [formEntrega] = Form.useForm()
    const [formDevolucao] = Form.useForm()
    const [formParceiro] = Form.useForm()

    const [dataCartao, setDataCartao] = useState([])
    const [dataParceiro, setDataParceiro] = useState([])

    const [drawerVisible, setDrawerVisible] = useState(false)
    const [drawerParceiroVisible, setDrawerParceiroVisible] = useState(false)

    const [tableLoading, setTableLoading] = useState(false)
    const [tableParceiroLoading, setTableParceiroLoading] = useState(false)
    const [okLoading, setOkLoading] = useState(false)
    const [drawerLoading, setDrawerLoading] = useState(false)
    const [entregaLoading, setEntregaLoading] = useState(false)
    const [devolucaoLoading, setDevolucaoLoading] = useState(false)

    const [estoque, setEstoque] = useState(0)
    const [ativos, setAtivos] = useState(0)
    const [editCartao, setEditCartao] = useState(false)
    const [valueEditCartao, setValueEditCartao] = useState(0)
    const [entregaValues, setEntregaValues] = useState({})
    const [devolucaoValues, setDevolucaoValues] = useState({})
    const [parceiroValues, setParceiroValues] = useState({})
    const [signature, setSignature] = useState('')
    const [signatureDevolucao, setSignatureDevolucao] = useState('')
    const [currentRecord, setCurrentRecord] = useState(null)

    const [api, contextHolder] = notification.useNotification()

    const gridStyle = {
        width: '50%'
    }

    const columnsCartao = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Modelo',
            dataIndex: 'modelo',
            key: 'modelo',
        },
        {
            title: 'Cartões Enviados',
            dataIndex: 'quantidade',
            key: 'quantidade',
        },
        {
            title: 'Estoque',
            dataIndex: 'estoque',
            key: 'estoque',
        }
    ]

    const columnsParceiro = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
            render: (text, record) => <a onClick={() => showDrawer(record)}>{text}</a>
        },
        {
            title: 'Empresa',
            dataIndex: 'empresa',
            key: 'empresa',
        },
        {
            title: '# Entregues',
            dataIndex: 'totalEntregues',
            key: 'entregues',
        },
        {
            title: '# Devolvidos',
            dataIndex: 'totalDevolucoes',
            key: 'devolvidos',
        }
    ]

    const tabItems = [
        {
            key: '1',
            label: 'Entrega',
            children: (
                <Form form={formEntrega} layout='vertical' onValuesChange={(changedValues, allValues) => setEntregaValues(allValues)}>
                    <Form.Item label="Cartões Cashless" name='quantidade'>
                        <InputNumber min={0} defaultValue={0} />
                    </Form.Item>
                    <Form.Item label="Assinatura">
                        <Canvas onDrawingComplete={(base64) => setSignature(base64)} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" loading={entregaLoading} onClick={() => handleEntrega()}>Entregar Cartões</Button>
                    </Form.Item>
                </Form>
            )
        },
        {
            key: '2',
            label: 'Devolução',
            children: (
                <Form form={formDevolucao} layout='vertical' onValuesChange={(changedValues, allValues) => setDevolucaoValues(allValues)}>
                    <Form.Item label="Cartões trocados por produto" name='trocaProduto'>
                        <InputNumber min={0} defaultValue={0} />
                    </Form.Item>
                    <Form.Item label="Cartões não utilizados pela produção" name='naoUtilizados'>
                        <InputNumber min={0} defaultValue={0} />
                    </Form.Item>
                    <Form.Item label="Assinatura">
                        <Canvas onDrawingComplete={(base64) => setSignatureDevolucao(base64)} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" loading={devolucaoLoading} onClick={() => handleDevolucao()}>Devolver Cartões</Button>
                    </Form.Item>
                </Form>
            )
        }
    ]

    const showDrawer = (record) => {
        setCurrentRecord(record)
        setDrawerVisible(true)
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

    const editQuantity = async (docId, oldValue) => {
        setOkLoading(true)
        try {
            const formData = {
                "CARTÃO CASHLES": valueEditCartao
            }

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/JSON"
                },
                body: JSON.stringify({ data: formData, docId: `pipeId_${pipeId}/planoOperacional/${docId}` })
            })

            
            if (response.ok) {
                const responseModification = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addModificationCard', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/JSON",
                        "Authorization": `Bearer ${JSON.parse(localStorage.getItem('authToken')).token}`
                    },
                    body: JSON.stringify({ collectionURL: `pipe/pipeId_${pipeId}/planoOperacional`, docId: docId, formData: { equipment: 'CARTÃO CASHLES', newEquipmentValue: valueEditCartao, oldEquipmentValue: oldValue, currentUser: localStorage.getItem('currentUser') } })
                })

                setOkLoading(false)
                openNotificationSucess('Alteração salva com sucesso!')
                setEditCartao(false)

                const responseData = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotCard', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` })
                })

                let data = await responseData.json()
                data = data.docs

                const responseParceiros = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros` })
                })

                let dataParceiros = await responseParceiros.json()
                dataParceiros = dataParceiros.docs

                let qtdEntregues = 0
                for (const doc of dataParceiros) {
                    const responseEntregas = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/entregas` })
                    })

                    let dataEntregas = await responseEntregas.json()
                    dataEntregas = dataEntregas.docs

                    for (const docEnt of dataEntregas) {
                        qtdEntregues += parseInt(docEnt.data.quantidade)
                    }
                }

                const formattedData = data.map(doc => {
                    return {
                        id: doc.id,
                        modelo: doc.data.MODELO,
                        quantidade: doc.data['CARTÃO CASHLES'],
                        estoque: doc.data['CARTÃO CASHLES'] - qtdEntregues
                    }
                })

                setEstoque(formattedData.estoque)
                setDataCartao(formattedData)
            }

        } catch (error) {
            console.error(error)
            setOkLoading(false)
        }
    }

    const closeDrawer = () => {
        setDrawerVisible(false);
        formEntrega.resetFields()
        formDevolucao.resetFields()
        setCurrentRecord(null);
    }

    const closeDrawerParceiro = () => {
        setDrawerParceiroVisible(false)
        formParceiro.resetFields()
    }

    const handleEntrega = async () => {
        if (entregaValues.quantidade > estoque) {
            openNotificationFailure('Quantidade solicitada não está disponível no estoque')
            return
        }
        
        if(!entregaValues.quantidade || signature == '') {
            openNotificationFailure('Todos os campos devem ser preenchidos.')
            return
        }

        try {
            setEntregaLoading(true)
            const now = new Date().toLocaleString()
            const formData = {
                assinatura: signature,
                dataEntrega: now,
                quantidade: entregaValues.quantidade,
                timestamp: new Date().getTime(),
                tecnicoResponsavel: localStorage.getItem('currentUser'),
            }
            setEntregaValues({})
            setSignature('')

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionURL: `pipe/pipeId_${pipeId}/parceiros/${currentRecord.nome}/entregas`, formData: formData })
            })

            if (response.ok) {
                setTableParceiroLoading(true)

                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros` })
                })

                let data = await response.json()
                data = data.docs

                const dataArray = []
                for (const doc of data) {
                    const responseEntregas = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/entregas` })
                    })

                    let dataEntregas = await responseEntregas.json()
                    dataEntregas = dataEntregas.docs

                    let qtdEntregues = 0
                    for (const docEnt of dataEntregas) {
                        qtdEntregues += parseInt(docEnt.data.quantidade)
                    }

                    const responseDevolucoes = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/devolucao` })
                    })

                    let dataDevolucoes = await responseDevolucoes.json()
                    dataDevolucoes = dataDevolucoes.docs
                    let qtdDevolvidos = 0
                    let trocaProduto = 0
                    let naoUtilizado = 0
                    for (const docDev of dataDevolucoes) {
                        qtdDevolvidos += parseInt(docDev.data.totalDevolvido)
                        trocaProduto += parseInt(docDev.data.trocaProduto)
                        naoUtilizado += parseInt(docDev.data.naoUtilizado)
                    }

                    const parceiroData = {
                        key: doc.id,
                        nome: doc.id,
                        empresa: doc.data.EMPRESA,
                        totalEntregues: qtdEntregues,
                        totalDevolucoes: qtdDevolvidos,
                        trocaProduto: trocaProduto,
                        naoUtilizado: naoUtilizado,
                        cartoesAtivos: qtdEntregues - qtdDevolvidos
                    }
                    dataArray.push(parceiroData)
                }

                await updateEstoque()
                setDataParceiro(dataArray)
                setEntregaLoading(false)
                setTableParceiroLoading(false)
                formEntrega.resetFields()
                closeDrawer()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const updateEstoque = async () => {
        try {
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotCard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` })
            })

            let data = await response.json()
            data = data.docs

            const responseParceiros = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros` })
            })

            let dataParceiros = await responseParceiros.json()
            dataParceiros = dataParceiros.docs

            let qtdEntregues = 0
            for (const doc of dataParceiros) {
                const responseEntregas = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/entregas` })
                })

                let dataEntregas = await responseEntregas.json()
                dataEntregas = dataEntregas.docs

                for (const docEnt of dataEntregas) {
                    qtdEntregues += parseInt(docEnt.data.quantidade)
                }
            }

            let placeholderEstoque = 0
            const formattedData = data.map((doc) => {
                placeholderEstoque += (doc.data['CARTÃO CASHLES'] - qtdEntregues)
                return {
                    id: doc.id,
                    modelo: doc.data.MODELO,
                    quantidade: doc.data['CARTÃO CASHLES'],
                    estoque: doc.data['CARTÃO CASHLES'] - qtdEntregues
                }
            })

            setEstoque(placeholderEstoque)
            setDataCartao(formattedData)
        } catch (error) {
            console.error(error)
        }
    }

    const handleDevolucao = async () => {
        if ((devolucaoValues.trocaProduto + devolucaoValues.naoUtilizados) > currentRecord.cartoesAtivos) {
            openNotificationFailure('Quantidade de devolução não pode ser maior que a quantidade de entregas')
            return
        }

        if(!devolucaoValues.naoUtilizados || !devolucaoValues.trocaProduto || signatureDevolucao == '') {
            openNotificationFailure('Todos os campos devem ser preenchidos.')
            return
        }

        try {
            setDevolucaoLoading(true)
            const now = new Date().toLocaleString()
            const formData = {
                assinatura: signatureDevolucao,
                dataDevolucao: now,
                totalDevolvido: devolucaoValues.trocaProduto + devolucaoValues.naoUtilizados,
                trocaProduto: devolucaoValues.trocaProduto,
                naoUtilizado: devolucaoValues.naoUtilizados,
                totalEntregue: currentRecord.totalEntregues,
                timestamp: new Date().getTime(),
                tecnicoResponsavel: localStorage.getItem('currentUser'),
            }
            setDevolucaoValues({})
            setSignatureDevolucao('')

            const responseDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/JSON"
                },
                body: JSON.stringify({ collectionURL: `pipe/pipeId_${pipeId}/parceiros/${currentRecord.nome}/devolucao`, formData: formData })
            })

            if (responseDevolucao.ok) {
                setTableParceiroLoading(true)

                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros` })
                })

                let data = await response.json()
                data = data.docs

                const dataArray = []
                for (const doc of data) {
                    const responseEntregas = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/entregas` })
                    })

                    let dataEntregas = await responseEntregas.json()
                    dataEntregas = dataEntregas.docs

                    let qtdEntregues = 0
                    for (const docEnt of dataEntregas) {
                        qtdEntregues += parseInt(docEnt.data.quantidade)
                    }

                    const responseDevolucoes = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/devolucao` })
                    })

                    let dataDevolucoes = await responseDevolucoes.json()
                    dataDevolucoes = dataDevolucoes.docs
                    let qtdDevolvidos = 0
                    let trocaProduto = 0
                    let naoUtilizado = 0
                    for (const docDev of dataDevolucoes) {
                        qtdDevolvidos += parseInt(docDev.data.totalDevolvido)
                        trocaProduto += parseInt(docDev.data.trocaProduto)
                        naoUtilizado += parseInt(docDev.data.naoUtilizado)
                    }

                    const parceiroData = {
                        key: doc.id,
                        nome: doc.id,
                        empresa: doc.data.EMPRESA,
                        totalEntregues: qtdEntregues,
                        totalDevolucoes: qtdDevolvidos,
                        trocaProduto: trocaProduto,
                        naoUtilizado: naoUtilizado,
                        cartoesAtivos: qtdEntregues - qtdDevolvidos
                    }
                    dataArray.push(parceiroData)
                }

                formDevolucao.resetFields()
                setDataParceiro(dataArray)
                setDevolucaoLoading(false)
                setTableParceiroLoading(false)
                closeDrawer()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const addParceiro = async () => {
        if(!parceiroValues.nome || !parceiroValues.empresa || !parceiroValues.cpf || !parceiroValues.telefone) {
            openNotificationFailure('Todos os campos devem ser preenchidos.')
            return
        }
        
        try {
            setOkLoading(true)
            const formData = {
                "NOME PARCEIRO": parceiroValues.nome,
                "EMPRESA": parceiroValues.empresa,
                "CPF": parceiroValues.cpf,
                "TELEFONE": parceiroValues.telefone,
                "tecnicoResponsavel": localStorage.getItem('currentUser'),
            }

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionURL: `pipe/pipeId_${pipeId}/parceiros`, formData: formData, docId: parceiroValues.nome })
            })

            if (response.ok) {
                openNotificationSucess('Parceiro cadastrado com sucesso.')
                closeDrawerParceiro()
                setParceiroValues({})

                setTableParceiroLoading(true)
                const responseParceiro = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros` })
                })

                let data = await responseParceiro.json()
                data = data.docs

                const dataArray = []
                for (const doc of data) {
                    const responseEntregas = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/entregas` })
                    })

                    let dataEntregas = await responseEntregas.json()
                    dataEntregas = dataEntregas.docs

                    let qtdEntregues = 0
                    for (const docEnt of dataEntregas) {
                        qtdEntregues += parseInt(docEnt.data.quantidade)
                    }

                    const responseDevolucoes = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/devolucao` })
                    })

                    let dataDevolucoes = await responseDevolucoes.json()
                    dataDevolucoes = dataDevolucoes.docs
                    let qtdDevolvidos = 0
                    let trocaProduto = 0
                    let naoUtilizado = 0
                    for (const docDev of dataDevolucoes) {
                        qtdDevolvidos += parseInt(docDev.data.totalDevolvido)
                        trocaProduto += parseInt(docDev.data.trocaProduto)
                        naoUtilizado += parseInt(docDev.data.naoUtilizado)
                    }

                    const parceiroData = {
                        key: doc.id,
                        nome: doc.id,
                        empresa: doc.data.EMPRESA,
                        totalEntregues: qtdEntregues,
                        totalDevolucoes: qtdDevolvidos,
                        trocaProduto: trocaProduto,
                        naoUtilizado: naoUtilizado,
                        cartoesAtivos: qtdEntregues - qtdDevolvidos
                    }
                    dataArray.push(parceiroData)
                }

                setDataParceiro(dataArray)
                setTableParceiroLoading(false)
                setOkLoading(false)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        const getDataCartao = async () => {
            try {
                setTableLoading(true)
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotCard', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` })
                })

                let data = await response.json()
                data = data.docs

                const responseParceiros = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros` })
                })

                let dataParceiros = await responseParceiros.json()
                dataParceiros = dataParceiros.docs

                let qtdEntregues = 0
                for (const doc of dataParceiros) {
                    const responseEntregas = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/entregas` })
                    })

                    let dataEntregas = await responseEntregas.json()
                    dataEntregas = dataEntregas.docs

                    for (const docEnt of dataEntregas) {
                        qtdEntregues += parseInt(docEnt.data.quantidade)
                    }
                }

                let placeholderEstoque = 0
                const formattedData = data.map((doc) => {
                    placeholderEstoque += (doc.data['CARTÃO CASHLES'] - qtdEntregues)
                    return {
                        id: doc.id,
                        modelo: doc.data.MODELO,
                        quantidade: doc.data['CARTÃO CASHLES'],
                        estoque: doc.data['CARTÃO CASHLES'] - qtdEntregues
                    }
                })

                setEstoque(placeholderEstoque)
                setDataCartao(formattedData)
                setTableLoading(false)
            } catch (error) {
                console.error(error);
            }
        }

        const getDataParceiro = async () => {
            try {
                setTableParceiroLoading(true)
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros` })
                })

                let data = await response.json()
                data = data.docs

                const dataArray = []
                for (const doc of data) {
                    const responseEntregas = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/entregas` })
                    })

                    let dataEntregas = await responseEntregas.json()
                    dataEntregas = dataEntregas.docs

                    let qtdEntregues = 0
                    for (const docEnt of dataEntregas) {
                        qtdEntregues += parseInt(docEnt.data.quantidade)
                    }

                    const responseDevolucoes = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${doc.id}/devolucao` })
                    })

                    let dataDevolucoes = await responseDevolucoes.json()
                    dataDevolucoes = dataDevolucoes.docs
                    let qtdDevolvidos = 0
                    let trocaProduto = 0
                    let naoUtilizado = 0
                    for (const docDev of dataDevolucoes) {
                        qtdDevolvidos += parseInt(docDev.data.totalDevolvido)
                        trocaProduto += parseInt(docDev.data.trocaProduto)
                        naoUtilizado += parseInt(docDev.data.naoUtilizado)
                    }

                    const parceiroData = {
                        key: doc.id,
                        nome: doc.id,
                        empresa: doc.data.EMPRESA,
                        totalEntregues: qtdEntregues,
                        totalDevolucoes: qtdDevolvidos,
                        trocaProduto: trocaProduto,
                        naoUtilizado: naoUtilizado,
                        cartoesAtivos: qtdEntregues - qtdDevolvidos
                    }
                    dataArray.push(parceiroData)
                }

                setDataParceiro(dataArray)
                setTableParceiroLoading(false)
            } catch (error) {
                console.error(error);
            }
        }

        if (pipeId) {
            getDataCartao()
            getDataParceiro()
        }
    }, [pipeId])

    return (
        <>
            {contextHolder}

            {/* Drawer entrega/devolução de cartões */}
            <Drawer
                open={drawerVisible}
                onClose={closeDrawer}
                title="Protocolo de Cartões"
                loading={drawerLoading} >
                <Tabs defaultActiveKey='1' items={tabItems} />

            </Drawer>

            {/* Drawer cadastro de parceiro */}
            <Drawer open={drawerParceiroVisible}
                onClose={closeDrawerParceiro}
                title="Cadastrar novo parceiro" >
                <Form layout='vertical' form={formParceiro} onValuesChange={(allValues, changedValues) => setParceiroValues(changedValues)}>
                    <Form.Item label='Nome do Parceiro' name='nome'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Empresa' name='empresa'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='CPF' name='cpf'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Telefone' name='telefone'>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" loading={okLoading} onClick={() => addParceiro()}>Salvar</Button>
                    </Form.Item>
                </Form>

            </Drawer>

            <div style={{ backgroundColor: "#FFFD", width: '100%', margin: '0 auto auto auto', padding: '15px' }}>
                <Flex gap='middle' vertical style={{ marginTop: "2vh" }}>
                    <Flex>
                        <Breadcrumb items={[{ title: 'Field Zigger' }, { title: 'Protocolo de Cartões' }]} />
                    </Flex>

                    <h2 style={{ margin: '2vh 0 0 0' }}>Cartões</h2>
                    <Table style={{ width: '100%', marginBottom: '5vh' }} scroll={{ x: "max-content" }} columns={columnsCartao} dataSource={dataCartao} loading={tableLoading} pagination={false} expandable={{
                        expandedRowRender: (record) => {
                            return (
                                <Card key={record.id}>
                                    <Flex justify='center'>
                                        <h3>Cartão Cashless</h3>
                                    </Flex>
                                    <Flex justify='center' style={{ width: '100%' }}>
                                        {editCartao ? (
                                            <>
                                                <InputNumber onChange={(value) => setValueEditCartao(value)} min={0} defaultValue={record.quantidade} style={{ margin: '0 5px 0 0' }} />
                                                <Button type='primary' onClick={() => editQuantity(record.id, record.quantidade)} loading={okLoading}>Ok</Button>
                                            </>
                                        ) : <a key={'cartao_' + record.id}
                                            onClick={() => {
                                                setEditCartao(true)
                                                setValueEditCartao(record.quantidade)
                                            }}>{record.quantidade}</a>}
                                    </Flex>

                                </Card>
                            )
                        }
                    }} />

                    <h2 style={{ margin: '2vh 0 0 0' }}>Parceiros</h2>
                    <Table style={{ width: '100%' }} scroll={{ x: "max-content" }} columns={columnsParceiro} dataSource={dataParceiro} loading={tableParceiroLoading} pagination={false} expandable={{
                        expandedRowRender: (record) => {
                            return (
                                <Card key={'parceiro_' + record.nome}>
                                    <Card.Grid key={'entregas_' + record.nome} style={gridStyle}>
                                        <Flex vertical align='center'>
                                            <h3>Entregas</h3>
                                            Total Entregue: {record.totalEntregues}
                                        </Flex>
                                    </Card.Grid>
                                    <Card.Grid key={'devolucoes_' + record.nome} style={gridStyle}>
                                        <Flex vertical align='center'>
                                            <h3>Devoluções</h3>
                                            Não Utilizados: {record.naoUtilizado}<br />
                                            Troca por Produto: {record.trocaProduto}<br />
                                            Total Devolvido: {record.totalDevolucoes}
                                        </Flex>
                                    </Card.Grid>
                                </Card>
                            )
                        }
                    }} />
                    <Flex align='center' gap='middle'>
                        <Button type='primary' onClick={setDrawerParceiroVisible}>Cadastrar parceiro</Button>
                    </Flex>
                </Flex>
            </div>
        </>
    );
};

export default Cartao;