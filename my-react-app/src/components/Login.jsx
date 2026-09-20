import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.token);
      window.dispatchEvent(new Event('auth-change'));
      navigate('/tasks-ui');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-section" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div className="section-heading">
        <h2>Login</h2>
      </div>
      {error && <div style={{ color: 'var(--red)', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit} className="tm-form">
        <div className="tm-form__group">
          <label className="tm-form__label">Email</label>
          <input
            type="email"
            className="tm-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="tm-form__group">
          <label className="tm-form__label">Password</label>
          <input
            type="password"
            className="tm-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="tm-form__actions">
          <button type="submit" className="tm-btn tm-btn--primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }} style={{ color: 'var(--accent)' }}>Register here</a>
      </p>
    </section>
  );
}

export default Login;
