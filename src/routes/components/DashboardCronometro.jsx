import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Progress, Spin, Alert, Typography, Divider, Space, Table, Tooltip, Badge } from 'antd';
import { ClockCircleOutlined, WarningOutlined, CheckCircleOutlined, SyncOutlined, AlertOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardCronometro = ({ pipeId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState({
    setupMetrics: {
      totalDuration: 0,
      interruptionTime: 0,
      interruptionCount: 0,
      completedStages: 0,
      allStagesCompleted: false,
      stageStatus: [],
      interruptionReasons: [],
      averageStageDuration: 0,
      mostCommonInterruption: '',
      progress: 0
    },
    aditivoMetrics: {
      totalDuration: 0,
      interruptionTime: 0,
      interruptionCount: 0,
      completedStages: 0,
      allStagesCompleted: false,
      stageStatus: [],
      interruptionReasons: [],
      averageStageDuration: 0,
      mostCommonInterruption: '',
      progress: 0,
      hasAditivo: false,
      aditivoCount: 0
    }
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0m';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m ${seconds % 60}s`;
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
  };

  const calculateMetrics = useCallback((data) => {
    if (!data) return;
    
    // Setup metrics
    const setupMetrics = {
      totalDuration: 0,
      interruptionTime: 0,
      interruptionCount: 0,
      completedStages: 0,
      allStagesCompleted: false,
      stageStatus: [],
      interruptionReasons: [],
      averageStageDuration: 0,
      mostCommonInterruption: '',
      progress: 0
    };
    
    // Aditivo metrics
    const aditivoMetrics = {
      totalDuration: 0,
      interruptionTime: 0,
      interruptionCount: 0,
      completedStages: 0,
      allStagesCompleted: false,
      stageStatus: [],
      interruptionReasons: [],
      averageStageDuration: 0,
      mostCommonInterruption: '',
      progress: 0,
      hasAditivo: false,
      aditivoCount: data.setupAditivo ? data.setupAditivo.length : 0
    };

    // Calculate Setup metrics
    if (data.setup) {
      const setup = data.setup;
      const stages = ['primeira_etapa', 'segunda_etapa', 'terceira_etapa', 'quarta_etapa'];
      const stageDurations = [];
      const interruptionReasons = {};
      
      stages.forEach(stage => {
        if (setup[stage]) {
          const stageData = setup[stage];
          const completed = !!stageData.horaFim;
          
          // Add to stage status
          setupMetrics.stageStatus.push({
            stage: stage.replace('_etapa', ''),
            completed,
            started: !!stageData.horaInicio,
            startTime: stageData.horaInicio,
            endTime: stageData.horaFim,
            duration: completed ? stageData.horaFim - stageData.horaInicio : 0
          });
          
          if (completed) {
            setupMetrics.completedStages++;
            
            // Calculate duration excluding interruptions
            let stageDuration = stageData.horaFim - stageData.horaInicio;
            let stageInterruptionTime = 0;
            
            if (stageData.interruptions && stageData.interruptions.length > 0) {
              setupMetrics.interruptionCount += stageData.interruptions.length;
              
              stageData.interruptions.forEach(interruption => {
                if (interruption.horaFim && interruption.horaInicio) {
                  const interruptionDuration = interruption.horaFim - interruption.horaInicio;
                  stageInterruptionTime += interruptionDuration;
                  
                  // Track interruption reasons
                  if (interruption.justificativa) {
                    interruptionReasons[interruption.justificativa] = 
                      (interruptionReasons[interruption.justificativa] || 0) + 1;
                  }
                }
              });
            }
            
            setupMetrics.interruptionTime += stageInterruptionTime;
            stageDuration -= stageInterruptionTime;
            stageDurations.push(stageDuration);
          }
        }
      });
      
      // Calculate total duration and average
      setupMetrics.totalDuration = stageDurations.reduce((sum, duration) => sum + duration, 0);
      setupMetrics.averageStageDuration = stageDurations.length > 0 
        ? setupMetrics.totalDuration / stageDurations.length 
        : 0;
      
      // Find most common interruption
      let maxCount = 0;
      Object.entries(interruptionReasons).forEach(([reason, count]) => {
        if (count > maxCount) {
          maxCount = count;
          setupMetrics.mostCommonInterruption = reason;
        }
        setupMetrics.interruptionReasons.push({ name: reason, value: count });
      });
      
      // Calculate progress
      setupMetrics.progress = (setupMetrics.completedStages / 4) * 100;
      setupMetrics.allStagesCompleted = setupMetrics.completedStages === 4;
    }
    
    // Calculate Aditivo metrics
    if (data.setupAditivo && data.setupAditivo.length > 0) {
      aditivoMetrics.hasAditivo = true;
      
      // Get the most recent aditivo
      const lastAditivo = data.setupAditivo[data.setupAditivo.length - 1];
      const stages = ['primeira_etapa', 'segunda_etapa', 'terceira_etapa', 'quarta_etapa'];
      const stageDurations = [];
      const interruptionReasons = {};
      
      stages.forEach(stage => {
        if (lastAditivo[stage]) {
          const stageData = lastAditivo[stage];
          const completed = !!stageData.horaFim;
          
          // Add to stage status
          aditivoMetrics.stageStatus.push({
            stage: stage.replace('_etapa', ''),
            completed,
            started: !!stageData.horaInicio,
            startTime: stageData.horaInicio,
            endTime: stageData.horaFim,
            duration: completed ? stageData.horaFim - stageData.horaInicio : 0
          });
          
          if (completed) {
            aditivoMetrics.completedStages++;
            
            // Calculate duration excluding interruptions
            let stageDuration = stageData.horaFim - stageData.horaInicio;
            let stageInterruptionTime = 0;
            
            if (stageData.interrupcoes && stageData.interrupcoes.length > 0) {
              aditivoMetrics.interruptionCount += stageData.interrupcoes.length;
              
              stageData.interrupcoes.forEach(interruption => {
                if (interruption.horaFim && interruption.horaInicio) {
                  const interruptionDuration = interruption.horaFim - interruption.horaInicio;
                  stageInterruptionTime += interruptionDuration;
                  
                  // Track interruption reasons
                  if (interruption.justificativa) {
                    interruptionReasons[interruption.justificativa] = 
                      (interruptionReasons[interruption.justificativa] || 0) + 1;
                  }
                }
              });
            }
            
            aditivoMetrics.interruptionTime += stageInterruptionTime;
            stageDuration -= stageInterruptionTime;
            stageDurations.push(stageDuration);
          }
        }
      });
      
      // Calculate total duration and average
      aditivoMetrics.totalDuration = stageDurations.reduce((sum, duration) => sum + duration, 0);
      aditivoMetrics.averageStageDuration = stageDurations.length > 0 
        ? aditivoMetrics.totalDuration / stageDurations.length 
        : 0;
      
      // Find most common interruption
      let maxCount = 0;
      Object.entries(interruptionReasons).forEach(([reason, count]) => {
        if (count > maxCount) {
          maxCount = count;
          aditivoMetrics.mostCommonInterruption = reason;
        }
        aditivoMetrics.interruptionReasons.push({ name: reason, value: count });
      });
      
      // Calculate progress
      aditivoMetrics.progress = (aditivoMetrics.completedStages / 4) * 100;
      aditivoMetrics.allStagesCompleted = aditivoMetrics.completedStages === 4;
    }

    return { setupMetrics, aditivoMetrics };
  }, []);

  const fetchData = useCallback(async () => {
    if (!pipeId) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId: `pipeId_${pipeId}`, url: 'pipe' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setData(data);
      
      const metrics = calculateMetrics(data);
      setMetrics(metrics);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pipeId, calculateMetrics]);

  useEffect(() => {
    fetchData();
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Prepare stage duration data for bar chart
  const setupStageDurations = metrics.setupMetrics.stageStatus.map(stage => ({
    name: stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1),
    duration: stage.duration / 60000, // Convert to minutes
  }));

  const aditivoStageDurations = metrics.aditivoMetrics.stageStatus.map(stage => ({
    name: stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1),
    duration: stage.duration / 60000, // Convert to minutes
  }));

  const statusColumns = [
    {
      title: 'Etapa',
      dataIndex: 'stage',
      key: 'stage',
      render: (text) => {
        const stageName = text.charAt(0).toUpperCase() + text.slice(1);
        return <span>{stageName}</span>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        if (record.completed) {
          return <Badge status="success" text="Finalizada" />;
        } else if (record.started) {
          return <Badge status="processing" text="Em andamento" />;
        } else {
          return <Badge status="default" text="Não iniciada" />;
        }
      }
    },
    {
      title: 'Início',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (timestamp) => timestamp ? formatDateTime(timestamp) : '-'
    },
    {
      title: 'Fim',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (timestamp) => timestamp ? formatDateTime(timestamp) : '-'
    },
    {
      title: 'Duração',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => formatTime(duration)
    }
  ];

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Carregando dados do dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Erro ao carregar dashboard"
        description={`Não foi possível carregar os dados: ${error}`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', width: '75vw' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Dashboard de Processos</Title>
          <Text type="secondary">
            <SyncOutlined spin={loading} /> Última atualização: {formatDateTime(lastUpdated)}
          </Text>
        </div>
        
        {/* Setup Metrics */}
        <Title level={3}>Métricas do Setup</Title>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Progresso Geral"
                value={metrics.setupMetrics.progress}
                precision={0}
                valueStyle={{ color: metrics.setupMetrics.allStagesCompleted ? '#3f8600' : '#1890ff' }}
                prefix={metrics.setupMetrics.allStagesCompleted ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                suffix="%"
              />
              <Progress 
                percent={metrics.setupMetrics.progress} 
                status={metrics.setupMetrics.allStagesCompleted ? "success" : "active"} 
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tempo Total de Processo"
                value={formatTime(metrics.setupMetrics.totalDuration)}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
              />
              <Text type="secondary">Tempo líquido (sem interrupções)</Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tempo em Interrupções"
                value={formatTime(metrics.setupMetrics.interruptionTime)}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
              <Text type="secondary">Total: {metrics.setupMetrics.interruptionCount} interrupções</Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tempo Médio por Etapa"
                value={formatTime(metrics.setupMetrics.averageStageDuration)}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
              />
              <Text type="secondary">Para etapas finalizadas</Text>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Tempo por Etapa" className="chart-card">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={setupStageDurations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip formatter={(value) => [`${value.toFixed(1)} min`, 'Duração']} />
                  <Bar dataKey="duration" fill="#1890ff" name="Duração (min)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="Motivos de Interrupção" className="chart-card">
              {metrics.setupMetrics.interruptionReasons.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.setupMetrics.interruptionReasons}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {metrics.setupMetrics.interruptionReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Text type="secondary">Nenhuma interrupção registrada</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
        
        <Card title="Status das Etapas - Setup">
          <Table 
            dataSource={metrics.setupMetrics.stageStatus}
            columns={statusColumns}
            rowKey="stage"
            pagination={false}
            size="middle"
          />
        </Card>
        
        <Divider />
        
        {/* Aditivo Metrics */}
        <Title level={3}>
          Métricas do Aditivo
          {!metrics.aditivoMetrics.hasAditivo && (
            <Badge 
              count="Não iniciado" 
              style={{ backgroundColor: '#d9d9d9', margin: '0 10px' }}
            />
          )}
        </Title>
        
        {metrics.aditivoMetrics.hasAditivo ? (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Progresso Geral (Aditivo)"
                    value={metrics.aditivoMetrics.progress}
                    precision={0}
                    valueStyle={{ color: metrics.aditivoMetrics.allStagesCompleted ? '#3f8600' : '#1890ff' }}
                    prefix={metrics.aditivoMetrics.allStagesCompleted ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    suffix="%"
                  />
                  <Progress 
                    percent={metrics.aditivoMetrics.progress} 
                    status={metrics.aditivoMetrics.allStagesCompleted ? "success" : "active"} 
                    showInfo={false}
                    style={{ marginTop: 8 }}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tempo Total de Processo"
                    value={formatTime(metrics.aditivoMetrics.totalDuration)}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<ClockCircleOutlined />}
                  />
                  <Text type="secondary">Tempo líquido (sem interrupções)</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tempo em Interrupções"
                    value={formatTime(metrics.aditivoMetrics.interruptionTime)}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<WarningOutlined />}
                  />
                  <Text type="secondary">Total: {metrics.aditivoMetrics.interruptionCount} interrupções</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Número de Aditivos"
                    value={metrics.aditivoMetrics.aditivoCount}
                    valueStyle={{ color: '#eb2f96' }}
                    prefix={<AlertOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Tempo por Etapa (Aditivo)" className="chart-card">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={aditivoStageDurations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip formatter={(value) => [`${value.toFixed(1)} min`, 'Duração']} />
                      <Bar dataKey="duration" fill="#722ed1" name="Duração (min)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Motivos de Interrupção (Aditivo)" className="chart-card">
                  {metrics.aditivoMetrics.interruptionReasons.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={metrics.aditivoMetrics.interruptionReasons}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {metrics.aditivoMetrics.interruptionReasons.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Text type="secondary">Nenhuma interrupção registrada</Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
            
            <Card title="Status das Etapas - Aditivo">
              <Table 
                dataSource={metrics.aditivoMetrics.stageStatus}
                columns={statusColumns}
                rowKey="stage"
                pagination={false}
                size="middle"
              />
            </Card>
          </>
        ) : (
          <Alert
            message="Aditivo não iniciado"
            description="Não há dados de aditivo disponíveis para este processo."
            type="info"
            showIcon
          />
        )}
      </Space>
    </div>
  );
};

export default DashboardCronometro;