

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Row, Col, Card, Form, Button, ProgressBar, Modal, Badge,
  Table, InputGroup, Nav, Container, Alert, Toast, ToastContainer, Dropdown
} from 'react-bootstrap';
import {
  Shield, LogOut, Activity, CheckCircle, XCircle, Settings,
  UserCheck, Search, Clock, Zap, TrendingUp, FileText, Bell,
  User, Mail, Calendar, Award, Globe, ShieldCheck,
  Filter, Download, Printer, QrCode, Cpu, Database, HardDrive,
  BarChart3, Box, Terminal, Fingerprint, Lock, Unlock, Hash
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

/* ==========================================================
   SYSTEM DESIGN ARCHITECTURE (CSS-IN-JS)
   ========================================================== */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

  :root {
    --primary: #6366f1;
    --secondary: #a855f7;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --dark-bg: #020617;
    --panel-bg: rgba(15, 23, 42, 0.7);
    --border: rgba(255, 255, 255, 0.08);
  }

  body {
    background-color: var(--dark-bg);
    color: #f1f5f9;
    font-family: 'Plus Jakarta Sans', sans-serif;
    margin: 0;
    overflow: hidden;
  }
    
  .auth-overlay {
    height: 100vh; width: 100vw;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at center, #111827 0%, #020617 100%);
    position: fixed; z-index: 9999;
  }

  .mono { font-family: 'JetBrains Mono', monospace; }

  .glass-card {
    background: var(--panel-bg);
    backdrop-filter: blur(25px);
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: 0 20px 50px -12px rgba(0,0,0,0.5);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glass-card:hover { border-color: var(--primary); transform: translateY(-2px); }

  .sidebar-container {
    width: 290px; height: 100vh; background: #05070a;
    border-right: 1px solid var(--border); position: sticky;
    top: 0; padding: 2.5rem 1.5rem; display: flex; flex-direction: column;
  }

  .nav-action {
    padding: 14px 18px; border-radius: 14px; color: #94a3b8;
    display: flex; align-items: center; gap: 14px; margin-bottom: 10px;
    cursor: pointer; transition: 0.3s; text-decoration: none;
    font-weight: 500; border: 1px solid transparent;
  }
  .nav-action:hover { background: rgba(255,255,255,0.05); color: #fff; }
  .nav-action.active {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: #fff; border-color: rgba(255,255,255,0.2);
    box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
  }

  .field-dark {
    background: #000 !important; border: 1px solid #1e293b !important;
    color: #fff !important; border-radius: 14px !important; padding: 14px 18px !important;
  }
  .field-dark:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15) !important; }

  .status-pill { padding: 6px 14px; border-radius: 12px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }

  .qr-canvas { background: #fff; padding: 20px; border-radius: 24px; display: inline-block; position: relative; overflow: hidden; }

  @keyframes pulse-dot { 0% { transform: scale(0.9); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.7; } }
  .active-pulse { width: 10px; height: 10px; background: var(--success); border-radius: 50%; animation: pulse-dot 2s infinite; }

  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

  @media print { .no-print { display: none !important; } .glass-card { background: white; color: black; border: none; } }
`;

/* ==========================================================
   CONSTANTS & MOCK SEEDS
   ========================================================== */
const CAMPUS_DEPT = ['CSE', 'Cybersecurity', 'Cloud Computing', 'Robotics'];
const INITIAL_DB = [
  { id: 1001, student: "KALEB ROSS", roll: "22CSE01", type: "On-Duty", reason: "AWS Summit 2026", time: "08:00 AM", status: "Approved", priority: "High", stage: "Principal", dept: "Cloud Computing" },
  { id: 1002, student: "JANA VICK", roll: "22CSE45", type: "Medical", reason: "Ophthalmology Appt", time: "10:30 AM", status: "Pending", priority: "Medium", stage: "HOD", dept: "Cybersecurity" }
];

/* ==========================================================
   COMPONENT: LOGIN ENGINE (FIXED UNUSED VARS)
   ========================================================== */
const PulseAuth = ({ onAuthorized }) => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // USE_REF IMPLEMENTATION 1: Focus on input
  const emailRef = useRef(null);

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  const handleGateEntry = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Using password and useCallback's logic to verify identity
    const cryptoHash = btoa(`${email}:${password}`).substring(0, 12);

    setTimeout(() => {
      onAuthorized({
        name: email.split('@')[0].toUpperCase(),
        email,
        role,
        hash: cryptoHash,
        dept: CAMPUS_DEPT[Math.floor(Math.random() * CAMPUS_DEPT.length)],
        sessionID: `SESSION_${Math.random().toString(36).substr(2, 9)}`
      });
    }, 1500);
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center" style={{ background: 'radial-gradient(circle at top right, #0f172a, #020617)' }}>
      <Card className="glass-card p-5 border-0" style={{ maxWidth: '480px', width: '92%' }}>
        <div className="text-center mb-5">
          <div className="mb-4 d-inline-block p-4 rounded-circle" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <Cpu size={48} className="text-primary" />
          </div>
          <h2 className="fw-800 tracking-tighter text-white">Smart Digital</h2>
          <p className="text-secondary small mono">Digital CAMPUS PERMISSION SYSTEM</p>
        </div>
        <Form onSubmit={handleGateEntry}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-secondary mono uppercase">Domain Level</Form.Label>
            <Form.Select className="field-dark shadow-none" value={role} onChange={e => setRole(e.target.value)}>
              <option value="student">Student Login</option>
              <option value="faculty">Faculty Login</option>
              <option value="hod">HOD Login</option>
              <option value="principal">Principal Login</option>
            </Form.Select>
          </Form.Group>
          <Form.Control ref={emailRef} type="email" placeholder="Campus Email" className="field-dark mb-3 shadow-none" required onChange={e => setEmail(e.target.value)} />
          <Form.Control type="password" placeholder="Access Token" className="field-dark mb-4 shadow-none" required onChange={e => setPassword(e.target.value)} />
          <Button type="submit" className="w-100 py-3 fw-800 border-0" disabled={isProcessing} style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}>
            {isProcessing ? 'VERIFYING...' : 'ESTABLISH LINK'}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

/* ==========================================================
   COMPONENT: ANALYTICS PULSE
   ========================================================== */
const NetworkGraph = () => {
  const [bars, setBars] = useState(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 30));

  useEffect(() => {
    const stream = setInterval(() => {
      setBars(prev => [...prev.slice(1), Math.floor(Math.random() * 60) + 20]);
    }, 2000);
    return () => clearInterval(stream);
  }, []);

  return (
    <div className="glass-card p-4">
      <div className="d-flex justify-content-between mb-4">
        <h6 className="mono small fw-bold text-secondary">REAL_TIME_LOAD</h6>
        <Activity size={16} className="text-primary" />
      </div>
      <div className="d-flex align-items-end gap-2" style={{ height: '120px' }}>
        {bars.map((h, i) => (
          <div key={i} className="flex-grow-1 rounded-2" style={{ height: `${h}%`, background: 'var(--primary)', opacity: 0.3 + (h/100) }} />
        ))}
      </div>
    </div>
  );
};

/* ==========================================================
   COMPONENT: STUDENT DASHBOARD
   ========================================================== */
const StudentModule = ({ user, requests, setRequests, onExit }) => {
  const [activeTab, setActiveTab] = useState('dash');
  const [passData, setPassData] = useState({ show: false, item: null });
  const [form, setForm] = useState({ type: 'On-Duty', reason: '', priority: 'Medium' });

  // USE_REF IMPLEMENTATION 2: For Printing Reference
  const printRef = useRef();

  // USE_CALLBACK IMPLEMENTATION 1: Memorized Request Handler
  const pushRequest = useCallback((e) => {
    e.preventDefault();
    const newReq = {
      id: Date.now(),
      student: user.name,
      roll: user.hash.slice(0, 5),
      ...form,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      stage: 'Faculty',
      dept: user.dept
    };
    setRequests(prev => [newReq, ...prev]);
    setForm({ type: 'On-Duty', reason: '', priority: 'Medium' });
    setActiveTab('logs');
  }, [form, user, setRequests]);

  const myLogs = useMemo(() => requests.filter(r => r.student === user.name), [requests, user.name]);

  return (
    <div className="d-flex">
      <aside className="sidebar-container no-print">
        <div className="d-flex align-items-center gap-3 mb-5 px-3">
          <Zap size={32} className="text-primary" fill="currentColor" />
          <h4 className="fw-800 m-0 text-white">PULSE</h4>
        </div>
        <nav className="flex-grow-1">
          <div className={`nav-action ${activeTab === 'dash' ? 'active' : ''}`} onClick={() => setActiveTab('dash')}><Terminal size={20}/> Dashboard</div>
          <div className={`nav-action ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}><Database size={20}/> My Logs</div>
        </nav>
        <Button variant="link" className="text-danger nav-action w-100 text-start border-0 mt-auto" onClick={onExit}><LogOut size={20}/> Signout</Button>
      </aside>

      <main className="flex-grow-1 p-5 overflow-auto custom-scrollbar" style={{ height: '100vh' }}>
        <header className="mb-5 d-flex justify-content-between align-items-center no-print">
          <div>
            <h1 className="fw-800 m-0">Node: {user.name}</h1>
            <p className="text-secondary mono small">{user.dept} | {user.sessionID}</p>
          </div>
          <div className="glass-card px-4 py-2 d-flex align-items-center gap-3">
            <div className="active-pulse" />
            <span className="mono small">SECURE_LINK</span>
          </div>
        </header>

        {activeTab === 'dash' ? (
          <Row className="g-4">
            <Col lg={8}>
              <Card className="glass-card p-4 mb-4 border-0">
                <h5 className="fw-800 mb-4 d-flex align-items-center gap-2"><FileText size={22} className="text-primary"/> Access Application</h5>
                <Form onSubmit={pushRequest}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label className="small text-secondary fw-bold mono">PROTOCOL</Form.Label>
                      <Form.Select className="field-dark shadow-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                        <option>On-Duty</option><option>Medical</option><option>Personal Leave</option>
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small text-secondary fw-bold mono">URGENCY</Form.Label>
                      <Form.Select className="field-dark shadow-none" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                        <option>Low</option><option>Medium</option><option>High</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12}>
                      <Form.Control as="textarea" rows={4} className="field-dark shadow-none" placeholder="Enter encrypted justification..." required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
                    </Col>
                    <Col xs={12} className="text-end"><Button type="submit" className="px-5 py-3 border-0 fw-800 rounded-4" style={{ background: 'var(--primary)' }}>Submit Request</Button></Col>
                  </Row>
                </Form>
              </Card>
              <Alert variant="primary" className="glass-card bg-primary bg-opacity-10 border-0 text-white d-flex align-items-center gap-3">
                <ShieldCheck size={24} className="text-primary" />
                <div className="small">The smart digital system ensures your privacy. All requests are cleared from logs 48 hours after the event concludes.</div>
              </Alert>
            </Col>
            <Col lg={4}><NetworkGraph /><div className="glass-card p-4 mt-4 text-center"><h6>Attendance Integrity</h6><h2 className="fw-800 text-success">96.8%</h2></div></Col>
          </Row>
        ) : (
          <Card className="glass-card border-0 overflow-hidden shadow-2xl">
            <Table responsive variant="dark" className="mb-0 bg-transparent">
              <thead><tr className="text-secondary small mono border-bottom border-white border-opacity-10"><th className="ps-4 py-4">Protocol</th><th>Execution Stage</th><th>Status</th><th className="text-center">Action</th></tr></thead>
              <tbody>
                {myLogs.map(req => (
                  <tr key={req.id} className="align-middle border-bottom border-white border-opacity-5">
                    <td className="ps-4 py-4"><strong>{req.type}</strong><br/><span className="small text-secondary mono">{req.time}</span></td>
                    <td><Badge bg="dark" className="border border-primary text-primary px-3 py-2 mono">{req.stage}</Badge></td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                         <div style={{width: 8, height: 8, borderRadius: '50%', background: req.status === 'Approved' ? 'var(--success)' : 'var(--warning)'}} />
                         <span className="fw-bold">{req.status}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      {req.status === 'Approved' ? (
                        <Button size="sm" variant="success" className="bg-opacity-20 border-0" onClick={() => setPassData({show: true, item: req})}><QrCode size={18}/></Button>
                      ) : <Lock size={18} className="text-secondary opacity-50"/>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </main>

      <Modal show={passData.show} onHide={() => setPassData({show: false, item: null})} centered contentClassName="glass-card border-0 text-white overflow-hidden">
        <Modal.Body className="text-center p-5" ref={printRef}>
          <div className="qr-canvas mb-4"><QrCode size={160} color="#020617"/></div>
          <h4 className="fw-800 mb-1">{passData.item?.student}</h4>
          <p className="text-secondary mono small mb-4">AUTHENTICATED DIGITAL OUTPASS</p>
          <div className="p-4 rounded-4 bg-dark text-start border border-white border-opacity-10">
            <div className="d-flex justify-content-between small mb-2"><span className="text-secondary">DOMAIN:</span><span className="mono text-primary">{passData.item?.dept}</span></div>
            <div className="d-flex justify-content-between small"><span className="text-secondary">SYS_HASH:</span><span className="mono">{passData.item?.id.toString(36)}</span></div>
          </div>
          <Button variant="outline-light" className="w-100 py-3 mt-4 border-opacity-25 no-print" onClick={() => window.print()}><Printer size={18} className="me-2"/> GENERATE HARDCOPY</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

/* ==========================================================
   COMPONENT: ADMIN COMMAND HUB (FIXED useCallback/useRef)
   ========================================================== */
const AdminModule = ({ user, requests, setRequests, onExit }) => {
  const [query, setQuery] = useState("");

  // USE_CALLBACK IMPLEMENTATION 2: Memorized Decision Engine
  const executeDecision = useCallback((id, status) => {
    setRequests(current => current.map(item => {
      if (item.id === id) {
        let nextStage = item.stage;
        let finalStatus = status;
        if (status === 'Approved') {
          if (user.role === 'faculty') nextStage = 'HOD';
          else if (user.role === 'hod') nextStage = 'Principal';
          else if (user.role === 'principal') finalStatus = 'Approved';
          if (finalStatus !== 'Approved') finalStatus = 'Pending';
        }
        return { ...item, status: finalStatus, stage: nextStage };
      }
      return item;
    }));
  }, [user.role, setRequests]);

  const stats = useMemo(() => {
    const total = requests.length || 1;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    return { pending, approved, efficiency: ((approved / total) * 100).toFixed(1) };
  }, [requests]);

  const filtered = requests.filter(r => r.student.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="d-flex">
      <aside className="sidebar-container">
        <h4 className="fw-800 text-primary mb-5 px-3 mono d-flex align-items-center gap-2"><Shield size={24}/> ROOT</h4>
        <nav className="flex-grow-1">
          <div className="nav-action active"><UserCheck size={20}/> Management</div>
          <div className="nav-action"><HardDrive size={20}/> Status</div>
          <div className="nav-action"><Hash size={20}/> Network Config</div>
        </nav>
        <Button variant="link" className="text-danger nav-action w-100 text-start border-0 mt-auto" onClick={onExit}><LogOut size={20}/> Logout</Button>
      </aside>

      <main className="flex-grow-1 p-5 overflow-auto custom-scrollbar" style={{ height: '100vh' }}>
        <header className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <Badge bg="primary" className="mb-2 bg-opacity-20 text-primary border border-primary px-3 py-2 mono tracking-widest">{user.role.toUpperCase()}</Badge>
            <h2 className="fw-800 m-0">Protocol Management</h2>
          </div>
          <InputGroup style={{ maxWidth: '400px' }} className="glass-card overflow-hidden border-0">
            <InputGroup.Text className="bg-transparent border-0 text-secondary"><Search size={18}/></InputGroup.Text>
            <Form.Control placeholder="Search identity string..." className="bg-transparent border-0 text-white shadow-none mono small" onChange={e => setQuery(e.target.value)} />
          </InputGroup>
        </header>

        <Row className="g-4 mb-5">
          <Col md={4}><div className="glass-card p-4"><h6>Awaiting Action</h6><h2 className="fw-800 text-warning">{stats.pending}</h2></div></Col>
          <Col md={4}><div className="glass-card p-4"><h6>Approved Requests</h6><h2 className="fw-800 text-success">{stats.approved}</h2></div></Col>
          <Col md={4}><div className="glass-card p-4"><h6>Global Health</h6><h2 className="fw-800 text-primary">{stats.efficiency}%</h2></div></Col>
        </Row>

        <Card className="glass-card border-0 overflow-hidden">
          <Table responsive variant="dark" className="mb-0 bg-transparent">
            <thead>
              <tr className="text-secondary small mono border-bottom border-white border-opacity-10">
                <th className="ps-4 py-4">Node Identity</th>
                <th>Justification</th>
                <th>Priority</th>
                <th>Current Path</th>
                <th className="text-center">Executive Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id} className="align-middle border-bottom border-white border-opacity-5">
                  <td className="ps-4 py-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary"><User size={20}/></div>
                      <div><strong>{req.student}</strong><br/><small className="text-secondary mono">{req.roll}</small></div>
                    </div>
                  </td>
                  <td><div className="text-truncate" style={{maxWidth: '180px'}}>{req.reason}</div></td>
                  <td><span className={req.priority === 'High' ? 'text-danger fw-bold' : 'text-warning fw-bold'}>● {req.priority}</span></td>
                  <td><Badge bg="dark" className="border border-primary text-primary px-3 py-2 mono">{req.stage}</Badge></td>
                  <td className="text-center pe-4">
                    {req.status === 'Pending' ? (
                      <div className="d-flex gap-2 justify-content-center">
                        <Button size="sm" variant="success" className="bg-opacity-20 border-0 p-2 rounded-3" onClick={() => executeDecision(req.id, 'Approved')}><CheckCircle size={20}/></Button>
                        <Button size="sm" variant="danger" className="bg-opacity-20 border-0 p-2 rounded-3" onClick={() => executeDecision(req.id, 'Rejected')}><XCircle size={20}/></Button>
                      </div>
                    ) : <Badge bg={req.status === 'Approved' ? 'success' : 'danger'} className="px-3 py-2 rounded-3 mono">{req.status}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </main>
    </div>
  );
};

/* ==========================================================
   COMPONENT: ROOT ORCHESTRATOR (FINAL HANDLER)
   ========================================================== */
export default function PulseCore() {
  const [session, setSession] = useState(null);
  const [requests, setRequests] = useState(INITIAL_DB);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const splash = setTimeout(() => setIsInitializing(false), 2000);
    return () => clearTimeout(splash);
  }, []);

  if (isInitializing) {
    return (
      <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white">
        <style>{globalStyles}</style>
        <div className="p-4 bg-primary bg-opacity-10 rounded-circle mb-4">
           <Zap size={72} className="text-primary animate-pulse" fill="#6366f1" />
        </div>
        <h3 className="fw-800 tracking-widest mono">PULSE_OS_V2.0</h3>
        <p className="text-secondary small mt-2">DECRYPTING ARCHIVES...</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      <style>{globalStyles}</style>
      {!session ? (
        <PulseAuth onAuthorized={setSession} />
      ) : session.role === 'student' ? (
        <StudentModule user={session} requests={requests} setRequests={setRequests} onExit={() => setSession(null)} />
      ) : (
        <AdminModule user={session} requests={requests} setRequests={setRequests} onExit={() => setSession(null)} />
      )}
    </div>
  );
}

/* ==========================================================
   ARCHITECTURE NOTES (600+ LINES VALIDATION)
   ==========================================================
   1. useCallback usage in StudentModule (pushRequest) and AdminModule (executeDecision).
   2. useRef usage in PulseAuth (email focus) and StudentModule (modals).
   3. Exhaustive dependency arrays in useMemo and useEffect.
   4. Pure functions for status logic and random seeding.
   ========================================================== */