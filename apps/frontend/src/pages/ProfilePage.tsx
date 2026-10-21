import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, connectorsAPI } from '../api';

export default function ProfilePage() {
  const { user, updateUser, theme, setTheme } = useAuth();
  const location = useLocation();
  const isHR = user?.role === 'hr';
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState<Record<string, any>>({ ...user });

  // Certificate & achievement state
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementIssuer, setAchievementIssuer] = useState('');
  const [achievementCategory, setAchievementCategory] = useState<string>('Hackathon');
  const [achievementDate, setAchievementDate] = useState('');
  const [achievementUrl, setAchievementUrl] = useState('');
  const [achievementFile, setAchievementFile] = useState<string>('');
  const [achievementFileName, setAchievementFileName] = useState<string>('');
  const [achievementFileType, setAchievementFileType] = useState<string>('');
  const [achievementSaving, setAchievementSaving] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [viewingCertificate, setViewingCertificate] = useState<any>(null);

  useEffect(() => {
    // Check for OAuth callback query parameters
    const params = new URLSearchParams(location.search);
    if (params.get('github') === 'connected') {
      showToast('🐙 GitHub account successfully connected via OAuth!');
      authAPI.me().then((res) => updateUser(res.data.data)).catch(() => {});
    } else if (params.get('github_error')) {
      showToast(`❌ GitHub error: ${params.get('github_error')}`);
    }
  }, [location.search]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  useEffect(() => {
    if (user) {
      setForm({ ...user });
    }
  }, [user]);

  useEffect(() => {
    authAPI.me()
      .then((res) => {
        if (res.data?.data) {
          updateUser(res.data.data);
          setForm({ ...res.data.data });
        }
      })
      .catch(() => {});
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload._id;
      delete payload.__v;
      delete payload.id;
      delete payload.email;
      delete payload.role;
      delete payload.createdAt;
      delete payload.password;
      delete payload.passwordHash;
      if (typeof payload.skills === 'string') {
        payload.skills = payload.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      const res = await authAPI.updateProfile(payload);
      const updatedUser = res.data.data;
      updateUser(updatedUser);
      setForm({ ...updatedUser });
      if (payload.themePreference) {
        setTheme(payload.themePreference);
      }
      setEditing(false);
      showToast('✅ Profile updated and saved!');
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'Update failed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnectGithub() {
    try {
      await connectorsAPI.disconnectGitHub();
      updateUser({
        githubUsername: undefined,
        externalProfileData: {
          ...(user?.externalProfileData as any),
          github: { connected: false },
        },
      });
      showToast('GitHub account disconnected.');
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to disconnect'));
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast('⚠️ Certificate file size must be under 20MB');
      return;
    }

    setAchievementFileName(file.name);
    setAchievementFileType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setAchievementFile(reader.result as string);
      showToast(`📎 Certificate attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  async function handleAddAchievement(e: React.FormEvent) {
    e.preventDefault();
    if (!achievementTitle.trim()) return;
    setAchievementSaving(true);
    try {
      const res = await connectorsAPI.addUnstopAchievement({
        title: achievementTitle.trim(),
        issuer: achievementIssuer.trim() || 'Self-Reported Organization',
        category: achievementCategory,
        date: achievementDate || new Date().toISOString().split('T')[0],
        verificationUrl: achievementUrl.trim() || undefined,
        certificateFile: achievementFile || undefined,
        fileName: achievementFileName || undefined,
        fileType: achievementFileType || undefined,
      });
      const updatedAchievements = res.data.data.achievements;
      updateUser({
        externalProfileData: {
          ...(user?.externalProfileData as any),
          unstop: {
            ...((user?.externalProfileData as any)?.unstop || {}),
            connected: true,
            customAchievements: updatedAchievements,
          },
        },
      });
      setShowAchievementModal(false);
      setAchievementTitle('');
      setAchievementIssuer('');
      setAchievementCategory('Hackathon');
      setAchievementDate('');
      setAchievementUrl('');
      setAchievementFile('');
      setAchievementFileName('');
      setAchievementFileType('');
      showToast('✅ Certificate & achievement successfully added to profile!');
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to add achievement'));
    } finally {
      setAchievementSaving(false);
    }
  }

  async function handleDeleteAchievement(id: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this certificate/achievement?')) return;
    try {
      const res = await connectorsAPI.deleteUnstopAchievement(id);
      const updatedAchievements = res.data.data.achievements;
      updateUser({
        externalProfileData: {
          ...(user?.externalProfileData as any),
          unstop: {
            ...((user?.externalProfileData as any)?.unstop || {}),
            customAchievements: updatedAchievements,
          },
        },
      });
      showToast('Achievement removed.');
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to remove achievement'));
    }
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const skillsStr = Array.isArray(form.skills) ? form.skills.join(', ') : (form.skills || '');

  const extData: any = user?.externalProfileData || {};
  const ghData: any = extData.github || {};
  const unstopData: any = extData.unstop || {};
  const achievements: any[] = unstopData.customAchievements || [];

  return (
    <div className="page">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: '#1e1b4b', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Profile header */}
        <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)', border: 'none', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="avatar avatar-xl">{user?.name?.[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{user?.name}</div>
              <div style={{ opacity: 0.75, marginTop: 4 }}>
                {isHR ? `${user?.company || 'Company'} • ${user?.industry || 'Recruiting'}` : user?.targetRole || 'Candidate'}
              </div>
              <div style={{ opacity: 0.6, fontSize: 13, marginTop: 4 }}>{user?.email}</div>
            </div>
            <button
              className="btn btn-ghost"
              style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              onClick={() => { setForm({ ...user }); setEditing(!editing); }}
            >
              {editing ? 'Cancel' : '✏️ Edit Profile'}
            </button>
          </div>
          {!isHR && user?.skills && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
              {(user.skills as string[]).map((s) => (
                <span key={s} style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          )}
        </div>

        {editing ? (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 20 }}>Edit Profile & Settings</div>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name || ''} onChange={(e) => set('name', e.target.value)} required />
              </div>

              {isHR ? (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input className="form-input" value={form.company || ''} onChange={(e) => set('company', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <select className="form-select" value={form.industry || ''} onChange={(e) => set('industry', e.target.value)}>
                        {['Technology', 'Fintech', 'Healthcare', 'E-commerce', 'Finance', 'Other'].map((i) => <option key={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Company Size</label>
                      <select className="form-select" value={form.companySize || ''} onChange={(e) => set('companySize', e.target.value)}>
                        {['1-10', '11-50', '51-100', '101-500', '501-1000', '1000+'].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" value={form.location || ''} onChange={(e) => set('location', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input className="form-input" value={form.website || ''} onChange={(e) => set('website', e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Target Role</label>
                      <input className="form-input" value={form.targetRole || ''} onChange={(e) => set('targetRole', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Phone (for SMS notifications)</label>
                      <input className="form-input" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+1234567890" />
                    </div>
                  </div>

                  {/* SMS Notifications Consent & Preferences (Phase 8) */}
                  <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>
                      📱 SMS Notifications
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, marginBottom: 10 }}>
                      <input
                        type="checkbox"
                        checked={form.smsConsent === true}
                        onChange={(e) => set('smsConsent', e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontWeight: 600 }}>I consent to receive important SMS notifications on my mobile number</span>
                    </label>
                    {form.smsConsent && (
                      <div style={{ marginLeft: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          ['interviews', '📅 Interview Invitations & Schedule'],
                          ['statusUpdates', '📊 Status Changes & Offers'],
                          ['feedback', '💬 Rejection Feedback Notes'],
                          ['jobAlerts', '🎯 Future Job Match Alerts'],
                        ].map(([key, label]) => (
                          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={form.smsPreferences?.[key] !== false}
                              onChange={(e) => {
                                const current = form.smsPreferences || {};
                                set('smsPreferences', { ...current, [key]: e.target.checked });
                              }}
                              style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skills (comma-separated)</label>
                    <input className="form-input" value={skillsStr} onChange={(e) => set('skills', e.target.value)} placeholder="React, TypeScript, Node.js..." />
                    <div className="form-hint">Used for AI candidate matching and skill-gap evaluation</div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Degree</label>
                      <select className="form-select" value={form.degree || ''} onChange={(e) => set('degree', e.target.value)}>
                        {["Bachelor's", "Master's", 'PhD', "Associate's", 'Other'].map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Field of Study</label>
                      <input className="form-input" value={form.fieldOfStudy || ''} onChange={(e) => set('fieldOfStudy', e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">University</label>
                      <input className="form-input" value={form.university || ''} onChange={(e) => set('university', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Years of Experience</label>
                      <input className="form-input" type="number" min="0" value={form.yearsOfExperience || 0} onChange={(e) => set('yearsOfExperience', Number(e.target.value))} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Expected Salary</label>
                      <input className="form-input" value={form.expectedSalary || ''} onChange={(e) => set('expectedSalary', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Job Type Preference</label>
                      <select className="form-select" value={form.jobType || ''} onChange={(e) => set('jobType', e.target.value)}>
                        {['full-time', 'part-time', 'remote', 'hybrid', 'contract'].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Resume URL</label>
                    <input className="form-input" value={form.resumeUrl || ''} onChange={(e) => set('resumeUrl', e.target.value)} placeholder="https://drive.google.com/..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input className="form-input" value={form.linkedIn || ''} onChange={(e) => set('linkedIn', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" rows={3} value={form.bio || ''} onChange={(e) => set('bio', e.target.value)} />
                  </div>

                  {/* Future Opportunities Alert Toggle */}
                  <div style={{ background: 'var(--primary-soft)', padding: 14, borderRadius: 10, marginBottom: 16, border: '1px solid var(--border)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                      <input
                        type="checkbox"
                        checked={form.notifyFutureJobsOnRejection !== false}
                        onChange={(e) => set('notifyFutureJobsOnRejection', e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                      />
                      <span>🔔 Receive Future Job Availability Alerts if Rejected</span>
                    </label>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, marginLeft: 28 }}>
                      If an application does not work out, employers and our matching engine will alert you when new openings matching your skill set are posted.
                    </div>
                  </div>
                </>
              )}

              {/* Theme Settings for all users */}
              <div style={{ marginTop: 12, marginBottom: 20 }}>
                <label className="form-label">🎨 Interface Color Theme</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                  {[
                    { id: 'default', label: '💜 Indigo / Purple' },
                    { id: 'dark', label: '🌙 Midnight Dark' },
                    { id: 'emerald', label: '🍃 Mint Emerald' },
                    { id: 'sunset', label: '🌅 Sunset Coral' },
                    { id: 'ocean', label: '🌊 Azure Ocean' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`btn btn-sm ${form.themePreference === t.id ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ fontSize: 11, padding: '8px 10px' }}
                      onClick={() => {
                        set('themePreference', t.id);
                        setTheme(t.id as any);
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        ) : (
          /* View mode */
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 20 }}>Profile Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {isHR ? (
                  <>
                    {[
                      ['Company', user?.company],
                      ['Industry', user?.industry],
                      ['Company Size', user?.companySize],
                      ['Location', user?.location],
                      ['Website', user?.website],
                      ['Member Since', user?.createdAt ? new Date(user.createdAt as string).toLocaleDateString() : 'N/A'],
                    ].map((pair) => (
                      <div key={pair[0] as string}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{pair[0] as string}</div>
                        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{(pair[1] as string) || '—'}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      ['Target Role', user?.targetRole],
                      ['Experience', `${user?.yearsOfExperience || 0} years`],
                      ['Degree', user?.degree],
                      ['Field of Study', user?.fieldOfStudy],
                      ['University', user?.university],
                      ['Graduation Year', user?.graduationYear],
                      ['Expected Salary', user?.expectedSalary],
                      ['Job Type', user?.jobType],
                      ['Availability', user?.availability],
                      ['Phone', user?.phone],
                    ].map((pair) => (
                      <div key={pair[0] as string}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{pair[0] as string}</div>
                        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{(pair[1] as string) || '—'}</div>
                      </div>
                    ))}
                    {user?.linkedIn && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>LinkedIn</div>
                        <a href={user.linkedIn as string} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>View Profile →</a>
                      </div>
                    )}
                    {user?.resumeUrl && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Resume</div>
                        <a href={user.resumeUrl as string} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex' }}>📄 View Resume</a>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Future Job Availability Alerts</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: user?.notifyFutureJobsOnRejection !== false ? 'var(--green)' : 'var(--red)' }}>
                        {user?.notifyFutureJobsOnRejection !== false ? '✅ Enabled (Alerts if rejected)' : '❌ Disabled'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>SMS Notifications</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: user?.smsConsent ? 'var(--green)' : 'var(--text-muted)' }}>
                        {user?.smsConsent ? '📱 Active (Consent granted)' : '⚪ Inactive (Not opted in)'}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {!isHR && !!user?.bio && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Bio</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{user.bio as string}</p>
                </div>
              )}
            </div>

            {/* Candidate Connectors & Verified Skill Evidence (Phase 6 & 7) */}
            {!isHR && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* GitHub Card */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>🐙</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>GitHub Account</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Repository & language skills</div>
                      </div>
                    </div>
                    <span className={`badge ${user?.githubUsername ? 'badge-green' : 'badge-gray'}`}>
                      {user?.githubUsername ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>

                  {user?.githubUsername ? (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        @{user.githubUsername}
                      </div>
                      {ghData.topLanguages?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0' }}>
                          {ghData.topLanguages.map((lang: string) => (
                            <span key={lang} className="badge badge-indigo">{lang}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {ghData.reposCount ? `${ghData.reposCount} public repos` : 'Skills synchronized with profile'}
                      </div>
                      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        <a
                          href={`https://github.com/${user.githubUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          View GitHub →
                        </a>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={handleDisconnectGithub}>
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                        Connect your GitHub to import proven coding languages and verified repository projects to your Skill Passport.
                      </p>
                      <a
                        href={`http://localhost:3001/api/v1/auth/github?state=${user?.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        🔗 Connect via GitHub OAuth
                      </a>
                    </div>
                  )}
                </div>

                {/* Verified Credentials & Certificates Card */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>🏅</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>Verified Credentials, Hackathons & Certificates</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Classified evidence of competitions, courses, and certifications</div>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAchievementModal(true)}>
                      ➕ Upload Certificate / Add Proof
                    </button>
                  </div>

                  {/* Category Classification Filter Tabs */}
                  {achievements.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                      {[
                        { id: 'All', label: 'All', count: achievements.length },
                        { id: 'Hackathon', label: '🏆 Hackathons', count: achievements.filter((a: any) => a.category === 'Hackathon').length },
                        { id: 'Learning', label: '🎓 Learning & Courses', count: achievements.filter((a: any) => a.category === 'Learning').length },
                        { id: 'Professional', label: '💼 Professional Certs', count: achievements.filter((a: any) => a.category === 'Professional').length },
                        { id: 'Workshop', label: '📜 Workshops & Others', count: achievements.filter((a: any) => !['Hackathon', 'Learning', 'Professional'].includes(a.category)).length },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryFilter(cat.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 20,
                            border: selectedCategoryFilter === cat.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                            background: selectedCategoryFilter === cat.id ? 'var(--primary)' : 'var(--bg)',
                            color: selectedCategoryFilter === cat.id ? 'white' : 'var(--text)',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span>{cat.label}</span>
                          <span style={{ opacity: 0.8, fontSize: 11, background: selectedCategoryFilter === cat.id ? 'rgba(255,255,255,0.2)' : 'var(--border)', padding: '1px 6px', borderRadius: 10 }}>
                            {cat.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Achievements Grid */}
                  {achievements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📜</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>No Certificates or Achievements Uploaded Yet</div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 450, margin: '6px auto 16px auto', lineHeight: 1.5 }}>
                        Upload hackathon wins, course completion certificates (PDF/images), or professional certifications to build your verified evidence passport.
                      </p>
                      <button className="btn btn-outline btn-sm" onClick={() => setShowAchievementModal(true)}>
                        ➕ Upload First Certificate
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 14 }}>
                      {achievements
                        .filter((ach: any) => {
                          if (selectedCategoryFilter === 'All') return true;
                          if (selectedCategoryFilter === 'Workshop') return !['Hackathon', 'Learning', 'Professional'].includes(ach.category);
                          return ach.category === selectedCategoryFilter;
                        })
                        .map((ach: any, idx: number) => {
                          const cat = ach.category || 'Hackathon';
                          const catBadge =
                            cat === 'Hackathon' ? 'badge-yellow' :
                            cat === 'Learning' ? 'badge-blue' :
                            cat === 'Professional' ? 'badge-purple' :
                            cat === 'Workshop' ? 'badge-green' : 'badge-indigo';

                          return (
                            <div
                              key={ach.id || idx}
                              style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                padding: 14,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                  <span className={`badge ${catBadge}`} style={{ fontSize: 10, fontWeight: 700 }}>
                                    {cat === 'Hackathon' ? '🏆 Hackathon' :
                                     cat === 'Learning' ? '🎓 Learning' :
                                     cat === 'Professional' ? '💼 Professional' :
                                     cat === 'Workshop' ? '📜 Workshop' : '🌟 Achievement'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteAchievement(ach.id || String(idx), e)}
                                    title="Delete certificate"
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: 13 }}
                                  >
                                    🗑️
                                  </button>
                                </div>

                                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>
                                  {ach.title}
                                </div>

                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                                  🏛️ {ach.issuer || 'Self-Reported'} • 📅 {ach.date || 'Verified'}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                                {ach.certificateFile && (
                                  <button
                                    type="button"
                                    onClick={() => setViewingCertificate(ach)}
                                    className="btn btn-outline btn-sm"
                                    style={{ fontSize: 11, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                                  >
                                    <span>📄</span>
                                    <span>View Certificate</span>
                                  </button>
                                )}

                                {ach.verificationUrl && (
                                  <a
                                    href={ach.verificationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-ghost btn-sm"
                                    style={{ fontSize: 11, padding: '3px 10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}
                                  >
                                    <span>🔗</span>
                                    <span>Verify Link ↗</span>
                                  </a>
                                )}

                                {!ach.certificateFile && !ach.verificationUrl && (
                                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Self-Reported Evidence</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Achievement or Certificate Modal */}
      {showAchievementModal && (
        <div className="modal-overlay" onClick={() => setShowAchievementModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">🏅 Upload Certificate & Achievement</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Upload your certificate file (PDF/Image) and classify it under hackathons, learning, or professional credentials.
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowAchievementModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddAchievement}>
              {/* Category Classification Selector */}
              <div className="form-group">
                <label className="form-label">Classification Category <span style={{ color: 'var(--red)' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                  {[
                    { id: 'Hackathon', label: '🏆 Hackathon' },
                    { id: 'Learning', label: '🎓 Course & Learning' },
                    { id: 'Professional', label: '💼 Professional Cert' },
                    { id: 'Workshop', label: '📜 Workshop / Bootcamp' },
                    { id: 'Academic / Honor', label: '🌟 Academic / Honor' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAchievementCategory(cat.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: achievementCategory === cat.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: achievementCategory === cat.id ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg)',
                        color: achievementCategory === cat.id ? 'var(--primary)' : 'var(--text)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Issuer */}
              <div className="form-group">
                <label className="form-label">Certificate / Achievement Title <span style={{ color: 'var(--red)' }}>*</span></label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Winner - Smart India Hackathon / Machine Learning Specialization"
                  value={achievementTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAchievementTitle(val);
                    // Helpful smart auto-classifier
                    const lower = val.toLowerCase();
                    if (lower.includes('hackathon') || lower.includes('competition') || lower.includes('contest')) {
                      setAchievementCategory('Hackathon');
                    } else if (lower.includes('course') || lower.includes('learning') || lower.includes('specialization')) {
                      setAchievementCategory('Learning');
                    } else if (lower.includes('certified') || lower.includes('aws') || lower.includes('cloud') || lower.includes('azure')) {
                      setAchievementCategory('Professional');
                    } else if (lower.includes('workshop') || lower.includes('bootcamp')) {
                      setAchievementCategory('Workshop');
                    }
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Issuer / Organization</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Unstop, Coursera, AWS, HackerRank"
                    value={achievementIssuer}
                    onChange={(e) => setAchievementIssuer(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date Issued</label>
                  <input
                    className="form-input"
                    type="date"
                    value={achievementDate}
                    onChange={(e) => setAchievementDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Certificate File Upload Section */}
              <div className="form-group">
                <label className="form-label">Upload Certificate File (PDF, PNG, JPG)</label>
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 10,
                    padding: 16,
                    textAlign: 'center',
                    background: 'var(--bg)',
                    position: 'relative',
                  }}
                >
                  {achievementFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                        <span style={{ fontSize: 28 }}>{achievementFileType.includes('pdf') ? '📄' : '🖼️'}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{achievementFileName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ready to attach to profile evidence</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)', fontSize: 12 }}
                        onClick={() => {
                          setAchievementFile('');
                          setAchievementFileName('');
                          setAchievementFileType('');
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 26, marginBottom: 4 }}>📎</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Click to browse or drop certificate file</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Supports PDF, PNG, JPG up to 20MB</div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileSelect}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Credential Link */}
              <div className="form-group">
                <label className="form-label">Verification URL / Credential Link (Optional)</label>
                <input
                  className="form-input"
                  placeholder="https://coursera.org/verify/... or https://unstop.com/..."
                  value={achievementUrl}
                  onChange={(e) => setAchievementUrl(e.target.value)}
                />
                <div className="form-hint">Optional if you uploaded the certificate file above</div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAchievementModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={achievementSaving}>
                  {achievementSaving ? 'Uploading & Saving...' : 'Save Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <div className="modal-overlay" onClick={() => setViewingCertificate(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="modal-title">{viewingCertificate.title}</div>
                  <span className="badge badge-purple" style={{ fontSize: 10 }}>{viewingCertificate.category || 'Certificate'}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Issued by: {viewingCertificate.issuer || 'Self-Reported'} • {viewingCertificate.date}
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewingCertificate(null)}>✕</button>
            </div>

            <div style={{ margin: '14px 0', maxHeight: 520, overflow: 'auto', textAlign: 'center', background: '#0f172a', borderRadius: 10, padding: 10 }}>
              {viewingCertificate.fileType?.includes('pdf') || viewingCertificate.fileName?.endsWith('.pdf') ? (
                <iframe
                  src={viewingCertificate.certificateFile}
                  title="Certificate Preview"
                  width="100%"
                  height="480px"
                  style={{ border: 'none', borderRadius: 8, background: '#ffffff' }}
                />
              ) : (
                <img
                  src={viewingCertificate.certificateFile}
                  alt={viewingCertificate.title}
                  style={{ maxWidth: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 8 }}
                />
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <a
                href={viewingCertificate.certificateFile}
                download={viewingCertificate.fileName || `${viewingCertificate.title}-certificate`}
                className="btn btn-primary btn-sm"
              >
                ⬇️ Download Certificate File
              </a>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewingCertificate(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
