import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Clock, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { qrService } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, onLogout, sidebarOpen }) => {
  const links = [
    { key:'scan',    icon:<Camera size={18}/>,       label:'Scan QR' },
    { key:'history', icon:<Clock size={18}/>,        label:'Scan History' },
  ];
  return (
    <aside className={`sidebar ${sidebarOpen?'sidebar-open':''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon"><CheckCircle size={18} color="#fff"/></div>
        <h4>Gate Watch</h4>
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

// ─── QR Scanner Page ──────────────────────────────────────────────────────────
const ScanPage = () => {
  const scannerRef = useRef(null);
  const [scanResult, setScanResult]   = useState(null); // { result, student, request, approvedBy, validUntil }
  const [scanning,   setScanning]     = useState(false);
  const [logging,    setLogging]      = useState(false);
  const [scannerLib, setScannerLib]   = useState(null);
  const scannerIdRef = useRef('html5qr-scanner');

  // Dynamically import html5-qrcode to avoid SSR issues
  useEffect(() => {
    import('html5-qrcode').then(mod => setScannerLib(mod));
    return () => stopScanner();
  }, []);

  const stopScanner = () => {
    if (window.__html5QrScanner) {
      window.__html5QrScanner.stop().catch(() => {});
      window.__html5QrScanner = null;
    }
    setScanning(false);
  };

  const startScanner = async () => {
    if (!scannerLib) { toast.error('Scanner not loaded yet'); return; }
    setScanResult(null);
    setScanning(true);

    const { Html5Qrcode } = scannerLib;
    const scanner = new Html5Qrcode(scannerIdRef.current);
    window.__html5QrScanner = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        async (decodedText) => {
          stopScanner();
          // Extract token from URL (value=.../api/qr/verify/<token>) or use raw text
          const match = decodedText.match(/\/api\/qr\/verify\/(.+)/);
          const token = match ? match[1] : decodedText;
          try {
            const { data } = await qrService.verify(token);
            setScanResult(data);
          } catch(err) {
            setScanResult({ result:'invalid', message: err.response?.data?.message || 'Verification failed' });
          }
        },
        () => {} // ignore frame errors
      );
    } catch(err) {
      toast.error('Cannot access camera: ' + err.message);
      setScanning(false);
    }
  };

  const handleMarkScanned = async () => {
    if (!scanResult) return;
    setLogging(true);
    try {
      await qrService.saveScanLog({
        requestId: scanResult.request?.id,
        studentId: scanResult.student?._id,
        result:    scanResult.result,
        details:   `Scanned at gate — ${new Date().toLocaleString()}`
      });
      toast.success('Scan logged successfully!');
      setScanResult(null);
    } catch { toast.error('Failed to log scan'); }
    finally { setLogging(false); }
  };

  const ResultCard = () => {
    if (!scanResult) return null;
    const { result, student, request, approvedBy, validUntil } = scanResult;
    const cardClass = result==='valid' ? 'scan-valid' : result==='expired' ? 'scan-expired' : 'scan-invalid';
    const icon = result==='valid' ? '✅' : result==='expired' ? '⚠️' : '❌';
    const label = result==='valid' ? 'VALID PASS' : result==='expired' ? 'EXPIRED PASS' : 'INVALID / TAMPERED';

    return (
      <div className={`scan-result-card ${cardClass}`}>
        <h3 style={{ fontWeight:800, marginBottom:'0.5rem' }}>{icon} {label}</h3>
        {student && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginTop:'1rem' }}>
              {[
                ['Name',       student.name],
                ['Roll No',    student.collegeId],
                ['Department', student.department],
                ['Year/Sec',   `${student.year||'—'} / ${student.section||'—'}`],
                ['Request Type', request?.requestType],
                ['From',       request?.fromDate ? new Date(request.fromDate).toLocaleDateString() : '—'],
                ['To',         request?.toDate   ? new Date(request.toDate).toLocaleDateString()   : '—'],
                ['Approved By',approvedBy?.name || '—'],
                ['Valid Until',validUntil ? new Date(validUntil).toLocaleDateString() : '—'],
              ].map(([k,v]) => (
                <div key={k} style={{ padding:'4px 0' }}>
                  <div style={{ fontSize:'.7rem', fontWeight:700, color:'#374151', textTransform:'uppercase' }}>{k}</div>
                  <div style={{ fontWeight:600, fontSize:'.875rem' }}>{v}</div>
                </div>
              ))}
            </div>
            {result === 'valid' && (
              <button className="btn btn-primary btn-block" style={{ marginTop:'1rem' }} onClick={handleMarkScanned} disabled={logging}>
                {logging ? <span className="spinner"/> : '📌 Mark as Scanned'}
              </button>
            )}
          </>
        )}
        {!student && <p style={{ marginTop:8, fontWeight:500 }}>{scanResult.message}</p>}
        <button className="btn btn-outline btn-sm" style={{ marginTop:'1rem' }} onClick={()=>setScanResult(null)}>
          Scan Again
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="top-header"><div className="greeting"><h2>🔍 Scan QR Code</h2><p>Point the camera at a student's QR pass</p></div></div>
      <div style={{ display:'grid', gridTemplateColumns:scanning||scanResult?'1fr 1fr':'1fr', gap:'1.5rem', maxWidth:900 }}>
        <div className="card">
          <div id={scannerIdRef.current} style={{ width:'100%', minHeight:280 }}/>
          {!scanning && !scanResult && (
            <div style={{ textAlign:'center', padding:'1rem' }}>
              <p style={{ color:'var(--text-muted)', marginBottom:'1rem' }}>Camera is off. Click below to start scanning.</p>
              <button className="btn btn-primary" onClick={startScanner} disabled={!scannerLib}>
                <Camera size={18}/> Start Scanner
              </button>
            </div>
          )}
          {scanning && (
            <div style={{ textAlign:'center', marginTop:'1rem' }}>
              <button className="btn btn-outline btn-sm" onClick={stopScanner}>Stop</button>
            </div>
          )}
        </div>
        {scanResult && <ResultCard/>}
      </div>
    </div>
  );
};

// ─── Scan History Page ────────────────────────────────────────────────────────
const HistoryPage = () => {
  const [logs,    setLogs]   = useState([]);
  const [search,  setSearch] = useState('');
  const [dateFilter, setDate] = useState('');

  useEffect(() => {
    qrService.getScanHistory()
      .then(res => setLogs(res.data))
      .catch(() => {});
  }, []);

  const filtered = logs.filter(l => {
    const student = l.student;
    const matchSearch = !search ||
      student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      student?.collegeId?.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter ||
      new Date(l.scannedAt).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
    return matchSearch && matchDate;
  });

  const resultStyle = { valid:'badge-approved', expired:'badge-pending', invalid:'badge-rejected' };

  return (
    <div>
      <div className="top-header">
        <div className="greeting"><h2>Scan History</h2><p>All your QR scan records</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <input className="form-control" placeholder="Search student..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:200 }}/>
          <input type="date" className="form-control" value={dateFilter} onChange={e=>setDate(e.target.value)} style={{ width:160 }}/>
        </div>
      </div>
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr><th>#</th><th>Date & Time</th><th>Student</th><th>Roll No</th><th>Request Type</th><th>Approved By</th><th>Result</th></tr></thead>
          <tbody>
            {filtered.map((l,i) => (
              <tr key={l._id}>
                <td>{i+1}</td>
                <td style={{ fontSize:'.8rem' }}>{new Date(l.scannedAt).toLocaleString()}</td>
                <td>{l.student?.name || '—'}</td>
                <td>{l.student?.collegeId || '—'}</td>
                <td>{l.request?.requestType || '—'}</td>
                <td>{l.scannedBy?.name || '—'}</td>
                <td><span className={`badge-status ${resultStyle[l.result]||'badge-pending'}`}>{l.result}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>No scan records found</p>}
      </div>
    </div>
  );
};

// ─── Main Watchman Dashboard ──────────────────────────────────────────────────
export default function WatchmanDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [active, setActive] = useState('scan');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNavClick = (key) => { setActive(key); setSidebarOpen(false); };

  return (
    <div className="app-shell">
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      <div className={`mobile-overlay ${sidebarOpen?'active':''}`} onClick={() => setSidebarOpen(false)}/>
      <Sidebar active={active} setActive={handleNavClick} onLogout={handleLogout} sidebarOpen={sidebarOpen}/>
      <div className="main-content">
        {active==='scan'    && <ScanPage/>}
        {active==='history' && <HistoryPage/>}
      </div>
    </div>
  );
}
