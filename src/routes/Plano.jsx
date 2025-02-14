import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SmileOutlined } from '@ant-design/icons';
import { Table, Button, Flex, Card, InputNumber, Breadcrumb, notification, Drawer, Form, Input, Checkbox, Collapse, Select } from 'antd';
import './css/Plano.css';
import { createStyles } from 'antd-style';
import Canvas from '../components/plano/Canvas'

const useStyle = createStyles(({ css, token }) => {
    const { antCls } = token;
    return {
        customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
    };
});

const gridStyle = {
    width: '33.33%',
    textAlign: 'center',
    fontSize: 'small',
    padding: 3
};

const rowEditStyle = {
    width: '75%',
    height: 'fit-content',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}

const styleTableAvaria = {
    fontSize: 'small'
}

const Plano = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const [dataPlano, setDataPlano] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false)
    const [drawerLoading, setDrawerLoading] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [filtersSetor, setFilterSetor] = useState([])
    const [filtersCategoria, setFilterCategoria] = useState([])

    const [editTerminais, setEditTerminais] = useState(false)
    const [editCarregador, setEditCarregador] = useState(false)
    const [editCapa, setEditCapa] = useState(false)
    const [editCartao, setEditCartao] = useState(false)
    const [editPowerbank, setEditPowerbank] = useState(false)
    const [editTomada, setEditTomada] = useState(false)

    const [valueTerminal, setValueTerminal] = useState(0)
    const [valueCarregador, setValueCarregador] = useState(0)
    const [valueCapa, setValueCapa] = useState(0)
    const [valueCartao, setValueCartao] = useState(0)
    const [valuePowerbank, setValuePowerbank] = useState(0)
    const [valueTomada, setValueTomada] = useState(0)

    const [createPonto, setCreatePonto] = useState(false)

    const [formValues, setFormValues] = useState({});
    const [formAvarias, setFormAvarias] = useState({});
    const [formPDV, setFormPDV] = useState({})
    const [avarias, setAvarias] = useState([])
    const [signature, setSignature] = useState('');

    const { styles } = useStyle();

    const [api, contextHolder] = notification.useNotification()

    const handleFormSubmit = () => {
        const completeData = { ...formValues, assinatura: signature };
    };

    const showDrawer = async (record) => {
        setDrawerVisible(true);
        setCurrentRecord(record);
        try {
            setDrawerLoading(true)

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional/${record.key}/avarias` })
            })
            let docs = await response.json()
            docs = docs.docs?.map(doc => doc.data.avarias)

            const result = docs.map(array => {
                const [equipamento, tipoAvaria] = array[0].split(": ").map(str => str.trim())

                return {
                    equipamento,
                    tipoAvaria,
                    quantidade: array.length
                }
            })

            setAvarias(result)

            setDrawerLoading(false)
        } catch (error) {
            console.error(error);
            setDrawerLoading(false)
        }
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setCurrentRecord(null);
    };

    const openNotificationSucess = () => {
        api.open({
            message: 'Notificação',
            description:
                'Sua alteração foi salva com sucesso!',
            icon: (
                <SmileOutlined
                    style={{
                        color: '#108ee9',
                    }}
                />
            ),
        });
    };

    const openNotificationSucessPDV = (operation) => {
        api.open({
            message: 'Notificação',
            description:
                `Ponto de Venda ${operation} com sucesso!`,
            icon: (
                <SmileOutlined
                    style={{
                        color: '#108ee9',
                    }}
                />
            ),
        });
    };

    const openNotificationSucessAvariasAvulsas = () => {
        api.open({
            message: 'Notificação',
            description:
                `Avarias avulsas lançadas com sucesso!`,
            icon: (
                <SmileOutlined
                    style={{
                        color: '#108ee9',
                    }}
                />
            ),
        });
    };

    const columns = [
        {
            title: 'Ponto de Venda',
            dataIndex: 'Ponto de Venda',
            key: 'Ponto de Venda',
            render: (text, record) => <a onClick={() => showDrawer(record)}>{text}</a>,
        },
        {
            title: 'Setor',
            dataIndex: 'Setor',
            key: 'Setor',
            filters: filtersSetor,
            onFilter: (value, record) => record.Setor.includes(value),
        },
        {
            title: 'Categoria',
            dataIndex: 'Categoria',
            key: 'Categoria',
            filters: filtersCategoria,
            onFilter: (value, record) => record.Categoria.includes(value),
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            filters: [
                { text: 'Entrega Pendente', value: 'Entrega Pendente' },
                { text: 'Entregue', value: 'Entregue' },
                { text: 'Devolvido', value: 'Devolvido' },
            ],
            onFilter: (value, record) => record.Status.includes(value),
        },
        {
            title: 'Perda/Avaria',
            dataIndex: 'Perda/Avaria',
            key: 'Perda/Avaria',
            filters: [
                { text: 'Sim', value: 'Sim' },
                { text: 'Não', value: 'Não' },
            ],
            onFilter: (value, record) => record['Perda/Avaria'].includes(value),
        },
    ];

    const internalColumns = [
        {
            title: 'Modelo',
            dataIndex: 'modelo',
            key: 'Modelo',
        },
        {
            title: 'Total Terminais',
            dataIndex: 'totalTerminais',
            key: 'TotalTerminais',
        },
        {
            title: 'Capa / Suporte',
            dataIndex: 'capas',
            key: 'CapaSuporte',
        },
        {
            title: 'Cartões Cashless',
            dataIndex: 'cartoes',
            key: 'CartoesCashless',
        },
        {
            title: 'Carregadores',
            dataIndex: 'carregadores',
            key: 'Carregadores',
        },
        {
            title: 'Powerbanks',
            dataIndex: 'powerbanks',
            key: 'Powerbanks',
        },
        {
            title: 'Pontos de Tomada',
            dataIndex: 'tomadas',
            key: 'PontosDeTomada',
        }
    ]

    const avariasColumns = [
        {
            title: 'Equipamento',
            dataIndex: 'equipamento',
            key: 'Equipamento',
        },
        {
            title: 'Tipo da Avaria',
            dataIndex: 'tipoAvaria',
            key: 'TipoDaAvaria',
        },
        {
            title: 'Qtde',
            dataIndex: 'quantidade',
            key: 'Qtde',
        },
        {
            title: 'Assinatura',
            dataIndex: 'assinatura',
            key: 'assinatura',
        }
    ]

    const itemsCollapse = [
        {
            key: '1',
            label: 'Termo de Responsabilidade',
            children: <>
                <p>Declaro que realizei a conferência de cardapio e que recebi o(s) equipamento(s) e acessório(s) em
                    perfeito
                    estado. Serei o responsável durante todo o período de trabalho, de forma a restituí-lo ao final do
                    evento,
                    em perfeito estado de conservação e uso, responsabilizando-me perante ao organizador do evento nos casos
                    de
                    extravio, furto, apropriação indébita, roubo, danos, ou qualquer evento que venha a prejudicar a
                    integridade
                    do terminal, ressarcindo os valores dos mesmos.</p>
                <p>Perda: POS: R$480; Celular: R$800; Tablet: R$1210; Totem: R$4095; Carregador e/ou cabo USB: R$20;
                    Bateria: R$60; Chip: R$3; Capa: R$25;
                    Suporte: R$5; Powerbank: R$300; Tampa Traseira: R$28; Mochila/Costeira: R$100; Pirulito: R$100; Cartão
                    Cashless: R$7; Filtro de Linha: R$30; Box Truss Q15 1mt: R$100; Box Truss Q15 50cm: R$60; Base Q15
                    60x60cm: R$80; Rodinhas Rodízio Giratória: R$35,34; Letreiro Luminoso: R$344; Passo a Passo: R$9,67;
                    Case p/ Terminal: R$150; Torre Completa com Soldagem: R$330</p>
                <p>Avaria: POS: R$240; Celular: R$800; Tablet: R$605; Totem: R$2048; Carregador e/ou cabo USB: R$20;
                    Bateria: R$60; Chip: R$3; Capa: R$25;
                    Suporte: R$5; Powerbank: R$150; Tampa Traseira: R$28; Mochila/Costeira: R$100; Pirulito: R$50; Cartão
                    Cashless: R$7; Filtro de Linha: R$30; Box Truss Q15 1mt: R$100; Box Truss Q15 50cm: R$60; Base Q15
                    60x60cm: R$80; Rodinhas Rodízio Giratória: R$35,34; Letreiro Luminoso: R$344; Passo a Passo: R$9,67;
                    Case p/ Terminal: R$150; Torre Completa com Soldagem: R$330</p>
            </>
        },
        {
            key: '2',
            label: 'Termo de Treinamento',
            children: <>
                <p>Confirmo que recebi o treinamento operacional necessário para executar as tarefas designadas de forma
                    eficiente e segura. Ou recuso o treinamento operacional oferecido, com base no conhecimento já existente
                    da equipe sobre os procedimentos relacionados às atividades a serem realizadas. Neste último caso,
                    manifesto que estou plenamente ciente das responsabilidades inerentes à função atribuida e compreendo
                    que é de minha inteira responsabilidade garantir que as atividades sejam conduzidas de acordo com os
                    padrões estabelecidos. Reconheço que a recusa do treinamento operacional não isenta minha obrigação de
                    seguir as políticas e procedimentos vigentes e de contribuir para a segurança e sucesso das operações da
                    equipe.</p>
            </>
        },
        {
            key: '3',
            label: 'Termo de Cardápios',
            children: <>
                <p>Declaro que conferi e estou de acordo com todos os preços inseridos
                    no sistema, onde os mesmos serão utilizados nas vendas dos produtos durante o evento. Qualquer alteração
                    de preço com o evento em andamento não é de responsabilidade financeira da Zig.</p>
            </>
        }
    ]

    const selectEquipamento = [
        {
            value: 'Pag A930',
            label: 'Pag A930',
        },
        {
            value: 'Pag P2',
            label: 'Pag P2',
        },
        {
            value: 'Pag Moderninha X',
            label: 'Pag Moderninha X',
        },
        {
            value: 'Safra P2',
            label: 'Safra P2',
        },
        {
            value: 'Safra L300',
            label: 'Safra L300',
        },
        {
            value: 'GetNet P2',
            label: 'GetNet P2',
        },
        {
            value: 'Pinbank P2',
            label: 'Pinbank P2',
        },
        {
            value: 'Mercado Pago A910',
            label: 'Mercado Pago A910',
        },
        {
            value: 'Cielo L300',
            label: 'Cielo L300',
        },
        {
            value: 'Rede L400',
            label: 'Rede L400',
        },
        {
            value: 'Celular',
            label: 'Celular',
        },
        {
            value: 'Tablet',
            label: 'Tablet',
        },
        {
            value: 'Carregador',
            label: 'Carregador',
        },
        {
            value: 'Capa',
            label: 'Capa',
        },
        {
            value: 'Suporte',
            label: 'Suporte',
        },
        {
            value: 'Powerbank e Cabo USB',
            label: 'Powerbank e Cabo USB',
        },
        {
            value: 'Pontos de tomada',
            label: 'Pontos de tomada',
        },
        {
            value: 'Cartao Cashless',
            label: 'Cartão Cashless',
        },
        {
            value: 'Pirulito',
            label: 'Pirulito',
        },
        {
            value: 'Mochila ou Costeira',
            label: 'Mochila ou Costeira',
        },
        {
            value: 'Box Truss Q15 1mt',
            label: 'Box Truss Q15 1mt',
        },
        {
            value: 'Box Truss Q15 50cm',
            label: 'Box Truss Q15 50cm',
        },
        {
            value: 'Base Q15 60x60cm',
            label: 'Base Q15 60x60cm',
        },
        {
            value: 'Rodinhas Rodizio Giratoria',
            label: 'Rodinhas Rodizio Giratoria',
        },
        {
            value: 'Letreiro Luminoso',
            label: 'Letreiro Luminoso',
        },
        {
            value: 'Passo a Passo',
            label: 'Passo a Passo',
        },
        {
            value: 'Case p Terminal',
            label: 'Case p Terminal',
        },
        {
            value: 'Torre completa com soldagem',
            label: 'Torre completa com soldagem',
        }
    ]

    const selectAvarias = [
        {
            value: 'Perda',
            label: 'Perda',
        },
        {
            value: 'Perda de Bateria',
            label: 'Perda de Bateria',
        },
        {
            value: 'Perda de Chip',
            label: 'Perda de Chip',
        },
        {
            value: 'Display ou Teclado Danificado',
            label: 'Display ou Teclado Danificado',
        },
        {
            value: 'Tamper',
            label: 'Tamper',
        },
        {
            value: 'Tampa Traseira',
            label: 'Tampa Traseira',
        },
        {
            value: 'Impressora',
            label: 'Impressora',
        }
    ]

    useEffect(() => {
        const getPlanoData = async () => {
            try {
                setTableLoading(true)
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` }),
                });

                const responseEntrega = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosEntrega` }),
                });

                const responseDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosDevolucao` }),
                });

                let docs = await response.json();
                docs = docs.docs;

                let docsEntrega = await responseEntrega.json()
                docsEntrega = docsEntrega.docs;

                let docsDevolucao = await responseDevolucao.json()
                docsDevolucao = docsDevolucao.docs;

                const entregaMap = Object.fromEntries(docsEntrega.map(doc => [doc.id, doc.data]));
                const devolucaoMap = Object.fromEntries(docsDevolucao.map(doc => [doc.id, doc.data]));

                const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                    const data = doc.data;
                    const entregaData = entregaMap[doc.id] || {};
                    const devolucaoData = devolucaoMap[doc.id] || {};
                    return {
                        key: doc.id,
                        ID: data.rowNumber,
                        Setor: data.SETOR || 'N/A',
                        'Ponto de Venda': data['NOME PDV'],
                        Categoria: data.CATEGORIA || 'N/A',
                        Status: data.aberto && !data.devolvido ? 'Entregue'
                            : data.aberto && data.devolvido ? 'Devolvido'
                                : 'Entrega Pendente',
                        'Perda/Avaria': devolucaoData?.Avarias?.length > 0 ? 'Sim' : 'Não',
                        modelo: data.MODELO,
                        cartoes: data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] ? '0' : data['CARTÃO CASHLES'] : 0,
                        totalTerminais: data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? '0' : data['TOTAL TERM'] : 0,
                        powerbanks: data['POWER BANK'] ? data['POWER BANK'] == ' ' ? '0' : data['POWER BANK'] : '0',
                        carregadores: data.CARREG ? data.CARREG == ' ' ? '0' : data.CARREG : '0',
                        capas: data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? '0' : data['CAPA SUPORTE'] : '0',
                        tomadas: data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? '0' : data['PONTOS TOMADA'] : '0',
                        entregaInfo: entregaData,
                        devolucaoInfo: devolucaoData
                    };
                });

                const categorias = [
                    ...new Set(docs.map((doc) => doc.data.CATEGORIA))
                ].map((categoria) => ({
                    text: categoria || 'N/A',
                    value: categoria || 'N/A'
                }));

                const setores = [
                    ...new Set(docs.map((doc) => doc.data.SETOR))
                ].map((setor) => ({
                    text: setor || 'N/A',
                    value: setor || 'N/A'
                }));

                setFilterCategoria(categorias)
                setFilterSetor(setores)
                setDataPlano(formattedData);
                setTableLoading(false)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (pipeId) {
            getPlanoData();
        }
    }, [pipeId]);

    const start = async () => {
        setLoading(true);
        setTimeout(() => {
            setSelectedRowKeys([]);
            setLoading(false);
        }, 1000);
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const editValue = async (type) => {
        setLoading(true)
        const array = type.split('_')
        const operation = array[0]
        const id = array[1]
        let value, key

        switch (operation) {
            case 'terminal':
                value = valueTerminal
                key = 'TOTAL TERM'
                break;

            case 'carregador':
                value = valueCarregador
                key = 'CARREG'
                break;

            case 'cartao':
                value = valueCartao
                key = 'CARTÃO CASHLES'
                break;

            case 'capa':
                value = valueCapa
                key = 'CAPA SUPORTE'
                break;

            case 'powerbank':
                value = valuePowerbank
                key = 'POWER BANK'
                break;

            case 'tomada':
                value = valueTomada
                key = 'PONTOS TOMADA'
                break;
        }

        const data = {
            [key]: value
        }

        const docId = `pipeId_${pipeId}/planoOperacional/${id}`
        const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ docId, data })
        })

        if (response.ok) {

            try {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` }),
                });

                const responseEntrega = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosEntrega` }),
                });

                const responseDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosDevolucao` }),
                });

                let docs = await response.json();
                docs = docs.docs;

                let docsEntrega = await responseEntrega.json()
                docsEntrega = docsEntrega.docs;

                let docsDevolucao = await responseDevolucao.json()
                docsDevolucao = docsDevolucao.docs;

                const entregaMap = Object.fromEntries(docsEntrega.map(doc => [doc.id, doc.data]));
                const devolucaoMap = Object.fromEntries(docsDevolucao.map(doc => [doc.id, doc.data]));

                const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                    const data = doc.data;
                    const entregaData = entregaMap[doc.id] || {};
                    const devolucaoData = devolucaoMap[doc.id] || {};

                    return {
                        key: doc.id,
                        ID: data.rowNumber,
                        Setor: data.SETOR || 'N/A',
                        'Ponto de Venda': data['NOME PDV'],
                        Categoria: data.CATEGORIA || 'N/A',
                        Status: data.aberto && !data.devolvido ? 'Entregue'
                            : data.aberto && data.devolvido ? 'Devolvido'
                                : 'Entrega Pendente',
                        'Perda/Avaria': devolucaoData?.Avarias?.length > 0 ? 'Sim' : 'Não',
                        modelo: data.MODELO,
                        cartoes: data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? '0' : data['CARTÃO CASHLES'] : 0,
                        totalTerminais: data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? '0' : data['TOTAL TERM'] : 0,
                        powerbanks: data['POWER BANK'] ? data['POWER BANK'] == ' ' ? '0' : data['POWER BANK'] : '0',
                        carregadores: data.CARREG ? data.CARREG == ' ' ? '0' : data.CARREG : '0',
                        capas: data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? '0' : data['CAPA SUPORTE'] : '0',
                        tomadas: data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? '0' : data['PONTOS TOMADA'] : '0',
                        entregaInfo: entregaData,
                        devolucaoInfo: devolucaoData
                    };
                });

                setDataPlano(formattedData)
            } catch (error) {
                console.error(error);
            }

        } else {
            alert('Erro ao modificar valor!');
        }
        setLoading(false)
        openNotificationSucess()
    }

    const processAvariasArray = (allAvarias) => {
        if (!allAvarias || !Array.isArray(allAvarias)) return [];

        const counts = {};

        allAvarias.forEach((avaria) => {
            const [equipment, damage] = avaria.split(': ');

            const key = `${equipment.trim()} - ${damage.trim()}`;

            if (counts[key]) {
                counts[key]++;
            } else {
                counts[key] = 1;
            }
        });

        return Object.entries(counts).map(([key, count]) => `${key}: ${count}`);
    };

    const entregarPonto = async (record) => {
        setDrawerLoading(true)
        const currentTimeString = new Date().toLocaleString()
        try {
            const completeData = {
                ...formValues,
                TecnicoResponsavel: localStorage.getItem('currentUser'),
                assinatura: signature,
                dataHora: currentTimeString,
                modelo_terminal: record.modelo || 'N/A',
                qtd_terminal: parseInt(record.totalTerminais) || 0,
                qtd_suporte: parseInt(record.capas) || 0,
                qtd_carreg: parseInt(record.carregadores) || 0,
                qtd_cartao: parseInt(record.cartoes) || 0,
                qtd_powerbank: parseInt(record.powerbanks) || 0,
                qtd_tomada: parseInt(record.tomadas) || 0,
                timestamp: new Date().getTime()
            };

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formData: completeData,
                    docId: record.key,
                    collectionURL: `pipe/pipeId_${pipeId}/protocolosEntrega`
                }),
            })

            if (response.ok) {
                const responsePlano = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ docId: `pipeId_${pipeId}/planoOperacional/${record.key}`, data: { aberto: true } })
                })

                if (responsePlano.ok) {
                    const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshot', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` }),
                    });

                    const responseEntrega = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosEntrega` }),
                    });

                    const responseDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosDevolucao` }),
                    });

                    let docs = await response.json();
                    docs = docs.docs;

                    let docsEntrega = await responseEntrega.json()
                    docsEntrega = docsEntrega.docs;

                    let docsDevolucao = await responseDevolucao.json()
                    docsDevolucao = docsDevolucao.docs;

                    const entregaMap = Object.fromEntries(docsEntrega.map(doc => [doc.id, doc.data]));
                    const devolucaoMap = Object.fromEntries(docsDevolucao.map(doc => [doc.id, doc.data]));

                    const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                        const data = doc.data;
                        const entregaData = entregaMap[doc.id] || {};
                        const devolucaoData = devolucaoMap[doc.id] || {};

                        return {
                            key: doc.id,
                            ID: data.rowNumber,
                            Setor: data.SETOR || 'N/A',
                            'Ponto de Venda': data['NOME PDV'],
                            Categoria: data.CATEGORIA || 'N/A',
                            Status: data.aberto && !data.devolvido ? 'Entregue'
                                : data.aberto && data.devolvido ? 'Devolvido'
                                    : 'Entrega Pendente',
                            'Perda/Avaria': devolucaoData?.Avarias?.length > 0 ? 'Sim' : 'Não',
                            modelo: data.MODELO,
                            cartoes: data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? '0' : data['CARTÃO CASHLES'] : 0,
                            totalTerminais: data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? '0' : data['TOTAL TERM'] : 0,
                            powerbanks: data['POWER BANK'] ? data['POWER BANK'] == ' ' ? '0' : data['POWER BANK'] : '0',
                            carregadores: data.CARREG ? data.CARREG == ' ' ? '0' : data.CARREG : '0',
                            capas: data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? '0' : data['CAPA SUPORTE'] : '0',
                            tomadas: data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? '0' : data['PONTOS TOMADA'] : '0',
                            entregaInfo: { ...entregaData },
                            devolucaoInfo: { ...devolucaoData }
                        };
                    });

                    setDataPlano(formattedData)
                    openNotificationSucessPDV('entregue')
                    setDrawerLoading(false)
                    setDrawerVisible(false)
                }
            }
        } catch (error) {
            console.error(error);
            setDrawerLoading(false)
        }
    }

    const devolverPonto = async (record) => {
        setDrawerLoading(true)
        const currentTimeString = new Date().toLocaleString()
        const avariasFormatadas = avarias.flatMap(avaria =>
            Array.from({ length: avaria.quantidade }, () => `${avaria.equipamento}: ${avaria.tipoAvaria}`)
        )
        setAvarias([])

        try {
            const completeData = {
                ...formValues,
                TecnicoResponsavel: localStorage.getItem('currentUser'),
                assinatura: signature,
                dataHora: currentTimeString,
                modelo_terminal: record.modelo || 'N/A',
                qtd_terminal: parseInt(record.totalTerminais) || 0,
                qtd_suporte: parseInt(record.capas) || 0,
                qtd_carreg: parseInt(record.carregadores) || 0,
                qtd_cartao: parseInt(record.cartoes) || 0,
                qtd_powerbank: parseInt(record.powerbanks) || 0,
                qtd_tomada: parseInt(record.tomadas) || 0,
                Avarias: avariasFormatadas,
                timestamp: new Date().getTime()
            };

            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formData: completeData,
                    docId: record.key,
                    collectionURL: `pipe/pipeId_${pipeId}/protocolosDevolucao`
                }),
            })

            if (response.ok) {
                const responsePlano = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ docId: `pipeId_${pipeId}/planoOperacional/${record.key}`, data: { devolvido: true } })
                })

                if (responsePlano.ok) {
                    const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshot', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` }),
                    });

                    const responseEntrega = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosEntrega` }),
                    });

                    const responseDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosDevolucao` }),
                    });

                    let docs = await response.json();
                    docs = docs.docs;

                    let docsEntrega = await responseEntrega.json()
                    docsEntrega = docsEntrega.docs;

                    let docsDevolucao = await responseDevolucao.json()
                    docsDevolucao = docsDevolucao.docs;

                    const entregaMap = Object.fromEntries(docsEntrega.map(doc => [doc.id, doc.data]));
                    const devolucaoMap = Object.fromEntries(docsDevolucao.map(doc => [doc.id, doc.data]));

                    const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                        const data = doc.data;
                        const entregaData = entregaMap[doc.id] || {};
                        const devolucaoData = devolucaoMap[doc.id] || {};

                        return {
                            key: doc.id,
                            ID: data.rowNumber,
                            Setor: data.SETOR || 'N/A',
                            'Ponto de Venda': data['NOME PDV'],
                            Categoria: data.CATEGORIA || 'N/A',
                            Status: data.aberto && !data.devolvido ? 'Entregue'
                                : data.aberto && data.devolvido ? 'Devolvido'
                                    : 'Entrega Pendente',
                            'Perda/Avaria': devolucaoData?.Avarias?.length > 0 ? 'Sim' : 'Não',
                            modelo: data.MODELO,
                            cartoes: data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? '0' : data['CARTÃO CASHLES'] : 0,
                            totalTerminais: data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? '0' : data['TOTAL TERM'] : 0,
                            powerbanks: data['POWER BANK'] ? data['POWER BANK'] == ' ' ? '0' : data['POWER BANK'] : '0',
                            carregadores: data.CARREG ? data.CARREG == ' ' ? '0' : data.CARREG : '0',
                            capas: data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? '0' : data['CAPA SUPORTE'] : '0',
                            tomadas: data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? '0' : data['PONTOS TOMADA'] : '0',
                            entregaInfo: { ...entregaData },
                            devolucaoInfo: { ...devolucaoData },
                        };
                    });

                    setDataPlano(formattedData)
                    openNotificationSucessPDV('entregue')
                    setDrawerLoading(false)
                    setDrawerVisible(false)
                }
            }
        } catch (error) {
            console.error(error);
            setDrawerLoading(false)
        }
    }

    const addAvaria = () => {
        if (formAvarias.equipamento && formAvarias.tipoAvaria && formAvarias.quantidade) {
            setAvarias([...avarias, formAvarias]);
            setFormAvarias({});
        } else {
            alert("Preencha todos os campos!");
        }
    };

    const lancarAvariasAvulsas = async (record) => {
        if (avarias.length > 0 && signature != '') {
            setDrawerLoading(true)
            const currentTimeString = new Date().toLocaleString()
            const avariasFormatadas = avarias.flatMap(avaria =>
                Array.from({ length: avaria.quantidade }, () => `${avaria.equipamento}: ${avaria.tipoAvaria}`)
            )
            setAvarias([])

            const formattedData = {
                assinatura: signature,
                avarias: avariasFormatadas,
                dataHora: currentTimeString,
                timestamp: new Date().getTime(),
                tecnicoResponsavel: localStorage.getItem('currentUser'),
            }
            setSignature('')

            try {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ collectionURL: `pipe/pipeId_${pipeId}/planoOperacional/${record.key}/avarias`, formData: formattedData }),
                })

                if (response.ok) {
                    openNotificationSucessAvariasAvulsas()
                    setDrawerLoading(false)
                    setDrawerVisible(false)
                }
            } catch (error) {
                console.error(error);
            }
        } else {

        }
    }

    const criarPDV = async () => {
        setDrawerLoading(true)
        try {
            const responseDocs = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` })
            })

            const responseEvento = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: 'pipe', docId: `pipeId_${pipeId}` })
            })

            let dataEvento = await responseEvento.json()

            let data = await responseDocs.json()
            data = data.docs

            const pontoData = {
                "NOME PDV": formPDV.nomePonto,
                "SETOR": formPDV.setor,
                "CATEGORIA": formPDV.categoria,
                "COD PLANTA": formPDV.codPlanta,
                "AREA": formPDV.area,
                "MODELO": formPDV.modelo,
                "TOTAL TERM": formPDV.totalTerminais || 0,
                "CARREG": formPDV.carregadores || 0,
                "CAPA SUPORTE": formPDV.capas || 0,
                "CARTÃO CASHLES": formPDV.cartoes || 0,
                "POWER BANK": formPDV.powerbanks || 0,
                "PONTOS TOMADA": formPDV.tomadas || 0,
                "PIPEID": pipeId,
                "rowNumber": data.length + 1,
                "EVENTO": dataEvento.EVENTO,
                "ENDERECO": dataEvento.ENDERECO,
                "taskId": dataEvento.taskId,
                "tecnicoResponsavel": localStorage.getItem('currentUser'),
            }

            const responseCreate = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionURL: `pipe/pipeId_${pipeId}/planoOperacional`, docId: formPDV.nomePonto, formData: pontoData })
            })

            if (responseCreate.ok) {

                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` }),
                });

                const responseEntrega = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosEntrega` }),
                });

                const responseDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosDevolucao` }),
                });

                let docs = await response.json();
                docs = docs.docs;

                let docsEntrega = await responseEntrega.json()
                docsEntrega = docsEntrega.docs;

                let docsDevolucao = await responseDevolucao.json()
                docsDevolucao = docsDevolucao.docs;

                const entregaMap = Object.fromEntries(docsEntrega.map(doc => [doc.id, doc.data]));
                const devolucaoMap = Object.fromEntries(docsDevolucao.map(doc => [doc.id, doc.data]));

                const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                    const data = doc.data;
                    const entregaData = entregaMap[doc.id] || {};
                    const devolucaoData = devolucaoMap[doc.id] || {};

                    return {
                        key: doc.id,
                        ID: data.rowNumber,
                        Setor: data.SETOR || 'N/A',
                        'Ponto de Venda': data['NOME PDV'],
                        Categoria: data.CATEGORIA || 'N/A',
                        Status: data.aberto && !data.devolvido ? 'Entregue'
                            : data.aberto && data.devolvido ? 'Devolvido'
                                : 'Entrega Pendente',
                        'Perda/Avaria': devolucaoData?.Avarias?.length > 0 ? 'Sim' : 'Não',
                        modelo: data.MODELO,
                        cartoes: data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? '0' : data['CARTÃO CASHLES'] : 0,
                        totalTerminais: data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? '0' : data['TOTAL TERM'] : 0,
                        powerbanks: data['POWER BANK'] ? data['POWER BANK'] == ' ' ? '0' : data['POWER BANK'] : '0',
                        carregadores: data.CARREG ? data.CARREG == ' ' ? '0' : data.CARREG : '0',
                        capas: data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? '0' : data['CAPA SUPORTE'] : '0',
                        tomadas: data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? '0' : data['PONTOS TOMADA'] : '0',
                        entregaInfo: { ...entregaData },
                        devolucaoInfo: { ...devolucaoData }
                    };
                });

                setDataPlano(formattedData)
                setFormPDV({})
                setCreatePonto(false)
                setDrawerLoading(false)
            } else {
                console.error(responseCreate.statusText)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const hasSelected = selectedRowKeys.length > 0;

    const components = {
        body: {
          row: (props) => (
            <tr {...props} style={{ backgroundColor: "#f9f9f9", height: "50px" }} />
          ),
          cell: (props) => (
            <td
              {...props}
              style={{
                borderBottom: "2px solid #ddd",
                padding: "12px",
                fontSize: "14px",
              }}
            />
          ),
        },
        header: {
          cell: (props) => (
            <th
              {...props}
              style={{
                color: "black",
                fontWeight: "bold",
                textAlign: "center",
              }}
            />
          ),
        },
      };

    return (
        <>
            {contextHolder}
            {/* Drawer Detalhes do PDV */}
            <Drawer
                open={drawerVisible}
                onClose={closeDrawer}
                title="Protocolo de Equipamentos"
                loading={drawerLoading} >

                {currentRecord && (
                    <>
                        <div style={{ marginBottom: '2vh' }}>
                            <h2>{currentRecord.key}</h2>
                            <Table
                                scroll={{ x: "max-content" }}
                                columns={internalColumns}
                                dataSource={[currentRecord]}
                                pagination={false}
                            />
                        </div>

                        {currentRecord.Status == 'Devolvido' ? '' :
                            <>
                                <Collapse style={{ marginBottom: '2vh' }} items={itemsCollapse} />

                                <Form layout='vertical'
                                    onValuesChange={(changedValues, allValues) => setFormValues(allValues)}>
                                    <Form.Item label='Parceiro Responsável' name='Cliente'>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label='Nº de Telefone' name='Telefone'>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label='Endereço de Email' name='Email'>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label='CPF' name='CPF'>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label='Li e aceito os termos de treinamento, cárdapios e responsabilidade.' name='termoDeResponsabilidade' valuePropName='checked'>
                                        <Checkbox />
                                    </Form.Item>

                                    {currentRecord.Status == 'Entregue' &&
                                        <>
                                            <h3>Adicionar Avarias</h3>
                                            <Form
                                                layout='vertical'
                                                onValuesChange={(changedValuesAvarias, allValuesAvarias) => setFormAvarias(allValuesAvarias)}>
                                                <Form.Item label='Equipamento' name='equipamento'>
                                                    <Select options={selectEquipamento} />
                                                </Form.Item>
                                                <Form.Item label='Tipo da Avaria' name='tipoAvaria'>
                                                    <Select options={selectAvarias} />
                                                </Form.Item>
                                                <Form.Item label='Quantidade' name='quantidade'>
                                                    <InputNumber />
                                                </Form.Item>
                                                <Form.Item>
                                                    <Button type="primary" onClick={addAvaria}>Adicionar Avaria</Button>
                                                </Form.Item>

                                                <Table
                                                    scroll={{ x: "max-content" }}
                                                    columns={avariasColumns}
                                                    dataSource={avarias}
                                                    pagination={false}
                                                    style={{ marginBottom: '2vh' }} />

                                                <Button
                                                    type='primary'
                                                    onClick={() => lancarAvariasAvulsas(currentRecord)}
                                                    style={{ marginBottom: '2vh' }}   >
                                                    Lançar avarias avulsas
                                                </Button>

                                            </Form>
                                        </>
                                    }
                                    <Form.Item label='Assinatura do Parceiro' name='assinatura'>
                                        <Canvas onDrawingComplete={(base64) => setSignature(base64)} />
                                    </Form.Item>

                                    {currentRecord.Status == 'Devolvido' ? '' : currentRecord.Status == 'Entregue' ? <Button type='primary' onClick={() => devolverPonto(currentRecord)}>Confirmar Devolução</Button> : <Button onClick={() => entregarPonto(currentRecord)} type='primary'>Confirmar Entrega</Button>}
                                </Form></>}
                    </>
                )}

            </Drawer>
            {/* Drawer Criador de PDV */}
            <Drawer
                open={createPonto}
                onClose={() => setCreatePonto(false)}
                title='Criar Ponto de Venda'
                loading={drawerLoading}>
                <Form layout='vertical' onValuesChange={(changedValues, allValues) => setFormPDV(allValues)}>
                    <Form.Item label='Nome do Ponto de Venda' name='nomePonto'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Setor' name='setor'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Área' name='area'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Código da planta' name='codPlanta'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Parceiro' name='parceiro'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Categoria' name='categoria'>
                        <Input />
                    </Form.Item>
                    <Form.Item label='Modelo do Terminal' name='modelo'>
                        <Select options={selectEquipamento} />
                    </Form.Item>
                    <Form.Item label='Quantidade de Terminais' name='totalTerminais'>
                        <InputNumber defaultValue={0} />
                    </Form.Item>
                    <Form.Item label='Carregadores' name='carregadores'>
                        <InputNumber defaultValue={0} />
                    </Form.Item>
                    <Form.Item label='Capas / Suportes' name='capas'>
                        <InputNumber defaultValue={0} />
                    </Form.Item>
                    <Form.Item label='Cartões Cashless' name='cartoes'>
                        <InputNumber defaultValue={0} />
                    </Form.Item>
                    <Form.Item label='Powerbanks' name='powerbanks'>
                        <InputNumber defaultValue={0} />
                    </Form.Item>
                    <Form.Item label='Pontos de Tomada' name='tomadas'>
                        <InputNumber defaultValue={0} />
                    </Form.Item>
                    <Form.Item>
                        <Button type='primary' onClick={criarPDV}>Criar Ponto de Venda</Button>
                    </Form.Item>
                </Form>
            </Drawer>

            <div style={{ backgroundColor: "#FFFD", width: '100%', margin: '0 auto auto auto', padding: '15px' }}>
                <Flex gap="middle" vertical style={{ marginTop: "2vh" }}>
                    <Flex>
                        <Breadcrumb items={[{ title: 'Field Zigger' }, { title: 'Plano Operacional' }]} />
                    </Flex>

                    <Flex align="center" gap="middle">
                        <Button type='primary' onClick={setCreatePonto}>Criar novo ponto de venda</Button>

                        <Button type="primary" onClick={start} disabled={!hasSelected} loading={loading}>
                            Reload
                        </Button>

                        {hasSelected ? `${selectedRowKeys.length} itens selecionados` : null}
                    </Flex>

                    <Table style={{ width: "100%" }} loading={tableLoading} rowSelection={rowSelection} columns={columns} dataSource={dataPlano} scroll={{ x: "max-content" }} expandable={{
                        expandedRowRender: (record) => (
                            <>
                                <div className='info-pdv'>
                                    <Card loading={false} key={record.key} title='Equipamentos' style={{ width: '100%', textAlign: 'center', fontSize: 'x-small' }} >
                                        <Card.Grid style={gridStyle}>{record.modelo}<br />
                                            {
                                                !editTerminais ?
                                                    <a
                                                        onClick={() => {
                                                            setValueTerminal(record.totalTerminais)
                                                            setEditTerminais(true)
                                                        }}
                                                        key={'terminal_' + record.key}>
                                                        {record.totalTerminais}
                                                    </a> :
                                                    (
                                                        <Flex align='center' >
                                                            <InputNumber
                                                                style={{ marginLeft: 'auto', marginRight: '5px' }}
                                                                defaultValue={record.totalTerminais}
                                                                onChange={(value) => setValueTerminal(value)}
                                                                min={0} />
                                                            <Button
                                                                style={{ marginRight: 'auto' }}
                                                                type='primary'
                                                                loading={loading}
                                                                onClick={async (e) => {
                                                                    await editValue('terminal_' + record.key)
                                                                    setEditTerminais(false)
                                                                }} >
                                                                Ok
                                                            </Button>
                                                        </Flex>
                                                    )
                                            }
                                        </Card.Grid>
                                        <Card.Grid style={gridStyle}>Carregadores<br />
                                            {
                                                !editCarregador ?
                                                    <a
                                                        onClick={() => {
                                                            setValueCarregador(record.carregadores)
                                                            setEditCarregador(true)
                                                        }}
                                                        key={'carregador_' + record.key}>
                                                        {record.carregadores}
                                                    </a> :
                                                    (
                                                        <Flex align='center' >
                                                            <InputNumber
                                                                style={{ marginLeft: 'auto', marginRight: '5px' }}
                                                                defaultValue={record.carregadores}
                                                                onChange={(value) => setValueCarregador(value)}
                                                                min={0} />
                                                            <Button
                                                                style={{ marginRight: 'auto' }}
                                                                type='primary'
                                                                loading={loading}
                                                                onClick={async () => {
                                                                    await editValue('carregador_' + record.key)
                                                                    setEditCarregador(false)
                                                                }} >
                                                                Ok
                                                            </Button>
                                                        </Flex>
                                                    )
                                            }
                                        </Card.Grid>
                                        <Card.Grid style={gridStyle}>Capas / Suportes<br />
                                            {
                                                !editCapa ?
                                                    <a
                                                        onClick={() => {
                                                            setValueCapa(record.capas)
                                                            setEditCapa(true)
                                                        }}
                                                        key={'capa_' + record.key}>
                                                        {record.capas}
                                                    </a> :
                                                    (
                                                        <Flex align='center' >
                                                            <InputNumber
                                                                style={{ marginLeft: 'auto', marginRight: '5px' }}
                                                                defaultValue={record.capas}
                                                                onChange={(value) => setValueCapa(value)}
                                                                min={0} />
                                                            <Button
                                                                style={{ marginRight: 'auto' }}
                                                                type='primary'
                                                                loading={loading}
                                                                onClick={async () => {
                                                                    await editValue('capa_' + record.key)
                                                                    setEditCapa(false)
                                                                }} >
                                                                Ok
                                                            </Button>
                                                        </Flex>
                                                    )
                                            }
                                        </Card.Grid>
                                        <Card.Grid style={gridStyle}>Cartões Cashless<br />
                                            {
                                                !editCartao ?
                                                    <a
                                                        onClick={() => {
                                                            setValueCartao(record.cartoes)
                                                            setEditCartao(true)
                                                        }}
                                                        key={'cartao_' + record.key}>
                                                        {record.cartoes}
                                                    </a> :
                                                    (
                                                        <Flex align='center' >
                                                            <InputNumber
                                                                style={{ marginLeft: 'auto', marginRight: '5px' }}
                                                                defaultValue={record.cartoes}
                                                                onChange={(value) => setValueCartao(value)}
                                                                min={0} />
                                                            <Button
                                                                style={{ marginRight: 'auto' }}
                                                                type='primary'
                                                                loading={loading}
                                                                onClick={async () => {
                                                                    await editValue('cartao_' + record.key)
                                                                    setEditCartao(false)
                                                                }} >
                                                                Ok
                                                            </Button>
                                                        </Flex>
                                                    )
                                            }
                                        </Card.Grid>
                                        <Card.Grid style={gridStyle}>Power Banks<br />
                                            {
                                                !editPowerbank ?
                                                    <a
                                                        onClick={() => {
                                                            setValuePowerbank(record.powerbanks)
                                                            setEditPowerbank(true)
                                                        }}
                                                        key={'powerbank_' + record.key}>
                                                        {record.powerbanks}
                                                    </a> :
                                                    (
                                                        <Flex align='center' >
                                                            <InputNumber
                                                                style={{ marginLeft: 'auto', marginRight: '5px' }}
                                                                defaultValue={record.powerbanks}
                                                                onChange={(value) => setValuePowerbank(value)}
                                                                min={0} />
                                                            <Button
                                                                style={{ marginRight: 'auto' }}
                                                                type='primary'
                                                                loading={loading}
                                                                onClick={async () => {
                                                                    await editValue('powerbank_' + record.key)
                                                                    setEditPowerbank(false)
                                                                }} >
                                                                Ok
                                                            </Button>
                                                        </Flex>
                                                    )
                                            }
                                        </Card.Grid>
                                        <Card.Grid style={gridStyle}>Pontos de Tomada<br />
                                            {
                                                !editTomada ?
                                                    <a
                                                        onClick={() => {
                                                            setValueTomada(record.tomada)
                                                            setEditTomada(true)
                                                        }}
                                                        key={'tomada_' + record.key}>
                                                        {record.tomadas}
                                                    </a> :
                                                    (
                                                        <Flex align='center' >
                                                            <InputNumber
                                                                style={{ marginLeft: 'auto', marginRight: '5px' }}
                                                                defaultValue={record.tomadas}
                                                                onChange={(value) => setValueTomada(value)}
                                                                min={0} />
                                                            <Button
                                                                style={{ marginRight: 'auto' }}
                                                                type='primary'
                                                                loading={loading}
                                                                onClick={async () => {
                                                                    await editValue('tomada_' + record.key)
                                                                    setEditTomada(false)
                                                                }} >
                                                                Ok
                                                            </Button>
                                                        </Flex>
                                                    )
                                            }
                                        </Card.Grid>
                                    </Card>
                                </div>
                                <div className='info-pdv'>
                                    <Card loading={false} title='Protocolo de Entrega' style={{ width: '100%', textAlign: 'center', fontSize: 'x-small' }} >
                                        <Card.Grid style={gridStyle}><b>Nome do Parceiro:</b><br />{record.entregaInfo.Cliente || 'Não Entregue'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>CPF:</b><br />{record.entregaInfo.CPF ? "x".repeat(8) + record.entregaInfo.CPF.slice(8) : 'Não Entregue'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>Telefone:</b><br />{record.entregaInfo.Telefone || 'Não Entregue'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>Data da Entrega:</b><br />{record.entregaInfo.dataHora || 'Não Entregue'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>Técnico Responsável:</b><br />{record.entregaInfo.TecnicoResponsavel || 'Não Entregue'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>Assinatura:</b><br />
                                            {record.entregaInfo?.assinatura ? (
                                                <img src={record.entregaInfo.assinatura} style={{ width: '75px', margin: '0' }} />
                                            ) : (
                                                'Não Entregue'
                                            )}</Card.Grid>
                                    </Card>
                                </div>
                                <div className='info-pdv'>
                                    <Card loading={false} title='Protocolo de Devolução' style={{ width: '100%', textAlign: 'center', fontSize: 'x-small' }} >
                                        <Card.Grid style={gridStyle}><b>Nome do Parceiro:</b><br />{record.devolucaoInfo.Cliente || 'Não Devolvido'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>CPF:</b><br />{record.devolucaoInfo.CPF ? "x".repeat(8) + record.devolucaoInfo.CPF.slice(8) : 'Não Devolvido'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>Telefone:</b><br />{record.devolucaoInfo.Telefone || 'Não Devolvido'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>Data da Devolução:</b><br />{record.devolucaoInfo.dataHora || 'Não Devolvido'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>Técnico Responsável:</b><br />{record.devolucaoInfo.TecnicoResponsavel || 'Não Devolvido'}</Card.Grid>
                                        <Card.Grid style={gridStyle}><b>Assinatura:</b><br />
                                            {record.devolucaoInfo?.assinatura ? (
                                                <img src={record.devolucaoInfo.assinatura} style={{ width: '100px', padding: '0' }} />
                                            ) : (
                                                'Não Devolvido'
                                            )}</Card.Grid>
                                        <Card.Grid style={{ width: '100%', fontSize: 'small' }}><b>Avarias</b><br />
                                            {record.devolucaoInfo?.Avarias && record.devolucaoInfo.Avarias.length > 0 ? (
                                                processAvariasArray(record.devolucaoInfo.Avarias).map((item, index) => (
                                                    <div key={index}>{item}</div>
                                                ))
                                            ) : (
                                                'Nenhuma avaria registrada'
                                            )}
                                        </Card.Grid>
                                    </Card>
                                </div>

                            </>
                        )
                    }} bordered />
                </Flex>
            </div>
        </>
    );
};

export default Plano;