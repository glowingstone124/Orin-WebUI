import React, { useState } from 'react';
import { api, getStoredEndpoint, getStoredToken, setStoredEndpoint, setStoredToken } from '../api/client';

interface SettingsViewProps {
  onRefreshAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshAll }) => {
  const [endpoint, setEndpoint] = useState(getStoredEndpoint());
  const [token, setToken] = useState(getStoredToken());
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    setStoredEndpoint(endpoint);
    setStoredToken(token);
    setTestResult({ success: true, msg: '配置已保存到本地存储。' });
    onRefreshAll();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setStoredEndpoint(endpoint);
    setStoredToken(token);

    try {
      const status = await api.getStatus();
      setTestResult({
        success: true,
        msg: `连接成功! 目标 Orin 版本: v${status.version}, 当前队列: ${status.queue.queuedCount}/${status.queue.capacity}`,
      });
      onRefreshAll();
    } catch (err: unknown) {
      setTestResult({
        success: false,
        msg: `连接失败: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--title-color)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          控制台与连接设置
        </h1>
      </div>

      <div
        style={{
          padding: '24px',
          backgroundColor: 'var(--card-surface)',
          border: '1px solid var(--split)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div>
          <label
            htmlFor="api-endpoint"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--title-color)',
              marginBottom: '6px',
            }}
          >
            ORIN API BASE URL (服务接口地址)
          </label>
          <input
            id="api-endpoint"
            type="text"
            placeholder="例如: http://localhost:9912 (留空则使用当前相对路径代理)"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'var(--background)',
              color: 'var(--text-main)',
              border: '1px solid var(--split)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              display: 'block',
              fontFamily: 'var(--font-mono)',
            }}
          >
            本地开发时默认代理到 http://localhost:9912；跨域独立部署时可填写 Orin 实例的完整 URL。
          </span>
        </div>

        <div>
          <label
            htmlFor="default-token"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: 'var(--title-color)',
              marginBottom: '6px',
            }}
          >
            DEFAULT TRIGGER TOKEN (默认鉴权密钥)
          </label>
          <input
            id="default-token"
            type="password"
            placeholder="对应 config.toml 中的 manualToken 或 cluster.nodeToken"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'var(--background)',
              color: 'var(--text-main)',
              border: '1px solid var(--split)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              display: 'block',
              fontFamily: 'var(--font-mono)',
            }}
          >
            保存在当前浏览器本地 LocalStorage，触发流水线时自动作为 X-Orin-Token 或默认参数传递。
          </span>
        </div>

        {testResult && (
          <div
            role="alert"
            style={{
              padding: '12px',
              backgroundColor: testResult.success
                ? 'color-mix(in srgb, var(--success) 10%, transparent)'
                : 'color-mix(in srgb, var(--error) 10%, transparent)',
              border: `1px solid ${testResult.success ? 'var(--success)' : 'var(--error)'}`,
              color: testResult.success ? 'var(--success)' : 'var(--error)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {testResult.msg}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)',
              border: 'none',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: '0.8125rem',
            }}
          >
            保存设置
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              border: '1px solid var(--primary)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: testing ? 'not-allowed' : 'pointer',
            }}
          >
            {testing ? '测试中...' : '测试连通性'}
          </button>
        </div>
      </div>

      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--card-surface)',
          border: '1px solid var(--split)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--title-color)', marginBottom: '8px' }}>
          关于 ORIN CI/CD 引擎
        </div>
        <div>
          Orin 是 Quantum Original 专为自动化更新服务端服务打造的高性能轻量 CI/CD 工具。
        </div>
        <div style={{ marginTop: '4px' }}>
          - 命名源自东方 Project 角色“火焰猫 燐 (Kaenbyou Rin)”
        </div>
        <div>- 采用 Kotlin + Ktor Netty 高性能响应式架构</div>
        <div>- 遵循 Quantum Original Strict Right-Angle 纯直角工业设计系统规范</div>
        <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
          Copyright (c) 2026 Quantum Original & Holographic Lab.
        </div>
      </div>
    </div>
  );
};
