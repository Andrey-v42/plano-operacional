import React from 'react'
import { Tabs, Card, Row, Col, Statistic } from 'antd'
import DashboardPlano from './components/DashboardPlano'
import DashboardCronometro from './components/DashboardCronometro'
import { useSearchParams } from 'react-router-dom';

const Analytics = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');

    const items = [
        {
            key: '1',
            label: 'Plano Operacional',
            children: (
                <Card>
                    <DashboardPlano pipeId={pipeId} />
                </Card>
            ),
        },
        // {
        //     key: '2',
        //     label: 'Cronometro Setup',
        //     children: (
        //         <Card>
        //             <DashboardCronometro pipeId={pipeId} />
        //         </Card>
        //     ),
        // },
        // {
        //     key: '3',
        //     label: 'Engagement',
        //     children: (
        //         <Card>
        //             <h3>User Engagement</h3>
        //         </Card>
        //     ),
        // },
    ]

    return (
        <div style={{ padding: '24px', width: '100%' }}>
            <Tabs defaultActiveKey="1" items={items} style={{ width: '100%' }} />
        </div>
    )
}

export default Analytics
