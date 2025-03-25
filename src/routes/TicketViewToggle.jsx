import React, { useState, useEffect, useRef } from 'react';
import { Radio, Card, Button, Space, Progress, Tooltip, Switch } from 'antd';
import { TableOutlined, AppstoreOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import TaskBoard from './TaskBoard';
import KanbanBoard from './KanbanBoard';

const TicketViewToggle = ({
  dataChamados,
  fetchChamados,
  handleAnswerClick,
  changeStatus,
  reopenTicket,
  handleCreateChatForTicket
}) => {
  const [viewType, setViewType] = useState('table');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef(null);

  const handleViewChange = (e) => {
    const newView = e.target.value;
    setViewType(newView);
    localStorage.setItem('ticketViewPreference', newView);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchChamados();
    setIsRefreshing(false);
    // Reset the countdown if auto-refresh is enabled
    if (autoRefresh) {
      setRefreshCountdown(30);
    }
  };

  const toggleAutoRefresh = (checked) => {
    setAutoRefresh(checked);
    localStorage.setItem('autoRefreshPreference', checked.toString());
    if (checked) {
      setRefreshCountdown(30); // Reset countdown when enabling
    }
  };

  // Load saved preferences
  useEffect(() => {
    const savedViewPreference = localStorage.getItem('ticketViewPreference');
    if (savedViewPreference) {
      setViewType(savedViewPreference);
    }
    
    const savedAutoRefreshPreference = localStorage.getItem('autoRefreshPreference');
    if (savedAutoRefreshPreference) {
      setAutoRefresh(savedAutoRefreshPreference === 'true');
    }
  }, []);

  // Handle auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      // Create new countdown interval
      refreshIntervalRef.current = setInterval(() => {
        setRefreshCountdown(prevCount => {
          if (prevCount <= 1) {
            // When countdown reaches 0, trigger refresh
            handleManualRefresh();
            return 30; // Reset to 30 seconds
          }
          return prevCount - 1;
        });
      }, 1000);
    } else if (refreshIntervalRef.current) {
      // Clear interval if auto-refresh is disabled
      clearInterval(refreshIntervalRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  return (
    <div>
      <Card
        className="view-toggle-container"
        style={{ marginBottom: '16px' }}
        bodyStyle={{ padding: '12px' }}
      >
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Radio.Group
            value={viewType}
            onChange={handleViewChange}
            buttonStyle="solid"
          >
            <Radio.Button value="table">
              <TableOutlined /> Tabela
            </Radio.Button>
            <Radio.Button value="kanban">
              <AppstoreOutlined /> Kanban
            </Radio.Button>
          </Radio.Group>
          
          <Space>
            <Tooltip title={autoRefresh ? `Próxima atualização em ${refreshCountdown}s` : "Atualização automática desativada"}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>Auto:</span>
                <Switch 
                  checked={autoRefresh} 
                  onChange={toggleAutoRefresh}
                  size="small"
                />
                {autoRefresh && (
                  <Progress 
                    type="circle" 
                    percent={Math.round((refreshCountdown / 30) * 100)} 
                    size={24} 
                    format={() => `${refreshCountdown}`}
                    style={{ marginLeft: '8px' }}
                  />
                )}
              </div>
            </Tooltip>
            
            <Button
              type="primary"
              icon={isRefreshing ? <SyncOutlined spin /> : <ReloadOutlined />}
              onClick={handleManualRefresh}
              loading={isRefreshing}
            >
              Atualizar
            </Button>
          </Space>
        </Space>
      </Card>

      {viewType === 'table' ? (
        <TaskBoard
          dataChamados={dataChamados}
          fetchChamados={fetchChamados}
          handleAnswerClick={handleAnswerClick}
          changeStatus={changeStatus}
          reopenTicket={reopenTicket}
          handleCreateChatForTicket={handleCreateChatForTicket}
        />
      ) : (
        <KanbanBoard
          dataChamados={dataChamados}
          fetchChamados={fetchChamados}
          handleAnswerClick={handleAnswerClick}
          changeStatus={changeStatus}
          reopenTicket={reopenTicket}
          handleCreateChatForTicket={handleCreateChatForTicket}
        />
      )}
    </div>
  );
};

export default TicketViewToggle;