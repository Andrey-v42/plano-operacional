import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, Input, Button, Flex, Form, Select, Timeline, notification, Card, Typography, Spin, Tooltip, Badge, Space, Divider } from 'antd';
import { ExclamationCircleOutlined, SmileOutlined, SyncOutlined, ClockCircleOutlined, CheckCircleOutlined, LoadingOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';

const { Group: InputGroup } = Input;
const { Group: ButtonGroup } = Button;
const { Title, Text } = Typography;

const Cronometro = () => {
    const navigate = useNavigate();
    const permission = localStorage.getItem('permission');
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const [api, contextHolder] = notification.useNotification();
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Setup state variables
    const [primeiraEtapaRunning, setPrimeiraEtapaRunning] = useState(false);
    const [segundaEtapaRunning, setSegundaEtapaRunning] = useState(false);
    const [terceiraEtapaRunning, setTerceiraEtapaRunning] = useState(false);
    const [quartaEtapaRunning, setQuartaEtapaRunning] = useState(false);
    const [firstTimeRunningPrimeira, setFirstTimeRunningPrimeira] = useState(true);
    const [firstTimeRunningSegunda, setFirstTimeRunningSegunda] = useState(true);
    const [firstTimeRunningTerceira, setFirstTimeRunningTerceira] = useState(true);
    const [firstTimeRunningQuarta, setFirstTimeRunningQuarta] = useState(true);
    const [primeiraEtapaFinalizada, setPrimeiraEtapaFinalizada] = useState(false);
    const [segundaEtapaFinalizada, setSegundaEtapaFinalizada] = useState(false);
    const [terceiraEtapaFinalizada, setTerceiraEtapaFinalizada] = useState(false);
    const [quartaEtapaFinalizada, setQuartaEtapaFinalizada] = useState(false);

    // Aditivo state variables
    const [primeiraEtapaRunningAditivo, setPrimeiraEtapaRunningAditivo] = useState(false);
    const [segundaEtapaRunningAditivo, setSegundaEtapaRunningAditivo] = useState(false);
    const [terceiraEtapaRunningAditivo, setTerceiraEtapaRunningAditivo] = useState(false);
    const [quartaEtapaRunningAditivo, setQuartaEtapaRunningAditivo] = useState(false);
    const [firstTimeRunningPrimeiraAditivo, setFirstTimeRunningPrimeiraAditivo] = useState(true);
    const [firstTimeRunningSegundaAditivo, setFirstTimeRunningSegundaAditivo] = useState(true);
    const [firstTimeRunningTerceiraAditivo, setFirstTimeRunningTerceiraAditivo] = useState(true);
    const [firstTimeRunningQuartaAditivo, setFirstTimeRunningQuartaAditivo] = useState(true);
    const [primeiraEtapaFinalizadaAditivo, setPrimeiraEtapaFinalizadaAditivo] = useState(false);
    const [segundaEtapaFinalizadaAditivo, setSegundaEtapaFinalizadaAditivo] = useState(false);
    const [terceiraEtapaFinalizadaAditivo, setTerceiraEtapaFinalizadaAditivo] = useState(false);
    const [quartaEtapaFinalizadaAditivo, setQuartaEtapaFinalizadaAditivo] = useState(false);
    const [newAditivo, setNewAditivo] = useState(false);
    
    const [formValues, setFormValues] = useState({});
    const [aditivo, setAditivo] = useState(false);
    const [justificativa, setJustificativa] = useState('');
    const [timelineItems, setTimelineItems] = useState([]);
    const [timelineItemsAditivo, setTimelineItemsAditivo] = useState([]);
    const tempoSetupFieldId = '7260494f-cfe6-4aa1-a78a-1baf5f38260c';
    const tempoInterrompidoFieldId = '8d229ae1-08f3-4042-b80f-cdf053c127b5';

    // Notification functions
    const openNotificationSucess = (text) => {
        api.success({
            message: 'Sucesso',
            description: text,
            placement: 'topRight',
            icon: <SmileOutlined style={{ color: '#52c41a' }} />
        });
    };

    const openNotificationFailure = (text) => {
        api.error({
            message: 'Erro',
            description: text,
            placement: 'topRight',
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDateTime = (timestamp) => {
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

    const addTimelineEvent = (color, content) => {
        setTimelineItems(prevItems => [...prevItems || [], { 
            color, 
            children: content,
        }]);
    };

    const addTimelineEventAditivo = (color, content) => {
        setTimelineItemsAditivo(prevItems => [...prevItems || [], { 
            color, 
            children: content,
        }]);
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
    ];

    const justificativaItemsTerceira = [
        { value: 'Almoço', label: 'Almoço' },
        { value: 'Pausa', label: 'Pausa' },
        { value: 'Erro de EC no Login', label: 'Erro de EC no Login' },
        { value: 'Funcionário não encontrado', label: 'Funcionário não encontrado' },
        { value: 'Falta de cardápio', label: 'Falta de cardápio' },
        { value: 'Horário errado', label: 'Horário errado' }
    ];

    const iniciarEtapa = async (etapa) => {
        switch (etapa) {
            case 'primeira':
                if (firstTimeRunningPrimeira === true) {
                    setFirstTimeRunningPrimeira(false);
                }
                setPrimeiraEtapaRunning(true);
                break;

            case 'segunda':
                if (firstTimeRunningSegunda === true) {
                    setFirstTimeRunningSegunda(false);
                }
                setSegundaEtapaRunning(true);
                break;

            case 'terceira':
                if (firstTimeRunningTerceira === true) {
                    setFirstTimeRunningTerceira(false);
                }
                setTerceiraEtapaRunning(true);
                break;

            case 'quarta':
                if (firstTimeRunningQuarta === true) {
                    setFirstTimeRunningQuarta(false);
                }
                setQuartaEtapaRunning(true);
                break;
        }

        try {
            setLoading(true);
            if (firstTimeRunningPrimeira === true && etapa === 'primeira' || 
                firstTimeRunningSegunda === true && etapa === 'segunda' || 
                firstTimeRunningTerceira === true && etapa === 'terceira' || 
                firstTimeRunningQuarta === true && etapa === 'quarta') {
                
                await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/iniciarEtapa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        etapa: etapa, 
                        user: localStorage.getItem("currentUser"), 
                        pipeId: pipeId, 
                        aditivo: aditivo 
                    })
                });
                console.log(`Etapa ${etapa} iniciada com sucesso.`);
                handleEtapa(etapa, 'start');
                openNotificationSucess(`${etapa} etapa iniciada.`);
            } else {
                await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/retomarEtapa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ etapa: etapa, pipeId: pipeId })
                });
                console.log(`Etapa ${etapa} retomada com sucesso.`);
                handleEtapa(etapa, 'resume');
                openNotificationSucess(`${etapa} etapa retomada.`);
            }
        } catch (error) {
            console.error("Erro ao iniciar etapa:", error);
            openNotificationFailure(`Erro ao iniciar etapa ${etapa}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const iniciarEtapaAditivo = async (etapa) => {
        switch (etapa) {
            case 'primeira':
                if (firstTimeRunningPrimeiraAditivo === true) {
                    setFirstTimeRunningPrimeiraAditivo(false);
                }
                setPrimeiraEtapaRunningAditivo(true);
                break;

            case 'segunda':
                if (firstTimeRunningSegundaAditivo === true) {
                    setFirstTimeRunningSegundaAditivo(false);
                }
                setSegundaEtapaRunningAditivo(true);
                break;

            case 'terceira':
                if (firstTimeRunningTerceiraAditivo === true) {
                    setFirstTimeRunningTerceiraAditivo(false);
                }
                setTerceiraEtapaRunningAditivo(true);
                break;

            case 'quarta':
                if (firstTimeRunningQuartaAditivo === true) {
                    setFirstTimeRunningQuartaAditivo(false);
                }
                setQuartaEtapaRunningAditivo(true);
                break;
        }

        try {
            setLoading(true);
            if (firstTimeRunningPrimeiraAditivo === true && etapa === 'primeira' || 
                firstTimeRunningSegundaAditivo === true && etapa === 'segunda' || 
                firstTimeRunningTerceiraAditivo === true && etapa === 'terceira' || 
                firstTimeRunningQuartaAditivo === true && etapa === 'quarta') {
                
                await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/iniciarEtapaAditivo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        etapa: etapa, 
                        user: localStorage.getItem("currentUser"), 
                        pipeId: pipeId, 
                        novoAditivo: newAditivo 
                    })
                });
                console.log(`Etapa ${etapa} iniciada com sucesso.`);
                handleEtapaAditivo(etapa, 'start');
                openNotificationSucess(`${etapa} etapa iniciada.`);
                setNewAditivo(false);
            } else {
                await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/retomarEtapaAditivo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ etapa: etapa, pipeId: pipeId })
                });
                console.log(`Etapa ${etapa} retomada com sucesso.`);
                handleEtapaAditivo(etapa, 'resume');
                openNotificationSucess(`${etapa} etapa retomada.`);
            }
        } catch (error) {
            console.error("Erro ao iniciar etapa:", error);
            openNotificationFailure(`Erro ao iniciar etapa ${etapa}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const interromperEtapa = async (etapa) => {
        if (justificativa === '') {
            openNotificationFailure('Selecione a justificativa para continuar.');
            return;
        }
        
        switch (etapa) {
            case 'primeira':
                setPrimeiraEtapaRunning(false);
                break;
            case 'segunda':
                setSegundaEtapaRunning(false);
                break;
            case 'terceira':
                setTerceiraEtapaRunning(false);
                break;
            case 'quarta':
                setQuartaEtapaRunning(false);
                break;
        }

        try {
            setLoading(true);
            await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/interromperEtapa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ etapa: etapa, justificativa: justificativa, pipeId: pipeId })
            });
            console.log(`Etapa ${etapa} interrompida com sucesso.`);
            handleEtapa(etapa, 'interrupt');
            openNotificationSucess(`${etapa} etapa interrompida.`);
        } catch (error) {
            console.error("Erro ao interromper etapa:", error);
            openNotificationFailure(`Erro ao interromper etapa ${etapa}: ${error.message}`);
        } finally {
            setJustificativa('');
            setLoading(false);
        }
    };

    const interromperEtapaAditivo = async (etapa) => {
        if (justificativa === '') {
            openNotificationFailure('Selecione a justificativa para continuar.');
            return;
        }
        
        switch (etapa) {
            case 'primeira':
                setPrimeiraEtapaRunningAditivo(false);
                break;
            case 'segunda':
                setSegundaEtapaRunningAditivo(false);
                break;
            case 'terceira':
                setTerceiraEtapaRunningAditivo(false);
                break;
            case 'quarta':
                setQuartaEtapaRunningAditivo(false);
                break;
        }

        try {
            setLoading(true);
            await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/interromperEtapaAditivo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ etapa: etapa, justificativa: justificativa, pipeId: pipeId })
            });
            console.log(`Etapa ${etapa} interrompida com sucesso.`);
            handleEtapaAditivo(etapa, 'interrupt');
            openNotificationSucess(`${etapa} etapa interrompida.`);
        } catch (error) {
            console.error("Erro ao interromper etapa:", error);
            openNotificationFailure(`Erro ao interromper etapa ${etapa}: ${error.message}`);
        } finally {
            setJustificativa('');
            setLoading(false);
        }
    };

    const finalizarEtapa = async (etapa) => {
        switch (etapa) {
            case 'primeira':
                setPrimeiraEtapaRunning(false);
                setPrimeiraEtapaFinalizada(true);
                break;
            case 'segunda':
                setSegundaEtapaRunning(false);
                setSegundaEtapaFinalizada(true);
                break;
            case 'terceira':
                setTerceiraEtapaRunning(false);
                setTerceiraEtapaFinalizada(true);
                break;
            case 'quarta':
                setQuartaEtapaRunning(false);
                setQuartaEtapaFinalizada(true);
                break;
        }

        try {
            setLoading(true);
            await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/finalizarEtapa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ etapa: etapa, pipeId: pipeId })
            });
            console.log(`Etapa ${etapa} finalizada com sucesso.`);
            handleEtapa(etapa, 'finish');
            openNotificationSucess(`${etapa} etapa finalizada.`);
        } catch (error) {
            console.error("Erro ao finalizar etapa:", error);
            openNotificationFailure(`Erro ao finalizar etapa ${etapa}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const finalizarEtapaAditivo = async (etapa) => {
        switch (etapa) {
            case 'primeira':
                setPrimeiraEtapaRunningAditivo(false);
                setPrimeiraEtapaFinalizadaAditivo(true);
                break;
            case 'segunda':
                setSegundaEtapaRunningAditivo(false);
                setSegundaEtapaFinalizadaAditivo(true);
                break;
            case 'terceira':
                setTerceiraEtapaRunningAditivo(false);
                setTerceiraEtapaFinalizadaAditivo(true);
                break;
            case 'quarta':
                setQuartaEtapaRunningAditivo(false);
                setQuartaEtapaFinalizadaAditivo(true);
                break;
        }

        try {
            setLoading(true);
            await fetch("https://southamerica-east1-zops-mobile.cloudfunctions.net/finalizarEtapaAditivo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    etapa: etapa, 
                    pipeId: pipeId, 
                    user: localStorage.getItem('currentUser') 
                })
            });
            console.log(`Etapa ${etapa} finalizada com sucesso.`);
            handleEtapaAditivo(etapa, 'finish');
            openNotificationSucess(`${etapa} etapa finalizada.`);
        } catch (error) {
            console.error("Erro ao finalizar etapa:", error);
            openNotificationFailure(`Erro ao finalizar etapa ${etapa}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const sendToClickup = async () => {
        try {
            setSyncing(true);
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docId: `pipeId_${pipeId}`, url: 'pipe' })
            });
            const data = await response.json();

            const tempoTotal = (data.setup.primeira_etapa.horaFim - data.setup.primeira_etapa.horaInicio) + 
                              (data.setup.terceira_etapa.horaFim - data.setup.terceira_etapa.horaInicio) + 
                              (data.setup.segunda_etapa.horaFim - data.setup.segunda_etapa.horaInicio) + 
                              (data.setup.quarta_etapa.horaFim - data.setup.quarta_etapa.horaInicio);

            let tempoInterrompido = 0;
            if (data.setup.primeira_etapa.interruptions) {
                for (const interruption of data.setup.primeira_etapa.interruptions) {
                    if (interruption.justificativa !== 'Almoço') {
                        tempoInterrompido += interruption.horaFim - interruption.horaInicio;
                    }
                }
            }
            if (data.setup.segunda_etapa.interruptions) {
                for (const interruption of data.setup.segunda_etapa.interruptions) {
                    if (interruption.justificativa !== 'Almoço') {
                        tempoInterrompido += interruption.horaFim - interruption.horaInicio;
                    }
                }
            }
            if (data.setup.terceira_etapa.interruptions) {
                for (const interruption of data.setup.terceira_etapa.interruptions) {
                    if (interruption.justificativa !== 'Almoço') {
                        tempoInterrompido += interruption.horaFim - interruption.horaInicio;
                    }
                }
            }
            if (data.setup.quarta_etapa.interruptions) {
                for (const interruption of data.setup.quarta_etapa.interruptions) {
                    if (interruption.justificativa !== 'Almoço') {
                        tempoInterrompido += interruption.horaFim - interruption.horaInicio;
                    }
                }
            }

            const token = 'pk_89229936_3NFZ3NSHS6PQ4JOXR6P3YDVI0R0BTCWE';

            const responseTempoTotal = await fetch(`https://api.clickup.com/api/v2/task/${data.taskId}/field/${tempoSetupFieldId}`, {
                method: 'POST',
                headers: { 
                    "Authorization": `${token}`, 
                    "Content-Type": "application/json", 
                    "accept": "application/json" 
                },
                body: JSON.stringify({ value: `${(tempoTotal / 60000).toFixed(0)} minutos` })
            });

            const responseTempoInterrompido = await fetch(`https://api.clickup.com/api/v2/task/${data.taskId}/field/${tempoInterrompidoFieldId}`, {
                method: 'POST',
                headers: { 
                    "Authorization": `${token}`, 
                    "Content-Type": "application/json", 
                    "accept": "application/json" 
                },
                body: JSON.stringify({ value: `${(tempoInterrompido / 60000).toFixed(0)} minutos` })
            });

            openNotificationSucess('Dados sincronizados com Clickup com sucesso!');
        } catch (error) {
            console.error("Erro ao sincronizar com Clickup:", error);
            openNotificationFailure(`Erro ao sincronizar com Clickup: ${error.message}`);
        } finally {
            setSyncing(false);
        }
    };

    const novoAditivo = () => {
        setFirstTimeRunningPrimeiraAditivo(true);
        setFirstTimeRunningSegundaAditivo(true);
        setFirstTimeRunningTerceiraAditivo(true);
        setFirstTimeRunningQuartaAditivo(true);
        setPrimeiraEtapaFinalizadaAditivo(false);
        setSegundaEtapaFinalizadaAditivo(false);
        setTerceiraEtapaFinalizadaAditivo(false);
        setQuartaEtapaFinalizadaAditivo(false);
        setPrimeiraEtapaRunningAditivo(false);
        setSegundaEtapaRunningAditivo(false);
        setTerceiraEtapaRunningAditivo(false);
        setQuartaEtapaRunningAditivo(false);
        setNewAditivo(true);
        openNotificationSucess('Novo aditivo iniciado!');
    };

    // Function to fetch timeline data
    const fetchTimelineData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docId: `pipeId_${pipeId}`, url: 'pipe' })
            });
            
            const data = await response.json();
            
            // Update setup timeline
            if (data.timelineSetup && data.timelineSetup.length > 0) {
                setTimelineItems(data.timelineSetup);
            }
            
            // Update aditivo timeline
            if (data.timelineSetupAditivo && data.timelineSetupAditivo.length > 0) {
                setTimelineItemsAditivo(data.timelineSetupAditivo);
            }
            
            // Update etapa states for setup
            if (data.setup) {
                // First Etapa
                if (data.setup.primeira_etapa) {
                    if (!data.setup.primeira_etapa.horaFim) {
                        setFirstTimeRunningPrimeira(false);
                        
                        // Check if there are interruptions and if the last one is not finished
                        if (data.setup.primeira_etapa.interruptions && 
                            data.setup.primeira_etapa.interruptions.length > 0 && 
                            !data.setup.primeira_etapa.interruptions[data.setup.primeira_etapa.interruptions.length - 1].horaFim) {
                            // Interrupted state
                            setPrimeiraEtapaRunning(false);
                        } else {
                            // Running state
                            setPrimeiraEtapaRunning(true);
                        }
                    } else {
                        // Finished state
                        setPrimeiraEtapaFinalizada(true);
                    }
                }
                
                // Second Etapa
                if (data.setup.segunda_etapa) {
                    if (!data.setup.segunda_etapa.horaFim) {
                        setFirstTimeRunningSegunda(false);
                        
                        // Check if there are interruptions and if the last one is not finished
                        if (data.setup.segunda_etapa.interruptions && 
                            data.setup.segunda_etapa.interruptions.length > 0 && 
                            !data.setup.segunda_etapa.interruptions[data.setup.segunda_etapa.interruptions.length - 1].horaFim) {
                            // Interrupted state
                            setSegundaEtapaRunning(false);
                        } else {
                            // Running state
                            setSegundaEtapaRunning(true);
                        }
                    } else {
                        // Finished state
                        setSegundaEtapaFinalizada(true);
                    }
                }
                
                // Third Etapa
                if (data.setup.terceira_etapa) {
                    if (!data.setup.terceira_etapa.horaFim) {
                        setFirstTimeRunningTerceira(false);
                        
                        // Check if there are interruptions and if the last one is not finished
                        if (data.setup.terceira_etapa.interruptions && 
                            data.setup.terceira_etapa.interruptions.length > 0 && 
                            !data.setup.terceira_etapa.interruptions[data.setup.terceira_etapa.interruptions.length - 1].horaFim) {
                            // Interrupted state
                            setTerceiraEtapaRunning(false);
                        } else {
                            // Running state
                            setTerceiraEtapaRunning(true);
                        }
                    } else {
                        // Finished state
                        setTerceiraEtapaFinalizada(true);
                    }
                }
                
                // Fourth Etapa
                if (data.setup.quarta_etapa) {
                    if (!data.setup.quarta_etapa.horaFim) {
                        setFirstTimeRunningQuarta(false);
                        
                        // Check if there are interruptions and if the last one is not finished
                        if (data.setup.quarta_etapa.interruptions && 
                            data.setup.quarta_etapa.interruptions.length > 0 && 
                            !data.setup.quarta_etapa.interruptions[data.setup.quarta_etapa.interruptions.length - 1].horaFim) {
                            // Interrupted state
                            setQuartaEtapaRunning(false);
                        } else {
                            // Running state
                            setQuartaEtapaRunning(true);
                        }
                    } else {
                        // Finished state
                        setQuartaEtapaFinalizada(true);
                    }
                }
            }
            
            // Update etapa states for aditivo
            if (data.setupAditivo && data.setupAditivo.length > 0) {
                const lastAditivo = data.setupAditivo[data.setupAditivo.length - 1];
                
                // First Etapa
                if (lastAditivo.primeira_etapa) {
                    if (!lastAditivo.primeira_etapa.horaFim) {
                        setFirstTimeRunningPrimeiraAditivo(false);
                        
                        // Check if there are interruptions and if the last one is not finished
                        // Note the property name difference: 'interrupcoes' vs 'interruptions'
                        if (lastAditivo.primeira_etapa.interrupcoes && 
                            lastAditivo.primeira_etapa.interrupcoes.length > 0 && 
                            !lastAditivo.primeira_etapa.interrupcoes[lastAditivo.primeira_etapa.interrupcoes.length - 1].horaFim) {
                            // Interrupted state
                            setPrimeiraEtapaRunningAditivo(false);
                        } else {
                            // Running state
                            setPrimeiraEtapaRunningAditivo(true);
                        }
                    } else {
                        // Finished state
                        setFirstTimeRunningPrimeiraAditivo(false);
                        setPrimeiraEtapaFinalizadaAditivo(true);
                    }
                }
                
                // Second Etapa
                if (lastAditivo.segunda_etapa) {
                    if (!lastAditivo.segunda_etapa.horaFim) {
                        setFirstTimeRunningSegundaAditivo(false);
                        
                        // Check if there are interruptions and if the last one is not finished
                        if (lastAditivo.segunda_etapa.interrupcoes && 
                            lastAditivo.segunda_etapa.interrupcoes.length > 0 && 
                            !lastAditivo.segunda_etapa.interrupcoes[lastAditivo.segunda_etapa.interrupcoes.length - 1].horaFim) {
                            // Interrupted state
                            setSegundaEtapaRunningAditivo(false);
                        } else {
                            // Running state
                            setSegundaEtapaRunningAditivo(true);
                        }
                    } else {
                        // Finished state
                        setFirstTimeRunningSegundaAditivo(false);
                        setSegundaEtapaFinalizadaAditivo(true);
                    }
                }
                
                // Third Etapa
                if (lastAditivo.terceira_etapa) {
                    if (!lastAditivo.terceira_etapa.horaFim) {
                        setFirstTimeRunningTerceiraAditivo(false);
                        
                        // Check if there are interruptions and if the last one is not finished
                        if (lastAditivo.terceira_etapa.interrupcoes && 
                            lastAditivo.terceira_etapa.interrupcoes.length > 0 && 
                            !lastAditivo.terceira_etapa.interrupcoes[lastAditivo.terceira_etapa.interrupcoes.length - 1].horaFim) {
                            // Interrupted state
                            setTerceiraEtapaRunningAditivo(false);
                        } else {
                            // Running state
                            setTerceiraEtapaRunningAditivo(true);
                        }
                    } else {
                        // Finished state
                        setFirstTimeRunningTerceiraAditivo(false);
                        setTerceiraEtapaFinalizadaAditivo(true);
                    }
                }
                
                // Fourth Etapa
                if (lastAditivo.quarta_etapa) {
                    if (!lastAditivo.quarta_etapa.horaFim) {
                        setFirstTimeRunningQuartaAditivo(false);
                        
                        // Check if there are interruptions and if the last one is not finished
                        if (lastAditivo.quarta_etapa.interrupcoes && 
                            lastAditivo.quarta_etapa.interrupcoes.length > 0 && 
                            !lastAditivo.quarta_etapa.interrupcoes[lastAditivo.quarta_etapa.interrupcoes.length - 1].horaFim) {
                            // Interrupted state
                            setQuartaEtapaRunningAditivo(false);
                        } else {
                            // Running state
                            setQuartaEtapaRunningAditivo(true);
                        }
                    } else {
                        // Finished state
                        setFirstTimeRunningQuartaAditivo(false);
                        setQuartaEtapaFinalizadaAditivo(true);
                    }
                }
            }
            
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    }, [pipeId]);

    // Save timeline to database
    useEffect(() => {
        const saveTimeline = async () => {
            if (timelineItems.length > 0) {
                try {
                    await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ docId: `pipeId_${pipeId}`, data: { timelineSetup: timelineItems } })
                    });
                    console.log('Timeline saved successfully');
                } catch (error) {
                    console.error("Error saving timeline:", error);
                }
            }
        };

        saveTimeline();
    }, [timelineItems, pipeId]);

    // Save aditivo timeline to database
    useEffect(() => {
        const saveTimeline = async () => {
            if (timelineItemsAditivo.length > 0) {
                try {
                    await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ docId: `pipeId_${pipeId}`, data: { timelineSetupAditivo: timelineItemsAditivo } })
                    });
                    console.log('Aditivo timeline saved successfully');
                } catch (error) {
                    console.error("Error saving aditivo timeline:", error);
                }
            }
        };

        saveTimeline();
    }, [timelineItemsAditivo, pipeId]);

    // Fetch data initially and setup auto-refresh
    useEffect(() => {
        if (!pipeId) return;
        
        // Initial data fetch
        fetchTimelineData();
        
        // Set up an interval to fetch data every 15 seconds
        const intervalId = setInterval(() => {
            fetchTimelineData();
        }, 15000);
        
        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [pipeId, fetchTimelineData]);

    // Check permission and redirect if necessary
    useEffect(() => {
        if (permission !== 'config' && permission !== 'admin') {
            navigate(`/plano?pipeId=${pipeId}`);
        }
    }, [permission, navigate, pipeId]);

    // Render etapa button
    const renderEtapaButton = (
        etapa, 
        isRunning, 
        isFinalizada, 
        isFirstTime, 
        isPreviousEtapaFirstTime, 
        iniciarFunc, 
        interromperFunc, 
        finalizarFunc, 
        justificativaOptions
    ) => {
        let etapaName;
        switch(etapa) {
            case 'primeira': etapaName = '1ª Etapa'; break;
            case 'segunda': etapaName = '2ª Etapa'; break;
            case 'terceira': etapaName = '3ª Etapa'; break;
            case 'quarta': etapaName = '4ª Etapa'; break;
            default: etapaName = etapa;
        }
        
        return (
            <Card 
                title={etapaName} 
                size="small" 
                className={`etapa-card ${isRunning ? 'running' : ''} ${isFinalizada ? 'finished' : ''}`}
                style={{ 
                    width: '23%', 
                    borderLeft: isRunning ? '4px solid #1890ff' : isFinalizada ? '4px solid #52c41a' : '4px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                }}
                headStyle={{ 
                    backgroundColor: isRunning ? '#e6f7ff' : isFinalizada ? '#f6ffed' : '#f9f9f9',
                    borderBottom: isRunning ? '1px solid #91d5ff' : isFinalizada ? '1px solid #b7eb8f' : '1px solid #f0f0f0'
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    {isRunning ? (
                        <Button 
                            type="primary" 
                            danger
                            icon={<PauseCircleOutlined />}
                            disabled={isFinalizada} 
                            onClick={() => interromperFunc(etapa)} 
                            loading={loading}
                            block
                        >
                            Interromper
                        </Button>
                    ) : (
                        <Button 
                            type="primary" 
                            icon={<PlayCircleOutlined />}
                            disabled={isFinalizada || isPreviousEtapaFirstTime} 
                            onClick={() => iniciarFunc(etapa)} 
                            loading={loading}
                            block
                        >
                            {isFirstTime ? 'Iniciar' : 'Retomar'}
                        </Button>
                    )}
                    
                    {isRunning && (
                        <Select 
                            placeholder="Selecione a justificativa" 
                            options={justificativaOptions} 
                            onSelect={(value) => setJustificativa(value)}
                            style={{ width: '100%' }}
                        />
                    )}
                    
                    <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />}
                        disabled={isFinalizada || isFirstTime || (etapa !== 'primeira' && isPreviousEtapaFirstTime)} 
                        onClick={() => finalizarFunc(etapa)} 
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        loading={loading}
                        block
                    >
                        Finalizar
                    </Button>
                </Space>
            </Card>
        );
    };

    // Tab items configuration
    const tabItems = [
        {
            label: (
                <span>
                    <ClockCircleOutlined />
                    Setup
                </span>
            ),
            key: '1',
            children: (
                <div style={{ padding: '20px' }}>
                    <Card 
                        title={
                            <Flex justify="space-between" align="center">
                                <Title level={4} style={{ margin: 0 }}>Controle de Etapas - Setup</Title>
                                <Space>
                                    {lastUpdated && (
                                        <Tooltip title="Data da última atualização">
                                            <Text type="secondary">
                                                <SyncOutlined spin={loading} /> Atualizado: {formatDateTime(lastUpdated)}
                                            </Text>
                                        </Tooltip>
                                    )}
                                    <Button 
                                        type="primary"
                                        icon={<SyncOutlined spin={syncing} />}
                                        onClick={fetchTimelineData}
                                        loading={loading && !syncing}
                                    >
                                        Atualizar Dados
                                    </Button>
                                </Space>
                            </Flex>
                        }
                        extra={
                            <Button 
                                type="primary"
                                onClick={sendToClickup}
                                disabled={!(primeiraEtapaFinalizada && segundaEtapaFinalizada && terceiraEtapaFinalizada && quartaEtapaFinalizada)}
                                loading={syncing}
                                icon={<SyncOutlined spin={syncing} />}
                            >
                                Sincronizar com Clickup
                            </Button>
                        }
                        style={{ 
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            marginBottom: '20px'
                        }}
                    >
                        <Flex justify="space-between" wrap="nowrap" gap="middle">
                            {renderEtapaButton(
                                'primeira',
                                primeiraEtapaRunning,
                                primeiraEtapaFinalizada,
                                firstTimeRunningPrimeira,
                                false,
                                iniciarEtapa,
                                interromperEtapa,
                                finalizarEtapa,
                                justificativaItems
                            )}
                            
                            {renderEtapaButton(
                                'segunda',
                                segundaEtapaRunning,
                                segundaEtapaFinalizada,
                                firstTimeRunningSegunda,
                                firstTimeRunningPrimeira,
                                iniciarEtapa,
                                interromperEtapa,
                                finalizarEtapa,
                                justificativaItems
                            )}
                            
                            {renderEtapaButton(
                                'terceira',
                                terceiraEtapaRunning,
                                terceiraEtapaFinalizada,
                                firstTimeRunningTerceira,
                                firstTimeRunningSegunda,
                                iniciarEtapa,
                                interromperEtapa,
                                finalizarEtapa,
                                justificativaItemsTerceira
                            )}
                            
                            {renderEtapaButton(
                                'quarta',
                                quartaEtapaRunning,
                                quartaEtapaFinalizada,
                                firstTimeRunningQuarta,
                                firstTimeRunningTerceira,
                                iniciarEtapa,
                                interromperEtapa,
                                finalizarEtapa,
                                justificativaItems
                            )}
                        </Flex>
                    </Card>
                    
                    <Flex gap="large">
                        <Card 
                            title={<Text strong>Linha do Tempo - Setup</Text>}
                            style={{ 
                                width: '100%', 
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                            }}
                            bodyStyle={{ 
                                maxHeight: '60vh', 
                                overflowY: 'auto', 
                                padding: '10px 20px' 
                            }}
                        >
                            {timelineItems && timelineItems.length > 0 ? (
                                <Timeline
                                    items={timelineItems}
                                />
                            ) : (
                                <Flex justify="center" align="center" style={{ height: '100px' }}>
                                    <Text type="secondary">Nenhum evento registrado</Text>
                                </Flex>
                            )}
                        </Card>
                    </Flex>
                </div>
            )
        },
        {
            label: (
                <span>
                    <Badge count={timelineItemsAditivo?.length || 0} showZero={false} size="small">
                        <ClockCircleOutlined />
                        Aditivo
                    </Badge>
                </span>
            ),
            key: '2',
            children: (
                <div style={{ padding: '20px' }}>
                    <Card 
                        title={
                            <Flex justify="space-between" align="center">
                                <Title level={4} style={{ margin: 0 }}>Controle de Etapas - Aditivo</Title>
                                <Space>
                                    {lastUpdated && (
                                        <Tooltip title="Data da última atualização">
                                            <Text type="secondary">
                                                <SyncOutlined spin={loading} /> Atualizado: {formatDateTime(lastUpdated)}
                                            </Text>
                                        </Tooltip>
                                    )}
                                    <Button 
                                        type="primary"
                                        icon={<SyncOutlined spin={syncing} />}
                                        onClick={fetchTimelineData}
                                        loading={loading && !syncing}
                                    >
                                        Atualizar Dados
                                    </Button>
                                </Space>
                            </Flex>
                        }
                        extra={
                            <Space>
                                <Button 
                                    type="primary"
                                    onClick={novoAditivo}
                                    disabled={!(primeiraEtapaFinalizadaAditivo && segundaEtapaFinalizadaAditivo && terceiraEtapaFinalizadaAditivo && quartaEtapaFinalizadaAditivo) && timelineItemsAditivo?.length > 0}
                                    icon={<ReloadOutlined />}
                                >
                                    Iniciar Novo Aditivo
                                </Button>
                                <Button 
                                    type="primary"
                                    onClick={sendToClickup}
                                    disabled={!(primeiraEtapaFinalizadaAditivo && segundaEtapaFinalizadaAditivo && terceiraEtapaFinalizadaAditivo && quartaEtapaFinalizadaAditivo)}
                                    loading={syncing}
                                    icon={<SyncOutlined spin={syncing} />}
                                >
                                    Sincronizar com Clickup
                                </Button>
                            </Space>
                        }
                        style={{ 
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            marginBottom: '20px'
                        }}
                    >
                        <Flex justify="space-between" wrap="nowrap" gap="middle">
                            {renderEtapaButton(
                                'primeira',
                                primeiraEtapaRunningAditivo,
                                primeiraEtapaFinalizadaAditivo,
                                firstTimeRunningPrimeiraAditivo,
                                false,
                                iniciarEtapaAditivo,
                                interromperEtapaAditivo,
                                finalizarEtapaAditivo,
                                justificativaItems
                            )}
                            
                            {renderEtapaButton(
                                'segunda',
                                segundaEtapaRunningAditivo,
                                segundaEtapaFinalizadaAditivo,
                                firstTimeRunningSegundaAditivo,
                                firstTimeRunningPrimeiraAditivo,
                                iniciarEtapaAditivo,
                                interromperEtapaAditivo,
                                finalizarEtapaAditivo,
                                justificativaItems
                            )}
                            
                            {renderEtapaButton(
                                'terceira',
                                terceiraEtapaRunningAditivo,
                                terceiraEtapaFinalizadaAditivo,
                                firstTimeRunningTerceiraAditivo,
                                firstTimeRunningSegundaAditivo,
                                iniciarEtapaAditivo,
                                interromperEtapaAditivo,
                                finalizarEtapaAditivo,
                                justificativaItemsTerceira
                            )}
                            
                            {renderEtapaButton(
                                'quarta',
                                quartaEtapaRunningAditivo,
                                quartaEtapaFinalizadaAditivo,
                                firstTimeRunningQuartaAditivo,
                                firstTimeRunningTerceiraAditivo,
                                iniciarEtapaAditivo,
                                interromperEtapaAditivo,
                                finalizarEtapaAditivo,
                                justificativaItems
                            )}
                        </Flex>
                    </Card>
                    
                    <Flex gap="large">
                        <Card 
                            title={<Text strong>Linha do Tempo - Aditivo</Text>}
                            style={{ 
                                width: '100%', 
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                            }}
                            bodyStyle={{ 
                                maxHeight: '60vh', 
                                overflowY: 'auto', 
                                padding: '10px 20px' 
                            }}
                        >
                            {timelineItemsAditivo && timelineItemsAditivo.length > 0 ? (
                                <Timeline
                                    items={timelineItemsAditivo}
                                />
                            ) : (
                                <Flex justify="center" align="center" style={{ height: '100px' }}>
                                    <Text type="secondary">Nenhum evento registrado para aditivo</Text>
                                </Flex>
                            )}
                        </Card>
                    </Flex>
                </div>
            )
        }
    ];

    return (
        <>
            {contextHolder}
            <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
                <Tabs
                    defaultActiveKey='1'
                    items={tabItems}
                    type="card"
                    style={{
                        background: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        padding: '16px'
                    }}
                />
            </div>
                
            <style jsx>{`
                .etapa-card.running {
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
                    }
                }
                
                .etapa-card.finished {
                    opacity: 0.8;
                }
            `}</style>
        </>
    );
};

export default Cronometro;