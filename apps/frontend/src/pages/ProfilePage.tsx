import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const isHR = user?.role === 'hr';
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState<Record<string, any>>({ ...user });

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (typeof payload.skills === 'string') {
        payload.skills = payload.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      await authAPI.updateProfile(payload);
      updateUser(payload);
      setEditing(false);
      showToast('✅ Profile updated!');
    } catch (err: any) {
      showToast('❌ ' + (err.response?.data?.message || 'Update failed'));
    } finally {
      setSaving(false);
    }
  }

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));
  const skillsStr = Array.isArray(form.skills) ? form.skills.join(', ') : (form.skills || '');

  return (
    <div className="page">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: '#1e1b4b', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Profile header */}
        <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)', border: 'none', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="avatar avatar-xl">{user?.name?.[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{user?.name}</div>
              <div style={{ opacity: 0.75, marginTop: 4 }}>
                {isHR ? `${user?.company} • ${user?.industry}` : user?.targetRole}
              </div>
              <div style={{ opacity: 0.6, fontSize: 13, marginTop: 4 }}>{user?.email}</div>
            </div>
            <button className="btn btn-ghost" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => setEditing(!editing)}>
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
            <div className="card-title" style={{ marginBottom: 20 }}>Edit Profile</div>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name || ''} onChange={(e) => set('name', e.target.value)} />
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
                      <label className="form-label">Phone</label>
                      <input className="form-input" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Skills (comma-separated)</label>
                    <input className="form-input" value={skillsStr} onChange={(e) => set('skills', e.target.value)} placeholder="React, TypeScript, Node.js..." />
                    <div className="form-hint">Skills are used for AI job matching</div>
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
                      <input className="form-input" type="number" min="0" value={form.yearsOfExperience || 0} onChange={(e) => set('yearsOfExperience', e.target.value)} />
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
                </>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        ) : (
          /* View mode */
          <div className="card">
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
                  ].map((pair) => {
                    const label = pair[0] as string;
                    const value = pair[1] as string | undefined;
                    return (
                    <div key={label}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{value || '—'}</div>
                    </div>
                    );
                  })}
                </>
              ) : (
                <>
                  {[
                    ['Target Role', user?.targetRole],
                    ['Experience', `${user?.yearsOfExperience} years`],
                    ['Degree', user?.degree],
                    ['Field of Study', user?.fieldOfStudy],
                    ['University', user?.university],
                    ['Graduation Year', user?.graduationYear],
                    ['Expected Salary', user?.expectedSalary],
                    ['Job Type', user?.jobType],
                    ['Availability', user?.availability],
                    ['Phone', user?.phone],
                  ].map((pair) => {
                    const label = pair[0] as string;
                    const value = pair[1] as string | undefined;
                    return (
                    <div key={label}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{value || '—'}</div>
                    </div>
                    );
                  })}
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
        )}
      </div>
    </div>
  );
}
