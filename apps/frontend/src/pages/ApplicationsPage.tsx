import React, { useEffect, useState } from 'react';
import { applicationsAPI, interviewsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const STAGES = ['applied', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'];
const STAGE_COLORS: Record<string, string> = {
  applied: '#6366f1',
  shortlisted: '#7c3aed',
  interview_scheduled: '#2563eb',
  interviewed: '#d97706',
  offered: '#ea580c',
  hired: '#059669',
  rejected: '#dc2626',
};
const STAGE_LABELS: Record<string, string> = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview',
  interviewed: 'Interviewed',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const isHR = user?.role === 'hr';
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [scheduleApp, setScheduleApp] = useState<any>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [filterJob, setFilterJob] = useState('');
  const [toast, setToast] = useState('');

  const [scheduleForm, setScheduleForm] = useState({
    scheduledAt: '', duration: '60', mode: 'video', platform: 'google_meet', meetLink: '', notes: '',
  });

  useEffect(() => { loadApplications(); }, [filterJob]);

  function loadApplications() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filterJob) params.jobId = filterJob;
    applicationsAPI.list(params).then((res) => setApplications(res.data.data)).finally(() => setLoading(false));
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function updateStatus(appId: string, status: string, notes?: string) {
    await applicationsAPI.updateStatus(appId, status, notes);
    loadApplications();
    showToast(`✅ Status updated to "${STAGE_LABELS[status]}"`);
  }

  async function scheduleInterview(e: React.FormEvent) {
    e.preventDefault();
    try {
      await interviewsAPI.schedule({
        applicationId: scheduleApp.id,
        ...scheduleForm,
        duration: Number(scheduleForm.duration),
      });
      await updateStatus(scheduleApp.id, 'interview_scheduled');
      setScheduleApp(null);
      showToast('✅ Interview scheduled! Candidate has been notified.');
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'Scheduling failed'));
    }
  }

  function scoreColor(score: number) {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  }

  const uniqueJobs = [...new Map(applications.map((a) => [a.jobId, a.job])).entries()];

  const kanbanCols = isHR
    ? ['applied', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected']
    : ['applied', 'shortlisted', 'interview_scheduled', 'offered', 'hired'];

  return (
    <div className="page">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: '#1e1b4b', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <div className="section-header">
        <div>
          <div className="section-title">{isHR ? '📋 Candidate Pipeline' : '📋 My Applications'}</div>
          <div className="section-sub">{applications.length} total applications</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isHR && (
            <select className="form-select" style={{ width: 200 }} value={filterJob} onChange={(e) => setFilterJob(e.target.value)}>
              <option value="">All Jobs</option>
              {uniqueJobs.map(([id, job]) => <option key={id} value={id}>{job?.title}</option>)}
            </select>
          )}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <button className={`btn ${view === 'kanban' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: 0, padding: '8px 14px' }} onClick={() => setView('kanban')}>📊 Kanban</button>
            <button className={`btn ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: 0, padding: '8px 14px' }} onClick={() => setView('list')}>📋 List</button>
          </div>
        </div>
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div> : (

        view === 'kanban' ? (
          /* KANBAN VIEW */
          <div className="kanban-board">
            {kanbanCols.map((stage) => {
              const stageApps = applications.filter((a) => a.status === stage);
              return (
                <div key={stage} className="kanban-col">
                  <div className="kanban-col-header" style={{ background: STAGE_COLORS[stage] + '20', color: STAGE_COLORS[stage] }}>
                    <span>{STAGE_LABELS[stage]}</span>
                    <span style={{ background: STAGE_COLORS[stage], color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                      {stageApps.length}
                    </span>
                  </div>
                  <div className="kanban-cards">
                    {stageApps.map((app) => (
                      <div key={app.id} className="kanban-card" onClick={() => setSelectedApp(app)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <div className="avatar avatar-sm">{(isHR ? app.candidate?.name : app.job?.title)?.[0] || '?'}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{isHR ? app.candidate?.name : app.job?.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{isHR ? app.job?.title : app.job?.company}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: scoreColor(app.matchScore) }}>
                            🎯 {app.matchScore}%
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        {app.matchedSkills?.slice(0, 2).map((s: string) => (
                          <span key={s} style={{ display: 'inline-block', margin: '2px 2px 0 0', padding: '2px 6px', borderRadius: 4, background: 'var(--green-soft)', color: 'var(--green)', fontSize: 10, fontWeight: 600 }}>{s}</span>
                        ))}
                      </div>
                    ))}
                    {stageApps.length === 0 && (
                      <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-light)' }}>Empty</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Match Score</th>
                    <th>Status</th>
                    <th>Applied</th>
                    {isHR && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedApp(app)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">{(app.candidate?.name || 'U')[0]}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{app.candidate?.name || 'You'}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.candidate?.targetRole}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{app.job?.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.job?.company}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: scoreColor(app.matchScore) }}>{app.matchScore}%</div>
                        <div className="progress-bar" style={{ width: 60, marginTop: 4 }}>
                          <div className="progress-fill" style={{ width: `${app.matchScore}%`, background: scoreColor(app.matchScore) }} />
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: STAGE_COLORS[app.status] + '20', color: STAGE_COLORS[app.status] }}>
                          {STAGE_LABELS[app.status]}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      {isHR && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {app.status === 'applied' && (
                              <button className="btn btn-outline btn-sm" onClick={() => updateStatus(app.id, 'shortlisted')}>Shortlist</button>
                            )}
                            {app.status === 'shortlisted' && (
                              <button className="btn btn-primary btn-sm" onClick={() => setScheduleApp(app)}>Schedule Interview</button>
                            )}
                            {app.status === 'interviewed' && (
                              <button className="btn btn-success btn-sm" onClick={() => updateStatus(app.id, 'offered')}>Send Offer</button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selectedApp.candidate?.name || 'Application Details'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Applied for: {selectedApp.job?.title} at {selectedApp.job?.company}</div>
              </div>
              <button className="modal-close" onClick={() => setSelectedApp(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>AI Match Analysis</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor(selectedApp.matchScore) }}>{selectedApp.matchScore}%</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Overall Match Score</div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>✅ Matched Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selectedApp.matchedSkills?.map((s: string) => <span key={s} className="badge badge-green">{s}</span>)}
                    {!selectedApp.matchedSkills?.length && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>None</span>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, marginTop: 10 }}>❌ Missing Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selectedApp.missingSkills?.map((s: string) => <span key={s} className="badge badge-red">{s}</span>)}
                    {!selectedApp.missingSkills?.length && <span style={{ fontSize: 12, color: 'var(--green)' }}>None — Perfect Match! 🎉</span>}
                  </div>
                </div>
              </div>
              {isHR && selectedApp.candidate && (
                <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Candidate Info</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedApp.candidate.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedApp.candidate.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{selectedApp.candidate.yearsOfExperience} yrs exp • {selectedApp.candidate.targetRole}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedApp.candidate.degree} in {selectedApp.candidate.fieldOfStudy}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedApp.candidate.university} ({selectedApp.candidate.graduationYear})</div>
                  {selectedApp.resumeUrl && (
                    <a href={selectedApp.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 10, display: 'inline-flex' }}>📄 View Resume</a>
                  )}
                </div>
              )}
            </div>

            {selectedApp.aiAnalysis && (
              <div className="alert alert-info" style={{ marginBottom: 12 }}>
                <span>🤖</span> <span>{selectedApp.aiAnalysis}</span>
              </div>
            )}

            {selectedApp.resumeFeedback && (
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>📝 Resume Feedback</div>
                <pre style={{ fontSize: 13, color: 'var(--text)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6 }}>{selectedApp.resumeFeedback}</pre>
              </div>
            )}

            {selectedApp.notes && (
              <div className="alert alert-warning">
                <span>📝</span> <strong>HR Notes:</strong> {selectedApp.notes}
              </div>
            )}

            {isHR && (
              <div className="modal-footer" style={{ flexWrap: 'wrap', gap: 8 }}>
                {selectedApp.status === 'applied' && (
                  <>
                    <button className="btn btn-outline" onClick={() => { updateStatus(selectedApp.id, 'rejected'); setSelectedApp(null); }}>Reject</button>
                    <button className="btn btn-primary" onClick={() => { updateStatus(selectedApp.id, 'shortlisted'); setSelectedApp(null); }}>Shortlist ⭐</button>
                  </>
                )}
                {selectedApp.status === 'shortlisted' && (
                  <>
                    <button className="btn btn-outline" onClick={() => { updateStatus(selectedApp.id, 'rejected'); setSelectedApp(null); }}>Reject</button>
                    <button className="btn btn-primary" onClick={() => { setSelectedApp(null); setScheduleApp(selectedApp); }}>Schedule Interview 📅</button>
                  </>
                )}
                {selectedApp.status === 'interview_scheduled' && (
                  <button className="btn btn-success" onClick={() => { updateStatus(selectedApp.id, 'interviewed'); setSelectedApp(null); }}>Mark Interviewed ✓</button>
                )}
                {selectedApp.status === 'interviewed' && (
                  <>
                    <button className="btn btn-outline" onClick={() => { updateStatus(selectedApp.id, 'rejected'); setSelectedApp(null); }}>Reject</button>
                    <button className="btn btn-primary" onClick={() => { updateStatus(selectedApp.id, 'offered'); setSelectedApp(null); }}>Send Offer 🎉</button>
                  </>
                )}
                {selectedApp.status === 'offered' && (
                  <button className="btn btn-success" onClick={() => { updateStatus(selectedApp.id, 'hired'); setSelectedApp(null); }}>Mark as Hired ✓</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleApp && (
        <div className="modal-overlay" onClick={() => setScheduleApp(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Schedule Interview</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{scheduleApp.candidate?.name} — {scheduleApp.job?.title}</div>
              </div>
              <button className="modal-close" onClick={() => setScheduleApp(null)}>✕</button>
            </div>
            <form onSubmit={scheduleInterview}>
              <div className="form-group">
                <label className="form-label">Date & Time <span>*</span></label>
                <input className="form-input" type="datetime-local" value={scheduleForm.scheduledAt} onChange={(e) => setScheduleForm((f) => ({ ...f, scheduledAt: e.target.value }))} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <select className="form-select" value={scheduleForm.duration} onChange={(e) => setScheduleForm((f) => ({ ...f, duration: e.target.value }))}>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Interview Mode</label>
                  <select className="form-select" value={scheduleForm.mode} onChange={(e) => setScheduleForm((f) => ({ ...f, mode: e.target.value }))}>
                    <option value="video">Video</option>
                    <option value="phone">Phone</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>
              {scheduleForm.mode === 'video' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Video Platform</label>
                    <select className="form-select" value={scheduleForm.platform} onChange={(e) => setScheduleForm((f) => ({ ...f, platform: e.target.value }))}>
                      <option value="google_meet">Google Meet</option>
                      <option value="zoom">Zoom</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meeting Link</label>
                    <input className="form-input" placeholder="https://meet.google.com/..." value={scheduleForm.meetLink} onChange={(e) => setScheduleForm((f) => ({ ...f, meetLink: e.target.value }))} />
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Notes for Candidate</label>
                <textarea className="form-textarea" rows={2} placeholder="Topics to cover, what to prepare..." value={scheduleForm.notes} onChange={(e) => setScheduleForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setScheduleApp(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule & Notify Candidate 📅</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
