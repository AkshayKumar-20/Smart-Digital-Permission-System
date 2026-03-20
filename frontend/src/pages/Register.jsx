import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const DEPTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE'];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name:'', collegeId:'', email:'', password:'', role:'student', department:'CSE', year:'', section:'', phone:'' });
  const [loading, setLoading] = useState(false);

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-header">
          <div className="logo-icon"><Shield size={28} color="#fff" /></div>
          <h2>Create Account</h2>
          <p>Register to access the permission system</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" placeholder="John Doe" value={form.name} onChange={f('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">College ID</label>
              <input className="form-control" placeholder="CS2024001" value={form.collegeId} onChange={f('collegeId')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="student@college.edu" value={form.email} onChange={f('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="min 6 characters" value={form.password} onChange={f('password')} required minLength={6} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={f('role')}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="hod">HOD</option>
                <option value="principal">Principal</option>
                <option value="watchman">Watchman</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-control" value={form.department} onChange={f('department')}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {form.role === 'student' && (
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Year</label>
                <select className="form-control" value={form.year} onChange={f('year')}>
                  <option value="">Select year</option>
                  {['1','2','3','4'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Section</label>
                <select className="form-control" value={form.section} onChange={f('section')}>
                  <option value="">Select</option>
                  {['A','B','C','D'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-control" placeholder="+91 9876543210" value={form.phone} onChange={f('phone')} />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'.875rem', color:'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
