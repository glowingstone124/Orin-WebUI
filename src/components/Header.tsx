import React from 'react';
import { OrinStatus } from '../types/orin';

interface HeaderProps {
  status: OrinStatus | null;
  loading: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  loading,
  theme,
  onToggleTheme,
  onRefresh,
}) => {
  const isOnline = Boolean(status && status.status === 'UP');
  const queueSize = status?.queue.queuedCount ?? 0;
  const activeCount = status?.queue.activeCount ?? 0;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        backgroundColor: 'var(--card-surface)',
        borderBottom: '1px solid var(--split)',
        height: '60px',
      }}
    >
      <a href="#main-content" className="visually-hidden">
        跳至主内容区
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: 'var(--primary)',
            }}
          />
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--title-color)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ORIN
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              paddingLeft: '6px',
              borderLeft: '1px solid var(--split)',
            }}
          >
            CI/CD Engine
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '2px 8px',
            backgroundColor: isOnline
              ? 'color-mix(in srgb, var(--success) 12%, transparent)'
              : 'color-mix(in srgb, var(--error) 12%, transparent)',
            border: `1px solid ${isOnline ? 'var(--success)' : 'var(--error)'}`,
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: isOnline ? 'var(--success)' : 'var(--error)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: isOnline ? 'var(--success)' : 'var(--error)',
            }}
          />
          {isOnline ? `ONLINE v${status?.version || '1.0'}` : 'DISCONNECTED'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 12px',
            backgroundColor: 'var(--background-secondary)',
            border: '1px solid var(--split)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>
              ACTIVE:
            </span>
            <strong style={{ color: activeCount > 0 ? 'var(--primary)' : 'var(--text-main)' }}>
              {activeCount}
            </strong>
          </div>
          <div style={{ borderLeft: '1px solid var(--split)', paddingLeft: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>
              QUEUED:
            </span>
            <strong style={{ color: queueSize > 0 ? 'var(--warning)' : 'var(--text-main)' }}>
              {queueSize} / {status?.queue.capacity ?? 100}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="刷新状态"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '32px',
            padding: '0 12px',
            backgroundColor: 'var(--card-surface)',
            color: 'var(--text-main)',
            border: '1px solid var(--split)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-mono)',
          }}
        >
          REFRESH
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`切换到${theme === 'light' ? '暗色' : '亮色'}主题`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '32px',
            padding: '0 12px',
            backgroundColor: 'var(--card-surface)',
            color: 'var(--text-main)',
            border: '1px solid var(--split)',
            fontSize: '0.75rem',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {theme === 'light' ? 'THEME: LIGHT' : 'THEME: DARK'}
        </button>
      </div>
    </header>
  );
};
