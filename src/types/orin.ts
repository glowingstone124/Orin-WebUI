export interface QueueStatus {
  capacity: number;
  queuedCount: number;
  activeCount: number;
  completedCount: number;
}

export interface OrinStatus {
  status: string;
  version: string;
  queue: QueueStatus;
  pipelinesCount: number;
  remotesCount: number;
}

export interface Pipeline {
  name: string;
  enabled: boolean;
  repository: string | null;
  triggers: string[];
  hasManualToken: boolean;
  actions: string[];
}

export type JobStatusType = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface JobItem {
  id: string;
  pipelineName: string;
  trigger: string;
  inputs: Record<string, string>;
  status: JobStatusType;
  message: string | null;
  artifacts: string[];
  createdAt: number;
  completedAt: number | null;
  durationMs: number | null;
}

export interface JobDetail extends JobItem {
  logs: string;
}

export interface JobLogs {
  jobId: string;
  logs: string;
  logLines: string[];
}

export interface RemoteNode {
  name: string;
  url: string;
  hasToken: boolean;
}

export interface TriggerRequest {
  token?: string;
  inputs?: Record<string, string>;
}

export interface TriggerResponse {
  jobId?: string;
  status: string;
  message: string;
}
