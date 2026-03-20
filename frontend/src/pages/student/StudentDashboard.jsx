import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, FileText, CheckCircle, XCircle, List, User, LogOut,
  Bell, BarChart2, Plus, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestService, authService } from '../../services/api';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#EF4444'];
const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, onLogout }) => {
  const links = [
    { key:'dashboard', icon:<Home size={18}/>,        label:'Dashboard' },
    { key:'new',       icon:<Plus size={18}/>,        label:'New Request' },
    { key:'history',   icon:<List size={18}/>,        label:'History' },
    { key:'accepted',  icon:<CheckCircle size={18}/>, label:'Accepted' },
    { key:'rejected',  icon:<XCircle size={18}/>,     label:'Rejected' },
    { key:'profile',   icon:<User size={18}/>,        label:'My Profile' },
    { key:'analytics', icon:<BarChart2 size={18}/>,   label:'Analytics' },
    { key:'notifications', icon:<Bell size={18}/>,    label:'Notifications' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon"><CheckCircle size={18} color="#fff"/></div>
        <h4>SmartPermit</h4>
      </div>
      {links.map(l => (
        <button key={l.key} className={`nav-link-item ${active===l.key?'active':''}`} onClick={()=>setActive(l.key)}>
          {l.icon} {l.label}
        </button>
      ))}
      <div className="sidebar-spacer" />
      <button className="nav-link-item logout" onClick={onLogout}>
        <LogOut size={18}/> Sign Out
      </button>
    </aside>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`badge-status badge-${status}`}>{status}</span>
);

// ─── Dashboard Home ───────────────────────────────────────────────────────────
const DashHome = ({ user, requests }) => {
  const stats = {
    total: requests.length,
    approved: requests.filter(r=>r.status==='approved').length,
    pending:  requests.filter(r=>r.status==='pending').length,
    rejected: requests.filter(r=>r.status==='rejected').length,
  };
  const pieData = [
    { name:'Pending', value: stats.pending },
    { name:'Approved', value: stats.approved },
    { name:'Rejected', value: stats.rejected },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div>
      <div className="top-header">
        <div className="greeting">
          <h2>{greeting}, {user.name} 👋</h2>
          <p>{user.department} | {user.collegeId}</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Total Requests', value:stats.total,    color:'var(--primary)', bg:'#EEF2FF' },
          { label:'Approved',       value:stats.approved, color:'var(--success)', bg:'#D1FAE5' },
          { label:'Pending',        value:stats.pending,  color:'var(--warning)', bg:'#FEF3C7' },
          { label:'Rejected',       value:stats.rejected, color:'var(--danger)',  bg:'#FEE2E2' },
        ].map(c => (
          <div key={c.label} className="card stat-card">
            <div className="stat-icon" style={{ background:c.bg, color:c.color }}>{c.value}</div>
            <div className="stat-value" style={{ color:c.color }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Request Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Recent Requests</h3>
          {requests.slice(0,5).map(r => (
            <div key={r._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:'.875rem' }}>{r.requestType}</div>
                <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              <StatusBadge status={r.status}/>
            </div>
          ))}
          {requests.length===0 && <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>No requests yet</p>}
        </div>
      </div>
    </div>
  );
};

// ─── New Request Form ─────────────────────────────────────────────────────────
const NewRequest = ({ user, onSuccess }) => {
  const [form, setForm]        = useState({ requestType:'Medical', reason:'', description:'', fromDate:'', toDate:'', recipientIds:[] });
  const [recipients, setRecs]  = useState([]);
  const [docFile, setDocFile]  = useState(null);
  const [loading, setLoading]  = useState(false);

  useEffect(() => {
    if (user?.department) {
      authService.getRecipients(user.department)
        .then(res => setRecs(res.data))
        .catch(() => {});
    }
  }, [user]);

  const toggleRecipient = (id) => {
    setForm(f => ({
      ...f,
      recipientIds: f.recipientIds.includes(id)
        ? f.recipientIds.filter(x=>x!==id)
        : [...f.recipientIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.recipientIds.length === 0) { toast.error('Select at least one recipient'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => {
        if (k === 'recipientIds') v.forEach(id => fd.append('recipientIds', id));
        else fd.append(k, v);
      });
      if (docFile) fd.append('document', docFile);
      await requestService.submit(fd);
      toast.success('Request submitted! Waiting for approval.');
      setForm({ requestType:'Medical', reason:'', description:'', fromDate:'', toDate:'', recipientIds:[] });
      setDocFile(null);
      onSuccess();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="top-header">
        <div className="greeting"><h2>New Permission Request</h2><p>Fill in the details below</p></div>
      </div>
      <div className="card" style={{ maxWidth:700 }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Request Type</label>
              <select className="form-control" value={form.requestType} onChange={e=>setForm({...form,requestType:e.target.value})}>
                {['Medical','Personal','Event','Campus Exit','Other'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input type="date" className="form-control" value={form.fromDate} onChange={e=>setForm({...form,fromDate:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input type="date" className="form-control" value={form.toDate} onChange={e=>setForm({...form,toDate:e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason (required)</label>
            <input className="form-control" maxLength={100} placeholder="Brief reason..." value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea className="form-control" rows={3} maxLength={500} placeholder="Detailed explanation..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          </div>
          <div className="form-group">
            <label className="form-label">Supporting Document (PDF/Image ≤ 5MB)</label>
            <input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setDocFile(e.target.files[0])}/>
          </div>

          <div className="form-group">
            <label className="form-label">Send To (select at least one)</label>
            <div style={{ border:'1.5px solid var(--border)', borderRadius:8, padding:'0.75rem', maxHeight:200, overflowY:'auto' }}>
              {recipients.length === 0
                ? <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Loading recipients...</p>
                : recipients.map(r => (
                    <label key={r._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 4px', cursor:'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.recipientIds.includes(r._id)}
                        onChange={() => toggleRecipient(r._id)}
                      />
                      <div>
                        <span style={{ fontWeight:600, fontSize:'.875rem' }}>{r.name}</span>
                        <span style={{ marginLeft:8, fontSize:'.75rem', color:'var(--text-muted)' }}>{r.role.toUpperCase()} · {r.department}</span>
                      </div>
                    </label>
                  ))
              }
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner"/> : <><FileText size={16}/> Submit Request</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Request History ──────────────────────────────────────────────────────────
const RequestHistory = ({ requests, onViewDetail }) => {
  const [filter, setFilter] = useState('all');
  const filtered = filter==='all' ? requests : requests.filter(r=>r.status===filter);
  return (
    <div>
      <div className="top-header">
        <div className="greeting"><h2>Request History</h2><p>All your permission requests</p></div>
        <select className="form-control" style={{ width:160 }} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr>
            <th>#</th><th>Type</th><th>Reason</th><th>From</th><th>To</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
            {filtered.map((r,i) => (
              <tr key={r._id}>
                <td>{i+1}</td>
                <td><b>{r.requestType}</b></td>
                <td style={{ maxWidth:200 }}>{r.reason}</td>
                <td>{new Date(r.fromDate).toLocaleDateString()}</td>
                <td>{new Date(r.toDate).toLocaleDateString()}</td>
                <td><StatusBadge status={r.status}/></td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={()=>onViewDetail(r)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No requests found</p>}
      </div>
    </div>
  );
};

// ─── Accepted Requests (QR) ───────────────────────────────────────────────────
const AcceptedRequests = ({ requests }) => {
  const approved = requests.filter(r=>r.status==='approved');
  const verifyBase = `${BASE_API}/qr/verify`;

  const downloadQR = (requestId) => {
    const svg = document.getElementById(`qr-${requestId}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas  = document.createElement('canvas');
    canvas.width = canvas.height = 220;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => { ctx.drawImage(img,0,0); const a=document.createElement('a'); a.download=`QR-${requestId}.png`; a.href=canvas.toDataURL(); a.click(); };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div>
      <div className="top-header">
        <div className="greeting"><h2>Accepted Requests ✅</h2><p>Show or download your QR pass</p></div>
      </div>
      {approved.length === 0
        ? <div className="card" style={{ textAlign:'center', padding:'3rem' }}><p style={{ color:'var(--text-muted)' }}>No approved requests yet</p></div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'1rem' }}>
            {approved.map(r => (
              <div key={r._id} className="card qr-card">
                <h4 style={{ marginBottom:4 }}>{r.requestType}</h4>
                <p style={{ fontSize:'.8rem', color:'var(--text-muted)', marginBottom:'1rem' }}>
                  {new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}
                </p>
                {r.qrToken ? (
                  <>
                    <div className="qr-wrap">
                      <QRCode id={`qr-${r._id}`} value={`${verifyBase}/${r.qrToken}`} size={180} />
                    </div>
                    <p style={{ fontSize:'.8rem', color:'var(--text-secondary)', margin:'0.5rem 0' }}>
                      Approved by: <b>{r.approvedBy?.name || 'N/A'}</b><br/>
                      Valid until: <b>{r.qrValidUntil ? new Date(r.qrValidUntil).toLocaleDateString() : '—'}</b>
                    </p>
                    <button className="btn btn-primary btn-block" onClick={()=>downloadQR(r._id)}>
                      ⬇️ Download QR
                    </button>
                  </>
                ) : (
                  <p style={{ color:'var(--text-muted)' }}>QR not generated yet</p>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  );
};

// ─── Rejected Requests ────────────────────────────────────────────────────────
const RejectedRequests = ({ requests, onResubmit }) => {
  const rejected = requests.filter(r=>r.status==='rejected');
  return (
    <div>
      <div className="top-header">
        <div className="greeting"><h2>Rejected Requests ❌</h2><p>Review rejection remarks</p></div>
      </div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Type</th><th>Reason</th><th>Rejection Remark</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {rejected.map(r => {
              const rejector = r.recipients?.find(rec=>rec.action==='rejected');
              return (
                <tr key={r._id}>
                  <td><b>{r.requestType}</b></td>
                  <td>{r.reason}</td>
                  <td style={{ color:'var(--danger)' }}>{rejector?.remarks || 'No remark provided'}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={()=>onResubmit(r)}>Re-submit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rejected.length===0 && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No rejected requests</p>}
      </div>
    </div>
  );
};

// ─── Profile ──────────────────────────────────────────────────────────────────
const Profile = ({ user }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name:user.name||'', email:user.email||'', phone:user.phone||'' });
  const [loading, setLoading] = useState(false);
  const { login, token }      = useAuth();

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await authService.updateProfile(form);
      login({ ...user, ...data }, token);
      toast.success('Profile updated');
      setEditing(false);
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const fields = [
    { label:'Full Name',   val:user.name },
    { label:'College ID',  val:user.collegeId },
    { label:'Email',       val:user.email },
    { label:'Role',        val:user.role },
    { label:'Department',  val:user.department },
    { label:'Year',        val:user.year||'—' },
    { label:'Section',     val:user.section||'—' },
    { label:'Phone',       val:user.phone||'—' },
  ];

  return (
    <div>
      <div className="top-header">
        <div className="greeting"><h2>My Profile</h2><p>View and edit your information</p></div>
        {!editing && <button className="btn btn-outline btn-sm" onClick={()=>setEditing(true)}>Edit Profile</button>}
      </div>
      <div className="card" style={{ maxWidth:580 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'1.75rem', fontWeight:800 }}>
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontWeight:700 }}>{user.name}</h3>
            <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>{user.role?.toUpperCase()} · {user.department}</p>
          </div>
        </div>

        {editing ? (
          <>
            {['name','email','phone'].map(k => (
              <div className="form-group" key={k}>
                <label className="form-label">{k.charAt(0).toUpperCase()+k.slice(1)}</label>
                <input className="form-control" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>
              </div>
            ))}
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary" onClick={save} disabled={loading}>{loading?<span className="spinner"/>:'Save Changes'}</button>
              <button className="btn btn-outline" onClick={()=>setEditing(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <div className="grid-2">
            {fields.map(f => (
              <div key={f.label} style={{ padding:'0.5rem 0' }}>
                <div style={{ fontSize:'.75rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:2 }}>{f.label}</div>
                <div style={{ fontWeight:500 }}>{f.val}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const Analytics = ({ requests }) => {
  const monthly = {};
  requests.forEach(r => {
    const key = new Date(r.createdAt).toLocaleString('default',{month:'short',year:'2-digit'});
    if (!monthly[key]) monthly[key] = { name:key, approved:0, pending:0, rejected:0 };
    monthly[key][r.status]++;
  });
  const barData = Object.values(monthly);
  const pieData = [
    { name:'Pending',  value: requests.filter(r=>r.status==='pending').length },
    { name:'Approved', value: requests.filter(r=>r.status==='approved').length },
    { name:'Rejected', value: requests.filter(r=>r.status==='rejected').length },
  ];
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>Analytics</h2><p>Your request trends</p></div></div>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
              {pieData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
            </Pie><Tooltip/></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Monthly Requests</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name" tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:12}}/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="approved" fill="#10B981" name="Approved"/>
              <Bar dataKey="pending"  fill="#F59E0B" name="Pending"/>
              <Bar dataKey="rejected" fill="#EF4444" name="Rejected"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ request, onClose }) => {
  if (!request) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <h3>Request Details</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem 1.5rem', marginBottom:'1rem' }}>
          {[
            ['Type', request.requestType],
            ['Status', ''], // rendered separately
            ['From', new Date(request.fromDate).toLocaleDateString()],
            ['To',   new Date(request.toDate).toLocaleDateString()],
            ['Reason', request.reason],
          ].map(([k,v]) => (
            <div key={k} style={{ padding:'6px 0' }}>
              <div style={{ fontSize:'.75rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' }}>{k}</div>
              {k==='Status' ? <StatusBadge status={request.status}/> : <div style={{ fontWeight:500 }}>{v}</div>}
            </div>
          ))}
        </div>
        {request.description && <p style={{ fontSize:'.875rem', color:'var(--text-secondary)', marginBottom:'1rem' }}>{request.description}</p>}
        <div>
          <div style={{ fontSize:'.8rem', fontWeight:700, marginBottom:6, color:'var(--text-secondary)', textTransform:'uppercase' }}>Approval Trail</div>
          {request.recipients?.map((rec,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:'.875rem' }}>
              <span>{rec.user?.name || 'Unknown'} ({rec.role})</span>
              <span><StatusBadge status={rec.action}/></span>
            </div>
          ))}
        </div>
        <div className="modal-footer"><button className="btn btn-outline" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
};

// ─── Notifications (stub) ─────────────────────────────────────────────────────
const Notifications = ({ requests }) => {
  const items = requests.slice(0,10).map(r => ({
    msg: `Your ${r.requestType} request is now ${r.status.toUpperCase()}`,
    time: new Date(r.updatedAt).toLocaleString(),
    status: r.status
  }));
  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>Notifications 🔔</h2><p>Latest updates on your requests</p></div></div>
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

// ─── Main Student Dashboard ───────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [active, setActive]   = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await requestService.getAll();
      setRequests(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleResubmit = (req) => {
    // Switch to new request tab (prefill is a UX enhancement)
    setActive('new');
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive} onLogout={handleLogout}/>
      <div className="main-content">
        {active==='dashboard'    && <DashHome user={user} requests={requests}/>}
        {active==='new'         && <NewRequest user={user} onSuccess={()=>{ fetchRequests(); setActive('history'); }}/>}
        {active==='history'     && <RequestHistory requests={requests} onViewDetail={r=>setSelectedReq(r)}/>}
        {active==='accepted'    && <AcceptedRequests requests={requests}/>}
        {active==='rejected'    && <RejectedRequests requests={requests} onResubmit={handleResubmit}/>}
        {active==='profile'     && <Profile user={user}/>}
        {active==='analytics'   && <Analytics requests={requests}/>}
        {active==='notifications' && <Notifications requests={requests}/>}
        {selectedReq && <DetailModal request={selectedReq} onClose={()=>setSelectedReq(null)}/>}
      </div>
    </div>
  );
}
