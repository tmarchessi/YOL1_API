import React, { useState } from 'react';

const ScoreView = ({ onLogout }) => {
  const [code, setCode] = useState('');
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetScore = async (e) => {
    e.preventDefault();
    setScore(null);
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      const response = await fetch(`http://localhost:3001/api/score?code=${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch score');
      }

      const data = await response.json();
      setScore(data.score);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout(); 
  };

  return (
    <div>
      <h2>Welcome!</h2>
      <button onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
      <h3>Get Your Score</h3>
      <form onSubmit={handleGetScore}>
        <div>
          <label>Enter Code:</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Fetching...' : 'Get Score'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {score !== null && <p>Your Score: <strong>{score}</strong></p>}
      </form>
    </div>
  );
}

export default ScoreView;