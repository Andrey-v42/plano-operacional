/**
 * Plano component handles the operational plan for a specific pipeId.
 * It fetches and displays data related to sales points, equipment, and their statuses.
 * It allows users to perform various operations such as viewing details, adding avarias, 
 * confirming deliveries and returns, and creating new sales points.
 * 
 * @component
 * @returns {JSX.Element} The rendered component.
 * 
 * @example
 * <Plano />
 * 
 * @function
 * @name Plano
 * 
 * @property {object[]} dataPlano - Array of sales point data.
 * @property {function} setDataPlano - Function to update the dataPlano state.
 * @property {string[]} selectedRowKeys - Array of selected row keys in the table.
 * @property {function} setSelectedRowKeys - Function to update the selectedRowKeys state.
 * @property {object[]} selectedRows - Array of selected rows in the table.
 * @property {function} setSelectedRows - Function to update the selectedRows state.
 * @property {boolean} loading - State to indicate if data is being loaded.
 * @property {function} setLoading - Function to update the loading state.
 * @property {boolean} tableLoading - State to indicate if the table data is being loaded.
 * @property {function} setTableLoading - Function to update the tableLoading state.
 * @property {boolean} modalConfirmStatusVisible - State to control the visibility of the status confirmation modal.
 * @property {function} setModalConfirmStatusVisible - Function to update the modalConfirmStatusVisible state.
 * @property {boolean} drawerLoading - State to indicate if the drawer data is being loaded.
 * @property {function} setDrawerLoading - Function to update the drawerLoading state.
 * @property {boolean} drawerVisible - State to control the visibility of the drawer.
 * @property {function} setDrawerVisible - Function to update the drawerVisible state.
 * @property {boolean} drawerMultipleVisible - State to control the visibility of the multiple drawer.
 * @property {function} setDrawerMultipleVisible - Function to update the drawerMultipleVisible state.
 * @property {boolean} drawerMultipleLoading - State to indicate if the multiple drawer data is being loaded.
 * @property {function} setDrawerMultipleLoading - Function to update the drawerMultipleLoading state.
 * @property {object|null} currentRecord - The current record being viewed or edited.
 * @property {function} setCurrentRecord - Function to update the currentRecord state.
 * @property {object[]} filtersSetor - Array of filter options for the "Setor" column.
 * @property {function} setFilterSetor - Function to update the filtersSetor state.
 * @property {object[]} filtersCategoria - Array of filter options for the "Categoria" column.
 * @property {function} setFilterCategoria - Function to update the filtersCategoria state.
 * @property {boolean} confirmStatusButtonLoading - State to indicate if the confirm status button is loading.
 * @property {function} setConfirmStatusButtonLoading - Function to update the confirmStatusButtonLoading state.
 * @property {boolean} editTerminais - State to control the edit mode for terminals.
 * @property {function} setEditTerminais - Function to update the editTerminais state.
 * @property {boolean} editCarregador - State to control the edit mode for chargers.
 * @property {function} setEditCarregador - Function to update the editCarregador state.
 * @property {boolean} editCapa - State to control the edit mode for covers.
 * @property {function} setEditCapa - Function to update the editCapa state.
 * @property {boolean} editCartao - State to control the edit mode for cards.
 * @property {function} setEditCartao - Function to update the editCartao state.
 * @property {boolean} editPowerbank - State to control the edit mode for powerbanks.
 * @property {function} setEditPowerbank - Function to update the editPowerbank state.
 * @property {boolean} editTomada - State to control the edit mode for sockets.
 * @property {function} setEditTomada - Function to update the editTomada state.
 * @property {number} valueTerminal - Value of the terminal being edited.
 * @property {function} setValueTerminal - Function to update the valueTerminal state.
 * @property {number} valueCarregador - Value of the charger being edited.
 * @property {function} setValueCarregador - Function to update the valueCarregador state.
 * @property {number} valueCapa - Value of the cover being edited.
 * @property {function} setValueCapa - Function to update the valueCapa state.
 * @property {number} valueCartao - Value of the card being edited.
 * @property {function} setValueCartao - Function to update the valueCartao state.
 * @property {number} valuePowerbank - Value of the powerbank being edited.
 * @property {function} setValuePowerbank - Function to update the valuePowerbank state.
 * @property {number} valueTomada - Value of the socket being edited.
 * @property {function} setValueTomada - Function to update the valueTomada state.
 * @property {boolean} createPonto - State to control the creation of a new sales point.
 * @property {function} setCreatePonto - Function to update the createPonto state.
 * @property {object} formValues - Values of the form being submitted.
 * @property {function} setFormValues - Function to update the formValues state.
 * @property {object} formAvarias - Values of the avarias form being submitted.
 * @property {function} setFormAvarias - Function to update the formAvarias state.
 * @property {object} formPDV - Values of the PDV form being submitted.
 * @property {function} setFormPDV - Function to update the formPDV state.
 * @property {object[]} avarias - Array of avarias data.
 * @property {function} setAvarias - Function to update the avarias state.
 * @property {string} signature - Base64 string of the signature.
 * @property {function} setSignature - Function to update the signature state.
 * @property {string|null} firstStatus - The first status of the selected rows.
 * @property {function} setFirstStatus - Function to update the firstStatus state.
 * @property {object} formMultipleOp - Values of the multiple operations form being submitted.
 * @property {function} setFormMultipleOp - Function to update the formMultipleOp state.
 * @property {object} styles - Styles object from useStyle hook.
 * @property {object} formMultiple - Form instance for multiple operations.
 * @property {object} api - Notification API instance.
 * @property {object} contextHolder - Notification context holder.
 * @property {string} permission - User permission from localStorage.
 * @property {string} permissionEvento - Event permission from localStorage.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SmileOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Table, Button, Flex, Card, InputNumber, Breadcrumb, notification, Drawer, Form, Input, Checkbox, Collapse, Select, Modal, Space } from 'antd';
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
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false)
    const [modalConfirmStatusVisible, setModalConfirmStatusVisible] = useState(false)
    const [drawerLoading, setDrawerLoading] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerMultipleVisible, setDrawerMultipleVisible] = useState(false)
    const [drawerMultipleLoading, setDrawerMultipleLoading] = useState(false)
    const [currentRecord, setCurrentRecord] = useState(null);
    const [filtersSetor, setFilterSetor] = useState([])
    const [filtersCategoria, setFilterCategoria] = useState([])
    const [confirmStatusButtonLoading, setConfirmStatusButtonLoading] = useState(false)

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

    const [addingEquipment, setAddingEquipment] = useState(false);
    const [newEquipmentType, setNewEquipmentType] = useState(null);
    const [newEquipmentModel, setNewEquipmentModel] = useState(null);
    const [newEquipmentQuantity, setNewEquipmentQuantity] = useState(1);
    const [currentExpandedRecord, setCurrentExpandedRecord] = useState(null);

    const [createPonto, setCreatePonto] = useState(false)

    const [formValues, setFormValues] = useState({});
    const [formAvarias, setFormAvarias] = useState({});
    const [formPDV, setFormPDV] = useState({})
    const [avarias, setAvarias] = useState([])
    const [signature, setSignature] = useState('');
    const [firstStatus, setFirstStatus] = useState(null);
    const [formMultipleOp, setFormMultipleOp] = useState({})
    const [useEntregaData, setUseEntregaData] = useState(false);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const { styles } = useStyle();
    const [formMultiple] = Form.useForm()
    const [api, contextHolder] = notification.useNotification()

    const permission = localStorage.getItem('permission')
    const permissionEvento = localStorage.getItem('permissionEvento')


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
            let docsAssinatura = docs.docs?.map(doc => doc.data.assinatura)
            docs = docs.docs?.map(doc => doc.data.avarias)

            const result = docs.map(array => {
                const [equipamento, tipoAvaria] = array[0].split(": ").map(str => str.trim())
                console.log(docsAssinatura)
                return {
                    equipamento,
                    tipoAvaria,
                    quantidade: array.length,
                    assinatura: docsAssinatura
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

    const closeDrawerMultiple = () => {
        setDrawerMultipleVisible(false);
    }

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

    const columns = [
        {
            title: 'Ponto de Venda',
            dataIndex: 'Ponto de Venda',
            key: 'Ponto de Venda',
            render: (text, record) => <a onClick={() => showDrawer(record)}>{text}</a>,
            onClick: (event) => {
                event.stopPropagation();
            }
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
            render: (status) => {
                let color = '';

                // Assign colors based on status
                if (status === 'Entrega Pendente') {
                    color = '#ffcccb'; // Light red for pending
                } else if (status === 'Entregue') {
                    color = '#add8e6'; // Light green for delivered
                } else if (status === 'Devolvido') {
                    color = '#d4f7d4'; // Light yellow for returned
                }

                return (
                    <span
                        style={{
                            backgroundColor: color,
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '14px'
                        }}
                    >
                        {status}
                    </span>
                );
            }
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

    const columnsMultiple = [
        {
            title: 'Ponto de Venda',
            dataIndex: 'key',
            key: 'PontoDeVenda',
        },
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

    const columnsModifications = [
        {
            title: 'Usuário',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'Horário',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => new Date(timestamp).toLocaleString()
        },
        {
            title: 'Equipamento',
            dataIndex: ['changes', 'field'],
            key: 'field',
        },
        {
            title: 'Valor antigo',
            dataIndex: ['changes', 'oldValue'],
            key: 'oldValue',
        },
        {
            title: 'Novo valor',
            dataIndex: ['changes', 'newValue'],
            key: 'newValue',
        },
    ];

    const columnsStatusModifications = [
        {
            title: 'Usuário',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'Horário',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => new Date(timestamp).toLocaleString()
        },
        {
            title: 'Status Antigo',
            dataIndex: 'oldStatus',
            key: 'oldStatus',
        },
        {
            title: 'Novo Status',
            dataIndex: 'newStatus',
            key: 'newStatus',
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
            render: (assinatura) => <img src={assinatura}
                style={{ width: 150, height: 150 }} />
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
            label: 'Termo de Compartilhamento de Dados',
            children: <>
                <p>
                    O presente termo tem por finalidade registrar o consentimento do cliente para o compartilhamento dos seus dados pessoais acima indicados com a finalidade exclusiva de registro e controle do recebimento de equipamento, garantindo a transparência e segurança do processo.
                </p>
                <p>
                    Os dados fornecidos serão utilizados apenas para:
                    <ul>
                        <li>Registro do recebimento e devolução do equipamento;</li>
                        <li>Contato para esclarecimentos e comunicações referentes ao equipamento;</li>
                        <li>Envio de pesquisa de satisfação referente aos processos da empresa;</li>
                        <li>Cumprimento de obrigações legais e regulatórias.</li>
                    </ul>
                </p>
                <p>
                    Os dados serão armazenados em ambiente seguro e protegidos contra acessos não autorizados, conforme as normas da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                </p>
            </>
        },
        {
            key: '3',
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
            key: '4',
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

                    // Process equipments from new array structure
                    const equipments = data.EQUIPAMENTOS || [];

                    // Initialize counters for each equipment type
                    let totalTerminais = 0;
                    let carregadores = 0;
                    let capas = 0;
                    let cartoes = 0;
                    let powerbanks = 0;
                    let tomadas = 0;
                    let modelo = '';

                    // Process equipment data
                    equipments.forEach(equip => {
                        // Set primary terminal model if available
                        if (equip.TIPO === 'TERMINAL' && !modelo) {
                            modelo = equip.MODELO;
                        }

                        // Accumulate quantities based on equipment type
                        switch (equip.TIPO) {
                            case 'TERMINAL':
                                totalTerminais += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'CARREGADOR':
                                carregadores += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'CAPA':
                            case 'SUPORTE':
                                capas += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'CARTAO':
                            case 'CARTÃO CASHLESS':
                                cartoes += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'POWERBANK':
                                powerbanks += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'TOMADA':
                            case 'PONTO DE TOMADA':
                                tomadas += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            default:
                                break;
                        }
                    });

                    // Fallback to the old structure if EQUIPAMENTOS is not present
                    if (equipments.length === 0) {
                        modelo = data.MODELO || '';
                        totalTerminais = data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? 0 : parseInt(data['TOTAL TERM']) : 0;
                        cartoes = data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? 0 : parseInt(data['CARTÃO CASHLES']) : 0;
                        powerbanks = data['POWER BANK'] ? data['POWER BANK'] == ' ' ? 0 : parseInt(data['POWER BANK']) : 0;
                        carregadores = data.CARREG ? data.CARREG == ' ' ? 0 : parseInt(data.CARREG) : 0;
                        capas = data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? 0 : parseInt(data['CAPA SUPORTE']) : 0;
                        tomadas = data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? 0 : parseInt(data['PONTOS TOMADA']) : 0;
                    }

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
                        modelo: modelo,
                        cartoes: cartoes,
                        totalTerminais: totalTerminais,
                        powerbanks: powerbanks,
                        carregadores: carregadores,
                        capas: capas,
                        tomadas: tomadas,
                        desativado: data.desativado == true ? true : false,
                        modifications: data.modifications ? data.modifications : null,
                        statusModification: data.statusModification ? data.statusModification : null,
                        entregaInfo: entregaData,
                        devolucaoInfo: devolucaoData,
                        // Store original equipment data for display
                        equipamentos: equipments
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
                setTableLoading(false);
            }
        };

        if (pipeId) {
            getPlanoData();
        }
    }, [pipeId]);

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys, newSelectedRows) => {
            if (newSelectedRows.length === 0) {
                setFirstStatus(null);
            } else {
                setFirstStatus(newSelectedRows[0].Status);
            }
            setSelectedRowKeys(newSelectedRowKeys);
            setSelectedRows(newSelectedRows);
        },
        getCheckboxProps: record => ({
            disabled: firstStatus && record.Status !== firstStatus,
        }),
    };

    const editValue = async (type, oldValue) => {
        setLoading(true)
        const array = type.split('_')
        const operation = array[0]
        const id = array[1]
        let value, equipType, modeloToUpdate;

        switch (operation) {
            case 'terminal':
                value = valueTerminal
                equipType = 'TERMINAL'
                break;

            case 'carregador':
                value = valueCarregador
                equipType = 'CARREGADOR'
                break;

            case 'cartao':
                value = valueCartao
                equipType = 'CARTAO'
                break;

            case 'capa':
                value = valueCapa
                equipType = 'CAPA'
                break;

            case 'powerbank':
                value = valuePowerbank
                equipType = 'POWERBANK'
                break;

            case 'tomada':
                value = valueTomada
                equipType = 'TOMADA'
                break;
        }

        try {
            // Get current document data
            const docRef = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional`, docId: id })
            });

            const docData = await docRef.json();

            // Check if the document already has EQUIPAMENTOS array
            if (docData && Array.isArray(docData.EQUIPAMENTOS)) {
                let updatedEquipments = [...docData.EQUIPAMENTOS];
                const existingEquipIndex = updatedEquipments.findIndex(equip => equip.TIPO === equipType);

                if (existingEquipIndex >= 0) {
                    // Update existing equipment
                    updatedEquipments[existingEquipIndex] = {
                        ...updatedEquipments[existingEquipIndex],
                        QUANTIDADE: value
                    };

                    // If quantity is 0, consider removing the item
                    if (value === 0) {
                        updatedEquipments = updatedEquipments.filter((_, index) => index !== existingEquipIndex);
                    }
                } else if (value > 0) {
                    // Add new equipment if quantity > 0
                    let modeloName;
                    switch (equipType) {
                        case 'TERMINAL':
                            modeloName = docData.MODELO || 'Terminal';
                            break;
                        case 'CARREGADOR':
                            modeloName = 'Carregador';
                            break;
                        case 'CAPA':
                            modeloName = 'Capa / Suporte';
                            break;
                        case 'CARTAO':
                            modeloName = 'Cartão Cashless';
                            break;
                        case 'POWERBANK':
                            modeloName = 'Powerbank';
                            break;
                        case 'TOMADA':
                            modeloName = 'Ponto de Tomada';
                            break;
                        default:
                            modeloName = equipType;
                    }

                    updatedEquipments.push({
                        MODELO: modeloName,
                        QUANTIDADE: value,
                        TIPO: equipType
                    });
                }

                // Update with new equipment array
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        docId: `pipeId_${pipeId}/planoOperacional/${id}`,
                        data: { EQUIPAMENTOS: updatedEquipments }
                    })
                });

            } else {
                // For backwards compatibility, update the old way
                let data = {};
                switch (equipType) {
                    case 'TERMINAL':
                        data = { 'TOTAL TERM': value }
                        break;
                    case 'CARREGADOR':
                        data = { 'CARREG': value }
                        break;
                    case 'CARTAO':
                        data = { 'CARTÃO CASHLES': value }
                        break;
                    case 'CAPA':
                        data = { 'CAPA SUPORTE': value }
                        break;
                    case 'POWERBANK':
                        data = { 'POWER BANK': value }
                        break;
                    case 'TOMADA':
                        data = { 'PONTOS TOMADA': value }
                        break;
                }

                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ docId: `pipeId_${pipeId}/planoOperacional/${id}`, data })
                });
            }

            // Record the modification
            const responseModification = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addModificationCard', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/JSON",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem('authToken')).token}`
                },
                body: JSON.stringify({
                    collectionURL: `pipe/pipeId_${pipeId}/planoOperacional`,
                    docId: id,
                    formData: {
                        equipment: equipType,
                        newEquipmentValue: value,
                        oldEquipmentValue: oldValue,
                        currentUser: localStorage.getItem('currentUser')
                    }
                })
            });

            // Refresh data
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

            // Process data with new structure
            const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                const data = doc.data;
                const entregaData = entregaMap[doc.id] || {};
                const devolucaoData = devolucaoMap[doc.id] || {};

                // Process equipments from new array structure
                const equipments = data.EQUIPAMENTOS || [];

                // Initialize counters for each equipment type
                let totalTerminais = 0;
                let carregadores = 0;
                let capas = 0;
                let cartoes = 0;
                let powerbanks = 0;
                let tomadas = 0;
                let modelo = '';

                // Process equipment data
                equipments.forEach(equip => {
                    // Set primary terminal model if available
                    if (equip.TIPO === 'TERMINAL' && !modelo) {
                        modelo = equip.MODELO;
                    }

                    // Accumulate quantities based on equipment type
                    switch (equip.TIPO) {
                        case 'TERMINAL':
                            totalTerminais += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CARREGADOR':
                            carregadores += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CAPA':
                        case 'SUPORTE':
                            capas += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CARTAO':
                        case 'CARTÃO CASHLESS':
                            cartoes += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'POWERBANK':
                            powerbanks += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'TOMADA':
                        case 'PONTO DE TOMADA':
                            tomadas += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        default:
                            break;
                    }
                });

                // Fallback to the old structure if EQUIPAMENTOS is not present
                if (equipments.length === 0) {
                    modelo = data.MODELO || '';
                    totalTerminais = data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? 0 : parseInt(data['TOTAL TERM']) : 0;
                    cartoes = data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? 0 : parseInt(data['CARTÃO CASHLES']) : 0;
                    powerbanks = data['POWER BANK'] ? data['POWER BANK'] == ' ' ? 0 : parseInt(data['POWER BANK']) : 0;
                    carregadores = data.CARREG ? data.CARREG == ' ' ? 0 : parseInt(data.CARREG) : 0;
                    capas = data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? 0 : parseInt(data['CAPA SUPORTE']) : 0;
                    tomadas = data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? 0 : parseInt(data['PONTOS TOMADA']) : 0;
                }

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
                    modelo: modelo,
                    cartoes: cartoes,
                    totalTerminais: totalTerminais,
                    powerbanks: powerbanks,
                    carregadores: carregadores,
                    capas: capas,
                    tomadas: tomadas,
                    desativado: data.desativado == true ? true : false,
                    modifications: data.modifications ? data.modifications : null,
                    statusModification: data.statusModification ? data.statusModification : null,
                    entregaInfo: entregaData,
                    devolucaoInfo: devolucaoData,
                    equipamentos: equipments
                };
            });

            setDataPlano(formattedData);
            openNotificationSucess();
        } catch (error) {
            console.error('Error updating equipment data:', error);
            alert('Erro ao modificar valor!');
        }

        setLoading(false);
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

    const multiplasEntregas = async () => {
        try {
            setDrawerMultipleLoading(true)
            for (const pdv of selectedRows) {
                const completeData = {
                    ...formMultipleOp,
                    TecnicoResponsavel: localStorage.getItem('currentUser'),
                    assinatura: signature,
                    dataHora: new Date().toLocaleString(),
                    // Include both structures for compatibility
                    modelo_terminal: pdv.modelo || 'N/A',
                    qtd_terminal: parseInt(pdv.totalTerminais) || 0,
                    qtd_suporte: parseInt(pdv.capas) || 0,
                    qtd_carreg: parseInt(pdv.carregadores) || 0,
                    qtd_cartao: parseInt(pdv.cartoes) || 0,
                    qtd_powerbank: parseInt(pdv.powerbanks) || 0,
                    qtd_tomada: parseInt(pdv.tomadas) || 0,
                    // Include the full equipment list for the new structure
                    equipamentos: pdv.equipamentos || [],
                    timestamp: new Date().getTime()
                }

                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        formData: completeData,
                        docId: pdv.key,
                        collectionURL: `pipe/pipeId_${pipeId}/protocolosEntrega`
                    })
                })

                if (response.ok) {
                    const responsePlano = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ docId: `pipeId_${pipeId}/planoOperacional/${pdv.key}`, data: { aberto: true } })
                    })
                } else {
                    console.error('Error on sending data to server:', response.status);
                }
            }

            // Refresh data
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

            // Process with new equipment structure
            const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                const data = doc.data;
                const entregaData = entregaMap[doc.id] || {};
                const devolucaoData = devolucaoMap[doc.id] || {};

                // Process equipments from new array structure
                const equipments = data.EQUIPAMENTOS || [];

                // Initialize counters for each equipment type
                let totalTerminais = 0;
                let carregadores = 0;
                let capas = 0;
                let cartoes = 0;
                let powerbanks = 0;
                let tomadas = 0;
                let modelo = '';

                // Process equipment data
                equipments.forEach(equip => {
                    // Set primary terminal model if available
                    if (equip.TIPO === 'TERMINAL' && !modelo) {
                        modelo = equip.MODELO;
                    }

                    // Accumulate quantities based on equipment type
                    switch (equip.TIPO) {
                        case 'TERMINAL':
                            totalTerminais += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CARREGADOR':
                            carregadores += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CAPA':
                        case 'SUPORTE':
                            capas += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CARTAO':
                        case 'CARTÃO CASHLESS':
                            cartoes += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'POWERBANK':
                            powerbanks += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'TOMADA':
                        case 'PONTO DE TOMADA':
                            tomadas += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        default:
                            break;
                    }
                });

                // Fallback to the old structure if EQUIPAMENTOS is not present
                if (equipments.length === 0) {
                    modelo = data.MODELO || '';
                    totalTerminais = data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? 0 : parseInt(data['TOTAL TERM']) : 0;
                    cartoes = data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? 0 : parseInt(data['CARTÃO CASHLES']) : 0;
                    powerbanks = data['POWER BANK'] ? data['POWER BANK'] == ' ' ? 0 : parseInt(data['POWER BANK']) : 0;
                    carregadores = data.CARREG ? data.CARREG == ' ' ? 0 : parseInt(data.CARREG) : 0;
                    capas = data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? 0 : parseInt(data['CAPA SUPORTE']) : 0;
                    tomadas = data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? 0 : parseInt(data['PONTOS TOMADA']) : 0;
                }

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
                    modelo: modelo,
                    cartoes: cartoes,
                    totalTerminais: totalTerminais,
                    powerbanks: powerbanks,
                    carregadores: carregadores,
                    capas: capas,
                    tomadas: tomadas,
                    desativado: data.desativado == true ? true : false,
                    modifications: data.modifications ? data.modifications : null,
                    statusModification: data.statusModification ? data.statusModification : null,
                    entregaInfo: entregaData,
                    devolucaoInfo: devolucaoData,
                    equipamentos: equipments
                };
            });

            setSelectedRowKeys([])
            setSelectedRows([])
            setFirstStatus(null)
            setDataPlano(formattedData)
            openNotificationSucessPDV('entregue')
            setDrawerMultipleVisible(false)
            setDrawerMultipleLoading(false)
            setSelectedRowKeys([])
            setSelectedRows([])
            setFormMultipleOp({})
            formMultiple.resetFields()
            setSignature('')
        } catch (error) {
            console.error(error)
            setDrawerMultipleLoading(false)
            openNotificationFailure('Erro ao realizar múltiplas entregas: ' + error.message)
        }
    }

    const multiplasDevolucoes = async () => {
        try {
            setDrawerMultipleLoading(true)
            for (const pdv of selectedRows) {
                const completeData = {
                    ...formMultipleOp,
                    TecnicoResponsavel: localStorage.getItem('currentUser'),
                    assinatura: signature,
                    dataHora: new Date().toLocaleString(),
                    // Include both structures for compatibility
                    modelo_terminal: pdv.modelo || 'N/A',
                    qtd_terminal: parseInt(pdv.totalTerminais) || 0,
                    qtd_suporte: parseInt(pdv.capas) || 0,
                    qtd_carreg: parseInt(pdv.carregadores) || 0,
                    qtd_cartao: parseInt(pdv.cartoes) || 0,
                    qtd_powerbank: parseInt(pdv.powerbanks) || 0,
                    qtd_tomada: parseInt(pdv.tomadas) || 0,
                    // Include the full equipment list for the new structure
                    equipamentos: pdv.equipamentos || [],
                    timestamp: new Date().getTime()
                }

                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        formData: completeData,
                        docId: pdv.key,
                        collectionURL: `pipe/pipeId_${pipeId}/protocolosDevolucao`
                    })
                })

                if (response.ok) {
                    const responsePlano = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ docId: `pipeId_${pipeId}/planoOperacional/${pdv.key}`, data: { devolvido: true } })
                    })
                } else {
                    console.error('Error on sending data to server:', response.status);
                }
            }

            // Refresh data
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

            // Process with new equipment structure
            const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                const data = doc.data;
                const entregaData = entregaMap[doc.id] || {};
                const devolucaoData = devolucaoMap[doc.id] || {};

                // Process equipments from new array structure
                const equipments = data.EQUIPAMENTOS || [];

                // Initialize counters for each equipment type
                let totalTerminais = 0;
                let carregadores = 0;
                let capas = 0;
                let cartoes = 0;
                let powerbanks = 0;
                let tomadas = 0;
                let modelo = '';

                // Process equipment data
                equipments.forEach(equip => {
                    // Set primary terminal model if available
                    if (equip.TIPO === 'TERMINAL' && !modelo) {
                        modelo = equip.MODELO;
                    }

                    // Accumulate quantities based on equipment type
                    switch (equip.TIPO) {
                        case 'TERMINAL':
                            totalTerminais += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CARREGADOR':
                            carregadores += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CAPA':
                        case 'SUPORTE':
                            capas += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CARTAO':
                        case 'CARTÃO CASHLESS':
                            cartoes += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'POWERBANK':
                            powerbanks += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'TOMADA':
                        case 'PONTO DE TOMADA':
                            tomadas += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        default:
                            break;
                    }
                });

                // Fallback to the old structure if EQUIPAMENTOS is not present
                if (equipments.length === 0) {
                    modelo = data.MODELO || '';
                    totalTerminais = data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? 0 : parseInt(data['TOTAL TERM']) : 0;
                    cartoes = data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? 0 : parseInt(data['CARTÃO CASHLES']) : 0;
                    powerbanks = data['POWER BANK'] ? data['POWER BANK'] == ' ' ? 0 : parseInt(data['POWER BANK']) : 0;
                    carregadores = data.CARREG ? data.CARREG == ' ' ? 0 : parseInt(data.CARREG) : 0;
                    capas = data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? 0 : parseInt(data['CAPA SUPORTE']) : 0;
                    tomadas = data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? 0 : parseInt(data['PONTOS TOMADA']) : 0;
                }

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
                    modelo: modelo,
                    cartoes: cartoes,
                    totalTerminais: totalTerminais,
                    powerbanks: powerbanks,
                    carregadores: carregadores,
                    capas: capas,
                    tomadas: tomadas,
                    desativado: data.desativado == true ? true : false,
                    modifications: data.modifications ? data.modifications : null,
                    statusModification: data.statusModification ? data.statusModification : null,
                    entregaInfo: entregaData,
                    devolucaoInfo: devolucaoData,
                    equipamentos: equipments
                };
            });

            setSelectedRowKeys([])
            setSelectedRows([])
            setFirstStatus(null)
            setDataPlano(formattedData)
            openNotificationSucessPDV('devolvido')
            setDrawerMultipleLoading(false)
            setDrawerMultipleVisible(false)
            setSelectedRowKeys([])
            setSelectedRows([])
            formMultiple.resetFields()
            setFormMultipleOp({})
            setSignature('')
        } catch (error) {
            console.error(error)
            setDrawerMultipleLoading(false)
            openNotificationFailure('Erro ao realizar múltiplas devoluções: ' + error.message)
        }
    }

    const entregarPonto = async (record) => {
        setDrawerLoading(true)
        const currentTimeString = new Date().toLocaleString()
        console.log(formValues)
        try {
            const completeData = {
                ...formValues,
                TecnicoResponsavel: localStorage.getItem('currentUser'),
                assinatura: signature,
                dataHora: currentTimeString,
                // Include both structures for compatibility
                modelo_terminal: record.modelo || 'N/A',
                qtd_terminal: parseInt(record.totalTerminais) || 0,
                qtd_suporte: parseInt(record.capas) || 0,
                qtd_carreg: parseInt(record.carregadores) || 0,
                qtd_cartao: parseInt(record.cartoes) || 0,
                qtd_powerbank: parseInt(record.powerbanks) || 0,
                qtd_tomada: parseInt(record.tomadas) || 0,
                // Include the full equipment list
                equipamentos: record.equipamentos || [],
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
                    // Refresh data
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

                    // Process with new equipment structure
                    const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                        const data = doc.data;
                        const entregaData = entregaMap[doc.id] || {};
                        const devolucaoData = devolucaoMap[doc.id] || {};

                        // Process equipments from new array structure
                        const equipments = data.EQUIPAMENTOS || [];

                        // Initialize counters for each equipment type
                        let totalTerminais = 0;
                        let carregadores = 0;
                        let capas = 0;
                        let cartoes = 0;
                        let powerbanks = 0;
                        let tomadas = 0;
                        let modelo = '';

                        // Process equipment data
                        equipments.forEach(equip => {
                            // Set primary terminal model if available
                            if (equip.TIPO === 'TERMINAL' && !modelo) {
                                modelo = equip.MODELO;
                            }

                            // Accumulate quantities based on equipment type
                            switch (equip.TIPO) {
                                case 'TERMINAL':
                                    totalTerminais += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'CARREGADOR':
                                    carregadores += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'CAPA':
                                case 'SUPORTE':
                                    capas += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'CARTAO':
                                case 'CARTÃO CASHLESS':
                                    cartoes += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'POWERBANK':
                                    powerbanks += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'TOMADA':
                                case 'PONTO DE TOMADA':
                                    tomadas += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                default:
                                    break;
                            }
                        });

                        // Fallback to the old structure if EQUIPAMENTOS is not present
                        if (equipments.length === 0) {
                            modelo = data.MODELO || '';
                            totalTerminais = data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? 0 : parseInt(data['TOTAL TERM']) : 0;
                            cartoes = data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? 0 : parseInt(data['CARTÃO CASHLES']) : 0;
                            powerbanks = data['POWER BANK'] ? data['POWER BANK'] == ' ' ? 0 : parseInt(data['POWER BANK']) : 0;
                            carregadores = data.CARREG ? data.CARREG == ' ' ? 0 : parseInt(data.CARREG) : 0;
                            capas = data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? 0 : parseInt(data['CAPA SUPORTE']) : 0;
                            tomadas = data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? 0 : parseInt(data['PONTOS TOMADA']) : 0;
                        }

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
                            modelo: modelo,
                            cartoes: cartoes,
                            totalTerminais: totalTerminais,
                            powerbanks: powerbanks,
                            carregadores: carregadores,
                            capas: capas,
                            tomadas: tomadas,
                            desativado: data.desativado == true ? true : false,
                            modifications: data.modifications ? data.modifications : null,
                            statusModification: data.statusModification ? data.statusModification : null,
                            entregaInfo: entregaData,
                            devolucaoInfo: devolucaoData,
                            equipamentos: equipments
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
            openNotificationFailure('Erro ao entregar ponto: ' + error.message)
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
                // Include both structures for compatibility
                modelo_terminal: record.modelo || 'N/A',
                qtd_terminal: parseInt(record.totalTerminais) || 0,
                qtd_suporte: parseInt(record.capas) || 0,
                qtd_carreg: parseInt(record.carregadores) || 0,
                qtd_cartao: parseInt(record.cartoes) || 0,
                qtd_powerbank: parseInt(record.powerbanks) || 0,
                qtd_tomada: parseInt(record.tomadas) || 0,
                // Include the full equipment list
                equipamentos: record.equipamentos || [],
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
                    // Refresh data
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

                    // Process with new equipment structure
                    const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                        const data = doc.data;
                        const entregaData = entregaMap[doc.id] || {};
                        const devolucaoData = devolucaoMap[doc.id] || {};

                        // Process equipments from new array structure
                        const equipments = data.EQUIPAMENTOS || [];

                        // Initialize counters for each equipment type
                        let totalTerminais = 0;
                        let carregadores = 0;
                        let capas = 0;
                        let cartoes = 0;
                        let powerbanks = 0;
                        let tomadas = 0;
                        let modelo = '';

                        // Process equipment data
                        equipments.forEach(equip => {
                            // Set primary terminal model if available
                            if (equip.TIPO === 'TERMINAL' && !modelo) {
                                modelo = equip.MODELO;
                            }

                            // Accumulate quantities based on equipment type
                            switch (equip.TIPO) {
                                case 'TERMINAL':
                                    totalTerminais += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'CARREGADOR':
                                    carregadores += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'CAPA':
                                case 'SUPORTE':
                                    capas += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'CARTAO':
                                case 'CARTÃO CASHLESS':
                                    cartoes += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'POWERBANK':
                                    powerbanks += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                case 'TOMADA':
                                case 'PONTO DE TOMADA':
                                    tomadas += parseInt(equip.QUANTIDADE) || 0;
                                    break;
                                default:
                                    break;
                            }
                        });

                        // Fallback to the old structure if EQUIPAMENTOS is not present
                        if (equipments.length === 0) {
                            modelo = data.MODELO || '';
                            totalTerminais = data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? 0 : parseInt(data['TOTAL TERM']) : 0;
                            cartoes = data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? 0 : parseInt(data['CARTÃO CASHLES']) : 0;
                            powerbanks = data['POWER BANK'] ? data['POWER BANK'] == ' ' ? 0 : parseInt(data['POWER BANK']) : 0;
                            carregadores = data.CARREG ? data.CARREG == ' ' ? 0 : parseInt(data.CARREG) : 0;
                            capas = data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? 0 : parseInt(data['CAPA SUPORTE']) : 0;
                            tomadas = data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? 0 : parseInt(data['PONTOS TOMADA']) : 0;
                        }

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
                            modelo: modelo,
                            cartoes: cartoes,
                            totalTerminais: totalTerminais,
                            powerbanks: powerbanks,
                            carregadores: carregadores,
                            capas: capas,
                            tomadas: tomadas,
                            desativado: data.desativado == true ? true : false,
                            modifications: data.modifications ? data.modifications : null,
                            statusModification: data.statusModification ? data.statusModification : null,
                            entregaInfo: entregaData,
                            devolucaoInfo: devolucaoData,
                            equipamentos: equipments
                        };
                    });

                    setDataPlano(formattedData)
                    openNotificationSucessPDV('devolvido')
                    setDrawerLoading(false)
                    setDrawerVisible(false)
                }
            }
        } catch (error) {
            console.error(error);
            setDrawerLoading(false)
            openNotificationFailure('Erro ao devolver ponto: ' + error.message)
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
        if (avarias.length === 0) {
            openNotificationFailure('Adicione pelo menos uma avaria antes de continuar.');
            return;
        }

        if (signature === '') {
            openNotificationFailure('Você precisa preencher a assinatura para continuar.');
            return;
        }

        setDrawerLoading(true);
        const currentTimeString = new Date().toLocaleString();
        const avariasFormatadas = avarias.flatMap(avaria =>
            Array.from({ length: avaria.quantidade }, () => `${avaria.equipamento}: ${avaria.tipoAvaria}`)
        );

        const formattedData = {
            assinatura: signature,
            avarias: avariasFormatadas,
            dataHora: currentTimeString,
            timestamp: new Date().getTime(),
            tecnicoResponsavel: localStorage.getItem('currentUser'),
        };

        try {
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    collectionURL: `pipe/pipeId_${pipeId}/planoOperacional/${record.key}/avarias`,
                    formData: formattedData
                }),
            });

            if (response.ok) {
                // Refresh avarias data
                const avariaResponse = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional/${record.key}/avarias` })
                });

                let avariaData = await avariaResponse.json();
                let docsAssinatura = avariaData.docs?.map(doc => doc.data.assinatura);
                let avariaDocs = avariaData.docs?.map(doc => doc.data.avarias);

                const processedAvarias = avariaDocs.map((array, index) => {
                    const [equipamento, tipoAvaria] = array[0].split(": ").map(str => str.trim());
                    return {
                        equipamento,
                        tipoAvaria,
                        quantidade: array.length,
                        assinatura: docsAssinatura[index]
                    };
                });

                setAvarias(processedAvarias);
                openNotificationSucessAvariasAvulsas();
                setSignature('');
                // Reset form avarias
                setFormAvarias({});
            } else {
                openNotificationFailure('Erro ao salvar avarias: ' + (await response.text()));
            }
        } catch (error) {
            console.error('Error adding avarias:', error);
            openNotificationFailure('Erro ao lançar avarias: ' + error.message);
        } finally {
            setDrawerLoading(false);
        }
    };

    const fetchAndPopulateEntregaData = (checked) => {
        if (!currentRecord || currentRecord.Status !== 'Entregue') return;

        setUseEntregaData(checked);

        if (checked && currentRecord.entregaInfo) {
            // Populate the form with the entrega data
            const entregaData = {
                Cliente: currentRecord.entregaInfo.Cliente || '',
                Telefone: currentRecord.entregaInfo.Telefone || '',
                Email: currentRecord.entregaInfo.Email || '',
                CPF: currentRecord.entregaInfo.CPF || '',
                termoDeResponsabilidade: true
            };

            setFormValues(entregaData);
        } else {
            // Reset the form if unchecked
            setFormValues({});
        }
    };

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

            // Create equipment array for the new structure
            const equipamentos = [];

            // Add terminal if quantity > 0
            if (formPDV.totalTerminais && formPDV.totalTerminais > 0) {
                equipamentos.push({
                    MODELO: formPDV.modelo || 'Terminal',
                    QUANTIDADE: formPDV.totalTerminais,
                    TIPO: 'TERMINAL'
                });
            }

            // Add carregadores if quantity > 0
            if (formPDV.carregadores && formPDV.carregadores > 0) {
                equipamentos.push({
                    MODELO: 'Carregador',
                    QUANTIDADE: formPDV.carregadores,
                    TIPO: 'CARREGADOR'
                });
            }

            // Add capas if quantity > 0
            if (formPDV.capas && formPDV.capas > 0) {
                equipamentos.push({
                    MODELO: 'Capa / Suporte',
                    QUANTIDADE: formPDV.capas,
                    TIPO: 'CAPA'
                });
            }

            // Add cartões if quantity > 0
            if (formPDV.cartoes && formPDV.cartoes > 0) {
                equipamentos.push({
                    MODELO: 'Cartão Cashless',
                    QUANTIDADE: formPDV.cartoes,
                    TIPO: 'CARTAO'
                });
            }

            // Add powerbanks if quantity > 0
            if (formPDV.powerbanks && formPDV.powerbanks > 0) {
                equipamentos.push({
                    MODELO: 'Powerbank',
                    QUANTIDADE: formPDV.powerbanks,
                    TIPO: 'POWERBANK'
                });
            }

            // Add tomadas if quantity > 0
            if (formPDV.tomadas && formPDV.tomadas > 0) {
                equipamentos.push({
                    MODELO: 'Ponto de Tomada',
                    QUANTIDADE: formPDV.tomadas,
                    TIPO: 'TOMADA'
                });
            }

            const pontoData = {
                "NOME PDV": formPDV.nomePonto,
                "SETOR": formPDV.setor,
                "CATEGORIA": formPDV.categoria,
                "COD PLANTA": formPDV.codPlanta,
                "AREA": formPDV.area,
                "MODELO": formPDV.modelo,
                // Include both the old structure fields for backward compatibility
                "TOTAL TERM": formPDV.totalTerminais || 0,
                "CARREG": formPDV.carregadores || 0,
                "CAPA SUPORTE": formPDV.capas || 0,
                "CARTÃO CASHLES": formPDV.cartoes || 0,
                "POWER BANK": formPDV.powerbanks || 0,
                "PONTOS TOMADA": formPDV.tomadas || 0,
                // Add the new equipment structure
                "EQUIPAMENTOS": equipamentos,
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
                // Refresh data
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

                    // Process equipments from new array structure
                    const equipments = data.EQUIPAMENTOS || [];

                    // Initialize counters for each equipment type
                    let totalTerminais = 0;
                    let carregadores = 0;
                    let capas = 0;
                    let cartoes = 0;
                    let powerbanks = 0;
                    let tomadas = 0;
                    let modelo = '';

                    // Process equipment data
                    equipments.forEach(equip => {
                        // Set primary terminal model if available
                        if (equip.TIPO === 'TERMINAL' && !modelo) {
                            modelo = equip.MODELO;
                        }

                        // Accumulate quantities based on equipment type
                        switch (equip.TIPO) {
                            case 'TERMINAL':
                                totalTerminais += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'CARREGADOR':
                                carregadores += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'CAPA':
                            case 'SUPORTE':
                                capas += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'CARTAO':
                            case 'CARTÃO CASHLESS':
                                cartoes += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'POWERBANK':
                                powerbanks += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            case 'TOMADA':
                            case 'PONTO DE TOMADA':
                                tomadas += parseInt(equip.QUANTIDADE) || 0;
                                break;
                            default:
                                break;
                        }
                    });

                    // Fallback to the old structure if EQUIPAMENTOS is not present
                    if (equipments.length === 0) {
                        modelo = data.MODELO || '';
                        totalTerminais = data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? 0 : parseInt(data['TOTAL TERM']) : 0;
                        cartoes = data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? 0 : parseInt(data['CARTÃO CASHLES']) : 0;
                        powerbanks = data['POWER BANK'] ? data['POWER BANK'] == ' ' ? 0 : parseInt(data['POWER BANK']) : 0;
                        carregadores = data.CARREG ? data.CARREG == ' ' ? 0 : parseInt(data.CARREG) : 0;
                        capas = data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? 0 : parseInt(data['CAPA SUPORTE']) : 0;
                        tomadas = data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? 0 : parseInt(data['PONTOS TOMADA']) : 0;
                    }

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
                        modelo: modelo,
                        cartoes: cartoes,
                        totalTerminais: totalTerminais,
                        powerbanks: powerbanks,
                        carregadores: carregadores,
                        capas: capas,
                        tomadas: tomadas,
                        desativado: data.desativado == true ? true : false,
                        modifications: data.modifications ? data.modifications : null,
                        entregaInfo: entregaData,
                        devolucaoInfo: devolucaoData,
                        equipamentos: equipments
                    };
                });

                setDataPlano(formattedData)
                setFormPDV({})
                setCreatePonto(false)
                setDrawerLoading(false)
                openNotificationSucessPDV('criado')
            } else {
                console.error(responseCreate.statusText)
                openNotificationFailure('Erro ao criar ponto de venda')
                setDrawerLoading(false)
            }
        } catch (error) {
            console.error(error)
            openNotificationFailure('Erro ao criar ponto de venda: ' + error.message)
            setDrawerLoading(false)
        }
    }

    const deactivatePDV = async () => {
        try {
            setTableLoading(true)
            for (const key of selectedRowKeys) {
                console.log(key)
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ docId: `pipeId_${pipeId}/planoOperacional/${key}`, data: { desativado: true } })
                })
            }

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
                    desativado: data.desativado == true ? true : false,
                    entregaInfo: { ...entregaData },
                    devolucaoInfo: { ...devolucaoData }
                };
            });

            setDataPlano(formattedData)
            setSelectedRowKeys([])
            setFirstStatus(null)
            setSelectedRows([])
            setTableLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    const reactivatePDV = async () => {
        try {
            setTableLoading(true)
            for (const key of selectedRowKeys) {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ docId: `pipeId_${pipeId}/planoOperacional/${key}`, data: { desativado: false } })
                })
            }

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
                    desativado: data.desativado == true ? true : false,
                    entregaInfo: { ...entregaData },
                    devolucaoInfo: { ...devolucaoData }
                };
            });

            setDataPlano(formattedData)
            setSelectedRowKeys([])
            setFirstStatus(null)
            setSelectedRows([])
            setTableLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    const resetStatus = async () => {
        let status
        if (currentRecord.Status == 'Devolvido') {
            status = 'Entregue'
        } else if (currentRecord.Status == 'Entregue') {
            status = 'Entrega Pendente'
        }

        try {
            if (status == 'Entrega Pendente') {
                const responseEdit = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/modifyStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional`, docId: `${currentRecord.key}`, data: { aberto: false, statusModification: [{ timestamp: new Date().getTime(), user: localStorage.getItem('currentUser'), oldStatus: 'Entregue', newStatus: 'Entrega Pendente' }] } })
                })
            } else {
                const responseEdit = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/modifyStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional`, docId: `${currentRecord.key}`, data: { devolvido: false, statusModification: [{ timestamp: new Date().getTime(), user: localStorage.getItem('currentUser'), oldStatus: 'Devolvido', newStatus: 'Entregue' }] } })
                })
            }

            setConfirmStatusButtonLoading(false)
            setModalConfirmStatusVisible(false)
            closeDrawer()
            openNotificationSucess()
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
                    cartoes: data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? '0' : data['CARTÃO CASHLES'] : 0,
                    totalTerminais: data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? '0' : data['TOTAL TERM'] : 0,
                    powerbanks: data['POWER BANK'] ? data['POWER BANK'] == ' ' ? '0' : data['POWER BANK'] : '0',
                    carregadores: data.CARREG ? data.CARREG == ' ' ? '0' : data.CARREG : '0',
                    capas: data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? '0' : data['CAPA SUPORTE'] : '0',
                    tomadas: data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? '0' : data['PONTOS TOMADA'] : '0',
                    desativado: data.desativado == true ? true : false,
                    entregaInfo: { ...entregaData },
                    devolucaoInfo: { ...devolucaoData }
                };
            });

            setDataPlano(formattedData)
            setTableLoading(false)
        } catch (error) {

        }
    }

    const parseAvariasForTable = (avarias) => {
        if (!avarias || !Array.isArray(avarias) || avarias.length === 0) {
            return [];
        }

        // Group avarias by equipment and type
        const grouped = {};

        avarias.forEach(avaria => {
            const parts = avaria.split(': ');
            if (parts.length < 2) return;

            const equipamento = parts[0].trim();
            const tipoAvaria = parts[1].trim();
            const key = `${equipamento}-${tipoAvaria}`;

            if (!grouped[key]) {
                grouped[key] = {
                    equipamento,
                    tipoAvaria,
                    quantidade: 1,
                    key
                };
            } else {
                grouped[key].quantidade += 1;
            }
        });

        return Object.values(grouped);
    };

    const handleRowClick = (record) => {
        setExpandedRowKeys((prevKeys) =>
            prevKeys.includes(record.key)
                ? prevKeys.filter((key) => key !== record.key)
                : [...prevKeys, record.key]
        );
    };

    const getDefaultModelName = (equipmentType) => {
        switch (equipmentType) {
            case 'TERMINAL':
                return 'Terminal';
            case 'CARREGADOR':
                return 'Carregador';
            case 'CAPA':
                return 'Capa / Suporte';
            case 'SUPORTE':
                return 'Capa / Suporte';
            case 'CARTAO':
            case 'CARTÃO CASHLESS':
                return 'Cartão Cashless';
            case 'POWERBANK':
                return 'Powerbank';
            case 'TOMADA':
            case 'PONTO DE TOMADA':
                return 'Ponto de Tomada';
            default:
                return equipmentType;
        }
    };

    const refreshPlanoData = async () => {
        try {
            setTableLoading(true);

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

            // Process with new equipment structure
            const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
                const data = doc.data;
                const entregaData = entregaMap[doc.id] || {};
                const devolucaoData = devolucaoMap[doc.id] || {};

                // Process equipments from new array structure
                const equipments = data.EQUIPAMENTOS || [];

                // Initialize counters for each equipment type
                let totalTerminais = 0;
                let carregadores = 0;
                let capas = 0;
                let cartoes = 0;
                let powerbanks = 0;
                let tomadas = 0;
                let modelo = '';

                // Process equipment data
                equipments.forEach(equip => {
                    // Set primary terminal model if available
                    if (equip.TIPO === 'TERMINAL' && !modelo) {
                        modelo = equip.MODELO;
                    }

                    // Accumulate quantities based on equipment type
                    switch (equip.TIPO) {
                        case 'TERMINAL':
                            totalTerminais += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CARREGADOR':
                            carregadores += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CAPA':
                        case 'SUPORTE':
                            capas += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'CARTAO':
                        case 'CARTÃO CASHLESS':
                            cartoes += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'POWERBANK':
                            powerbanks += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        case 'TOMADA':
                        case 'PONTO DE TOMADA':
                            tomadas += parseInt(equip.QUANTIDADE) || 0;
                            break;
                        default:
                            break;
                    }
                });

                // Fallback to the old structure if EQUIPAMENTOS is not present
                if (equipments.length === 0) {
                    modelo = data.MODELO || '';
                    totalTerminais = data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? 0 : parseInt(data['TOTAL TERM']) : 0;
                    cartoes = data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? 0 : parseInt(data['CARTÃO CASHLES']) : 0;
                    powerbanks = data['POWER BANK'] ? data['POWER BANK'] == ' ' ? 0 : parseInt(data['POWER BANK']) : 0;
                    carregadores = data.CARREG ? data.CARREG == ' ' ? 0 : parseInt(data.CARREG) : 0;
                    capas = data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? 0 : parseInt(data['CAPA SUPORTE']) : 0;
                    tomadas = data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? 0 : parseInt(data['PONTOS TOMADA']) : 0;
                }

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
                    modelo: modelo,
                    cartoes: cartoes,
                    totalTerminais: totalTerminais,
                    powerbanks: powerbanks,
                    carregadores: carregadores,
                    capas: capas,
                    tomadas: tomadas,
                    desativado: data.desativado == true ? true : false,
                    modifications: data.modifications ? data.modifications : null,
                    statusModification: data.statusModification ? data.statusModification : null,
                    entregaInfo: entregaData,
                    devolucaoInfo: devolucaoData,
                    equipamentos: equipments
                };
            });

            setDataPlano(formattedData);
            setTableLoading(false);
        } catch (error) {
            console.error('Error refreshing data:', error);
            setTableLoading(false);
        }
    };

    const addNewEquipment = async (record) => {
        setAddingEquipment(false);

        if (!newEquipmentType || newEquipmentQuantity <= 0) {
            openNotificationFailure('Por favor, preencha todos os campos corretamente.');
            return;
        }

        setLoading(true);

        try {
            // Get current document data
            const docRef = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `pipe/pipeId_${pipeId}/planoOperacional`,
                    docId: record.key
                })
            });

            const docData = await docRef.json();

            // Prepare new equipment entry
            const newEquipmentEntry = {
                TIPO: newEquipmentType,
                MODELO: newEquipmentModel || getDefaultModelName(newEquipmentType),
                QUANTIDADE: newEquipmentQuantity
            };

            // Add to existing equipment array or create a new one
            let updatedEquipments = [];
            if (docData && Array.isArray(docData.EQUIPAMENTOS)) {
                updatedEquipments = [...docData.EQUIPAMENTOS];

                // Check if this equipment type already exists
                const existingIndex = updatedEquipments.findIndex(equip =>
                    equip.TIPO === newEquipmentType && equip.MODELO === newEquipmentEntry.MODELO
                );

                if (existingIndex >= 0) {
                    // Update quantity of existing equipment
                    updatedEquipments[existingIndex].QUANTIDADE =
                        parseInt(updatedEquipments[existingIndex].QUANTIDADE) + parseInt(newEquipmentQuantity);
                } else {
                    // Add new equipment
                    updatedEquipments.push(newEquipmentEntry);
                }
            } else {
                // Create new equipment array with the new entry
                updatedEquipments = [newEquipmentEntry];
            }

            // Update the document with new equipment array
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    docId: `pipeId_${pipeId}/planoOperacional/${record.key}`,
                    data: { EQUIPAMENTOS: updatedEquipments }
                })
            });

            // Record the modification
            await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addModificationCard', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/JSON",
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem('authToken')).token}`
                },
                body: JSON.stringify({
                    collectionURL: `pipe/pipeId_${pipeId}/planoOperacional`,
                    docId: record.key,
                    formData: {
                        equipment: newEquipmentType,
                        newEquipmentValue: newEquipmentQuantity,
                        oldEquipmentValue: 0,
                        currentUser: localStorage.getItem('currentUser')
                    }
                })
            });

            // Refresh data to update the UI
            await refreshPlanoData();
            openNotificationSucess();

            // Reset form fields
            setNewEquipmentType(null);
            setNewEquipmentModel(null);
            setNewEquipmentQuantity(1);

        } catch (error) {
            console.error('Error adding new equipment:', error);
            openNotificationFailure('Erro ao adicionar equipamento: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getEquipmentTypeOptions = () => {
        return [
            { value: 'TERMINAL', label: 'Terminal' },
            { value: 'CARREGADOR', label: 'Carregador' },
            { value: 'CAPA', label: 'Capa / Suporte' },
            { value: 'SUPORTE', label: 'Suporte' },
            { value: 'CARTAO', label: 'Cartão Cashless' },
            { value: 'POWERBANK', label: 'Powerbank' },
            { value: 'TOMADA', label: 'Ponto de Tomada' },
        ];
    };

    const getPosModelOptions = () => {
        return [
            { value: 'Pag A930', label: 'Pag A930' },
            { value: 'Pag P2', label: 'Pag P2' },
            { value: 'Pag Moderninha X', label: 'Pag Moderninha X' },
            { value: 'Safra P2', label: 'Safra P2' },
            { value: 'Safra L300', label: 'Safra L300' },
            { value: 'GetNet P2', label: 'GetNet P2' },
            { value: 'Pinbank P2', label: 'Pinbank P2' },
            { value: 'Mercado Pago A910', label: 'Mercado Pago A910' },
            { value: 'Cielo L300', label: 'Cielo L300' },
            { value: 'Rede L400', label: 'Rede L400' },
            { value: 'Celular', label: 'Celular' },
            { value: 'Tablet', label: 'Tablet' },
        ];
    };



    const hasSelected = selectedRowKeys.length > 0;

    return (
        <>
            {contextHolder}
            {/* Drawer Detalhes do PDV */}
            <Drawer
                open={drawerVisible}
                onClose={closeDrawer}
                title="Protocolo de Equipamentos"
                loading={drawerLoading}
            >

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
                                    onValuesChange={(changedValues, allValues) => {
                                        if (!useEntregaData) {
                                            setFormValues({ ...formValues, ...allValues });
                                        } else {
                                            setFormValues({ ...allValues });
                                        }
                                    }}
                                    fields={[
                                        { name: ['Cliente'], value: formValues.Cliente },
                                        { name: ['Telefone'], value: formValues.Telefone },
                                        { name: ['Email'], value: formValues.Email },
                                        { name: ['CPF'], value: formValues.CPF },
                                        { name: ['termoDeResponsabilidade'], value: formValues.termoDeResponsabilidade }
                                    ]}>
                                    {currentRecord.Status === 'Entregue' && (
                                        <Form.Item style={{ marginBottom: '20px' }}>
                                            <Checkbox
                                                checked={useEntregaData}
                                                onChange={(e) => fetchAndPopulateEntregaData(e.target.checked)}
                                            >
                                                Usar dados do parceiro da entrega
                                            </Checkbox>
                                        </Form.Item>
                                    )}
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
                                </Form>
                            </>
                        }
                        {(permission == 'planner' || permission == 'admin' || permissionEvento == 'A&B Supervisores') && currentRecord.Status != 'Entrega Pendente' ? <Button style={{ marginTop: '2vh' }} onClick={setModalConfirmStatusVisible} type='primary'>Voltar status de entrega</Button> : null}
                    </>
                )}

            </Drawer>

            {/* Drawer Múltiplas Assinaturas*/}
            <Drawer open={drawerMultipleVisible}
                onClose={closeDrawerMultiple}
                title="Múltiplas Assinaturas"
                loading={drawerMultipleLoading} >

                <h2>PDVs & Equipamentos</h2>
                <Table columns={columnsMultiple} dataSource={selectedRows} scroll={{ x: "max-content" }} style={{ marginBottom: '2vh' }} pagination={false} />

                {selectedRows.length > 0 ? selectedRows[0].Status != 'Devolvido' ? (
                    <>
                        <Collapse style={{ marginBottom: '2vh' }} items={itemsCollapse} />

                        <Form layout='vertical' form={formMultiple}
                            onValuesChange={(changedValues, allValues) => setFormMultipleOp(allValues)}>
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
                            <Form.Item label='Assinatura do Parceiro' name='assinatura'>
                                <Canvas onDrawingComplete={(base64) => setSignature(base64)} />
                            </Form.Item>

                            {selectedRows.length > 0 ? selectedRows[0].Status != 'Devolvido' ? selectedRows[0].Status == 'Entrega Pendente' ? <Button onClick={multiplasEntregas} type='primary'>Confirmar Entrega</Button> : <Button onClick={multiplasDevolucoes} type='primary'>Confirmar Devolução</Button> : null : null}
                        </Form>
                    </>
                ) : null : null}
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

            <Modal open={modalConfirmStatusVisible} title='Atenção' footer={(_, { OkBtn, CancelBtn }) => (
                <>
                    <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={() => setModalConfirmStatusVisible(false)} >Cancelar</Button>
                    <Button type='primary' onClick={() => { resetStatus(); setConfirmStatusButtonLoading(true) }} loading={confirmStatusButtonLoading}>Confirmar</Button>
                </>
            )}>
                Deseja confirmar a alteração do status de entrega? Atenção: Esta ação não apaga o protocolo de equipamentos!
            </Modal>

            <div style={{ backgroundColor: "#FFFD", width: '100%', margin: '0 auto auto auto', padding: '15px' }}>
                <Flex gap="middle" vertical style={{ marginTop: "2vh" }}>
                    <Flex>
                        <Breadcrumb items={[{ title: 'Field Zigger' }, { title: 'Plano Operacional' }]} />
                    </Flex>

                    <Flex align="center" gap="middle" style={{ overflowX: 'auto', boxShadow: 'inset -10px 0 10px -5px rgba(0, 0, 0, 0.15)' }}>
                        <Button type='primary' onClick={setCreatePonto}>Criar novo ponto de venda</Button>

                        <Button type="primary" onClick={setDrawerMultipleVisible} disabled={!hasSelected} loading={loading}>
                            Múltiplas assinaturas
                        </Button>

                        <Button type='primary' onClick={deactivatePDV} disabled={!hasSelected} loading={loading}>Desativar pontos de venda</Button>

                        <Button type='primary' onClick={reactivatePDV} disabled={!hasSelected} loading={loading}>Reativar pontos de venda</Button>

                        {hasSelected ? `${selectedRowKeys.length} itens selecionados` : null}
                    </Flex>

                    <Table style={{ width: "100%" }} loading={tableLoading} rowSelection={rowSelection} columns={columns} dataSource={dataPlano} scroll={{ x: "max-content" }} rowClassName={((record) => record.desativado == true ? "deactivated-row" : "")} expandable={{
                        expandedRowRender: (record) => {
                            // Set current expanded record when row is expanded
                            if (!currentExpandedRecord || currentExpandedRecord.key !== record.key) {
                                setCurrentExpandedRecord(record);
                                setAddingEquipment(false);
                                setNewEquipmentType(null);
                                setNewEquipmentModel(null);
                                setNewEquipmentQuantity(1);
                            }

                            return (
                                <>
                                    <div className='info-pdv'>
                                        <Card loading={false} key={record.key} title='Equipamentos' style={{ width: '100%', textAlign: 'center', fontSize: 'x-small' }} >
                                            {/* Display primary equipment values */}
                                            <Card.Grid style={gridStyle}>
                                                Terminal
                                                <br />
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
                                                                        await editValue('terminal_' + record.key, record.totalTerminais)
                                                                        setEditTerminais(false)
                                                                    }} >
                                                                    Ok
                                                                </Button>
                                                            </Flex>
                                                        )
                                                }
                                            </Card.Grid>
                                            <Card.Grid style={gridStyle}>
                                                Carregadores
                                                <br />
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
                                                                        await editValue('carregador_' + record.key, record.carregadores)
                                                                        setEditCarregador(false)
                                                                    }} >
                                                                    Ok
                                                                </Button>
                                                            </Flex>
                                                        )
                                                }
                                            </Card.Grid>
                                            <Card.Grid style={gridStyle}>
                                                Capas / Suportes
                                                <br />
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
                                                                        await editValue('capa_' + record.key, record.capas)
                                                                        setEditCapa(false)
                                                                    }} >
                                                                    Ok
                                                                </Button>
                                                            </Flex>
                                                        )
                                                }
                                            </Card.Grid>
                                            <Card.Grid style={gridStyle}>
                                                Cartões Cashless
                                                <br />
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
                                                                        await editValue('cartao_' + record.key, record.cartoes)
                                                                        setEditCartao(false)
                                                                    }} >
                                                                    Ok
                                                                </Button>
                                                            </Flex>
                                                        )
                                                }
                                            </Card.Grid>
                                            <Card.Grid style={gridStyle}>
                                                Power Banks
                                                <br />
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
                                                                        await editValue('powerbank_' + record.key, record.powerbanks)
                                                                        setEditPowerbank(false)
                                                                    }} >
                                                                    Ok
                                                                </Button>
                                                            </Flex>
                                                        )
                                                }
                                            </Card.Grid>
                                            <Card.Grid style={gridStyle}>
                                                Pontos de Tomada
                                                <br />
                                                {
                                                    !editTomada ?
                                                        <a
                                                            onClick={() => {
                                                                setValueTomada(record.tomadas)
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
                                                                        await editValue('tomada_' + record.key, record.tomadas)
                                                                        setEditTomada(false)
                                                                    }} >
                                                                    Ok
                                                                </Button>
                                                            </Flex>
                                                        )
                                                }
                                            </Card.Grid>

                                            {/* NEW: Add Equipment card */}
                                            <Card.Grid
                                                style={{
                                                    ...gridStyle,
                                                    backgroundColor: '#f8f8f8',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                                onClick={() => setAddingEquipment(!addingEquipment)}
                                            >
                                                {!addingEquipment ? (
                                                    <>
                                                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>+</span>
                                                        <span>Adicionar<br />Equipamento</span>
                                                    </>
                                                ) : (
                                                    <Flex vertical style={{ width: '100%' }}>
                                                        <Select
                                                            placeholder="Tipo de Equipamento"
                                                            style={{ width: '100%', marginBottom: '8px' }}
                                                            options={getEquipmentTypeOptions()}
                                                            onChange={(value) => {
                                                                setNewEquipmentType(value);
                                                                // Reset model when type changes
                                                                setNewEquipmentModel(null);
                                                            }}
                                                        />

                                                        {newEquipmentType === 'TERMINAL' && (
                                                            <Select
                                                                placeholder="Modelo do Terminal"
                                                                style={{ width: '100%', marginBottom: '8px' }}
                                                                options={getPosModelOptions()}
                                                                onChange={(value) => setNewEquipmentModel(value)}
                                                            />
                                                        )}

                                                        <InputNumber
                                                            placeholder="Quantidade"
                                                            style={{ width: '100%', marginBottom: '8px' }}
                                                            min={1}
                                                            defaultValue={1}
                                                            onChange={(value) => setNewEquipmentQuantity(value)}
                                                        />

                                                        <Flex justify="space-between">
                                                            <Button
                                                                size="small"
                                                                onClick={() => setAddingEquipment(false)}
                                                            >
                                                                Cancelar
                                                            </Button>
                                                            <Button
                                                                type="primary"
                                                                size="small"
                                                                onClick={() => addNewEquipment(record)}
                                                                loading={loading}
                                                            >
                                                                Confirmar
                                                            </Button>
                                                        </Flex>
                                                    </Flex>
                                                )}
                                            </Card.Grid>
                                        </Card>
                                    </div>

                                    {/* Display detailed equipment list if available */}
                                    {record.equipamentos && record.equipamentos.length > 0 && (
                                        <div className='info-pdv'>
                                            <Card loading={false} key={record.key + '_detailed'} title='Detalhamento de Equipamentos' style={{ width: '100%', textAlign: 'center', fontSize: 'x-small' }} >
                                                <Table
                                                    pagination={false}
                                                    columns={[
                                                        {
                                                            title: 'Tipo',
                                                            dataIndex: 'TIPO',
                                                            key: 'tipo'
                                                        },
                                                        {
                                                            title: 'Modelo',
                                                            dataIndex: 'MODELO',
                                                            key: 'modelo'
                                                        },
                                                        {
                                                            title: 'Quantidade',
                                                            dataIndex: 'QUANTIDADE',
                                                            key: 'quantidade'
                                                        }
                                                    ]}
                                                    dataSource={record.equipamentos.map((item, index) => ({
                                                        ...item,
                                                        key: index
                                                    }))}
                                                    scroll={{ x: "max-content" }}
                                                />
                                            </Card>
                                        </div>
                                    )}

                                    {/* Rest of the expanded row content remains the same */}
                                    {record.modifications && (
                                        <div className='info-pdv'>
                                            <Card loading={false} key={record.key + '_modifications'} title='Histórico de Modificação' style={{ width: '100%', textAlign: 'center', fontSize: 'x-small' }} >
                                                <Table pagination={false} columns={columnsModifications} dataSource={record.modifications} scroll={{ x: "max-content" }} />
                                            </Card>
                                        </div>
                                    )}

                                    {record.statusModification && (
                                        <div className='info-pdv'>
                                            <Card loading={false} key={record.key + '_statusModification'} title='Histórico de Modificação de Status de Entrega' style={{ width: '100%', textAlign: 'center', fontSize: 'x-small' }} >
                                                <Table pagination={false} columns={columnsStatusModifications} dataSource={record.statusModification} scroll={{ x: "max-content" }} />
                                            </Card>
                                        </div>
                                    )}

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
                                            <Card.Grid style={{ width: '100%', padding: '12px' }}>
                                                <div style={{ fontSize: 'small', marginBottom: '8px' }}><b>Avarias</b></div>
                                                {record.devolucaoInfo?.Avarias && record.devolucaoInfo.Avarias.length > 0 ? (
                                                    <Table
                                                        dataSource={parseAvariasForTable(record.devolucaoInfo.Avarias)}
                                                        columns={[
                                                            {
                                                                title: 'Equipamento',
                                                                dataIndex: 'equipamento',
                                                                key: 'equipamento',
                                                            },
                                                            {
                                                                title: 'Tipo da Avaria',
                                                                dataIndex: 'tipoAvaria',
                                                                key: 'tipoAvaria',
                                                            },
                                                            {
                                                                title: 'Quantidade',
                                                                dataIndex: 'quantidade',
                                                                key: 'quantidade',
                                                            }
                                                        ]}
                                                        pagination={false}
                                                        size="small"
                                                        bordered
                                                    />
                                                ) : (
                                                    'Nenhuma avaria registrada'
                                                )}
                                            </Card.Grid>
                                        </Card>
                                    </div>
                                </>
                            );
                        },
                        expandedRowKeys: expandedRowKeys,
                        onExpand: (expanded, record) => {
                            setExpandedRowKeys(
                                expanded
                                    ? [...expandedRowKeys, record.key]
                                    : expandedRowKeys.filter((key) => key !== record.key)
                            );
                        },
                    }} onRow={(record) => ({
                        // onClick: () => handleRowClick(record),
                    })}
                        bordered />
                </Flex>
            </div>
        </>
    );
};

export default Plano;