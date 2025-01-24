import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ModalPonto.css';

const ModalPonto = ({ toggleModal }) => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const [location, setLocation] = useState(null);

    const [nome, setNome] = useState('');
    const [funcao, setFuncao] = useState('N/A');
    const [operacaoPonto, setOperacaoPonto] = useState('N/A');
    const [equipeOptions, setEquipeOptions] = useState([]);

    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ latitude, longitude });
                        sessionStorage.setItem(
                            'userLocation',
                            JSON.stringify({ latitude, longitude })
                        );
                    },
                    (error) => {
                        console.error(`Error getting location: ${error.message}`);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 300000,
                    }
                );
            } else {
                console.log('Geolocation is not supported by this browser.');
            }
        };

        const cachedLocation = sessionStorage.getItem('userLocation');
        if (cachedLocation) {
            setLocation(JSON.parse(cachedLocation));
        } else {
            getLocation();
        }

        const fetchEquipeOptions = async () => {
            try {
                const response = await fetch(
                    'https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ url: `equipeTecnica` }),
                    }
                );

                const querySnapshot = await response.json();
                const sectors = new Set();

                querySnapshot.docs.forEach((doc) => {
                    const data = doc.data;
                    if (data.nome) {
                        sectors.add(data.nome);
                    }
                });

                setEquipeOptions(Array.from(sectors));
            } catch (error) {
                console.error(`Error fetching equipe options: ${error.message}`);
            }
        };

        fetchEquipeOptions();
    }, []);

    const adicionarPonto = async () => {
        if (!location) {
            alert('Localização não disponível. Tente novamente.');
            return;
        } else if(!equipeOptions.includes(nome)) {
            alert('Selecione seu nome na lista e tente novamente.');
            return;
        }

        const formData = {
            nome,
            [`localizacao_${operacaoPonto}`]: [location.latitude, location.longitude],
            funcao,
        };

        const now = new Date();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const currentTimeString = now.toLocaleDateString('pt-BR', options) + ' ' + now.toLocaleTimeString('pt-BR');

        if (operacaoPonto === 'retirada') {
            formData.retirada = currentTimeString;
        } else {
            formData.entrada = currentTimeString;
        }

        try {
            const collectionURL = `pipe/pipeId_${pipeId}/controlePonto`;
            await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/addDoc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ collectionURL, formData }),
            });

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            alert(`Erro ao registrar novo ponto: ${error}`);
        }
    };

    return (
        <div className="modal-bg" onClick={toggleModal}>
            <div className="modal-ponto" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <h2>Modal Ponto</h2>

                    <label>Nome:</label>
                    <input
                        type="text"
                        id="searchNomePonto"
                        list="inputNomePonto"
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <datalist id="inputNomePonto">
                        {equipeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </datalist>

                    <label>Função:</label>
                    <select
                        value={funcao}
                        onChange={(e) => setFuncao(e.target.value)}
                    >
                        <option value="N/A">Selecione</option>
                        <option value="tecnico">Técnico</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="c-cco">C-CCO</option>
                        <option value="c-rh">Coordenador de RH</option>
                        <option value="tec-rh">Técnico de RH</option>
                        <option value="estoque">Estoque</option>
                        <option value="c-controle">Coordenador de Controle</option>
                        <option value="head">Head</option>
                    </select>

                    <label>Horário:</label>
                    <select
                        value={operacaoPonto}
                        onChange={(e) => setOperacaoPonto(e.target.value)}
                    >
                        <option value="N/A">Selecione</option>
                        <option value="retirada">Retirada de Equipamentos no Escritório</option>
                        <option value="entrada">Chegada no evento</option>
                    </select>

                    <div className="row">
                        <button className="modal-ponto-button" onClick={toggleModal}>
                            Fechar
                        </button>
                        <button className="modal-ponto-button" onClick={adicionarPonto}>
                            Adicionar Novo Ponto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalPonto;

