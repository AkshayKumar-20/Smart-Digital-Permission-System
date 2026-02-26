import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const PrincipalDashboard = () => (
  <div className="animate-in">
    <Row className="g-4 mb-4">
      {[
        { t: 'Total Students', v: '4,250', i: <Users/>, c: 'primary' },
        { t: 'Staff On Leave', v: '08', i: <AlertTriangle/>, c: 'warning' },
        { t: 'Approvals Today', v: '142', i: <CheckCircle/>, c: 'success' },
        { t: 'Pending Issues', v: '03', i: <FileText/>, c: 'danger' }
      ].map((s, idx) => (
        <Col key={idx} md={3}>
          <Card className={`p-3 border-0 shadow-sm border-start border-${s.c} border-4`}>
            <div className="text-muted small fw-bold text-uppercase">{s.t}</div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h3 className="fw-bold mb-0">{s.v}</h3>
              <div className={`text-${s.c}`}>{s.i}</div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
    <Card className="p-4 border-0 shadow-sm rounded-4">
      <h6 className="fw-bold mb-3 text-muted">Institutional Performance</h6>
      <div className="bg-light rounded-4 p-5 text-center">Charts & Analytics Placeholder</div>
    </Card>
  </div>
);

export default PrincipalDashboard;