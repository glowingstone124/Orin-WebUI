import React, { useEffect, useRef, useState } from 'react';

interface LogViewerProps {
  logs: string;
  loading?: boolean;
  onRefresh?: () => void;
  title?: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  loading = false,
  onRefresh,
  title = 'TERMINAL OUTPUT',
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = logs.split('\n');
  const filteredLines = filter
    ? lines.filter((l) => l.toLowerCase().includes(filter.toLowerCase()))
    : lines;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--code-bg)',
        border: '1px solid var(--split)',
        color: 'var(--code-text)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: 'color-mix(in srgb, var(--code-bg) 80%, black)',
          borderBottom: '1px solid var(--split)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
            {title}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            ({lines.length} lines)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            placeholder="Filter logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '2px 8px',
              fontSize: '0.75rem',
              backgroundColor: 'var(--code-bg)',
              color: 'var(--code-text)',
              border: '1px solid var(--split)',
              width: '160px',
            }}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            <span>AUTO-SCROLL</span>
          </label>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: '2px 8px',
              fontSize: '0.75rem',
              backgroundColor: 'transparent',
              color: 'var(--code-text)',
              border: '1px solid var(--split)',
            }}
          >
            {copied ? 'COPIED' : 'COPY'}
          </button>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              style={{
                padding: '2px 8px',
                fontSize: '0.75rem',
                backgroundColor: 'transparent',
                color: 'var(--primary-light)',
                border: '1px solid var(--primary-light)',
              }}
            >
              REFRESH
            </button>
          )}
        </div>
      </div>

      <div
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '12px 16px',
          overflowY: 'auto',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {filteredLines.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>No logs captured yet.</div>
        ) : (
          filteredLines.map((line, idx) => {
            let color = 'inherit';
            if (line.includes('[FAILED]') || line.includes('[Error]') || line.includes('[STDERR]')) {
              color = 'var(--error)';
            } else if (line.includes('[SUCCESS]')) {
              color = 'var(--success)';
            } else if (line.includes('[Action]')) {
              color = 'var(--primary-light)';
            } else if (line.includes('[RUNNING]')) {
              color = 'var(--warning)';
            }

            return (
              <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                <span
                  style={{
                    color: 'var(--text-muted)',
                    userSelect: 'none',
                    width: '32px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ color }}>{line}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
