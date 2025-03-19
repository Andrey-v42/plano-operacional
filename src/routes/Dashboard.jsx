import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, DatePicker, Select, Typography, Table, Tag, Divider, Badge, Avatar, Tooltip as TooltipAntd } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { CommentOutlined, ClockCircleOutlined, CheckCircleOutlined, MessageOutlined, UserOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = ({ dataChamados, pipeId }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [filteredData, setFilteredData] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [ticketsWithChats, setTicketsWithChats] = useState(new Set());
  const [chatMetrics, setChatMetrics] = useState({
    totalChats: 0,
    activeChats: 0,
    avgMessagesPerChat: 0,
    responseRatePercent: 0,
    avgFirstResponseTime: 0 // New metric for first response time
  });
  const [chatData, setChatData] = useState([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [topSupportUsers, setTopSupportUsers] = useState([]); // New state for top support users
  const [topTicketCreators, setTopTicketCreators] = useState([]); // New state for top ticket creators
  const [topPDVsWithOpenTickets, setTopPDVsWithOpenTickets] = useState([]); // New state for top PDVs
  const [topSetoresWithOpenTickets, setTopSetoresWithOpenTickets] = useState([]); // New state for top PDVs

  useEffect(() => {
    // Initialize with all data
    if (dataChamados) {
      filterData(dataChamados, dateRange, categoryFilter, urgencyFilter);
      fetchChatData();
      calculateTopUsers(dataChamados);
      calculateTopPDVs(dataChamados);
    }
  }, [dataChamados]);

  // New function to calculate top users and ticket creators
  const calculateTopUsers = (data) => {
    // Calculate top support users (who answered most tickets)
    const supportUserCounts = {};
    const ticketCreatorCounts = {};

    data.forEach(ticket => {
      // Count ticket creators
      if (ticket.solicitante) {
        ticketCreatorCounts[ticket.solicitante] = (ticketCreatorCounts[ticket.solicitante] || 0) + 1;
      }

      // Count support users who have responded to tickets
      if (ticket.atendente && ticket.status !== 'pending') {
        supportUserCounts[ticket.atendente] = (supportUserCounts[ticket.atendente] || 0) + 1;
      }
    });

    // Convert to arrays and sort
    const supportUsers = Object.keys(supportUserCounts)
      .map(user => ({ user, count: supportUserCounts[user] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    const ticketCreators = Object.keys(ticketCreatorCounts)
      .map(user => ({ user, count: ticketCreatorCounts[user] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    setTopSupportUsers(supportUsers);
    setTopTicketCreators(ticketCreators);
  };

  // New function to calculate top PDVs with open tickets
  const calculateTopPDVs = (data) => {
    const pdvCounts = {};

    // Count open tickets per PDV
    data.forEach(ticket => {
      if (ticket.ponto) {
        pdvCounts[ticket.ponto] = (pdvCounts[ticket.ponto] || 0) + 1;
      }
    });

    // Convert to array and sort
    const topPDVs = Object.keys(pdvCounts)
      .map(pdv => ({ pdv, count: pdvCounts[pdv] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    setTopPDVsWithOpenTickets(topPDVs);
  };

  const calculateTopSetores = (data) => {
    const setorCounts = {};
    console.log(data)
    // Count pending tickets per setor
    data.forEach(ticket => {
      // Only count tickets with "pending" status
      if (ticket.status === "pending" && ticket.setor) {
        setorCounts[ticket.setor] = (setorCounts[ticket.setor] || 0) + 1;
      }
    });

    // Convert to array and sort
    const topSetores = Object.keys(setorCounts)
      .map(setor => ({ setor, count: setorCounts[setor] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    console.log(topSetores);
    setTopSetoresWithOpenTickets(topSetores);
  };

  const fetchChatData = async () => {
    try {
      setIsLoadingChat(true);

      // For each ticket with chat, fetch chat messages
      const ticketsWithChat = dataChamados.filter(ticket => ticket.id);
      let allChatMessages = [];
      let activeChatCount = 0;
      let ticketsWithChatMessages = 0;
      let firstResponseTimes = []; // New array to track first response times

      for (const ticket of ticketsWithChat) {
        try {
          const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: `pipe/pipeId_${pipeId}/chamados/${ticket.id}/chat`
            })
          });

          const data = await response.json();
          if (data && data.docs && data.docs.length > 0) {
            const ticketChatMessages = data.docs.map(doc => ({
              ticketId: ticket.id,
              messageId: doc.id,
              text: doc.data.text,
              sender: doc.data.sender,
              timestamp: doc.data.timestamp,
              ticketStatus: ticket.status
            }));

            allChatMessages = [...allChatMessages, ...ticketChatMessages];
            ticketsWithChatMessages++;

            // Check if chat is active (has messages in last 24 hours)
            const lastMessageTime = Math.max(...ticketChatMessages.map(msg => msg.timestamp));
            const isActive = (Date.now() - lastMessageTime) < (24 * 60 * 60 * 1000);
            if (isActive) activeChatCount++;

            // Calculate first response time for the ticket
            const sortedMessages = ticketChatMessages.sort((a, b) => a.timestamp - b.timestamp);

            if (sortedMessages.length >= 2) {
              const firstUserMessage = sortedMessages.find(msg => msg.sender === ticket.solicitante);

              if (firstUserMessage) {
                // Find first agent response that came after the user's message
                const firstAgentResponse = sortedMessages.find(msg =>
                  msg.sender !== ticket.solicitante && msg.timestamp > firstUserMessage.timestamp
                );

                if (firstAgentResponse) {
                  const responseTime = (firstAgentResponse.timestamp - firstUserMessage.timestamp) / (1000 * 60); // minutes
                  firstResponseTimes.push(responseTime);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching chat for ticket ${ticket.id}:`, error);
        }
      }

      // Calculate chat metrics
      const avgMessages = ticketsWithChatMessages > 0 ?
        (allChatMessages.length / ticketsWithChatMessages).toFixed(1) : 0;

      // Calculate average first response time
      const avgFirstResponseTime = firstResponseTimes.length > 0 ?
        (firstResponseTimes.reduce((sum, time) => sum + time, 0) / firstResponseTimes.length).toFixed(1) : 0;

      // Track which user messages received responses
      const userMsgIds = new Set();
      const respondedMsgIds = new Set();

      const currentUser = localStorage.getItem('currentUser');
      const permission = localStorage.getItem('permission');
      const permissionEvento = localStorage.getItem('permissionEvento');
      const isAgent = permission === 'admin' || permission === 'ecc' ||
        permissionEvento === 'C-CCO' || permissionEvento === 'Head';

      const conversations = {};
      allChatMessages.forEach(msg => {
        if (!conversations[msg.ticketId]) conversations[msg.ticketId] = [];
        conversations[msg.ticketId].push(msg);
      });

      // For each conversation, track which user messages got responses
      Object.values(conversations).forEach(convo => {
        const sortedMsgs = convo.sort((a, b) => a.timestamp - b.timestamp);

        sortedMsgs.forEach((msg, i) => {
          const isUserMsg = dataChamados.find(t => t.id === msg.ticketId && t.solicitante === msg.sender);

          if (isUserMsg) {
            const msgId = `${msg.ticketId}-${msg.timestamp}`;
            userMsgIds.add(msgId);

            // Check if any subsequent message is an agent response
            for (let j = i + 1; j < sortedMsgs.length; j++) {
              const isAgentResponse = dataChamados.find(t =>
                t.id === sortedMsgs[j].ticketId && t.solicitante !== sortedMsgs[j].sender);

              if (isAgentResponse) {
                respondedMsgIds.add(msgId);
                break;
              }
            }
          }
        });
      });

      const ticketIdsWithChat = new Set(Object.keys(conversations))
      setTicketsWithChats(ticketIdsWithChat);

      const responseRate = userMsgIds.size > 0 ?
        ((respondedMsgIds.size / userMsgIds.size) * 100).toFixed(0) : 0;

      // Prepare chat data for charts
      const chatsByDate = {};
      allChatMessages.forEach(msg => {
        const date = new Date(msg.timestamp).toLocaleDateString();
        chatsByDate[date] = (chatsByDate[date] || 0) + 1;
      });

      const chatVolumeData = Object.keys(chatsByDate).map(date => ({
        date,
        messages: chatsByDate[date]
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      setChatData(chatVolumeData);
      setChatMetrics({
        totalChats: ticketsWithChatMessages,
        activeChats: activeChatCount,
        avgMessagesPerChat: avgMessages,
        responseRatePercent: responseRate,
        avgFirstResponseTime: avgFirstResponseTime // Add new metric
      });
    } catch (error) {
      console.error('Error fetching chat data:', error);
    } finally {
      setIsLoadingChat(false);
    }
  };

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

    // Recalculate top users and PDVs when filters change
    calculateTopUsers(filtered);
    calculateTopPDVs(filtered);
    calculateTopSetores(filtered);
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
    let analysisTimeSum = 0;
    let resolutionTimes = 0;
    let count = 0;
    let analysisCount = 0;
    let resolutionCount = 0;

    filteredData.forEach(item => {
      if (item.timestampAberto && item.timestampAnalise) {
        responseTimes += (item.timestampAnalise - item.timestampAberto);
        count++;
      }

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
    let avgAnalysisTime = 0;
    let avgResolutionTime = 0;

    if (count > 0) {
      avgResponseTime = responseTimes / count / (1000 * 60); // minutes
    }

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
      avgAnalysisTime: avgAnalysisTime.toFixed(1),
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

  // Columns for tables
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
      title: 'Chat',
      dataIndex: 'id',
      key: 'chat',
      render: (id) => {
        const hasChat = ticketsWithChats.has(id)
        return hasChat ? <Badge status="processing" text="Ativo" /> : <Badge status="default" text="Inativo" />;
      }
    },
    {
      title: 'Data',
      dataIndex: 'timestampAberto',
      key: 'timestampAberto',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
  ];

  // Columns for top support users table
  const topSupportColumns = [
    {
      title: 'Atendente',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: '120px', textWrap: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          <TooltipAntd title={user} >{user}</TooltipAntd>
        </div>
      ),
    },
    {
      title: 'Chamados Atendidos',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="blue">{count}</Tag>,
    }
  ];

  // Columns for top ticket creators table
  const topCreatorsColumns = [
    {
      title: 'Usuário',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: '120px', textWrap: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          <TooltipAntd title={user} >{user}</TooltipAntd>
        </div>
      ),
    },
    {
      title: 'Chamados Criados',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="orange">{count}</Tag>,
    }
  ];

  // Columns for top PDVs table
  const topPDVsColumns = [
    {
      title: 'PDV',
      dataIndex: 'pdv',
      key: 'pdv',
      render: (pdv) => (
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: '120px', textWrap: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          <TooltipAntd title={pdv}>
            <ShopOutlined style={{ marginRight: 8 }} />
            {pdv}
          </TooltipAntd>
        </div>
      ),
    },
    {
      title: 'Chamados',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="red">{count}</Tag>,
    }
  ];

  const topSetoresColumns = [
    {
      title: 'Setor',
      dataIndex: 'setor',
      key: 'setor',
      render: (setor) => (
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: '120px', textWrap: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          <TooltipAntd title={setor} >
            <ShopOutlined style={{ marginRight: 8 }} />
            {setor}
          </TooltipAntd>
        </div>
      ),
    },
    {
      title: 'Chamados',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="red">{count}</Tag>,
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f8f8f8' }}>
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

      {/* Chat Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col span={24}>
          <Title level={5}>Métricas de Chat</Title>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Total de Chats"
              value={chatMetrics.totalChats}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Chats Ativos"
              value={chatMetrics.activeChats}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Mensagens por Chat"
              value={chatMetrics.avgMessagesPerChat}
              prefix={<UserOutlined />}
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Taxa de Resposta"
              value={chatMetrics.responseRatePercent}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: parseInt(chatMetrics.responseRatePercent) > 80 ? '#52c41a' :
                  parseInt(chatMetrics.responseRatePercent) > 50 ? '#faad14' : '#ff4d4f'
              }}
            />
          </Card>
        </Col>
        {/* New metric */}
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tempo Médio de 1ª Resposta"
              value={chatMetrics.avgFirstResponseTime}
              suffix="min"
              prefix={<ClockCircleOutlined />}
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Tempo Médio de Resposta"
              value={metrics.avgResponseTime}
              suffix="min"
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
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
        <Col xs={24} sm={8} md={8}>
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

      {/* New section for top support users and ticket creators */}
      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
        <Col span={24}>
          <Title level={5}>Análise de Usuários</Title>
        </Col>
        <Col xs={24} md={6}>
          <Card title="Top 5 Atendentes" extra={<TeamOutlined />}>
            <Table
              dataSource={topSupportUsers}
              columns={topSupportColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="Top 5 Solicitantes" extra={<UserOutlined />}>
            <Table
              dataSource={topTicketCreators}
              columns={topCreatorsColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="Top 5 Setores com Chamados" extra={<ShopOutlined />}>
            <Table
              dataSource={topSetoresWithOpenTickets}
              columns={topSetoresColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="Top 5 PDVs com Chamados" extra={<ShopOutlined />}>
            <Table
              dataSource={topPDVsWithOpenTickets}
              columns={topPDVsColumns}
              pagination={false}
              size="small"
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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

      <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
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
          <Card title="Volume de Mensagens de Chat">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chatData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#8884d8"
                  name="Mensagens"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
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

export default Dashboard;