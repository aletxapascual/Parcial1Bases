import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [activeTab, setActiveTab] = useState('clients');

  const [clients, setClients] = useState([]);
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [contracts, setContracts] = useState([]);
  const [contractForm, setContractForm] = useState({
    client_id: '',
    airline: '',
    plan: '',
    start_date: '',
    end_date: '',
    monthly_cost: '',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  useEffect(() => {
    fetchClients();
  }, []);


  useEffect(() => {
    if (activeTab === 'contracts') {
      fetchContracts();
    }
  }, [activeTab]);


  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/clients`);
      setClients(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar clientes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/contracts`);
      setContracts(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar contratos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleClientFormChange = (e) => {
    const { name, value } = e.target;
    setClientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await axios.post(`${API_URL}/clients`, clientForm);
      setSuccess('¡Cliente creado exitosamente!');
      setClientForm({ name: '', email: '', phone: '' });
      
      await fetchClients();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear cliente: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  const translateStatus = (status) => {
    const translations = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'pending': 'Pendiente',
      'cancelled': 'Cancelado'
    };
    return translations[status] || status;
  };



  const handleContractFormChange = (e) => {
    const { name, value } = e.target;
    setContractForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const payload = {
        ...contractForm,
        client_id: parseInt(contractForm.client_id),
        monthly_cost: parseFloat(contractForm.monthly_cost)
      };
      
      await axios.post(`${API_URL}/contracts`, payload);
      setSuccess('¡Contrato creado exitosamente!');
      setContractForm({
        client_id: '',
        airline: '',
        plan: '',
        start_date: '',
        end_date: '',
        monthly_cost: '',
        status: 'active'
      });


      await fetchContracts();
      

      await fetchClients();
      

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear contrato: ' + err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div>
      <div className="header">
        <h1>Gestión de Clientes y Contratos</h1>
        <p>Administra tus clientes y sus contratos</p>
      </div>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            Clientes
          </button>
          <button
            className={`tab-button ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            Contratos
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'clients' && (
          <div className="section">
            <h2>Clientes</h2>

            <form className="form" onSubmit={handleClientSubmit}>
              <h3 style={{ marginBottom: '15px' }}>Agregar Nuevo Cliente</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="name"
                    value={clientForm.name}
                    onChange={handleClientFormChange}
                    required
                    placeholder="Ingresa el nombre del cliente"
                  />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    value={clientForm.email}
                    onChange={handleClientFormChange}
                    required
                    placeholder="Ingresa el correo electrónico"
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={clientForm.phone}
                    onChange={handleClientFormChange}
                    placeholder="Ingresa el número de teléfono"
                  />
                </div>
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Cliente'}
              </button>
            </form>

            <div className="table-container">
              <h3>Todos los Clientes</h3>
              {loading && <div className="loading">Cargando...</div>}
              {!loading && clients.length === 0 && (
                <div className="empty-state">
                  <p>No se encontraron clientes. ¡Crea tu primer cliente arriba!</p>
                </div>
              )}
              {!loading && clients.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Número de Contratos</th>
                      <th>Creado el</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.id}>
                        <td>{client.id}</td>
                        <td>{client.name}</td>
                        <td>{client.email}</td>
                        <td>{client.phone || '-'}</td>
                        <td>
                          <strong>{client.contract_count}</strong>
                        </td>
                        <td>{new Date(client.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="section">
            <h2>Contratos</h2>

            <form className="form" onSubmit={handleContractSubmit}>
              <h3 style={{ marginBottom: '15px' }}>Agregar Nuevo Contrato</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Cliente *</label>
                  <select
                    name="client_id"
                    value={contractForm.client_id}
                    onChange={handleContractFormChange}
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Aerolínea *</label>
                  <input
                    type="text"
                    name="airline"
                    value={contractForm.airline}
                    onChange={handleContractFormChange}
                    required
                    placeholder="ej., Delta Airlines"
                  />
                </div>
                <div className="form-group">
                  <label>Plan *</label>
                  <input
                    type="text"
                    name="plan"
                    value={contractForm.plan}
                    onChange={handleContractFormChange}
                    required
                    placeholder="ej., Clase Ejecutiva"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Inicio *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={contractForm.start_date}
                    onChange={handleContractFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Fin</label>
                  <input
                    type="date"
                    name="end_date"
                    value={contractForm.end_date}
                    onChange={handleContractFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Costo Mensual *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="monthly_cost"
                    value={contractForm.monthly_cost}
                    onChange={handleContractFormChange}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    name="status"
                    value={contractForm.status}
                    onChange={handleContractFormChange}
                    required
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="pending">Pendiente</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Contrato'}
              </button>
            </form>

            <div className="table-container">
              <h3>Todos los Contratos</h3>
              {loading && <div className="loading">Cargando...</div>}
              {!loading && contracts.length === 0 && (
                <div className="empty-state">
                  <p>No se encontraron contratos. ¡Crea tu primer contrato arriba!</p>
                </div>
              )}
              {!loading && contracts.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Aerolínea</th>
                      <th>Plan</th>
                      <th>Fecha de Inicio</th>
                      <th>Fecha de Fin</th>
                      <th>Costo Mensual</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map(contract => (
                      <tr key={contract.id}>
                        <td>{contract.id}</td>
                        <td>{contract.client_name}</td>
                        <td>{contract.airline}</td>
                        <td>{contract.plan}</td>
                        <td>{new Date(contract.start_date).toLocaleDateString()}</td>
                        <td>{contract.end_date ? new Date(contract.end_date).toLocaleDateString() : '-'}</td>
                        <td>${parseFloat(contract.monthly_cost).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge status-${contract.status}`}>
                            {translateStatus(contract.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
