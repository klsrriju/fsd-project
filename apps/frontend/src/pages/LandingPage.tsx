import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: '🤖',
      title: 'Gemini AI Resume Analyzer',
      desc: 'Upload any resume and get instant ATS score, keyword gap analysis, section-by-section structure feedback, and actionable suggestions to make it employer-ready.',
      badge: 'AI-Powered',
      color: '#6366f1',
    },
    {
      icon: '💻',
      title: 'Technical Coding Interview Prep',
      desc: '19+ curated LeetCode-style challenges across Easy, Medium, and Hard with interactive progress checklists, multi-language starter code, and pinpoint Big-O AI feedback.',
      badge: 'Interactive',
      color: '#38bdf8',
    },
    {
      icon: '🎯',
      title: 'Live 45-Min Interview Simulation',
      desc: 'Experience a real timed technical interview with multiple questions, a countdown timer, and comprehensive AI evaluation with hiring verdict (Strong Hire / Hire / Needs Practice).',
      badge: 'Real-Time',
      color: '#a855f7',
    },
    {
      icon: '🎤',
      title: 'AI Mock Behavioral Interview',
      desc: 'STAR-method behavioral interview practice with honest, motivating AI feedback. Covers leadership, problem-solving, teamwork, and culture-fit questions.',
      badge: 'Smart Coach',
      color: '#10b981',
    },
    {
      icon: '📋',
      title: 'Smart Job Matching & Pipeline',
      desc: 'HR teams post openings and the AI ranks applicants by skill overlap, experience, and ATS score. Candidates track every application stage in real time.',
      badge: 'For HR & Candidates',
      color: '#f59e0b',
    },
    {
      icon: '📊',
      title: 'Analytics & Candidate Rankings',
      desc: 'HR dashboards with funnel analytics, application pipeline KPIs, and auto-ranked leaderboards. Candidates see profile completion scores and upcoming interview reminders.',
      badge: 'Insights',
      color: '#ef4444',
    },
  ];

  const stats = [
    { value: '19+', label: 'Coding Challenges', icon: '💻' },
    { value: '98%', label: 'Match Accuracy', icon: '⚡' },
    { value: '45m', label: 'Timed Assessments', icon: '⏱️' },
    { value: 'Gemini', label: 'AI-Powered Engine', icon: '🤖' },
  ];

  const steps = [
    { step: '01', title: 'Create Your Profile', desc: 'Sign up as a Candidate or HR Recruiter. Add your skills, target role, resume URL, and company details.' },
    { step: '02', title: 'Get AI-Matched to Jobs', desc: 'Our Gemini AI engine automatically matches candidates to job openings by skill overlap and experience fit.' },
    { step: '03', title: 'Practice & Get Evaluated', desc: 'Solve LeetCode problems with AI review, do STAR mock interviews, and take a timed 45-minute assessment.' },
    { step: '04', title: 'Land the Offer', desc: 'Track your full application pipeline, receive real-time notifications, and monitor your logic growth over time.' },
  ];

  return (
    <div style={{
      background: 'radial-gradient(ellipse at 0% 0%, #1e1b4b 0%, #0f172a 45%, #030712 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: 'white',
      overflowX: 'hidden',
    }}>
      {/* ───────────── AMBIENT BACKGROUND ORBS ───────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'floatOrb 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'floatOrb 16s ease-in-out infinite', animationDelay: '-6s' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'pulseMesh 10s ease-in-out infinite' }} />
      </div>

      {/* ───────────── NAVBAR ───────────── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '0 40px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(10, 8, 30, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 18, letterSpacing: '-0.03em',
            boxShadow: '0 8px 20px -4px rgba(99,102,241,0.6)',
            transform: 'rotate(-4deg)',
          }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: 'white' }}>
            Skill<span style={{ color: '#a78bfa' }}>Proof</span>
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {['Features', 'How it Works', 'For HR', 'For Candidates'].map((item) => (
            <span key={item} style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Auth CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'); (e.currentTarget.style.background = 'rgba(255,255,255,0.06)'); }}
            onMouseLeave={(e) => { (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'); (e.currentTarget.style.background = 'transparent'); }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              border: 'none',
              color: 'white',
              padding: '9px 22px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 20px -4px rgba(99,102,241,0.55)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => { (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'); (e.currentTarget.style.boxShadow = '0 12px 30px -4px rgba(99,102,241,0.7)'); }}
            onMouseLeave={(e) => { (e.currentTarget.style.transform = 'translateY(0) scale(1)'); (e.currentTarget.style.boxShadow = '0 6px 20px -4px rgba(99,102,241,0.55)'); }}
          >
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* ───────────── HERO SECTION ───────────── */}
      <section ref={heroRef} style={{ position: 'relative', zIndex: 1, paddingTop: 160, paddingBottom: 100, textAlign: 'center', padding: '160px 40px 100px' }}>
        {/* Badge pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 28, color: '#a78bfa', animation: 'float3D 6s ease-in-out infinite' }}>
          <span>⚡</span> Powered by Google Gemini AI
        </div>

        <h1 style={{ fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 24px 0', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
          Hire Smarter.{' '}
          <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 50%, #4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Grow Faster.
          </span>
          <br />
          Land the Job.
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.65)', maxWidth: 680, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.65, marginBottom: 44 }}>
          SkillProof is an AI-powered full-stack recruitment platform — bridging top candidates and great companies through intelligent matching, coding interview prep, and real-time assessment simulation.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              border: 'none',
              color: 'white',
              padding: '16px 36px',
              borderRadius: 9999,
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 30px -6px rgba(99,102,241,0.6)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => { (e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'); (e.currentTarget.style.boxShadow = '0 20px 50px -10px rgba(99,102,241,0.75)'); }}
            onMouseLeave={(e) => { (e.currentTarget.style.transform = 'translateY(0) scale(1)'); (e.currentTarget.style.boxShadow = '0 10px 30px -6px rgba(99,102,241,0.6)'); }}
          >
            🚀 Start For Free
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'white',
              padding: '16px 36px',
              borderRadius: 9999,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget.style.background = 'rgba(255,255,255,0.1)'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'); }}
            onMouseLeave={(e) => { (e.currentTarget.style.background = 'rgba(255,255,255,0.05)'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'); }}
          >
            👤 Try Demo Account
          </button>
        </div>

        {/* Floating 3D hero cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 60, flexWrap: 'wrap' }}>
          {[
            { label: '98% Match Accuracy', icon: '⚡', delay: '0s' },
            { label: '20+ LeetCode Patterns', icon: '💻', delay: '-3s' },
            { label: '45-min Live Assessment', icon: '🎯', delay: '-6s' },
            { label: 'Gemini AI-Reviewed Code', icon: '🤖', delay: '-1.5s' },
          ].map((b) => (
            <div key={b.label} className="auth-hero-badge" style={{ animationDelay: b.delay, fontSize: 13 }}>
              <span>{b.icon}</span><span>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── STATS BAR ───────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 40px 80px' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          overflow: 'hidden',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '32px 24px',
              textAlign: 'center',
              borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              transition: 'background 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── FEATURES GRID ───────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 40px 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 9999, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c084fc', marginBottom: 16 }}>
              Everything You Need
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
              A complete AI recruitment ecosystem
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, maxWidth: 580, margin: '0 auto' }}>
              From job posting to hiring verdict — SkillProof handles every step with intelligent automation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div
                key={i}
                className="card-3d"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: '28px 28px 24px',
                  backdropFilter: 'blur(10px)',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget.style.background = `rgba(${f.color === '#6366f1' ? '99,102,241' : f.color === '#38bdf8' ? '56,189,248' : f.color === '#a855f7' ? '168,85,247' : f.color === '#10b981' ? '16,185,129' : f.color === '#f59e0b' ? '245,158,11' : '239,68,68'},0.07)`);
                  (e.currentTarget.style.borderColor = `${f.color}35`);
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.03)');
                  (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)');
                }}
              >
                {/* Background glow */}
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${f.color}20, transparent 70%)`, pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{f.title}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: f.color, marginTop: 2 }}>{f.badge}</div>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 40px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 9999, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#38bdf8', marginBottom: 16 }}>
              How It Works
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
              From profile to offer in 4 steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 20, left: 'calc(50% + 30px)', right: '-50%', height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.5), rgba(99,102,241,0.05))', display: 'none' }} />
                )}
                <div className="card-3d" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.2))', border: '1px solid rgba(99,102,241,0.3)', fontSize: 13, fontWeight: 900, color: '#a78bfa', marginBottom: 16 }}>
                    {s.step}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 10 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── TWO PERSONAS: HR & CANDIDATE ───────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 40px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* HR Card */}
          <div className="card-3d" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 100%)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 24, padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 40, marginBottom: 16 }}>👔</div>
            <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 9999, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 14 }}>For HR & Recruiters</div>
            <h3 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>Hire with precision,<br />not guesswork.</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Post jobs and auto-match top candidates by AI skill scoring', 'Candidate pipeline with stage tracking (Applied → Hired)', 'ATS-aware resume evaluation & structured ranking leaderboard', 'Schedule interviews with automated candidate notifications', 'Analytics dashboard with funnel KPIs and drop-off insights'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#818cf8', flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/login')} style={{ marginTop: 28, background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: 9999, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px -4px rgba(99,102,241,0.5)' }}>
              Get Started as HR →
            </button>
          </div>

          {/* Candidate Card */}
          <div className="card-3d" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(56,189,248,0.04) 100%)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 24, padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.25), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
            <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 9999, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399', marginBottom: 14 }}>For Job Seekers</div>
            <h3 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>Become interview-ready<br />in days, not months.</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['19+ curated coding challenges with interactive progress checklist', 'Gemini AI code review with Big-O complexity analysis', '45-minute timed technical interview simulation with hiring verdict', 'AI resume analyzer with ATS score, structure & keyword feedback', 'STAR-method behavioral mock interview with honest coaching'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#34d399', flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/login')} style={{ marginTop: 28, background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: 9999, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px -4px rgba(16,185,129,0.4)' }}>
              Start Practicing Now →
            </button>
          </div>
        </div>
      </section>

      {/* ───────────── CTA BANNER ───────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 40px 120px' }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.12) 50%, rgba(56,189,248,0.1) 100%)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 28,
          padding: '60px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
              Ready to prove your skills?
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
              Sign in or create a free account. Try demo credentials instantly — no setup required.
            </p>

            {/* Demo credentials preview */}
            <div style={{ display: 'inline-flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36, background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>⚡ Instant Demo (password: password123)</div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>👔 HR Recruiter</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>sarah@techcorp.com</div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>👤 Candidate</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>alex@gmail.com</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  border: 'none',
                  color: 'white',
                  padding: '15px 36px',
                  borderRadius: 9999,
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px -6px rgba(99,102,241,0.65)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget.style.transform = 'translateY(-3px)'); (e.currentTarget.style.boxShadow = '0 20px 50px -10px rgba(99,102,241,0.8)'); }}
                onMouseLeave={(e) => { (e.currentTarget.style.transform = 'translateY(0)'); (e.currentTarget.style.boxShadow = '0 10px 30px -6px rgba(99,102,241,0.65)'); }}
              >
                Sign In / Create Account →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Skill<span style={{ color: '#a78bfa' }}>Proof</span></span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          SkillProof: AI-Enabled Recruitment and Skill Verification Platform • Built with Gemini AI, React, Node.js & MongoDB Atlas
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#a78bfa', padding: '8px 20px', borderRadius: 9999, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Sign In →
        </button>
      </footer>
    </div>
  );
}
