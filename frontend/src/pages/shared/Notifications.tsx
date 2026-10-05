import { useState } from 'react';
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
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { dataStore } from '../../services/dataService';
import type { AppNotification } from '../../types';

export function Notifications(): JSX.Element {
  const navigate = useNavigate();
  const activeUser = dataStore.getActiveUser();
  const [filter, setFilter] = useState<'all' | 'unread' | 'task' | 'conflict' | 'review'>('all');

  const [notifications, setNotifications] = useState<AppNotification[]>(dataStore.getNotifications());

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleClear = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'task') return n.type === 'assigned' || n.type === 'status_change';
    if (filter === 'conflict') return n.type === 'conflict';
    if (filter === 'review') return n.type === 'submission' || n.type === 'approval' || n.type === 'revision';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'conflict':
        return <AlertTriangle size={18} color="#EF4444" />;
      case 'approval':
        return <CheckCircle2 size={18} color="#10B981" />;
      case 'submission':
      case 'revision':
        return <Clock size={18} color="#F59E0B" />;
      case 'mention':
        return <MessageSquare size={18} color="#6366F1" />;
      default:
        return <Bell size={18} color="#6366F1" />;
    }
  };

  return (
    <AppLayout role={activeUser.role}>
      <PageContainer>
        {/* Header matching Reference Image 4 screen 3 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Notifications</h1>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--red-100)',
                    color: 'var(--red-700)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Real-time activity alerts, conflict warnings, and review lifecycle updates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleMarkAllRead}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Check size={14} />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
          {(['all', 'unread', 'task', 'conflict', 'review'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: filter === t ? 'var(--primary-600)' : '#FFFFFF',
                color: filter === t ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                fontWeight: filter === t ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {t === 'all'
                ? 'All Notifications'
                : t === 'unread'
                ? 'Unread'
                : t === 'task'
                ? 'Tasks'
                : t === 'conflict'
                ? 'Conflicts'
                : 'Reviews'}
            </button>
          ))}
        </div>

        {/* Notification Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              No notifications matching this filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: item.read ? '#FFFFFF' : '#F0F4FF',
                  border: item.read ? '1px solid var(--border-color)' : '1px solid #BFDBFE',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  handleToggleRead(item.id);
                  if (item.link) navigate(item.link);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: item.read ? '#F1F5F9' : '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: item.read ? 600 : 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {!item.read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--primary-600)',
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.message}
                    </p>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                      {item.createdAt}
                    </span>
                  </div>
                </div>

                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.link && (
                    <button
                      onClick={() => navigate(item.link!)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#EEF2FF',
                        border: 'none',
                        color: 'var(--primary-600)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>View</span>
                      <ExternalLink size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => handleClear(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Dismiss"
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
