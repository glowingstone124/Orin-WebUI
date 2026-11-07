import React, { useState } from 'react';
import { api } from '../api/client';
import { ActionSummary } from '../types/orin';

interface ScriptsViewProps {
  scripts: ActionSummary[];
  loading: boolean;
  onRefresh: () => void;
  onNewScript: () => void;
  onEditScript: (name: string) => void;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({
  scripts,
  loading,
  onRefresh,
  onNewScript,
  onEditScript,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'kts' | 'sh'>('all');
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredScripts = scripts.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.entry.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || s.entryType === typeFilter;
    return matchesSearch && matchesType;
  });

  const ktsCount = scripts.filter((s) => s.entryType === 'kts').length;
  const shCount = scripts.filter((s) => s.entryType === 'sh').length;

  const handleDelete = async (name: string) => {
    if (!window.confirm(`确定要删除动作脚本 "${name}" 吗？此操作无法撤销。`)) {
      return;
    }
    setDeletingName(name);
    setActionError(null);
    try {
      await api.deleteAction(name);
      onRefresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeletingName(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatTimestamp = (ts: number): string => {
    if (!ts) return '-';
    return new Date(ts).toLocaleString('zh-CN', { hour12: false });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--title-color)',
              margin: '0 0 4px 0',
            }}
          >
            动作脚本库 (ACTION SCRIPTS)
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            管理并在线编写 Orin 流水线可调用的 Kotlin 脚本 (.kts) 与 Shell 脚本 (.sh)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onRefresh}
            style={{
              padding: '8px 14px',
              backgroundColor: 'var(--card-surface)',
              border: '1px solid var(--split)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--text-main)',
            }}
          >
            REFRESH
          </button>
          <button
            type="button"
            onClick={onNewScript}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: '1px solid var(--primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            + NEW SCRIPT
          </button>
        </div>
      </div>

      {actionError && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'color-mix(in srgb, var(--error) 12%, transparent)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
          }}
        >
          [ERROR] {actionError}
        </div>
      )}

      {/* Summary KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--card-surface)',
            border: '1px solid var(--split)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            TOTAL SCRIPTS
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)', marginTop: '4px' }}>
            {scripts.length}
          </div>
        </div>
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--card-surface)',
            border: '1px solid var(--split)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            KOTLIN SCRIPTS (.kts)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: '4px' }}>
            {ktsCount}
          </div>
        </div>
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--card-surface)',
            border: '1px solid var(--split)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            SHELL SCRIPTS (.sh)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: '4px' }}>
            {shCount}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          backgroundColor: 'var(--card-surface)',
          border: '1px solid var(--split)',
          padding: '10px 16px',
        }}
      >
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search scripts by name or file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--split)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--text-main)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['all', 'kts', 'sh'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--split)',
                backgroundColor: typeFilter === t ? 'var(--primary)' : 'var(--background-secondary)',
                color: typeFilter === t ? '#FFFFFF' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: typeFilter === t ? 600 : 400,
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Scripts Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          LOADING SCRIPTS...
        </div>
      ) : filteredScripts.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            backgroundColor: 'var(--card-surface)',
            border: '1px solid var(--split)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
            {search || typeFilter !== 'all' ? '未找到匹配的脚本。' : '暂无动作脚本，请点击下方按钮新建。'}
          </p>
          <button
            type="button"
            onClick={onNewScript}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: '1px solid var(--primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
            }}
          >
            + CREATE FIRST SCRIPT
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredScripts.map((s) => (
            <div
              key={s.name}
              style={{
                backgroundColor: 'var(--card-surface)',
                border: '1px solid var(--split)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ padding: '16px 16px 12px 16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--title-color)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {s.name}
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      backgroundColor:
                        s.entryType === 'kts'
                          ? 'color-mix(in srgb, var(--primary) 15%, transparent)'
                          : 'color-mix(in srgb, var(--warning) 15%, transparent)',
                      color: s.entryType === 'kts' ? 'var(--primary)' : 'var(--warning)',
                      border: `1px solid ${s.entryType === 'kts' ? 'var(--primary)' : 'var(--warning)'}`,
                    }}
                  >
                    .{s.entryType.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Entry File:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{s.entry}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Size:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{formatFileSize(s.size)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Modified:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatTimestamp(s.lastModified)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  borderTop: '1px solid var(--split)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <button
                  type="button"
                  onClick={() => onEditScript(s.name)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRight: '1px solid var(--split)',
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  EDIT SCRIPT
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.name)}
                  disabled={deletingName === s.name}
                  style={{
                    padding: '8px 14px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--error)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    cursor: deletingName === s.name ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deletingName === s.name ? 'DEL...' : 'DELETE'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
