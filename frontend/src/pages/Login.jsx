import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, CreditCard } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ collegeId: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate(`/${data.user.role}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-icon">
            <Shield size={28} color="#fff" />
          </div>
          <h2>Smart Permission System</h2>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">College ID</label>
            <div style={{ position: 'relative' }}>
              <CreditCard size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="e.g. CS2024001"
                value={form.collegeId}
                onChange={e => setForm({ ...form, collegeId: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'.875rem', color:'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color:'var(--primary)', fontWeight:600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}