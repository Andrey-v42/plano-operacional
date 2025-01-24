import React, { useState, useMemo, useEffect } from 'react';
import './Header.css';
import Menu from './Menu.jsx';

const Header = () => {
    const [title, setTitle] = useState('Nome do Evento');

    const [menuOpen, setMenuOpen] = React.useState(false);

    const toggleMenu = () => {
        setMenuOpen((prevState) => !prevState);
    };

    return (
        <header>
            <div className="header">
                <img src="/logos/logo_zig_white.png" className='logo' alt="Logo Zig" />
                <h1>{title}</h1>
                <img src="/icons/list.svg" onClick={toggleMenu} className='icon' alt="Menu" />
            <Menu toggleMenu={toggleMenu} className={menuOpen ? 'menu open' : 'menu'} />
            </div>
        </header>
    );
};

export default Header;