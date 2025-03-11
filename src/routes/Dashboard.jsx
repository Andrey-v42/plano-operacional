import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, DatePicker, Select, Typography, Table, Tag, Divider } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = ({ dataChamados }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [filteredData, setFilteredData] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  useEffect(() => {
    // Initialize with all data
    if (dataChamados) {
      filterData(dataChamados, dateRange, categoryFilter, urgencyFilter);
    }
  }, [dataChamados]);

  const filterData = (data, dates, category, urgency) => {
    let filtered = [...data];

    // Apply date filter
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0].valueOf();
      const endDate = dates[1].valueOf();
      filtered = filtered.filter(item => 
        item.timestampAberto >= startDate && item.timestampAberto <= endDate
      );
    }

    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(item => item.categoria === category);
    }

    // Apply urgency filter
    if (urgency !== 'all') {
      filtered = filtered.filter(item => item.urgencia === urgency);
    }

    setFilteredData(filtered);
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
    filterData(dataChamados, dates, categoryFilter, urgencyFilter);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    filterData(dataChamados, dateRange, value, urgencyFilter);
  };

  const handleUrgencyChange = (value) => {
    setUrgencyFilter(value);
    filterData(dataChamados, dateRange, categoryFilter, value);
  };

  // Prepare data for charts
  const prepareStatusData = () => {
    const statusCounts = {
      'pending': 0,
      'analysis': 0,
      'closed': 0
    };

    filteredData.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    return [
      { name: 'Aberto', value: statusCounts.pending, color: '#ff4d4f' },
      { name: 'Em análise', value: statusCounts.analysis, color: '#1890ff' },
      { name: 'Fechado', value: statusCounts.closed, color: '#52c41a' }
    ];
  };

  const prepareUrgencyData = () => {
    const urgencyCounts = {};

    filteredData.forEach(item => {
      urgencyCounts[item.urgencia] = (urgencyCounts[item.urgencia] || 0) + 1;
    });

    return Object.keys(urgencyCounts).map(key => ({
      name: key,
      value: urgencyCounts[key],
      color: key === 'Urgente' ? '#ff4d4f' : '#52c41a'
    }));
  };

  const prepareTrendData = () => {
    // Create a map of dates to ticket counts
    const dateCounts = {};
    
    filteredData.forEach(item => {
      const date = new Date(item.timestampAberto).toLocaleDateString();
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    // Convert to array and sort by date
    return Object.keys(dateCounts)
      .map(date => ({ date, count: dateCounts[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const prepareResolutionTimeData = () => {
    // Calculate average resolution time per day
    const dateResolutionTimes = {};
    const dateCounts = {};
    
    filteredData.forEach(item => {
      if (item.status === 'closed' && item.timestampAberto && item.timestampResposta) {
        const date = new Date(item.timestampAberto).toLocaleDateString();
        const resolutionTime = (item.timestampResposta - item.timestampAberto) / (1000 * 60 * 60); // hours
        
        if (!dateResolutionTimes[date]) {
          dateResolutionTimes[date] = 0;
          dateCounts[date] = 0;
        }
        
        dateResolutionTimes[date] += resolutionTime;
        dateCounts[date]++;
      }
    });
    
    // Calculate averages
    return Object.keys(dateResolutionTimes)
      .map(date => ({
        date,
        hours: dateResolutionTimes[date] / dateCounts[date]
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const prepareCategoryData = () => {
    const categoryCounts = {};
    
    filteredData.forEach(item => {
      categoryCounts[item.categoria] = (categoryCounts[item.categoria] || 0) + 1;
    });
    
    // Convert to array, sort by count, and take top 5
    return Object.keys(categoryCounts)
      .map(category => ({ category, count: categoryCounts[category] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const prepareResponsivenessByUrgency = () => {
    const urgencyResponseTimes = { 'Urgente': [], 'Sem Urgência': [] };
    
    filteredData.forEach(item => {
      if (item.timestampAberto && item.timestampAnalise) {
        const responseTime = (item.timestampAnalise - item.timestampAberto) / (1000 * 60); // minutes
        if (urgencyResponseTimes[item.urgencia]) {
          urgencyResponseTimes[item.urgencia].push(responseTime);
        }
      }
    });
    
    // Calculate averages
    const result = [];
    
    for (const urgency in urgencyResponseTimes) {
      const times = urgencyResponseTimes[urgency];
      if (times.length > 0) {
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        result.push({
          urgency,
          minutes: avgTime
        });
      }
    }
    
    return result;
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    let totalTickets = filteredData.length;
    let openTickets = filteredData.filter(item => item.status === 'pending').length;
    let inProgressTickets = filteredData.filter(item => item.status === 'analysis').length;
    let resolvedTickets = filteredData.filter(item => item.status === 'closed').length;
    
    let responseTimes = 0;
    let analysisTimeSum = 0; // New: Sum of time spent in analysis
    let resolutionTimes = 0;
    let count = 0;
    let analysisCount = 0; // New: Count of tickets with analysis data
    let resolutionCount = 0;
    
    filteredData.forEach(item => {
      if (item.timestampAberto && item.timestampAnalise) {
        responseTimes += (item.timestampAnalise - item.timestampAberto);
        count++;
      }
      
      // New: Calculate analysis time (time from analysis to resolution)
      if (item.timestampAnalise && item.timestampResposta) {
        analysisTimeSum += (item.timestampResposta - item.timestampAnalise);
        analysisCount++;
      }
      
      if (item.timestampAberto && item.timestampResposta) {
        resolutionTimes += (item.timestampResposta - item.timestampAberto);
        resolutionCount++;
      }
    });
    
    let avgResponseTime = 0;
    let avgAnalysisTime = 0; // New
    let avgResolutionTime = 0;
    
    if (count > 0) {
      avgResponseTime = responseTimes / count / (1000 * 60); // minutes
    }
    
    // New: Calculate average analysis time
    if (analysisCount > 0) {
      avgAnalysisTime = analysisTimeSum / analysisCount / (1000 * 60); // minutes
    }
    
    if (resolutionCount > 0) {
      avgResolutionTime = resolutionTimes / resolutionCount / (1000 * 60); // minutes
    }
    
    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      avgResponseTime: avgResponseTime.toFixed(1),
      avgAnalysisTime: avgAnalysisTime.toFixed(1), // New
      avgResolutionTime: avgResolutionTime.toFixed(1)
    };
  };

  const metrics = calculateMetrics();
  const statusData = prepareStatusData();
  const urgencyData = prepareUrgencyData();
  const trendData = prepareTrendData();
  const resolutionTimeData = prepareResolutionTimeData();
  const categoryData = prepareCategoryData();
  const responsivenessData = prepareResponsivenessByUrgency();

  // Prepare categories for filter
  const categoryOptions = dataChamados ? 
    [{ label: 'Todas', value: 'all' }, 
     ...Array.from(new Set(dataChamados.map(item => item.categoria)))
      .map(cat => ({ label: cat, value: cat }))] : 
    [{ label: 'Todas', value: 'all' }];

  // Get recent tickets for the table
  const recentTickets = [...filteredData]
    .sort((a, b) => b.timestampAberto - a.timestampAberto)
    .slice(0, 5);

  const recentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Solicitante',
      dataIndex: 'solicitante',
      key: 'solicitante',
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria',
      key: 'categoria',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = 'Fechado';
        
        if (status === 'pending') {
          color = 'red';
          text = 'Aberto';
        } else if (status === 'analysis') {
          color = 'blue';
          text = 'Em análise';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Urgência',
      dataIndex: 'urgencia',
      key: 'urgencia',
      render: (urgencia) => {
        const color = urgencia === 'Urgente' ? 'red' : 'green';
        return <Tag color={color}>{urgencia}</Tag>;
      },
    },
    {
      title: 'Data',
      dataIndex: 'timestampAberto',
      key: 'timestampAberto',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div style={{ padding: '1rem' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col span={24}>
          <Title level={4}>Painel de Gerenciamento de Chamados</Title>
          <Text type="secondary">Visualize estatísticas e tendências dos chamados de suporte</Text>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col xs={24} md={8}>
          <RangePicker style={{ width: '100%' }} onChange={handleDateChange} />
        </Col>
        <Col xs={24} md={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filtrar por categoria"
            onChange={handleCategoryChange}
            options={categoryOptions}
            defaultValue="all"
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filtrar por urgência"
            onChange={handleUrgencyChange}
            options={[
              { label: 'Todas', value: 'all' },
              { label: 'Urgente', value: 'Urgente' },
              { label: 'Sem Urgência', value: 'Sem Urgência' }
            ]}
            defaultValue="all"
          />
        </Col>
      </Row>
      
      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total de Chamados" value={metrics.totalTickets} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Chamados Abertos" value={metrics.openTickets} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Em Análise" value={metrics.inProgressTickets} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Chamados Resolvidos" value={metrics.resolvedTickets} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Tempo Médio de Resposta" 
              value={metrics.avgResponseTime} 
              suffix="min" 
              precision={1} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Tempo Médio em Análise" 
              value={metrics.avgAnalysisTime} 
              suffix="min" 
              precision={1} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Tempo Médio de Resolução" 
              value={metrics.avgResolutionTime} 
              suffix="min" 
              precision={1} 
            />
          </Card>
        </Col>
      </Row>
      
      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col xs={24} md={12}>
          <Card title="Status dos Chamados">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Distribuição por Urgência">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col span={24}>
          <Card title="Tendência de Chamados">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#1890ff" 
                  name="Número de Chamados" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col xs={24} md={12}>
          <Card title="Top 5 Categorias">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#1890ff" name="Número de Chamados">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Tempo de Resolução por Dia">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resolutionTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#52c41a" name="Tempo Médio (horas)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Tempo de Resposta por Urgência">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responsivenessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="urgency" />
                <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#1890ff" name="Tempo Médio (minutos)">
                  {responsivenessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.urgency === 'Urgente' ? '#ff4d4f' : '#52c41a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Chamados Recentes">
            <Table 
              columns={recentColumns} 
              dataSource={recentTickets}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Create an implementation of the previously referenced function
const prepareResponsivesByUrgency = () => {
  const urgencyResponseTimes = { 'Urgente': [], 'Sem Urgência': [] };
  
  filteredData.forEach(item => {
    if (item.timestampAberto && item.timestampAnalise) {
      const responseTime = (item.timestampAnalise - item.timestampAberto) / (1000 * 60); // minutes
      if (urgencyResponseTimes[item.urgencia]) {
        urgencyResponseTimes[item.urgencia].push(responseTime);
      }
    }
  });
  
  // Calculate averages
  const result = [];
  
  for (const urgency in urgencyResponseTimes) {
    const times = urgencyResponseTimes[urgency];
    if (times.length > 0) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      result.push({
        urgency,
        minutes: avgTime
      });
    }
  }
  
  return result;
};

export default Dashboard;