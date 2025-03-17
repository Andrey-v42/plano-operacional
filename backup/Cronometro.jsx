import React, { useEffect, useState } from 'react';
import { Tabs, Input, Button, Flex, Form, Select, Timeline, notification } from 'antd';
import { ExclamationCircleOutlined, SmileOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';

const { Group: InputGroup } = Input;
const { Group: ButtonGroup } = Button;

const Cronometro = () => {
    const navigate = useNavigate()
    const permission = localStorage.getItem('permission')
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const [api, contextHolder] = notification.useNotification()

    const [primeiraEtapaRunning, setPrimeiraEtapaRunning] = useState(false)
    const [segundaEtapaRunning, setSegundaEtapaRunning] = useState(false)
    const [terceiraEtapaRunning, setTerceiraEtapaRunning] = useState(false)
    const [quartaEtapaRunning, setQuartaEtapaRunning] = useState(false)
    const [firstTimeRunningPrimeira, setFirstTimeRunningPrimeira] = useState(true)
    const [firstTimeRunningSegunda, setFirstTimeRunningSegunda] = useState(true)
    const [firstTimeRunningTerceira, setFirstTimeRunningTerceira] = useState(true)
    const [firstTimeRunningQuarta, setFirstTimeRunningQuarta] = useState(true)
    const [primeiraEtapaRunningAditivo, setPrimeiraEtapaRunningAditivo] = useState(false)
    const [segundaEtapaRunningAditivo, setSegundaEtapaRunningAditivo] = useState(false)
    const [terceiraEtapaRunningAditivo, setTerceiraEtapaRunningAditivo] = useState(false)
    const [quartaEtapaRunningAditivo, setQuartaEtapaRunningAditivo] = useState(false)
    const [firstTimeRunningPrimeiraAditivo, setFirstTimeRunningPrimeiraAditivo] = useState(true)
    const [firstTimeRunningSegundaAditivo, setFirstTimeRunningSegundaAditivo] = useState(true)
    const [firstTimeRunningTerceiraAditivo, setFirstTimeRunningTerceiraAditivo] = useState(true)
    const [firstTimeRunningQuartaAditivo, setFirstTimeRunningQuartaAditivo] = useState(true)
    const [primeiraEtapaFinalizada, setPrimeiraEtapaFinalizada] = useState(false)
    const [segundaEtapaFinalizada, setSegundaEtapaFinalizada] = useState(false)
    const [terceiraEtapaFinalizada, setTerceiraEtapaFinalizada] = useState(false)
    const [quartaEtapaFinalizada, setQuartaEtapaFinalizada] = useState(false)
    const [primeiraEtapaFinalizadaAditivo, setPrimeiraEtapaFinalizadaAditivo] = useState(false)
    const [segundaEtapaFinalizadaAditivo, setSegundaEtapaFinalizadaAditivo] = useState(false)
    const [terceiraEtapaFinalizadaAditivo, setTerceiraEtapaFinalizadaAditivo] = useState(false)
    const [quartaEtapaFinalizadaAditivo, setQuartaEtapaFinalizadaAditivo] = useState(false)
    const [newAditivo, setNewAditivo] = useState(false)
    
    const [formValues, setFormValues] = useState({})
    const [aditivo, setAditivo] = useState(false)
    const [justificativa, setJustificativa] = useState('')
    const [timelineItems, setTimelineItems] = useState([]);
    const [timelineItemsAditivo, setTimelineItemsAditivo] = useState([]);
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

    const addTimelineEventAditivo = (color, content) => {
        setTimelineItemsAditivo(prevItems => [...prevItems || [], { color, children: content }]);
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

    const handleEtapaAditivo = (etapa, action) => {
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
        addTimelineEventAditivo(color, content);
    };

    const justificativaItems = [
        { value: 'Almoço', label: 'Almoço' },
        { value: 'Pausa', label: 'Pausa' },
        { value: 'Falta de terminais', label: 'Falta de terminais' },
        { value: 'Erro de EC', label: 'Erro de EC' },
        { value: 'Tamper', label: 'Tamper' },
        { value: 'Erro de Chip', label: 'Erro de Chip' },
        { value: 'Tela Quebrada', label: 'Tela Quebrada' },
        { value: 'Impressão', label: 'Impressão' },
        { value: 'Bateria baixa', label: 'Bateria baixa' }
    ]

    const justificativaItemsTerceira = [
        { value: 'Almoço', label: 'Almoço' },
        { value: 'Pausa', label: 'Pausa' },
        { value: 'Erro de EC no Login', label: 'Erro de EC no Login' },
        { value: 'Funcionário não encontrado', label: 'Funcionário não encontrado' },
        { value: 'Falta de cardápio', label: 'Falta de cardápio' },
        { value: 'Horário errado', label: 'Horário errado' }
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

    const iniciarEtapaAditivo = async (etapa) => {
        switch (etapa) {
            case 'primeira':
                if (firstTimeRunningPrimeiraAditivo == true) {
                    setFirstTimeRunningPrimeiraAditivo(false)
                }
                setPrimeiraEtapaRunningAditivo(true)
                break;

            case 'segunda':
                if (firstTimeRunningSegundaAditivo == true) {
                    setFirstTimeRunningSegundaAditivo(false)
                }
                setSegundaEtapaRunningAditivo(true)
                break;

            case 'terceira':
                if (firstTimeRunningTerceiraAditivo == true) {
                    setFirstTimeRunningTerceiraAditivo(false)
                }
                setTerceiraEtapaRunningAditivo(true)
                break;

            case 'quarta':
                if (firstTimeRunningQuartaAditivo == true) {
                    setFirstTimeRunningQuartaAditivo(false)
                }
                setQuartaEtapaRunningAditivo(true)
                break;
        }

        if (firstTimeRunningPrimeiraAditivo == true && etapa == 'primeira' || firstTimeRunningSegundaAditivo == true && etapa == 'segunda' || firstTimeRunningTerceiraAditivo == true && etapa == 'terceira' || firstTimeRunningQuartaAditivo == true && etapa == 'quarta') {
            try {
                await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/iniciarEtapaAditivo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ etapa: etapa, user: localStorage.getItem("currentUser"), pipeId: pipeId, novoAditivo: newAditivo })
                });
                console.log(`Etapa ${etapa} iniciada com sucesso.`);
            } catch (error) {
                console.error("Erro ao iniciar etapa:", error);
            }
            handleEtapaAditivo(etapa, 'start')
            openNotificationSucess(`${etapa} etapa iniciada.`)
            setNewAditivo(false)
        } else {
            try {
                await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/retomarEtapaAditivo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ etapa: etapa, pipeId: pipeId })
                });
                console.log(`Etapa ${etapa} retomada com sucesso.`);
            } catch (error) {
                console.error("Erro ao iniciar etapa:", error);
            }
            handleEtapaAditivo(etapa, 'resume')
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
        setJustificativa('')
        handleEtapa(etapa, 'interrupt')
        openNotificationSucess(`${etapa} etapa interrompida.`)
    }

    const interromperEtapaAditivo = async (etapa) => {
        if (justificativa == '') {
            openNotificationFailure('Selecione a justificativa para continuar.')
            return
        }
        switch (etapa) {
            case 'primeira':
                setPrimeiraEtapaRunningAditivo(false)
                break;

            case 'segunda':
                setSegundaEtapaRunningAditivo(false)
                break;

            case 'terceira':
                setTerceiraEtapaRunningAditivo(false)
                break;

            case 'quarta':
                setQuartaEtapaRunningAditivo(false)
                break;

        }

        try {
            await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/interromperEtapaAditivo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ etapa: etapa, justificativa: justificativa, pipeId: pipeId })
            });
            console.log(`Etapa ${etapa} interrompida com sucesso.`);
        } catch (error) {
            console.error("Erro ao iniciar etapa:", error);
        }
        setJustificativa('')
        handleEtapaAditivo(etapa, 'interrupt')
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

    const finalizarEtapaAditivo = async (etapa) => {
        switch (etapa) {
            case 'primeira':
                setPrimeiraEtapaRunningAditivo(false)
                setPrimeiraEtapaFinalizadaAditivo(true)
                break;

            case 'segunda':
                setSegundaEtapaRunningAditivo(false)
                setSegundaEtapaFinalizadaAditivo(true)
                break;

            case 'terceira':
                setTerceiraEtapaRunningAditivo(false)
                setTerceiraEtapaFinalizadaAditivo(true)
                break;

            case 'quarta':
                setQuartaEtapaRunningAditivo(false)
                setQuartaEtapaFinalizadaAditivo(true)
                break;
        }

        try {
            await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/finalizarEtapaAditivo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ etapa: etapa, pipeId: pipeId, user: localStorage.getItem('currentUser') })
            });
            console.log(`Etapa ${etapa} interrompida com sucesso.`);
        } catch (error) {
            console.error("Erro ao iniciar etapa:", error);
        }

        handleEtapaAditivo(etapa, 'finish')
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
        if (data.setup.primeira_etapa.interruptions) {
            for (const interruption of data.setup.primeira_etapa.interruptions) {
                if (interruption.justificativa != 'Almoço') {
                    tempoInterrompido += interruption.horaFim - interruption.horaInicio
                }
            }
        }
        if (data.setup.segunda_etapa.interruptions) {
            for (const interruption of data.setup.segunda_etapa.interruptions) {
                if (interruption.justificativa != 'Almoço') {
                    tempoInterrompido += interruption.horaFim - interruption.horaInicio
                }
            }
        }
        if (data.setup.terceira_etapa.interruptions) {
            for (const interruption of data.setup.terceira_etapa.interruptions) {
                if (interruption.justificativa != 'Almoço') {
                    tempoInterrompido += interruption.horaFim - interruption.horaInicio
                }
            }
        }
        if (data.setup.quarta_etapa.interruptions) {
            for (const interruption of data.setup.quarta_etapa.interruptions) {
                if (interruption.justificativa != 'Almoço') {
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

    const novoAditivo = () => {
        setFirstTimeRunningPrimeiraAditivo(true)
        setFirstTimeRunningSegundaAditivo(true)
        setFirstTimeRunningTerceiraAditivo(true)
        setFirstTimeRunningQuartaAditivo(true)
        setPrimeiraEtapaFinalizadaAditivo(false)
        setSegundaEtapaFinalizadaAditivo(false)
        setTerceiraEtapaFinalizadaAditivo(false)
        setQuartaEtapaFinalizadaAditivo(false)
        setPrimeiraEtapaRunningAditivo(false)
        setSegundaEtapaRunningAditivo(false)
        setTerceiraEtapaRunningAditivo(false)
        setQuartaEtapaRunningAditivo(false)
        setNewAditivo(true)
        console.log("ok")
    }

    const tabItems = [
        {
            label: 'Setup',
            key: '1',
            children: (
                <div style={{ margin: 'auto', width: '80%' }}>
                    <Flex justify='space-between'>

                        <Timeline items={timelineItems} style={{ overflowY: 'auto', maxHeight: '80vh', padding: '5vh 1vw 0 1vw', msOverflowStyle: 'none', scrollbarWidth: 'none', boxShadow: 'inset 0 -8px 8px -8px rgba(0, 0, 0, 0.5)', marginRight: '2vw' }} />

                        <Flex vertical justify='space-evenly' style={{ width: '70%' }}>

                            <Flex style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Button type='primary' disabled={primeiraEtapaFinalizada == true && segundaEtapaFinalizada == true && terceiraEtapaFinalizada == true && quartaEtapaFinalizada == true ? false : true} onClick={sendToClickup}>Sincronizar com clickup</Button>
                            </Flex>

                            <div style={{ margin: '16px auto 0 auto', display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                    {primeiraEtapaRunning ? <Button type='primary' disabled={primeiraEtapaFinalizada} onClick={() => interromperEtapa('primeira')} style={{ backgroundColor: 'red' }}>Interromper 1ª Etapa</Button> : <Button disabled={primeiraEtapaFinalizada} onClick={() => iniciarEtapa('primeira')} type='primary'>Iniciar 1ª Etapa</Button>}
                                    {primeiraEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                    <Button type='primary' disabled={primeiraEtapaFinalizada || firstTimeRunningPrimeira} onClick={() => finalizarEtapa('primeira')} style={{ backgroundColor: 'green' }}>Finalizar 1ª Etapa</Button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                    {segundaEtapaRunning ? <Button type='primary' disabled={segundaEtapaFinalizada || firstTimeRunningPrimeira} onClick={() => interromperEtapa('segunda')} style={{ backgroundColor: 'red' }}>Interromper 2ª Etapa</Button> : <Button disabled={segundaEtapaFinalizada || firstTimeRunningPrimeira} onClick={() => iniciarEtapa('segunda')} type='primary'>Iniciar 2ª Etapa</Button>}
                                    {segundaEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                    <Button type='primary' onClick={() => finalizarEtapa('segunda')} disabled={segundaEtapaFinalizada || firstTimeRunningPrimeira || firstTimeRunningSegunda} style={{ backgroundColor: 'green' }}>Finalizar 2ª Etapa</Button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                    {terceiraEtapaRunning ? <Button type='primary' disabled={terceiraEtapaFinalizada || firstTimeRunningSegunda} onClick={() => interromperEtapa('terceira')} style={{ backgroundColor: 'red' }}>Interromper 3ª Etapa</Button> : <Button disabled={terceiraEtapaFinalizada || firstTimeRunningSegunda} onClick={() => iniciarEtapa('terceira')} type='primary'>Iniciar 3ª Etapa</Button>}
                                    {terceiraEtapaRunning ? <Select options={justificativaItemsTerceira} onSelect={(value) => setJustificativa(value)} /> : null}
                                    <Button type='primary' onClick={() => finalizarEtapa('terceira')} disabled={terceiraEtapaFinalizada || firstTimeRunningSegunda || firstTimeRunningTerceira} style={{ backgroundColor: 'green' }}>Finalizar 3ª Etapa</Button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                    {quartaEtapaRunning ? <Button type='primary' onClick={() => interromperEtapa('quarta')} disabled={quartaEtapaFinalizada || firstTimeRunningTerceira} style={{ backgroundColor: 'red' }}>Interromper 4ª Etapa</Button> : <Button disabled={quartaEtapaFinalizada || firstTimeRunningTerceira} onClick={() => iniciarEtapa('quarta')} type='primary'>Iniciar 4ª Etapa</Button>}
                                    {quartaEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                    <Button type='primary' onClick={() => finalizarEtapa('quarta')} disabled={quartaEtapaFinalizada || firstTimeRunningTerceira || firstTimeRunningQuarta} style={{ backgroundColor: 'green' }}>Finalizar 4ª Etapa</Button>
                                </div>
                            </div>
                        </Flex>
                    </Flex>
                </div>
            )
        },
        {
            label: 'Aditivo',
            key: '2',
            children: (
                <div style={{ margin: 'auto', width: '80%' }}>
                    <Flex justify='space-between'>

                        <Timeline items={timelineItemsAditivo} style={{ overflowY: 'auto', maxHeight: '80vh', padding: '5vh 1vw 0 1vw', msOverflowStyle: 'none', scrollbarWidth: 'none', boxShadow: 'inset 0 -8px 8px -8px rgba(0, 0, 0, 0.5)', marginRight: '2vw' }} />

                        <Flex vertical justify='space-evenly' style={{ width: '70%' }}>

                            <Flex style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Button type='primary' onClick={novoAditivo} disabled={primeiraEtapaFinalizadaAditivo == true && segundaEtapaFinalizadaAditivo == true && terceiraEtapaFinalizadaAditivo == true && quartaEtapaFinalizadaAditivo == true ? false : true}>Iniciar novo aditivo</Button>
                                <Button type='primary' disabled={primeiraEtapaFinalizadaAditivo == true && segundaEtapaFinalizadaAditivo == true && terceiraEtapaFinalizadaAditivo == true && quartaEtapaFinalizadaAditivo == true ? false : true} onClick={sendToClickup}>Sincronizar com clickup</Button>
                            </Flex>

                            <div style={{ margin: '16px auto 0 auto', display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                    {primeiraEtapaRunningAditivo ? <Button type='primary' disabled={primeiraEtapaFinalizadaAditivo} onClick={() => interromperEtapaAditivo('primeira')} style={{ backgroundColor: 'red' }}>Interromper 1ª Etapa</Button> : <Button disabled={primeiraEtapaFinalizadaAditivo} onClick={() => iniciarEtapaAditivo('primeira')} type='primary'>Iniciar 1ª Etapa</Button>}
                                    {primeiraEtapaRunningAditivo ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                    <Button type='primary' disabled={primeiraEtapaFinalizadaAditivo || firstTimeRunningPrimeiraAditivo} onClick={() => finalizarEtapaAditivo('primeira')} style={{ backgroundColor: 'green' }}>Finalizar 1ª Etapa</Button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                    {segundaEtapaRunningAditivo ? <Button type='primary' disabled={segundaEtapaFinalizadaAditivo || firstTimeRunningPrimeiraAditivo} onClick={() => interromperEtapaAditivo('segunda')} style={{ backgroundColor: 'red' }}>Interromper 2ª Etapa</Button> : <Button disabled={segundaEtapaFinalizadaAditivo || firstTimeRunningPrimeiraAditivo} onClick={() => iniciarEtapaAditivo('segunda')} type='primary'>Iniciar 2ª Etapa</Button>}
                                    {segundaEtapaRunningAditivo ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                    <Button type='primary' onClick={() => finalizarEtapaAditivo('segunda')} disabled={segundaEtapaFinalizadaAditivo || firstTimeRunningPrimeiraAditivo || firstTimeRunningSegundaAditivo} style={{ backgroundColor: 'green' }}>Finalizar 2ª Etapa</Button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                    {terceiraEtapaRunningAditivo ? <Button type='primary' disabled={terceiraEtapaFinalizadaAditivo || firstTimeRunningSegundaAditivo} onClick={() => interromperEtapaAditivo('terceira')} style={{ backgroundColor: 'red' }}>Interromper 3ª Etapa</Button> : <Button disabled={terceiraEtapaFinalizadaAditivo || firstTimeRunningSegundaAditivo} onClick={() => iniciarEtapaAditivo('terceira')} type='primary'>Iniciar 3ª Etapa</Button>}
                                    {terceiraEtapaRunningAditivo ? <Select options={justificativaItemsTerceira} onSelect={(value) => setJustificativa(value)} /> : null}
                                    <Button type='primary' onClick={() => finalizarEtapaAditivo('terceira')} disabled={terceiraEtapaFinalizadaAditivo || firstTimeRunningSegundaAditivo || firstTimeRunningTerceiraAditivo} style={{ backgroundColor: 'green' }}>Finalizar 3ª Etapa</Button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                    {quartaEtapaRunningAditivo ? <Button type='primary' onClick={() => interromperEtapaAditivo('quarta')} disabled={quartaEtapaFinalizadaAditivo || firstTimeRunningTerceiraAditivo} style={{ backgroundColor: 'red' }}>Interromper 4ª Etapa</Button> : <Button disabled={quartaEtapaFinalizadaAditivo || firstTimeRunningTerceiraAditivo} onClick={() => iniciarEtapaAditivo('quarta')} type='primary'>Iniciar 4ª Etapa</Button>}
                                    {quartaEtapaRunningAditivo ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                    <Button type='primary' onClick={() => finalizarEtapaAditivo('quarta')} disabled={quartaEtapaFinalizadaAditivo || firstTimeRunningTerceiraAditivo || firstTimeRunningQuartaAditivo} style={{ backgroundColor: 'green' }}>Finalizar 4ª Etapa</Button>
                                </div>
                            </div>
                        </Flex>
                    </Flex>
                </div>
            )
        }
    ]

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
        const saveTimeline = async () => {
            if (timelineItemsAditivo.length > 0) {
                const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ docId: `pipeId_${pipeId}`, data: { timelineSetupAditivo: timelineItemsAditivo } })
                })
                console.log('saved succesfully')
            }
        }

        saveTimeline()
    }, [timelineItemsAditivo])

    useEffect(() => {
        const fetchTimelineItems = async () => {
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docId: `pipeId_${pipeId}`, url: 'pipe' })
            })
            const data = await response.json()
            setTimelineItems(data.timelineSetup)
            if (data.setup) {
                if (data.setup.primeira_etapa) {
                    if (!data.setup.primeira_etapa.horaFim) {
                        setFirstTimeRunningPrimeira(false)
                        setPrimeiraEtapaRunning(true)
                        if (data.setup.primeira_etapa.interruptions) {
                            if (!data.setup.primeira_etapa.interruptions[data.setup.primeira_etapa.interruptions.length - 1].horaFim) {
                                setFirstTimeRunningPrimeira(false)
                                setPrimeiraEtapaRunning(false)
                            }
                        }
                    } else {
                        setPrimeiraEtapaFinalizada(true)
                    }
                }
                if (data.setup.segunda_etapa) {
                    if (!data.setup.segunda_etapa.horaFim) {
                        setFirstTimeRunningSegunda(false)
                        setSegundaEtapaRunning(true)
                        if (data.setup.segunda_etapa.interruptions) {
                            if (!data.setup.segunda_etapa.interruptions[data.setup.segunda_etapa.interruptions.length - 1].horaFim) {
                                setFirstTimeRunningSegunda(false)
                                setSegundaEtapaRunning(false)
                            }
                        }
                    } else {
                        setSegundaEtapaFinalizada(true)
                    }
                }
                if (data.setup.terceira_etapa) {
                    if (!data.setup.terceira_etapa.horaFim) {
                        setFirstTimeRunningTerceira(false)
                        setTerceiraEtapaRunning(true)
                        console.log('ok')
                        if (data.setup.terceira_etapa.interruptions) {
                            if (!data.setup.terceira_etapa.interruptions[data.setup.terceira_etapa.interruptions.length - 1].horaFim) {
                                setFirstTimeRunningTerceira(false)
                                setTerceiraEtapaRunning(false)
                            }
                        }
                    } else {
                        setTerceiraEtapaFinalizada(true)
                    }
                }
                if (data.setup.quarta_etapa) {
                    if (!data.setup.quarta_etapa.horaFim) {
                        setFirstTimeRunningQuarta(false)
                        setQuartaEtapaRunning(true)
                        if (data.setup.quarta_etapa.interruptions) {
                            if (!data.setup.quarta_etapa.interruptions[data.setup.quarta_etapa.interruptions.length - 1].horaFim) {
                                setFirstTimeRunningQuarta(false)
                                setQuartaEtapaRunning(false)
                            }
                        }
                    } else {
                        setQuartaEtapaFinalizada(true)
                    }
                }
            }
        }

        const fetchTimelineItemsAditivo = async () => {
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docId: `pipeId_${pipeId}`, url: 'pipe' })
            })
            const data = await response.json()
            setTimelineItemsAditivo(data.timelineSetupAditivo)
            if (data.setupAditivo) {
                if (data.setupAditivo[data.setupAditivo.length - 1].primeira_etapa) {
                    if (!data.setupAditivo[data.setupAditivo.length - 1].primeira_etapa.horaFim) {
                        setFirstTimeRunningPrimeiraAditivo(false)
                        setPrimeiraEtapaRunningAditivo(true)
                        if (data.setupAditivo[data.setupAditivo.length - 1].primeira_etapa.interrupcoes) {
                            if (!data.setupAditivo[data.setupAditivo.length - 1].primeira_etapa.interrupcoes[data.setupAditivo[data.setupAditivo.length - 1].primeira_etapa.interrupcoes.length - 1].horaFim) {
                                setFirstTimeRunningPrimeiraAditivo(false)
                                setPrimeiraEtapaRunningAditivo(false)
                            }
                        }
                    } else {
                        console.log(data.setupAditivo[data.setupAditivo.length - 1].primeira_etapa.horaFim)
                        setFirstTimeRunningPrimeiraAditivo(false)
                        setPrimeiraEtapaFinalizadaAditivo(true)
                    }
                }
                if (data.setupAditivo[data.setupAditivo.length - 1].segunda_etapa) {
                    if (!data.setupAditivo[data.setupAditivo.length - 1].segunda_etapa.horaFim) {
                        setFirstTimeRunningSegundaAditivo(false)
                        setSegundaEtapaRunningAditivo(true)
                        if (data.setupAditivo[data.setupAditivo.length - 1].segunda_etapa.interrupcoes) {
                            if (!data.setupAditivo[data.setupAditivo.length - 1].segunda_etapa.interrupcoes[data.setupAditivo[data.setupAditivo.length - 1].segunda_etapa.interrupcoes.length - 1].horaFim) {
                                setFirstTimeRunningSegundaAditivo(false)
                                setSegundaEtapaRunningAditivo(false)
                            }
                        }
                    } else {
                        setFirstTimeRunningSegundaAditivo(false)
                        setSegundaEtapaFinalizadaAditivo(true)
                    }
                }
                if (data.setupAditivo[data.setupAditivo.length - 1].terceira_etapa) {
                    if (!data.setupAditivo[data.setupAditivo.length - 1].terceira_etapa.horaFim) {
                        setFirstTimeRunningTerceiraAditivo(false)
                        setTerceiraEtapaRunningAditivo(true)
                        if (data.setupAditivo[data.setupAditivo.length - 1].terceira_etapa.interrupcoes) {
                            if (!data.setupAditivo[data.setupAditivo.length - 1].terceira_etapa.interrupcoes[data.setupAditivo[data.setupAditivo.length - 1].terceira_etapa.interrupcoes.length - 1].horaFim) {
                                setFirstTimeRunningTerceiraAditivo(false)
                                setTerceiraEtapaRunningAditivo(false)
                            }
                        }
                    } else {
                        setFirstTimeRunningTerceiraAditivo(false)
                        setTerceiraEtapaFinalizadaAditivo(true)
                    }
                }
                if (data.setupAditivo[data.setupAditivo.length - 1].quarta_etapa) {
                    if (!data.setupAditivo[data.setupAditivo.length - 1].quarta_etapa.horaFim) {
                        setFirstTimeRunningQuartaAditivo(false)
                        setQuartaEtapaRunningAditivo(true)
                        if (data.setupAditivo[data.setupAditivo.length - 1].quarta_etapa.interrupcoes) {
                            if (!data.setupAditivo[data.setupAditivo.length - 1].quarta_etapa.interrupcoes[data.setupAditivo[data.setupAditivo.length - 1].quarta_etapa.interrupcoes.length - 1].horaFim) {
                                setFirstTimeRunningQuartaAditivo(false)
                                setQuartaEtapaRunningAditivo(false)
                            }
                        }
                    } else {
                        setFirstTimeRunningQuartaAditivo(false)
                        setQuartaEtapaFinalizadaAditivo(true)
                    }
                }
            }
        }

        fetchTimelineItemsAditivo()
        fetchTimelineItems()
    }, [pipeId])

    useEffect(() => {
        if (permission != 'config' && permission != 'admin') {
            navigate(`/plano?pipeId=${pipeId}`)
        }
    }, [permission])

    return (
        <>
            {contextHolder}
            <Tabs
                style={{
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)',
                    borderRadius: '6px',
                    padding: '8px',
                    background: 'white',
                    margin: 'auto',
                    width: '100%',
                    height: '100%'
                }}
                defaultActiveKey='1'
                items={tabItems}
            />

            {/* <div style={{ margin: 'auto', width: '75%' }}>
                <Flex justify='space-between'>

                    <Timeline items={timelineItems} style={{ overflowY: 'auto', maxHeight: '80vh', padding: '5vh 1vw 0 1vw', msOverflowStyle: 'none', scrollbarWidth: 'none', boxShadow: 'inset 0 -8px 8px -8px rgba(0, 0, 0, 0.5)', marginRight: '2vw' }} />

                    <Flex vertical justify='space-evenly' style={{ width: '70%' }}>

                        <Form layout='vertical' style={{ marginBottom: 16 }} onValuesChange={(allValues, changedValues) => setFormValues(allValues)}>
                            <Flex style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Form.Item label='Aditivo?' name='aditivo'>
                                    <Select disabled={!firstTimeRunningPrimeira} defaultValue='Não' onSelect={(value) => {
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
                                <Button type='primary' disabled={primeiraEtapaFinalizada || firstTimeRunningPrimeira} onClick={() => finalizarEtapa('primeira')} style={{ backgroundColor: 'green' }}>Finalizar 1ª Etapa</Button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                {segundaEtapaRunning ? <Button type='primary' disabled={segundaEtapaFinalizada || firstTimeRunningPrimeira} onClick={() => interromperEtapa('segunda')} style={{ backgroundColor: 'red' }}>Interromper 2ª Etapa</Button> : <Button disabled={segundaEtapaFinalizada || firstTimeRunningPrimeira} onClick={() => iniciarEtapa('segunda')} type='primary'>Iniciar 2ª Etapa</Button>}
                                {segundaEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                <Button type='primary' onClick={() => finalizarEtapa('segunda')} disabled={segundaEtapaFinalizada || firstTimeRunningPrimeira || firstTimeRunningSegunda} style={{ backgroundColor: 'green' }}>Finalizar 2ª Etapa</Button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                {terceiraEtapaRunning ? <Button type='primary' disabled={terceiraEtapaFinalizada || firstTimeRunningSegunda} onClick={() => interromperEtapa('terceira')} style={{ backgroundColor: 'red' }}>Interromper 3ª Etapa</Button> : <Button disabled={terceiraEtapaFinalizada || firstTimeRunningSegunda} onClick={() => iniciarEtapa('terceira')} type='primary'>Iniciar 3ª Etapa</Button>}
                                {terceiraEtapaRunning ? <Select options={justificativaItemsTerceira} onSelect={(value) => setJustificativa(value)} /> : null}
                                <Button type='primary' onClick={() => finalizarEtapa('terceira')} disabled={terceiraEtapaFinalizada || firstTimeRunningSegunda || firstTimeRunningTerceira} style={{ backgroundColor: 'green' }}>Finalizar 3ª Etapa</Button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', height: '15vh', justifyContent: 'space-between' }}>
                                {quartaEtapaRunning ? <Button type='primary' onClick={() => interromperEtapa('quarta')} disabled={quartaEtapaFinalizada || firstTimeRunningTerceira} style={{ backgroundColor: 'red' }}>Interromper 4ª Etapa</Button> : <Button disabled={quartaEtapaFinalizada || firstTimeRunningTerceira} onClick={() => iniciarEtapa('quarta')} type='primary'>Iniciar 4ª Etapa</Button>}
                                {quartaEtapaRunning ? <Select options={justificativaItems} onSelect={(value) => setJustificativa(value)} /> : null}
                                <Button type='primary' onClick={() => finalizarEtapa('quarta')} disabled={quartaEtapaFinalizada || firstTimeRunningTerceira || firstTimeRunningQuarta} style={{ backgroundColor: 'green' }}>Finalizar 4ª Etapa</Button>
                            </div>
                        </div>
                    </Flex>
                </Flex>
            </div> */}
        </>
    );
};

export default Cronometro;