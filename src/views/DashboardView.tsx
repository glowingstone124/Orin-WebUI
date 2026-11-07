import React from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { JobItem, OrinStatus, Pipeline } from '../types/orin';

interface DashboardViewProps {
  status: OrinStatus | null;
  pipelines: Pipeline[];
  jobs: JobItem[];
  onSelectPipeline: (pipeline: Pipeline) => void;
  onSelectJob: (jobId: string) => void;
  onNavigate: (view: 'pipelines' | 'jobs' | 'cluster' | 'settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  pipelines,
  jobs,
  onSelectPipeline,
  onSelectJob,
  onNavigate,
}) => {
  const recentJobs = jobs.slice(0, 5);
  const queue = status?.queue;

  const cards = [
    {
      label: 'RUNNER 队列状态',
      value: `${queue?.queuedCount ?? 0} / ${queue?.capacity ?? 100}`,
      desc: `活跃执行: ${queue?.activeCount ?? 0}`,
      statusColor: (queue?.activeCount ?? 0) > 0 ? 'var(--primary)' : 'var(--text-main)',
      action: () => onNavigate('jobs'),
    },
    {
      label: '已配置流水线',
      value: pipelines.length.toString(),
      desc: `启用: ${pipelines.filter((p) => p.enabled).length}`,
      statusColor: 'var(--text-main)',
      action: () => onNavigate('pipelines'),
    },
    {
      label: '累计执行任务',
      value: (queue?.completedCount ?? jobs.length).toString(),
      desc: `成功率: ${
        jobs.length > 0
          ? `${Math.round(
              (jobs.filter((j) => j.status === 'SUCCESS').length / jobs.length) * 100
            )}%`
          : 'N/A'
      }`,
      statusColor: 'var(--success)',
      action: () => onNavigate('jobs'),
    },
    {
      label: '集群远程节点',
      value: (status?.remotesCount ?? 0).toString(),
      desc: '多节点分布式编排',
      statusColor: 'var(--text-main)',
      action: () => onNavigate('cluster'),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--title-color)',
            fontFamily: 'var(--font-mono)',
            marginBottom: '4px',
          }}
        >
          控制台总览
        </h1>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {cards.map((c, idx) => (
          <div
            key={idx}
            onClick={c.action}
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--card-surface)',
              border: '1px solid var(--split)',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
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
              {c.label}
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: c.statusColor,
                lineHeight: 1.2,
                marginBottom: '4px',
              }}
            >
              {c.value}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {c.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Pipelines Quick Trigger */}
      <div
        style={{
          backgroundColor: 'var(--card-surface)',
          border: '1px solid var(--split)',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--title-color)',
            }}
          >
            快速触发流水线
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('pipelines')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            查看所有 ({pipelines.length}) →
          </button>
        </div>

        {pipelines.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            尚未配置任何 Pipeline。请检查 Orin 的 `config.toml`。
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {pipelines.map((p) => (
              <div
                key={p.name}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--background-secondary)',
                  border: '1px solid var(--split)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      color: 'var(--title-color)',
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginTop: '2px',
                    }}
                  >
                    Actions: {p.actions.length} 步
                    {p.repository && ` | Repo: ${p.repository}`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPipeline(p)}
                  disabled={!p.enabled}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'var(--button-primary-bg)',
                    color: 'var(--button-primary-text)',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  触发
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Runs Table */}
      <div
        style={{
          backgroundColor: 'var(--card-surface)',
          border: '1px solid var(--split)',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--title-color)',
            }}
          >
            近期任务运行 (Recent Runs)
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            查看全部任务 ({jobs.length}) →
          </button>
        </div>

        {recentJobs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            暂无任务记录。
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
                <th style={{ padding: '8px 12px' }}>STATUS</th>
                <th style={{ padding: '8px 12px' }}>PIPELINE</th>
                <th style={{ padding: '8px 12px' }}>TRIGGER</th>
                <th style={{ padding: '8px 12px' }}>DURATION</th>
                <th style={{ padding: '8px 12px' }}>STARTED</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr
                  key={job.id}
                  style={{
                    borderBottom: '1px solid var(--split)',
                    cursor: 'pointer',
                  }}
                  onClick={() => onSelectJob(job.id)}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <StatusBadge status={job.status} />
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--title-color)',
                    }}
                  >
                    {job.pipelineName}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {job.trigger}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {job.durationMs != null ? `${(job.durationMs / 1000).toFixed(1)}s` : '--'}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectJob(job.id);
                      }}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        color: 'var(--primary)',
                        border: '1px solid var(--split)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                      }}
                    >
                      LOGS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
