import React, { useEffect, useState, useRef } from 'react';
import { Card, Col, Row, Statistic, Progress, Table, Spin, Alert, Divider, Tag } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

/**
 * Dashboard component to display key metrics from the operational plan
 * 
 * @component
 * @param {object} props - Component props
 * @param {string} props.pipeId - The pipeline ID to fetch data for
 * @returns {JSX.Element} The rendered DashboardPlano component
 */
const DashboardPlano = ({ pipeId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataPlano, setDataPlano] = useState([]);
    const [stats, setStats] = useState({
        totalPDVs: 0,
        pendingDelivery: 0,
        delivered: 0,
        returned: 0,
        withDamage: 0,
        totalTerminals: 0,
        totalPowerbanks: 0,
        totalCarregadores: 0,
        totalCapas: 0,
        totalCartoes: 0,
        totalTomadas: 0,
        activePoints: 0,
        inactivePoints: 0
    });
    const [sectorData, setSectorData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [equipmentData, setEquipmentData] = useState([]);
    const [statusHistory, setStatusHistory] = useState([]);
    const [refreshInterval] = useState(120000);
    const refreshTimerRef = useRef(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // Fetch dashboard data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // setLoading(true);

                // Fetch plano operational data
                const responsePlano = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` })
                });

                // Fetch entrega data
                const responseEntrega = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosEntrega` })
                });

                // Fetch devolucao data
                const responseDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosDevolucao` })
                });

                let docs = await responsePlano.json();
                docs = docs.docs;

                let docsEntrega = await responseEntrega.json();
                docsEntrega = docsEntrega.docs;

                let docsDevolucao = await responseDevolucao.json();
                docsDevolucao = docsDevolucao.docs;

                const entregaMap = Object.fromEntries(docsEntrega.map(doc => [doc.id, doc.data]));
                const devolucaoMap = Object.fromEntries(docsDevolucao.map(doc => [doc.id, doc.data]));

                // Process data
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

                    // Determine status
                    const status = data.aberto && !data.devolvido
                        ? 'Entregue'
                        : data.aberto && data.devolvido
                            ? 'Devolvido'
                            : 'Entrega Pendente';

                    // Check for damage/loss
                    const hasDamage = devolucaoData?.Avarias?.length > 0;

                    return {
                        key: doc.id,
                        ID: data.rowNumber,
                        setor: data.SETOR || 'N/A',
                        pontoDeVenda: data['NOME PDV'],
                        categoria: data.CATEGORIA || 'N/A',
                        status: status,
                        perdaAvaria: hasDamage ? 'Sim' : 'Não',
                        modelo: modelo,
                        cartoes: cartoes,
                        totalTerminais: totalTerminais,
                        powerbanks: powerbanks,
                        carregadores: carregadores,
                        capas: capas,
                        tomadas: tomadas,
                        desativado: data.desativado === true,
                        modifications: data.modifications || null,
                        statusModification: data.statusModification || null,
                        entregaInfo: entregaData,
                        devolucaoInfo: devolucaoData,
                        equipamentos: equipments
                    };
                });

                setDataPlano(formattedData);

                // Calculate statistics
                const pendingDelivery = formattedData.filter(item => item.status === 'Entrega Pendente' && !item.desativado).length;
                const delivered = formattedData.filter(item => item.status === 'Entregue' && !item.desativado).length;
                const returned = formattedData.filter(item => item.status === 'Devolvido' && !item.desativado).length;
                const withDamage = formattedData.filter(item => item.perdaAvaria === 'Sim' && !item.desativado).length;
                const activePoints = formattedData.filter(item => !item.desativado).length;
                const inactivePoints = formattedData.filter(item => item.desativado).length;

                const totalTerminals = formattedData.reduce((acc, item) => acc + (item.desativado ? 0 : item.totalTerminais), 0);
                const totalPowerbanks = formattedData.reduce((acc, item) => acc + (item.desativado ? 0 : item.powerbanks), 0);
                const totalCarregadores = formattedData.reduce((acc, item) => acc + (item.desativado ? 0 : item.carregadores), 0);
                const totalCapas = formattedData.reduce((acc, item) => acc + (item.desativado ? 0 : item.capas), 0);
                const totalCartoes = formattedData.reduce((acc, item) => acc + (item.desativado ? 0 : item.cartoes), 0);
                const totalTomadas = formattedData.reduce((acc, item) => acc + (item.desativado ? 0 : item.tomadas), 0);

                // Set statistics
                setStats({
                    totalPDVs: activePoints + inactivePoints,
                    pendingDelivery,
                    delivered,
                    returned,
                    withDamage,
                    totalTerminals,
                    totalPowerbanks,
                    totalCarregadores,
                    totalCapas,
                    totalCartoes,
                    totalTomadas,
                    activePoints,
                    inactivePoints
                });

                // Process sector data for chart
                const sectors = {};
                formattedData.forEach(item => {
                    if (!item.desativado) {
                        if (sectors[item.setor]) {
                            sectors[item.setor]++;
                        } else {
                            sectors[item.setor] = 1;
                        }
                    }
                });

                const sectorChartData = Object.entries(sectors).map(([name, value]) => ({ name, value }));
                setSectorData(sectorChartData);

                // Process category data for chart
                const categories = {};
                formattedData.forEach(item => {
                    if (!item.desativado) {
                        if (categories[item.categoria]) {
                            categories[item.categoria]++;
                        } else {
                            categories[item.categoria] = 1;
                        }
                    }
                });

                const categoryChartData = Object.entries(categories).map(([name, value]) => ({ name, value }));
                setCategoryData(categoryChartData);

                // Process equipment data for chart
                const equipmentChartData = [
                    { name: 'Terminais', value: totalTerminals },
                    { name: 'Powerbanks', value: totalPowerbanks },
                    { name: 'Carregadores', value: totalCarregadores },
                    { name: 'Capas/Suportes', value: totalCapas },
                    { name: 'Cartões', value: totalCartoes },
                    { name: 'Tomadas', value: totalTomadas }
                ];
                setEquipmentData(equipmentChartData);

                // Extract status modification history for trend analysis
                const allStatusChanges = [];
                formattedData.forEach(item => {
                    if (item.statusModification && item.statusModification.length > 0) {
                        item.statusModification.forEach(mod => {
                            allStatusChanges.push({
                                pontoDeVenda: item.pontoDeVenda,
                                oldStatus: mod.oldStatus,
                                newStatus: mod.newStatus,
                                timestamp: mod.timestamp,
                                date: new Date(mod.timestamp).toLocaleDateString(),
                                user: mod.user
                            });
                        });
                    }
                });

                // Sort by timestamp
                allStatusChanges.sort((a, b) => a.timestamp - b.timestamp);
                setStatusHistory(allStatusChanges);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data. Please try again later.');
                setLoading(false);
            }
        };

        if (pipeId) {
            fetchData();

            // Set up the refresh timer
            refreshTimerRef.current = setInterval(() => {
                console.log('Auto-refreshing dashboard data...');
                fetchData();
            }, refreshInterval);
        }

        // Clean up the timer when component unmounts
        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [pipeId, refreshInterval]);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const recentStatusColumns = [
        {
            title: 'Ponto de Venda',
            dataIndex: 'pontoDeVenda',
            key: 'pontoDeVenda',
        },
        {
            title: 'Status Anterior',
            dataIndex: 'oldStatus',
            key: 'oldStatus',
            render: status => {
                let color = 'default';
                if (status === 'Entrega Pendente') color = 'red';
                else if (status === 'Entregue') color = 'blue';
                else if (status === 'Devolvido') color = 'green';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Novo Status',
            dataIndex: 'newStatus',
            key: 'newStatus',
            render: status => {
                let color = 'default';
                if (status === 'Entrega Pendente') color = 'red';
                else if (status === 'Entregue') color = 'blue';
                else if (status === 'Devolvido') color = 'green';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Data',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Técnico',
            dataIndex: 'user',
            key: 'user',
        }
    ];

    const damageColumns = [
        {
            title: 'Ponto de Venda',
            dataIndex: 'pontoDeVenda',
            key: 'pontoDeVenda',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                let color = 'default';
                if (status === 'Entrega Pendente') color = 'red';
                else if (status === 'Entregue') color = 'blue';
                else if (status === 'Devolvido') color = 'green';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Avarias',
            key: 'avarias',
            render: (_, record) => {
                if (!record.devolucaoInfo || !record.devolucaoInfo.Avarias) return 'N/A';

                // Process avarias to show counts by type
                const avariasCount = {};
                record.devolucaoInfo.Avarias.forEach(avaria => {
                    const [equipment, damage] = avaria.split(': ');
                    const key = `${equipment.trim()}: ${damage.trim()}`;
                    avariasCount[key] = (avariasCount[key] || 0) + 1;
                });

                return Object.entries(avariasCount).map(([key, count]) => (
                    <Tag color="red" key={key}>
                        {key} ({count})
                    </Tag>
                ));
            }
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <p style={{ marginTop: '20px' }}>Carregando dados do dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Erro"
                description={error}
                type="error"
                showIcon
                style={{ margin: '20px' }}
            />
        );
    }

    return (
        <div style={{ padding: '24px', width: '100%' }}>
            {/* <p>Visão geral dos pontos de venda e equipamentos para o evento</p> */}

            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <small>Dados atualizados automaticamente a cada 2 minutos</small>
            </div>

            <Divider orientation="left">Métricas Principais</Divider>

            {/* Status Cards */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total de Pontos"
                            value={stats.totalPDVs}
                            suffix={<small style={{ fontSize: '14px' }}>({stats.activePoints} ativos)</small>}
                        />
                        <div style={{ marginTop: '10px' }}>
                            <Progress
                                percent={stats.activePoints ? (stats.activePoints / stats.totalPDVs * 100).toFixed(1) : 0}
                                size="small"
                                status="active"
                            />
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Entregas Pendentes"
                            value={stats.pendingDelivery}
                            valueStyle={{ color: stats.pendingDelivery > 0 ? '#cf1322' : '#3f8600' }}
                        />
                        <div style={{ marginTop: '10px' }}>
                            <Progress
                                percent={stats.activePoints ? (stats.pendingDelivery / stats.activePoints * 100).toFixed(1) : 0}
                                size="small"
                                status={stats.pendingDelivery > 0 ? "exception" : "success"}
                            />
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Pontos Entregues"
                            value={stats.delivered}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ marginTop: '10px' }}>
                            <Progress
                                percent={stats.activePoints ? (stats.delivered / stats.activePoints * 100).toFixed(1) : 0}
                                size="small"
                                status="active"
                            />
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Pontos Devolvidos"
                            value={stats.returned}
                            valueStyle={{ color: '#3f8600' }}
                        />
                        <div style={{ marginTop: '10px' }}>
                            <Progress
                                percent={stats.activePoints ? (stats.returned / stats.activePoints * 100).toFixed(1) : 0}
                                size="small"
                                status="success"
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Equipment Stats */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={4}>
                    <Card>
                        <Statistic title="Terminais" value={stats.totalTerminals} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic title="Powerbanks" value={stats.totalPowerbanks} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic title="Carregadores" value={stats.totalCarregadores} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic title="Capas/Suportes" value={stats.totalCapas} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic title="Cartões" value={stats.totalCartoes} />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card>
                        <Statistic title="Tomadas" value={stats.totalTomadas} />
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Distribuição por Setor e Categoria</Divider>

            {/* Charts Row */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={12}>
                    <Card title="Status de Entrega">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Pendente', value: stats.pendingDelivery },
                                        { name: 'Entregue', value: stats.delivered },
                                        { name: 'Devolvido', value: stats.returned },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'Pendente', value: stats.pendingDelivery },
                                        { name: 'Entregue', value: stats.delivered },
                                        { name: 'Devolvido', value: stats.returned },
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Distribuição por Setor">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={sectorData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {sectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                {/* <Col span={8}>
                    <Card title="Distribuição por Categoria">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={70}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{ paddingTop: 20 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col> */}
            </Row>

            <Divider orientation="left">Equipamentos e Status</Divider>

            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={12}>
                    <Card title="Distribuição de Equipamentos">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={equipmentData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Avarias e Perdas">
                        <Statistic
                            title="Pontos com Avarias"
                            value={stats.withDamage}
                            suffix={`de ${stats.activePoints}`}
                            valueStyle={{ color: stats.withDamage > 0 ? '#cf1322' : '#3f8600' }}
                        />
                        <div style={{ marginTop: '20px' }}>
                            <Progress
                                percent={stats.activePoints ? (stats.withDamage / stats.activePoints * 100).toFixed(1) : 0}
                                status={stats.withDamage > 0 ? "exception" : "success"}
                            />
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <Table
                                columns={damageColumns}
                                dataSource={dataPlano.filter(item => item.perdaAvaria === 'Sim' && !item.desativado)}
                                pagination={{ pageSize: 3 }}
                                scroll={{ x: 500 }}
                                size="small"
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Histórico Recente</Divider>

            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Histórico de Mudanças de Status">
                        <Table
                            columns={recentStatusColumns}
                            dataSource={statusHistory.slice(-10).reverse()}
                            pagination={false}
                            scroll={{ x: 800 }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPlano;