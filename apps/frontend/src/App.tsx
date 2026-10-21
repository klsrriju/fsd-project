import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { notificationsAPI } from './api';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import HRDashboard from './pages/HRDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import JobsPage from './pages/JobsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import InterviewsPage from './pages/InterviewsPage';
import AIInterviewPage from './pages/AIInterviewPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import CodingPrepPage from './pages/CodingPrepPage';
import CandidateRankingPage from './pages/CandidateRankingPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import './styles.css';


function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  const navigate = useNavigate();
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={() => navigate(href)}>
      <span className="nav-item-icon">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHR = user?.role === 'hr';
  const path = location.pathname;

  const hrNav = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard', section: 'main' },
    { href: '/jobs', icon: '💼', label: 'Job Postings', section: 'main' },
    { href: '/applications', icon: '📋', label: 'Candidate Pipeline', section: 'main' },
    { href: '/rankings', icon: '🏆', label: 'Leaderboard', section: 'main' },
    { href: '/interviews', icon: '📅', label: 'Interviews', section: 'main' },
    { href: '/notifications', icon: '🔔', label: 'Notifications', section: 'tools' },
    { href: '/profile', icon: '👤', label: 'My Profile', section: 'tools' },
  ];

  const candidateNav = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard', section: 'main' },
    { href: '/jobs', icon: '🔍', label: 'Browse Jobs', section: 'main' },
    { href: '/applications', icon: '📋', label: 'My Applications', section: 'main' },
    { href: '/interviews', icon: '📅', label: 'Interviews', section: 'main' },
    { href: '/resume-analyzer', icon: '📄', label: 'Resume Analyzer', section: 'ai' },
    { href: '/ai-interview', icon: '🎤', label: 'AI Mock Interview', section: 'ai' },
    { href: '/coding-prep', icon: '💻', label: 'Technical Coding Prep', section: 'ai' },
    { href: '/notifications', icon: '🔔', label: 'Notifications', section: 'tools' },
    { href: '/profile', icon: '👤', label: 'My Profile', section: 'tools' },
  ];

  const nav = isHR ? hrNav : candidateNav;

  const sectionLabels: Record<string, string> = {
    main: isHR ? 'Recruiting' : 'Job Search',
    ai: 'AI Tools',
    tools: 'Account',
  };

  const sections = [...new Set(nav.map((n) => n.section))];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">R</div>
        <div>
          <div className="sidebar-brand-text">RecruitIQ</div>
          <div className="sidebar-brand-sub">{isHR ? 'HR Portal' : 'Talent Portal'}</div>
        </div>
      </div>

      <div className="sidebar-nav">
        {sections.map((section) => (
          <div key={section}>
            <div className="sidebar-section-label">{sectionLabels[section]}</div>
            {nav.filter((n) => n.section === section).map((item) => (
              <NavItem key={item.href} {...item} active={path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href))} />
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{user?.name?.[0]}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role === 'hr' ? '👔 HR / Recruiter' : '👤 Candidate'}</div>
          </div>
        </div>
        <button
          className="nav-item"
          style={{ marginTop: 8, color: '#fca5a5', width: '100%', border: 'none', background: 'none', justifyContent: 'flex-start' }}
          onClick={() => { logout(); navigate('/login'); }}
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function Topbar() {
  const { user, theme, setTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationsAPI.list().then((res) => {
      setUnread(res.data.data.filter((n: any) => !n.read).length);
    }).catch(() => {});
  }, [location.pathname]);

  const titles: Record<string, [string, string]> = {
    '/dashboard': ['Overview', 'Dashboard'],
    '/jobs': ['Positions', user?.role === 'hr' ? 'Job Postings' : 'Browse Jobs'],
    '/applications': ['Pipeline', user?.role === 'hr' ? 'Candidate Pipeline' : 'My Applications'],
    '/rankings': ['AI Ranking', 'Candidate Leaderboard'],
    '/interviews': ['Schedule', 'Interviews'],
    '/resume-analyzer': ['AI Tools', 'Resume Analyzer'],
    '/ai-interview': ['AI Tools', 'Mock Interview'],
    '/notifications': ['Account', 'Notifications'],
    '/profile': ['Account', 'My Profile'],
  };

  const [breadcrumb, title] = titles[location.pathname] || ['', 'RecruitIQ'];

  return (
    <div className="topbar">
      <div className="topbar-left">
        {breadcrumb && <div className="topbar-breadcrumb">{breadcrumb}</div>}
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-actions">
        {/* Quick Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
          <span style={{ fontSize: 13 }}>🎨</span>
          <select
            className="form-select"
            style={{ padding: '4px 8px', fontSize: 12, height: 32, width: 110 }}
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
          >
            <option value="default">💜 Indigo</option>
            <option value="dark">🌙 Dark</option>
            <option value="emerald">🍃 Emerald</option>
            <option value="sunset">🌅 Sunset</option>
            <option value="ocean">🌊 Ocean</option>
          </select>
        </div>

        <button
          className="btn btn-ghost btn-icon"
          style={{ position: 'relative' }}
          onClick={() => navigate('/notifications')}
        >
          🔔
          {unread > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--red)', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/profile')}>👤</button>
      </div>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function HRRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'hr') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function CandidateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'candidate') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();
  return user?.role === 'hr' ? <HRDashboard /> : <CandidateDashboard />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardRouter />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/applications" element={<ApplicationsPage />} />
                    <Route path="/interviews" element={<InterviewsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    {/* HR only */}
                    <Route path="/rankings" element={<HRRoute><CandidateRankingPage /></HRRoute>} />
                    {/* Candidate only */}
                    <Route path="/resume-analyzer" element={<CandidateRoute><ResumeAnalyzerPage /></CandidateRoute>} />
                    <Route path="/ai-interview" element={<CandidateRoute><AIInterviewPage /></CandidateRoute>} />
                    <Route path="/coding-prep" element={<CandidateRoute><CodingPrepPage /></CandidateRoute>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
