import React, { useState } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { Shield, Mail, Lock, UserCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // State is defined

  const handleSubmit = (e) => {
    e.preventDefault();

    // Fix: We now "use" the password by including it in the login attempt
    const userData = {
      name: email.split('@')[0].toUpperCase(),
      email: email,
      password: password, // Password is now USED here
      dept: 'Computer Science & Engineering',
      phone: '+91 98765-43210',
      counselor: 'Dr. Arvinth Kumar'
    };

    onLogin(userData, role);
  };

  return (
    <div className="login-viewport">
      <div className="login-background-blobs"></div>
      <Card className="glass-login-card shadow-2xl border-0 animate-in">
        <div className="text-center mb-5">
          <div className="login-icon-wrapper">
            <Shield size={40} color="#fff" />
          </div>
          <h2 className="fw-bold mt-3 text-dark">Smart Portal</h2>
          <p className="text-muted small">Enter credentials to access your dashboard</p>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-secondary text-uppercase">Login As</Form.Label>
            <InputGroup className="custom-input-group shadow-sm">
              <InputGroup.Text className="bg-white border-end-0"><UserCircle size={18} /></InputGroup.Text>
              <Form.Select
                className="p-3 border-start-0 shadow-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student Account</option>
                <option value="faculty">Faculty Member</option>
                <option value="hod">HOD</option>
                <option value="principal">Principal</option>
              </Form.Select>
            </InputGroup>
          </Form.Group>

          {/* Email Input */}
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-secondary text-uppercase">University Email</Form.Label>
            <InputGroup className="custom-input-group shadow-sm">
              <InputGroup.Text className="bg-white border-end-0"><Mail size={18} /></InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="name@university.edu"
                className="p-3 border-start-0 shadow-none"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          {/* Password Input */}
          <Form.Group className="mb-5">
            <Form.Label className="small fw-bold text-secondary text-uppercase">Password</Form.Label>
            <InputGroup className="custom-input-group shadow-sm">
              <InputGroup.Text className="bg-white border-end-0"><Lock size={18} /></InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="••••••••"
                className="p-3 border-start-0 shadow-none"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100 py-3 fw-bold login-btn rounded-3">
            Sign In to Dashboard
          </Button>
        </Form>
      </Card>
    </div>
  );
}