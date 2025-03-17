import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import ForceDesktopView from './ForceDesktopView';

const Root = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("isAuthenticated") === "true");

    return (
        <StrictMode>
            <HashRouter>
                <ForceDesktopView />
                <App isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
            </HashRouter>
        </StrictMode>
    );
};

createRoot(document.getElementById('root')).render(<Root />);
