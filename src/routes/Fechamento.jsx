import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConsoleSqlOutlined, ExclamationCircleOutlined, SmileOutlined, UploadOutlined } from '@ant-design/icons';
import { Table, Button, Flex, Breadcrumb, Drawer, InputNumber, notification, Tabs, Form, Input, Descriptions, Select, DatePicker, message, Upload, ConfigProvider } from 'antd'
import './css/Fechamento.css'
import * as XLSX from 'xlsx'
import locale from 'antd/locale/pt_BR'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-BR'

dayjs.locale('pt_BR')

const { TextArea } = Input

const Fechamento = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');

    const [api, contextHolder] = notification.useNotification()
    const [messageApi, contextHolderMessage] = message.useMessage()

    const [drawerDespesaVisible, setDrawerDespesaVisible] = useState(false)
    const [drawerReembolsoVisible, setDrawerReembolsoVisible] = useState(false)

    const [dataPonto, setDataPonto] = useState([])
    const [dataAvarias, setDataAvarias] = useState([])
    const [dataCartao, setDataCartao] = useState([])
    const [dataDespesas, setDataDespesas] = useState([])
    const [dataReembolsos, setDataReembolsos] = useState([])
    const [buttonDespesaLoading, setButtonDespesaLoading] = useState(false)

    const [valueDespesa, setValueDespesa] = useState({})
    const [valueReembolso, setValueReembolso] = useState({})
    const [relatorioOcorrencias, setRelatorioOcorrencias] = useState('')
    const [fileList, setFileList] = useState([]);

    const [formDespesas] = Form.useForm()
    const [formReembolsos] = Form.useForm()

    const permission = localStorage.getItem('permission')
    const permissionEvento = localStorage.getItem('permissionEvento')

    const loadingFechamento = (text) => {
        messageApi.open({
            type: 'loading',
            content: text,
            duration: 0,
        })
        setTimeout(messageApi.destroy, 5000)
    }

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(','));
            reader.onerror = error => reject(error);
        });
    }

    function exportJsonToExcel(jsonData, fileName) {
        const worksheet = XLSX.utils.json_to_sheet(jsonData);
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        return new File([data], fileName, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    }

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

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

    const lancarDespesa = async () => {
        if (!valueDespesa.comprovante || !valueDespesa.data || !valueDespesa.tipoDespesa || !valueDespesa.valor) {
            openNotificationFailure('Preencha todos os campos para lançar a despesa.')
            return
        }

        try {
            setButtonDespesaLoading(true)
            const fileBase64 = await fileToBase64(fileList[0].originFileObj)

            const responseFileUpload = await fetch('https://us-central1-zops-mobile.cloudfunctions.net/uploadFile', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/JSON'
                },
                body: JSON.stringify({
                    fileName: fileList[0].name,
                    mimeType: fileList[0].type,
                    filePath: `pipe/pipeId_${pipeId}/despesas`,
                    fileData: fileBase64[1]
                })
            })

            const dataFile = await responseFileUpload.json()

            const formattedData = {
                tipo: valueDespesa.tipoDespesa,
                valor: valueDespesa.valor,
                data: new Date(valueDespesa.data.$d).toLocaleDateString(),
                comprovante: dataFile.url
            }

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionURL: `pipe/pipeId_${pipeId}/despesas`, formData: formattedData })
            })

            if (response.ok) {
                setValueDespesa({})
                formDespesas.resetFields()
                openNotificationSucess('Despesa lançada com sucesso!')
                setDrawerDespesaVisible(false)
                const responseDespesa = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/despesas` })
                })
                let despesas = await responseDespesa.json()
                despesas = despesas.docs

                const data = despesas.map(doc => doc.data)
                setDataDespesas(data)
                setFileList([])
                setButtonDespesaLoading(false)
            }
        } catch (error) {
            setButtonDespesaLoading(false)
            openNotificationFailure('Erro ao lançar despesa, tente novamente ou entre em contato com o suporte.')
        }

    }

    const lancarReembolso = async () => {
        if (!valueReembolso.comprovante || !valueReembolso.data || !valueReembolso.tipoDespesa || !valueReembolso.valor) {
            openNotificationFailure('Preencha todos os campos para lançar o reembolso.')
            return
        }

        try {
            setButtonDespesaLoading(true)
            const fileBase64 = await fileToBase64(fileList[0].originFileObj)

            const responseFileUpload = await fetch('https://us-central1-zops-mobile.cloudfunctions.net/uploadFile', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/JSON'
                },
                body: JSON.stringify({
                    fileName: fileList[0].name,
                    mimeType: fileList[0].type,
                    filePath: `pipe/pipeId_${pipeId}/reembolsos`,
                    fileData: fileBase64[1]
                })
            })

            const dataFile = await responseFileUpload.json()

            const formattedData = {
                tipo: valueReembolso.tipoDespesa,
                valor: valueReembolso.valor,
                data: new Date(valueReembolso.data.$d).toLocaleDateString(),
                comprovante: dataFile.url,
                recebedor: localStorage.getItem('currentUser')
            }

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionURL: `pipe/pipeId_${pipeId}/reembolsos`, formData: formattedData })
            })

            if (response.ok) {
                setValueReembolso({})
                formReembolsos.resetFields()
                openNotificationSucess('Reembolso lançado com sucesso!')
                setDrawerDespesaVisible(false)
                const responseDespesa = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/reembolsos` })
                })
                let despesas = await responseDespesa.json()
                despesas = despesas.docs

                let data = despesas.map(doc => {
                    if(localStorage.getItem('currentUser') == doc.data.recebedor && permissionEvento != 'planner' && permissionEvento != 'controle' && permissionEvento !='get' && permission != 'admin') {
                        return {
                            comprovante: doc.data.comprovante,
                            valor: doc.data.valor,
                            tipo: (doc.data.tipo.charAt(0).toUpperCase() + doc.data.tipo.slice(1)).replace(/([a-z])([A-Z])/g, '$1 $2'),
                            data: doc.data.data,
                            recebedor: doc.data.recebedor
                        }
                    } else if(permissionEvento == 'planner' || permissionEvento == 'get' || permissionEvento == 'controle' || permission == 'admin') {
                        return {
                            comprovante: doc.data.comprovante,
                            valor: doc.data.valor,
                            tipo: (doc.data.tipo.charAt(0).toUpperCase() + doc.data.tipo.slice(1)).replace(/([a-z])([A-Z])/g, '$1 $2'),
                            data: doc.data.data,
                            recebedor: doc.data.recebedor
                        }
                    } else {
                        return {}
                    }
                })

                data = data.filter(item => Object.keys(item).length > 0);
                setDataReembolsos(data)
                setFileList([])
                setButtonDespesaLoading(false)
            }
        } catch (error) {
            setButtonDespesaLoading(false)
            openNotificationFailure('Erro ao lançar reembolso, tente novamente ou entre em contato com o suporte.')
        }

    }

    const enviarFechamento = async () => {
        loadingFechamento('Gerando documentos. Por favor, aguarde...')
        const filesArray = []

        try {
            const responseReembolsos = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/reembolsos` })
            })
                    
            if(responseReembolsos.ok) {
                let reembolsos = await responseReembolsos.json()
                reembolsos = reembolsos.docs
                const data = reembolsos.map(doc => doc.data)
                filesArray.push(exportJsonToExcel(data, 'reembolsos.xlsx'))
            }
    
            const responseDespesas = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/despesas` })
            })
    
            if(responseDespesas.ok) {
                let despesas = await responseDespesas.json()
                despesas = despesas.docs
                const data = despesas.map(doc => doc.data)
                filesArray.push(exportJsonToExcel(data, 'despesas.xlsx'))
            }
    
            const responseEntrega = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosEntrega` })
            })
    
            if(responseEntrega.ok) {
                let entrega = await responseEntrega.json()
                entrega = entrega.docs
                const data = entrega.map(doc => {
                    const obj = {...doc.data}
                    delete obj.assinatura
                    delete obj.pdfProtocolo
                    return obj
                })
                filesArray.push(exportJsonToExcel(data, 'protocolosEntrega.xlsx'))
            }
    
            const responseDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosDevolucao` })
            })
    
            if(responseDevolucao.ok) {
                let devolucao = await responseDevolucao.json()
                devolucao = devolucao.docs
                const data = devolucao.map(doc => {
                    const obj = {...doc.data}
                    delete obj.assinatura
                    delete obj.pdfProtocolo
                    return obj
                })
                filesArray.push(exportJsonToExcel(data, 'protocolosDevolucao.xlsx'))
            }
    
            const responseControlePonto = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/controlePonto` })
            })
    
            if(responseControlePonto.ok) {
                let controlePonto = await responseControlePonto.json()
                controlePonto = controlePonto.docs
                const data = controlePonto.map(doc => doc.data)
                filesArray.push(exportJsonToExcel(data, 'controlePonto.xlsx'))
            }
    
            const responseParceiros = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros` })
            })
    
            if(responseParceiros.ok) {
                let parceiros = await responseParceiros.json()
                if(parceiros.docs.length > 0) {
                    const dataEntregasCartao = []
                    const dataDevolucaoCartao = []
                    for(const parceiro of parceiros.docs) {
                        const dataParceiro = parceiro.data
                        
                        const responseCartoesEntrega = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${parceiro.id}/entregas` })
                        })
                        let dataCartoesEntrega = await responseCartoesEntrega.json()
                        dataCartoesEntrega = dataCartoesEntrega.docs
                        if(dataCartoesEntrega.length > 0) {
                            dataCartoesEntrega = dataCartoesEntrega.map(doc => {
                                const obj = {...doc.data}
                                delete obj.assinatura
                                return obj
                            })
                            for(const obj of dataCartoesEntrega) {
                                obj.nome = parceiro.id
                                obj.empresa = dataParceiro.EMPRESA
                                obj.telefone = dataParceiro.TELEFONE
                            }
                            dataEntregasCartao.push(dataCartoesEntrega)
                        }
    
                        const responseCartoesDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/parceiros/${parceiro.id}/devolucao` })
                        })
                        let dataCartoesDevolucao = await responseCartoesDevolucao.json()
                        dataCartoesDevolucao = dataCartoesDevolucao.docs
                        if(dataCartoesDevolucao.length > 0) {
                            dataCartoesDevolucao = dataCartoesDevolucao.map(doc => {
                                const obj = {...doc.data}
                                delete obj.assinatura
                                return obj
                            })
                            for(const obj of dataCartoesDevolucao) {
                                obj.nome = parceiro.id
                                obj.empresa = dataParceiro.EMPRESA
                                obj.telefone = dataParceiro.TELEFONE
                            }
                            dataDevolucaoCartao.push(dataCartoesDevolucao)
                        }
                    }
                    filesArray.push(exportJsonToExcel(dataEntregasCartao.flat(), 'entregasCartoes.xlsx'))
                    filesArray.push(exportJsonToExcel(dataDevolucaoCartao.flat(), 'devolucoesCartoes.xlsx'))
                }
                
                
            }
            const dataEvento = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe`, docId: `pipeId_${pipeId}` })
            })
            let jsonEvento = await dataEvento.json()
            if(jsonEvento.taskId) {
                loadingFechamento('Anexando documentos no ClickUp. Por favor, aguarde...')
                // const responseToken = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getToken', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                // })
                
                for(const file of filesArray) {
                    const formData = new FormData();
                    formData.append('attachment', file);

                    const responseFechamento = await fetch(`https://api.clickup.com/api/v2/task/${jsonEvento.taskId}/attachment`, {
                        method: 'POST',
                        headers: {
                            'Authorization': "pk_89229936_E5F2NN0B475NYDICS497EYR3O889V2XZ",
                        },
                        body: formData
                    });
                }

                if(relatorioOcorrencias.relatorio != '') {
                    const relatorioDeOcorrenciasFieldId = '834512ed-9b34-4301-859e-b5d2df2dff6d'
                    const resp = await fetch(
                        `https://api.clickup.com/api/v2/task/${jsonEvento.taskId}/field/${relatorioDeOcorrenciasFieldId}`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/JSON',
                                'Authorization': "pk_89229936_3NFZ3NSHS6PQ4JOXR6P3YDVI0R0BTCWE",
                            },
                            body: JSON.stringify({
                                value: JSON.stringify({ value: relatorioOcorrencias.relatorio })
                            })
                        }
                    );
                }
            }

            openNotificationSucess('Fechamento enviado com sucesso!')
        } catch (error) {
            openNotificationFailure('Erro ao enviar fechamento, tente novamente ou entre em contato com o suporte')
            console.error(error)
        }
    }

    const columnsPonto = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Função',
            dataIndex: 'funcao',
            key: 'funcao',
        },
        {
            title: 'Retirada',
            dataIndex: 'retirada',
            key: 'retirada',
        },
        {
            title: 'Entrada',
            dataIndex: 'entrada',
            key: 'entrada',
        },
        {
            title: 'Saída',
            dataIndex: 'saida',
            key: 'saida',
        },
        {
            title: 'Devolução',
            dataIndex: 'devolucao',
            key: 'devolucao',
        }
    ]

    const columnsAvarias = [
        {
            title: 'Ponto de Venda',
            dataIndex: 'pontoDeVenda',
            key: 'pontoDeVenda',
        },
        {
            title: 'Equipamento',
            dataIndex: 'equipamento',
            key: 'equipamento',
        },
        {
            title: 'Tipo da Avaria',
            dataIndex: 'tipoDaAvaria',
            key: 'tipoDaAvaria',
        },
        {
            title: 'Quantidade',
            dataIndex: 'quantidade',
            key: 'quantidade',
        }
    ]

    const columnsCartao = [
        {
            title: 'Parceiro',
            dataIndex: 'nome',
            key: 'parceiro',
        },
        {
            title: '# Entregue',
            dataIndex: 'totalEntregues',
            key: 'entregue',
        },
        {
            title: '# Troca Produto',
            dataIndex: 'trocaProduto',
            key: 'trocaProduto',
        },
        {
            title: '# Não Utilizados',
            dataIndex: 'naoUtilizado',
            key: 'naoUtilizados',
        },
        {
            title: '# Total Devolvido',
            dataIndex: 'totalDevolucoes',
            key: 'totalDevolvido',
        }
    ]

    const columnsDespesas = [
        {
            title: 'Tipo da Despesa',
            dataIndex: 'tipo',
            key: 'tipo',
        },
        {
            title: 'Valor',
            dataIndex: 'valor',
            key: 'valor',
        },
        {
            title: 'Data',
            dataIndex: 'data',
            key: 'data',
        },
        {
            title: 'Comprovante',
            dataIndex: 'comprovante',
            key: 'comprovante',
            render: (comprovante) => {
                return (
                    comprovante.includes('pdf') ?
                        <a href={comprovante} target="_blank" rel="noopener noreferrer">
                            Abrir PDF
                        </a> : <a target="_blank" rel="noopener noreferrer" href={comprovante}><img src={comprovante} style={{ width: '125px' }} /></a>
                );
            }
        }
    ]

    const columnsReembolsos = [
        {
            title: 'Tipo da Despesa',
            dataIndex: 'tipo',
            key: 'tipo',
        },
        {
            title: 'Valor',
            dataIndex: 'valor',
            key: 'valor',
        },
        {
            title: 'Data',
            dataIndex: 'data',
            key: 'data',
        },
        {
            title: 'Recebedor',
            dataIndex: 'recebedor',
            key: 'recebedor'
        },
        {
            title: 'Comprovante',
            dataIndex: 'comprovante',
            key: 'comprovante',
            render: (comprovante) => {
                return (
                    comprovante.includes('pdf') ?
                        <a href={comprovante} target="_blank" rel="noopener noreferrer">
                            Abrir PDF
                        </a> : <a target="_blank" rel="noopener noreferrer" href={comprovante}><img src={comprovante} style={{ width: '125px' }} /></a>
                );
            }
        }
    ]

    const optionsDespesa = [
        { value: 'Transportadora', label: 'Transportadora' },
        { value: 'Locação de Veículo', label: 'Locação de Veículo' },
        { value: 'Uber Voucher', label: 'Uber Voucher' },
        { value: 'Loggi', label: 'Loggi' },
        { value: 'Estacionamento', label: 'Estacionamento' },
        { value: 'Ônibus', label: 'Ônibus' },
        { value: 'Aéreo', label: 'Aéreo' },
        { value: 'Hotel/Pousada', label: 'Hotel/Pousada' },
        { value: 'AirBnB', label: 'AirBnB' }
    ];

    const optionsReembolso = [
        { value: 'Café da Manhã', label: 'Café da Manhã' },
        { value: 'Almoço', label: 'Almoço' },
        { value: 'Jantar', label: 'Jantar' },
        { value: 'Uber', label: 'Uber' },
        { value: '99', label: '99' },
        { value: 'Ônibus', label: 'Ônibus' },
        { value: 'Combustível', label: 'Combustível' },
        { value: 'Pedágio', label: 'Pedágio' },
        { value: 'Estacionamento', label: 'Estacionamento' },
        { value: 'Material De Escritório', label: 'Material De Escritório' }
    ];

    const tabResumoItems = [
        {
            label: 'Controle de Ponto',
            key: '1',
            children: (
                <Table scroll={{ x: "max-content" }} dataSource={dataPonto} columns={columnsPonto}>
                </Table>
            )
        },
        {
            label: 'Resumo de Avarias',
            key: '2',
            children: (
                <Table scroll={{ x: "max-content" }} dataSource={dataAvarias} columns={columnsAvarias}>
                </Table>
            )
        },
        {
            label: 'Protocolo de Cartões',
            key: '3',
            children: (
                <Table scroll={{ x: "max-content" }} dataSource={dataCartao} columns={columnsCartao}>
                </Table>
            )
        }
    ]

    const tabDespesasItems = [
        {
            label: 'Despesas não reembolsáveis',
            key: '1',
            children: (
                <Flex vertical gap='middle'>
                    <Table scroll={{ x: "max-content" }} dataSource={dataDespesas} columns={columnsDespesas}></Table>

                    <Button type='primary' onClick={setDrawerDespesaVisible}>Adicionar despesa</Button>
                </Flex>
            )
        },
        {
            label: 'Solicitação de reembolsos',
            key: '2',
            children: (
                <Flex vertical gap='middle'>
                    <Table scroll={{ x: "max-content" }} dataSource={dataReembolsos} columns={columnsReembolsos}></Table>

                    <Button type='primary' onClick={setDrawerReembolsoVisible} >Adicionar reembolso</Button>
                </Flex>
            )
        }
    ]

    useEffect(() => {
        const processAvariasArray = (allAvarias) => {
            const counts = {};

            allAvarias.forEach(({ avaria, docId }) => {
                const [equipment, damage] = avaria.split(': ').map(str => str.trim());
                const key = `${docId}-${equipment}-${damage}`;

                if (counts[key]) {
                    counts[key].quantidade++;
                } else {
                    counts[key] = { pontoDeVenda: docId, tipoDaAvaria: damage, equipamento: equipment, quantidade: 1, key: docId + '_' + avaria + '_' + damage };
                } 
            });

            return Object.values(counts);
        };

        const getDataPonto = async () => {
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/controlePonto` })
            })

            if (response.ok) {
                let data = await response.json()

                let dataPonto = data.docs.map((doc) => {
                    if(localStorage.getItem('currentUser') == doc.data.nome && permissionEvento != 'planner' && permissionEvento != 'controle' && permissionEvento !='get' && permission != 'admin' && permissionEvento != 'ecc') {
                        const data = doc.data
                        return {
                            key: doc.id,
                            nome: data.nome,
                            funcao: data.funcao.charAt(0).toUpperCase() + data.funcao.slice(1),
                            retirada: !data.retirada ? '-' : data.retirada,
                            entrada: !data.entrada ? '+' : data.entrada,
                            saida: !data.saida && data.entrada ? '+' : !data.saida && !data.entrada ? '-' : data.saida,
                            devolucao: !data.devolucao && data.saida ? '+' : !data.devolucao && !data.saida ? '-' : data.saida
                        }
                    } else if(permissionEvento == 'planner' || permissionEvento == 'get' || permissionEvento == 'controle' || permission == 'admin' || permissionEvento == 'ecc') {
                        const data = doc.data
                        return {
                            key: doc.id,
                            nome: data.nome,
                            funcao: data.funcao.charAt(0).toUpperCase() + data.funcao.slice(1),
                            retirada: !data.retirada ? '-' : data.retirada,
                            entrada: !data.entrada ? '+' : data.entrada,
                            saida: !data.saida && data.entrada ? '+' : !data.saida && !data.entrada ? '-' : data.saida,
                            devolucao: !data.devolucao && data.saida ? '+' : !data.devolucao && !data.saida ? '-' : data.saida
                        }
                    } else {
                        return {
                        
                        }
                    }
                })
                
                dataPonto = dataPonto.filter(item => Object.keys(item).length > 0);

                setDataPonto(dataPonto)
            } else {
                openNotificationFailure('Erro ao baixar dados do controle de ponto')
            }
        }

        const getDataCartao = async () => {
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

            setDataCartao(dataArray)
        }

        const getDataAvarias = async () => {
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosDevolucao` })
            })

            if (response.ok) {
                let dataAvarias = await response.json()
                dataAvarias = dataAvarias.docs

                const allAvarias = []
                if (dataAvarias.length > 0) {
                    dataAvarias.forEach(doc => {
                        if(doc.data.Avarias) {
                            const avariasArray = doc.data.Avarias;
                            const docId = doc.id;
                            avariasArray.forEach(avaria => {
                                allAvarias.push({ avaria, docId });

                            });
                        }
                    });
                }

                const formattedData = processAvariasArray(allAvarias)
                setDataAvarias(formattedData)
            }
        }

        const getDataDespesas = async () => {
            try {
                const responseDespesa = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/despesas` })
                })
                let despesas = await responseDespesa.json()
                despesas = despesas.docs
                const data = despesas.map(doc => {
                    return {
                        comprovante: doc.data.comprovante,
                        valor: doc.data.valor,
                        tipo: (doc.data.tipo.charAt(0).toUpperCase() + doc.data.tipo.slice(1)).replace(/([a-z])([A-Z])/g, '$1 $2'),
                        data: doc.data.data,
                    }
                })
                setDataDespesas(data)
            } catch (error) {
                console.error(error)
            }
        }

        const getDataReembolsos = async () => {
            try {
                const responseDespesa = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/reembolsos` })
                })
                let despesas = await responseDespesa.json()
                despesas = despesas.docs

                let data = despesas.map(doc => {
                    if(localStorage.getItem('currentUser') == doc.data.recebedor && permissionEvento != 'planner' && permissionEvento != 'controle' && permissionEvento !='get' && permission != 'admin') {
                        return {
                            comprovante: doc.data.comprovante,
                            valor: doc.data.valor,
                            tipo: (doc.data.tipo.charAt(0).toUpperCase() + doc.data.tipo.slice(1)).replace(/([a-z])([A-Z])/g, '$1 $2'),
                            data: doc.data.data,
                            recebedor: doc.data.recebedor
                        }
                    } else if(permissionEvento == 'planner' || permissionEvento == 'get' || permissionEvento == 'controle' || permission == 'admin') {
                        return {
                            comprovante: doc.data.comprovante,
                            valor: doc.data.valor,
                            tipo: (doc.data.tipo.charAt(0).toUpperCase() + doc.data.tipo.slice(1)).replace(/([a-z])([A-Z])/g, '$1 $2'),
                            data: doc.data.data,
                            recebedor: doc.data.recebedor
                        }
                    } else {
                        return {}
                    }
                })

                data = data.filter(item => Object.keys(item).length > 0);

                setDataReembolsos(data)
            } catch (error) {
                console.error(error)
            }
        }

        if (pipeId) {
            getDataCartao()
            getDataPonto()
            getDataAvarias()
            getDataDespesas()
            getDataReembolsos()
        }
    }, [pipeId])

    return (
        <>
            {contextHolder}
            {contextHolderMessage}

            {/* Drawer lançamento de despesas */}
            <Drawer onClose={() => setDrawerDespesaVisible(false)} title='Lançamento de despesa' open={drawerDespesaVisible}>
                <Form layout='vertical' form={formDespesas} onValuesChange={(allValues, changedValues) => setValueDespesa(changedValues)}>
                    <Form.Item name='tipoDespesa' label='Tipo da despesa'>
                        <Select options={optionsDespesa} />
                    </Form.Item>
                    <Form.Item name='valor' label='Valor'>
                        <InputNumber decimalSeparator=',' addonBefore='R$' min={0} step={0.01}></InputNumber>
                    </Form.Item>
                    <Form.Item name='data' label='Data da despesa'>
                        <DatePicker format='DD-MM-YYYY' locale={locale} placeholder='Selecione a data' />
                    </Form.Item>
                    <Form.Item name='comprovante' label='Comprovante'>
                        <Upload fileList={fileList} onChange={handleFileChange} accept="image/*,.pdf" name='file'>
                            <Button icon={<UploadOutlined />}>Selecionar arquivo</Button>
                        </Upload>
                    </Form.Item>
                    <Button type='primary' loading={buttonDespesaLoading} onClick={() => lancarDespesa()}>Lançar despesa</Button>
                </Form>
            </Drawer>

            {/* Drawer lançamento de reembolsos */}
            <Drawer onClose={() => setDrawerReembolsoVisible(false)} title='Lançamento de reembolso' open={drawerReembolsoVisible}>
                <Form layout='vertical' form={formReembolsos} onValuesChange={(allValues, changedValues) => setValueReembolso(changedValues)}>
                    <Form.Item name='tipoDespesa' label='Tipo do reembolso'>
                        <Select options={optionsReembolso} />
                    </Form.Item>
                    <Form.Item name='valor' label='Valor'>
                        <InputNumber decimalSeparator=',' addonBefore='R$' min={0} step={0.01}></InputNumber>
                    </Form.Item>
                    <Form.Item name='data' label='Data do reembolso'>
                        <DatePicker format='DD-MM-YYYY' locale={locale} placeholder='Selecione a data' />
                    </Form.Item>
                    <Form.Item name='comprovante' label='Comprovante'>
                        <Upload fileList={fileList} onChange={handleFileChange} accept="image/*,.pdf" name='file'>
                            <Button icon={<UploadOutlined />}>Selecionar arquivo</Button>
                        </Upload>
                    </Form.Item>
                    <Button type='primary' loading={buttonDespesaLoading} onClick={() => lancarReembolso()}>Lançar reembolso</Button>
                </Form>
            </Drawer>

            <div style={{ backgroundColor: "#FFFD", width: '100%', margin: '0 auto auto auto', padding: '15px' }}>
                <Flex>
                    <Breadcrumb items={[{ title: 'Field Zigger' }, { title: 'Fechamento Operacional' }]}></Breadcrumb>
                </Flex>

                <Flex vertical style={{ margin: '4vh 0 0 0' }}>
                    <Descriptions style={{ width: '100%' }} bordered layout='vertical'>
                        <Descriptions.Item style={{ textAlign: 'center' }} label='OS'>{pipeId}</Descriptions.Item>
                        <Descriptions.Item style={{ textAlign: 'center' }} label='Nome do Evento'></Descriptions.Item>
                    </Descriptions>

                    <h3 style={{ margin: '4vh 0 1vh 0' }}>Resumo do Evento</h3>
                    <Tabs
                        style={{
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)',
                            borderRadius: '6px',
                            padding: '8px',
                            margin: '0 0 0 0',
                            background: 'white',
                        }}
                        defaultActiveKey='1'
                        items={tabResumoItems}
                    />

                    <Tabs
                        style={{
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)',
                            borderRadius: '6px',
                            padding: '8px',
                            background: 'white',
                            margin: '4vh 0 1vh 0'
                        }}
                        defaultActiveKey='1'
                        items={tabDespesasItems}
                    />

                    <Form layout='vertical' style={{ margin: '4vh 0 0 0' }} onValuesChange={(allValues, changedValues) => setRelatorioOcorrencias(changedValues)}>
                        <Form.Item name='relatorio' label={<h3 style={{ margin: '0' }} >Relatório de Ocorrências</h3>}>
                            <TextArea placeholder='Digite aqui os detalhes da operação...' rows={3}></TextArea>
                        </Form.Item>
                    </Form>
                </Flex>

                <Flex>
                    <Button style={{ margin: '0 0 0 auto' }} onClick={enviarFechamento} type='primary'>Enviar fechamento</Button>
                </Flex>
            </div>
        </>
    );
};

export default Fechamento;