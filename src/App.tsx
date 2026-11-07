import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api/client';
import { Header } from './components/Header';
import { Sidebar, ViewType } from './components/Sidebar';
import { TriggerModal } from './components/TriggerModal';
import { JobItem, OrinStatus, Pipeline, RemoteNode } from './types/orin';
import { ClusterView } from './views/ClusterView';
import { DashboardView } from './views/DashboardView';
import { JobsView } from './views/JobsView';
import { PipelinesView } from './views/PipelinesView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [status, setStatus] = useState<OrinStatus | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [clusterNodes, setClusterNodes] = useState<RemoteNode[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [triggerPipeline, setTriggerPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Theme Management according to modern-web-guidance
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Data fetching
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [st, pList, jList, nList] = await Promise.allSettled([
        api.getStatus(),
        api.getPipelines(),
        api.getJobs(),
        api.getClusterNodes(),
      ]);

      if (st.status === 'fulfilled') setStatus(st.value);
      if (pList.status === 'fulfilled') setPipelines(pList.value);
      if (jList.status === 'fulfilled') setJobs(jList.value);
      if (nList.status === 'fulfilled') setClusterNodes(nList.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
    // Periodic refresh every 6 seconds
    const interval = setInterval(refreshAll, 6000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const handleTriggerSuccess = (jobId?: string) => {
    showToast(`流水线触发成功${jobId ? `，任务 ID: ${jobId}` : ''}`);
    refreshAll();
    if (jobId) {
      setSelectedJobId(jobId);
      setView('jobs');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--background)',
      }}
    >
      <Header
        status={status}
        loading={loading}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={refreshAll}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          currentView={view}
          onSelectView={setView}
          jobsCount={jobs.length}
          pipelinesCount={pipelines.length}
        />

        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            backgroundColor: 'var(--background-secondary)',
          }}
        >
          {view === 'dashboard' && (
            <DashboardView
              status={status}
              pipelines={pipelines}
              jobs={jobs}
              onSelectPipeline={(p) => setTriggerPipeline(p)}
              onSelectJob={(id) => {
                setSelectedJobId(id);
                setView('jobs');
              }}
              onNavigate={(target) => setView(target)}
            />
          )}

          {view === 'pipelines' && (
            <PipelinesView
              pipelines={pipelines}
              onTriggerPipeline={(p) => setTriggerPipeline(p)}
            />
          )}

          {view === 'jobs' && (
            <JobsView
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
              onRefreshJobs={refreshAll}
            />
          )}

          {view === 'cluster' && (
            <ClusterView
              nodes={clusterNodes}
              onRefresh={refreshAll}
            />
          )}

          {view === 'settings' && <SettingsView onRefreshAll={refreshAll} />}
        </main>
      </div>

      {/* Trigger Modal */}
      <TriggerModal
        pipeline={triggerPipeline}
        onClose={() => setTriggerPipeline(null)}
        onSuccess={handleTriggerSuccess}
      />

      {/* Toast Notification */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            backgroundColor: 'var(--title-color)',
            color: 'var(--background)',
            border: '1px solid var(--split)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            zIndex: 9999,
          }}
        >
          {toast}
        </aside>
      )}
    </div>
  );
};
