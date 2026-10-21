import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../api';

const TYPE_ICON: Record<string, string> = {
  job_match: '🎯',
  status_update: '📊',
  interview_scheduled: '📅',
  application_received: '📋',
  future_opportunity: '🚀',
  feedback_requested: '📝',
  feedback_responded: '💬',
};

const TYPE_COLOR: Record<string, string> = {
  job_match: 'var(--primary)',
  status_update: 'var(--secondary)',
  interview_scheduled: 'var(--green)',
  application_received: 'var(--blue)',
  future_opportunity: 'var(--primary)',
  feedback_requested: 'var(--yellow, #d97706)',
  feedback_responded: 'var(--green)',
};

const TYPE_LABEL: Record<string, string> = {
  job_match: 'Job Match',
  status_update: 'Status Update',
  interview_scheduled: 'Interview',
  application_received: 'New Application',
  future_opportunity: 'Future Opportunity',
  feedback_requested: 'Feedback Request',
  feedback_responded: 'Feedback Available',
};

/** Determine which frontend route to navigate to when a notification is clicked */
function resolveRoute(n: any): string | null {
  const meta = n.metadata || {};

  switch (n.type) {
    case 'interview_scheduled':
      return '/interviews';
    case 'application_received':
    case 'status_update':
    case 'feedback_requested':
    case 'feedback_responded':
      return meta.applicationId ? `/applications?appId=${meta.applicationId}` : '/applications';
    case 'job_match':
    case 'future_opportunity':
      return meta.jobId ? `/jobs?jobId=${meta.jobId}` : '/jobs';
    default:
      return n.route || null;
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    notificationsAPI.list()
      .then((res) => setNotifications(res.data.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }

  async function handleClick(n: any) {
    // Mark as read first
    if (!n.read) {
      try {
        await notificationsAPI.markRead(n.id);
        setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      } catch {}
    }

    // Navigate to the associated page
    const route = resolveRoute(n);
    if (route) {
      navigate(route);
    }
  }

  async function markAll() {
    await notificationsAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const displayed = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unread = notifications.filter((n) => !n.read).length;

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <div className="section-title">🔔 Notifications</div>
          <div className="section-sub">
            {unread > 0 ? `${unread} unread` : 'All caught up!'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 0, padding: '8px 14px', fontSize: 12 }}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 0, padding: '8px 14px', fontSize: 12 }}
              onClick={() => setFilter('unread')}
            >
              Unread ({unread})
            </button>
          </div>
          {unread > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={markAll}>Mark all read</button>
          )}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state" style={{ padding: 80 }}>
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-text">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </div>
          <div className="empty-state-sub">
            {filter === 'unread'
              ? 'Switch to "All" to see previous notifications.'
              : "You'll be notified of job matches, application updates, and interviews here."}
          </div>
        </div>
      ) : (
        <div className="card">
          {displayed.map((n: any, i: number) => {
            const route = resolveRoute(n);
            const isClickable = !!route;

            return (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  borderBottom: i < displayed.length - 1 ? '1px solid var(--border)' : 'none',
                  background: n.read ? 'transparent' : 'var(--primary-soft)',
                  margin: n.read ? 0 : '0 -24px',
                  padding: n.read ? '16px 0' : '16px 24px',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                }}
                onClick={() => handleClick(n)}
                title={isClickable ? `Click to open → ${route}` : undefined}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: (TYPE_COLOR[n.type] || 'var(--primary)') + '20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {TYPE_ICON[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: n.read ? 600 : 800, fontSize: 14, color: 'var(--text)' }}>{n.title}</span>
                    {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                    <span style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {TYPE_LABEL[n.type] || n.type}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {isClickable && (
                      <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                        {n.read ? 'View →' : 'Open →'}
                      </span>
                    )}
                  </div>
                </div>
                {!n.read && (
                  <div
                    style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, alignSelf: 'center', whiteSpace: 'nowrap' }}
                    onClick={(e) => { e.stopPropagation(); notificationsAPI.markRead(n.id).then(() => setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))); }}
                  >
                    ✓ Read
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
