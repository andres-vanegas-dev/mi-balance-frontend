import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

function Dashboard() {
  const { theme } = useTheme();
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [balance, setBalance] = useState({ ingresos: 0, gastos: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definir la URL base de la API
  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ingresosRes, gastosRes, balanceRes, recordatoriosRes] = await Promise.all([
          axios.get(`${API_BASE}/ingresos`),
          axios.get(`${API_BASE}/gastos`),
          axios.get(`${API_BASE}/balance`),
          axios.get(`${API_BASE}/recordatorios`)
        ]);
        setIngresos(ingresosRes.data);
        setGastos(gastosRes.data);
        setBalance(balanceRes.data);
        setRecordatorios(recordatoriosRes.data);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]); // Añadimos API_BASE como dependencia por si cambia (no debería)

  const handleToggleCompletado = async (id, completadoActual) => {
    try {
      await axios.patch(`${API_BASE}/recordatorios/${id}`, {
        completado: !completadoActual
      });
      const res = await axios.get(`${API_BASE}/recordatorios`);
      setRecordatorios(res.data);
    } catch (err) {
      console.error("Error al actualizar recordatorio:", err);
      alert("No se pudo actualizar el estado");
    }
  };

  const handleDeleteRecordatorio = async (id) => {
    if (!window.confirm('¿Eliminar este recordatorio?')) return;
    try {
      await axios.delete(`${API_BASE}/recordatorios/${id}`);
      const res = await axios.get(`${API_BASE}/recordatorios`);
      setRecordatorios(res.data);
    } catch (err) {
      console.error('Error al eliminar recordatorio:', err);
      alert('No se pudo eliminar el recordatorio');
    }
  };

  if (loading) return <div style={getStyles(theme).container}>Cargando dashboard...</div>;
  if (error) return <div style={getStyles(theme).container}>❌ {error}</div>;

  const dataPorTipo = [
    { name: 'Ingresos', value: balance.ingresos },
    { name: 'Gastos', value: balance.gastos }
  ];
  const COLORS = ['#4caf50', '#f44336'];

  const formatoMoneda = (value) => 
    value.toLocaleString('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const movimientos = [
    ...ingresos.map(i => ({ ...i, type: 'Ingreso' })),
    ...gastos.map(g => ({ ...g, type: 'Gasto' }))
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const ultimosMovimientos = movimientos.slice(0, 5);
  const styles = getStyles(theme);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💰 MiBalance - Dashboard</h1>

      {/* Tarjetas de resumen */}
      <div style={styles.cards}>
        <div style={{ ...styles.card, background: theme === 'light' ? '#e8f5e8' : '#1e3a1e' }}>
          <h3 style={styles.cardTitle}>Ingresos</h3>
          <p style={styles.ingresos}>{formatoMoneda(balance.ingresos)}</p>
        </div>
        <div style={{ ...styles.card, background: theme === 'light' ? '#ffe6e6' : '#3a1e1e' }}>
          <h3 style={styles.cardTitle}>Gastos</h3>
          <p style={styles.gastos}>{formatoMoneda(balance.gastos)}</p>
        </div>
        <div style={{ ...styles.card, background: theme === 'light' ? '#e3f2fd' : '#1a2a3a' }}>
          <h3 style={styles.cardTitle}>Balance</h3>
          <p style={{ ...styles.balance, color: balance.balance >= 0 ? '#4caf50' : '#f44336' }}>
            {formatoMoneda(balance.balance)}
          </p>
        </div>
      </div>

      {/* Gráficas */}
      <div style={styles.chartsContainer}>
        <div style={styles.chartCard}>
          <h3>Ingresos vs Gastos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataPorTipo}>
              <XAxis dataKey="name" stroke={styles.textColor} />
              <YAxis tickFormatter={(value) => formatoMoneda(value)} stroke={styles.textColor} />
              <Tooltip 
                formatter={(value) => formatoMoneda(value)} 
                contentStyle={{ backgroundColor: styles.tooltipBg, color: styles.textColor, border: 'none' }}
              />
              <Legend wrapperStyle={{ color: styles.textColor }} />
              <Bar dataKey="value" fill="#8884d8">
                {dataPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3>Distribución</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataPorTipo}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {dataPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatoMoneda(value)} 
                contentStyle={{ backgroundColor: styles.tooltipBg, color: styles.textColor, border: 'none' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Últimos movimientos */}
      <div style={styles.ultimos}>
        <h2 style={styles.sectionTitle}>Últimos Movimientos</h2>
        {ultimosMovimientos.length === 0 ? (
          <p>No hay movimientos recientes.</p>
        ) : (
          <ul style={styles.list}>
            {ultimosMovimientos.map(m => (
              <li key={m.id} style={styles.listItem}>
                <span style={m.type === 'Ingreso' ? styles.ingresoIcon : styles.gastoIcon}>
                  {m.type === 'Ingreso' ? '+' : '-'}
                </span>
                <div style={styles.itemContent}>
                  <strong>{formatoMoneda(m.monto)}</strong> - {m.description || m.descripcion}
                  <br />
                  <small style={styles.date}>{new Date(m.fecha).toLocaleDateString('es-ES')}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Todos los recordatorios */}
      <div style={styles.ultimos}>
        <h2 style={styles.sectionTitle}>📅 Recordatorios</h2>
        {recordatorios.length === 0 ? (
          <p>No hay recordatorios.</p>
        ) : (
          <ul style={styles.list}>
            {recordatorios.map(r => (
              <li key={r.id} style={styles.listItem}>
                <input
                  type="checkbox"
                  checked={r.completado || false}
                  onChange={() => handleToggleCompletado(r.id, r.completado)}
                  style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                />
                <div style={{
                  ...styles.itemContent,
                  textDecoration: r.completado ? 'line-through' : 'none',
                  opacity: r.completado ? 0.6 : 1,
                  color: r.completado ? styles.completedColor : 'inherit'
                }}>
                  <strong>{r.titulo}</strong>
                  {r.monto && <span> - {formatoMoneda(r.monto)}</span>}
                  <br />
                  <small style={styles.date}>📅 {new Date(r.fecha).toLocaleDateString('es-ES')}</small>
                </div>
                <button
                  onClick={() => handleDeleteRecordatorio(r.id)}
                  style={styles.deleteButton}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Función que retorna estilos según el tema (sin cambios)
const getStyles = (theme) => {
  const isDark = theme === 'dark';
  
  return {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: isDark ? '#121212' : '#f5f5f5',
      color: isDark ? '#e0e0e0' : '#333333',
      minHeight: '100vh',
    },
    title: {
      color: isDark ? '#ffffff' : '#333333',
    },
    cards: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      flexWrap: 'wrap',
    },
    card: {
      flex: '1 1 200px',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center',
    },
    cardTitle: {
      margin: '0 0 10px 0',
      color: isDark ? '#ccc' : '#555',
    },
    ingresos: {
      fontSize: '28px',
      color: '#4caf50',
      fontWeight: 'bold',
      margin: 0,
    },
    gastos: {
      fontSize: '28px',
      color: '#f44336',
      fontWeight: 'bold',
      margin: 0,
    },
    balance: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: 0,
    },
    chartsContainer: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      marginBottom: '30px',
    },
    chartCard: {
      flex: '1 1 400px',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center',
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      color: isDark ? '#e0e0e0' : '#333333',
    },
    ultimos: {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      marginBottom: '30px',
    },
    sectionTitle: {
      marginTop: 0,
      color: isDark ? '#ffffff' : '#333333',
    },
    list: {
      listStyle: 'none',
      padding: 0,
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 0',
      borderBottom: isDark ? '1px solid #444' : '1px solid #eee',
    },
    ingresoIcon: {
      color: '#4caf50',
      fontWeight: 'bold',
      fontSize: '20px',
      width: '20px',
      textAlign: 'center',
    },
    gastoIcon: {
      color: '#f44336',
      fontWeight: 'bold',
      fontSize: '20px',
      width: '20px',
      textAlign: 'center',
    },
    itemContent: {
      flex: 1,
    },
    date: {
      color: isDark ? '#aaa' : '#666',
    },
    deleteButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem',
      padding: '0 5px',
      color: isDark ? '#ff8a80' : '#c62828',
    },
    textColor: isDark ? '#e0e0e0' : '#333333',
    tooltipBg: isDark ? '#333' : '#fff',
    completedColor: isDark ? '#888' : '#999',
  };
};

export default Dashboard;