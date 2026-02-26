import React from 'react';
import { Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';
import { Shield, CheckCircle, XCircle, Users, LogOut, Bell, Search, UserCheck } from 'lucide-react';

const FacultyDashboard = ({ user, onLogout }) => {
  // 'user' is now fully utilized to prevent ESLint 'no-unused-vars' errors
  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', color: 'white' }}>

      {/* 1. SIDEBAR */}
      <aside className="sidebar" style={{ width: '280px', background: '#1e293b', padding: '2rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="d-flex align-items-center gap-2 mb-5">
          <Shield color="#6366f1" size={28} />
          <h4 className="fw-bold mb-0 text-white">SMART</h4>
        </div>

        <div className="flex-grow-1">
          <div className="nav-item active p-3 rounded-3 mb-2 d-flex align-items-center gap-3" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', cursor: 'pointer' }}>
            <UserCheck size={20}/> Approvals
          </div>
          <div className="nav-item p-3 rounded-3 mb-2 d-flex align-items-center gap-3 text-secondary" style={{ cursor: 'pointer' }}>
            <Users size={20}/> Student List
          </div>
        </div>

        <Button
          variant="link"
          className="text-danger text-decoration-none d-flex align-items-center gap-3 p-0 mt-auto"
          onClick={onLogout}
        >
          <LogOut size={20}/> Sign Out
        </Button>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="content" style={{ flexGrow: 1, padding: '3rem' }}>

        {/* HEADER: Utilizing the 'user' object here */}
        <header className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold text-white mb-1">Faculty Portal</h2>
            <p className="text-secondary mb-0">
              Welcome, <strong>{user.name}</strong> | Department of {user.dept}
            </p>
          </div>

          <div className="d-flex align-items-center gap-4">
             <div className="search-box d-none d-md-flex align-items-center px-3 py-2 rounded-pill" style={{ background: '#1e293b' }}>
                <Search size={18} className="text-muted me-2"/>
                <input type="text" placeholder="Search students..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
             </div>
             <Bell size={22} className="text-secondary cursor-pointer" />
             <div className="user-avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <span className="fw-bold" style={{ fontSize: '0.8rem' }}>{user.name.charAt(0)}</span>
             </div>
          </div>
        </header>

        {/* 3. STATISTICS ROW */}
        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '1.5rem' }}>
              <h6 className="text-secondary small text-uppercase fw-bold">Pending Requests</h6>
              <h2 className="text-warning fw-bold mb-0">24</h2>
              <small className="text-muted">Requires your attention</small>
            </Card>
          </Col>
          <Col md={4}>
            <Card style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '1.5rem' }}>
              <h6 className="text-secondary small text-uppercase fw-bold">Approved Today</h6>
              <h2 className="text-success fw-bold mb-0">15</h2>
              <small className="text-muted">Permissions granted</small>
            </Card>
          </Col>
          <Col md={4}>
            <Card style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '1.5rem' }}>
              <h6 className="text-secondary small text-uppercase fw-bold">Total Processed</h6>
              <h2 className="text-white fw-bold mb-0">1,240</h2>
              <small className="text-muted">This academic year</small>
            </Card>
          </Col>
        </Row>

        {/* 4. APPROVALS TABLE */}
        <Card style={{ background: '#1e293b', border: 'none', borderRadius: '24px', overflow: 'hidden' }}>
          <div className="p-4 border-bottom border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-white mb-0">Permission Queue</h5>
            <Badge bg="primary-soft" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>Live Updates</Badge>
          </div>

          <Table responsive hover variant="dark" className="mb-0" style={{ background: '#1e293b' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr className="text-secondary small text-uppercase">
                <th className="p-4 border-0">Student</th>
                <th className="p-4 border-0">Type</th>
                <th className="p-4 border-0">Reason</th>
                <th className="p-4 border-0 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="p-4">
                  <div className="fw-bold">Rahul Sharma</div>
                  <div className="small text-muted">Roll: 2026-CS-045</div>
                </td>
                <td className="p-4"><Badge bg="info" className="rounded-pill px-3">Medical OD</Badge></td>
                <td className="p-4 text-muted small">Hospital visit for general checkup</td>
                <td className="p-4 text-center">
                  <Button variant="success" size="sm" className="rounded-pill px-3 me-2 border-0" style={{ background: '#10b981' }}>
                    <CheckCircle size={14} className="me-1"/> Approve
                  </Button>
                  <Button variant="outline-danger" size="sm" className="rounded-pill px-3">
                    <XCircle size={14} className="me-1"/> Reject
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card>
      </main>
    </div>
  );
};

export default FacultyDashboard;