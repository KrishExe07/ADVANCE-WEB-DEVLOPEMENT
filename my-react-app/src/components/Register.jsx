import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-section" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div className="section-heading">
        <h2>Register</h2>
      </div>
      {error && <div style={{ color: 'var(--red)', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'var(--green)', marginBottom: '1rem' }}>Registration successful! Redirecting to login...</div>}
      
      {!success && (
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
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      )}
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ color: 'var(--accent)' }}>Login here</a>
      </p>
    </section>
  );
}

export default Register;
