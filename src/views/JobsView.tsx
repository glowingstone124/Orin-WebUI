import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { LogViewer } from '../components/LogViewer';
import { StatusBadge } from '../components/StatusBadge';
import { JobDetail, JobItem, JobStatusType } from '../types/orin';

interface JobsViewProps {
  jobs: JobItem[];
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
  onRefreshJobs: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  onRefreshJobs,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Auto-select first job if none selected
  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      onSelectJob(jobs[0].id);
    }
  }, [jobs, selectedJobId, onSelectJob]);

  // Fetch job details and logs when selectedJobId changes
  useEffect(() => {
    if (!selectedJobId) {
      setJobDetail(null);
      return;
    }

    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        const detail = await api.getJobDetail(selectedJobId);
        if (isMounted) {
          setJobDetail(detail);
        }
      } catch (err) {
        console.error('Failed to fetch job detail', err);
      } finally {
        if (isMounted) {
          setLoadingDetail(false);
        }
      }
    };

    fetchDetail();

    // Poll if job is active (RUNNING or QUEUED)
    const activeJob = jobs.find((j) => j.id === selectedJobId);
    let interval: NodeJS.Timeout | null = null;
    if (activeJob && (activeJob.status === 'RUNNING' || activeJob.status === 'QUEUED')) {
      interval = setInterval(fetchDetail, 2000);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [selectedJobId, jobs]);

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter === 'ALL') return true;
    return j.status === statusFilter;
  });

  const statuses: (JobStatusType | 'ALL')[] = ['ALL', 'RUNNING', 'QUEUED', 'SUCCESS', 'FAILED'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--title-color)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          任务运行与日志 ({jobs.length})
        </h1>

        <div style={{ display: 'flex', gap: '8px' }}>
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                backgroundColor:
                  statusFilter === st
                    ? 'var(--primary)'
                    : 'var(--card-surface)',
                color:
                  statusFilter === st
                    ? 'var(--button-primary-text)'
                    : 'var(--text-secondary)',
                border: '1px solid var(--split)',
              }}
            >
              {st}
            </button>
          ))}
          <button
            type="button"
            onClick={onRefreshJobs}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              backgroundColor: 'var(--card-surface)',
              color: 'var(--text-main)',
              border: '1px solid var(--split)',
            }}
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* Main Two-Pane View */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) 1fr',
          gap: '16px',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Left Pane: Job List */}
        <div
          style={{
            backgroundColor: 'var(--card-surface)',
            border: '1px solid var(--split)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--split)',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--background-secondary)',
            }}
          >
            RUN HISTORY ({filteredJobs.length})
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredJobs.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                无记录
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredJobs.map((j) => {
                  const isSelected = j.id === selectedJobId;
                  return (
                    <div
                      key={j.id}
                      onClick={() => onSelectJob(j.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--split)',
                        cursor: 'pointer',
                        backgroundColor: isSelected
                          ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                          : 'transparent',
                        borderLeft: isSelected
                          ? '3px solid var(--primary)'
                          : '3px solid transparent',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--title-color)',
                            fontSize: '0.875rem',
                          }}
                        >
                          {j.pipelineName}
                        </span>
                        <StatusBadge status={j.status} />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <span>
                          {j.trigger}
                          {j.durationMs != null && ` (${(j.durationMs / 1000).toFixed(1)}s)`}
                        </span>
                        <span>{new Date(j.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Selected Job Details & Logs */}
        <div
          style={{
            backgroundColor: 'var(--card-surface)',
            border: '1px solid var(--split)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {jobDetail ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Job Meta Bar */}
              <div
                style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--split)',
                  backgroundColor: 'var(--background-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--title-color)',
                        }}
                      >
                        {jobDetail.pipelineName}
                      </span>
                      <StatusBadge status={jobDetail.status} />
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      JOB ID: {jobDetail.id}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div>
                      STARTED: {new Date(jobDetail.createdAt).toLocaleString()}
                    </div>
                    {jobDetail.completedAt && (
                      <div>
                        COMPLETED: {new Date(jobDetail.completedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {jobDetail.message && (
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '8px 12px',
                      backgroundColor: 'var(--card-surface)',
                      border: '1px solid var(--split)',
                      color:
                        jobDetail.status === 'FAILED'
                          ? 'var(--error)'
                          : 'var(--text-main)',
                    }}
                  >
                    {jobDetail.message}
                  </div>
                )}

                {/* Inputs & Artifacts Row */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {Object.keys(jobDetail.inputs).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>INPUTS:</span>
                      {Object.entries(jobDetail.inputs).map(([k, v]) => (
                        <span
                          key={k}
                          style={{
                            padding: '2px 6px',
                            backgroundColor: 'var(--card-surface)',
                            border: '1px solid var(--split)',
                          }}
                        >
                          {k}={v}
                        </span>
                      ))}
                    </div>
                  )}

                  {jobDetail.artifacts.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ARTIFACTS:</span>
                      {jobDetail.artifacts.map((art) => (
                        <a
                          key={art}
                          href={api.getArtifactUrl(jobDetail.id, art)}
                          download={art}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '2px 8px',
                            backgroundColor: 'var(--card-surface)',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontWeight: 600,
                          }}
                        >
                          DOWNLOAD: {art}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Logs Area */}
              <div style={{ flex: 1, minHeight: 0 }}>
                <LogViewer
                  logs={jobDetail.logs || ''}
                  loading={loadingDetail}
                  onRefresh={async () => {
                    const detail = await api.getJobDetail(jobDetail.id);
                    setJobDetail(detail);
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
              }}
            >
              请从左侧选择一个任务查看运行详情与实时控制台日志。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
