import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckSquare,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  X,
  ArrowRight,
} from 'lucide-react';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar } from '../../components/ui/Avatar';
import { CreateTaskModal } from '../../components/modals/CreateTaskModal';
import { dataStore } from '../../services/demoData';
import type { UserProfile } from '../../types';

export function Team(): JSX.Element {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'members' | 'workload' | 'availability'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const users = dataStore.getUsers().filter((u) => u.role !== 'client');
  const tasks = dataStore.getTasks();
  const projects = dataStore.getProjects();

  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status?: string) => {
    if (status === 'Overloaded') {
      return (
        <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '3px 10px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 600 }}>
          • Overloaded
        </span>
      );
    }
    if (status === 'Busy') {
      return (
        <span style={{ background: '#FEF3C7', color: '#D97706', padding: '3px 10px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 600 }}>
          • Busy
        </span>
      );
    }
    return (
      <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '3px 10px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: 600 }}>
        • Available
      </span>
    );
  };

  return (
    <AppLayout role="manager">
      <PageContainer>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Team</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Manage your team, view workloads, and track assignments.
            </p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'var(--primary-gradient)',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>Add Team Member</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          <StatCard
            label="Team Members"
            value={users.length}
            change="+1 this month"
            trend="up"
            color="purple"
            icon={<Users size={22} />}
          />
          <StatCard
            label="Total Assigned Tasks"
            value={tasks.length}
            change="12% from last month"
            trend="up"
            color="blue"
            icon={<CheckSquare size={22} />}
          />
          <StatCard
            label="Completed Tasks"
            value="28"
            change="18% from last month"
            trend="up"
            color="green"
            icon={<CheckCircle2 size={22} />}
          />
          <StatCard
            label="Overdue Tasks"
            value="6"
            change="25% from last month"
            trend="down"
            color="red"
            icon={<Clock size={22} />}
          />
        </div>

        {/* Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1.8fr 1fr' : '1fr', gap: '20px' }}>
          {/* Left Table Section */}
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            {/* Tabs & Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                {(['members', 'workload', 'availability'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      fontSize: '13.5px',
                      fontWeight: activeTab === tab ? 700 : 500,
                      color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                      borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none',
                      paddingBottom: '4px',
                    }}
                  >
                    {tab === 'members' ? 'Team Members' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px' }}>
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px', width: '160px' }}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Member</th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Projects</th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Task Load</th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelected = selectedUser?.uid === u.uid;
                  return (
                    <tr
                      key={u.uid}
                      onClick={() => setSelectedUser(u)}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        background: isSelected ? '#F5F7FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar name={u.name} src={u.avatar} size="md" />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
                          {u.jobTitle || u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {u.activeProjectsCount || 3} projects
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                          <div style={{ width: '80px' }}>
                            <ProgressBar value={u.workloadPercentage || 60} height={6} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {u.assignedTasksCount || 4}/10
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {getStatusBadge(u.availabilityStatus)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Selected Member Detail Panel matching Reference Image 11 */}
          {selectedUser && (
            <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Avatar name={selectedUser.name} src={selectedUser.avatar} size="xl" />
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{selectedUser.name}</h3>
                    <span style={{ background: '#EEF2FF', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
                      {selectedUser.jobTitle}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} style={{ color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Stats Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{selectedUser.assignedTasksCount || 8}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tasks</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{selectedUser.activeProjectsCount || 3}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Projects</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>2</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reviews</div>
                </div>
              </div>

              {/* Workload Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Workload</span>
                  <span style={{ fontWeight: 700, color: (selectedUser.workloadPercentage || 80) > 75 ? '#DC2626' : 'var(--primary)' }}>
                    {selectedUser.workloadPercentage || 80}%
                  </span>
                </div>
                <ProgressBar value={selectedUser.workloadPercentage || 80} color={(selectedUser.workloadPercentage || 80) > 75 ? 'red' : 'primary'} height={8} />
              </div>

              {/* About Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>About</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Mail size={14} color="var(--text-muted)" />
                  <span>{selectedUser.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Phone size={14} color="var(--text-muted)" />
                  <span>{selectedUser.phone || '+91 98765 43210'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>Bengaluru, India</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                  {selectedUser.bio || 'Designer with 4+ years of experience in UI/UX and product design.'}
                </p>
              </div>

              {/* Current Projects */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Current Projects</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--primary)', cursor: 'pointer' }}>View all →</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projects.slice(0, 3).map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', padding: '6px 8px', background: '#F8FAFC', borderRadius: '6px' }}>
                      <span style={{ fontWeight: 500 }}>{p.title}</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => setShowAssignModal(true)}
                  style={{
                    padding: '9px',
                    background: 'var(--primary-gradient)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Assign Task →
                </button>
              </div>
            </div>
          )}
        </div>

        {showAssignModal && (
          <CreateTaskModal onClose={() => setShowAssignModal(false)} />
        )}
      </PageContainer>
    </AppLayout>
  );
}
