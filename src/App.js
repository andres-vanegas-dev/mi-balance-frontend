import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import IngresosPage from './components/IngresosPage';
import GastosPage from './components/GastosPage';
import RecordatoriosPage from './components/RecordatoriosPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ingresos" element={<IngresosPage />} />
              <Route path="/gastos" element={<GastosPage />} />
              <Route path="/recordatorios" element={<RecordatoriosPage />} />
            </Routes>
          </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;