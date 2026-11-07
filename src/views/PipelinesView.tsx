import React, { useState } from 'react';
import { Pipeline } from '../types/orin';

interface PipelinesViewProps {
  pipelines: Pipeline[];
  onTriggerPipeline: (pipeline: Pipeline) => void;
}

export const PipelinesView: React.FC<PipelinesViewProps> = ({
  pipelines,
  onTriggerPipeline,
}) => {
  const [filter, setFilter] = useState('');

  const filtered = pipelines.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      (p.repository && p.repository.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--title-color)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            流水线列表 ({pipelines.length})
          </h1>
        </div>

        <input
          type="text"
          placeholder="搜索流水线名称或仓库..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            width: '280px',
            backgroundColor: 'var(--card-surface)',
            color: 'var(--text-main)',
            border: '1px solid var(--split)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            backgroundColor: 'var(--card-surface)',
            border: '1px solid var(--split)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          未找到匹配的流水线配置。
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((pipeline) => (
            <div
              key={pipeline.name}
              style={{
                backgroundColor: 'var(--card-surface)',
                border: '1px solid var(--split)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--title-color)',
                      }}
                    >
                      {pipeline.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        backgroundColor: pipeline.enabled
                          ? 'color-mix(in srgb, var(--success) 12%, transparent)'
                          : 'color-mix(in srgb, var(--text-muted) 12%, transparent)',
                        color: pipeline.enabled ? 'var(--success)' : 'var(--text-muted)',
                        border: `1px solid ${
                          pipeline.enabled ? 'var(--success)' : 'var(--split)'
                        }`,
                      }}
                    >
                      {pipeline.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      marginTop: '8px',
                    }}
                  >
                    <div>
                      REPOSITORY: <strong>{pipeline.repository || 'ALL (ANY)'}</strong>
                    </div>
                    <div>
                      TRIGGERS:{' '}
                      <strong>{pipeline.triggers.join(', ') || 'NONE'}</strong>
                    </div>
                    <div>
                      MANUAL AUTH:{' '}
                      <strong style={{ color: pipeline.hasManualToken ? 'var(--success)' : 'var(--warning)' }}>
                        {pipeline.hasManualToken ? 'CONFIGURED' : 'NOT SET'}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onTriggerPipeline(pipeline)}
                  disabled={!pipeline.enabled}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--button-primary-bg)',
                    color: 'var(--button-primary-text)',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: pipeline.enabled ? 'pointer' : 'not-allowed',
                    opacity: pipeline.enabled ? 1 : 0.5,
                  }}
                >
                  MANUAL TRIGGER
                </button>
              </div>

              {/* Actions list */}
              <div
                style={{
                  borderTop: '1px solid var(--split)',
                  paddingTop: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                  }}
                >
                  Execution Action Steps ({pipeline.actions.length}):
                </div>
                {pipeline.actions.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    (无配置 Action 步骤)
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {pipeline.actions.map((act, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          backgroundColor: 'var(--background-secondary)',
                          border: '1px solid var(--split)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: 'var(--text-main)',
                        }}
                      >
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          #{index + 1}
                        </span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
