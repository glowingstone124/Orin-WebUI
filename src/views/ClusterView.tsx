import React, { useState } from 'react';
import { RemoteNode } from '../types/orin';

interface ClusterViewProps {
  nodes: RemoteNode[];
  onRefresh: () => void;
}

export const ClusterView: React.FC<ClusterViewProps> = ({ nodes, onRefresh }) => {
  const [pingResults, setPingResults] = useState<Record<string, { status: string; ms?: number }>>({});
  const [pinging, setPinging] = useState<Record<string, boolean>>({});

  const handlePing = async (node: RemoteNode) => {
    setPinging((prev) => ({ ...prev, [node.name]: true }));
    const startTime = performance.now();
    try {
      // Test ping via fetch with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${node.url}/`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });
      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - startTime);
      if (res.ok) {
        setPingResults((prev) => ({
          ...prev,
          [node.name]: { status: 'ONLINE', ms: elapsed },
        }));
      } else {
        setPingResults((prev) => ({
          ...prev,
          [node.name]: { status: `HTTP ${res.status}`, ms: elapsed },
        }));
      }
    } catch (err: unknown) {
      setPingResults((prev) => ({
        ...prev,
        [node.name]: { status: 'OFFLINE / UNREACHABLE' },
      }));
    } finally {
      setPinging((prev) => ({ ...prev, [node.name]: false }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--title-color)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            多节点集群编排 ({nodes.length} 远程节点)
          </h1>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          style={{
            padding: '6px 14px',
            backgroundColor: 'var(--card-surface)',
            color: 'var(--text-main)',
            border: '1px solid var(--split)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          REFRESH NODES
        </button>
      </div>

      {/* Cluster Topology Diagram */}
      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--card-surface)',
          border: '1px solid var(--split)',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          集群拓扑结构 (CLUSTER TOPOLOGY)
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '16px',
            backgroundColor: 'var(--background-secondary)',
            border: '1px solid var(--split)',
          }}
        >
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--card-surface)',
              border: '2px solid var(--primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
              [PRIMARY HOST]
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--title-color)' }}>
              Local Orin Instance
            </div>
          </div>

          <div
            style={{
              fontSize: '1.25rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}
          >
            {'⇄'}
          </div>

          {nodes.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
              (暂无注册远程节点，可通过 config.toml 中的 [[Remote]] 配置)
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {nodes.map((node) => (
                <div
                  key={node.name}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--card-surface)',
                    border: '1px solid var(--split)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    REMOTE WORKER
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{node.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nodes Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {nodes.map((node) => {
          const ping = pingResults[node.name];
          const isPinging = pinging[node.name];

          return (
            <div
              key={node.name}
              style={{
                backgroundColor: 'var(--card-surface)',
                border: '1px solid var(--split)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--title-color)',
                    }}
                  >
                    {node.name}
                  </h2>
                  {ping && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        border: '1px solid currentColor',
                        color:
                          ping.status === 'ONLINE'
                            ? 'var(--success)'
                            : 'var(--error)',
                      }}
                    >
                      {ping.status} {ping.ms != null ? `(${ping.ms}ms)` : ''}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    wordBreak: 'break-all',
                  }}
                >
                  URL: {node.url}
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: node.hasToken ? 'var(--success)' : 'var(--text-muted)',
                    marginTop: '6px',
                  }}
                >
                  TOKEN: {node.hasToken ? 'CONFIGURED' : 'NONE'}
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--split)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => handlePing(node)}
                  disabled={isPinging}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: 'var(--card-surface)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: isPinging ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isPinging ? 'PINGING...' : 'TEST CONNECTIVITY'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
