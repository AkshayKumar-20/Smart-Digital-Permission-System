import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Inbox, CheckCircle, XCircle, Download, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

const StatusBadge = ({ status }) => <span className={`badge-status badge-${status}`}>{status}</span>;

const Sidebar = ({ active, setActive, onLogout }) => {
  const links = [
    { key:'dashboard', icon:<Home size={18}/>,        label:'Dashboard' },
    { key:'inbox',     icon:<Inbox size={18}/>,       label:'Inbox' },
    { key:'approved',  icon:<CheckCircle size={18}/>, label:'Approved' },
    { key:'rejected',  icon:<XCircle size={18}/>,     label:'Rejected' },
    { key:'analytics', icon:<BarChart size={18}/>,    label:'Analytics' },
    { key:'reports',   icon:<Download size={18}/>,    label:'Reports' },
    { key:'notifications', icon:<Bell size={18}/>,    label:'Notifications' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon"><CheckCircle size={18} color="#fff"/></div>
        <h4>Principal</h4>
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
  const pending  = requests.filter(r=>r.status==='pending').length;
  const approved = requests.filter(r=>r.status==='approved').length;
  const rejected = requests.filter(r=>r.status==='rejected').length;
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>Principal Dashboard 👋</h2><p>College-wide oversight</p></div></div>
      <div className="grid-4" style={{ marginBottom:'1.5rem' }}>
        {[
          ['Total', requests.length, 'var(--primary)'],
          ['Pending', pending, 'var(--warning)'],
          ['Approved', approved, 'var(--success)'],
          ['Rejected', rejected, 'var(--danger)'],
        ].map(([l,v,c])=>(
          <div key={l} className="card stat-card"><div className="stat-value" style={{ color:c }}>{v}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Pending (All Departments)</h3>
        {requests.filter(r=>r.status==='pending').slice(0,8).map(r=>(
          <div key={r._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight:600 }}>{r.student?.name} <span style={{ color:'var(--text-muted)', fontSize:'.8rem' }}>({r.student?.department})</span></div>
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
  const [remarks, setRemarks] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <h3>{type==='approve'?'✅ Final Approval':'❌ Reject'} Request</h3>
        <p style={{ fontSize:'.875rem', color:'var(--text-secondary)', marginBottom:'1rem' }}>{request?.student?.name} — {request?.requestType}</p>
        <div className="form-group">
          <label className="form-label">Remarks{type==='reject'?' (required)':' (optional)'}</label>
          <textarea className="form-control" rows={3} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Add remarks..."/>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className={`btn ${type==='approve'?'btn-success':'btn-danger'}`} onClick={()=>onConfirm(remarks)}>
            {type==='approve'?'Final Approve':'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InboxTab = ({ user, requests, onAction }) => {
  const [modal, setModal] = useState(null);
  const myPending = requests.filter(r => r.recipients?.some(rec => rec.user?._id === user.id && rec.action==='pending'));
  const handleConfirm = async (remarks) => {
    try {
      if (modal.type==='approve') { await requestService.approve(modal.request._id, { remarks }); toast.success('Final approval done — QR generated!'); }
      else { await requestService.reject(modal.request._id, { remarks }); toast.success('Rejected'); }
      onAction(); setModal(null);
    } catch(err) { toast.error(err.response?.data?.message||'Action failed'); }
  };
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>Inbox</h2><p>{myPending.length} awaiting final decision</p></div></div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Student</th><th>Type</th><th>Dept</th><th>Dates</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {myPending.map(r=>(
              <tr key={r._id}>
                <td><div style={{ fontWeight:600 }}>{r.student?.name}</div><div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{r.student?.collegeId}</div></td>
                <td>{r.requestType}</td>
                <td>{r.student?.department}</td>
                <td style={{ fontSize:'.8rem' }}>{new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}</td>
                <td style={{ maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.reason}</td>
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

const HistoryTab = ({ requests, filterStatus, title }) => {
  const filtered = requests.filter(r=>r.status===filterStatus);
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>{title}</h2></div></div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Student</th><th>Dept</th><th>Type</th><th>Dates</th><th>Approved By</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r._id}>
                <td><div style={{ fontWeight:600 }}>{r.student?.name}</div><div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{r.student?.collegeId}</div></td>
                <td>{r.student?.department}</td>
                <td>{r.requestType}</td>
                <td style={{ fontSize:'.8rem' }}>{new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}</td>
                <td>{r.approvedBy?.name||'—'}</td>
                <td><StatusBadge status={r.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No {filterStatus} requests</p>}
      </div>
    </div>
  );
};

const Reports = ({ requests }) => {
  const downloadCSV = () => {
    const rows = [['Student','Roll No','Department','Type','Reason','From','To','Status','Approved By']];
    requests.forEach(r => {
      rows.push([r.student?.name, r.student?.collegeId, r.student?.department, r.requestType, r.reason,
        new Date(r.fromDate).toLocaleDateString(), new Date(r.toDate).toLocaleDateString(),
        r.status, r.approvedBy?.name||'']);
    });
    const csv = rows.map(r=>r.join(',')).join('\n');
    const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download='requests_report.csv'; a.click();
  };
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>Reports</h2><p>Download college-wide data</p></div></div>
      <div className="card">
        <p style={{ marginBottom:'1rem', color:'var(--text-secondary)' }}>Total requests: <b>{requests.length}</b></p>
        <button className="btn btn-primary" onClick={downloadCSV}><Download size={16}/> Download CSV Report</button>
      </div>
    </div>
  );
};

export default function PrincipalDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const fetch = useCallback(async () => {
    try { const { data } = await requestService.getAll(); setRequests(data); } catch {}
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const handleLogout = () => { logout(); navigate('/login'); };
  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive} onLogout={handleLogout}/>
      <div className="main-content">
        {active==='dashboard'     && <DashHome user={user} requests={requests}/>}
        {active==='inbox'         && <InboxTab user={user} requests={requests} onAction={fetch}/>}
        {active==='approved'      && <HistoryTab requests={requests} filterStatus="approved" title="All Approved Requests"/>}
        {active==='rejected'      && <HistoryTab requests={requests} filterStatus="rejected" title="All Rejected Requests"/>}
        {active==='analytics'     && <div className="card" style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>College analytics coming soon</div>}
        {active==='reports'       && <Reports requests={requests}/>}
        {active==='notifications' && <div className="card" style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No notifications</div>}
      </div>
    </div>
  );
}
