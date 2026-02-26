import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

function IngresosPage() {
  const { theme } = useTheme();
  const [ingresos, setIngresos] = useState([]);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarIngresos();
  }, []);

  const cargarIngresos = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/ingresos');
      setIngresos(res.data);
    } catch (error) {
      console.error('Error al cargar ingresos:', error);
      alert('No se pudieron cargar los ingresos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/ingresos', {
        monto: parseFloat(monto),
        description: descripcion
      });
      await cargarIngresos();
      setMonto('');
      setDescripcion('');
    } catch (error) {
      console.error('Error al guardar ingreso:', error);
      alert('Ocurrió un error al guardar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(theme);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💰 MiBalance - Ingresos</h1>

      {/* Tarjeta de formulario */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Registrar Ingreso</h2>
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
            <label style={styles.label}>Descripción:</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              style={styles.input}
              placeholder="Descripción del ingreso"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            style={loading ? { ...styles.button, opacity: 0.6 } : styles.button}
          >
            {loading ? 'Guardando...' : 'Guardar Ingreso'}
          </button>
        </form>
      </div>

      {/* Tarjeta de lista de ingresos */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Lista de Ingresos</h2>
        {ingresos.length === 0 ? (
          <p style={styles.emptyText}>No hay ingresos registrados.</p>
        ) : (
          <ul style={styles.list}>
            {ingresos.map(ingreso => (
              <li key={ingreso.id} style={styles.listItem}>
                <span style={styles.ingresoIcon}>+</span>
                <div style={styles.itemContent}>
                  <strong>${ingreso.monto}</strong> - {ingreso.description}
                  <br />
                  <small style={styles.date}>
                    {new Date(ingreso.fecha).toLocaleDateString('es-ES')}
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

// Función que retorna estilos según el tema
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
      backgroundColor: '#28a745',
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
    ingresoIcon: {
      color: '#28a745',
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

export default IngresosPage;