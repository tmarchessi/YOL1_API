import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  // const [username, setUsername] = useState(''); // ANTES
  const [rut, setRut] = useState(''); // AHORA: Estado para el RUT
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ username, password }), // ANTES
        body: JSON.stringify({ rut, password }), // AHORA: Envía 'rut'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>RUT:</label> {/* CAMBIADO: Etiqueta para RUT */}
          <input
            type="text"
            // value={username} // ANTES
            // onChange={(e) => setUsername(e.target.value)} // ANTES
            value={rut} // AHORA
            onChange={(e) => setRut(e.target.value)} // AHORA
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;