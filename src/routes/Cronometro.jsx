import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Flex, Form, Select, Timeline, notification } from 'antd';
import { ExclamationCircleOutlined, SmileOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

const { Group: InputGroup } = Input;
const { Group: ButtonGroup } = Button;

const Cronometro = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const [api, contextHolder] = notification.useNotification()

    const [formValues, setFormValues] = useState({})
    const [primeiraEtapaRunning, setPrimeiraEtapaRunning] = useState(false)
    const [segundaEtapaRunning, setSegundaEtapaRunning] = useState(false)
    const [terceiraEtapaRunning, setTerceiraEtapaRunning] = useState(false)
    const [quartaEtapaRunning, setQuartaEtapaRunning] = useState(false)
    const [firstTimeRunningPrimeira, setFirstTimeRunningPrimeira] = useState(true)
    const [firstTimeRunningSegunda, setFirstTimeRunningSegunda] = useState(true)
    const [firstTimeRunningTerceira, setFirstTimeRunningTerceira] = useState(true)
    const [firstTimeRunningQuarta, setFirstTimeRunningQuarta] = useState(true)
    const [aditivo, setAditivo] = useState(false)
    const [justificativa, setJustificativa] = useState('')
    const [primeiraEtapaFinalizada, setPrimeiraEtapaFinalizada] = useState(false)
    const [segundaEtapaFinalizada, setSegundaEtapaFinalizada] = useState(false)
    const [terceiraEtapaFinalizada, setTerceiraEtapaFinalizada] = useState(false)
    const [quartaEtapaFinalizada, setQuartaEtapaFinalizada] = useState(false)

    const [timelineItems, setTimelineItems] = useState([]);
    const tempoSetupFieldId = '7260494f-cfe6-4aa1-a78a-1baf5f38260c'
    const tempoInterrompidoFieldId = '8d229ae1-08f3-4042-b80f-cdf053c127b5'

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

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const addTimelineEvent = (color, content) => {
        setTimelineItems(prevItems => [...prevItems || [], { color, children: content }]);
    };

    const handleEtapa = (etapa, action) => {
        const now = Date.now();
        let content = '';
        let color = 'blue';

        switch (action) {
            case 'start':
                content = `Etapa ${etapa} iniciada às ${formatTime(now)}`;
                color = 'blue';
                break;
            case 'interrupt':
                content = `Etapa ${etapa} interrompida às ${formatTime(now)}\nJustificativa: ${justificativa}`;
                color = 'red';
                break;
            case 'resume':
                content = `Etapa ${etapa} retomada às ${formatTime(now)}`;
                color = 'blue';
                break;
            case 'finish':
                content = `Etapa ${etapa} finalizada às ${formatTime(now)}`;
                color = 'green';
                break;
            default:
                break;
        }
        addTimelineEvent(color, content);
    };

    const justificativaItems = [
        { value: 'Almoço', label: 'Almoço' },
        { value: 'Falta de terminais', label: 'Falta de terminais' },
    ]

    const iniciarEtapa = async (etapa) => {
        switch (etapa) {
            case 'primeira':
                if (firstTimeRunningPrimeira == true) {
                    setFirstTimeRunningPrimeira(false)
                }
                setPrimeiraEtapaRunning(true)
                break;

            case 'segunda':
                if (firstTimeRunningSegunda == true) {
                    setFirstTimeRunningSegunda(false)
                }
                setSegundaEtapaRunning(true)
                break;

            case 'terceira':
                if (firstTimeRunningTerceira == true) {
                    setFirstTimeRunningTerceira(false)
                }
                setTerceiraEtapaRunning(true)
                break;

            case 'quarta':
                if (firstTimeRunningQuarta == true) {
                    setFirstTimeRunningQuarta(false)
                }
                setQuartaEtapaRunning(true)
                break;
        }

        if (firstTimeRunningPrimeira == true && etapa == 'primeira' || firstTimeRunningSegunda == true && etapa == 'segunda' || firstTimeRunningTerceira == true && etapa == 'terceira' || firstTimeRunningQuarta == true && etapa == 'quarta') {
            try {
                await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/iniciarEtapa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ etapa: etapa, user: localStorage.getItem("currentUser"), pipeId: pipeId, aditivo: aditivo })
                });
                console.log(`Etapa ${etapa} iniciada com sucesso.`);
            } catch (error) {
                console.error("Erro ao iniciar etapa:", error);
            }
            handleEtapa(etapa, 'start')
            openNotificationSucess(`${etapa} etapa iniciada.`)
        } else {
            try {
                await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/retomarEtapa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ etapa: etapa, pipeId: pipeId })
                });
                console.log(`Etapa ${etapa} retomada com sucesso.`);
            } catch (error) {
                console.error("Erro ao iniciar etapa:", error);
            }
            handleEtapa(etapa, 'resume')
            openNotificationSucess(`${etapa} etapa retomada.`)
        }

    }

    const interromperEtapa = async (etapa) => {
        if (justificativa == '') {
            openNotificationFailure('Selecione a justificativa para continuar.')
            return
        }
        switch (etapa) {
            case 'primeira':
                setPrimeiraEtapaRunning(false)
                break;

            case 'segunda':
                setSegundaEtapaRunning(false)
                break;

            case 'terceira':
                setTerceiraEtapaRunning(false)
                break;

            case 'quarta':
                setQuartaEtapaRunning(false)
                break;

        }

        try {
            await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/interromperEtapa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ etapa: etapa, justificativa: justificativa, pipeId: pipeId })
            });
            console.log(`Etapa ${etapa} interrompida com sucesso.`);
        } catch (error) {
            console.error("Erro ao iniciar etapa:", error);
        }
        handleEtapa(etapa, 'interrupt')
        openNotificationSucess(`${etapa} etapa interrompida.`)
    }

    const finalizarEtapa = async (etapa) => {
        switch (etapa) {
            case 'primeira':
                setPrimeiraEtapaRunning(false)
                setPrimeiraEtapaFinalizada(true)
                break;

            case 'segunda':
                setSegundaEtapaRunning(false)
                setSegundaEtapaFinalizada(true)
                break;

            case 'terceira':
                setTerceiraEtapaRunning(false)
                setTerceiraEtapaFinalizada(true)
                break;

            case 'quarta':
                setQuartaEtapaRunning(false)
                setQuartaEtapaFinalizada(true)
                break;
        }

        try {
            await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/finalizarEtapa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ etapa: etapa, pipeId: pipeId })
            });
            console.log(`Etapa ${etapa} interrompida com sucesso.`);
        } catch (error) {
            console.error("Erro ao iniciar etapa:", error);
        }

        handleEtapa(etapa, 'finish')
        openNotificationSucess(`${etapa} etapa finalizada.`)
    }

    const sendToClickup = async () => {
        const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ docId: `pipeId_${pipeId}`, url: 'pipe' })
        })
        const data = await response.json()

        const tempoTotal = (data.setup.primeira_etapa.horaFim - data.setup.primeira_etapa.horaInicio) + (data.setup.terceira_etapa.horaFim - data.setup.terceira_etapa.horaInicio) + (data.setup.segunda_etapa.horaFim - data.setup.segunda_etapa.horaInicio) + (data.setup.quarta_etapa.horaFim - data.setup.quarta_etapa.horaInicio) 

        let tempoInterrompido = 0
        if(data.setup.primeira_etapa.interruptions) {
            for(const interruption of data.setup.primeira_etapa.interruptions) {
                if(interruption.justificativa != 'Almoço') {
                    tempoInterrompido += interruption.horaFim - interruption.horaInicio
                }
            }
        }
        if(data.setup.segunda_etapa.interruptions) {
            for(const interruption of data.setup.segunda_etapa.interruptions) {
                if(interruption.justificativa != 'Almoço') {
                    tempoInterrompido += interruption.horaFim - interruption.horaInicio
                }
            }
        }
        if(data.setup.terceira_etapa.interruptions) {
            for(const interruption of data.setup.terceira_etapa.interruptions) {
                if(interruption.justificativa != 'Almoço') {
                    tempoInterrompido += interruption.horaFim - interruption.horaInicio
                }
            }
        }
        if(data.setup.quarta_etapa.interruptions) {
            for(const interruption of data.setup.quarta_etapa.interruptions) {
                if(interruption.justificativa != 'Almoço') {
                    tempoInterrompido += interruption.horaFim - interruption.horaInicio
                }
            }
        }

        const token = 'pk_89229936_3NFZ3NSHS6PQ4JOXR6P3YDVI0R0BTCWE'

        const responseTempoTotal = await fetch(`https://api.clickup.com/api/v2/task/${data.taskId}/field/${tempoSetupFieldId}`, {
            method: 'POST',
            headers: { "Authorization": `${token}`, "Content-Type": "application/json", "accept": "application/json" },
            body: JSON.stringify({ value: `${(tempoTotal / 60000).toFixed(0)} minutos` })
        })

        const responseTempoInterrompido = await fetch(`https://api.clickup.com/api/v2/task/${data.taskId}/field/${tempoInterrompidoFieldId}`, {
            method: 'POST',
            headers: { "Authorization": `${token}`, "Content-Type": "application/json", "accept": "application/json" },
            body: JSON.stringify({ value: `${(tempoInterrompido / 60000).toFixed(0)} minutos` })
        })
    }

    useEffect(() => {
        const saveTimeline = async () => {
            if (timelineItems.length > 0) {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ docId: `pipeId_${pipeId}`, data: { timelineSetup: timelineItems } })
                })
                console.log('saved succesfully')
            }
        }

        saveTimeline()
    }, [timelineItems])

    useEffect(() => {
        const fetchTimelineItems = async () => {
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docId: `pipeId_${pipeId}`, url: 'pipe' })
            })
            const data = await response.json()
            setTimelineItems(data.timelineSetup)
            if(data.setup.primeira_etapa) {
                if(!data.setup.primeira_etapa.horaFim) {
                    setFirstTimeRunningPrimeira(false)
                    setPrimeiraEtapaRunning(true)
                    if(data.setup.primeira_etapa.interruptions) {
                        if(!data.setup.primeira_etapa.interruptions[data.setup.primeira_etapa.interruptions.length - 1].horaFim) {
                            setFirstTimeRunningPrimeira(false)
                            setPrimeiraEtapaRunning(false)
                        }
                    }
                } else {
                    setPrimeiraEtapaFinalizada(true)
                }
            }
            if(data.setup.segunda_etapa) {
                if(!data.setup.segunda_etapa.horaFim) {
                    setFirstTimeRunningSegunda(false)
                    setSegundaEtapaRunning(true)
                    if(data.setup.segunda_etapa.interruptions) {
                        if(!data.setup.segunda_etapa.interruptions[data.setup.segunda_etapa.interruptions.length - 1].horaFim) {
                            setFirstTimeRunningSegunda(false)
                            setSegundaEtapaRunning(false)
                        }
                    }
                } else {
                    setSegundaEtapaFinalizada(true)
                }
            }
            if(data.setup.terceira_etapa) {
                if(!data.setup.terceira_etapa.horaFim) {
                    setFirstTimeRunningTerceira(false)
                    setTerceiraEtapaRunning(true)
                    if(data.setup.terceira_etapa.interruptions) {
                        if(!data.setup.terceira_etapa.interruptions[data.setup.terceira_etapa.interruptions.length - 1].horaFim) {
                            setFirstTimeRunningTerceira(false)
                            setTerceiraEtapaRunning(false)
                        }
                    }
                } else {
                    setTerceiraEtapaFinalizada(true)
                }
            }
            if(data.setup.quarta_etapa) {
                if(!data.setup.quarta_etapa.horaFim) {
                    setFirstTimeRunningQuarta(false)
                    setQuartaEtapaRunning(true)
                    if(data.setup.quarta_etapa.interruptions) {
                        if(!data.setup.quarta_etapa.interruptions[data.setup.quarta_etapa.interruptions.length - 1].horaFim) {
                            setFirstTimeRunningQuarta(false)
                            setQuartaEtapaRunning(false)
                        }
                    }
                } else {
                    setQuartaEtapaFinalizada(true)
                }
            }
        }

        fetchTimelineItems()
    }, [pipeId])

    return (
        <>
            {contextHolder}

            <div style={{ margin: 'auto', width: '75%' }}>
                <Flex justify='space-between'>

                    <Timeline items={timelineItems} style={{ overflowY: 'auto', maxHeight: '80vh', padding: '5vh 1vw 0 1vw', msOverflowStyle: 'none', scrollbarWidth: 'none', boxShadow: 'inset 0 -8px 8px -8px rgba(0, 0, 0, 0.5)', marginRight: '2vw' }} />

                    <Flex vertical justify='space-evenly' style={{ width: '70%' }}>

                        <Form layout='vertical' style={{ marginBottom: 16 }} onValuesChange={(allValues, changedValues) => setFormValues(allValues)}>
                            <Flex style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Form.Item label='Aditivo?' name='aditivo'>
                                    <Select defaultValue='Não' onSelect={(value) => {
                                        if (value === 'Sim') {
                                            setAditivo(true)
                                        } else {
                                            setAditivo(false)
                                        }
                                    }} options={
                                        [
                                            { value: 'Sim', label: 'Sim' },
                                            { value: 'Não', label: 'Não' },
                                        ]
                                    } />
                                </Form.Item>
                                
                                <Button type='primary' disabled={primeiraEtapaFinalizada == true && segundaEtapaFinalizada == true && terceiraEtapaFinalizada == true && quartaEtapaFinalizada == true ? false : true} onClick={sendToClickup}>Sincronizar com clickup</Button>
                            </Flex>
                        </Form>

                        <div style={{ margin: '16px auto 0 auto', display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                {primeiraEtapaRunning ? <Button type='primary' disabled={primeiraEtapaFinalizada} onClick={() => interromperEtapa('primeira')} style={{ backgroundColor: 'red' }}>Interromper 1ª Etapa</Button> : <Button disabled={primeiraEtapaFinalizada} onClick={() => iniciarEtapa('primeira')} type='primary'>Iniciar 1ª Etapa</Button>}
                                {primeiraEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                <Button type='primary' disabled={primeiraEtapaFinalizada} onClick={() => finalizarEtapa('primeira')} style={{ backgroundColor: 'green' }}>Finalizar 1ª Etapa</Button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                {segundaEtapaRunning ? <Button type='primary' disabled={segundaEtapaFinalizada} onClick={() => interromperEtapa('segunda')} style={{ backgroundColor: 'red' }}>Interromper 2ª Etapa</Button> : <Button disabled={segundaEtapaFinalizada} onClick={() => iniciarEtapa('segunda')} type='primary'>Iniciar 2ª Etapa</Button>}
                                {segundaEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                <Button type='primary' onClick={() => finalizarEtapa('segunda')} disabled={segundaEtapaFinalizada} style={{ backgroundColor: 'green' }}>Finalizar 2ª Etapa</Button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                {terceiraEtapaRunning ? <Button type='primary' disabled={terceiraEtapaFinalizada} onClick={() => interromperEtapa('terceira')} style={{ backgroundColor: 'red' }}>Interromper 3ª Etapa</Button> : <Button disabled={terceiraEtapaFinalizada} onClick={() => iniciarEtapa('terceira')} type='primary'>Iniciar 3ª Etapa</Button>}
                                {terceiraEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                <Button type='primary' onClick={() => finalizarEtapa('terceira')} disabled={terceiraEtapaFinalizada} style={{ backgroundColor: 'green' }}>Finalizar 3ª Etapa</Button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                {quartaEtapaRunning ? <Button type='primary' onClick={() => interromperEtapa('quarta')} disabled={quartaEtapaFinalizada} style={{ backgroundColor: 'red' }}>Interromper 4ª Etapa</Button> : <Button disabled={quartaEtapaFinalizada} onClick={() => iniciarEtapa('quarta')} type='primary'>Iniciar 4ª Etapa</Button>}
                                {quartaEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                <Button type='primary' onClick={() => finalizarEtapa('quarta')} disabled={quartaEtapaFinalizada} style={{ backgroundColor: 'green' }}>Finalizar 4ª Etapa</Button>
                            </div>
                        </div>
                    </Flex>
                </Flex>
            </div>
        </>
    );
};

export default Cronometro;