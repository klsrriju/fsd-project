import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  function load() {
    notificationsAPI.list().then((res) => setNotifications(res.data.data)).finally(() => setLoading(false));
  }

  async function markRead(id: string) {
    await notificationsAPI.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function markAll() {
    await notificationsAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const typeIcon: Record<string, string> = {
    job_match: '🎯',
    status_update: '📊',
    interview_scheduled: '📅',
    application_received: '📋',
  };

  const typeColor: Record<string, string> = {
    job_match: 'var(--primary)',
    status_update: 'var(--secondary)',
    interview_scheduled: 'var(--green)',
    application_received: 'var(--blue)',
  };

  const unread = notifications.filter((n) => !n.read).length;

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <div className="section-title">🔔 Notifications</div>
          <div className="section-sub">{unread} unread</div>
        </div>
        {unread > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAll}>Mark all read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state" style={{ padding: 80 }}>
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-text">No notifications yet</div>
          <div className="empty-state-sub">You'll be notified of job matches, application updates, and interviews here.</div>
        </div>
      ) : (
        <div className="card">
          {notifications.map((n: any, i: number) => (
            <div
              key={n.id}
              style={{
                display: 'flex', gap: 14,
                borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                background: n.read ? 'transparent' : 'var(--primary-soft)',
                margin: n.read ? 0 : '0 -24px',
                padding: n.read ? '16px 0' : '16px 24px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onClick={() => !n.read && markRead(n.id)}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: typeColor[n.type] + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                {typeIcon[n.type] || '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: n.read ? 600 : 800, fontSize: 14, color: 'var(--text)' }}>{n.title}</span>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, alignSelf: 'center', whiteSpace: 'nowrap' }}>
                  Mark read
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
