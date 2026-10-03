import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        email: form.email, password: form.password, name: form.name, role,
      };
      if (role === 'hr') {
        Object.assign(payload, { company: form.company, industry: form.industry, companySize: form.companySize, location: form.location, website: form.website });
      } else {
        const skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
        Object.assign(payload, {
          phone: form.phone, targetRole: form.targetRole, targetIndustry: form.targetIndustry,
          degree: form.degree, fieldOfStudy: form.fieldOfStudy, university: form.university,
          graduationYear: form.graduationYear, yearsOfExperience: Number(form.yearsOfExperience),
          skills, expectedSalary: form.expectedSalary, jobType: form.jobType,
          availability: form.availability, bio: form.bio, linkedIn: form.linkedIn,
          portfolioUrl: form.portfolioUrl,
        });
      }
      const res = await authAPI.register(payload);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
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
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">R</div>
          <span className="auth-logo-text">RecruitIQ</span>
        </div>
        <h1 className="auth-headline">
          Hire smarter<br />with <span>AI-powered</span><br />recruitment
        </h1>
        <p className="auth-sub">
          Connect top talent with great companies. Our AI matches candidates to jobs, analyzes resumes, and streamlines the entire hiring process.
        </p>
        <div className="auth-features">
          {[
            { icon: '🤖', text: 'AI-powered resume matching & ranking' },
            { icon: '📊', text: 'Smart analytics & hiring funnel insights' },
            { icon: '🎯', text: 'Personalized job recommendations' },
            { icon: '🎤', text: 'AI demo interview practice sessions' },
          ].map((f, i) => (
            <div key={i} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              <span className="auth-feature-text">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: 32, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 12 }}>Demo Accounts (password: password123)</div>
          {demoCredentials.map((d) => (
            <div key={d.email} style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
              <strong>{d.role}:</strong> {d.email}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        {mode === 'login' ? (
          <>
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-sub">Sign in to your RecruitIQ account</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} required />
              </div>
              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            <div className="auth-divider"><span>or try a demo account</span></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={() => { set('email', 'sarah@techcorp.com'); set('password', 'password123'); }}>
                👔 HR Demo
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => { set('email', 'alex@gmail.com'); set('password', 'password123'); }}>
                👤 Candidate Demo
              </button>
            </div>

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
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Continue →</button>
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
