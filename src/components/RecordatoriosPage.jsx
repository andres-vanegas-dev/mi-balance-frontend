import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

function RecordatoriosPage() {
  const { theme } = useTheme();
  const [recordatorios, setRecordatorios] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    cargarRecordatorios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  const cargarRecordatorios = async () => {
    try {
      const res = await axios.get(`${API_BASE}/recordatorios`);
      // Ordenar por fecha
      const ordenados = res.data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setRecordatorios(ordenados);
    } catch (error) {
      console.error('Error al cargar recordatorios:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/recordatorios`, {
        titulo,
        fecha,
        monto: monto ? parseFloat(monto) : null,
        completado: false
      });
      await cargarRecordatorios();
      setTitulo('');
      setFecha('');
      setMonto('');
    } catch (error) {
      console.error('Error al guardar recordatorio:', error);
      alert('Ocurrió un error al guardar el recordatorio');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletado = async (id, completadoActual) => {
    try {
      await axios.patch(`${API_BASE}/recordatorios/${id}`, {
        completado: !completadoActual
      });
      await cargarRecordatorios();
    } catch (error) {
      console.error('Error al actualizar recordatorio:', error);
      alert('No se pudo actualizar el estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este recordatorio?')) return;
    try {
      await axios.delete(`${API_BASE}/recordatorios/${id}`);
      await cargarRecordatorios();
    } catch (error) {
      console.error('Error al eliminar recordatorio:', error);
      alert('No se pudo eliminar');
    }
  };

  const formatearFecha = (fechaStr) => {
    const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
  };

  const styles = getStyles(theme);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💰 MiBalance - Recordatorios</h1>

      {/* Formulario */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Nuevo Recordatorio</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Título:</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              style={styles.input}
              placeholder="Ej. Pagar arriendo"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Fecha:</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Monto (opcional):</label>
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              style={styles.input}
              placeholder="Ingrese monto si aplica"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            style={loading ? { ...styles.button, opacity: 0.6 } : styles.button}
          >
            {loading ? 'Guardando...' : 'Guardar Recordatorio'}
          </button>
        </form>
      </div>

      {/* Lista de recordatorios */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Todos los Recordatorios</h2>
        {recordatorios.length === 0 ? (
          <p style={styles.emptyText}>No hay recordatorios.</p>
        ) : (
          <ul style={styles.list}>
            {recordatorios.map(rec => (
              <li key={rec.id} style={styles.listItem}>
                <div style={styles.itemRow}>
                  <input
                    type="checkbox"
                    checked={rec.completado || false}
                    onChange={() => handleToggleCompletado(rec.id, rec.completado)}
                    style={styles.checkbox}
                  />
                  <div style={styles.itemContent}>
                    <span style={rec.completado ? styles.tachado : {}}>
                      <strong>{rec.titulo}</strong>
                    </span>
                    <br />
                    <span style={styles.date}>📅 {formatearFecha(rec.fecha)}</span>
                    {rec.monto && (
                      <span style={styles.monto}> - 💰 ${rec.monto.toLocaleString('es-ES')}</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(rec.id)} style={styles.deleteButton}>
                    🗑️
                  </button>
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
      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
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
      backgroundColor: '#007bff',
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
      padding: '10px 0',
      borderBottom: isDark ? '1px solid #444' : '1px solid #eee',
    },
    itemRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    checkbox: {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      accentColor: '#007bff',
    },
    itemContent: {
      flex: 1,
    },
    date: {
      color: isDark ? '#aaa' : '#666',
      fontSize: '0.9em',
    },
    monto: {
      fontWeight: 'bold',
      color: isDark ? '#4caf50' : '#28a745',
    },
    tachado: {
      textDecoration: 'line-through',
      color: isDark ? '#888' : '#999',
    },
    deleteButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.2rem',
      cursor: 'pointer',
      padding: '5px',
      color: isDark ? '#ff8a80' : '#c62828',
    },
    emptyText: {
      color: isDark ? '#aaa' : '#666',
      fontStyle: 'italic',
    },
  };
};

export default RecordatoriosPage;