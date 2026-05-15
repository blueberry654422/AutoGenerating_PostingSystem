import { useNavigate } from 'react-router-dom';

export default function Nav() {
  const navigate = useNavigate();
  return (
    <nav>
      <div className="logo" onClick={() => navigate('/')}>
        <div className="logo-icon">⚡</div>
        Caption<span>AI</span>
      </div>
      <div className="nav-links">
        <div className="nav-link active">Create</div>
        <div className="nav-link">History</div>
        <div className="nav-link">Analytics</div>
        <div className="nav-link">Settings</div>
      </div>
      <div className="nav-right">
        <div className="avatar">JL</div>
      </div>
    </nav>
  );
}
