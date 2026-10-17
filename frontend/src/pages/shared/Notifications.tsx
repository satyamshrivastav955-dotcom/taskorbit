import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { dataStore } from '../../services/dataService';
import { useAppSelector } from '../../redux/hooks';
import type { AppNotification } from '../../types';
import { useToast } from '../../components/ui/Toast';

type Tab = 'all' | 'unread' | 'mentions' | 'updates' | 'approvals' | 'system';

export function Notifications(): JSX.Element {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useAppSelector((s) => s.session);
  const activeUser = dataStore.getActiveUser();
  const [filter, setFilter] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => dataStore.subscribe(() => setTick((t) => t + 1)), []);

  const all = dataStore.getNotifications(session.uid !== '' ? session.uid : activeUser.uid);
  const q = search.trim().toLowerCase();
  const filtered = all.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'mentions' && n.type !== 'mention') return false;
    if (filter === 'updates' && !['assigned', 'status_change', 'submission', 'revision'].includes(n.type)) return false;
    if (filter === 'approvals' && n.type !== 'approval') return false;
    if (filter === 'system' && !['conflict', 'system'].includes(n.type)) return false;
    if (q !== '' && !n.message.toLowerCase().includes(q)) return false;
    return true;
  });

  const unreadCount = all.filter((n) => !n.read).length;

  async function openItem(item: AppNotification): Promise<void> {
    if (!item.read) {
      await dataStore.markNotificationRead(item.id).catch(() => toast('Could not mark this notification as read.', 'error'));
    }
    if (item.link !== '') navigate(item.link);
  }

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'conflict':
      case 'system':
        return <AlertTriangle size={18} color="var(--danger)" />;
      case 'approval':
        return <CheckCircle2 size={18} color="var(--success)" />;
      case 'submission':
      case 'revision':
      case 'status_change':
        return <Clock size={18} color="var(--warning)" />;
      case 'mention':
        return <MessageSquare size={18} color="var(--professional-blue)" />;
      default:
        return <Bell size={18} color="var(--professional-blue)" />;
    }
  };

  const role = activeUser.uid !== '' ? activeUser.role : session.role === '' ? 'client' : session.role;

  return (
    <AppLayout role={role}>
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Notifications</h1>
              {unreadCount > 0 && (
                <span style={{ background: 'var(--pale-blue)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Real-time activity alerts, conflict warnings, and review lifecycle updates.
            </p>
          </div>
          <button
            onClick={() => { void dataStore.markAllNotificationsRead().catch(() => toast('Could not mark notifications as read.', 'error')); }}
            disabled={unreadCount === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#FFFFFF', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <Check size={14} />
            <span>Mark all as read</span>
          </button>
        </div>

        <div style={{ margin: '16px 0' }}>
          <input
            type="text"
            placeholder="Search notifications..."
            aria-label="Search notifications"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: '420px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', margin: '0 0 16px 0', flexWrap: 'wrap' }}>
          {([
            ['all', 'All'],
            ['unread', 'Unread'],
            ['mentions', 'Mentions'],
            ['updates', 'Task Updates'],
            ['approvals', 'Approvals'],
            ['system', 'System'],
          ] as Array<[Tab, string]>).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '6px 14px', borderRadius: '9999px',
                background: filter === t ? 'var(--primary-600)' : '#FFFFFF',
                color: filter === t ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)', fontSize: '13px',
                fontWeight: filter === t ? 600 : 500, cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dataStore.isLoading() && all.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '60px 20px', textAlign: 'center' }}>
              <Loader2 size={36} color="var(--primary-600)" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Loading notifications…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '60px 20px', textAlign: 'center' }}>
              <Bell size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                {filter === 'all'
                  ? 'You\'ll receive notifications when tasks are assigned, reviewed, or updated.'
                  : 'Try switching to "All" to see all notifications.'}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
                  padding: '16px 20px', borderRadius: '12px',
                  background: item.read ? 'var(--surface)' : 'var(--pale-blue)',
                  border: item.read ? '1px solid var(--border-color)' : '1px solid var(--info-border)',
                  boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                }}
                role="link"
                tabIndex={0}
                onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); void openItem(item); } }}
                onClick={() => { void openItem(item); }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: item.read ? 'var(--surface-muted)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: item.read ? 600 : 700, color: 'var(--text-primary)' }}>
                        {item.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {!item.read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-600)', display: 'inline-block' }} />}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {item.message}
                    </p>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                      {item.timeAgo ?? item.createdAt}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                  {item.link !== '' && (
                    <button
                      onClick={() => { void openItem(item); }}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--surface)', border: '1px solid var(--info-border)', color: 'var(--primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>View</span>
                      <ExternalLink size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => { void dataStore.deleteNotification(item.id).catch(() => toast('Could not delete the notification.', 'error')); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
