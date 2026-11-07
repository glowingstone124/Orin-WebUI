import { JobDetail, JobItem, JobLogs, OrinStatus, Pipeline, RemoteNode, TriggerRequest, TriggerResponse } from '../types/orin';

const STORAGE_KEY_ENDPOINT = 'orin_api_endpoint';
const STORAGE_KEY_TOKEN = 'orin_manual_token';

export function getStoredEndpoint(): string {
  return localStorage.getItem(STORAGE_KEY_ENDPOINT) || '';
}

export function setStoredEndpoint(endpoint: string): void {
  localStorage.setItem(STORAGE_KEY_ENDPOINT, endpoint.trim().replace(/\/+$/, ''));
}

export function getStoredToken(): string {
  return localStorage.getItem(STORAGE_KEY_TOKEN) || '';
}

export function setStoredToken(token: string): void {
  localStorage.setItem(STORAGE_KEY_TOKEN, token.trim());
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getStoredEndpoint();
  const url = `${base}${path}`;
  const token = getStoredToken();

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('X-Orin-Token') && !headers.has('Authorization')) {
    headers.set('X-Orin-Token', token);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.message) {
        errMessage = errJson.message;
      }
    } catch {
      const text = await response.text();
      if (text) errMessage = text;
    }
    throw new Error(errMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getStatus: (): Promise<OrinStatus> => request<OrinStatus>('/api/status'),
  getPipelines: (): Promise<Pipeline[]> => request<Pipeline[]>('/api/pipelines'),
  getJobs: (): Promise<JobItem[]> => request<JobItem[]>('/api/jobs'),
  getJobDetail: (jobId: string): Promise<JobDetail> => request<JobDetail>(`/api/jobs/${encodeURIComponent(jobId)}`),
  getJobLogs: (jobId: string): Promise<JobLogs> => request<JobLogs>(`/api/jobs/${encodeURIComponent(jobId)}/logs`),
  getClusterNodes: (): Promise<RemoteNode[]> => request<RemoteNode[]>('/api/cluster/nodes'),
  triggerPipeline: (name: string, payload: TriggerRequest): Promise<TriggerResponse> =>
    request<TriggerResponse>(`/api/pipelines/${encodeURIComponent(name)}/trigger`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getArtifactUrl: (jobId: string, artifactName: string): string => {
    const base = getStoredEndpoint();
    return `${base}/remote/jobs/${encodeURIComponent(jobId)}/artifacts/${encodeURIComponent(artifactName)}`;
  },
};
