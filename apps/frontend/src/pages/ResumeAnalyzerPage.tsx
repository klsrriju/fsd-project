import React, { useEffect, useState } from 'react';
import { resumeAPI, jobsAPI, authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ResumeAnalyzerPage() {
  const { user, updateUser } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [extractingSkills, setExtractingSkills] = useState(false);
  const [extractedSkillsData, setExtractedSkillsData] = useState<{
    skills: string[];
    categorized: Record<string, string[]>;
    structure?: any;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'match' | 'structure'>('match');
  const [resumeUrl, setResumeUrl] = useState((user?.resumeUrl as string) || '');
  const [toast, setToast] = useState('');

  useEffect(() => {
    jobsAPI.list().then((res) => setJobs(res.data.data || []));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  async function handleExtractSkills() {
    if (!resumeText.trim()) {
      return alert('Please paste your resume text first to extract skills.');
    }
    setExtractingSkills(true);
    try {
      const res = await resumeAPI.extractSkills({ resumeText: resumeText.trim() });
      const data = res.data.data;
      setExtractedSkillsData(data);
      if (data.skills?.length > 0) {
        showToast(`✨ Extracted ${data.skills.length} skills from your resume!`);
      } else {
        showToast('ℹ️ No recognized technical keywords found in the provided text.');
      }
    } catch (err: any) {
      showToast('❌ Failed to extract skills');
    } finally {
      setExtractingSkills(false);
    }
  }

  function addExtractedSkill(skill: string) {
    const current = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (!current.includes(skill)) {
      const updated = [...current, skill].join(', ');
      setSkills(updated);
      showToast(`Added "${skill}" to your skills!`);
    }
  }

  function addAllExtractedSkills() {
    if (!extractedSkillsData?.skills) return;
    const current = skills.split(',').map((s) => s.trim()).filter(Boolean);
    const combined = Array.from(new Set([...current, ...extractedSkillsData.skills]));
    setSkills(combined.join(', '));
    showToast(`✅ Added ${extractedSkillsData.skills.length} skills to your skill list!`);
  }

  async function analyze() {
    if (!selectedJob) return alert('Please select a job to analyze against');
    setLoading(true);
    try {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await resumeAPI.analyze({
        jobId: selectedJob,
        skills: skillList,
        resumeText: resumeText.trim() || undefined,
      });
      setAnalysis(res.data.data);
      // If resumeStructure was calculated and user hasn't explicitly extracted yet, save it
      if (res.data.data?.resumeStructure && !extractedSkillsData) {
        setExtractedSkillsData({
          skills: res.data.data.matchedSkills || [],
          categorized: {},
          structure: res.data.data.resumeStructure,
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  async function saveExtractedSkills() {
    if (!analysis?.matchedSkills) return;
    const combined = Array.from(new Set([...(user?.skills || []), ...analysis.matchedSkills]));
    try {
      await authAPI.updateProfile({ skills: combined });
      updateUser({ skills: combined });
      setSkills(combined.join(', '));
      showToast('✅ Profile skills updated from verified analysis!');
    } catch {
      showToast('❌ Failed to update profile');
    }
  }

  const job = jobs.find((j) => j.id === selectedJob);
  const structure = analysis?.resumeStructure || extractedSkillsData?.structure;

  return (
    <div className="page">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: '#1e1b4b', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <div className="section-header">
        <div>
          <div className="section-title">📄 AI Resume & Skill-Gap Analyser</div>
          <div className="section-sub">Extract skills from your resume, inspect ATS formatting, and get personalized recommendations to make your resume presentable & professional</div>
        </div>
      </div>

      <div className="two-col">
        {/* Input Panel */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>🎯 Select a Target Job & Resume</div>

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
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Experience: {job.experience} • {job.type} • {job.location}</div>
            </div>
          )}

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Paste Resume Text / Experience Highlights</label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleExtractSkills}
                disabled={extractingSkills || !resumeText.trim()}
                style={{ fontSize: 11, padding: '4px 10px', color: 'var(--primary)', borderColor: 'var(--border)' }}
              >
                {extractingSkills ? '⚡ Extracting...' : '⚡ Auto-Extract Skills'}
              </button>
            </div>
            <textarea
              className="form-textarea"
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume work history, summary, education, and technical projects here..."
            />
            <div className="form-hint">Our engine parses 200+ technologies, evaluates structure, and checks ATS readability.</div>
          </div>

          {/* Extracted Skills Cloud */}
          {extractedSkillsData && extractedSkillsData.skills?.length > 0 && (
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 16, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                  🎯 Extracted Skills ({extractedSkillsData.skills.length})
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={addAllExtractedSkills}
                  style={{ fontSize: 11, padding: '2px 8px' }}
                >
                  + Add All to My Skills
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {extractedSkillsData.skills.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addExtractedSkill(s)}
                    className="badge badge-blue"
                    style={{ cursor: 'pointer', border: '1px solid var(--primary)', background: 'white' }}
                    title="Click to add to your skills"
                  >
                    + {s}
                  </button>
                ))}
              </div>
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
            <div className="form-hint">These skills are matched against the role requirements</div>
          </div>

          <div className="form-group">
            <label className="form-label">Resume Link / Portfolio (optional)</label>
            <input
              className="form-input"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/file/..."
            />
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={analyze} disabled={loading || !selectedJob}>
            {loading ? '🔍 Analyzing Profile & Structure...' : '🤖 Run AI Match & Structure Analysis'}
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {!analysis && !loading && (
            <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-text">Select a job and click Analyze</div>
                <div className="empty-state-sub">Our multi-factor matching engine evaluates skills fit, and analyzes your resume structure to make it presentable and professional.</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
              <div>
                <div className="loading"><div className="spinner" /></div>
                <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontWeight: 600 }}>AI is evaluating skill coverage, ATS format & structural polish...</div>
              </div>
            </div>
          )}

          {analysis && !loading && (
            <>
              {/* Tabs Navigation */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 6 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('match')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: activeTab === 'match' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'match' ? '3px solid var(--primary)' : '3px solid transparent',
                    marginBottom: -8,
                  }}
                >
                  🎯 Skills Fit & Gap Plan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('structure')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: activeTab === 'structure' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'structure' ? '3px solid var(--primary)' : '3px solid transparent',
                    marginBottom: -8,
                  }}
                >
                  📑 Professional Structure & ATS Audit
                </button>
              </div>

              {activeTab === 'match' && (
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
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Overall Fit Score</div>
                        <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4, fontWeight: 500 }}>{analysis.overallSuggestion}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{analysis.explanation}</div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Factor Breakdown */}
                  {analysis.factorDetails && (
                    <div className="card" style={{ marginBottom: 16 }}>
                      <div className="card-title" style={{ marginBottom: 12 }}>⚖️ Transparent Factor Breakdown</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                        {analysis.factorDetails.map((f: any, idx: number) => (
                          <div key={idx} style={{ background: 'var(--bg)', borderRadius: 8, padding: 10, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{f.name} ({f.weightLabel})</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: f.score >= 75 ? 'var(--green)' : 'var(--yellow)', margin: '4px 0' }}>{f.score}%</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{f.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills breakdown */}
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div className="card-title" style={{ margin: 0 }}>Skills Gap Analysis</div>
                      {analysis.matchedSkills?.length > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={saveExtractedSkills} style={{ fontSize: 11 }}>
                          💾 Sync matched to profile
                        </button>
                      )}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>✅ Matched Skills ({analysis.matchedSkills?.length || 0})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {analysis.matchedSkills?.map((s: string) => <span key={s} className="badge badge-green">{s}</span>)}
                        {!analysis.matchedSkills?.length && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>None matched yet</span>}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', marginBottom: 6 }}>❌ Missing Skills ({analysis.missingSkills?.length || 0})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {analysis.missingSkills?.map((s: string) => <span key={s} className="badge badge-red">{s}</span>)}
                        {!analysis.missingSkills?.length && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>🎉 No gaps! Complete skill coverage!</span>}
                      </div>
                    </div>
                  </div>

                  {/* Action Plan & Recommendations */}
                  <div className="card">
                    <div className="card-title" style={{ marginBottom: 16 }}>📋 Personalized Skill-Building Action Plan</div>
                    {analysis.recommendations?.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--green)' }}>You meet all key technology criteria for this position.</div>
                    ) : analysis.recommendations?.map((rec: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: rec.priority === 'high' ? 'var(--red-soft)' : 'var(--yellow-soft)',
                          color: rec.priority === 'high' ? 'var(--red)' : 'var(--yellow)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                        }}>
                          {rec.priority === 'high' ? '!' : '~'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{rec.skill}</span>
                            <span className={`badge ${rec.priority === 'high' ? 'badge-red' : 'badge-yellow'}`}>{rec.priority} priority</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{rec.action}</div>
                          {rec.learningTip && (
                            <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 2 }}>💡 {rec.learningTip}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'structure' && (
                <>
                  {/* Presentation & Structure Overview Card */}
                  <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                      <div>
                        <div className="card-title" style={{ margin: 0 }}>📑 Resume Structure & Presentation Audit</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          Evaluates visual hierarchy, section labeling, action verbs, and ATS compatibility.
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ textAlign: 'center', background: 'var(--bg)', padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Structure Score</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: (structure?.structureScore || 65) >= 75 ? 'var(--green)' : 'var(--yellow)' }}>
                            {structure?.structureScore || 65}/100
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', background: 'var(--bg)', padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>ATS Readability</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                            {structure?.atsCompatibility || 'Medium'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Impact Metrics Badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                      <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>🚀 Action Verbs</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
                          {structure?.actionVerbsCount || 0} detected
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {(structure?.actionVerbsCount || 0) >= 5 ? '✅ Great impact vocabulary' : '⚠️ Lead bullets with active verbs'}
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>📊 Quantified Metrics</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
                          {structure?.quantifiableMetricsCount || 0} metrics
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {(structure?.quantifiableMetricsCount || 0) >= 3 ? '✅ Good measurable results' : '⚠️ Add % or $ impact figures'}
                        </div>
                      </div>
                    </div>

                    {/* Section Audits */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
                        Section-by-Section Verification
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                        {structure?.sectionAudits?.map((s: any, idx: number) => (
                          <div key={idx} style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{s.section}</span>
                              <span className={`badge ${s.status === 'good' ? 'badge-green' : s.status === 'warning' ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: 10 }}>
                                {s.status === 'good' ? '✓ Found' : '✗ Missing'}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.advice}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Professional Presentation Suggestions */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
                        💡 How to Make Your Resume Presentable & Professional
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {structure?.presentationSuggestions?.map((s: any, idx: number) => (
                          <div key={idx} style={{ background: 'var(--bg)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span className="badge badge-blue" style={{ fontSize: 10 }}>{s.category}</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.tip}</span>
                            </div>
                            {s.example && (
                              <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 6, fontStyle: 'italic', background: 'white', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                {s.example}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
