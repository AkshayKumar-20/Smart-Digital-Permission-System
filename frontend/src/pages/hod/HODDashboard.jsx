// HOD Dashboard — same as Teacher with "escalate to Principal" capability
// Re-exports TeacherDashboard with customized sidebar title
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Inbox, CheckCircle, XCircle, BarChart2, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestService, authService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

const StatusBadge = ({ status }) => <span className={`badge-status badge-${status}`}>{status}</span>;

const Sidebar = ({ active, setActive, onLogout, sidebarOpen }) => {
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
        <h4>HOD Portal</h4>
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

const DashHome = ({ user, requests }) => {
  const pending  = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action === 'pending')).length;
  const approved = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action === 'approved')).length;
  const rejected = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action === 'rejected')).length;
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>HOD Dashboard 👋</h2><p>{user.department} Department</p></div></div>
      <div className="grid-3" style={{ marginBottom:'1.5rem' }}>
        {[['Pending',pending,'var(--warning)'],['Approved',approved,'var(--success)'],['Rejected',rejected,'var(--danger)']].map(([l,v,c])=>(
          <div key={l} className="card stat-card"><div className="stat-value" style={{ color:c }}>{v}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Recent Pending (incl. escalated)</h3>
        {requests.filter(r=>r.status==='pending').slice(0,5).map(r=>(
          <div key={r._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight:600 }}>{r.student?.name} <span style={{ color:'var(--text-muted)', fontSize:'.8rem' }}>({r.student?.collegeId})</span></div>
              <div style={{ fontSize:'.8rem', color:'var(--text-secondary)' }}>{r.requestType} · {new Date(r.fromDate).toLocaleDateString()}</div>
            </div>
            <StatusBadge status={r.status}/>
          </div>
        ))}
        {!requests.filter(r=>r.status==='pending').length && <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>No pending requests</p>}
      </div>
    </div>
  );
};

const ActionModal = ({ type, request, onConfirm, onClose }) => {
  const [remarks, setRemarks]       = useState('');
  const [escalateTo, setEscalateTo] = useState('');
  const [principals, setPrincipals] = useState([]);

  useEffect(() => {
    if (type === 'approve') {
      authService.getRecipients(request?.student?.department||'')
        .then(res => setPrincipals(res.data.filter(u=>u.role==='principal')))
        .catch(()=>{});
    }
  }, [type, request]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <h3>{type==='approve'?'✅ Approve':'❌ Reject'} Request</h3>
        <p style={{ fontSize:'.875rem', color:'var(--text-secondary)', marginBottom:'1rem' }}>{request?.student?.name} — {request?.requestType}</p>
        <div className="form-group">
          <label className="form-label">Remarks{type==='reject'?' (required)':' (optional)'}</label>
          <textarea className="form-control" rows={3} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Add your remarks..."/>
        </div>
        {type==='approve' && (
          <div className="form-group">
            <label className="form-label">Escalate to Principal (optional)</label>
            <select className="form-control" value={escalateTo} onChange={e=>setEscalateTo(e.target.value)}>
              <option value="">Do not escalate</option>
              {principals.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className={`btn ${type==='approve'?'btn-success':'btn-danger'}`} onClick={()=>onConfirm(remarks, escalateTo||null)}>
            {type==='approve'?'Approve':'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InboxTab = ({ user, requests, onAction }) => {
  const [modal, setModal] = useState(null);
  const myPending = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action==='pending'));
  const handleConfirm = async (remarks, escalateTo) => {
    try {
      if (modal.type==='approve') { await requestService.approve(modal.request._id, { remarks, escalateTo }); toast.success(escalateTo?'Escalated to Principal!':'Approved!'); }
      else { await requestService.reject(modal.request._id, { remarks }); toast.success('Rejected'); }
      onAction(); setModal(null);
    } catch(err) { toast.error(err.response?.data?.message||'Action failed'); }
  };
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>Inbox</h2><p>{myPending.length} pending</p></div></div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {myPending.map(r=>(
              <tr key={r._id}>
                <td><div style={{ fontWeight:600 }}>{r.student?.name}</div><div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{r.student?.collegeId}</div></td>
                <td>{r.requestType}</td>
                <td style={{ fontSize:'.8rem' }}>{new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}</td>
                <td style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.reason}</td>
                <td><StatusBadge status={r.status}/></td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-success btn-sm" onClick={()=>setModal({type:'approve',request:r})}>Approve</button>
                    <button className="btn btn-danger btn-sm"  onClick={()=>setModal({type:'reject', request:r})}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!myPending.length && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No pending requests!</p>}
      </div>
      {modal && <ActionModal type={modal.type} request={modal.request} onConfirm={handleConfirm} onClose={()=>setModal(null)}/>}
    </div>
  );
};

const HistoryTab = ({ user, requests, filterStatus, title }) => {
  const filtered = requests.filter(r => r.status===filterStatus && r.recipients?.some(rec=>rec.user?._id===user.id && rec.action!=='pending'));
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>{title}</h2></div></div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>My Remarks</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(r=>{
              const myRec = r.recipients?.find(rec=>rec.user?._id===user.id);
              return (
                <tr key={r._id}>
                  <td><div style={{ fontWeight:600 }}>{r.student?.name}</div><div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{r.student?.collegeId}</div></td>
                  <td>{r.requestType}</td>
                  <td style={{ fontSize:'.8rem' }}>{new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}</td>
                  <td style={{ color:filterStatus==='rejected'?'var(--danger)':undefined }}>{myRec?.remarks||'—'}</td>
                  <td><StatusBadge status={r.status}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No {filterStatus} requests</p>}
      </div>
    </div>
  );
};

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
  const totalActed = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action !== 'pending')).length;
  const approvedCount = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action === 'approved')).length;
  const rate = totalActed > 0 ? Math.round((approvedCount / totalActed) * 100) : 0;
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>Department Analytics</h2><p>Your approval activity for {user.department}</p></div></div>
      <div className="grid-3" style={{ marginBottom:'1.5rem' }}>
        {[['Total Acted', totalActed, 'var(--primary)'], ['Approved', approvedCount, 'var(--success)'], ['Approval Rate', rate+'%', 'var(--info)']].map(([l,v,c])=>(
          <div key={l} className="card stat-card"><div className="stat-value" style={{ color:c }}>{v}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Actions Per Month</h3>
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

const Notifications = ({ requests }) => {
  const items = requests.slice(0,10).map(r => ({
    msg: `${r.student?.name}'s ${r.requestType} request is ${r.status.toUpperCase()}`,
    time: new Date(r.updatedAt || r.createdAt).toLocaleString(),
    status: r.status
  }));
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>Notifications 🔔</h2></div></div>
      <div className="card" style={{ padding:0 }}>
        {items.length === 0 && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No notifications</p>}
        {items.map((n,i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background: n.status==='approved'?'var(--success)':n.status==='rejected'?'var(--danger)':'var(--warning)', marginTop:6, flexShrink:0 }}/>
            <div>
              <p style={{ margin:0, fontWeight:500, fontSize:'.875rem' }}>{n.msg}</p>
              <p style={{ margin:0, fontSize:'.75rem', color:'var(--text-muted)' }}>{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function HODDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fetch = useCallback(async () => {
    try { const { data } = await requestService.getAll(); setRequests(data); } catch {}
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNavClick = (key) => { setActive(key); setSidebarOpen(false); };
  return (
    <div className="app-shell">
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      <div className={`mobile-overlay ${sidebarOpen?'active':''}`} onClick={() => setSidebarOpen(false)}/>
      <Sidebar active={active} setActive={handleNavClick} onLogout={handleLogout} sidebarOpen={sidebarOpen}/>
      <div className="main-content">
        {active==='dashboard'     && <DashHome user={user} requests={requests}/>}
        {active==='inbox'         && <InboxTab user={user} requests={requests} onAction={fetch}/>}
        {active==='approved'      && <HistoryTab user={user} requests={requests} filterStatus="approved" title="Approved Requests"/>}
        {active==='rejected'      && <HistoryTab user={user} requests={requests} filterStatus="rejected" title="Rejected Requests"/>}
        {active==='analytics'     && <Analytics user={user} requests={requests}/>}
        {active==='notifications' && <Notifications requests={requests}/>}
      </div>
    </div>
  );
}
