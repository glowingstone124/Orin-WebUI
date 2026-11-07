import React from 'react';

export type ViewType = 'dashboard' | 'pipelines' | 'jobs' | 'cluster' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  jobsCount: number;
  pipelinesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  jobsCount,
  pipelinesCount,
}) => {
  const navItems: { id: ViewType; label: string; code: string; count?: number }[] = [
    { id: 'dashboard', label: '控制台总览', code: '01' },
    { id: 'pipelines', label: '流水线配置', code: '02', count: pipelinesCount },
    { id: 'jobs', label: '任务与日志', code: '03', count: jobsCount },
    { id: 'cluster', label: '多节点集群', code: '04' },
    { id: 'settings', label: '服务设置', code: '05' },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--card-surface)',
        borderRight: '1px solid var(--split)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <nav aria-label="侧边导航" style={{ padding: '16px 0' }}>
        <ul style={{ listStyle: 'none' }}>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    backgroundColor: isActive
                      ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                      : 'transparent',
                    border: 'none',
                    borderLeft: isActive
                      ? '3px solid var(--primary)'
                      : '3px solid transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    transition: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      }}
                    >
                      [{item.code}]
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 6px',
                        backgroundColor: isActive
                          ? 'var(--primary)'
                          : 'var(--background-secondary)',
                        color: isActive ? 'var(--card-surface)' : 'var(--text-secondary)',
                        border: '1px solid var(--split)',
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--split)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}
      >
        2026 Holographic Lab
      </div>
    </aside>
  );
};
