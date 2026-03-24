import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Settings, LogOut, CheckCircle, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestService, authService } from '../../services/api';
import toast from 'react-hot-toast';
import api from '../../services/api';

const StatusBadge = ({ status }) => <span className={`badge-status badge-${status}`}>{status}</span>;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, onLogout, sidebarOpen }) => {
  const links = [
    { key:'dashboard', icon:<Home size={18}/>,     label:'Dashboard' },
    { key:'users',     icon:<Users size={18}/>,    label:'Manage Users' },
    { key:'settings',  icon:<Settings size={18}/>, label:'Settings' },
  ];
  return (
    <aside className={`sidebar ${sidebarOpen?'sidebar-open':''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon"><CheckCircle size={18} color="#fff"/></div>
        <h4>Admin Panel</h4>
      </div>
      {links.map(l => (
        <button key={l.key} className={`nav-link-item ${active===l.key?'active':''}`} onClick={()=>setActive(l.key)}>
          {l.icon} {l.label}
        </button>
      ))}
      <div className="sidebar-spacer"/>
      <button className="nav-link-item logout" onClick={onLogout}><LogOut size={18}/> Sign Out</button>
    </aside>
  );
};

// ─── Dashboard Home ───────────────────────────────────────────────────────────
const DashHome = ({ stats }) => (
  <div>
    <div className="top-header"><div className="greeting"><h2>Admin Dashboard 🛡️</h2><p>System overview</p></div></div>
    <div className="grid-4" style={{ marginBottom:'1.5rem' }}>
      {[
        ['Total Users',     stats.totalUsers,  'var(--primary)'],
        ['Students',        stats.students,    'var(--info)'],
        ['Faculty/Staff',   stats.faculty,     'var(--success)'],
        ['Total Requests',  stats.totalReqs,   'var(--warning)'],
      ].map(([l,v,c])=>(
        <div key={l} className="card stat-card">
          <div className="stat-value" style={{ color:c }}>{v}</div>
          <div className="stat-label">{l}</div>
        </div>
      ))}
    </div>
    <div className="grid-2">
      <div className="card">
        <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Users by Role</h3>
        {['student','teacher','hod','principal','watchman','admin'].map(role => (
          <div key={role} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'.875rem' }}>
            <span style={{ fontWeight:500, textTransform:'capitalize' }}>{role}</span>
            <span style={{ fontWeight:700, color:'var(--text-secondary)' }}>{stats.byRole?.[role] || 0}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>System Info</h3>
        {[
          ['Platform', 'MERN Stack'],
          ['Database', 'MongoDB Atlas'],
          ['Auth Method', 'JWT + bcrypt'],
          ['QR Signing', 'JWT with QR_SECRET'],
          ['File Uploads', 'Multer (≤ 5MB)'],
        ].map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'.875rem' }}>
            <span style={{ color:'var(--text-muted)' }}>{k}</span>
            <span style={{ fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── User Management ──────────────────────────────────────────────────────────
const ManageUsers = ({ users, onRefresh }) => {
  const [search, setSearch]   = useState('');
  const [roleFilter, setRole] = useState('all');

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.collegeId?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      toast.success('User deleted');
      onRefresh();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="greeting"><h2>Manage Users</h2><p>{users.length} total users</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ position:'relative' }}>
            <Search size={16} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
            <input className="form-control" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:32, width:200 }}/>
          </div>
          <select className="form-control" value={roleFilter} onChange={e=>setRole(e.target.value)} style={{ width:140 }}>
            <option value="all">All Roles</option>
            {['student','teacher','hod','principal','watchman','admin'].map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr>
            <th>#</th><th>Name</th><th>College ID</th><th>Email</th><th>Role</th><th>Department</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((u,i) => (
              <tr key={u._id}>
                <td>{i+1}</td>
                <td style={{ fontWeight:600 }}>{u.name}</td>
                <td>{u.collegeId}</td>
                <td style={{ fontSize:'.8rem' }}>{u.email}</td>
                <td><span className={`badge-status badge-${u.role==='admin'?'escalated':'approved'}`}>{u.role}</span></td>
                <td>{u.department}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(u._id, u.name)} title="Delete User">
                    <Trash2 size={14}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No users found</p>}
      </div>
    </div>
  );
};

// ─── Settings ─────────────────────────────────────────────────────────────────
const SettingsPage = () => (
  <div>
    <div className="top-header"><div className="greeting"><h2>System Settings ⚙️</h2><p>Configure system parameters</p></div></div>
    <div className="card">
      <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Available Departments</h3>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {['CSE','ECE','MECH','CIVIL','IT','EEE'].map(d => (
          <span key={d} className="badge-status badge-approved" style={{ padding:'8px 16px', fontSize:'.875rem' }}>{d}</span>
        ))}
      </div>
    </div>
    <div className="card" style={{ marginTop:'1rem' }}>
      <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>System Roles</h3>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {['student','teacher','hod','principal','watchman','admin'].map(r => (
          <span key={r} className="badge-status badge-pending" style={{ padding:'8px 16px', fontSize:'.875rem', textTransform:'capitalize' }}>{r}</span>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [users, setUsers]   = useState([]);
  const [stats, setStats]   = useState({ totalUsers:0, students:0, faculty:0, totalReqs:0, byRole:{} });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch all users (admin endpoint)
      const { data: allUsers } = await api.get('/auth/users');
      setUsers(allUsers);
      const byRole = {};
      allUsers.forEach(u => { byRole[u.role] = (byRole[u.role]||0) + 1; });
      const { data: reqs } = await requestService.getAll();
      setStats({
        totalUsers: allUsers.length,
        students:   byRole.student || 0,
        faculty:    (byRole.teacher||0) + (byRole.hod||0) + (byRole.principal||0),
        totalReqs:  reqs.length,
        byRole,
      });
    } catch {
      // If /auth/users doesn't exist yet, fall back
      try {
        const { data: reqs } = await requestService.getAll();
        setStats(prev => ({ ...prev, totalReqs: reqs.length }));
      } catch {}
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNavClick = (key) => { setActive(key); setSidebarOpen(false); };

  return (
    <div className="app-shell">
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      <div className={`mobile-overlay ${sidebarOpen?'active':''}`} onClick={() => setSidebarOpen(false)}/>
      <Sidebar active={active} setActive={handleNavClick} onLogout={handleLogout} sidebarOpen={sidebarOpen}/>
      <div className="main-content">
        {active==='dashboard' && <DashHome stats={stats}/>}
        {active==='users'     && <ManageUsers users={users} onRefresh={fetchData}/>}
        {active==='settings'  && <SettingsPage/>}
      </div>
    </div>
  );
}
