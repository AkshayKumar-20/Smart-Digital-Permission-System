import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, User, LogOut, CheckCircle, Clock } from 'lucide-react';
import { Nav } from 'react-bootstrap';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar p-3 d-flex flex-column" style={{ width: '250px', minHeight: '100vh', background: '#1e293b' }}>
      <h4 className="text-white fw-bold mb-4 px-2">SmartPortal</h4>
      <Nav className="flex-column flex-grow-1">
        <Nav.Link href="/dashboard" className="text-white-50 p-3 mb-2 rounded hover-effect">
          <LayoutDashboard size={20} className="me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link href="/requests" className="text-white-50 p-3 mb-2 rounded">
          <FileText size={20} className="me-2" /> {user?.role === 'student' ? 'My Requests' : 'All Requests'}
        </Nav.Link>
        <Nav.Link href="/profile" className="text-white-50 p-3 mb-2 rounded">
          <User size={20} className="me-2" /> Profile Settings
        </Nav.Link>
      </Nav>
      <button onClick={logout} className="btn btn-outline-danger w-100 mt-auto">
        <LogOut size={18} className="me-2" /> Logout
      </button>
    </div>
  );
}