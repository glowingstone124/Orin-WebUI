import React, { useEffect, useRef } from 'react';
import { Pipeline } from '../types/orin';

interface PipelineDetailModalProps {
  pipeline: Pipeline | null;
  onClose: () => void;
  onEdit: (pipeline: Pipeline) => void;
  onTrigger: (pipeline: Pipeline) => void;
  onDelete: (name: string) => void;
  onEditScript?: (name: string) => void;
}

export const PipelineDetailModal: React.FC<PipelineDetailModalProps> = ({
  pipeline,
  onClose,
  onEdit,
  onTrigger,
  onDelete,
  onEditScript,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (pipeline) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [pipeline]);

  if (!pipeline) return null;

  const m = pipeline.metrics;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="pipeline-detail-title"
      style={{
        border: '1px solid var(--split)',
        backgroundColor: 'var(--card-surface)',
        color: 'var(--text-main)',
        padding: '24px',
        width: '620px',
        maxWidth: '92vw',
        margin: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid var(--split)',
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2
            id="pipeline-detail-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--title-color)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {pipeline.name}
          </h2>
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
              border: `1px solid ${pipeline.enabled ? 'var(--success)' : 'var(--split)'}`,
            }}
          >
            {pipeline.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            dialogRef.current?.close();
            onClose();
          }}
          aria-label="关闭对话框"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          [ESC]
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Performance & Duration Evaluation Card */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--background-secondary)',
            border: '1px solid var(--split)',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--primary)',
              fontWeight: 700,
              marginBottom: '12px',
              letterSpacing: '0.04em',
            }}
          >
            DURATION EVALUATION (耗时评估与执行指标)
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                平均耗时 (AVG)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--title-color)' }}>
                {m && m.runsCount > 0 ? `${(m.avgDurationMs / 1000).toFixed(2)}s` : '--'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                最快耗时 (MIN)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                {m?.minDurationMs != null ? `${(m.minDurationMs / 1000).toFixed(2)}s` : '--'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                最慢耗时 (MAX)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>
                {m?.maxDurationMs != null ? `${(m.maxDurationMs / 1000).toFixed(2)}s` : '--'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                最近耗时 (LAST)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--title-color)' }}>
                {m?.lastDurationMs != null ? `${(m.lastDurationMs / 1000).toFixed(2)}s` : '--'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                累计运行 (RUNS)
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--title-color)' }}>
                {m?.runsCount ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--split)', paddingBottom: '8px' }}>
            <span style={{ width: '140px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              REPOSITORY:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {pipeline.repository || 'ALL (匹配任意)'}
            </span>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid var(--split)', paddingBottom: '8px' }}>
            <span style={{ width: '140px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              TRIGGERS:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {pipeline.triggers.join(', ') || 'NONE'}
            </span>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid var(--split)', paddingBottom: '8px' }}>
            <span style={{ width: '140px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              MANUAL AUTH:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: pipeline.hasManualToken ? 'var(--success)' : 'var(--text-muted)' }}>
              {pipeline.hasManualToken ? 'CONFIGURED (已配置密钥)' : 'NOT CONFIGURED'}
            </span>
          </div>
        </div>

        {/* Action steps */}
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}
          >
            Action Execution Sequence ({pipeline.actions.length} steps):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pipeline.actions.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                (无 Action 执行步骤)
              </div>
            ) : (
              pipeline.actions.map((act, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--background-secondary)',
                    border: '1px solid var(--split)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      #{index + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                  {onEditScript && (
                    <button
                      type="button"
                      onClick={() => onEditScript(act)}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--split)',
                        color: 'var(--primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      EDIT SCRIPT
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--split)',
            paddingTop: '16px',
            marginTop: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (confirm(`确定要删除流水线 ${pipeline.name} 吗？`)) {
                onDelete(pipeline.name);
                dialogRef.current?.close();
                onClose();
              }
            }}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              color: 'var(--error)',
              border: '1px solid var(--error)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            DELETE
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                onEdit(pipeline);
                dialogRef.current?.close();
                onClose();
              }}
              style={{
                padding: '6px 16px',
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-main)',
                border: '1px solid var(--split)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              EDIT CONFIG
            </button>

            <button
              type="button"
              onClick={() => {
                onTrigger(pipeline);
                dialogRef.current?.close();
                onClose();
              }}
              disabled={!pipeline.enabled}
              style={{
                padding: '6px 18px',
                backgroundColor: 'var(--button-primary-bg)',
                color: 'var(--button-primary-text)',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                opacity: pipeline.enabled ? 1 : 0.5,
              }}
            >
              TRIGGER NOW
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
