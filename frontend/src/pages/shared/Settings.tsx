import { useState } from 'react';
import {
  Bell,
  Shield,
  Palette,
  Sliders,
  Check,
  Save,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { dataStore } from '../../services/dataService';

export function Settings(): JSX.Element {
  const activeUser = dataStore.getActiveUser();
  const [tab, setTab] = useState<'general' | 'notifications' | 'security' | 'appearance'>('general');

  // Form states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [conflictPush, setConflictPush] = useState(true);
  const [reviewPush, setReviewPush] = useState(true);
  const [compactTableMode, setCompactTableMode] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <AppLayout role={activeUser.role}>
      <PageContainer>
        {/* Header matching Reference Image 4 screen 5 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>System Settings</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Configure workspace preferences, notification triggers, and interface customizations.
            </p>
          </div>
          {savedNotice && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#DCFCE7',
                color: '#15803D',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Check size={16} />
              <span>Preferences saved successfully</span>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div style={{ display: 'flex', gap: '8px', margin: '20px 0 24px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          {[
            { id: 'general', label: 'General & Workflow', icon: <Sliders size={16} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
            { id: 'security', label: 'Account & Security', icon: <Shield size={16} /> },
            { id: 'appearance', label: 'Appearance & Theme', icon: <Palette size={16} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: tab === t.id ? '#EEF2FF' : 'transparent',
                color: tab === t.id ? 'var(--primary-700)' : 'var(--text-secondary)',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: tab === t.id ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Cards */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '800px',
          }}
        >
          {tab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Workspace Automation</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Real-time Conflict Alerting</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Trigger instant red alert badges when assignee task date ranges overlap.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={conflictPush}
                  onChange={(e) => setConflictPush(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Compact Kanban & Table View</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Display denser rows to fit more tasks on lower resolution screens.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={compactTableMode}
                  onChange={(e) => setCompactTableMode(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Default Project Currency</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Used for milestone budgets and cost forecasts.
                  </p>
                </div>
                <select
                  defaultValue="USD"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Notification Channels</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Email Digests</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Receive a daily summary of task updates and review decisions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Review Queue Alerts</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Instant notification when a new deliverable is submitted for review.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={reviewPush}
                  onChange={(e) => setReviewPush(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Theme Preferences</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                Choose how TaskOrbit looks to you. Select a default theme.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '8px' }}>
                <div
                  style={{
                    border: '2px solid var(--primary-600)',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#F8FAFC',
                  }}
                >
                  <Sun size={24} color="var(--primary-600)" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Light SaaS (Active)</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Reference Standard</div>
                </div>

                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#0E1322',
                    color: '#FFFFFF',
                  }}
                  onClick={() => alert('Dark theme is available with system preference.')}
                >
                  <Moon size={24} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Dark Navy</div>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>High Contrast</div>
                </div>

                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#FFFFFF',
                  }}
                >
                  <Laptop size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>System Default</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Auto Switch</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Security & Credentials</h3>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '28px', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'var(--primary-600)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '13.5px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
