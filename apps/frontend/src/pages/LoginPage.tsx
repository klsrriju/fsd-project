import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<'hr' | 'candidate'>('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // multi-step register

  const [form, setForm] = useState({
    email: '', password: '', name: '',
    // HR fields
    company: '', industry: '', companySize: '', location: '', website: '',
    // Candidate fields
    phone: '', targetRole: '', targetIndustry: '', degree: '', fieldOfStudy: '',
    university: '', graduationYear: '', yearsOfExperience: '0',
    skills: '', expectedSalary: '', jobType: 'full-time', availability: '',
    bio: '', linkedIn: '', portfolioUrl: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.email || !form.password || !form.name) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    setError(''); setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        email: form.email.trim(), password: form.password, name: form.name.trim(), role,
      };
      if (role === 'hr') {
        Object.assign(payload, {
          company: form.company.trim() || 'My Company',
          industry: form.industry,
          companySize: form.companySize,
          location: form.location,
          website: form.website,
        });
      } else {
        const skills = form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
        Object.assign(payload, {
          phone: form.phone,
          targetRole: form.targetRole.trim() || 'Software Engineer',
          targetIndustry: form.targetIndustry,
          degree: form.degree,
          fieldOfStudy: form.fieldOfStudy,
          university: form.university,
          graduationYear: form.graduationYear,
          yearsOfExperience: Number(form.yearsOfExperience) || 0,
          skills,
          expectedSalary: form.expectedSalary,
          jobType: form.jobType,
          availability: form.availability,
          bio: form.bio,
          linkedIn: form.linkedIn,
          portfolioUrl: form.portfolioUrl,
        });
      }
      await register(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  const demoCredentials = [
    { label: 'HR Demo', email: 'sarah@techcorp.com', role: 'HR' },
    { label: 'Candidate Demo', email: 'alex@gmail.com', role: 'Candidate' },
  ];

  return (
    <div className="auth-page">
      {/* 3D Ambient Lighting & Floating Orbs */}
      <div className="auth-ambient-glow auth-ambient-glow-1" />
      <div className="auth-ambient-glow auth-ambient-glow-2" />
      <div className="auth-3d-orb" style={{ width: 140, height: 140, top: '15%', right: '42%', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.2))' }} />
      <div className="auth-3d-orb" style={{ width: 80, height: 80, bottom: '12%', left: '38%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(59, 130, 246, 0.2))', animationDelay: '-4s' }} />

      {/* Left panel */}
      <div className="auth-left" style={{ position: 'relative', zIndex: 10 }}>
        <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Back to Home">
          <div className="auth-logo-icon" style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            transform: 'rotate(-4deg)',
          }}>R</div>
          <span className="auth-logo-text" style={{ letterSpacing: '-0.02em', fontSize: 24, fontWeight: 800 }}>RecruitIQ</span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <div className="auth-hero-badge" style={{ animationDelay: '0s' }}>
            <span>⚡</span> <span>98% Match Accuracy • Gemini AI</span>
          </div>
          <div className="auth-hero-badge" style={{ animationDelay: '-2s' }}>
            <span>💻</span> <span>20+ Real LeetCode Patterns</span>
          </div>
          <div className="auth-hero-badge" style={{ animationDelay: '-4s' }}>
            <span>🎯</span> <span>Live Technical Assessments</span>
          </div>
        </div>

        <h1 className="auth-headline" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          Hire smarter<br />with <span style={{
            background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>AI-powered</span><br />recruitment
        </h1>
        <p className="auth-sub" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
          Connect top talent with great companies. Our AI matches candidates to jobs, analyzes resumes, and conducts realistic technical interview assessments.
        </p>

        <div className="auth-features">
          {[
            { icon: '🤖', text: 'AI-powered resume matching & ATS structure audit' },
            { icon: '💻', text: 'Interactive LeetCode coding prep & timed assessments' },
            { icon: '📊', text: 'Smart analytics & candidate pipeline insights' },
            { icon: '🎤', text: 'Honest STAR-method behavioral mock interviews' },
          ].map((f, i) => (
            <div key={i} className="auth-feature" style={{
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '8px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
            }}>
              <div className="auth-feature-icon" style={{ background: 'rgba(255, 255, 255, 0.12)' }}>{f.icon}</div>
              <span className="auth-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel with 3D Glassmorphism */}
      <div className="auth-right" style={{
        position: 'relative',
        zIndex: 10,
        margin: '24px 32px',
        borderRadius: 24,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(30px)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 50px rgba(99, 102, 241, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
      }}>
        {/* Navigation back to landing page */}
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 13,
              fontWeight: 600,
              color: '#6366f1',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ← Back to Home
          </button>
        </div>

        {mode === 'login' ? (
          <>
            <h2 className="auth-form-title" style={{ fontSize: 28, fontWeight: 800 }}>Welcome back</h2>
            <p className="auth-form-sub" style={{ marginBottom: 20 }}>Sign in to your RecruitIQ account</p>

            {error && <div className="alert alert-error" style={{ borderRadius: 12, marginBottom: 18 }}>{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} required />
              </div>

              {/* Instant Demo Accounts Card placed below Email and Password */}
              <div style={{
                margin: '16px 0 20px 0',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '14px 16px',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#6366f1',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span>⚡ Instant Demo Accounts</span>
                  <span style={{ fontSize: 10, opacity: 0.7, textTransform: 'none', fontWeight: 600 }}>password: password123</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div
                    role="button"
                    tabIndex={0}
                    style={{
                      background: '#ffffff',
                      padding: '10px 12px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(99, 102, 241, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
                    }}
                    onClick={() => { set('email', 'sarah@techcorp.com'); set('password', 'password123'); }}
                  >
                    <div style={{ fontSize: 11, color: '#4f46e5', fontWeight: 700 }}>👔 HR Recruiter</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      sarah@techcorp.com
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    style={{
                      background: '#ffffff',
                      padding: '10px 12px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(99, 102, 241, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
                    }}
                    onClick={() => { set('email', 'alex@gmail.com'); set('password', 'password123'); }}
                  >
                    <div style={{ fontSize: 11, color: '#4f46e5', fontWeight: 700 }}>👤 Candidate</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      alex@gmail.com
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            <div className="auth-switch">
              Don't have an account? <a onClick={() => { setMode('register'); setStep(1); }}>Create one free</a>
            </div>
          </>
        ) : (
          <>
            <h2 className="auth-form-title">Create account</h2>
            <p className="auth-form-sub">Join RecruitIQ — {step === 1 ? 'Choose your role' : step === 2 ? 'Basic details' : 'Profile details'}</p>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#6366f1' : '#e5e7eb', transition: 'background 0.3s' }} />
              ))}
            </div>

            {step === 1 && (
              <>
                <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>I am a…</div>
                <div className="role-selector">
                  <div className={`role-card ${role === 'hr' ? 'selected' : ''}`} onClick={() => setRole('hr')}>
                    <div className="role-card-icon">👔</div>
                    <div className="role-card-title">HR / Recruiter</div>
                    <div className="role-card-sub">Post jobs & hire talent</div>
                  </div>
                  <div className={`role-card ${role === 'candidate' ? 'selected' : ''}`} onClick={() => setRole('candidate')}>
                    <div className="role-card-icon">👤</div>
                    <div className="role-card-title">Job Seeker</div>
                    <div className="role-card-sub">Find your next opportunity</div>
                  </div>
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(2)}>Continue →</button>
              </>
            )}

            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                <div className="form-group">
                  <label className="form-label">Full Name <span>*</span></label>
                  <input className="form-input" placeholder="Your full name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span>*</span></label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password <span>*</span></label>
                  <input className="form-input" type="password" placeholder="At least 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} />
                </div>
                {role === 'hr' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Company Name <span>*</span></label>
                      <input className="form-input" placeholder="Acme Corp" value={form.company} onChange={(e) => set('company', e.target.value)} required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Industry</label>
                        <select className="form-select" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                          <option value="">Select industry</option>
                          {['Technology', 'Fintech', 'Healthcare', 'E-commerce', 'Education', 'Finance', 'Manufacturing', 'Other'].map((i) => <option key={i}>{i}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Company Size</label>
                        <select className="form-select" value={form.companySize} onChange={(e) => set('companySize', e.target.value)}>
                          <option value="">Select size</option>
                          {['1-10', '11-50', '51-100', '101-500', '501-1000', '1000+'].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" placeholder="City, State" value={form.location} onChange={(e) => set('location', e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" placeholder="+1-555-0000" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Years of Experience</label>
                        <input className="form-input" type="number" min="0" max="50" value={form.yearsOfExperience} onChange={(e) => set('yearsOfExperience', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Target Role <span>*</span></label>
                      <input className="form-input" placeholder="e.g., Full Stack Developer" value={form.targetRole} onChange={(e) => set('targetRole', e.target.value)} required />
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button type="button" className="btn btn-primary" onClick={() => handleRegister()} style={{ flex: 1 }} disabled={loading}>
                    {loading ? 'Creating account...' : '🚀 Register & Enter'}
                  </button>
                </div>
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <button type="submit" className="btn btn-link btn-sm" style={{ fontSize: 13, color: 'var(--primary)' }}>
                    or add more profile details (Optional) →
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleRegister}>
                {role === 'hr' ? (
                  <div className="form-group">
                    <label className="form-label">Company Website</label>
                    <input className="form-input" placeholder="https://yourcompany.com" value={form.website} onChange={(e) => set('website', e.target.value)} />
                  </div>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Degree</label>
                        <select className="form-select" value={form.degree} onChange={(e) => set('degree', e.target.value)}>
                          <option value="">Select degree</option>
                          {['High School', 'Associate\'s', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other'].map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Field of Study</label>
                        <input className="form-input" placeholder="Computer Science" value={form.fieldOfStudy} onChange={(e) => set('fieldOfStudy', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">University</label>
                        <input className="form-input" placeholder="MIT" value={form.university} onChange={(e) => set('university', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Graduation Year</label>
                        <input className="form-input" placeholder="2022" value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Skills (comma-separated)</label>
                      <input className="form-input" placeholder="React, TypeScript, Node.js, AWS" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Expected Salary</label>
                        <input className="form-input" placeholder="$80,000 - $100,000" value={form.expectedSalary} onChange={(e) => set('expectedSalary', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Job Type</label>
                        <select className="form-select" value={form.jobType} onChange={(e) => set('jobType', e.target.value)}>
                          {['full-time', 'part-time', 'remote', 'hybrid', 'contract'].map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">LinkedIn Profile</label>
                      <input className="form-input" placeholder="https://linkedin.com/in/you" value={form.linkedIn} onChange={(e) => set('linkedIn', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Resume URL (Google Drive / PDF link)</label>
                      <input className="form-input" placeholder="https://drive.google.com/..." value={form.portfolioUrl} onChange={(e) => set('portfolioUrl', e.target.value)} />
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                    {loading ? 'Creating account...' : '🚀 Create Account'}
                  </button>
                </div>
              </form>
            )}

            <div className="auth-switch">
              Already have an account? <a onClick={() => setMode('login')}>Sign in</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
