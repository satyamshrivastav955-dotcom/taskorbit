import { useEffect, useState } from 'react';
import { Bell, Shield, Palette, Sliders, Check, Save } from 'lucide-react';
import { updatePassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { dataStore, type UserSettings } from '../../services/dataService';
import styles from './SharedPages.module.css';

type Tab = 'general' | 'notifications' | 'security' | 'appearance';

const inputStyle = {
  padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', outline: 'none',
} as const;

export function Settings(): JSX.Element {
  const me = dataStore.getActiveUser();
  const [tab, setTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<UserSettings>(() => dataStore.getSettings());
  const [newPassword, setNewPassword] = useState('');
  const [secError, setSecError] = useState('');
  const [secOk, setSecOk] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSettings(dataStore.getSettings());
  }, [me.uid]);

  async function handleSave(): Promise<void> {
    setPending(true);
    try {
      if (settings.reviewAlerts && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      await dataStore.saveSettings(settings);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setPending(false);
    }
  }

  async function changePassword(): Promise<void> {
    setSecError('');
    setSecOk(false);
    if (newPassword.length < 6) { setSecError('New password must be at least 6 characters.'); return; }
    if (auth.currentUser === null) { setSecError('Sign in again, then retry.'); return; }
    try {
      await updatePassword(auth.currentUser, newPassword);
      setSecOk(true);
      setNewPassword('');
    } catch (e) {
      const code = e instanceof Error && 'code' in e ? String((e as { code: unknown }).code) : '';
      if (code.includes('requires-recent-login')) {
        setSecError('Session too old. Sign out, sign in again, then retry.');
      } else {
        setSecError('Password change failed. Try again.');
      }
    }
  }

  function toggle<K extends keyof UserSettings>(key: K): void {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  return (
    <AppLayout role={me.role}>
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Settings</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Workspace preferences, notification triggers, and security.
            </p>
          </div>
          {savedNotice && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', color: '#15803D', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
              <Check size={16} />
              <span>Preferences saved successfully</span>
            </div>
          )}
        </div>

        <div className={styles.tabs}>
          {([
            ['general', 'General', <Sliders key="g" size={16} />],
            ['notifications', 'Notifications', <Bell key="n" size={16} />],
            ['security', 'Security', <Shield key="s" size={16} />],
            ['appearance', 'Appearance', <Palette key="a" size={16} />],
          ] as Array<[Tab, string, JSX.Element]>).map(([t, label, icon]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: tab === t ? 'var(--pale-blue)' : 'transparent', color: tab === t ? 'var(--primary-700)' : 'var(--text-secondary)', border: 'none', fontSize: '13.5px', fontWeight: tab === t ? 600 : 500, cursor: 'pointer' }}>
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '28px', boxShadow: 'var(--shadow-sm)', maxWidth: '800px' }}>
          {tab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>General</h3>
              <div className={styles.preferenceRow}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Time Zone</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>Shown on your profile and used for timestamps.</p>
                </div>
                <select value={settings.timezone} onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))} style={inputStyle}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (ET)</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
              <div className={styles.preferenceRow} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Date Format</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>Applies to every date shown across the app.</p>
                </div>
                <select value={settings.dateFormat} onChange={(e) => setSettings((s) => ({ ...s, dateFormat: e.target.value as UserSettings['dateFormat'] }))} style={inputStyle}>
                  <option value="in">05 Oct 2026</option>
                  <option value="us">Oct 05, 2026</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Notifications</h3>
              {([
                ['emailDigests', 'Email Digests', 'Daily summary preference for task updates and review decisions.'],
                ['reviewAlerts', 'Browser Alerts for Reviews', 'Pop-up when submissions, revisions or approvals arrive.'],
                ['conflictAlerts', 'Browser Alerts for Conflicts', 'Pop-up when a deadline conflict involves your work.'],
              ] as Array<[keyof UserSettings, string, string]>).map(([key, title, desc]) => (
                <div key={key} className={styles.preferenceRow}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{title}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>{desc}</p>
                  </div>
                  <input type="checkbox" checked={Boolean(settings[key])} onChange={() => toggle(key)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)', cursor: 'pointer' }} aria-label={title} />
                </div>
              ))}
            </div>
          )}

          {tab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Security</h3>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <input type="password" placeholder="Minimum 6 characters" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {secError !== '' && <p role="alert" style={{ color: 'var(--danger-dark)', fontSize: '13px' }}>{secError}</p>}
              {secOk && <p style={{ color: 'var(--green-600)', fontSize: '13px' }}>Password changed.</p>}
              <div>
                <button onClick={() => { void changePassword(); }}
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary-600)', color: '#FFFFFF', fontWeight: 600, fontSize: '13.5px', border: 'none', cursor: 'pointer' }}>
                  Change Password
                </button>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Appearance</h3>
              <div className={styles.preferenceRow}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Compact Tables</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Denser rows across every table. Applies instantly.
                  </p>
                </div>
                <input type="checkbox" checked={settings.compactMode} onChange={() => toggle('compactMode')}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)', cursor: 'pointer' }} aria-label="Compact tables" />
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Theme: Light · TaskOrbit Blue.
              </p>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '28px', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { void handleSave(); }} disabled={pending}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--primary-600)', color: '#FFFFFF', fontWeight: 600, fontSize: '13.5px', border: 'none', cursor: 'pointer' }}>
              <Save size={16} />
              <span>{pending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
