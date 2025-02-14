import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

const Root = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("isAuthenticated") === "true");

  return (
      <StrictMode>
          <BrowserRouter>
              <App isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
          </BrowserRouter>
      </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Root />);
