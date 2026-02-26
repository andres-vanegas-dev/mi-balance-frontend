import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

function GastosPage() {
  const { theme } = useTheme();
  const [gastos, setGastos] = useState([]);
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Comida');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

  const categorias = [
    'Comida',
    'Transporte',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Vivienda',
    'Servicios',
    'Otros'
  ];

  useEffect(() => {
    cargarGastos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  const cargarGastos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/gastos`);
      setGastos(res.data);
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/gastos`, {
        monto: parseFloat(monto),
        categoria,
        description: descripcion
      });
      await cargarGastos();
      setMonto('');
      setCategoria('Comida');
      setDescripcion('');
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      alert('Ocurrió un error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(theme);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💰 MiBalance - Gastos</h1>

      {/* Formulario de registro */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Registrar Gasto</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Monto:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
              style={styles.input}
              placeholder="Ingrese monto"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Categoría:</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={styles.input}
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Descripción:</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              style={styles.input}
              placeholder="Descripción del gasto"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={loading ? { ...styles.button, opacity: 0.6 } : styles.button}
          >
            {loading ? 'Guardando...' : 'Guardar Gasto'}
          </button>
        </form>
      </div>

      {/* Lista de gastos */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Lista de Gastos</h2>
        {gastos.length === 0 ? (
          <p style={styles.emptyText}>No hay gastos registrados.</p>
        ) : (
          <ul style={styles.list}>
            {gastos.map(gasto => (
              <li key={gasto.id} style={styles.listItem}>
                <span style={styles.gastoIcon}>-</span>
                <div style={styles.itemContent}>
                  <strong>${gasto.monto}</strong> - {gasto.categoria} - {gasto.description}
                  <br />
                  <small style={styles.date}>
                    {new Date(gasto.fecha).toLocaleDateString('es-ES')}
                  </small>
                </div>
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
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: isDark ? '#121212' : '#f5f5f5',
      color: isDark ? '#e0e0e0' : '#333333',
      minHeight: '100vh',
    },
    title: {
      color: isDark ? '#ffffff' : '#333333',
    },
    card: {
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderRadius: '8px',
      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
      padding: '20px',
      marginBottom: '30px',
    },
    sectionTitle: {
      marginTop: 0,
      color: isDark ? '#ffffff' : '#333333',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    label: {
      color: isDark ? '#ccc' : '#555',
      fontWeight: 'bold',
    },
    input: {
      padding: '10px',
      fontSize: '16px',
      border: isDark ? '1px solid #444' : '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: isDark ? '#333' : '#fff',
      color: isDark ? '#e0e0e0' : '#333',
    },
    button: {
      padding: '12px',
      fontSize: '16px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    list: {
      listStyle: 'none',
      padding: 0,
    },
    listItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '10px 0',
      borderBottom: isDark ? '1px solid #444' : '1px solid #eee',
    },
    gastoIcon: {
      color: '#dc3545',
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
    emptyText: {
      color: isDark ? '#aaa' : '#666',
      fontStyle: 'italic',
    },
  };
};

export default GastosPage;