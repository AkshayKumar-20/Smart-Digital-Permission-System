import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Inbox, CheckCircle, XCircle, BarChart2, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestService, authService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`badge-status badge-${status}`}>{status}</span>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, onLogout, title, sidebarOpen }) => {
  const links = [
    { key:'dashboard', icon:<Home size={18}/>,        label:'Dashboard' },
    { key:'inbox',     icon:<Inbox size={18}/>,       label:'Inbox' },
    { key:'approved',  icon:<CheckCircle size={18}/>, label:'Approved' },
    { key:'rejected',  icon:<XCircle size={18}/>,     label:'Rejected' },
    { key:'analytics', icon:<BarChart2 size={18}/>,   label:'Analytics' },
    { key:'notifications', icon:<Bell size={18}/>,    label:'Notifications' },
  ];
  return (
    <aside className={`sidebar ${sidebarOpen?'sidebar-open':''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon"><CheckCircle size={18} color="#fff"/></div>
        <h4>{title}</h4>
      </div>
      {links.map(l => (
        <button key={l.key} className={`nav-link-item ${active===l.key?'active':''}`} onClick={()=>setActive(l.key)}>
          {l.icon} {l.label}
        </button>
      ))}
      <div className="sidebar-spacer"/>
      <button className="nav-link-item logout" onClick={onLogout}>
        <LogOut size={18}/> Sign Out
      </button>
    </aside>
  );
};

// ─── Stats Dashboard ──────────────────────────────────────────────────────────
const DashHome = ({ user, requests }) => {
  const pending  = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action === 'pending')).length;
  const approved = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action === 'approved')).length;
  const rejected = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action === 'rejected')).length;

  return (
    <div>
      <div className="top-header">
        <div className="greeting"><h2>Welcome, {user.name} 👋</h2><p>{user.role?.toUpperCase()} · {user.department}</p></div>
      </div>
      <div className="grid-3" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Pending for Me', value:pending,  color:'var(--warning)', bg:'#FEF3C7' },
          { label:'Approved',       value:approved, color:'var(--success)', bg:'#D1FAE5' },
          { label:'Rejected',       value:rejected, color:'var(--danger)',  bg:'#FEE2E2' },
        ].map(c => (
          <div key={c.label} className="card stat-card">
            <div className="stat-value" style={{ color:c.color }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Recent Pending</h3>
        {requests.filter(r=>r.status==='pending').slice(0,5).map(r=>(
          <div key={r._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight:600 }}>{r.student?.name} <span style={{ fontWeight:400, color:'var(--text-muted)', fontSize:'.8rem' }}>({r.student?.collegeId})</span></div>
              <div style={{ fontSize:'.8rem', color:'var(--text-secondary)' }}>{r.requestType} · {new Date(r.fromDate).toLocaleDateString()}</div>
            </div>
            <StatusBadge status={r.status}/>
          </div>
        ))}
        {requests.filter(r=>r.status==='pending').length===0 && <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>No pending requests</p>}
      </div>
    </div>
  );
};

// ─── Approve / Reject Modal ───────────────────────────────────────────────────
const ActionModal = ({ type, request, onConfirm, onClose, canEscalate }) => {
  const [remarks,    setRemarks]    = useState('');
  const [escalateTo, setEscalateTo] = useState('');
  const [escalateList, setEscList]  = useState([]);

  useEffect(() => {
    if (canEscalate) {
      authService.getRecipients(request?.student?.department || '')
        .then(res => setEscList(res.data.filter(u => u.role === 'hod' || u.role === 'principal')))
        .catch(()=>{});
    }
  }, [canEscalate, request]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <h3>{type === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}</h3>
        <p style={{ fontSize:'.875rem', color:'var(--text-secondary)', marginBottom:'1rem' }}>
          {request?.student?.name} — {request?.requestType}
        </p>
        <div className="form-group">
          <label className="form-label">Remarks {type==='reject'?'(required)':'(optional)'}</label>
          <textarea className="form-control" rows={3} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Add your remarks..."/>
        </div>
        {type === 'approve' && canEscalate && (
          <div className="form-group">
            <label className="form-label">Escalate To (optional)</label>
            <select className="form-control" value={escalateTo} onChange={e=>setEscalateTo(e.target.value)}>
              <option value="">Do not escalate</option>
              {escalateList.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className={`btn ${type==='approve'?'btn-success':'btn-danger'}`}
            onClick={() => onConfirm(remarks, escalateTo || null)}
          >
            {type==='approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Student Profile Modal ────────────────────────────────────────────────────
const StudentProfileModal = ({ student, onClose }) => {
  if (!student) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <h3>Student Profile</h3>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'1.5rem', fontWeight:800 }}>
            {student.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight:700 }}>{student.name}</div>
            <div style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>{student.collegeId} · {student.department}</div>
          </div>
        </div>
        {[['Year', student.year], ['Section', student.section], ['Email', student.email], ['Phone', student.phone]].map(([k,v])=>(
          <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:'.875rem' }}>
            <span style={{ color:'var(--text-muted)' }}>{k}</span>
            <span style={{ fontWeight:500 }}>{v||'—'}</span>
          </div>
        ))}
        <div className="modal-footer"><button className="btn btn-outline" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
};

// ─── Inbox ────────────────────────────────────────────────────────────────────
const InboxTab = ({ user, requests, onAction }) => {
  const [modal, setModal]   = useState(null); // { type, request }
  const [profile, setProfile] = useState(null);
  const canEscalate = user.role === 'teacher' || user.role === 'hod';

  const myPending = requests.filter(r =>
    r.recipients?.some(rec => rec.user?._id === user.id && rec.action === 'pending')
  );

  const handleConfirm = async (remarks, escalateTo) => {
    try {
      if (modal.type === 'approve') {
        await requestService.approve(modal.request._id, { remarks, escalateTo });
        toast.success(escalateTo ? 'Request escalated!' : 'Request approved & QR generated!');
      } else {
        await requestService.reject(modal.request._id, { remarks });
        toast.success('Request rejected');
      }
      onAction();
      setModal(null);
    } catch(err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="greeting"><h2>Inbox — Pending Requests</h2><p>{myPending.length} awaiting your action</p></div>
      </div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr>
            <th>Student</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {myPending.map(r => (
              <tr key={r._id}>
                <td>
                  <div style={{ fontWeight:600 }}>{r.student?.name}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{r.student?.collegeId}</div>
                </td>
                <td>{r.requestType}</td>
                <td style={{ fontSize:'.8rem' }}>{new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}</td>
                <td style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.reason}</td>
                <td><StatusBadge status={r.status}/></td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-outline btn-sm" onClick={()=>setProfile(r.student)}>👤</button>
                    <button className="btn btn-success btn-sm" onClick={()=>setModal({type:'approve',request:r})}>Approve</button>
                    <button className="btn btn-danger btn-sm"  onClick={()=>setModal({type:'reject', request:r})}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {myPending.length===0 && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No pending requests!</p>}
      </div>

      {modal && <ActionModal type={modal.type} request={modal.request} onConfirm={handleConfirm} onClose={()=>setModal(null)} canEscalate={canEscalate}/>}
      {profile && <StudentProfileModal student={profile} onClose={()=>setProfile(null)}/>}
    </div>
  );
};

// ─── History Table (Approved / Rejected) ─────────────────────────────────────
const HistoryTable = ({ user, requests, filterStatus, title }) => {
  const filtered = requests.filter(r =>
    r.status === filterStatus &&
    r.recipients?.some(rec => rec.user?._id === user.id && rec.action !== 'pending')
  );
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>{title}</h2></div></div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>My Remarks</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(r => {
              const myRec = r.recipients?.find(rec => rec.user?._id === user.id);
              return (
                <tr key={r._id}>
                  <td><div style={{ fontWeight:600 }}>{r.student?.name}</div><div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{r.student?.collegeId}</div></td>
                  <td>{r.requestType}</td>
                  <td style={{ fontSize:'.8rem' }}>{new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}</td>
                  <td style={{ color: filterStatus==='rejected'?'var(--danger)':undefined }}>{myRec?.remarks || '—'}</td>
                  <td><StatusBadge status={r.status}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No {filterStatus} requests found</p>}
      </div>
    </div>
  );
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const Analytics = ({ user, requests }) => {
  const monthly = {};
  requests.forEach(r => {
    const myRec = r.recipients?.find(rec => rec.user?._id === user.id);
    if (!myRec || myRec.action === 'pending') return;
    const key = new Date(r.createdAt).toLocaleString('default', { month:'short', year:'2-digit' });
    if (!monthly[key]) monthly[key] = { name:key, approved:0, rejected:0, escalated:0 };
    monthly[key][myRec.action]++;
  });
  const barData = Object.values(monthly);
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>Analytics</h2></div></div>
      <div className="card">
        <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>My Actions Per Month</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/>
            <Bar dataKey="approved"  fill="#10B981" name="Approved"/>
            <Bar dataKey="rejected"  fill="#EF4444" name="Rejected"/>
            <Bar dataKey="escalated" fill="#8B5CF6" name="Escalated"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── Main Teacher Dashboard ────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [active, setActive]   = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetch = useCallback(async () => {
    try { const { data } = await requestService.getAll(); setRequests(data); }
    catch { /* silent */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNavClick = (key) => { setActive(key); setSidebarOpen(false); };

  return (
    <div className="app-shell">
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      <div className={`mobile-overlay ${sidebarOpen?'active':''}`} onClick={() => setSidebarOpen(false)}/>
      <Sidebar active={active} setActive={handleNavClick} onLogout={handleLogout} title="Faculty Portal" sidebarOpen={sidebarOpen}/>
      <div className="main-content">
        {active==='dashboard'  && <DashHome user={user} requests={requests}/>}
        {active==='inbox'      && <InboxTab user={user} requests={requests} onAction={fetch}/>}
        {active==='approved'   && <HistoryTable user={user} requests={requests} filterStatus="approved" title="Approved Requests"/>}
        {active==='rejected'   && <HistoryTable user={user} requests={requests} filterStatus="rejected" title="Rejected Requests"/>}
        {active==='analytics'  && <Analytics user={user} requests={requests}/>}
        {active==='notifications' && (
          <div>
            <div className="top-header"><div className="greeting"><h2>Notifications 🔔</h2></div></div>
            <div className="card" style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>
              No unread notifications
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
