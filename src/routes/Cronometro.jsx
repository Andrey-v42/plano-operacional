import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Flex, Form, Select, Timeline } from 'antd';
import { useSearchParams } from 'react-router-dom';

const { Group: InputGroup } = Input;
const { Group: ButtonGroup } = Button;

const Cronometro = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');

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

    const [timelineItems, setTimelineItems] = useState([]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const addTimelineEvent = (color, content) => {
        setTimelineItems(prevItems => [...prevItems || [], { color, children: content }]);
    };

    const handleEtapa = (etapa, action, justificativa = '') => {
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
        { value: 'almoço', label: 'Almoço' }
    ]

    const iniciarEtapa = async (etapa) => {
        switch(etapa) {
            case 'primeira':
                if(firstTimeRunningPrimeira == true) {
                    setFirstTimeRunningPrimeira(false)
                }
                setPrimeiraEtapaRunning(true)
                break;
                
            case 'segunda':
                if(firstTimeRunningSegunda == true) {
                    setFirstTimeRunningSegunda(false)
                }
                setSegundaEtapaRunning(true)
                break;
            
            case 'terceira':
                if(firstTimeRunningTerceira == true) {
                    setFirstTimeRunningTerceira(false)
                }
                setTerceiraEtapaRunning(true)
                break;

            case 'quarta':
                if(firstTimeRunningQuarta == true) {
                    setFirstTimeRunningQuarta(false)
                }
                setQuartaEtapaRunning(true)
                break;
        }

        if(firstTimeRunningPrimeira == true && etapa == 'primeira' || firstTimeRunningSegunda == true && etapa == 'segunda' || firstTimeRunningTerceira == true && etapa == 'terceira' || firstTimeRunningQuarta == true && etapa == 'quarta') {
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
        }

    }

    const interromperEtapa = async (etapa) => {
        switch(etapa) {
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
    }

    const finalizarEtapa = async (etapa) => {
        switch(etapa) {
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
    }

    useEffect(() => {
        const saveTimeline = async () => {
            if(timelineItems.length > 0) {
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
        }

        fetchTimelineItems()
    }, [pipeId])

    return (
        <div style={{ margin: 'auto', width: '75%' }}>
            <Flex justify='space-between'>

                <Timeline items={timelineItems} scroll={{ }} />

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
                        </Flex>
                    </Form>

                    <div style={{ margin: '16px auto 0 auto', display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                            {primeiraEtapaRunning ? <Button type='primary' onClick={() => interromperEtapa('primeira')} style={{ backgroundColor: 'red' }}>Interromper 1ª Etapa</Button> : <Button onClick={() => iniciarEtapa('primeira')} type='primary'>Iniciar 1ª Etapa</Button>}
                            {primeiraEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                            <Button type='primary' onClick={() => finalizarEtapa('primeira')} style={{ backgroundColor: 'green' }}>Finalizar 1ª Etapa</Button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                            {segundaEtapaRunning ? <Button type='primary' onClick={() => interromperEtapa('segunda')} style={{ backgroundColor: 'red' }}>Interromper 2ª Etapa</Button> : <Button onClick={() => iniciarEtapa('segunda')} type='primary'>Iniciar 2ª Etapa</Button>}
                            {segundaEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                            <Button type='primary' onClick={() => finalizarEtapa('segunda')} style={{ backgroundColor: 'green' }}>Finalizar 2ª Etapa</Button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                            {terceiraEtapaRunning ? <Button type='primary' onClick={() => interromperEtapa('terceira')} style={{ backgroundColor: 'red' }}>Interromper 3ª Etapa</Button> : <Button onClick={() => iniciarEtapa('terceira')} type='primary'>Iniciar 3ª Etapa</Button>}
                            {terceiraEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                            <Button type='primary' onClick={() => finalizarEtapa('terceira')} style={{ backgroundColor: 'green' }}>Finalizar 3ª Etapa</Button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                            {quartaEtapaRunning ? <Button type='primary' onClick={() => interromperEtapa('quarta')} style={{ backgroundColor: 'red' }}>Interromper 4ª Etapa</Button> : <Button onClick={() => iniciarEtapa('quarta')} type='primary'>Iniciar 4ª Etapa</Button>}
                            {quartaEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)}/> : null}
                            <Button type='primary' onClick={() => finalizarEtapa('quarta')} style={{ backgroundColor: 'green' }}>Finalizar 4ª Etapa</Button>
                        </div>
                    </div>
                </Flex>
            </Flex>
        </div>
    );
};

export default Cronometro;