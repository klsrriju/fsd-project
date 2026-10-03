import React, { useState, useEffect, useRef } from 'react';
import { aiInterviewAPI, jobsAPI } from '../api';

interface Message {
  role: 'ai' | 'user';
  content: string;
  score?: number;
  feedback?: string;
}

export default function AIInterviewPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [phase, setPhase] = useState<'setup' | 'interview' | 'result'>('setup');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { jobsAPI.list().then((res) => setJobs(res.data.data)); }, []);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  async function startInterview() {
    if (!selectedJob) return alert('Please select a job to practice for');
    setLoading(true);
    try {
      const res = await aiInterviewAPI.getQuestions({ jobId: selectedJob });
      const qs: string[] = res.data.data.questions;
      setQuestions(qs);
      setMessages([
        { role: 'ai', content: `👋 Hello! I'm your AI interviewer for the ${res.data.data.jobTitle} position. I'll ask you ${qs.length} questions. Take your time and answer thoughtfully. Ready? Here's your first question:` },
        { role: 'ai', content: qs[0] },
      ]);
      setCurrentQ(0);
      setPhase('interview');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    const q = questions[currentQ];
    const userMsg = answer.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setAnswer('');
    setLoading(true);

    try {
      const res = await aiInterviewAPI.evaluateAnswer({ question: q, answer: userMsg, jobId: selectedJob });
      const { score, feedback, tips } = res.data.data;
      setScores((prev) => [...prev, score]);

      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: `**Score: ${score}/100** — ${feedback}`, score, feedback },
        { role: 'ai', content: tips.filter((t: string) => t.startsWith('💡')).join('\n') || '' },
      ]);

      const next = currentQ + 1;
      if (next < questions.length) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: 'ai', content: `Question ${next + 1} of ${questions.length}:\n\n${questions[next]}` }]);
          setCurrentQ(next);
          setLoading(false);
        }, 800);
      } else {
        setTimeout(() => {
          setMessages((prev) => [...prev, {
            role: 'ai',
            content: `🎉 Interview complete! Great job. Click "See Results" to view your full performance report.`,
          }]);
          setPhase('result');
          setLoading(false);
        }, 800);
      }
    } catch {
      setLoading(false);
    }
  }

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  function reset() {
    setPhase('setup');
    setSelectedJob('');
    setQuestions([]);
    setMessages([]);
    setScores([]);
    setCurrentQ(0);
    setAnswer('');
  }

  const job = jobs.find((j) => j.id === selectedJob);

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <div className="section-title">🎤 AI Mock Interview</div>
          <div className="section-sub">Practice interviews with AI — get scored and real-time feedback</div>
        </div>
        {phase !== 'setup' && (
          <button className="btn btn-ghost" onClick={reset}>← Start Over</button>
        )}
      </div>

      {phase === 'setup' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎤</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Ready to Practice?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
                Select a job to practice for. Our AI will generate realistic interview questions based on the role requirements and give you immediate feedback on your answers.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Select Job Position <span style={{ color: 'var(--red)' }}>*</span></label>
              <select className="form-select" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                <option value="">Choose a job to practice for...</option>
                {jobs.map((j: any) => (
                  <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                ))}
              </select>
            </div>

            {job && (
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{job.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{job.company} • {job.experience}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Questions will cover:</div>
                <div className="job-skills">
                  {job.skills?.map((s: string) => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>
            )}

            <div style={{ background: 'var(--primary-soft)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary-dark)', marginBottom: 8 }}>📋 How it works</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                1. 🤖 AI generates up to 10 role-specific questions<br />
                2. 💬 Type your answers in the chat interface<br />
                3. ⭐ Each answer is scored 0-100 with detailed feedback<br />
                4. 📊 Get a final performance report at the end
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={startInterview} disabled={loading || !selectedJob}>
              {loading ? '⏳ Generating questions...' : '🚀 Start Mock Interview'}
            </button>
          </div>
        </div>
      )}

      {phase === 'interview' && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Progress */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Question {Math.min(currentQ + 1, questions.length)} of {questions.length}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Avg score: {scores.length > 0 ? `${avgScore}/100` : '—'}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
            </div>
          </div>

          {/* Chat */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="interview-chat" ref={chatRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  <div className={`chat-avatar ${msg.role}`}>{msg.role === 'ai' ? '🤖' : '👤'}</div>
                  <div className="chat-bubble">
                    {msg.score !== undefined && (
                      <div style={{ marginBottom: 6, fontWeight: 700, fontSize: 13, color: msg.score >= 80 ? 'var(--green)' : msg.score >= 60 ? 'var(--yellow)' : 'var(--red)' }}>
                        Score: {msg.score}/100
                      </div>
                    )}
                    {msg.content.split('\n').map((line, j) => (
                      <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-msg ai">
                  <div className="chat-avatar ai">🤖</div>
                  <div className="chat-bubble">
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: `bounce 0.9s ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Answer input */}
            {phase === 'interview' && !loading && currentQ < questions.length && (
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <textarea
                  className="form-textarea"
                  style={{ flex: 1, minHeight: 80, resize: 'none' }}
                  placeholder="Type your answer here... Be specific and use examples."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) submitAnswer(); }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-primary" onClick={submitAnswer} disabled={!answer.trim() || loading} style={{ flex: 1, minWidth: 80 }}>
                    Send ↵
                  </button>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>Ctrl+Enter</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{avgScore >= 80 ? '🏆' : avgScore >= 60 ? '🎯' : '💪'}</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Interview Complete!</h2>
            <div style={{ fontSize: 56, fontWeight: 900, color: avgScore >= 80 ? 'var(--green)' : avgScore >= 60 ? 'var(--yellow)' : 'var(--red)', marginBottom: 8 }}>
              {avgScore}<span style={{ fontSize: 24 }}>/100</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
              {avgScore >= 80 ? '🌟 Outstanding! You are very well-prepared.' : avgScore >= 60 ? '👍 Good performance! Practice a bit more on weak areas.' : '📚 Keep practicing — focus on technical depth and using examples.'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Questions', value: questions.length },
                { label: 'Avg Score', value: `${avgScore}%` },
                { label: 'Best Score', value: `${Math.max(...scores, 0)}%` },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--bg)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: 'left' }}>Question Scores</div>
              {scores.map((s, i) => (
                <div key={i} className="funnel-bar" style={{ marginBottom: 8 }}>
                  <div className="funnel-label" style={{ fontSize: 12 }}>Q{i + 1}</div>
                  <div className="funnel-track">
                    <div className="funnel-fill" style={{ width: `${s}%`, background: s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--yellow)' : 'var(--red)' }}>{s}</div>
                  </div>
                  <div className="funnel-count">{s}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={reset}>Practice Again</button>
              <button className="btn btn-primary" onClick={() => window.location.href = '/jobs'}>Browse Jobs →</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
