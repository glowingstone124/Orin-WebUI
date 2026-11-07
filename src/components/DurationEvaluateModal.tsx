import React, { useEffect, useRef } from 'react';
import { OverallDurationMetrics } from '../types/orin';

interface DurationEvaluateModalProps {
  isOpen: boolean;
  metrics: OverallDurationMetrics | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const DurationEvaluateModal: React.FC<DurationEvaluateModalProps> = ({
  isOpen,
  metrics,
  onClose,
  onRefresh,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pipelinesMetrics = metrics ? Object.values(metrics.byPipeline) : [];
  const maxAvgDuration = Math.max(...pipelinesMetrics.map((p) => p.avgDurationMs), 1);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="duration-eval-title"
      style={{
        border: '1px solid var(--split)',
        backgroundColor: 'var(--card-surface)',
        color: 'var(--text-main)',
        padding: '24px',
        width: '720px',
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
            id="duration-eval-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--title-color)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            流水线平均耗时评估与性能分析
          </h2>
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              color: 'var(--primary)',
              border: '1px solid var(--primary)',
            }}
          >
            PERFORMANCE EVALUATION
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
        {/* Global Summary Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--background-secondary)',
            border: '1px solid var(--split)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              全量任务平均耗时
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
              {metrics && metrics.totalRuns > 0 ? `${(metrics.avgDurationMs / 1000).toFixed(2)}s` : '--'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              全量最快执行 (MIN)
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
              {metrics?.minDurationMs != null ? `${(metrics.minDurationMs / 1000).toFixed(2)}s` : '--'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              全量最慢执行 (MAX)
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>
              {metrics?.maxDurationMs != null ? `${(metrics.maxDurationMs / 1000).toFixed(2)}s` : '--'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              总样本运行数
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--title-color)' }}>
              {metrics?.totalRuns ?? 0}
            </div>
          </div>
        </div>

        {/* Detailed Pipeline Evaluation Table */}
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              marginBottom: '10px',
              textTransform: 'uppercase',
            }}
          >
            各流水线平均耗时评估对比 (PIPELINE DURATION BREAKDOWN)
          </div>

          {pipelinesMetrics.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
              }}
            >
              暂无运行样本数据。执行一次流水线后将自动计算平均耗时指标。
            </div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid var(--split)',
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <th style={{ padding: '8px 12px' }}>PIPELINE</th>
                  <th style={{ padding: '8px 12px' }}>RUNS</th>
                  <th style={{ padding: '8px 12px' }}>SUCCESS RATE</th>
                  <th style={{ padding: '8px 12px' }}>AVG DURATION</th>
                  <th style={{ padding: '8px 12px' }}>MIN / MAX</th>
                  <th style={{ padding: '8px 12px', width: '120px' }}>LATENCY BAR</th>
                </tr>
              </thead>
              <tbody>
                {pipelinesMetrics.map((p) => {
                  const percent = maxAvgDuration > 0 ? (p.avgDurationMs / maxAvgDuration) * 100 : 0;
                  return (
                    <tr
                      key={p.pipelineName}
                      style={{ borderBottom: '1px solid var(--split)' }}
                    >
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {p.pipelineName}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>
                        {p.runsCount}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: p.successRate > 0.8 ? 'var(--success)' : 'var(--warning)' }}>
                        {p.runsCount > 0 ? `${Math.round(p.successRate * 100)}%` : '--'}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {p.runsCount > 0 ? `${(p.avgDurationMs / 1000).toFixed(2)}s` : '--'}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        {p.minDurationMs != null && p.maxDurationMs != null
                          ? `${(p.minDurationMs / 1000).toFixed(1)}s / ${(p.maxDurationMs / 1000).toFixed(1)}s`
                          : '--'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div
                          style={{
                            height: '8px',
                            backgroundColor: 'var(--background-secondary)',
                            border: '1px solid var(--split)',
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${percent}%`,
                              backgroundColor: 'var(--primary)',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--split)',
            paddingTop: '16px',
          }}
        >
          <button
            type="button"
            onClick={onRefresh}
            style={{
              padding: '6px 14px',
              backgroundColor: 'var(--background-secondary)',
              color: 'var(--text-main)',
              border: '1px solid var(--split)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            REFRESH METRICS
          </button>

          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              onClose();
            }}
            style={{
              padding: '6px 18px',
              backgroundColor: 'var(--card-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--split)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </dialog>
  );
};
