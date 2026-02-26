import React, { useState } from 'react';
import { Row, Col, Card, ProgressBar, Badge, Button, Modal, Form } from 'react-bootstrap';
import { Activity, Send, User, Settings, LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function StudentDashboard({ user, onLogout }) {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="d-flex" style={{ background: '#0f172a', minHeight: '100vh', color: 'white' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: '#1e293b', padding: '2rem', borderRight: '1px solid #334155' }}>
        <h4 className="fw-bold text-primary mb-5">SMART SYSTEM</h4>
        <nav>
          <div className="mb-3 p-3 rounded bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-3">
            <Activity size={20}/> Dashboard
          </div>
          <div className="mb-3 p-3 rounded text-secondary d-flex align-items-center gap-3 cursor-pointer" onClick={() => setShowEdit(true)}>
            <Settings size={20}/> Profile Settings
          </div>
        </nav>
        <Button variant="link" className="text-danger mt-auto p-0 text-decoration-none d-flex align-items-center gap-3" onClick={onLogout}>
          <LogOut size={20}/> Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="p-5 flex-grow-1">
        <header className="mb-5">
          <h2 className="fw-bold">Student Hub</h2>
          <p className="text-secondary">{user.dept} | {user.roll}</p>
        </header>

        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="p-4 border-0" style={{ background: '#1e293b', color: 'white' }}>
              <h6 className="text-secondary">Attendance Status</h6>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h3 className="mb-0">94%</h3>
                <Badge bg="success">Excellent</Badge>
              </div>
              <ProgressBar now={94} style={{ height: '8px' }} variant="primary" />
            </Card>
          </Col>

          {/* Request Visualization (The "Grapes" / Bubbles) */}
          <Col md={8}>
            <Card className="p-4 border-0" style={{ background: '#1e293b', color: 'white' }}>
              <h6 className="text-secondary mb-4">Permission Distribution</h6>
              <div className="d-flex justify-content-around align-items-center text-center">
                <div className="status-bubble">
                  <div className="p-3 bg-success bg-opacity-10 rounded-circle mb-2"><CheckCircle color="#10b981" size={30}/></div>
                  <h4 className="fw-bold mb-0">12</h4>
                  <small className="text-muted">Accepted</small>
                </div>
                <div className="status-bubble">
                  <div className="p-3 bg-warning bg-opacity-10 rounded-circle mb-2"><Clock color="#f59e0b" size={30}/></div>
                  <h4 className="fw-bold mb-0">03</h4>
                  <small className="text-muted">Pending</small>
                </div>
                <div className="status-bubble">
                  <div className="p-3 bg-danger bg-opacity-10 rounded-circle mb-2"><AlertCircle color="#ef4444" size={30}/></div>
                  <h4 className="fw-bold mb-0">01</h4>
                  <small className="text-muted">Rejected</small>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card className="p-4 border-0" style={{ background: '#1e293b', color: 'white' }}>
          <h5 className="fw-bold mb-4">Request Form & Feedback</h5>
          <Form>
            <Row className="g-3">
              <Col md={6}><Form.Control className="bg-dark border-0 text-white p-3" placeholder="Permission Type (OD/Outpass)" /></Col>
              <Col md={6}><Form.Control className="bg-dark border-0 text-white p-3" type="date" /></Col>
              <Col md={12}><Form.Control as="textarea" rows={3} className="bg-dark border-0 text-white p-3" placeholder="Reason for request..." /></Col>
              <Col md={12}><Button className="w-100 py-3 fw-bold btn-primary border-0"><Send size={18} className="me-2"/> Submit for Approval</Button></Col>
            </Row>
          </Form>
        </Card>
      </main>

      {/* Profile Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered contentClassName="border-0 shadow-lg" style={{ color: '#333' }}>
        <Modal.Header closeButton><h5 className="fw-bold mb-0">Edit Student Profile</h5></Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3"><Form.Label>Email Address</Form.Label><Form.Control defaultValue={user.email} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Contact Number</Form.Label><Form.Control defaultValue="+91 98450-XXXXX" /></Form.Group>
          <Button className="w-100 py-3 mt-3 fw-bold" onClick={() => setShowEdit(false)}>Save Changes</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}