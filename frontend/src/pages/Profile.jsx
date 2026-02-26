import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, ProgressBar } from 'react-bootstrap';
import { User, Mail, Shield, Camera, CheckCircle } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "Dr. Badaw",
    email: "badaw.hod@college.edu",
    dept: "Computer Science",
    role: "HOD",
    status: "Verified"
  });

  return (
    <Container fluid className="p-4">
      <h4 className="fw-bold mb-4 text-slate-800">Account Settings</h4>

      <Row className="g-4">
        {/* Left: Profile Summary Card */}
        <Col lg={4}>
          <Card className="stat-card p-4 text-center">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                <User size={50} color="white" />
              </div>
              <button className="btn btn-sm btn-light border position-absolute bottom-0 end-0 rounded-circle shadow-sm">
                <Camera size={16} />
              </button>
            </div>
            <h5 className="fw-bold mb-1">{profile.name}</h5>
            <p className="text-muted small mb-3">{profile.role} • {profile.dept}</p>
            <Badge bg="success" className="px-3 py-2 rounded-pill">
              <CheckCircle size={12} className="me-1" /> Account {profile.status}
            </Badge>

            <hr className="my-4" />

            <div className="text-start">
              <p className="small fw-bold text-muted mb-2">PROFILE COMPLETION</p>
              <ProgressBar now={85} label={`85%`} variant="primary" className="rounded-pill" style={{height: '10px'}} />
            </div>
          </Card>
        </Col>

        {/* Right: Update Form */}
        <Col lg={8}>
          <Card className="stat-card p-4">
            <h6 className="fw-bold mb-4"><Shield size={18} className="me-2 text-primary" /> Personal Information</h6>
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Full Name</Form.Label>
                    <Form.Control type="text" defaultValue={profile.name} className="bg-light border-0 p-3" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Email Address</Form.Label>
                    <Form.Control type="email" defaultValue={profile.email} className="bg-light border-0 p-3" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Department</Form.Label>
                    <Form.Select className="bg-light border-0 p-3">
                      <option>Computer Science</option>
                      <option>Mechanical Engineering</option>
                      <option>Electrical Engineering</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Contact Number</Form.Label>
                    <Form.Control type="text" placeholder="+91 98765 43210" className="bg-light border-0 p-3" />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                <Button variant="light" className="me-2 px-4 fw-bold">Cancel</Button>
                <Button variant="primary" className="px-4 fw-bold shadow-sm">Save Changes</Button>
              </div>
            </Form>
          </Card>

          {/* Feedback/Approval Section */}
          <Card className="stat-card p-4 mt-4 bg-primary text-white border-0 shadow-lg">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-1">Pending Approval Status</h6>
                <p className="small mb-0 opacity-75">Your recent request for "Department Seminar" is currently under review by the Principal.</p>
              </div>
              <Badge bg="white" className="text-primary p-2 px-3">PENDING</Badge>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}