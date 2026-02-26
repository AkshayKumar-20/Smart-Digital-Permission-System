import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, Clock, XCircle, Users } from 'lucide-react';

// Mock Data for the Professional Graph
const data = [
  { name: 'Mon', requests: 12 },
  { name: 'Tue', requests: 19 },
  { name: 'Wed', requests: 15 },
  { name: 'Thu', requests: 22 },
  { name: 'Fri', requests: 30 },
];
const DashboardContent = ({ role }) => {
  const getStats = () => {
    switch(role) {
      case 'student':
        return [
          { title: 'MY REQUESTS', value: '08', color: '#6366f1', label: 'Total submitted' },
          { title: 'APPROVED', value: '06', color: '#10b981', label: 'Ready to download' },
          { title: 'PENDING', value: '01', color: '#f59e0b', label: 'With Faculty' },
          { title: 'ATTENDANCE', value: '88%', color: '#0ea5e9', label: 'Eligible' }
        ];
      case 'principal':
        return [
          { title: 'TOTAL STUDENTS', value: '2,400', color: '#6366f1', label: 'All Depts' },
          { title: 'CAMPUS LEAVE', value: '45', color: '#10b981', label: 'Today' },
          { title: 'STAFF ACTIVE', value: '112', color: '#f59e0b', label: 'On duty' },
          { title: 'ALERTS', value: '02', color: '#ef4444', label: 'Emergency' }
        ];
      default: // HOD / Faculty
        return [
          { title: 'DEPT STUDENTS', value: '420', color: '#6366f1', label: 'CS Dept' },
          { title: 'PENDING APPR', value: '18', color: '#f59e0b', label: 'Needs Action' },
          { title: 'APPROVED', value: '156', color: '#10b981', label: 'This Month' },
          { title: 'REJECTED', value: '12', color: '#ef4444', label: 'Standard Rate' }
        ];
    }
  };

  return (
    <Container fluid className="p-4 animate-fade-in">
      <h5 className="mb-4 fw-bold">Welcome back, {role.toUpperCase()}</h5>
      <Row className="g-4 mb-4">
        {getStats().map((item, idx) => (
          <Col key={idx} md={3}>
            <Card className="stat-card p-3 shadow-sm border-0" style={{ borderLeft: `5px solid ${item.color}` }}>
              <div className="text-muted small fw-bold mb-1">{item.title}</div>
              <h2 className="fw-bold mb-1">{item.value}</h2>
              <div className="small" style={{ color: item.color }}>{item.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
      {/* Graphs would follow here... */}
    </Container>
  );
};

export default function Dashboard() {
  return (
    <div className="p-4 w-100">
      <h2 className="fw-bold mb-4 text-dark">Analytics Overview</h2>

      {/* 4 Quick-Stat Cards */}
      <Row className="mb-4">
        {[
          { label: 'Total Requests', count: '124', icon: <Users />, color: '#4f46e5' },
          { label: 'Approved', count: '85', icon: <CheckCircle />, color: '#10b981' },
          { label: 'Pending', count: '24', icon: <Clock />, color: '#f59e0b' },
          { label: 'Rejected', count: '15', icon: <XCircle />, color: '#ef4444' }
        ].map((stat, i) => (
          <Col md={3} key={i}>
            <Card className="border-0 shadow-sm p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-0 small uppercase fw-bold">{stat.label}</p>
                  <h3 className="fw-bold mb-0">{stat.count}</h3>
                </div>
                <div style={{ color: stat.color }}>{stat.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        {/* The Graph Requirement */}
        <Col md={8}>
          <Card className="p-4 border-0 shadow-sm h-100">
            <h5 className="fw-bold mb-4">Request Trends (Weekly)</h5>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="requests" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Profile Update/Feedback Peek */}
        <Col md={4}>
          <Card className="p-4 border-0 shadow-sm h-100">
            <h5 className="fw-bold mb-3">System Feedback</h5>
            <div className="mb-3 p-2 bg-light rounded">
              <p className="mb-1 small fw-bold text-primary">Student A: Medical Leave</p>
              <p className="text-muted small">Awaiting HOD final signature.</p>
            </div>
            <div className="p-2 bg-light rounded">
              <p className="mb-1 small fw-bold text-success">Profile Status</p>
              <p className="text-muted small">Updated: 2 mins ago</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}