import React, { useEffect, useState } from 'react';
import { resumeAPI, jobsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ResumeAnalyzerPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState((user?.resumeUrl as string) || '');

  useEffect(() => { jobsAPI.list().then((res) => setJobs(res.data.data)); }, []);

  async function analyze() {
    if (!selectedJob) return alert('Please select a job to analyze against');
    setLoading(true);
    try {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await resumeAPI.analyze({ jobId: selectedJob, skills: skillList });
      setAnalysis(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  const job = jobs.find((j) => j.id === selectedJob);

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <div className="section-title">📄 Resume Analyzer</div>
          <div className="section-sub">Get AI-powered feedback on how well your profile matches a job</div>
        </div>
      </div>

      <div className="two-col">
        {/* Input Panel */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>🎯 Select a Target Job</div>

          <div className="form-group">
            <label className="form-label">Job to analyze against <span style={{ color: 'var(--red)' }}>*</span></label>
            <select className="form-select" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
              <option value="">Choose a job posting...</option>
              {jobs.map((j: any) => (
                <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
              ))}
            </select>
          </div>

          {job && (
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Job Requirements</div>
              <div className="job-skills">
                {job.skills?.map((s: string) => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Experience: {job.experience} • {job.type}</div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Your Skills (comma-separated)</label>
            <input
              className="form-input"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Node.js, AWS..."
            />
            <div className="form-hint">Edit to reflect your actual current skills</div>
          </div>

          <div className="form-group">
            <label className="form-label">Resume URL (optional)</label>
            <input
              className="form-input"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/file/..."
            />
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={analyze} disabled={loading || !selectedJob}>
            {loading ? '🔍 Analyzing...' : '🤖 Analyze My Profile'}
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {!analysis && !loading && (
            <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-text">Select a job and click Analyze</div>
                <div className="empty-state-sub">Our AI will compare your skills against the job requirements and give personalized feedback</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <div>
                <div className="loading"><div className="spinner" /></div>
                <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontWeight: 600 }}>AI is analyzing your profile...</div>
              </div>
            </div>
          )}

          {analysis && !loading && (
            <>
              {/* Score card */}
              <div className="card" style={{ marginBottom: 16, background: analysis.score >= 80 ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : analysis.score >= 60 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'linear-gradient(135deg, #fee2e2, #fca5a5)', border: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: analysis.score >= 80 ? 'var(--green)' : analysis.score >= 60 ? 'var(--yellow)' : 'var(--red)' }}>
                      {analysis.score}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Match Score</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{analysis.overallSuggestion}</div>
                  </div>
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-title" style={{ marginBottom: 16 }}>Skills Gap Analysis</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>✅ Matched Skills ({analysis.matchedSkills?.length || 0})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {analysis.matchedSkills?.map((s: string) => <span key={s} className="badge badge-green">{s}</span>)}
                    {!analysis.matchedSkills?.length && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>None matched</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', marginBottom: 6 }}>❌ Missing Skills ({analysis.missingSkills?.length || 0})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {analysis.missingSkills?.map((s: string) => <span key={s} className="badge badge-red">{s}</span>)}
                    {!analysis.missingSkills?.length && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>🎉 No gaps! Perfect match!</span>}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>📋 Action Plan</div>
                {analysis.recommendations?.map((rec: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: rec.priority === 'high' ? 'var(--red-soft)' : 'var(--yellow-soft)',
                      color: rec.priority === 'high' ? 'var(--red)' : 'var(--yellow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                    }}>
                      {rec.priority === 'high' ? '!' : '~'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{rec.skill}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{rec.action}</div>
                    </div>
                    <span className={`badge ${rec.priority === 'high' ? 'badge-red' : 'badge-yellow'}`} style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>{rec.priority}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
