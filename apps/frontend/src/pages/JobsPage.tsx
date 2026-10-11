import React, { useEffect, useState } from 'react';
import { jobsAPI, applicationsAPI, connectorsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function JobsPage() {
  const { user, updateUser } = useAuth();
  const isHR = user?.role === 'hr';
  const [jobs, setJobs] = useState<any[]>([]);
  const [externalJobs, setExternalJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'platform' | 'external'>('platform');
  const [loading, setLoading] = useState(true);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [applyingJob, setApplyingJob] = useState<any>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');

  // Connector sync states
  const [syncingGithub, setSyncingGithub] = useState(false);
  const [syncingUnstop, setSyncingUnstop] = useState(false);
  const [githubInput, setGithubInput] = useState((user?.githubUsername as string) || '');
  const [unstopInput, setUnstopInput] = useState((user?.unstopUsername as string) || '');

  const [form, setForm] = useState({
    title: '', description: '', location: '', type: 'full-time', salary: '',
    experience: '', degree: '', requirements: '', skills: '', industry: '',
  });

  const mySkills: string[] = user?.skills || [];
  const extData: any = user?.externalProfileData || {};

  useEffect(() => {
    loadJobs();
    if (!isHR) {
      loadExternalJobs();
      applicationsAPI.list().then((res) => {
        const ids = new Set<string>(res.data.data.map((a: any) => a.jobId));
        setApplied(ids);
      });
    }
  }, []);

  function loadJobs() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterType) params.type = filterType;
    jobsAPI.list(params).then((res) => setJobs(res.data.data)).finally(() => setLoading(false));
  }

  function loadExternalJobs() {
    setScrapingLoading(true);
    connectorsAPI.getExternalJobs(search)
      .then((res) => setExternalJobs(res.data.data))
      .catch(() => {})
      .finally(() => setScrapingLoading(false));
  }

  useEffect(() => {
    loadJobs();
    if (!isHR) loadExternalJobs();
  }, [search, filterType]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleSyncGithub() {
    if (!githubInput.trim()) return showToast('⚠️ Enter a GitHub username');
    setSyncingGithub(true);
    try {
      const res = await connectorsAPI.syncGitHub(githubInput.trim());
      updateUser({
        skills: res.data.data.updatedSkills,
        githubUsername: githubInput.trim(),
        externalProfileData: { ...extData, github: res.data.data.github },
      });
      showToast(`🐙 GitHub connected! Extracted ${res.data.data.github.skillsExtracted.length} skills.`);
      loadExternalJobs();
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'GitHub sync failed'));
    } finally {
      setSyncingGithub(false);
    }
  }

  async function handleSyncUnstop() {
    if (!unstopInput.trim()) return showToast('⚠️ Enter an Unstop username');
    setSyncingUnstop(true);
    try {
      const res = await connectorsAPI.syncUnstop(unstopInput.trim());
      updateUser({
        skills: res.data.data.updatedSkills,
        unstopUsername: unstopInput.trim(),
        externalProfileData: { ...extData, unstop: res.data.data.unstop },
      });
      showToast(`🎯 Unstop connected! ${res.data.data.unstop.badges.length} badges synced.`);
      loadExternalJobs();
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'Unstop sync failed'));
    } finally {
      setSyncingUnstop(false);
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      };
      await jobsAPI.create(payload);
      setShowForm(false);
      setForm({ title: '', description: '', location: '', type: 'full-time', salary: '', experience: '', degree: '', requirements: '', skills: '', industry: '' });
      loadJobs();
      showToast('✅ Job posted! Matching candidates & previously rejected applicants notified.');
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to post job'));
    }
  }

  async function handleApply(jobId: string, resumeUrl: string) {
    try {
      const res = await applicationsAPI.apply({ jobId, resumeUrl: resumeUrl || user?.resumeUrl });
      setApplied((prev) => new Set([...prev, jobId]));
      setApplyingJob(null);
      setSelectedJob(null);
      showToast(`✅ Applied! Your match score: ${res.data.data.matchScore}%`);
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'Application failed'));
    }
  }

  function getMatchScore(job: any) {
    if (!mySkills.length) return 0;
    const matched = job.skills?.filter((s: string) => mySkills.map((ms) => ms.toLowerCase()).includes(s.toLowerCase())) || [];
    return Math.round((matched.length / Math.max(job.skills?.length, 1)) * 100);
  }

  const types = ['full-time', 'part-time', 'remote', 'hybrid', 'contract'];

  return (
    <div className="page">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: 'var(--primary-dark)', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: 'var(--shadow-lg)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="section-header">
        <div>
          <div className="section-title">{isHR ? '💼 Job Postings' : '🔍 Find Your Next Role'}</div>
          <div className="section-sub">{isHR ? `${jobs.length} jobs posted by your company` : `${jobs.length} internal roles + ${externalJobs.length} live web-scraped opportunities`}</div>
        </div>
        {isHR && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Post New Job</button>}
      </div>

      {/* Candidate Connectors Bar (Unstop & GitHub) */}
      {!isHR && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--primary-soft)', borderColor: 'var(--primary-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                ⚡ Web Scraping & Profile Connectors (Unstop & GitHub)
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Link your profiles to automatically pull public repositories, contest badges, and import verified skills into your AI job matching!
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {/* GitHub Connector */}
            <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>🐙</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>GitHub Connector</span>
                {extData.github?.connected && <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Connected ✓</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  placeholder="e.g. klsrriju or octocat"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSyncGithub} disabled={syncingGithub}>
                  {syncingGithub ? 'Scraping...' : 'Sync Repo'}
                </button>
              </div>
              {extData.github?.connected && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  📦 {extData.github.reposCount} Repositories • Languages: {extData.github.topLanguages?.join(', ')}
                </div>
              )}
            </div>

            {/* Unstop Connector */}
            <div style={{ background: 'var(--bg-card)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>🎯</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Unstop Connector</span>
                {extData.unstop?.connected && <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Connected ✓</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  placeholder="e.g. user_unstop"
                  value={unstopInput}
                  onChange={(e) => setUnstopInput(e.target.value)}
                />
                <button className="btn btn-secondary btn-sm" onClick={handleSyncUnstop} disabled={syncingUnstop}>
                  {syncingUnstop ? 'Scraping...' : 'Sync Badges'}
                </button>
              </div>
              {extData.unstop?.connected && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  🏆 {extData.unstop.competitionsCount} Challenges • Badges: {extData.unstop.badges?.slice(0, 2).join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs for Candidates: Platform Jobs vs Scraped External Jobs */}
      {!isHR && (
        <div className="tabs" style={{ marginBottom: 16 }}>
          <button className={`tab ${activeTab === 'platform' ? 'active' : ''}`} onClick={() => setActiveTab('platform')}>
            🏢 Platform Openings ({jobs.length})
          </button>
          <button className={`tab ${activeTab === 'external' ? 'active' : ''}`} onClick={() => setActiveTab('external')}>
            🌐 Web-Scraped Roles from Unstop & GitHub ({externalJobs.length})
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search jobs, skills, companies..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', ...types].map((t) => (
            <button key={t} className={`chip ${filterType === t ? 'selected' : ''}`} onClick={() => setFilterType(t)}>
              {t || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Internal Jobs Tab */}
      {activeTab === 'platform' && (
        loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <div className="empty-state-text">No jobs found</div>
            <div className="empty-state-sub">{isHR ? 'Post your first job to get started.' : 'Try adjusting your filters.'}</div>
          </div>
        ) : (
          <div className="job-grid">
            {jobs.map((job: any) => {
              const score = getMatchScore(job);
              const hasApplied = applied.has(job.id);
              return (
                <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
                  <div className="job-card-header">
                    <div className="job-company-logo">{job.company?.[0] || '?'}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className={`badge ${job.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{job.status}</span>
                      <span className="badge badge-indigo">{job.type}</span>
                    </div>
                  </div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">{job.company} • {job.industry}</div>
                  <div className="job-meta">
                    <span className="job-meta-item">📍 {job.location}</span>
                    <span className="job-meta-item">💰 {job.salary}</span>
                    <span className="job-meta-item">⏱ {job.experience}</span>
                    <span className="job-meta-item">👥 {job.applicantsCount} applicants</span>
                  </div>
                  <div className="job-skills">
                    {job.skills?.slice(0, 5).map((s: string) => {
                      const matched = mySkills.map((ms) => ms.toLowerCase()).includes(s.toLowerCase());
                      return (
                        <span key={s} className="skill-tag" style={{ background: matched ? 'var(--green-soft)' : 'var(--primary-soft)', color: matched ? 'var(--green)' : 'var(--primary-dark)' }}>{s}</span>
                      );
                    })}
                  </div>
                  <div className="job-card-footer">
                    {!isHR && (
                      <span className={`match-score-badge ${score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'}`}>
                        🎯 {score}% match
                      </span>
                    )}
                    {isHR ? (
                      <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); window.location.href = `/jobs/${job.id}/candidates`; }}>View Candidates →</button>
                    ) : hasApplied ? (
                      <span className="badge badge-green">✓ Applied</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setApplyingJob(job); }}>Apply Now</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* External Web-Scraped Jobs Tab */}
      {activeTab === 'external' && !isHR && (
        scrapingLoading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : externalJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌐</div>
            <div className="empty-state-text">No external jobs match your query</div>
          </div>
        ) : (
          <div className="job-grid">
            {externalJobs.map((ext: any) => {
              const score = getMatchScore(ext);
              return (
                <div key={ext.id} className="job-card" style={{ borderLeft: ext.source === 'unstop' ? '4px solid #0284c7' : '4px solid #7c3aed' }}>
                  <div className="job-card-header">
                    <div className="job-company-logo">{ext.source === 'unstop' ? '🎯' : '🐙'}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="badge badge-blue">{ext.sourceLogo}</span>
                      <span className="badge badge-indigo">{ext.type}</span>
                    </div>
                  </div>
                  <div className="job-title">{ext.title}</div>
                  <div className="job-company">{ext.company}</div>
                  <div className="job-meta">
                    <span className="job-meta-item">📍 {ext.location}</span>
                    <span className="job-meta-item">💰 {ext.salary}</span>
                    <span className="job-meta-item">⏱ {ext.experience}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0', lineHeight: 1.4 }}>
                    {ext.description}
                  </p>
                  <div className="job-skills">
                    {ext.skills?.map((s: string) => {
                      const matched = mySkills.map((ms) => ms.toLowerCase()).includes(s.toLowerCase());
                      return (
                        <span key={s} className="skill-tag" style={{ background: matched ? 'var(--green-soft)' : 'var(--primary-soft)', color: matched ? 'var(--green)' : 'var(--primary-dark)' }}>{s}</span>
                      );
                    })}
                  </div>
                  <div className="job-card-footer">
                    <span className={`match-score-badge ${score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'}`}>
                      🎯 {score}% match
                    </span>
                    <a href={ext.externalUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                      Apply on {ext.source === 'unstop' ? 'Unstop' : 'GitHub'} ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selectedJob.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedJob.company} • {selectedJob.location}</div>
              </div>
              <button className="modal-close" onClick={() => setSelectedJob(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <span className="badge badge-indigo">{selectedJob.type}</span>
              <span className="badge badge-purple">{selectedJob.experience}</span>
              <span className="badge badge-green">{selectedJob.salary}</span>
              {selectedJob.degree && <span className="badge badge-blue">{selectedJob.degree}</span>}
            </div>

            <h4 style={{ marginBottom: 8, color: 'var(--text)' }}>About the Role</h4>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>{selectedJob.description}</p>

            <h4 style={{ marginBottom: 8, color: 'var(--text)' }}>Requirements</h4>
            <ul style={{ paddingLeft: 20, marginBottom: 20 }}>
              {selectedJob.requirements?.map((r: string, i: number) => (
                <li key={i} style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>{r}</li>
              ))}
            </ul>

            <h4 style={{ marginBottom: 8, color: 'var(--text)' }}>Required Skills</h4>
            <div className="job-skills" style={{ marginBottom: 20 }}>
              {selectedJob.skills?.map((s: string) => {
                const matched = mySkills.map((ms) => ms.toLowerCase()).includes(s.toLowerCase());
                return (
                  <span key={s} className="skill-tag" style={{ background: matched ? 'var(--green-soft)' : 'var(--primary-soft)', color: matched ? 'var(--green)' : 'var(--primary-dark)' }}>
                    {matched ? '✓ ' : ''}{s}
                  </span>
                );
              })}
            </div>

            {!isHR && (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setSelectedJob(null)}>Close</button>
                {applied.has(selectedJob.id) ? (
                  <span className="badge badge-green" style={{ padding: '10px 16px' }}>✓ Already Applied</span>
                ) : (
                  <button className="btn btn-primary" onClick={() => { setApplyingJob(selectedJob); setSelectedJob(null); }}>Apply for This Role →</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyingJob && (
        <div className="modal-overlay" onClick={() => setApplyingJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Apply for {applyingJob.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{applyingJob.company}</div>
              </div>
              <button className="modal-close" onClick={() => setApplyingJob(null)}>✕</button>
            </div>

            {(() => {
              const score = getMatchScore(applyingJob);
              return (
                <div className={`alert ${score >= 80 ? 'alert-success' : score >= 60 ? 'alert-warning' : 'alert-error'}`}>
                  <strong>AI Match Score: {score}%</strong> — {score >= 80 ? 'Excellent match! You meet most requirements.' : score >= 60 ? 'Good match. Some skill gaps exist.' : 'Low match. Consider upskilling before applying.'}
                </div>
              );
            })()}

            <div className="form-group">
              <label className="form-label">Resume URL (Google Drive / PDF link)</label>
              <input
                className="form-input"
                defaultValue={user?.resumeUrl as string || ''}
                id="resumeUrl"
                placeholder="https://drive.google.com/file/..."
              />
              <div className="form-hint">Paste the link to your resume (make sure it's publicly viewable)</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Your matched skills:</div>
              <div className="job-skills">
                {applyingJob.skills?.map((s: string) => {
                  const matched = mySkills.map((ms) => ms.toLowerCase()).includes(s.toLowerCase());
                  return <span key={s} className="skill-tag" style={{ background: matched ? 'var(--green-soft)' : 'var(--red-soft)', color: matched ? 'var(--green)' : 'var(--red)' }}>{matched ? '✓ ' : '✗ '}{s}</span>;
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setApplyingJob(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleApply(applyingJob.id, (document.getElementById('resumeUrl') as HTMLInputElement)?.value)}>
                Submit Application 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal (HR) */}
      {showForm && isHR && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Post a New Job</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateJob}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Job Title <span>*</span></label>
                  <input className="form-input" placeholder="Senior Full Stack Developer" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select className="form-select" value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}>
                    <option value="">Select industry</option>
                    {['Technology', 'Fintech', 'Healthcare', 'E-commerce', 'Education', 'Finance', 'Other'].map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="San Francisco, CA (Hybrid)" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Type</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    {types.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input className="form-input" placeholder="$100,000 - $130,000" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Required</label>
                  <input className="form-input" placeholder="3-5 years" value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Required Skills (comma-separated) <span>*</span></label>
                <input className="form-input" placeholder="React, TypeScript, Node.js, AWS" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} required />
                <div className="form-hint">Our AI will match active candidates and notify previously rejected applicants who match!</div>
              </div>
              <div className="form-group">
                <label className="form-label">Job Description <span>*</span></label>
                <textarea className="form-textarea" rows={4} placeholder="Describe the role, responsibilities, team culture..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Requirements (one per line)</label>
                <textarea className="form-textarea" rows={4} placeholder="5+ years of React experience&#10;Strong TypeScript skills&#10;Experience with cloud platforms" value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Degree</label>
                <select className="form-select" value={form.degree} onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))}>
                  <option value="">Not required</option>
                  {['High School', 'Associate\'s', 'Bachelor\'s', 'Master\'s', 'PhD'].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post Job & Trigger AI Match Alerts 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
