import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Menu.css';

function Menu({ toggleMenu ,className }) {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');
    const navigate = useNavigate();

    return (
        <div className={className}>
            <img src="/logos/logo_zig_blue.png" className='logo' alt="Logo Zig" />
            <ul>
                <li onClick={() => navigate('/ponto' + `?pipeId=${pipeId || '0'}`)}>Controle de Ponto</li>
                <li onClick={() => navigate('/plano' + `?pipeId=${pipeId || '0'}`)}>Plano Operacional</li>
                <li onClick={() => navigate('/cartao' + `?pipeId=${pipeId || '0'}`)}>Protocolo de Cartões</li>
                <li onClick={() => navigate('/fechamento' + `?pipeId=${pipeId || '0'}`)}>Fechamento Operacional</li>
                <li onClick={() => navigate('/chat' + `?pipeId=${pipeId || '0'}`)}>GPT-Z</li>
            </ul>
        </div>
    );
}

export default Menu;