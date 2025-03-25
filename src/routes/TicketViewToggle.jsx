import React, { useState } from 'react';
import { Radio, Card, Button, Space } from 'antd';
import { TableOutlined, AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
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

  const handleViewChange = (e) => {
    const newView = e.target.value;
    setViewType(newView);

    localStorage.setItem('ticketViewPreference', newView);
  };

  React.useEffect(() => {
    const savedViewPreference = localStorage.getItem('ticketViewPreference');
    if (savedViewPreference) {
      setViewType(savedViewPreference);
    }
  }, []);

  return (
    <div>
      <Card
        className="view-toggle-container"
        style={{ marginBottom: '16px' }}
        bodyStyle={{ padding: '12px' }}
      >
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
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

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchChamados}
          >
            Atualizar
          </Button>
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