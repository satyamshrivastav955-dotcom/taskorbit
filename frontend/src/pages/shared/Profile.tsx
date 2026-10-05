import { useState } from 'react';
import {
  Mail,
  Shield,
  MapPin,
  Calendar,
  Edit2,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { dataStore } from '../../services/dataService';
import type { Task, Project } from '../../types';

export function Profile(): JSX.Element {
  const activeUser = dataStore.getActiveUser();
  const allTasks: Task[] = dataStore.getTasks();
  const allProjects: Project[] = dataStore.getProjects();

  const userTasks = allTasks.filter((t: Task) => t.assigneeId === activeUser.uid);
  const completedCount = userTasks.filter((t: Task) => t.status === 'approved').length;
  const inProgressCount = userTasks.filter(
    (t: Task) => t.status === 'in_progress' || t.status === 'submitted' || t.status === 'in_review'
  ).length;

  const [isEditing, setIsEditing] = useState(false);
  const [userName] = useState(activeUser.name);
  const [userRoleTitle] = useState(
    activeUser.role === 'manager'
      ? 'Senior Technical Project Lead'
      : activeUser.role === 'client'
      ? 'Product Sponsor & Enterprise Director'
      : activeUser.role === 'assignee'
      ? 'Full-Stack Software Engineer'
      : 'Principal Quality & Design Reviewer'
  );

  return (
    <AppLayout role={activeUser.role}>
      <PageContainer>
        {/* Profile Header Card matching Reference Image 4 screen 4 */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '24px',
          }}
        >
          {/* Cover Banner */}
          <div
            style={{
              height: '140px',
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
              position: 'relative',
            }}
          />

          {/* Profile Details Banner */}
          <div
            style={{
              padding: '0 32px 32px 32px',
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '-50px' }}>
              <div
                style={{
                  border: '4px solid #FFFFFF',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <Avatar name={userName} src={activeUser.avatar} size="xl" />
              </div>
              <div style={{ paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{userName}</h1>
                  <span
                    style={{
                      background: '#EEF2FF',
                      color: 'var(--primary-700)',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {activeUser.role}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {userRoleTitle} • TaskOrbit Core Team
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingBottom: '8px' }}>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Edit2 size={14} />
                <span>{isEditing ? 'Save Profile' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Info & Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
          {/* Left Column: Personal Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>
                Account Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                      Email Address
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {activeUser.email}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={16} color="var(--text-muted)" />
                  <div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                      Access Role
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {activeUser.role.charAt(0).toUpperCase() + activeUser.role.slice(1)} Privilege
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={16} color="var(--text-muted)" />
                  <div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                      Location & Timezone
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      San Francisco, CA (UTC-7)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={16} color="var(--text-muted)" />
                  <div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                      Joined TaskOrbit
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      January 2025
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Snapshot */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>
                Performance Metrics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                    Active Tasks
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-600)' }}>
                    {inProgressCount || 4}
                  </span>
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                    Completed
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>
                    {completedCount || 18}
                  </span>
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                    Review Rate
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#6366F1' }}>
                    94.2%
                  </span>
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                    Conflict Rate
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>
                    0.0%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Projects & Assigned Activities */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Active Projects & Workstreams
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {allProjects.slice(0, 4).map((proj: Project) => (
                <div
                  key={proj.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: '#FAFBFD',
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{proj.name}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Deadline: {proj.endDate} • {proj.budget}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-600)' }}>
                        {proj.progress}%
                      </span>
                      <div
                        style={{
                          width: '80px',
                          height: '6px',
                          borderRadius: '9999px',
                          background: '#E2E8F0',
                          overflow: 'hidden',
                          marginTop: '4px',
                        }}
                      >
                        <div
                          style={{
                            width: `${proj.progress}%`,
                            height: '100%',
                            background: 'var(--primary-600)',
                            borderRadius: '9999px',
                          }}
                        />
                      </div>
                    </div>
                    <StatusBadge status={proj.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
